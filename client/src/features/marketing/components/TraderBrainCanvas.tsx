import React, { useEffect, useRef } from 'react';
import {
  BRAIN_NODES,
  BRAIN_EDGES,
  BEGINNER_NODE_SET,
  BEGINNER_EDGES,
  BrainNode,
} from './brainMeshData';

interface TraderBrainCanvasProps {
  type: 'beginner' | 'professional';
  activeStage: number; // 0 to 7
  className?: string;
  width?: number; // logical width, default 300
  height?: number; // logical height, default 280
  flipX?: boolean;
}

interface SynapticPulse {
  edgeIndex: number;
  progress: number; // 0 to 1
  speed: number;
  reverse: boolean;
}

export const TraderBrainCanvas: React.FC<TraderBrainCanvasProps> = ({
  type,
  activeStage,
  className = '',
  width = 300,
  height = 280,
  flipX = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStageRef = useRef(activeStage);
  activeStageRef.current = activeStage;

  // Synaptic energy pulses along active paths
  const pulsesRef = useRef<SynapticPulse[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = false;
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // High DPI scaling
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Coordinates mapping: brain data is in [0, 100] x [0, 100]
    const padX = width * 0.12;
    const padY = height * 0.12;
    const scaleX = (width - 2 * padX) / 100;
    const scaleY = (height - 2 * padY) / 100;

    const getX = (nx: number) => {
      const px = padX + nx * scaleX;
      return flipX ? width - px : px;
    };
    const getY = (ny: number) => padY + ny * scaleY;

    // Precalculate mapped coordinates for fast 60fps rendering
    const mappedNodes = BRAIN_NODES.map((n) => ({
      ...n,
      px: getX(n.x),
      py: getY(n.y),
    }));

    // Build node map for fast lookup
    const nodeMap = new Map<number, (typeof mappedNodes)[0]>();
    mappedNodes.forEach((n) => nodeMap.set(n.id, n));

    // Initialize random pulses for pro brain
    if (type === 'professional') {
      pulsesRef.current = Array.from({ length: 6 }, () => ({
        edgeIndex: Math.floor(Math.random() * BRAIN_EDGES.length),
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.012,
        reverse: Math.random() > 0.5,
      }));
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 3);
      lastTime = time;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const currentStage = activeStageRef.current;

      if (type === 'beginner') {
        renderBeginnerBrain(ctx, mappedNodes, time);
      } else {
        renderProfessionalBrain(ctx, mappedNodes, nodeMap, currentStage, time, dt);
      }

      ctx.restore();

      if (isVisible && !reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const renderBeginnerBrain = (
      c: CanvasRenderingContext2D,
      nodes: typeof mappedNodes,
      time: number
    ) => {
      // Subtle ambient shadow
      const grad = c.createRadialGradient(
        width * 0.5,
        height * 0.5,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.45
      );
      grad.addColorStop(0, 'rgba(30, 41, 59, 0.25)');
      grad.addColorStop(1, 'rgba(3, 7, 18, 0)');
      c.fillStyle = grad;
      c.fillRect(0, 0, width, height);

      // Render sparse, fragmented edges
      c.save();
      c.lineWidth = 1;
      BEGINNER_EDGES.forEach(([u, v], i) => {
        const n1 = nodeMap.get(u);
        const n2 = nodeMap.get(v);
        if (!n1 || !n2) return;

        // Broken/dashed lines on some edges to represent disconnection
        if (i % 3 === 0) {
          c.setLineDash([3, 4]);
        } else {
          c.setLineDash([]);
        }

        const edgeFlicker = Math.sin(time * 0.002 + i) * 0.15 + 0.35;
        c.strokeStyle = `rgba(100, 116, 139, ${edgeFlicker * 0.7})`;

        c.beginPath();
        c.moveTo(n1.px, n1.py);
        c.lineTo(n2.px, n2.py);
        c.stroke();
      });
      c.setLineDash([]);
      c.restore();

      // Render sparse beginner nodes with flickering uncertainty
      nodes.forEach((node) => {
        if (!BEGINNER_NODE_SET.has(node.id)) return;

        // Random subtle flicker on a few nodes
        const isFlickering = node.id % 5 === 0;
        const alpha = isFlickering
          ? Math.max(0.18, Math.sin(time * 0.005 + node.id * 1.7) * 0.3 + 0.45)
          : 0.45;

        // Node circle
        c.beginPath();
        c.arc(node.px, node.py, 2, 0, Math.PI * 2);
        c.fillStyle = `rgba(148, 163, 184, ${alpha})`;
        c.fill();
      });
    };

    const renderProfessionalBrain = (
      c: CanvasRenderingContext2D,
      nodes: typeof mappedNodes,
      map: Map<number, (typeof mappedNodes)[0]>,
      stage: number,
      time: number,
      dt: number
    ) => {
      const isComplete = stage >= 7;

      // Harmonic breathing rhythm when fully lit
      const breathe = isComplete ? 1 + Math.sin(time * 0.0025) * 0.06 : 1;
      const pulseAlpha = isComplete ? 0.85 + Math.sin(time * 0.0025) * 0.15 : 0.8;

      // Soft ambient cyan glow aura
      if (stage > 0) {
        const auraGrad = c.createRadialGradient(
          width * 0.5,
          height * 0.48,
          width * 0.05,
          width * 0.5,
          height * 0.48,
          width * 0.55 * breathe
        );
        const glowOpacity = isComplete ? 0.18 : 0.04 + stage * 0.016;
        auraGrad.addColorStop(0, `rgba(0, 240, 255, ${glowOpacity})`);
        auraGrad.addColorStop(0.5, `rgba(56, 189, 248, ${glowOpacity * 0.5})`);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        c.fillStyle = auraGrad;
        c.fillRect(0, 0, width, height);
      }

      // 1. Draw dormant / inactive wireframe outline (subtle dark blue/slate)
      c.save();
      c.lineWidth = 0.8;
      c.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      c.beginPath();
      BRAIN_EDGES.forEach(([u, v]) => {
        const n1 = map.get(u);
        const n2 = map.get(v);
        if (!n1 || !n2) return;
        const edgeActive = n1.stage <= stage && n2.stage <= stage;
        if (!edgeActive) {
          c.moveTo(n1.px, n1.py);
          c.lineTo(n2.px, n2.py);
        }
      });
      c.stroke();
      c.restore();

      // 2. Draw active edges with neon cyan glow
      if (stage > 0) {
        c.save();
        c.lineWidth = isComplete ? 1.4 : 1.2;
        c.strokeStyle = isComplete
          ? `rgba(0, 240, 255, ${0.75 * pulseAlpha})`
          : 'rgba(0, 240, 255, 0.65)';
        c.shadowColor = '#00f0ff';
        c.shadowBlur = isComplete ? 7 * breathe : 4;

        c.beginPath();
        const activeEdgeIndices: number[] = [];
        BRAIN_EDGES.forEach(([u, v], idx) => {
          const n1 = map.get(u);
          const n2 = map.get(v);
          if (!n1 || !n2) return;

          if (n1.stage <= stage && n2.stage <= stage) {
            c.moveTo(n1.px, n1.py);
            c.lineTo(n2.px, n2.py);
            activeEdgeIndices.push(idx);
          }
        });
        c.stroke();
        c.restore();

        // 3. Synaptic energy photons traveling along active neural edges
        if (activeEdgeIndices.length > 0 && !reducedMotion) {
          c.save();
          pulsesRef.current.forEach((pulse) => {
            pulse.progress += pulse.speed * dt;
            if (pulse.progress >= 1) {
              pulse.progress = 0;
              // pick a new active edge
              pulse.edgeIndex =
                activeEdgeIndices[Math.floor(Math.random() * activeEdgeIndices.length)];
              pulse.reverse = Math.random() > 0.5;
            }

            const [u, v] = BRAIN_EDGES[pulse.edgeIndex] || [0, 1];
            const n1 = map.get(u);
            const n2 = map.get(v);
            if (!n1 || !n2) return;

            const t = pulse.reverse ? 1 - pulse.progress : pulse.progress;
            const px = n1.px + (n2.px - n1.px) * t;
            const py = n1.py + (n2.py - n1.py) * t;

            // Bright traveling photon
            c.fillStyle = '#ffffff';
            c.shadowColor = '#00f0ff';
            c.shadowBlur = 8;
            c.beginPath();
            c.arc(px, py, 2, 0, Math.PI * 2);
            c.fill();
          });
          c.restore();
        }
      }

      // 4. Draw inactive nodes (faint placeholders)
      c.save();
      nodes.forEach((node) => {
        if (node.stage > stage) {
          c.beginPath();
          c.arc(node.px, node.py, 1.2, 0, Math.PI * 2);
          c.fillStyle = 'rgba(56, 189, 248, 0.12)';
          c.fill();
        }
      });
      c.restore();

      // 5. Draw active nodes
      if (stage > 0) {
        c.save();
        nodes.forEach((node) => {
          if (node.stage > stage) return;

          const isCurrentStage = node.stage === stage;
          const nodeRadius = isComplete ? 2.4 : isCurrentStage ? 2.8 : 2.0;

          // Extra brilliance sparkle for newly ignited stage
          if (isCurrentStage && !isComplete) {
            const sparkle = Math.sin(time * 0.008 + node.id) * 0.3 + 0.7;
            c.shadowColor = '#00f0ff';
            c.shadowBlur = 10 * sparkle;
            c.fillStyle = `rgba(0, 240, 255, ${0.9 * sparkle})`;
            c.beginPath();
            c.arc(node.px, node.py, nodeRadius + 1.2, 0, Math.PI * 2);
            c.fill();
          }

          // Node body (cyan)
          c.shadowColor = '#00f0ff';
          c.shadowBlur = isComplete ? 6 * breathe : 4;
          c.fillStyle = isComplete ? '#38bdf8' : '#00f0ff';
          c.beginPath();
          c.arc(node.px, node.py, nodeRadius, 0, Math.PI * 2);
          c.fill();

          // White glowing core
          c.fillStyle = '#ffffff';
          c.beginPath();
          c.arc(node.px, node.py, nodeRadius * 0.5, 0, Math.PI * 2);
          c.fill();
        });
        c.restore();
      }
    };

    // IntersectionObserver to pause rendering when off-screen (0% CPU/GPU overhead)
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisible = entry.isIntersecting;
        if (isVisible) {
          lastTime = performance.now();
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    // Initial render
    render(performance.now());

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, width, height, flipX]);

  return (
    <canvas
      ref={canvasRef}
      className={`block select-none pointer-events-none transition-transform duration-500 ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};

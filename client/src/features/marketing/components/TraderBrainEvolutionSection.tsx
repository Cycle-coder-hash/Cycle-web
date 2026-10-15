import React, { useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/* ========================================================================= */
/* DATA & TYPES                                                              */
/* ========================================================================= */

interface CardDef {
  id: number;
  badge: string;
  key: string;
  defaultTitle: string;
}

const CARDS: CardDef[] = [
  { id: 1, badge: '01', key: 'card1', defaultTitle: 'Learn Fast' },
  { id: 2, badge: '02', key: 'card2', defaultTitle: 'Discipline' },
  { id: 3, badge: '03', key: 'card3', defaultTitle: 'Consistent Work' },
  { id: 4, badge: '04', key: 'card4', defaultTitle: 'Process' },
  { id: 5, badge: '05', key: 'card5', defaultTitle: 'Journal' },
  { id: 6, badge: '06', key: 'card6', defaultTitle: 'Build Edge' },
  { id: 7, badge: '07', key: 'card7', defaultTitle: 'Professional Trader' },
];

interface BrainPoint {
  x: number;
  y: number;
  ph: number;
  fr: number;
  keep: boolean;
  ord: number;
  d?: number;
  z?: number;
  top?: boolean;
}

interface BrainEdge {
  a: number;
  b: number;
  keep: boolean;
  ord: number;
}

interface BrainMeshData {
  pts: BrainPoint[];
  edges: BrainEdge[];
  vis: Float32Array;
}

interface BrainTransform {
  x: number;
  y: number;
  s: number;
  flipX?: boolean;
}

interface Particle {
  k: number;
  u: number;
  sp: number;
}

interface Pulse {
  e: number;
  from: number;
  u: number;
  sp: number;
  hops: number;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ========================================================================= */
/* DETERMINISTIC BRAIN MESH GENERATOR (reused by both brains)                */
/* ========================================================================= */

function mulberry(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ell(cx: number, cy: number, rx: number, ry: number) {
  const p = new Path2D();
  p.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  return p;
}

function quad(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  n: number,
  r: number
): [number, number, number][] {
  const a: [number, number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    a.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
      r,
    ]);
  }
  return a;
}

let cachedMesh: BrainMeshData | null = null;

function getBrainMesh(): BrainMeshData {
  if (cachedMesh) return cachedMesh;
  if (typeof document === 'undefined') {
    return { pts: [], edges: [], vis: new Float32Array(0) };
  }

  const canvas = document.createElement('canvas');
  const g = canvas.getContext('2d');
  if (!g) return { pts: [], edges: [], vis: new Float32Array(0) };

  const shapes = [
    ell(190, 115, 150, 88),
    ell(100, 140, 62, 55),
    ell(175, 178, 80, 30),
    ell(285, 192, 50, 30),
  ];
  const stem = new Path2D();
  stem.moveTo(232, 195);
  stem.lineTo(264, 195);
  stem.lineTo(274, 276);
  stem.lineTo(247, 282);
  stem.closePath();
  shapes.push(stem);

  function inside(x: number, y: number) {
    for (let i = 0; i < shapes.length; i++) {
      if (g!.isPointInPath(shapes[i], x, y)) return true;
    }
    return false;
  }

  const fiss = quad([95, 168], [170, 138], [262, 152], 30, 5).concat(
    quad([205, 28], [222, 78], [188, 142], 20, 3.6)
  );

  function nearFiss(x: number, y: number) {
    for (let i = 0; i < fiss.length; i++) {
      const f = fiss[i];
      const dx = x - f[0];
      const dy = y - f[1];
      if (dx * dx + dy * dy < f[2] * f[2]) return true;
    }
    return false;
  }

  const rnd = mulberry(11);
  const pts: BrainPoint[] = [];
  const MIN = 12;

  for (let k = 0; k < 9000 && pts.length < 340; k++) {
    const x = 40 + rnd() * 300;
    const y = 26 + rnd() * 260;
    if (!inside(x, y) || nearFiss(x, y)) continue;
    let ok = true;
    for (let q = 0; q < pts.length; q++) {
      const dx = pts[q].x - x;
      const dy = pts[q].y - y;
      if (dx * dx + dy * dy < MIN * MIN) {
        ok = false;
        break;
      }
    }
    if (ok) {
      pts.push({
        x,
        y,
        ph: rnd() * 6.28,
        fr: 0.6 + rnd() * 1.8,
        keep: rnd() < 0.45,
        ord: 0,
      });
    }
  }

  let maxd = 0;
  pts.forEach((p) => {
    p.d = Math.hypot(p.x - 255, p.y - 282);
    maxd = Math.max(maxd, p.d);
  });
  pts.forEach((p) => {
    p.ord = clamp((p.d! / maxd) * 0.85 + rnd() * 0.15, 0, 1);
  });

  /* depth (z) for 3D look, and horizontal cut for split */
  const rz = mulberry(99);
  pts.forEach((p) => {
    const k = Math.sqrt(
      Math.max(0, 1 - Math.pow((p.x - 190) / 165, 2) - Math.pow((p.y - 130) / 120, 2))
    );
    p.z = (rz() * 2 - 1) * (80 * k + 10);
    p.top = p.y < 150;
  });

  const edges: BrainEdge[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      if (
        dx * dx + dy * dy < 22 * 22 &&
        !nearFiss((pts[i].x + pts[j].x) / 2, (pts[i].y + pts[j].y) / 2)
      ) {
        edges.push({
          a: i,
          b: j,
          keep: pts[i].keep && pts[j].keep && rnd() < 0.7,
          ord: Math.max(pts[i].ord, pts[j].ord),
        });
      }
    }
  }

  const vis = new Float32Array(pts.length);
  cachedMesh = { pts, edges, vis };
  return cachedMesh;
}

/* ========================================================================= */
/* CANVAS DRAWING HELPERS                                                    */
/* ========================================================================= */

function drawBeginner(
  ctx: CanvasRenderingContext2D,
  mesh: BrainMeshData,
  b: BrainTransform,
  t: number
) {
  const { pts, edges } = mesh;
  const s = b.s;
  const flip = b.flipX ?? false;
  ctx.lineWidth = 0.8;

  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    if (!e.keep) continue;
    const A = pts[e.a];
    const B = pts[e.b];
    const fa = 0.5 + 0.5 * Math.sin(t * A.fr * 1.6 + A.ph);
    const fb = 0.5 + 0.5 * Math.sin(t * B.fr * 1.6 + B.ph);
    if (fa > 0.93 || fb > 0.93) continue;

    ctx.strokeStyle = `rgba(138,160,196,${(0.1 + 0.16 * ((fa + fb) / 2)).toFixed(3)})`;
    const ax = flip ? 400 - (A.x + Math.sin(t * A.fr + A.ph) * 1.4) : A.x + Math.sin(t * A.fr + A.ph) * 1.4;
    const ay = A.y + Math.cos(t * A.fr + A.ph) * 1.4;
    const bx = flip ? 400 - (B.x + Math.sin(t * B.fr + B.ph) * 1.4) : B.x + Math.sin(t * B.fr + B.ph) * 1.4;
    const by = B.y + Math.cos(t * B.fr + B.ph) * 1.4;

    ctx.beginPath();
    ctx.moveTo(b.x + ax * s, b.y + ay * s);
    ctx.lineTo(b.x + bx * s, b.y + by * s);
    ctx.stroke();
  }

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (!p.keep) continue;
    const f = 0.5 + 0.5 * Math.sin(t * p.fr * 1.6 + p.ph);
    if (f > 0.93) continue;

    ctx.fillStyle = `rgba(150,170,205,${(0.2 + 0.5 * f).toFixed(3)})`;
    const px = flip ? 400 - (p.x + Math.sin(t * p.fr + p.ph) * 1.4) : p.x + Math.sin(t * p.fr + p.ph) * 1.4;
    const py = p.y + Math.cos(t * p.fr + p.ph) * 1.4;

    ctx.beginPath();
    ctx.arc(b.x + px * s, b.y + py * s, Math.max(1, 1.5 * s), 0, 6.283);
    ctx.fill();
  }
}


function catmull(P: { x: number; y: number }[], seg: number) {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)],
      p1 = P[i],
      p2 = P[i + 1],
      p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < seg; k++) {
      const t = k / seg,
        t2 = t * t,
        t3 = t2 * t;
      out.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push({ x: P[P.length - 1].x, y: P[P.length - 1].y });
  return out;
}

function strokePart(
  ctx: CanvasRenderingContext2D,
  arr: { x: number; y: number }[],
  to: number
) {
  if (!arr.length || to < 1) return;
  ctx.beginPath();
  ctx.moveTo(arr[0].x, arr[0].y);
  const limit = Math.min(to, arr.length - 1);
  for (let i = 1; i <= limit; i++) {
    ctx.lineTo(arr[i].x, arr[i].y);
  }
  ctx.stroke();
}

/* ========================================================================= */
/* MAIN COMPONENT: TraderBrainEvolutionSection                               */
/* ========================================================================= */

export const TraderBrainEvolutionSection: React.FC = () => {
  const { t, isRTL } = useLanguage();

  const journeyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lbRef = useRef<HTMLDivElement>(null);
  const lpRef = useRef<HTMLDivElement>(null);
  const bpmRef = useRef<HTMLDivElement>(null);

  // Translations
  const beginnerLabel = t('brainEvolution.beginner', 'BEGINNER');
  const proLabel = t('brainEvolution.professional', 'PROFESSIONAL');

  const getCardTitle = useCallback(
    (card: CardDef) => {
      return t(`brainEvolution.${card.key}`, card.defaultTitle);
    },
    [t]
  );

  // Core state refs for animation loop
  const pTRef = useRef(0);
  const pSRef = useRef(0);
  const litFRef = useRef(0);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const inViewRef = useRef(true);
  const isMobileRef = useRef(false);
  const onStateRef = useRef<boolean[]>([false, false, false, false, false, false, false]);

  // Card click handler: smoothly scroll to the clicked card's threshold
  const handleCardClick = useCallback((idx: number) => {
    const thVal = 0.05 + idx * (0.86 / 6);
    if (journeyRef.current && !isMobileRef.current) {
      const r = journeyRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const targetScrollY =
        window.scrollY + r.top + thVal * ((r.height - vh) * 0.86);
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
    } else {
      pTRef.current = thVal;
    }
  }, []);

  useEffect(() => {
    const journey = journeyRef.current;
    const stage = stageRef.current;
    const cv = canvasRef.current;
    if (!journey || !stage || !cv) return;

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const mesh = getBrainMesh();
    const ppts = mesh.pts;
    const pedges = mesh.edges;
    const padj: number[][] = ppts.map(() => []);
    pedges.forEach((e, i) => {
      padj[e.a].push(i);
      padj[e.b].push(i);
    });

    const flash = new Float32Array(ppts.length);
    const px = new Float32Array(ppts.length);
    const py = new Float32Array(ppts.length);
    const pd = new Float32Array(ppts.length);
    const pvis = new Float32Array(ppts.length);
    const pulses: Pulse[] = [];

    const SEG = 26;
    const th: number[] = [];
    for (let i = 0; i < 7; i++) th.push(0.05 + i * (0.86 / 6));

    let W = 0;
    let H = 0;
    let dpr = 1;
    let N = 0;
    let path: { x: number; y: number }[] = [];
    let cum: number[] = [];
    let total = 1;
    let cf: number[] = [];
    let strands: { x: number; y: number }[][] = [];
    let parts: Particle[] = [];
    let brainB: BrainTransform = { x: 0, y: 0, s: 1 };
    let brainP: BrainTransform = { x: 0, y: 0, s: 1 };
    let cw = 120;
    let ch = 68;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function spawnPulse() {
      for (let tries = 0; tries < 14; tries++) {
        const i = (Math.random() * ppts.length) | 0;
        if (pvis[i] < 0.85 || !padj[i].length) continue;
        const ei = padj[i][(Math.random() * padj[i].length) | 0];
        const e = pedges[ei];
        if (Math.min(pvis[e.a], pvis[e.b]) < 0.85) continue;
        pulses.push({
          e: ei,
          from: i,
          u: 0,
          sp: 2 + Math.random() * 2,
          hops: 5 + ((Math.random() * 8) | 0),
        });
        return;
      }
    }

    function drawPro(
      b: BrainTransform,
      bp: number,
      t: number,
      dt: number
    ) {
      if (!ctx) return;
      const s = b.s;
      let i: number;
      for (i = 0; i < ppts.length; i++) {
        pvis[i] = clamp((bp * 1.3 - ppts[i].ord) / 0.3, 0, 1);
      }

      /* slow 3D sway: rotate around the vertical axis with perspective */
      const ang = reduce ? 0 : 0.34 * Math.sin(t * 0.32);
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const bob = reduce ? 0 : Math.sin(t * 0.8) * 2;

      for (i = 0; i < ppts.length; i++) {
        const p = ppts[i];
        const dx = b.flipX ? 190 - p.x : p.x - 190;
        const pz = p.z || 0;
        const zr = -dx * sa + pz * ca;
        const xr = dx * ca + pz * sa;
        const f = 1 / (1 - zr / 520);
        px[i] = b.x + (190 + xr * f) * s;
        py[i] = b.y + (150 + (p.y - 150) * f + bob) * s;
        pd[i] = clamp(0.5 + zr / 170, 0, 1);
        flash[i] = Math.max(0, flash[i] - dt * 2.2);
      }

      /* soft glow behind the brain, grows as it is built */
      const gx = b.x + 190 * s;
      const gy = b.y + 140 * s;
      const gr = ctx.createRadialGradient(gx, gy, 10 * s, gx, gy, 230 * s);
      gr.addColorStop(0, 'rgba(40,226,220,' + (0.07 + 0.07 * bp).toFixed(3) + ')');
      gr.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(b.x - 60 * s, b.y - 60 * s, 520 * s, 420 * s);

      ctx.lineWidth = 1.15;
      for (i = 0; i < pedges.length; i++) {
        const e = pedges[i];
        const a = Math.min(pvis[e.a], pvis[e.b]);
        const d = (pd[e.a] + pd[e.b]) / 2;
        const pulse = 0.8 + 0.2 * Math.sin(t * 1.6 - (ppts[e.a].x + ppts[e.b].x) * 0.015);
        const al = (0.045 + 0.8 * a * pulse) * (0.45 + 0.55 * d);
        ctx.strokeStyle =
          a > 0.02 ? 'rgba(40,226,220,' + al.toFixed(3) + ')' : 'rgba(60,110,170,.06)';
        ctx.beginPath();
        ctx.moveTo(px[e.a], py[e.a]);
        ctx.lineTo(px[e.b], py[e.b]);
        ctx.stroke();
      }

      const r = Math.max(1.8, 2.7 * s);
      ctx.globalAlpha = 1;
      for (i = 0; i < ppts.length; i++) {
        const av = pvis[i];
        const pl = 0.8 + 0.2 * Math.sin(t * 1.6 - ppts[i].x * 0.03);
        const X = px[i];
        const Y = py[i];
        const rr = r * (0.75 + 0.5 * pd[i]);
        if (av < 0.02) {
          ctx.fillStyle = 'rgba(60,110,170,.12)';
          ctx.beginPath();
          ctx.arc(X, Y, rr * 0.7, 0, 6.283);
          ctx.fill();
          continue;
        }
        const edge = av < 0.95;
        ctx.fillStyle = edge
          ? 'rgba(210,250,255,' + (0.9 * av).toFixed(3) + ')'
          : 'rgba(100,245,232,' + ((0.55 + 0.4 * pd[i]) * pl).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(X, Y, edge ? rr * 1.9 : rr, 0, 6.283);
        ctx.fill();

        ctx.fillStyle = 'rgba(40,226,220,' + (0.14 * av * pl * (0.5 + 0.5 * pd[i])).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(X, Y, rr * (edge ? 5.2 : 3.4), 0, 6.283);
        ctx.fill();

        if (flash[i] > 0.02) {
          ctx.fillStyle = 'rgba(190,250,255,' + (0.2 * flash[i]).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(X, Y, rr * (2.4 + 2.6 * flash[i]), 0, 6.283);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      /* neuron signals: small glowing lights hop from neuron to neuron along the links */
      const mobile = isMobileRef.current;
      const want = Math.round((mobile ? 7 : 14) * clamp((bp - 0.12) / 0.6, 0, 1));
      if (!reduce && dt > 0 && pulses.length < want && Math.random() < dt * 12) spawnPulse();
      for (i = pulses.length - 1; i >= 0; i--) {
        const q = pulses[i];
        let pe = pedges[q.e];
        q.u += q.sp * dt;
        if (q.u >= 1) {
          const to = pe.a === q.from ? pe.b : pe.a;
          flash[to] = 1;
          q.hops--;
          let nx = -1;
          const list = padj[to];
          const off = (Math.random() * list.length) | 0;
          for (let k = 0; k < list.length && q.hops > 0; k++) {
            const ci = list[(off + k) % list.length];
            if (ci === q.e) continue;
            const ce = pedges[ci];
            if (Math.min(pvis[ce.a], pvis[ce.b]) < 0.85) continue;
            nx = ci;
            break;
          }
          if (nx < 0) {
            pulses.splice(i, 1);
            continue;
          }
          q.from = to;
          q.e = nx;
          q.u -= 1;
          pe = pedges[nx];
        }
        const A = q.from;
        const B = pe.a === A ? pe.b : pe.a;
        const u0 = Math.max(0, q.u - 0.45);
        const ux = px[A] + (px[B] - px[A]) * q.u;
        const uy = py[A] + (py[B] - py[A]) * q.u;
        const tx = px[A] + (px[B] - px[A]) * u0;
        const ty = py[A] + (py[B] - py[A]) * u0;
        const fa = Math.min(1, q.hops / 2 + 0.2);

        ctx.lineWidth = 1.6;
        ctx.strokeStyle = 'rgba(200,250,255,' + (0.6 * fa).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(ux, uy);
        ctx.stroke();

        ctx.fillStyle = 'rgba(40,226,220,' + (0.3 * fa).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(ux, uy, Math.max(4, 5.5 * s), 0, 6.283);
        ctx.fill();

        ctx.fillStyle = 'rgba(235,253,255,' + fa.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(ux, uy, Math.max(1.4, 2 * s), 0, 6.283);
        ctx.fill();
      }
    }

    function layout() {
      if (!stage || !cv) return;
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 760;
      isMobileRef.current = mobile;
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);

      const P: { x: number; y: number }[] = [];
      const cc: { x: number; y: number }[] = [];

      if (mobile) {
        const bw = Math.min(300, vw * 0.78);
        const bh = bw * 0.75;
        const gap = 92;
        cw = Math.min(140, vw * 0.36);
        ch = cw * 0.56;
        const y0 = 22;
        const cs = y0 + bh + 84;
        const pb = cs + 6 * gap + ch / 2 + 46;
        H = pb + bh + 104;
        W = vw;
        stage.style.height = `${H}px`;
        brainB = { x: (W - bw) / 2, y: y0, s: bw / 400, flipX: false };
        brainP = { x: (W - bw) / 2, y: pb, s: bw / 400, flipX: false };

        for (let i = 0; i < 7; i++) {
          const zigzagX = isRTL ? (i % 2 ? 0.31 : 0.69) : i % 2 ? 0.69 : 0.31;
          cc.push({ x: W * zigzagX, y: cs + i * gap });
        }

        P.push({ x: W / 2, y: y0 + bh * 0.93 });
        cc.forEach((c) => P.push(c));
        P.push({ x: W / 2, y: pb + bh * 0.1 });

        if (lbRef.current) {
          lbRef.current.style.left = `${W / 2}px`;
          lbRef.current.style.top = `${y0 + bh + 22}px`;
        }
        const bpmY = pb + 303 * brainP.s + 26;
        if (bpmRef.current) {
          bpmRef.current.style.left = `${W / 2}px`;
          bpmRef.current.style.top = `${bpmY}px`;
        }
        if (lpRef.current) {
          lpRef.current.style.left = `${W / 2}px`;
          lpRef.current.style.top = `${bpmY + 28}px`;
        }
      } else {
        stage.style.height = '';
        W = stage.clientWidth || vw;
        H = stage.clientHeight || vh;
        const m = Math.max(16, W * 0.03);
        const bw = Math.min(W * (W < 1000 ? 0.2 : 0.24), 380);
        const bh = bw * 0.75;
        const by = H / 2 - bh / 2 - 6;

        const xs = m + bw + 64;
        const xe = W - m - bw - 64;
        const sp = (xe - xs) / 6;
        const amp = Math.min(92, H * 0.13);

        cw = clamp(sp * 1.7, 96, 152);
        ch = cw * 0.56;

        if (!isRTL) {
          brainB = { x: m, y: by, s: bw / 400, flipX: false };
          brainP = { x: W - m - bw, y: by, s: bw / 400, flipX: false };

          for (let i = 0; i < 7; i++) {
            cc.push({ x: xs + sp * i, y: H / 2 - 6 + (i % 2 ? 1 : -1) * amp });
          }

          P.push({ x: m + bw * 0.9, y: by + bh * 0.62 });
          cc.forEach((c) => P.push(c));
          P.push({ x: W - m - bw * 0.9, y: by + bh * 0.56 });

          const proCenterX = W - m - bw / 2;
          const bpmY = by + 303 * brainP.s + 26;
          if (bpmRef.current) {
            bpmRef.current.style.left = `${proCenterX}px`;
            bpmRef.current.style.top = `${bpmY}px`;
          }
          const labelY = bpmY + 28;
          if (lbRef.current) {
            lbRef.current.style.left = `${m + bw / 2}px`;
            lbRef.current.style.top = `${labelY}px`;
          }
          if (lpRef.current) {
            lpRef.current.style.left = `${proCenterX}px`;
            lpRef.current.style.top = `${labelY}px`;
          }
        } else {
          // RTL Mirror: Beginner on Right, flows Left to Professional
          brainB = { x: W - m - bw, y: by, s: bw / 400, flipX: true };
          brainP = { x: m, y: by, s: bw / 400, flipX: true };

          for (let i = 0; i < 7; i++) {
            cc.push({
              x: W - (xs + sp * i),
              y: H / 2 - 6 + (i % 2 ? 1 : -1) * amp,
            });
          }

          P.push({ x: W - (m + bw * 0.9), y: by + bh * 0.62 });
          cc.forEach((c) => P.push(c));
          P.push({ x: W - (W - m - bw * 0.9), y: by + bh * 0.56 });

          const proCenterX = m + bw / 2;
          const bpmY = by + 303 * brainP.s + 26;
          if (bpmRef.current) {
            bpmRef.current.style.left = `${proCenterX}px`;
            bpmRef.current.style.top = `${bpmY}px`;
          }
          const labelY = bpmY + 28;
          if (lbRef.current) {
            lbRef.current.style.left = `${W - (m + bw / 2)}px`;
            lbRef.current.style.top = `${labelY}px`;
          }
          if (lpRef.current) {
            lpRef.current.style.left = `${proCenterX}px`;
            lpRef.current.style.top = `${labelY}px`;
          }
        }
      }

      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;

      cc.forEach((c, i) => {
        const el = cardElsRef.current[i];
        if (!el) return;
        const k = i === 6 ? 1.18 : 1;
        el.style.left = `${c.x}px`;
        el.style.top = `${c.y}px`;
        el.style.width = `${cw * k}px`;
        el.style.height = `${ch * k}px`;
        el.style.fontSize = `${Math.max(10, Math.round(cw * 0.092 * k))}px`;
      });

      path = catmull(P, SEG);
      N = path.length;
      cum = [0];
      for (let i = 1; i < N; i++) {
        cum.push(
          cum[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y)
        );
      }
      total = cum[N - 1] || 1;
      cf = [];
      for (let i = 0; i < 7; i++) {
        const idx = Math.min((i + 1) * SEG, N - 1);
        cf.push(cum[idx] / total);
      }

      const ns = mobile ? 3 : 5;
      strands = [];
      for (let k = 0; k < ns; k++) {
        const arr: { x: number; y: number }[] = [];
        for (let i = 0; i < N; i++) {
          const a = path[Math.max(0, i - 1)];
          const b = path[Math.min(N - 1, i + 1)];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const l = Math.hypot(dx, dy) || 1;
          const nx = -dy / l;
          const ny = dx / l;
          const loc = (i % SEG) / SEG;
          const fan = 0.22 + 0.78 * Math.min(1, 2 * Math.min(loc, 1 - loc));
          const o =
            ((k - (ns - 1) / 2) * 5.2) * fan +
            Math.sin(i * 0.11 + k * 1.7) * 1.5 * fan;
          arr.push({ x: path[i].x + nx * o, y: path[i].y + ny * o });
        }
        strands.push(arr);
      }

      const np = mobile ? 16 : 44;
      parts = [];
      for (let i = 0; i < np; i++) {
        parts.push({
          k: i % ns,
          u: Math.random(),
          sp: 0.06 + Math.random() * 0.07,
        });
      }
    }

    function scrollP() {
      if (!journey || !stage) return 0;
      const vh = window.innerHeight;
      if (!isMobileRef.current) {
        const r = journey.getBoundingClientRect();
        return clamp(-r.top / ((r.height - vh) * 0.86), 0, 1);
      }
      const sr = stage.getBoundingClientRect();
      return clamp((0.75 * vh - sr.top) / (sr.height - 0.1 * vh), 0, 1);
    }

    function onScroll() {
      pTRef.current = scrollP();
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // 3D Tilt on Pointer Move (Desktop only, hover capable)
    const onPointerMove = (e: PointerEvent) => {
      if (
        isMobileRef.current ||
        e.pointerType === 'touch' ||
        reduce ||
        !window.matchMedia('(hover: hover)').matches
      ) {
        return;
      }
      cardElsRef.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        const k = d < 260 ? 1 - d / 260 : 0;
        el.style.setProperty(
          '--ry',
          `${(clamp(dx / r.width, -1, 1) * 14 * k).toFixed(1)}deg`
        );
        el.style.setProperty(
          '--rx',
          `${(-clamp(dy / r.height, -1, 1) * 12 * k).toFixed(1)}deg`
        );
      });
    };

    if (!reduce) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    const ro = window.ResizeObserver
      ? new ResizeObserver(() => {
          layout();
          onScroll();
        })
      : null;
    ro?.observe(stage);
    window.addEventListener('resize', layout);

    layout();
    pTRef.current = scrollP();
    if (reduce) {
      pTRef.current = 1;
      pSRef.current = 1;
    }

    // IntersectionObserver to pause loop when off-screen
    const io = window.IntersectionObserver
      ? new IntersectionObserver(
          (entries) => {
            inViewRef.current = entries[0].isIntersecting;
          },
          { rootMargin: '200px' }
        )
      : null;
    io?.observe(stage);

    function mapLit(p: number) {
      const xs = [0, ...th, 1];
      const ys = [0, ...cf, 1];
      for (let i = 0; i < xs.length - 1; i++) {
        if (p <= xs[i + 1]) {
          const t = (p - xs[i]) / (xs[i + 1] - xs[i] || 1);
          return ys[i] + (ys[i + 1] - ys[i]) * t;
        }
      }
      return 1;
    }

    let animId = 0;

    function frame(now: number) {
      animId = requestAnimationFrame(frame);
      if (!ctx) return;
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      pSRef.current +=
        (pTRef.current - pSRef.current) * (1 - Math.exp(-dt * (reduce ? 60 : 4.5)));

      const pS = pSRef.current;

      for (let i = 0; i < 7; i++) {
        const on = pS >= th[i] - 0.004;
        if (on !== onStateRef.current[i]) {
          onStateRef.current[i] = on;
          const el = cardElsRef.current[i];
          if (el) el.classList.toggle('on', on);
        }
      }

      if (!inViewRef.current) return;

      if (!reduce) timeRef.current += dt;
      const T = timeRef.current;

      litFRef.current +=
        (mapLit(pS) - litFRef.current) * (1 - Math.exp(-dt * (reduce ? 60 : 5)));
      const litF = litFRef.current;
      const bp = clamp((pS - 0.04) / 0.88, 0, 1);

      const proBuilt = pS >= th[6] - 0.004;
      if (bpmRef.current) {
        bpmRef.current.classList.toggle('on', reduce || proBuilt);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      drawBeginner(ctx, mesh, brainB, T);
      drawPro(brainP, bp, T, reduce ? 0 : dt);

      const litIdx = Math.floor(litF * (N - 1));

      for (let k = 0; k < strands.length; k++) {
        const s = strands[k];
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(70,130,200,.16)';
        strokePart(ctx, s, N - 1);
        if (litIdx > 1) {
          if (k === strands.length >> 1) {
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'rgba(34,211,238,.10)';
            strokePart(ctx, s, litIdx);
          }
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(34,211,238,.5)';
          strokePart(ctx, s, litIdx);
        }
      }

      if (litIdx > 4 && strands[strands.length >> 1]) {
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          if (!reduce) p.u += p.sp * dt;
          if (p.u > litF) p.u = Math.random() * litF * 0.12;
          const idx = Math.floor(p.u * (N - 1));
          const s = strands[p.k];
          if (!s || !s[idx]) continue;
          const tail = Math.max(0, idx - 9);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(190,245,255,.55)';
          ctx.beginPath();
          ctx.moveTo(s[tail].x, s[tail].y);
          for (let j = tail + 1; j <= idx; j++) {
            ctx.lineTo(s[j].x, s[j].y);
          }
          ctx.stroke();

          ctx.fillStyle = 'rgba(34,211,238,.28)';
          ctx.beginPath();
          ctx.arc(s[idx].x, s[idx].y, 5, 0, 6.283);
          ctx.fill();

          ctx.fillStyle = '#d8fbff';
          ctx.beginPath();
          ctx.arc(s[idx].x, s[idx].y, 1.8, 0, 6.283);
          ctx.fill();
        }

        const centerStrand = strands[strands.length >> 1];
        if (centerStrand && centerStrand[litIdx]) {
          const m = centerStrand[litIdx];
          ctx.fillStyle = 'rgba(34,211,238,.35)';
          ctx.beginPath();
          ctx.arc(m.x, m.y, 9, 0, 6.283);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(m.x, m.y, 2.4, 0, 6.283);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';
    }

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', layout);
      if (!reduce) {
        window.removeEventListener('pointermove', onPointerMove);
      }
      ro?.disconnect();
      io?.disconnect();
    };
  }, [isRTL]);

  return (
    <>
      {/* Component-scoped CSS exactly matching the approved reference demo */}
      <style>{`
        #journey {
          position: relative;
          height: 380vh;
        }
        #journey .stage {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(60% 50% at 18% 50%, rgba(70,100,150,.12), transparent 70%),
            radial-gradient(60% 55% at 85% 50%, rgba(34,211,238,.10), transparent 70%),
            linear-gradient(180deg, #040913, #08142b 50%, #040913);
        }
        #journey .stage::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.55;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='%235aa0e6' fill-opacity='0.07' fill-rule='evenodd' d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/svg%3E");
          -webkit-mask-image: radial-gradient(75% 75% at 50% 50%, #000 20%, transparent 100%);
          mask-image: radial-gradient(75% 75% at 50% 50%, #000 20%, transparent 100%);
        }
        #journey canvas {
          position: absolute;
          inset: 0;
          display: block;
        }
        #journey .card {
          --rx: 0deg;
          --ry: 0deg;
          position: absolute;
          transform: translate(-50%, -50%) perspective(520px) rotateX(var(--rx)) rotateY(var(--ry));
          opacity: 0.42;
          transition: opacity 0.6s ease, filter 0.6s ease, transform 0.25s ease-out;
          filter: drop-shadow(0 0 0 rgba(34,211,238,0));
          cursor: pointer;
          user-select: none;
        }
        #journey .mv {
          position: absolute;
          inset: 0;
          animation: brain-bob 5.5s ease-in-out infinite;
          animation-delay: var(--d, 0s);
        }
        @keyframes brain-bob {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(3px, -6px); }
          66% { transform: translate(-3px, 3px); }
        }
        #journey .card:not(.on) .hex {
          transform: scale(0.9);
        }
        #journey .card.on {
          opacity: 1;
          filter: drop-shadow(0 0 14px rgba(34,211,238,0.42));
        }
        #journey .card.last.on {
          filter: drop-shadow(0 0 22px rgba(34,211,238,0.7));
        }
        #journey .hex {
          --a: 0deg;
          transition: transform 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.35);
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-align: center;
          clip-path: polygon(14% 0, 86% 0, 100% 50%, 86% 100%, 14% 100%, 0 50%);
          background: conic-gradient(from var(--a), rgba(80,140,210,0.32), rgba(80,140,210,0.32));
        }
        #journey .hex::after {
          content: "";
          position: absolute;
          inset: 1.5px;
          clip-path: polygon(14% 0, 86% 0, 100% 50%, 86% 100%, 14% 100%, 0 50%);
          background: linear-gradient(160deg, #0a1a36, #050d1e);
          z-index: 0;
        }
        #journey .card.on .hex {
          background: conic-gradient(from var(--a), rgba(34,211,238,0.12) 0deg, #22d3ee 50deg, rgba(34,211,238,0.12) 130deg, rgba(34,211,238,0.12) 215deg, #60a5fa 270deg, rgba(34,211,238,0.12) 360deg);
          animation: brain-spin 4.5s linear infinite;
        }
        #journey .card.on .hex::after {
          background: linear-gradient(160deg, #0e2650, #061328);
        }
        @keyframes brain-spin {
          to { --a: 360deg; }
        }
        #journey .hex span {
          position: relative;
          z-index: 1;
        }
        #journey .n {
          font-family: 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace;
          font-weight: 500;
          font-size: 0.72em;
          line-height: 1;
          letter-spacing: 0.2em;
          color: #22d3ee;
          opacity: 0.85;
        }
        #journey .t {
          font-family: inherit;
          font-weight: 600;
          line-height: 1.15;
          padding: 0 12%;
          text-wrap: balance;
          color: #e6f1ff;
          word-break: normal;
          overflow: visible;
        }
        #journey .lbl {
          position: absolute;
          transform: translateX(-50%);
          font-family: 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace;
          font-weight: 500;
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0.34em;
          color: #7f93b2;
          white-space: nowrap;
          pointer-events: none;
        }
        #journey .lbl.p {
          color: #22d3ee;
        }
        #journey .bpm {
          position: absolute;
          transform: translateX(-50%);
          white-space: nowrap;
          font-family: inherit;
          font-weight: 600;
          font-size: 17px;
          line-height: 1.2;
          letter-spacing: 0.06em;
          color: #e6f1ff;
          text-shadow: 0 0 12px rgba(34, 211, 238, 0.45), 0 0 2px rgba(34, 211, 238, 0.8);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
          z-index: 10;
        }
        #journey .bpm[dir="rtl"] {
          letter-spacing: normal;
        }
        #journey .bpm.on {
          opacity: 1;
        }
        @media (max-width: 759px) {
          #journey {
            height: auto;
          }
          #journey .stage {
            position: relative;
            height: auto;
          }
          #journey .bpm {
            font-size: 14.5px;
          }
        }
        @media (hover: none), (pointer: coarse) {
          #journey .mv {
            animation: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          #journey .card.on .hex {
            animation: none;
          }
          #journey .mv {
            animation: none;
          }
          #journey .bpm {
            transition: none;
            opacity: 1;
          }
        }
      `}</style>

      <section ref={journeyRef} className="journey" id="journey">
        <div ref={stageRef} className="stage" id="stage">
          {/* Canvas for Brain Wireframes, 5-strand fiber conduits, and light particles */}
          <canvas ref={canvasRef} id="cv" />

          {/* Hexagon Cards */}
          <div id="cards">
            {CARDS.map((card, i) => (
              <div
                key={card.id}
                ref={(el) => {
                  cardElsRef.current[i] = el;
                }}
                className={`card${i === 6 ? ' last' : ''}`}
                style={{ '--d': `${-i * 0.85}s` } as React.CSSProperties}
                onClick={() => handleCardClick(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(i);
                  }
                }}
              >
                <div className="mv">
                  <div className="hex">
                    <span className="n">{card.badge}</span>
                    <span className="t" dir={isRTL ? 'rtl' : 'ltr'}>
                      {getCardTitle(card)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Brain Labels */}
          <div ref={lbRef} className="lbl" id="lb">
            {beginnerLabel}
          </div>
          <div ref={lpRef} className="lbl p" id="lp">
            {proLabel}
          </div>

          {/* Bulletproof Mindset */}
          <div
            ref={bpmRef}
            className="bpm"
            id="bpm"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {t('brainEvolution.bulletproofMindset', 'Bulletproof Mindset')}
          </div>
        </div>
      </section>
    </>
  );
};

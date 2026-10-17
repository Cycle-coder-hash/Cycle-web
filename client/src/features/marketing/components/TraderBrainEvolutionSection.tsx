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

interface ProMesh {
  ppts: BrainPoint[];
  pedges: BrainEdge[];
  padj: number[][];
  pvis: Float32Array;
  flash: Float32Array;
  px: Float32Array;
  py: Float32Array;
  pd: Float32Array;
}

interface StrandPoint {
  x: number;
  y: number;
  bx: number;
  by: number;
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
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

const BRAIN_SHAPES_ELL = [
  [190, 115, 150, 88],
  [100, 140, 62, 55],
  [175, 178, 80, 30],
  [285, 192, 50, 30],
];

const BRAIN_FISS = quad([95, 168], [170, 138], [262, 152], 30, 5).concat(
  quad([205, 28], [222, 78], [188, 142], 20, 3.6)
);

function buildProMesh(
  g: CanvasRenderingContext2D,
  shapes: Path2D[],
  pmin: number,
  maxN: number,
  edgeDist: number
): ProMesh {
  function inside(x: number, y: number) {
    for (let i = 0; i < shapes.length; i++) {
      if (g.isPointInPath(shapes[i], x, y)) return true;
    }
    return false;
  }

  function nearFiss(x: number, y: number) {
    for (let i = 0; i < BRAIN_FISS.length; i++) {
      const f = BRAIN_FISS[i];
      const dx = x - f[0];
      const dy = y - f[1];
      if (dx * dx + dy * dy < f[2] * f[2]) return true;
    }
    return false;
  }

  const rnd = mulberry(11);
  const pts: BrainPoint[] = [];

  for (let k = 0; k < 9000 && pts.length < maxN; k++) {
    const x = 40 + rnd() * 300;
    const y = 26 + rnd() * 260;
    if (!inside(x, y) || nearFiss(x, y)) continue;
    let ok = true;
    for (let q = 0; q < pts.length; q++) {
      const dx = pts[q].x - x;
      const dy = pts[q].y - y;
      if (dx * dx + dy * dy < pmin * pmin) {
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
        dx * dx + dy * dy < edgeDist * edgeDist &&
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

  const padj: number[][] = pts.map(() => []);
  edges.forEach((e, i) => {
    padj[e.a].push(i);
    padj[e.b].push(i);
  });

  const n = pts.length;
  return {
    ppts: pts,
    pedges: edges,
    padj,
    pvis: new Float32Array(n),
    flash: new Float32Array(n),
    px: new Float32Array(n),
    py: new Float32Array(n),
    pd: new Float32Array(n),
  };
}

let cachedMesh: BrainMeshData | null = null;
let cachedProMeshes: { full: ProMesh; lite: ProMesh } | null = null;

function ensureBrainMeshes(): { beginner: BrainMeshData; full: ProMesh; lite: ProMesh } {
  if (cachedMesh && cachedProMeshes) {
    return { beginner: cachedMesh, full: cachedProMeshes.full, lite: cachedProMeshes.lite };
  }
  const emptyPro: ProMesh = {
    ppts: [],
    pedges: [],
    padj: [],
    pvis: new Float32Array(0),
    flash: new Float32Array(0),
    px: new Float32Array(0),
    py: new Float32Array(0),
    pd: new Float32Array(0),
  };
  if (typeof document === 'undefined') {
    return {
      beginner: { pts: [], edges: [], vis: new Float32Array(0) },
      full: emptyPro,
      lite: emptyPro,
    };
  }

  const canvas = document.createElement('canvas');
  const g = canvas.getContext('2d');
  if (!g) {
    return {
      beginner: { pts: [], edges: [], vis: new Float32Array(0) },
      full: emptyPro,
      lite: emptyPro,
    };
  }

  const shapes = BRAIN_SHAPES_ELL.map((e) => ell(e[0], e[1], e[2], e[3]));
  const stem = new Path2D();
  stem.moveTo(232, 195);
  stem.lineTo(264, 195);
  stem.lineTo(274, 276);
  stem.lineTo(247, 282);
  stem.closePath();
  shapes.push(stem);

  const full = buildProMesh(g, shapes, 12, 340, 22);
  const lite = buildProMesh(g, shapes, 30, 85, 51);

  cachedProMeshes = { full, lite };
  cachedMesh = { pts: full.ppts, edges: full.pedges, vis: full.pvis };

  return { beginner: cachedMesh, full, lite };
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

function smooth(t: number) {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
}

function pickEven<T>(list: T[], n: number): T[] {
  const out: T[] = [];
  if (!list.length) return out;
  for (let k = 0; k < n; k++) {
    const idx = clamp(Math.round(((k + 0.5) / n) * list.length - 0.5), 0, list.length - 1);
    out.push(list[idx]);
  }
  return out;
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
  const proHitRef = useRef<HTMLDivElement>(null);

  // Translations
  const beginnerLabel = t('brainEvolution.beginner', 'BEGINNER');
  const proLabel = t('brainEvolution.professional', 'PROFESSIONAL');
  const bpmLabel = t('brainEvolution.bulletproofMindset', 'Bulletproof Mindset');

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
    if (journeyRef.current) {
      const r = journeyRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const targetScrollY =
        window.scrollY + r.top + thVal * Math.max(1, (r.height - vh) * 0.86);
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

    const { beginner: mesh, full: PRO_FULL, lite: PRO_LITE } = ensureBrainMeshes();
    const pts = mesh.pts;

    let curMesh: ProMesh | null = null;
    let ppts: BrainPoint[] = [];
    let pedges: BrainEdge[] = [];
    let padj: number[][] = [];
    let pvis: Float32Array = new Float32Array(0);
    let flash: Float32Array = new Float32Array(0);
    let px: Float32Array = new Float32Array(0);
    let py: Float32Array = new Float32Array(0);
    let pd: Float32Array = new Float32Array(0);
    let pulses: Pulse[] = [];
    let endIdx: number[] = [];

    function useMesh(m: ProMesh) {
      if (m === curMesh) return;
      curMesh = m;
      ppts = m.ppts;
      pedges = m.pedges;
      padj = m.padj;
      pvis = m.pvis;
      flash = m.flash;
      px = m.px;
      py = m.py;
      pd = m.pd;
      pulses = [];
    }

    useMesh(PRO_FULL);

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
    let strands: StrandPoint[][] = [];
    let parts: Particle[] = [];
    let brainB: BrainTransform = { x: 0, y: 0, s: 1 };
    let brainP: BrainTransform = { x: 0, y: 0, s: 1 };
    let cw = 120;
    let ch = 68;
    let m = 16;
    let t1 = 1;
    let proCenterX = 0;
    let G = 58;

    let isHovered = false;
    let isToggled = false;
    const oeRef = { current: 0 };

    const clampLabelX = (el: HTMLElement | null, targetX: number) => {
      if (!el) return targetX;
      const halfW = (el.offsetWidth || 0) / 2;
      if (halfW <= 0) return targetX;
      const minX = m + halfW;
      const maxX = W - m - halfW;
      return minX <= maxX ? clamp(targetX, minX, maxX) : W / 2;
    };

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function spawnPulse() {
      for (let tries = 0; tries < 14; tries++) {
        const i = (Math.random() * ppts.length) | 0;
        if (pvis[i] < 0.85 || !padj[i]?.length) continue;
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

    function attachStrands(ns: number) {
      const E = SEG;
      const bs = brainB.s;
      let maxx = 0;
      let w1 = 60;
      let cand: BrainPoint[] = [];
      pts.forEach((p) => {
        if (p.keep && p.x > maxx) maxx = p.x;
      });
      do {
        cand = pts.filter((p) => p.keep && p.x > maxx - w1).sort((a, b) => a.y - b.y);
        w1 += 30;
      } while (cand.length < ns && w1 < 300);

      const st = pickEven(cand, ns).map((p) => ({
        x: brainB.x + (brainB.flipX ? 400 - p.x : p.x) * bs,
        y: brainB.y + p.y * bs,
      }));

      for (let k = 0; k < ns; k++) {
        const arr = strands[k];
        if (!arr || !st[k]) continue;
        const dx = st[k].x - arr[0].bx;
        const dy = st[k].y - arr[0].by;
        for (let i = 0; i < E; i++) {
          const w = 1 - smooth(i / E);
          arr[i].x = arr[i].bx + dx * w;
          arr[i].y = arr[i].by + dy * w;
        }
      }

      let minx = 1e9;
      let w2 = 45;
      let ci: number[] = [];
      ppts.forEach((p) => {
        if (p.x < minx) minx = p.x;
      });
      do {
        ci = [];
        ppts.forEach((p, i) => {
          if (p.x <= minx + w2) ci.push(i);
        });
        w2 += 25;
      } while (ci.length < ns && w2 < 300);

      ci.sort((a, b) => ppts[a].y - ppts[b].y);
      endIdx = pickEven(ci, ns);
    }

    function updateStrandEnds() {
      const E = SEG;
      for (let k = 0; k < strands.length; k++) {
        const arr = strands[k];
        const e = endIdx[k];
        if (e === undefined) continue;
        const dx = px[e] - arr[N - 1].bx;
        const dy = py[e] - arr[N - 1].by;
        for (let i = N - E; i < N; i++) {
          const w = smooth((i - (N - E)) / (E - 1));
          arr[i].x = arr[i].bx + dx * w;
          arr[i].y = arr[i].by + dy * w;
        }
      }
    }

    function drawPro(
      b: BrainTransform,
      bp: number,
      t: number,
      dt: number,
      oe: number,
      gapG: number
    ) {
      if (!ctx) return;
      const s = b.s;
      const lite = s * 400 < 140;
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
        py[i] =
          b.y +
          (150 + (p.y - 150) * f + bob) * s +
          (p.top ? -0.65 : 0.35) * gapG * oe;
        pd[i] = clamp(0.5 + zr / 170, 0, 1);
        flash[i] = Math.max(0, flash[i] - dt * 2.2);
      }

      /* soft glow behind the brain, grows as it is built */
      const gx = b.x + 190 * s;
      const gy = b.y + 140 * s;
      const gr = ctx.createRadialGradient(gx, gy, 10 * s, gx, gy, 230 * s);
      gr.addColorStop(
        0,
        'rgba(40,226,220,' + (lite ? 0.05 + 0.05 * bp : 0.07 + 0.07 * bp).toFixed(3) + ')'
      );
      gr.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(b.x - 60 * s, b.y - 60 * s, 520 * s, 420 * s);

      if (oe > 0.01) {
        const ocy = b.y + 150 * s - 0.15 * gapG * oe;
        const g2 = ctx.createRadialGradient(gx, ocy, 4, gx, ocy, 170 * s);
        g2.addColorStop(0, 'rgba(34,211,238,' + (0.16 * oe).toFixed(3) + ')');
        g2.addColorStop(1, 'rgba(34,211,238,0)');
        ctx.fillStyle = g2;
        ctx.fillRect(gx - 200 * s, ocy - 130 * s, 400 * s, 260 * s);
      }

      ctx.lineWidth = lite ? 0.75 : 1.15;
      for (i = 0; i < pedges.length; i++) {
        const e = pedges[i];
        const a = Math.min(pvis[e.a], pvis[e.b]);
        const d = (pd[e.a] + pd[e.b]) / 2;
        const pulse = 0.8 + 0.2 * Math.sin(t * 1.6 - (ppts[e.a].x + ppts[e.b].x) * 0.015);
        const crossSplit = ppts[e.a].top !== ppts[e.b].top;
        const al =
          (0.045 + 0.8 * a * pulse) *
          (0.45 + 0.55 * d) *
          (1 - 0.5 * oe) *
          (crossSplit ? 1 - oe : 1);
        ctx.strokeStyle =
          a > 0.02 ? 'rgba(40,226,220,' + al.toFixed(3) + ')' : 'rgba(60,110,170,.06)';
        ctx.beginPath();
        ctx.moveTo(px[e.a], py[e.a]);
        ctx.lineTo(px[e.b], py[e.b]);
        ctx.stroke();
      }

      const r = lite ? Math.max(0.8, 2.4 * s) : Math.max(1.8, 2.7 * s);
      ctx.globalAlpha = 1 - 0.5 * oe;
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
        ctx.arc(X, Y, edge ? rr * (lite ? 1.5 : 1.9) : rr, 0, 6.283);
        ctx.fill();

        ctx.fillStyle =
          'rgba(40,226,220,' +
          ((lite ? 0.09 : 0.14) * av * pl * (0.5 + 0.5 * pd[i])).toFixed(3) +
          ')';
        ctx.beginPath();
        ctx.arc(X, Y, rr * (lite ? (edge ? 3 : 2.2) : (edge ? 5.2 : 3.4)), 0, 6.283);
        ctx.fill();

        if (flash[i] > 0.02) {
          ctx.fillStyle = 'rgba(190,250,255,' + (0.2 * flash[i]).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(
            X,
            Y,
            rr * (lite ? 1.8 + 1.2 * flash[i] : 2.4 + 2.6 * flash[i]),
            0,
            6.283
          );
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      /* neuron signals: small glowing lights hop from neuron to neuron along the links */
      const mobile = isMobileRef.current;
      const want = Math.round((lite ? 4 : (mobile ? 7 : 14)) * clamp((bp - 0.12) / 0.6, 0, 1));
      if (!reduce && dt > 0 && pulses.length < want && Math.random() < dt * 12) spawnPulse();
      for (i = pulses.length - 1; i >= 0; i--) {
        const q = pulses[i];
        let pe = pedges[q.e];
        if (!pe) {
          pulses.splice(i, 1);
          continue;
        }
        if (oe > 0.05 && ppts[pe.a].top !== ppts[pe.b].top) {
          pulses.splice(i, 1);
          continue;
        }
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

        ctx.lineWidth = lite ? 1.1 : 1.6;
        ctx.strokeStyle = 'rgba(200,250,255,' + (0.6 * fa).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(ux, uy);
        ctx.stroke();

        ctx.fillStyle = 'rgba(40,226,220,' + (0.3 * fa).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(ux, uy, lite ? 3 : Math.max(4, 5.5 * s), 0, 6.283);
        ctx.fill();

        ctx.fillStyle = 'rgba(235,253,255,' + fa.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(ux, uy, lite ? 1.1 : Math.max(1.4, 2 * s), 0, 6.283);
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

      stage.style.height = '';
      W = stage.clientWidth || vw;
      H = stage.clientHeight || vh;

      // Smooth continuous scaling across 360px -> 390px -> 1000px+ (no visual jump at 760px)
      const t0 = clamp((W - 360) / (390 - 360), 0, 1);
      t1 = clamp((W - 390) / (1000 - 390), 0, 1);

      // Side margin: ~6px at 360, 8px at 390, smoothly scaling to desktop 3%
      m =
        W >= 1000
          ? Math.max(16, W * 0.03)
          : W >= 390
            ? lerp(8, Math.max(16, W * 0.03), t1)
            : lerp(6, 8, t0);

      // Brain width: reduced first on very narrow screens (52px at 360), 62px at 390, up to 380px on desktop
      const bw =
        W >= 1000
          ? Math.min(W * 0.24, 380)
          : W >= 390
            ? lerp(62, 200, t1)
            : lerp(52, 62, t0);
      const bh = bw * 0.75;

      useMesh(bw < 140 ? PRO_LITE : PRO_FULL);
      G = bw < 140 ? 30 : 58;

      // Card zone [xs, xe]: at W=390 -> m=8, bw=62, gapX=12 => xs=82, xe=308
      const gapX =
        W >= 1000 ? 64 : W >= 390 ? lerp(12, 64, t1) : lerp(10, 12, t0);
      const xs = m + bw + gapX;
      const xe = W - m - bw - gapX;
      const sp = (xe - xs) / 6;

      // Card width: ~70px at 390px (height = width * 0.56), scaling up to 152px on desktop
      const cwFactor = W >= 1000 ? 1.7 : lerp(1.86, 1.7, t1);
      cw = clamp(sp * cwFactor, 68, 152);
      ch = cw * 0.56;

      // Card 7 scale: 10% larger on mobile (1.10), scaling to 18% larger on desktop (1.18)
      const k7 = W >= 1000 ? 1.18 : lerp(1.1, 1.18, t1);

      // Zigzag amplitude: ~34px at 390px, scaling up to 92px on desktop (capped for short landscape screens)
      const amp =
        W >= 1000
          ? Math.min(92, H * 0.13)
          : Math.min(lerp(34, 92, t1), Math.max(28, H * 0.125));

      // Vertically center in the sticky stage while guaranteeing clearance below the fixed header
      const headerClearance = (mobile ? 58 : 68) + amp + (ch * k7) / 2 + 10;
      const cy = Math.max(H / 2 - 6, headerClearance);

      // On narrow viewports, shift brains slightly into the pocket below upper-row Cards 01 & 07
      // so neither brain touches Card 01/07 above or Card 02/06 beside it
      const by = cy - bh / 2 + (1 - t1) * 18;

      if (!isRTL) {
        brainB = { x: m, y: by, s: bw / 400, flipX: false };
        brainP = { x: W - m - bw, y: by, s: bw / 400, flipX: false };

        for (let i = 0; i < 7; i++) {
          cc.push({ x: xs + sp * i, y: cy + (i % 2 ? 1 : -1) * amp });
        }

        P.push({ x: m + bw * 0.9, y: by + bh * 0.62 });
        cc.forEach((c) => P.push(c));
        P.push({ x: W - m - bw * 0.9, y: by + bh * 0.56 });
      } else {
        // RTL Mirror: Beginner on Right, flows Left to Professional
        brainB = { x: W - m - bw, y: by, s: bw / 400, flipX: true };
        brainP = { x: m, y: by, s: bw / 400, flipX: true };

        for (let i = 0; i < 7; i++) {
          cc.push({
            x: W - (xs + sp * i),
            y: cy + (i % 2 ? 1 : -1) * amp,
          });
        }

        P.push({ x: W - (m + bw * 0.9), y: by + bh * 0.62 });
        cc.forEach((c) => P.push(c));
        P.push({ x: W - (W - m - bw * 0.9), y: by + bh * 0.56 });
      }

      // Position BEGINNER and PROFESSIONAL labels cleanly below their respective brains
      const begCenterX = !isRTL ? m + bw / 2 : W - (m + bw / 2);
      proCenterX = !isRTL ? W - m - bw / 2 : m + bw / 2;
      const brainBottom = by + 303 * brainP.s;
      const labelY = brainBottom + lerp(12, 20, t1);

      const lblFontSize = lerp(10, 11, t1);
      const isLatinLabel = /^[A-Za-z\s]+$/.test(beginnerLabel);
      const lblSpacing = isLatinLabel ? `${lerp(0.18, 0.34, t1).toFixed(2)}em` : 'normal';

      if (lbRef.current) {
        lbRef.current.style.fontSize = `${lblFontSize.toFixed(1)}px`;
        lbRef.current.style.letterSpacing = lblSpacing;
        lbRef.current.style.top = `${labelY}px`;
        lbRef.current.style.left = `${clampLabelX(lbRef.current, begCenterX)}px`;
      }
      if (lpRef.current) {
        lpRef.current.style.fontSize = `${lblFontSize.toFixed(1)}px`;
        lpRef.current.style.letterSpacing = lblSpacing;
        lpRef.current.style.top = `${labelY}px`;
        lpRef.current.style.left = `${clampLabelX(lpRef.current, proCenterX)}px`;
      }
      if (proHitRef.current) {
        proHitRef.current.style.left = `${brainP.x}px`;
        proHitRef.current.style.top = `${brainP.y}px`;
        proHitRef.current.style.width = `${bw}px`;
        proHitRef.current.style.height = `${bh}px`;
      }

      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;

      cc.forEach((c, i) => {
        const el = cardElsRef.current[i];
        if (!el) return;
        const k = i === 6 ? k7 : 1;
        el.style.left = `${c.x}px`;
        el.style.top = `${c.y}px`;
        el.style.width = `${cw * k}px`;
        el.style.height = `${ch * k}px`;
        const titleFs =
          W < 760
            ? clamp(cw * 0.132 * k, 9, 10)
            : Math.max(10, Math.round(cw * 0.092 * k));
        el.style.fontSize = `${titleFs.toFixed(1)}px`;
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
        const arr: StrandPoint[] = [];
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
          const sx = path[i].x + nx * o;
          const sy = path[i].y + ny * o;
          arr.push({ x: sx, y: sy, bx: sx, by: sy });
        }
        strands.push(arr);
      }
      attachStrands(ns);

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
      if (!journey) return 0;
      const vh = window.innerHeight;
      const r = journey.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, (r.height - vh) * 0.86), 0, 1);
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
      if (!proBuilt) {
        isToggled = false;
        isHovered = false;
      }
      if (proHitRef.current) {
        proHitRef.current.style.pointerEvents = proBuilt ? 'auto' : 'none';
        proHitRef.current.style.cursor = proBuilt ? 'pointer' : 'default';
      }

      const targetOe = (isHovered || isToggled) && proBuilt ? 1 : 0;
      oeRef.current +=
        (targetOe - oeRef.current) * (1 - Math.exp(-dt * (reduce ? 60 : 6)));
      const oe = reduce ? 0 : oeRef.current;

      if (bpmRef.current) {
        const ocy = brainP.y + 150 * brainP.s - 0.15 * G * oe;
        bpmRef.current.style.top = `${ocy}px`;
        bpmRef.current.style.left = `${clampLabelX(bpmRef.current, proCenterX)}px`;
        bpmRef.current.style.fontSize = `${lerp(11, 19, t1).toFixed(1)}px`;
        const textOpacity = reduce ? targetOe : oeRef.current;
        bpmRef.current.style.opacity = textOpacity > 0.01 ? textOpacity.toFixed(3) : '0';
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      drawBeginner(ctx, mesh, brainB, T);
      drawPro(brainP, bp, T, reduce ? 0 : dt, oe, G);
      updateStrandEnds();

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

    const proHitEl = proHitRef.current;
    const onProPointerEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') {
        isHovered = true;
      }
    };
    const onProPointerLeave = () => {
      isHovered = false;
    };
    const onProClick = (e: MouseEvent) => {
      e.stopPropagation();
      isToggled = !isToggled;
    };
    const onWindowPointerDown = (e: PointerEvent) => {
      if (proHitRef.current && !proHitRef.current.contains(e.target as Node)) {
        isToggled = false;
      }
    };

    if (proHitEl) {
      proHitEl.addEventListener('pointerenter', onProPointerEnter);
      proHitEl.addEventListener('pointerleave', onProPointerLeave);
      proHitEl.addEventListener('click', onProClick);
    }
    window.addEventListener('pointerdown', onWindowPointerDown);

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', layout);
      if (!reduce) {
        window.removeEventListener('pointermove', onPointerMove);
      }
      if (proHitEl) {
        proHitEl.removeEventListener('pointerenter', onProPointerEnter);
        proHitEl.removeEventListener('pointerleave', onProPointerLeave);
        proHitEl.removeEventListener('click', onProClick);
      }
      window.removeEventListener('pointerdown', onWindowPointerDown);
      ro?.disconnect();
      io?.disconnect();
    };
  }, [isRTL, beginnerLabel, proLabel, bpmLabel]);

  return (
    <>
      {/* Component-scoped CSS matching the approved reference demo */}
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
          gap: clamp(2px, 0.28em, 4px);
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
          font-size: clamp(7px, 0.72em, 11px);
          line-height: 1;
          letter-spacing: 0.2em;
          color: #22d3ee;
          opacity: 0.85;
        }
        #journey .t {
          font-family: inherit;
          font-weight: 600;
          line-height: 1.12;
          padding: 0 7%;
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
        #journey .lbl[dir="rtl"] {
          font-family: inherit;
          letter-spacing: normal;
        }
        #journey .pro-brain-hit {
          position: absolute;
          z-index: 12;
          background: transparent;
          touch-action: manipulation;
          pointer-events: none;
          border-radius: 50%;
        }
        #journey .bpm {
          position: absolute;
          transform: translate(-50%, -50%);
          white-space: nowrap;
          font-family: inherit;
          font-weight: 600;
          font-size: 19px;
          line-height: 1.2;
          letter-spacing: 0.04em;
          color: #ffffff;
          text-shadow: 0 0 14px rgba(34, 211, 238, 0.65), 0 0 2px rgba(34, 211, 238, 0.9);
          opacity: 0;
          pointer-events: none;
          z-index: 10;
        }
        #journey .bpm[dir="rtl"] {
          letter-spacing: normal;
        }
        @media (max-width: 759px) {
          #journey {
            height: 320vh;
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
          <div ref={lbRef} className="lbl" id="lb" dir={isRTL ? 'rtl' : 'ltr'}>
            {beginnerLabel}
          </div>
          <div ref={lpRef} className="lbl p" id="lp" dir={isRTL ? 'rtl' : 'ltr'}>
            {proLabel}
          </div>

          {/* Interactive Hit Target over Professional Brain */}
          <div
            ref={proHitRef}
            id="pro-brain-hit"
            className="pro-brain-hit"
            aria-label="Professional Brain interactive element"
            role="button"
            tabIndex={-1}
          />

          {/* Bulletproof Mindset */}
          <div
            ref={bpmRef}
            className="bpm"
            id="bpm"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {bpmLabel}
          </div>
        </div>
      </section>
    </>
  );
};

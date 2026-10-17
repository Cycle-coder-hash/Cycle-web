import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Compass, ArrowRight, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { HeroHexagonBackground } from './HeroHexagonBackground';

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

interface AmbientDust {
  x: number;
  y: number;
  v: number;
  r: number;
  ph: number;
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

const BRAIN_SHAPES_ELL = [
  [190, 115, 150, 88],
  [100, 140, 62, 55],
  [175, 178, 80, 30],
  [285, 192, 50, 30],
];

const BRAIN_FISS = quad([95, 168], [170, 138], [262, 152], 30, 5).concat(
  quad([205, 28], [222, 78], [188, 142], 20, 3.6)
);

let BRAIN_PATH_SHAPES: Path2D[] = [];

function buildProMesh(
  pmin: number,
  seed: number,
  maxN: number
): ProMesh {
  const canvas = document.createElement('canvas');
  const g = canvas.getContext('2d');
  if (!g) {
    return {
      ppts: [],
      pedges: [],
      padj: [],
      pvis: new Float32Array(0),
      flash: new Float32Array(0),
      px: new Float32Array(0),
      py: new Float32Array(0),
      pd: new Float32Array(0),
    };
  }
  const ctx = g;

  const shapes = BRAIN_SHAPES_ELL.map((e) => ell(e[0], e[1], e[2], e[3]));
  const stem = new Path2D();
  stem.moveTo(232, 195);
  stem.lineTo(264, 195);
  stem.lineTo(274, 276);
  stem.lineTo(247, 282);
  stem.closePath();
  shapes.push(stem);

  if (!BRAIN_PATH_SHAPES.length) {
    BRAIN_PATH_SHAPES = shapes;
  }

  function inside(x: number, y: number) {
    for (let i = 0; i < shapes.length; i++) {
      if (ctx.isPointInPath(shapes[i], x, y)) return true;
    }
    return false;
  }

  const rp = mulberry(seed);
  const ppts: BrainPoint[] = [];
  const mesh0: [number, number][] = [];

  function far(x: number, y: number, m: number) {
    for (let i = 0; i < mesh0.length; i++) {
      const dx = mesh0[i][0] - x;
      const dy = mesh0[i][1] - y;
      if (dx * dx + dy * dy < m * m) return false;
    }
    return true;
  }

  BRAIN_SHAPES_ELL.forEach((e, si) => {
    const per = 2 * Math.PI * Math.sqrt((e[2] * e[2] + e[3] * e[3]) / 2);
    const n = Math.round(per / pmin);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 6.283;
      const x = e[0] + e[2] * Math.cos(a);
      const y = e[1] + e[3] * Math.sin(a);
      let onb = true;
      for (let j = 0; j < shapes.length; j++) {
        if (j !== si && ctx.isPointInPath(shapes[j], x, y)) {
          onb = false;
          break;
        }
      }
      if (onb && far(x, y, pmin * 0.8)) mesh0.push([x, y]);
    }
  });

  [
    [232, 195, 264, 195],
    [264, 195, 274, 276],
    [274, 276, 247, 282],
    [247, 282, 232, 195],
  ].forEach((sg) => {
    const L = Math.hypot(sg[2] - sg[0], sg[3] - sg[1]);
    const n = Math.max(1, Math.round(L / pmin));
    for (let k = 0; k <= n; k++) {
      const x = sg[0] + ((sg[2] - sg[0]) * k) / n;
      const y = sg[1] + ((sg[3] - sg[1]) * k) / n;
      let onb = true;
      for (let j = 0; j < 4; j++) {
        if (ctx.isPointInPath(shapes[j], x, y)) {
          onb = false;
          break;
        }
      }
      if (onb && far(x, y, pmin * 0.8)) mesh0.push([x, y]);
    }
  });

  for (let kk = 0; kk < 9000 && mesh0.length < maxN; kk++) {
    const qx = 40 + rp() * 300;
    const qy = 26 + rp() * 260;
    if (!inside(qx, qy)) continue;
    if (far(qx, qy, pmin)) mesh0.push([qx, qy]);
  }

  mesh0.forEach((m) => {
    ppts.push({
      x: 380 - m[0],
      y: m[1],
      ord: clamp(((380 - m[0] - 40) / 300) * 0.85 + rp() * 0.15, 0, 1),
      ph: rp() * 6.28,
      fr: 0.6 + rp() * 1.8,
      keep: true,
    });
  });

  const pedges: BrainEdge[] = [];
  for (let i = 0; i < ppts.length; i++) {
    for (let j = i + 1; j < ppts.length; j++) {
      const dx = ppts[i].x - ppts[j].x;
      const dy = ppts[i].y - ppts[j].y;
      if (dx * dx + dy * dy < (pmin * 1.7) * (pmin * 1.7)) {
        pedges.push({
          a: i,
          b: j,
          keep: true,
          ord: Math.max(ppts[i].ord, ppts[j].ord),
        });
      }
    }
  }

  const rz = mulberry(99);
  ppts.forEach((p) => {
    const k = Math.sqrt(
      Math.max(0, 1 - Math.pow((p.x - 190) / 165, 2) - Math.pow((p.y - 130) / 120, 2))
    );
    p.z = (rz() * 2 - 1) * (80 * k + 10);
    p.top = p.y < 150;
  });

  const padj: number[][] = ppts.map(() => []);
  pedges.forEach((e, i) => {
    padj[e.a].push(i);
    padj[e.b].push(i);
  });

  const n = ppts.length;
  return {
    ppts,
    pedges,
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

  // Beginner brain mesh
  const canvas = document.createElement('canvas');
  const g = canvas.getContext('2d');
  const shapes = BRAIN_SHAPES_ELL.map((e) => ell(e[0], e[1], e[2], e[3]));
  const stem = new Path2D();
  stem.moveTo(232, 195);
  stem.lineTo(264, 195);
  stem.lineTo(274, 276);
  stem.lineTo(247, 282);
  stem.closePath();
  shapes.push(stem);
  if (!BRAIN_PATH_SHAPES.length) {
    BRAIN_PATH_SHAPES = shapes;
  }

  function inside(x: number, y: number) {
    if (!g) return false;
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

  const beginnerMesh: BrainMeshData = {
    pts,
    edges,
    vis: new Float32Array(pts.length),
  };

  const full = buildProMesh(16, 23, 210);
  const lite = buildProMesh(30, 23, 85);

  cachedMesh = beginnerMesh;
  cachedProMeshes = { full, lite };

  return { beginner: beginnerMesh, full, lite };
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
    ctx.beginPath();
    ctx.moveTo(
      b.x + (A.x + Math.sin(t * A.fr + A.ph) * 1.4) * s,
      b.y + (A.y + Math.cos(t * A.fr + A.ph) * 1.4) * s
    );
    ctx.lineTo(
      b.x + (B.x + Math.sin(t * B.fr + B.ph) * 1.4) * s,
      b.y + (B.y + Math.cos(t * B.fr + B.ph) * 1.4) * s
    );
    ctx.stroke();
  }

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (!p.keep) continue;
    const f = 0.5 + 0.5 * Math.sin(t * p.fr * 1.6 + p.ph);
    if (f > 0.93) continue;

    ctx.fillStyle = `rgba(150,170,205,${(0.2 + 0.5 * f).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(
      b.x + (p.x + Math.sin(t * p.fr + p.ph) * 1.4) * s,
      b.y + (p.y + Math.cos(t * p.fr + p.ph) * 1.4) * s,
      Math.max(1, 1.5 * s),
      0,
      6.283
    );
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
/* PROPS INTERFACE                                                           */
/* ========================================================================= */

export interface TraderBrainEvolutionSectionProps {
  copy?: {
    heroEyebrow?: string;
    heroSubtitle?: string;
    heroBnSub?: string;
    primaryCta?: string;
    secondaryCta?: string;
    trust1?: string;
    trust2?: string;
    trust3?: string;
  };
}

/* ========================================================================= */
/* MERGED HERO & TRADER BRAIN EVOLUTION JOURNEY COMPONENT                    */
/* ========================================================================= */

export const TraderBrainEvolutionSection: React.FC<TraderBrainEvolutionSectionProps> = ({
  copy,
}) => {
  const { t, language } = useLanguage();

  const journeyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lbRef = useRef<HTMLDivElement>(null);
  const lpRef = useRef<HTMLDivElement>(null);
  const mindRef = useRef<HTMLDivElement>(null);
  const mhRef = useRef<HTMLParagraphElement>(null);
  const gtRef = useRef<HTMLDivElement>(null);
  const gwRef = useRef<HTMLDivElement>(null);
  const hcRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  // Translations
  const beginnerLabel = t('brainEvolution.beginner', 'BEGINNER');
  const proLabel = t('brainEvolution.professional', 'PROFESSIONAL');
  const bpmLabel = t('brainEvolution.bulletproofMindset', 'Bulletproof Mindset');

  const pillText = copy?.heroEyebrow
    ? copy.heroEyebrow.replace(/•/g, '·')
    : t('hero.eyebrow', 'CYCLE OF CHART · TRADING REALITY').replace(/•/g, '·');

  const subText =
    copy?.heroBnSub ||
    t(
      'hero.subtext',
      'Keep your money with you. Build your knowledge before you build your position. No signals. No VIP pressure. No guaranteed returns.'
    );

  const primaryCtaText = copy?.primaryCta || t('hero.startRoadmap', 'Start Roadmap');
  const secondaryCtaText = copy?.secondaryCta || t('hero.exploreStore', 'Explore Store');

  const trust1Text = copy?.trust1 || t('hero.trust1', '100% Practical Learning');
  const trust2Text = copy?.trust2 || t('hero.trust2', 'Zero Signal Traps');
  const trust3Text = copy?.trust3 || t('hero.trust3', '12 Practical Stages');

  const getCardTitle = useCallback(
    (card: CardDef) => {
      return t(`brainEvolution.${card.key}`, card.defaultTitle);
    },
    [t]
  );

  // Two-line giant headline texts per language
  const headlineWords = useMemo(() => {
    if (language === 'bn') {
      return {
        small: 'Deposit করার আগে,',
        line1: 'TRADING',
        line2: 'বুঝুন।',
      };
    }
    if (language === 'ur') {
      return {
        small: 'ڈپازٹ کرنے سے پہلے،',
        line1: 'ٹریڈنگ کو',
        line2: 'سمجھیں۔',
      };
    }
    return {
      small: 'Before you deposit,',
      line1: 'UNDERSTAND',
      line2: 'TRADING.',
    };
  }, [language]);

  // Letter spans helper
  const renderWordSpans = useCallback(
    (text: string, startIndex: number) => {
      if (language === 'ur') {
        const words = text.split(/\s+/).filter(Boolean);
        return words.map((w, idx) => (
          <span
            key={idx}
            className="l"
            style={
              {
                '--i': startIndex + idx,
                marginInlineEnd: idx < words.length - 1 ? '0.3em' : undefined,
              } as React.CSSProperties
            }
          >
            {w}
          </span>
        ));
      }
      if (language === 'bn') {
        let graphemes: string[] = [];
        if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
          const segmenter = new (Intl as any).Segmenter('bn', { granularity: 'grapheme' });
          graphemes = Array.from(segmenter.segment(text), (s: any) => s.segment);
        } else {
          graphemes = Array.from(text);
        }
        return graphemes.map((g, idx) => (
          <span
            key={idx}
            className="l"
            style={{ '--i': startIndex + idx } as React.CSSProperties}
          >
            {g}
          </span>
        ));
      }
      return text.split('').map((ch, idx) => (
        <span
          key={idx}
          className="l"
          style={{ '--i': startIndex + idx } as React.CSSProperties}
        >
          {ch}
        </span>
      ));
    },
    [language]
  );

  const line1Count = useMemo(() => {
    if (language === 'ur') {
      return headlineWords.line1.split(/\s+/).filter(Boolean).length;
    }
    if (language === 'bn') {
      return Array.from(headlineWords.line1).length;
    }
    return headlineWords.line1.length;
  }, [language, headlineWords.line1]);

  // Core state refs for animation loop
  const pTRef = useRef(0);
  const pSRef = useRef(0);
  const litFRef = useRef(0);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const inViewRef = useRef(true);
  const isMobileRef = useRef(false);
  const onStateRef = useRef<boolean[]>([false, false, false, false, false, false, false]);
  const ptrRef = useRef({ x: 0, y: 0, sx: 0, sy: 0, on: false });
  const openTRef = useRef(0);
  const openSRef = useRef(0);
  const lastORef = useRef(-1);
  const ambRef = useRef<{ w: number; a: AmbientDust[] } | null>(null);

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
    const mind = mindRef.current;
    const mhEl = mhRef.current;
    if (!journey || !stage || !cv || !mind || !mhEl) return;

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
    let G = 58;

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
        x: brainB.x + p.x * bs,
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
        const dx = p.x - 190;
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

    function updateMind(oe: number) {
      if (!mind || !mhEl) return;
      if (Math.abs(oe - lastORef.current) < 0.002) return;
      lastORef.current = oe;
      mind.style.setProperty('--o', oe.toFixed(3));
      mhEl.style.opacity = clamp((oe - 0.15) / 0.35, 0, 1).toFixed(3);
    }

    function inBrain(x: number, y: number, pad: number) {
      if (!brainP || !stage) return false;
      const r = stage.getBoundingClientRect();
      const lx = x - r.left;
      const ly = y - r.top;
      const b = brainP;
      const s = b.s;
      return (
        lx > b.x + 30 * s - pad &&
        lx < b.x + 350 * s + pad &&
        ly > b.y + 20 * s - pad &&
        ly < b.y + 290 * s + pad
      );
    }

    function brainReady() {
      return pSRef.current >= th[6] - 0.01;
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

      const hcEl = hcRef.current;
      const TOP = (hcEl ? hcEl.offsetHeight : 0) + (mobile ? 6 : 10);
      const CY = TOP + (H - TOP) / 2;

      const m = mobile ? 8 : Math.max(16, W * 0.03);
      const bw = mobile
        ? clamp(W * 0.17, 54, 72)
        : Math.min(W * (W < 1000 ? 0.2 : 0.26), Math.max(200, (H - TOP) * 0.78), 380);
      const bh = bw * 0.75;

      const by = CY - bh / 2 - 6;
      brainB = { x: m, y: by, s: bw / 400 };
      brainP = { x: W - m - bw, y: by, s: bw / 400 };

      const gap0 = mobile ? 16 : 64;
      const xs = m + bw + gap0;
      const xe = W - m - bw - gap0;
      const sp = (xe - xs) / 6;
      const amp = mobile
        ? Math.min(78, (H - TOP) * 0.19)
        : Math.min(64, (H - TOP) * 0.12);

      cw = mobile ? clamp(sp * 1.85, 58, 76) : clamp(sp * 1.7, 96, 160);
      ch = cw * 0.56;

      for (let i = 0; i < 7; i++) {
        cc.push({ x: xs + sp * i, y: CY - 6 + (i % 2 ? 1 : -1) * amp });
      }

      P.push({ x: m + bw * 0.9, y: by + bh * 0.62 });
      cc.forEach((c) => P.push(c));
      P.push({ x: W - m - bw * 0.9, y: by + bh * 0.56 });

      if (lbRef.current) {
        lbRef.current.style.left = `${m + bw / 2}px`;
        lbRef.current.style.top = `${by + bh + 10}px`;
        lbRef.current.style.fontSize = mobile ? '8px' : '11px';
        lbRef.current.style.letterSpacing = mobile ? '0.18em' : '0.34em';
      }

      if (lpRef.current) {
        lpRef.current.style.left = `${W - m - bw / 2 - (mobile ? 4 : 0)}px`;
        lpRef.current.style.top = `${by + bh + 10}px`;
        lpRef.current.style.fontSize = mobile ? '8px' : '11px';
        lpRef.current.style.letterSpacing = mobile ? '0.18em' : '0.34em';
      }

      useMesh(bw < 140 ? PRO_LITE : PRO_FULL);
      G = mobile ? 30 : 58;

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
        el.style.fontSize = `${(mobile ? Math.max(9, cw * 0.13 * k) : cw * 0.092 * k).toFixed(1)}px`;
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
        cf.push(cum[(i + 1) * SEG] / total);
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
          arr.push({
            x: path[i].x + nx * o,
            y: path[i].y + ny * o,
            bx: path[i].x + nx * o,
            by: path[i].y + ny * o,
          });
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

      if (mind) {
        mind.style.left = `${mobile ? Math.min(brainP.x + 190 * brainP.s, W - 62) : brainP.x + 190 * brainP.s}px`;
        mind.style.top = `${brainP.y + 150 * brainP.s - 0.15 * G}px`;
        mind.style.fontSize = `${mobile ? 11 : clamp(brainP.s * 30, 14, 20)}px`;
      }
      lastORef.current = -1;
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

    // Pointer flashlight position tracking
    const onStagePointerMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      ptrRef.current.x = e.clientX - r.left;
      ptrRef.current.y = e.clientY - r.top;
      ptrRef.current.on = true;
    };
    const onStagePointerLeave = () => {
      ptrRef.current.on = false;
    };
    stage.addEventListener('pointermove', onStagePointerMove);
    stage.addEventListener('pointerleave', onStagePointerLeave);

    // 3D Tilt on Pointer Move for desktop cards
    const onCardTiltPointerMove = (e: PointerEvent) => {
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
      window.addEventListener('pointermove', onCardTiltPointerMove, { passive: true });
    }

    // Hover (mouse) or tap (touch) on the finished Professional brain
    const onBrainPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      openTRef.current =
        brainReady() && inBrain(e.clientX, e.clientY, openTRef.current ? 60 : 0) ? 1 : 0;
    };
    const onBrainPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      openTRef.current =
        brainReady() && inBrain(e.clientX, e.clientY, 0)
          ? openTRef.current
            ? 0
            : 1
          : 0;
    };
    const onDocMouseLeave = () => {
      openTRef.current = 0;
    };

    window.addEventListener('pointermove', onBrainPointerMove, { passive: true });
    stage.addEventListener('pointerdown', onBrainPointerDown);
    document.documentElement.addEventListener('mouseleave', onDocMouseLeave);

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

      if (pS < th[6] - 0.02) openTRef.current = 0;
      openSRef.current +=
        (openTRef.current - openSRef.current) * (1 - Math.exp(-dt * (reduce ? 60 : 7)));
      const oe = reduce ? 0 : openSRef.current * openSRef.current * (3 - 2 * openSRef.current);
      updateMind(oe);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      /* Ambient drifting light dust across the whole stage */
      if (!ambRef.current || ambRef.current.w !== W) {
        ambRef.current = { w: W, a: [] };
        const na = isMobileRef.current ? 26 : 70;
        for (let q = 0; q < na; q++) {
          ambRef.current.a.push({
            x: Math.random() * W,
            y: Math.random() * H,
            v: 6 + Math.random() * 16,
            r: 0.5 + Math.random() * 1.3,
            ph: Math.random() * 6.28,
          });
        }
      }
      const amb = ambRef.current;
      for (let q = 0; q < amb.a.length; q++) {
        const d = amb.a[q];
        if (!reduce) {
          d.y -= d.v * dt;
          d.x += Math.sin(T * 0.4 + d.ph) * 0.12;
          if (d.y < -4) {
            d.y = H + 4;
            d.x = Math.random() * W;
          }
        }
        ctx.fillStyle = `rgba(120,200,255,${(0.18 + 0.22 * Math.sin(T * 1.1 + d.ph)).toFixed(3)})`;
        ctx.fillRect(d.x, d.y, d.r, d.r);
      }

      /* Pointer smoothing + parallax of the giant headline + flashlight reveal */
      const ptr = ptrRef.current;
      ptr.sx += (ptr.x - ptr.sx) * 0.12;
      ptr.sy += (ptr.y - ptr.sy) * 0.12;
      if (!reduce && !isMobileRef.current && gwRef.current && stage) {
        const nx = ptr.on ? (ptr.sx / W) * 2 - 1 : 0;
        const ny = ptr.on ? (ptr.sy / H) * 2 - 1 : 0;
        gwRef.current.style.transform = `translate(${(-nx * 16).toFixed(1)}px, ${(-ny * 9).toFixed(1)}px)`;
        const gr = gwRef.current.getBoundingClientRect();
        const sr = stage.getBoundingClientRect();
        gwRef.current.style.setProperty(
          '--mx',
          `${ptr.on ? ptr.sx - (gr.left - sr.left) : -999}px`
        );
        gwRef.current.style.setProperty(
          '--my',
          `${ptr.on ? ptr.sy - (gr.top - sr.top) : -999}px`
        );
      }

      /* Professional brain dark silhouette drawn in front of giant headline */
      ctx.globalCompositeOperation = 'source-over';
      if (bp > 0.02) {
        ctx.save();
        ctx.translate(brainP.x, brainP.y);
        ctx.scale(brainP.s, brainP.s);
        ctx.transform(-1, 0, 0, 1, 380, 0);
        ctx.fillStyle = `rgba(2,8,20,${(0.9 * Math.min(1, bp * 1.6) * (1 - oe)).toFixed(3)})`;
        ctx.shadowColor = 'rgba(2,8,20,.95)';
        ctx.shadowBlur = 28;
        for (let q = 0; q < BRAIN_PATH_SHAPES.length; q++) {
          ctx.fill(BRAIN_PATH_SHAPES[q]);
        }
        ctx.restore();
        ctx.shadowBlur = 0;
      }
      ctx.globalCompositeOperation = 'lighter';

      /* Dim giant headline & fade intro elements on scroll */
      const gtE = Math.min(1, pS / 0.16);
      const gtO = 1 - 0.86 * gtE * gtE * (3 - 2 * gtE);
      if (gtRef.current) gtRef.current.style.opacity = gtO.toFixed(3);
      if (introRef.current) {
        introRef.current.style.opacity = (1 - Math.min(1, pS / 0.07)).toFixed(3);
        introRef.current.style.pointerEvents = pS > 0.05 ? 'none' : 'auto';
      }
      stageRef.current?.classList.toggle('intro-on', pS < 0.02);

      drawBeginner(ctx, mesh, brainB, T);
      drawPro(brainP, bp, T, reduce ? 0 : dt, oe, G);

      /* Orbiting rings around the finished Professional brain */
      if (bp > 0.05) {
        const ox = brainP.x + 190 * brainP.s;
        const oy = brainP.y + 150 * brainP.s;
        const os = brainP.s;
        ctx.globalCompositeOperation = 'lighter';
        [
          [0.38, -0.32, 0.5],
          [0.3, 0.42, -0.38],
        ].forEach((o, qi) => {
          const rx = (235 + qi * 25) * os;
          const ry = rx * o[0];
          const ang = o[1];
          ctx.strokeStyle = `rgba(60,190,255,${(0.14 * Math.min(1, bp * 1.4)).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(ox, oy, rx, ry, ang, 0, 6.283);
          ctx.stroke();
          const a = T * o[2] * 1.6 + qi * 2;
          const ex = rx * Math.cos(a);
          const ey = ry * Math.sin(a);
          const cx2 = ox + ex * Math.cos(ang) - ey * Math.sin(ang);
          const cy2 = oy + ex * Math.sin(ang) + ey * Math.cos(ang);
          const g3 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 9);
          g3.addColorStop(0, 'rgba(220,250,255,.95)');
          g3.addColorStop(0.35, 'rgba(34,211,238,.5)');
          g3.addColorStop(1, 'rgba(34,211,238,0)');
          ctx.fillStyle = g3;
          ctx.beginPath();
          ctx.arc(cx2, cy2, 9, 0, 6.283);
          ctx.fill();
        });
      }

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

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', layout);
      stage.removeEventListener('pointermove', onStagePointerMove);
      stage.removeEventListener('pointerleave', onStagePointerLeave);
      if (!reduce) {
        window.removeEventListener('pointermove', onCardTiltPointerMove);
      }
      window.removeEventListener('pointermove', onBrainPointerMove);
      stage.removeEventListener('pointerdown', onBrainPointerDown);
      document.documentElement.removeEventListener('mouseleave', onDocMouseLeave);
      ro?.disconnect();
      io?.disconnect();
    };
  }, [beginnerLabel, proLabel, bpmLabel]);

  return (
    <>
      {/* Component-scoped CSS matching the approved reference demo */}
      <style>{`
        #journey {
          position: relative;
          height: 380vh;
        }
        @media (max-width: 759px) {
          #journey {
            height: 320vh;
          }
        }
        #journey .stage {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          --bg: #02060f;
          --bg2: #06122a;
          --hexline: rgba(120, 170, 255, 0.10);
          --hexhi: rgba(34, 211, 238, 0.55);
          --cellA: 34, 211, 238;
          --cellB: 59, 130, 246;
          --star: 165, 243, 252;
          --cellgain: 1.6;
          --glow1: rgba(37, 99, 235, 0.38);
          --glow2: rgba(34, 211, 238, 0.10);
          --beam1: rgba(34, 211, 238, 0.10);
          --beam2: rgba(59, 130, 246, 0.12);
          --vig: rgba(0, 0, 0, 0.65);
          background: radial-gradient(120% 80% at 50% 0%, var(--bg2) 0%, var(--bg) 62%) !important;
        }
        #journey .stage::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          opacity: 0.07;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        #journey .vig {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: radial-gradient(ellipse 85% 75% at 50% 50%, transparent 55%, rgba(1, 4, 12, 0.75) 100%);
        }
        #journey canvas#cv {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: block;
        }
        #journey .hc {
          position: absolute;
          z-index: 3;
          left: 0;
          right: 0;
          top: 0;
          padding: 84px 16px 0;
          text-align: center;
          pointer-events: none;
        }
        #journey .pill {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          border: 1px solid rgba(34, 211, 238, 0.35);
          background: rgba(3, 14, 34, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border-radius: 99px;
          padding: 7px 14px;
          font-family: 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace;
          font-weight: 500;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.2em;
          color: #a5eaff;
          margin-bottom: 14px;
          animation: fadein 1s both;
        }
        #journey .pill:before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 10px #22d3ee;
        }
        #journey .gt {
          position: absolute;
          inset: 0;
          z-index: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          text-transform: uppercase;
          pointer-events: none;
          padding-top: 0 !important;
          padding-bottom: 140px;
          transition: opacity 0.2s;
        }
        #journey .gt i {
          font-style: normal;
          font-weight: 700;
          font-size: clamp(11px, 2vw, 28px);
          letter-spacing: 0.14em;
          color: #cfe3ff;
          margin-bottom: 0.4em;
          animation: fadein 1.2s 0.1s both;
        }
        #journey .gw {
          position: relative;
          will-change: transform;
        }
        #journey .gt b {
          display: block;
          white-space: nowrap;
          font-weight: 900;
          font-size: clamp(44px, 10.8vw, 185px);
          line-height: 0.9;
          letter-spacing: -0.03em;
          background: none !important;
          -webkit-text-fill-color: initial;
          filter: none;
        }
        #journey .gt b .l {
          display: inline-block;
          background: linear-gradient(180deg, #a8efff 0%, #3b94ff 52%, #1c3fa0 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-stroke: 1px rgba(140, 210, 255, 0.35);
          animation: rise 1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          animation-delay: calc(var(--i) * 45ms + 0.15s);
        }
        #journey .gt b .l + .l {
          margin-left: -0.022em;
        }
        #journey .gt b.hi {
          position: absolute;
          inset: 0;
          pointer-events: none;
          -webkit-mask-image: radial-gradient(circle 210px at var(--mx, -999px) var(--my, -999px), #000 0, rgba(0, 0, 0, 0.55) 45%, transparent 100%);
          mask-image: radial-gradient(circle 210px at var(--mx, -999px) var(--my, -999px), #000 0, rgba(0, 0, 0, 0.55) 45%, transparent 100%);
        }
        #journey .gt b.hi .l {
          background: linear-gradient(180deg, #ffffff, #8cf1ff 60%, #22d3ee);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-stroke: 0;
          filter: drop-shadow(0 0 18px rgba(34, 211, 238, 0.7));
        }
        #journey .intro {
          position: absolute;
          z-index: 4;
          left: 0;
          right: 0;
          bottom: 84px;
          text-align: center;
          padding: 0 16px;
          pointer-events: auto;
          transition: opacity 0.2s;
        }
        #journey .intro .hs {
          display: block;
          margin: 0 auto;
          max-width: 620px;
          color: #9fb4d6;
          font-size: clamp(11px, 1.15vw, 15px);
          line-height: 1.55;
          animation: up 1s 0.9s both;
        }
        #journey .intro .cta {
          pointer-events: auto;
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 16px;
          animation: up 1s 0.9s both;
        }
        #journey .cta a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 22px;
          border-radius: 11px;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        #journey .cta a:hover {
          transform: translateY(-2px);
        }
        #journey .cta .p {
          background: linear-gradient(90deg, #22d3ee, #0ea5ff);
          box-shadow: 0 0 26px rgba(34, 211, 238, 0.35);
          color: #020919;
          position: relative;
          overflow: hidden;
        }
        #journey .cta .p:after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 35%, rgba(255, 255, 255, 0.55) 50%, transparent 65%);
          transform: translateX(-130%);
          animation: sheen 3.2s 1.6s ease-in-out infinite;
        }
        #journey .cta .s {
          color: #e6f1ff;
          border: 1px solid rgba(150, 180, 255, 0.3);
          background: rgba(5, 14, 34, 0.6);
        }
        #journey .cta .s:hover {
          border-color: rgba(34, 211, 238, 0.5);
          background: rgba(8, 20, 48, 0.75);
        }
        #journey .chips {
          list-style: none;
          margin: 14px 0 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          animation: up 1s 1.2s both;
        }
        #journey .chips li {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid rgba(147, 197, 253, 0.16);
          background: rgba(255, 255, 255, 0.04);
          font-size: 11px;
          font-weight: 500;
          color: #93a4c2;
        }
        #journey .chips li::before {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22d3ee;
        }
        #journey .stage.intro-on .card {
          opacity: 0.05 !important;
        }
        #journey .card {
          --rx: 0deg;
          --ry: 0deg;
          position: absolute;
          z-index: 2;
          transform: translate(-50%, -50%) perspective(520px) rotateX(var(--rx)) rotateY(var(--ry));
          opacity: 0.42;
          transition: opacity 0.6s ease, filter 0.6s ease, transform 0.25s ease-out;
          filter: drop-shadow(0 0 0 rgba(34, 211, 238, 0));
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
          filter: drop-shadow(0 0 14px rgba(34, 211, 238, 0.42));
        }
        #journey .card.last.on {
          filter: drop-shadow(0 0 22px rgba(34, 211, 238, 0.7));
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
          background: conic-gradient(from var(--a), rgba(80, 140, 210, 0.32), rgba(80, 140, 210, 0.32));
        }
        #journey .hex::after {
          content: "";
          position: absolute;
          inset: 1.5px;
          clip-path: polygon(14% 0, 86% 0, 100% 50%, 86% 100%, 14% 100%, 0 50%);
          background: linear-gradient(165deg, #12306a 0%, #0a1b3c 42%, #050d1e 100%) !important;
          z-index: 0;
        }
        #journey .card.on .hex {
          background: conic-gradient(from var(--a), rgba(34, 211, 238, 0.12) 0deg, #22d3ee 50deg, rgba(34, 211, 238, 0.12) 130deg, rgba(34, 211, 238, 0.12) 215deg, #60a5fa 270deg, rgba(34, 211, 238, 0.12) 360deg);
          animation: brain-spin 4.5s linear infinite;
        }
        #journey .card.on .hex::after {
          background: linear-gradient(165deg, #17407f 0%, #0b2250 45%, #061328 100%) !important;
        }
        #journey .card.on .hex::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(110deg, transparent 35%, rgba(160, 240, 255, 0.22) 50%, transparent 65%);
          transform: translateX(-120%);
          animation: sheen 4.5s ease-in-out infinite;
          animation-delay: var(--d, 0s);
        }
        @keyframes brain-spin {
          to { --a: 360deg; }
        }
        @keyframes sheen {
          0%, 55% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
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
          font-weight: 700 !important;
          line-height: 1.15;
          padding: 0 10%;
          text-wrap: balance;
          color: #e6f1ff;
          letter-spacing: 0.01em;
        }
        #journey .card.on .t {
          text-shadow: 0 0 14px rgba(120, 230, 255, 0.55);
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
        #journey .mind {
          --o: 0;
          position: absolute;
          z-index: 20;
          transform: translate(-50%, -50%);
          pointer-events: none;
          opacity: var(--o);
          clip-path: inset(calc(50% * (1 - var(--o))) -10px);
          width: max-content;
          white-space: nowrap;
        }
        #journey .mh {
          margin: 0;
          font-family: inherit;
          font-weight: 700 !important;
          font-size: 1.15em !important;
          line-height: 1.2;
          letter-spacing: 0.03em;
          color: #e6f1ff;
          text-shadow: 0 0 10px rgba(2, 8, 20, 0.95), 0 0 14px rgba(34, 211, 238, 0.8), 0 0 30px rgba(34, 211, 238, 0.45) !important;
          opacity: 0;
        }
        @keyframes rise {
          from {
            transform: translateY(46%) rotateX(40deg);
            opacity: 0;
            filter: blur(10px);
          }
          to {
            transform: none;
            opacity: 1;
            filter: blur(0);
          }
        }
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .font-bangla #journey .gt b {
          font-size: clamp(36px, 8.5vw, 140px);
          letter-spacing: normal;
        }
        .font-urdu #journey .gt b {
          font-size: clamp(34px, 8vw, 130px);
          letter-spacing: normal;
        }
        @media (max-width: 759px) {
          #journey .hc {
            padding-top: 64px;
          }
          #journey .pill {
            font-size: 8px;
            margin-bottom: 10px;
            letter-spacing: 0.12em;
          }
          #journey .intro {
            bottom: 64px;
            padding: 0 12px;
          }
          #journey .intro .hs {
            font-size: 11px;
            line-height: 1.45;
          }
          #journey .cta {
            margin-top: 12px;
            gap: 8px;
          }
          #journey .cta a {
            padding: 9px 16px;
            font-size: 12px;
          }
          #journey .chips {
            margin-top: 10px;
            gap: 6px;
          }
          #journey .chips li {
            font-size: 9px;
            padding: 4px 8px;
          }
          #journey .gt {
            padding-bottom: 0;
          }
          #journey .gt b {
            font-size: clamp(32px, 12vw, 86px);
          }
          #journey .gt i {
            font-size: 10px;
            letter-spacing: 0.08em;
            padding: 0 20px;
          }
          .font-bangla #journey .gt b {
            font-size: clamp(26px, 9.5vw, 64px);
          }
          .font-urdu #journey .gt b {
            font-size: clamp(24px, 9vw, 60px);
          }
          #journey .t {
            padding: 0 4%;
          }
          #journey .hex {
            gap: 2px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          #journey .gt b .l,
          #journey .gt i,
          #journey .pill,
          #journey .intro .hs,
          #journey .intro .cta,
          #journey .chips {
            animation: none !important;
          }
          #journey .cta .p:after {
            animation: none !important;
          }
          #journey .card.on .hex {
            animation: none !important;
          }
          #journey .card.on .hex::before {
            animation: none !important;
          }
          #journey .mv {
            animation: none !important;
          }
        }
      `}</style>

      <section ref={journeyRef} className="journey cycle-hero" id="journey">
        <div ref={stageRef} className="stage" id="stage">
          {/* 1) Preserved Hero Hexagon Background with beams, glow, hex lines, and interactive mouse highlight */}
          <HeroHexagonBackground />

          {/* 2) Giant Headline behind the canvas (Stage 1 foreground, Stage 2 subtle dimmed backdrop) */}
          <div ref={gtRef} className="gt" id="gt" aria-hidden="true">
            <i>{headlineWords.small}</i>
            <div ref={gwRef} className="gw" id="gw">
              <b aria-hidden="true">
                {renderWordSpans(headlineWords.line1, 0)}
                <br />
                {renderWordSpans(headlineWords.line2, line1Count)}
              </b>
              <b className="hi" aria-hidden="true">
                {renderWordSpans(headlineWords.line1, 0)}
                <br />
                {renderWordSpans(headlineWords.line2, line1Count)}
              </b>
            </div>
          </div>

          {/* 3) Canvas: Beginner wireframe, Professional 3D brain with dark silhouette, conduits, particles, pulses, orbiting rings */}
          <canvas ref={canvasRef} id="cv" />

          {/* 4) Vignette overlay matching the approved reference */}
          <div className="vig" aria-hidden="true" />

          {/* 5) Top Pill "CYCLE OF CHART · TRADING REALITY" */}
          <div ref={hcRef} className="hc" id="hc">
            <div className="pill">{pillText}</div>
          </div>

          {/* 6) Hero Intro: Subtext, CTA buttons, and Trust chips (fades out as scrolling starts) */}
          <div ref={introRef} className="intro" id="intro">
            <p className="hs">{subText}</p>
            <div className="cta">
              <a href="#roadmap" className="p">
                <Compass size={17} className="mr-2 inline-block shrink-0" />
                <span>{primaryCtaText}</span>
                <ArrowRight size={16} className="ml-2 inline-block shrink-0" />
              </a>
              <a href="#store" className="s">
                <ShoppingBag size={17} className="mr-2 inline-block shrink-0 text-[#22d3ee]" />
                <span>{secondaryCtaText}</span>
              </a>
            </div>
            <ul className="chips">
              <li>{trust1Text}</li>
              <li>{trust2Text}</li>
              <li>{trust3Text}</li>
            </ul>
          </div>

          {/* 7) 7 Hexagon Journey Cards (zigzag path, activate 01 -> 07 on scroll) */}
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
                    <span className="t">{getCardTitle(card)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 8) Brain labels (Beginner Left, Professional Right) */}
          <div ref={lbRef} className="lbl" id="lb">
            {beginnerLabel}
          </div>
          <div ref={lpRef} className="lbl p" id="lp">
            {proLabel}
          </div>

          {/* 9) Bulletproof Mindset (Appears inside the finished split brain on hover/tap) */}
          <div ref={mindRef} className="mind" id="mind">
            <p ref={mhRef} className="mh">
              {bpmLabel}
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

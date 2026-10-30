/**
 * The hero's 3D stack as a static drawing: shown for reduced motion, low-power devices, no WebGL, and until
 * the 3D is ready. It projects the same geometry as components/three/journey.ts (square slabs, one per bot,
 * each bot's mark on its top face) at the same top-of-page pose, so the swap to 3D doesn't jump. Each mark
 * is placed on its face with one affine transform: an orthographic view of a plane is exactly affine.
 */
type V = [number, number, number];

const POSE = { rx: 0.62, ry: -0.85, gap: 0.62 };
const FOOT = 2, THICK = 0.16;

function project([x, y, z]: V): [number, number, number] {
  const cy = Math.cos(POSE.ry), sy = Math.sin(POSE.ry), cx = Math.cos(POSE.rx), sx = Math.sin(POSE.rx);
  const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
  return [x1, -y2, z2];
}
const xy = (v: V) => project(v).slice(0, 2) as [number, number];
const pts = (vs: V[]) => vs.map((v) => xy(v).map((n) => n.toFixed(4)).join(",")).join(" ");
const facing = (n: V) => project(n)[2] - project([0, 0, 0])[2] > 0.001;

/** The visible faces of a slab centred at (0, cy, 0). */
function slab(cy: number) {
  const [X, Y, Z] = [FOOT / 2, THICK / 2, FOOT / 2];
  const v = (a: number, b: number, c: number): V => [a * X, cy + b * Y, c * Z];
  const faces: { n: V; q: V[] }[] = [
    { n: [0, 1, 0], q: [v(-1, 1, -1), v(1, 1, -1), v(1, 1, 1), v(-1, 1, 1)] },
    { n: [0, -1, 0], q: [v(-1, -1, -1), v(1, -1, -1), v(1, -1, 1), v(-1, -1, 1)] },
    { n: [1, 0, 0], q: [v(1, -1, -1), v(1, 1, -1), v(1, 1, 1), v(1, -1, 1)] },
    { n: [-1, 0, 0], q: [v(-1, -1, -1), v(-1, 1, -1), v(-1, 1, 1), v(-1, -1, 1)] },
    { n: [0, 0, 1], q: [v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1)] },
    { n: [0, 0, -1], q: [v(-1, -1, -1), v(1, -1, -1), v(1, 1, -1), v(-1, 1, -1)] },
  ];
  return faces.filter((f) => facing(f.n)).map((f) => pts(f.q));
}

/** The SVG matrix that maps mark units (0..48) onto the top face of the slab centred at height cy. */
function faceMatrix(cy: number) {
  const top = cy + THICK / 2;
  const at = (u: number, w: number): V => [-FOOT / 2 + (u / 48) * FOOT, top, -FOOT / 2 + (w / 48) * FOOT];
  const [ox, oy] = xy(at(0, 0)), [ax, ay] = xy(at(48, 0)), [bx, by] = xy(at(0, 48));
  return `matrix(${[(ax - ox) / 48, (ay - oy) / 48, (bx - ox) / 48, (by - oy) / 48, ox, oy].map((n) => n.toFixed(5)).join(" ")})`;
}

/** The inside of a mark's <svg>, to place in a transformed group. */
const inner = (svg: string) => svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"));

export function StackDrawing({ marks, className = "" }: { marks: (string | null)[]; className?: string }) {
  const face = { fill: "var(--bg)", stroke: "var(--fg)", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const, strokeLinejoin: "round" as const };
  const n = marks.length;
  const at = (i: number) => ((n - 1) / 2 - i) * POSE.gap; // top slab first
  return (
    <svg viewBox="-1.75 -1.75 3.5 3.5" aria-hidden="true" className={`size-full ${className}`}>
      {marks.map((_, j) => n - 1 - j).map((i) => (
        <g key={i}>
          {slab(at(i)).map((p, k) => <polygon key={k} points={p} {...face} />)}
          {marks[i] && (
            <g className="mark stack-mark" transform={faceMatrix(at(i))} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: inner(marks[i]!) }} />
          )}
        </g>
      ))}
    </svg>
  );
}

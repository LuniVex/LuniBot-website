/**
 * The How it works box as a static drawing: shown for reduced motion, low-power devices, no WebGL, and until
 * the 3D is ready. It projects the same closed box as components/three/models.ts (`buildPackage`) at the
 * pose the 3D starts in (components/three/objects.ts), so the swap doesn't jump.
 */
type V = [number, number, number];

const POSE = { rx: 0.6, ry: -0.95, lift: -0.55, half: 1.6 };
const W = 1.5, H = 0.85, D = 1.1;

function project([x, y, z]: V): V {
  const cy = Math.cos(POSE.ry), sy = Math.sin(POSE.ry), cx = Math.cos(POSE.rx), sx = Math.sin(POSE.rx);
  const y0 = y + POSE.lift;
  const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  return [x1, -(y0 * cx - z1 * sx), y0 * sx + z1 * cx];
}
const pts = (vs: V[]) => vs.map((v) => project(v).slice(0, 2).map((n) => n.toFixed(4)).join(",")).join(" ");
const facing = (n: V) => project(n)[2] - project([0, 0, 0])[2] > 0.001;

export function PackageDrawing({ className = "" }: { className?: string }) {
  const v = (a: number, b: number, c: number): V => [(a * W) / 2, b ? H : 0, (c * D) / 2];
  const faces: { n: V; q: V[] }[] = [
    { n: [0, 1, 0], q: [v(-1, 1, -1), v(1, 1, -1), v(1, 1, 1), v(-1, 1, 1)] },
    { n: [1, 0, 0], q: [v(1, 0, -1), v(1, 1, -1), v(1, 1, 1), v(1, 0, 1)] },
    { n: [-1, 0, 0], q: [v(-1, 0, -1), v(-1, 1, -1), v(-1, 1, 1), v(-1, 0, 1)] },
    { n: [0, 0, 1], q: [v(-1, 0, 1), v(1, 0, 1), v(1, 1, 1), v(-1, 1, 1)] },
    { n: [0, 0, -1], q: [v(-1, 0, -1), v(1, 0, -1), v(1, 1, -1), v(-1, 1, -1)] },
  ];
  const line = { fill: "var(--bg)", stroke: "var(--fg)", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const, strokeLinejoin: "round" as const };
  const h = POSE.half;
  return (
    <svg viewBox={`${-h} ${-h} ${2 * h} ${2 * h}`} aria-hidden="true" className={`size-full ${className}`}>
      {faces.filter((f) => facing(f.n)).map((f, i) => <polygon key={i} points={pts(f.q)} {...line} />)}
      {/* Where the front and back flaps meet across the closed top. */}
      <polyline points={pts([[-W / 2, H, 0], [W / 2, H, 0]])} {...line} fill="none" />
    </svg>
  );
}

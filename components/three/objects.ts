import {
  BufferGeometry, Color, DoubleSide, ExtrudeGeometry, Group, Line, LineBasicMaterial, LineSegments,
  Mesh, MeshBasicMaterial, OrthographicCamera, Scene, Vector3,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { makeRenderer, type Palette } from "./shared";

/**
 * The site's 3D objects (skills/3d-and-scroll.md). Drawn like technical drawings: faces in the paper
 * colour with no lighting, 1px ink edges, and exactly one part in the accent. An orthographic camera
 * keeps them flat and measured. Scroll sets a target pose; each frame eases toward it, and nothing is
 * drawn once the pose has settled.
 *
 * Loaded with a dynamic import only when a stage is about to come into view.
 */

export type Kind = "mark";

export interface Stage {
  /** Sets where scroll wants the object to be (0..1 through its section). */
  aim(progress: number): void;
  /** Advances the eased pose by `dt` seconds and draws if it moved. Returns true while still moving. */
  frame(dt: number): boolean;
  recolor(p: Palette): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Creates the renderer and the bot-mark object. Null if WebGL is unavailable or software-rendered, so the caller keeps the SVG. */
export function createStage(canvas: HTMLCanvasElement, kind: Kind, palette: Palette, svg?: string): Stage | null {
  const renderer = makeRenderer(canvas);
  if (!renderer) return null;

  const mats = {
    face: new MeshBasicMaterial({ polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    edge: new LineBasicMaterial(),
    quiet: new LineBasicMaterial(),
    // Double-sided: the mark is mirrored to flip SVG's downward y, which reverses its winding.
    accent: new MeshBasicMaterial({ side: DoubleSide }),
    accentLine: new LineBasicMaterial(),
  };
  const recolor = (p: Palette) => {
    mats.face.color = new Color(p.paper);
    mats.edge.color = new Color(p.ink);
    mats.quiet.color = new Color(p.line);
    mats.accent.color = new Color(p.accent);
    mats.accentLine.color = new Color(p.accent);
  };
  recolor(palette);

  const scene = new Scene();
  const object = buildMark(mats, svg ?? "");
  scene.add(object.root);
  const camera = new OrthographicCamera(-1, 1, 1, -1, -100, 100);
  camera.position.set(0, 0, 50);
  camera.lookAt(new Vector3(0, 0, 0));

  let target = 0.5;
  let now = 0.5;
  let dirty = true;
  let size = { w: 1, h: 1 };

  const draw = () => { object.pose(now); renderer.render(scene, camera); };

  return {
    aim(p) { target = Math.min(1, Math.max(0, p)); },
    frame(dt) {
      const d = target - now;
      if (Math.abs(d) < 0.0004 && !dirty) return false;
      // Time-based follow (about 12% per frame at 60fps), so the object trails scroll the same at any frame rate.
      now = Math.abs(d) < 0.0004 ? target : now + d * (1 - Math.exp(-Math.min(dt, 0.05) * 7.7));
      dirty = false;
      draw();
      return true;
    },
    recolor(p) { recolor(p); dirty = true; },
    resize(w, h) {
      if (w === size.w && h === size.h) return;
      size = { w, h };
      renderer.setSize(w, h, false);
      const aspect = w / h;
      const half = object.halfHeight;
      camera.left = -half * aspect; camera.right = half * aspect; camera.top = half; camera.bottom = -half;
      camera.updateProjectionMatrix();
      dirty = true;
    },
    dispose() {
      scene.traverse((o) => { if (o instanceof Mesh || o instanceof Line || o instanceof LineSegments) o.geometry.dispose(); });
      Object.values(mats).forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}

type Mats = { face: MeshBasicMaterial; edge: LineBasicMaterial; quiet: LineBasicMaterial; accent: MeshBasicMaterial; accentLine: LineBasicMaterial };
interface Built { root: Group; halfHeight: number; pose(p: number): void }

/**
 * A bot's mark from public/marks, lifted into layers: the strokes as 1px hairlines, the baseline set
 * back, the solid accent shape extruded forward, and a quiet 40-unit frame behind. Turning it with
 * scroll shows the layers separate, so the flat mark gains depth without changing its drawing.
 */
function buildMark(mats: Mats, svg: string): Built {
  const root = new Group();
  const inner = new Group();
  inner.scale.set(1, -1, 1); // SVG y runs down
  inner.position.set(-24, 24, 0);
  root.add(inner);

  const data = new SVGLoader().parse(svg.replace(/currentColor/g, "#000000"));
  for (const path of data.paths) {
    const node = path.userData?.node as Element | undefined;
    const cls = node?.getAttribute("class") ?? "";
    const style = path.userData?.style as { fill?: string; strokeOpacity?: number } | undefined;
    if (cls.split(" ").includes("a") && style?.fill && style.fill !== "none") {
      for (const shape of path.toShapes()) {
        const geo = new ExtrudeGeometry(shape, { depth: 3.5, bevelEnabled: false });
        inner.add(new Mesh(geo, mats.accent)); // extrudes toward the viewer (+z)
      }
      continue;
    }
    const accent = cls.split(" ").includes("as");
    const quiet = (style?.strokeOpacity ?? 1) < 1;
    for (const sub of path.subPaths) {
      const pts = sub.getPoints(48);
      const line = new Line(new BufferGeometry().setFromPoints(pts), accent ? mats.accentLine : quiet ? mats.quiet : mats.edge);
      // The shared baseline (y = 42) sits back from the drawing.
      const isBaseline = pts.every((q) => Math.abs(q.y - 42) < 0.01);
      line.position.z = isBaseline ? -6 : 0;
      inner.add(line);
    }
  }
  // A quiet frame on the 48-unit grid, set behind everything.
  const frame = new BufferGeometry().setFromPoints([new Vector3(4, 4, 0), new Vector3(44, 4, 0), new Vector3(44, 44, 0), new Vector3(4, 44, 0), new Vector3(4, 4, 0)]);
  const back = new Line(frame, mats.quiet);
  back.position.z = -12;
  inner.add(back);

  return {
    root,
    halfHeight: 30,
    pose(p) {
      const e = smooth(p);
      root.rotation.set(lerp(0.32, -0.18, e), lerp(-0.75, 0.75, e), 0);
    },
  };
}

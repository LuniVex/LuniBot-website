import {
  BoxGeometry, BufferGeometry, Color, DoubleSide, EdgesGeometry, Group, Line, LineBasicMaterial, LineSegments, Matrix4,
  Mesh, MeshBasicMaterial, Object3D, OrthographicCamera, Quaternion, Scene, ShapeGeometry, Vector3,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { makeRenderer, type Palette } from "./shared";

/**
 * The hub's 3D journey (skills/3d-and-scroll.md): one slab per bot, stacked in the hero, each carrying its
 * bot's mark on its top face. Scroll carries every slab from its place in the stack to its bot's card,
 * where it lands flat, face-on and exactly the size of the card's mark, and hands over to it.
 *
 * The camera is orthographic in CSS pixels over the whole viewport, so positions come straight from DOM
 * rectangles: the stack is drawn over the hero's anchor box, and each slab aims at its card's mark box,
 * read live every frame (so it lands correctly at any width and after the grid is filtered).
 */

export interface Box { x: number; y: number; w: number; h: number }
export interface Frame {
  /** The hero anchor box, in viewport pixels. */
  anchor: Box;
  /** 0..1 through the hero: turns and closes the stack. */
  hero: number;
  /** Per slab: 0..1 of its trip, and the box of its card's mark (null if that card is hidden). */
  pieces: { travel: number; target: Box | null }[];
}

export interface Journey {
  draw(frame: Frame): void;
  /** How visible each card's own mark should be (it takes over as its slab lands). */
  handover(i: number): number;
  recolor(p: Palette): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

const FOOT = 2; // slab footprint, in stack units (square, like a mark)
const THICK = 0.16;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export function createJourney(canvas: HTMLCanvasElement, palette: Palette, marks: string[]): Journey | null {
  const renderer = makeRenderer(canvas);
  if (!renderer) return null;
  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 0, -1, -4000, 4000);

  type Mats = { face: MeshBasicMaterial; edge: LineBasicMaterial; quiet: LineBasicMaterial; accent: MeshBasicMaterial; accentLine: LineBasicMaterial };
  const allMats: Mats[] = [];
  const colorize = (m: Mats, p: Palette) => {
    m.face.color = new Color(p.paper); m.edge.color = new Color(p.ink); m.quiet.color = new Color(p.line);
    m.accent.color = new Color(p.accent); m.accentLine.color = new Color(p.accent);
  };

  // One slab per bot, built in stack units: footprint 2×2, top face at y = THICK/2 carrying the mark.
  const loader = new SVGLoader();
  const pieces = marks.map((svg) => {
    const m: Mats = {
      face: new MeshBasicMaterial({ transparent: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
      edge: new LineBasicMaterial({ transparent: true }),
      quiet: new LineBasicMaterial({ transparent: true }),
      accent: new MeshBasicMaterial({ transparent: true, side: DoubleSide }),
      accentLine: new LineBasicMaterial({ transparent: true }),
    };
    colorize(m, palette);
    allMats.push(m);
    const slab = new Group();
    const box = new BoxGeometry(FOOT, THICK, FOOT);
    slab.add(new Mesh(box, m.face));
    slab.add(new LineSegments(new EdgesGeometry(box), m.edge));
    // The mark on the top face: SVG units (0..48) mapped onto the 2×2 face, SVG y running toward the viewer.
    const face = new Group();
    face.rotation.x = Math.PI / 2;
    face.scale.setScalar(FOOT / 48);
    face.position.set(-FOOT / 2, THICK / 2 + 0.002, -FOOT / 2);
    slab.add(face);
    for (const path of loader.parse(svg.replace(/currentColor/g, "#000000")).paths) {
      const cls = (path.userData?.node as Element | undefined)?.getAttribute("class")?.split(" ") ?? [];
      const style = path.userData?.style as { fill?: string; strokeOpacity?: number } | undefined;
      if (cls.includes("a") && style?.fill && style.fill !== "none") {
        for (const shape of path.toShapes()) face.add(new Mesh(new ShapeGeometry(shape), m.accent));
        continue;
      }
      const mat = cls.includes("as") ? m.accentLine : (style?.strokeOpacity ?? 1) < 1 ? m.quiet : m.edge;
      for (const sub of path.subPaths) face.add(new Line(new BufferGeometry().setFromPoints(sub.getPoints(48)), mat));
    }
    scene.add(slab);
    return { slab, mats: m, handover: 0 };
  });

  // Scratch objects for composing the stack pose and the landed pose.
  const stack = new Object3D();
  const slot = new Object3D();
  stack.add(slot);
  const from = { p: new Vector3(), q: new Quaternion(), s: new Vector3() };
  const to = { p: new Vector3(), q: new Quaternion(), s: new Vector3() };
  const faceOn = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
  const tmp = new Matrix4();

  return {
    draw({ anchor, hero, pieces: trips }) {
      // The stack: centred in the anchor box, 3.5 units tall, turning and closing as the hero scrolls.
      const e = smooth(hero);
      const k = anchor.h / 3.5;
      stack.position.set(anchor.x + anchor.w / 2, -(anchor.y + anchor.h / 2), 0);
      stack.scale.setScalar(k);
      stack.rotation.set(lerp(0.62, 0.48, e), lerp(-0.85, 0.35, e), 0);
      const gap = lerp(0.62, 0.3, e);

      pieces.forEach((piece, i) => {
        const trip = trips[i];
        const t = smooth(Math.min(1, Math.max(0, trip.travel)));
        // Where it sits in the stack (top slab first).
        slot.position.set(0, (pieces.length - 1) / 2 * gap - i * gap, 0);
        stack.updateMatrixWorld(true);
        tmp.copy(slot.matrixWorld).decompose(from.p, from.q, from.s);

        let alpha = 1;
        if (trip.target && trip.target.w > 0) {
          // Landed: centred on the card's mark, flat, face-on, its 2-unit face exactly the mark's width.
          const T = trip.target;
          to.p.set(T.x + T.w / 2, -(T.y + T.h / 2), 0);
          to.q.copy(faceOn);
          to.s.set(T.w / FOOT, 0.02 * (T.w / FOOT), T.w / FOOT);
          piece.slab.position.lerpVectors(from.p, to.p, t);
          piece.slab.quaternion.slerpQuaternions(from.q, to.q, t);
          piece.slab.scale.lerpVectors(from.s, to.s, t);
          // The hand-over happens only once the slab is really there: within a few pixels of the mark's
          // centre and almost face-on. Until then the card's mark stays hidden, so there is never a ghost.
          const off = piece.slab.position.distanceTo(to.p);
          const near = Math.min(1, Math.max(0, 1 - off / 6));
          const flat = Math.min(1, Math.max(0, (t - 0.94) / 0.06));
          piece.handover = near * flat;
          alpha = 1 - piece.handover;
        } else {
          // Its card is filtered out: the slab simply fades as it would have left.
          piece.slab.position.copy(from.p); piece.slab.quaternion.copy(from.q); piece.slab.scale.copy(from.s);
          piece.handover = 0;
          alpha = 1 - t;
        }
        piece.slab.visible = alpha > 0.002;
        for (const mat of Object.values(piece.mats)) mat.opacity = alpha;
      });
      renderer.render(scene, camera);
    },
    handover: (i) => pieces[i]?.handover ?? 0,
    recolor(p) { allMats.forEach((m) => colorize(m, p)); },
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = -h;
      camera.updateProjectionMatrix();
    },
    dispose() {
      scene.traverse((o) => { if (o instanceof Mesh || o instanceof Line || o instanceof LineSegments) o.geometry.dispose(); });
      allMats.forEach((m) => Object.values(m).forEach((x) => x.dispose()));
      renderer.dispose();
    },
  };
}

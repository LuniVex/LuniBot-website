import {
  BoxGeometry, BufferGeometry, Color, DoubleSide, EdgesGeometry, Euler, Group, Line, LineBasicMaterial, LineSegments, Matrix4,
  Mesh, MeshBasicMaterial, Object3D, OrthographicCamera, Quaternion, Scene, ShapeGeometry, Vector3,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { buildModel, Outlines } from "./models";
import { makeRenderer, type Palette } from "./shared";

/**
 * The hub's 3D journey (skills/3d-and-scroll.md): one slab per bot, stacked in the hero, each carrying its
 * bot's mark on its top face. Scroll carries every slab from its place in the stack down into its bot's
 * card, where it settles on the card's stage in a three-quarter view and the bot's model (models.ts) rises
 * out of it: the drawing on the slab becomes the object. Once landed it stays, turning a little as its card
 * passes through the screen.
 *
 * The camera is orthographic in CSS pixels over the whole viewport, so positions come straight from DOM
 * rectangles: the stack is drawn over the hero's anchor box, and each slab aims at its card's stage box,
 * read live every frame (so it lands correctly at any width and after the grid is filtered).
 */

export interface Box { x: number; y: number; w: number; h: number }
export interface Frame {
  /** The hero anchor box, in viewport pixels. */
  anchor: Box;
  /** 0..1 through the hero: turns and closes the stack. */
  hero: number;
  /** Per slab: 0..1 of its trip, and the box of its card's stage (null if that card is hidden). */
  pieces: { travel: number; target: Box | null }[];
}

export interface Journey {
  draw(frame: Frame): void;
  recolor(p: Palette): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

const FOOT = 2; // slab footprint, in stack units (square, like a mark)
const THICK = 0.16;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** The landed pose: a three-quarter view from above, like the stack's, turned a little by where the card is on screen. */
const LAND = { rx: 0.5, ry: -0.72, turn: 0.5 };

export function createJourney(canvas: HTMLCanvasElement, palette: Palette, marks: string[], slugs: string[]): Journey | null {
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
  const outlines = new Outlines();
  const pieces = marks.map((svg, n) => {
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
    // The bot's model stands on the top face, folded flat until the slab lands.
    const model = buildModel(slugs[n] ?? "", m, outlines);
    if (model) { model.position.y = THICK / 2; slab.add(model); }
    scene.add(slab);
    return { slab, face, model, mats: m };
  });

  // Scratch objects for composing the stack pose and the landed pose.
  const stack = new Object3D();
  const slot = new Object3D();
  stack.add(slot);
  const from = { p: new Vector3(), q: new Quaternion(), s: new Vector3() };
  const to = { p: new Vector3(), q: new Quaternion(), s: new Vector3() };
  const tmp = new Matrix4();
  const euler = new Euler();
  let viewH = 1;

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
        let rise = 0;
        if (trip.target && trip.target.w > 0) {
          // Landed: centred on the card's stage and sized to it, in the three-quarter view. The model's
          // visual centre is above the slab, so the slab sits a little below the stage's centre.
          const T = trip.target;
          const k = Math.min(T.w / 3.3, T.h / 2.4);
          const cy = T.y + T.h / 2;
          to.p.set(T.x + T.w / 2, -(cy + 0.15 * k), 0);
          to.q.setFromEuler(euler.set(LAND.rx, LAND.ry - LAND.turn * (cy / viewH - 0.5), 0));
          to.s.setScalar(k);
          piece.slab.position.lerpVectors(from.p, to.p, t);
          piece.slab.quaternion.slerpQuaternions(from.q, to.q, t);
          piece.slab.scale.lerpVectors(from.s, to.s, t);
          // The model rises out of the slab over the last part of the trip.
          rise = smooth(Math.min(1, Math.max(0, (t - 0.55) / 0.45)));
        } else {
          // Its card is filtered out: the slab simply fades as it would have left.
          piece.slab.position.copy(from.p); piece.slab.quaternion.copy(from.q); piece.slab.scale.copy(from.s);
          alpha = 1 - t;
        }
        if (piece.model) {
          piece.model.scale.y = Math.max(0.001, rise);
          piece.model.visible = rise > 0.001;
          piece.face.visible = rise < 0.35; // the mark on the slab gives way to the object it becomes
        }
        piece.slab.visible = alpha > 0.002;
        for (const mat of Object.values(piece.mats)) mat.opacity = alpha;
      });
      scene.updateMatrixWorld(true);
      outlines.update();
      renderer.render(scene, camera);
    },
    recolor(p) { allMats.forEach((m) => colorize(m, p)); },
    resize(w, h) {
      renderer.setSize(w, h, false);
      viewH = h;
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

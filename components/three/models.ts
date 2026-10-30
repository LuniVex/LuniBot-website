import {
  BoxGeometry, BufferGeometry, CylinderGeometry, EdgesGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial,
  LineLoop, LineSegments, Mesh, MeshBasicMaterial, Object3D, Quaternion, SphereGeometry, Vector3,
} from "three";

/**
 * The 3D models (skills/3d-and-scroll.md), drawn like technical drawings: paper faces with no lighting, 1px
 * ink edges, quiet lines for detail, and exactly one part in the accent. Every model stands on y = 0 inside
 * a 2 × 2 footprint centred on the origin, front toward +z, so it sits on a bot's slab (journey.ts) or on
 * its own plinth (objects.ts) the same way.
 *
 * Curved sides have no edges of their own, so each cylinder keeps two silhouette lines that are re-aimed
 * at the camera before every draw (`Outlines.update`): the outline of a drawn cylinder, exactly.
 */
export interface Mats {
  face: MeshBasicMaterial; edge: LineBasicMaterial; quiet: LineBasicMaterial; accent: MeshBasicMaterial; accentLine: LineBasicMaterial;
}

interface Silhouette { node: Object3D; r: number; h: number; geo: BufferGeometry }

/** The silhouette lines of every cylinder in a model, re-aimed at an orthographic camera looking down -z. */
export class Outlines {
  private list: Silhouette[] = [];
  private q = new Quaternion();
  private v = new Vector3();
  add(s: Silhouette) { this.list.push(s); }
  update() {
    for (const s of this.list) {
      // The view direction in the cylinder's own frame; its sides turn edge-on where their normal is
      // perpendicular to it: n = (cos θ, 0, sin θ) with n · v = 0.
      s.node.getWorldQuaternion(this.q).invert();
      this.v.set(0, 0, -1).applyQuaternion(this.q);
      const t = Math.atan2(-this.v.x, this.v.z);
      const c = Math.cos(t) * s.r, n = Math.sin(t) * s.r, y = s.h / 2;
      const p = s.geo.getAttribute("position") as Float32BufferAttribute;
      p.set([c, -y, n, c, y, n, -c, -y, -n, -c, y, -n]);
      p.needsUpdate = true;
    }
  }
}

/** Building blocks, bound to one set of materials and one outline list. */
export function kit(m: Mats, outlines: Outlines) {
  const v = (x: number, y: number, z: number) => new Vector3(x, y, z);
  /** A box centred at (x, y, z): paper faces and ink edges (or one flat accent part). */
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, accent = false) => {
    const g = new Group();
    const geo = new BoxGeometry(w, h, d);
    g.add(new Mesh(geo, accent ? m.accent : m.face));
    if (!accent) g.add(new LineSegments(new EdgesGeometry(geo), m.edge));
    g.position.set(x, y, z);
    return g;
  };
  /** A circle of radius r lying flat at height y. */
  const ring = (r: number, y: number, mat: LineBasicMaterial, x = 0, z = 0) => {
    const pts = Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * Math.PI * 2; return v(x + Math.cos(a) * r, y, z + Math.sin(a) * r); });
    return new LineLoop(new BufferGeometry().setFromPoints(pts), mat);
  };
  /** An upright cylinder centred at (x, y, z): its two rims and its silhouette in ink, or a flat accent part. */
  const cylinder = (r: number, h: number, x: number, y: number, z: number, accent = false) => {
    const g = new Group();
    g.add(new Mesh(new CylinderGeometry(r, r, h, 64), accent ? m.accent : m.face));
    if (!accent) {
      g.add(ring(r, h / 2, m.edge), ring(r, -h / 2, m.edge));
      const geo = new BufferGeometry();
      geo.setAttribute("position", new Float32BufferAttribute(new Float32Array(12), 3));
      g.add(new LineSegments(geo, m.edge));
      outlines.add({ node: g, r, h, geo });
    }
    g.position.set(x, y, z);
    return g;
  };
  /** A polyline through the given points. */
  const path = (pts: [number, number, number][], mat: LineBasicMaterial = m.edge) =>
    new Line(new BufferGeometry().setFromPoints(pts.map(([x, y, z]) => v(x, y, z))), mat);
  /** A flat accent dot: a sphere drawn without shading reads as a disc from every side. */
  const dot = (r: number, x: number, y: number, z: number) => {
    const s = new Mesh(new SphereGeometry(r, 32, 16), m.accent);
    s.position.set(x, y, z);
    return s;
  };
  return { box, ring, cylinder, path, dot };
}

/** Music Bot: a record on its platter, grooves on the vinyl, the label in the accent, and the tonearm resting on it. */
function musicBot(k: ReturnType<typeof kit>, m: Mats) {
  const g = new Group();
  const cx = -0.14;
  g.add(k.cylinder(0.8, 0.07, cx, 0.035, 0));
  g.add(k.cylinder(0.74, 0.035, cx, 0.0875, 0));
  for (const r of [0.66, 0.57, 0.48, 0.39]) g.add(k.ring(r, 0.106, m.quiet, cx, 0));
  g.add(k.cylinder(0.22, 0.008, cx, 0.109, 0, true));
  g.add(k.cylinder(0.025, 0.1, cx, 0.13, 0));
  // Tonearm: a post at the back corner, the arm swinging round to rest on the outer grooves.
  g.add(k.cylinder(0.09, 0.3, 0.8, 0.15, -0.66));
  g.add(k.cylinder(0.05, 0.06, 0.8, 0.33, -0.66));
  g.add(k.path([[0.8, 0.33, -0.66], [0.84, 0.33, -0.1], [0.64, 0.24, 0.3], [0.44, 0.15, 0.44]]));
  g.add(k.box(0.16, 0.035, 0.09, 0.42, 0.13, 0.46));
  return g;
}

/** Modmail: a closed envelope with its flap drawn on, the ticket it becomes standing behind, and the new-message dot. */
function modmail(k: ReturnType<typeof kit>, m: Mats) {
  const g = new Group();
  g.add(k.box(1.25, 0.9, 0.05, 0.12, 0.45, -0.48));
  // Lines of text on the ticket's front face.
  for (const [y, w] of [[0.7, 0.8], [0.56, 0.95], [0.42, 0.6]] as const) g.add(k.path([[-0.38, y, -0.454], [-0.38 + w, y, -0.454]], m.quiet));
  g.add(k.box(1.55, 0.08, 1.0, -0.12, 0.04, 0.32));
  g.add(k.path([[-0.89, 0.081, -0.17], [-0.12, 0.081, 0.36], [0.65, 0.081, -0.17]]));
  g.add(k.dot(0.12, 0.72, 0.98, -0.44));
  return g;
}

/** DiscMeet: the voice as three rounded columns in the accent, beside the sheet of structured notes it turns into. */
function discMeet(k: ReturnType<typeof kit>, m: Mats) {
  const g = new Group();
  for (const [x, h] of [[-0.78, 0.42], [-0.5, 0.86], [-0.22, 0.6]] as const) g.add(k.cylinder(0.09, h, x, h / 2, 0.05, true));
  g.add(k.box(0.86, 0.035, 1.2, 0.5, 0.0175, 0.05));
  for (const [z, w] of [[-0.35, 0.6], [-0.12, 0.6], [0.11, 0.6], [0.34, 0.38]] as const) g.add(k.path([[0.2, 0.036, z], [0.2 + w, 0.036, z]], m.quiet));
  return g;
}

const MODELS: Record<string, (k: ReturnType<typeof kit>, m: Mats) => Group> = { "music-bot": musicBot, modmail, discmeet: discMeet };

/** A bot's model, or null for a bot that doesn't have one yet (its slab and mark stand in). */
export function buildModel(slug: string, m: Mats, outlines: Outlines): Group | null {
  const make = MODELS[slug];
  return make ? make(kit(m, outlines), m) : null;
}

/** The plinth a model stands on outside the journey: a square slab whose top face is y = 0. */
export const plinth = (m: Mats, outlines: Outlines) => kit(m, outlines).box(2, 0.16, 2, 0, -0.08, 0);

/**
 * How it works: the bot's zip as a box. Scroll opens its four flaps (download), then lifts the token out in
 * the accent (add your token); the box stands ready to run. `open` and `lift` are 0..1.
 */
export function buildPackage(m: Mats, outlines: Outlines) {
  const k = kit(m, outlines);
  const g = new Group();
  const W = 1.5, H = 0.85, D = 1.1, T = 0.035;
  g.add(k.box(W, T, D, 0, T / 2, 0));
  g.add(k.box(W, H, T, 0, H / 2, D / 2 - T / 2), k.box(W, H, T, 0, H / 2, -D / 2 + T / 2));
  g.add(k.box(T, H, D - 2 * T, W / 2 - T / 2, H / 2, 0), k.box(T, H, D - 2 * T, -W / 2 + T / 2, H / 2, 0));
  // Flaps hinge on the top edges. Closed they lie flat across the opening (the side flaps just under the
  // front and back ones); open they swing up and out.
  const flap = (w: number, d: number, at: [number, number, number], offset: [number, number, number], axis: "x" | "z", sign: number, below = 0) => {
    const hinge = new Group();
    hinge.position.set(at[0], at[1] - below, at[2]);
    hinge.add(k.box(w, T * 0.6, d, ...offset));
    g.add(hinge);
    return (open: number) => { hinge.rotation[axis] = sign * open * 2.1; };
  };
  const flaps = [
    flap(W, D / 2, [0, H, D / 2], [0, 0, -D / 4], "x", 1),
    flap(W, D / 2, [0, H, -D / 2], [0, 0, D / 4], "x", -1),
    flap(W / 2, D - 0.04, [W / 2, H, 0], [-W / 4, 0, 0], "z", -1, 0.022),
    flap(W / 2, D - 0.04, [-W / 2, H, 0], [W / 4, 0, 0], "z", 1, 0.022),
  ];
  const token = k.cylinder(0.24, 0.06, 0, 0.3, 0, true);
  token.rotation.x = Math.PI / 2;
  g.add(token);
  return {
    root: g,
    pose(open: number, lift: number) {
      flaps.forEach((f) => f(open));
      token.visible = lift > 0.001;
      token.position.y = 0.3 + lift * 0.95;
    },
  };
}

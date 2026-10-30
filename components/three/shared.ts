import { WebGLRenderer } from "three";

/**
 * Helpers shared by every 3D layer (skills/3d-and-scroll.md): a renderer that refuses software GL, and the
 * palette read from the CSS tokens.
 */
export interface Palette { paper: string; ink: string; line: string; accent: string }

/** A transparent, antialiased renderer at a capped pixel ratio, or null if WebGL is missing or software-rendered. */
export function makeRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch {
    return null;
  }
  // A software renderer (GPU blocked or absent) would make scrolling stutter: keep the SVG drawing instead.
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)) {
    renderer.dispose();
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2));
  return renderer;
}

/** A token as #rrggbb (the CSS minifier shortens #000000 to #000). */
const hex = (v: string) => {
  const s = v.trim();
  return /^#[0-9a-f]{3}$/i.test(s) ? `#${[...s.slice(1)].map((c) => c + c).join("")}` : s;
};
/** Mixes two #rrggbb colours: `t` of a over b. */
function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((x, i) => Math.round(x * t + pb[i] * (1 - t)).toString(16).padStart(2, "0")).join("")}`;
}

/** The two neutrals and the accent from the CSS tokens; the hairline tint is mixed the same way the CSS does. */
export function readPalette(): Palette {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const paper = hex(cs.getPropertyValue("--paper")), ink = hex(cs.getPropertyValue("--ink"));
  return { paper, ink, accent: hex(cs.getPropertyValue("--accent")), line: mix(ink, paper, root.classList.contains("dark") ? 0.27 : 0.19) };
}

/** Hints that the device would rather not run WebGL: data saver, very little memory or very few cores. */
export function lowPower() {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return Boolean(n.connection?.saveData) || (n.deviceMemory ?? 8) <= 2 || (n.hardwareConcurrency ?? 8) <= 2;
}

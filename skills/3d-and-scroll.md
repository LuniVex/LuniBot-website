# 3D and scroll

Renderer: **plain Three.js** (`three`, tree-shaken imports), loaded with a dynamic import only when a 3D object is about to come into view. Not React Three Fiber: the objects are a few static meshes and lines; GSAP already owns time, so a second render loop and reconciler would only add weight.

## How 3D and scroll work together
- **Scroll is the only clock.** A ScrollTrigger with `scrub` maps scroll progress (0→1) to a target pose (rotation, drift). Nothing spins on its own.
- **Smoothing, not jitter.** Lenis smooths the scroll; the object eases toward the target pose on GSAP's ticker (`lerp ≈ 0.12` per frame). Render only while the pose is still moving; stop when it settles.
- **Pinning.** The object's column is `position: sticky` inside a tall section, so it stays in frame while the copy beside it scrolls past. ScrollTrigger measures the same section for progress. (Sticky is used instead of a ScrollTrigger pin to avoid pin-spacer reflow; Lenis scrolls natively, so sticky is exact.)
- **One system in view.** Hero: the stack of slabs, one per bot. Scroll carries each slab into its card's stage, where the bot's model rises out of it and stays; the landed models turn together, a little, as their cards pass through the screen (one system, not separate objects competing). Bot pages: the bot's model on its plinth beside its features. How it works: the zip as a box that opens and lifts out the token. Never two unrelated objects moving in one viewport.

## Look
- Faces: `MeshBasicMaterial` in the paper colour (no lighting, no shading) with polygon offset, so hidden edges are occluded cleanly.
- Edges: `LineSegments` of `EdgesGeometry` in the ink colour, 1px: the hairline.
- Accent: exactly one part in the accent colour, flat. No glow, bloom, environment maps, chrome, plastic, gradients or coloured lights. No default sample-scene lighting (no lights at all).
- Colours come from the CSS tokens at runtime and update when the theme changes.
- **Models** (`components/three/models.ts`): each bot has one, built from boxes, cylinders and polylines inside a 2 × 2 footprint, standing on y = 0. It shows what the bot does (a record player, an envelope and its ticket, a voice waveform beside its notes); the accent part is the thing that matters (the label, the new-message dot, the voice). Curved sides get two silhouette lines re-aimed at the camera each draw, so a cylinder is outlined exactly. A bot without a model keeps its slab and mark.

## Performance and fallbacks
- Pixel ratio capped at 2 (1.5 on small screens). Antialiasing on.
- The canvas mounts only when its block is within one viewport of the screen (IntersectionObserver), and the GPU work stops when it leaves the screen or the tab is hidden.
- Static SVG twin shown when: `prefers-reduced-motion: reduce`, low-power hints (`saveData`, `deviceMemory ≤ 2`, `hardwareConcurrency ≤ 2`), WebGL unavailable, a software renderer (SwiftShader, llvmpipe: measured at 33ms median / 133ms p95 frames while scrolling, against a steady 16.7ms on a GPU), or the WebGL context is lost. The SVG is in the server HTML, so the page works with no script at all; the canvas fades in over it.
- Dispose geometries, materials and the renderer on unmount.

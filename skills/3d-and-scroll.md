# 3D and scroll

Renderer: **plain Three.js** (`three`, tree-shaken imports), loaded with a dynamic import only when a 3D object is about to come into view. Not React Three Fiber: the objects are a few static meshes and lines; GSAP already owns time, so a second render loop and reconciler would only add weight.

## How 3D and scroll work together
- **Scroll is the only clock.** A ScrollTrigger with `scrub` maps scroll progress (0→1) to a target pose (rotation, drift). Nothing spins on its own.
- **Smoothing, not jitter.** Lenis smooths the scroll; the object eases toward the target pose on GSAP's ticker (`lerp ≈ 0.12` per frame). Render only while the pose is still moving; stop when it settles.
- **Pinning.** The object's column is `position: sticky` inside a tall section, so it stays in frame while the copy beside it scrolls past. ScrollTrigger measures the same section for progress. (Sticky is used instead of a ScrollTrigger pin to avoid pin-spacer reflow; Lenis scrolls natively, so sticky is exact.)
- **One object in view.** Hero: the terminal cube. Further down: a bot's mark as a layered object beside its features, and on the featured card. Never two moving at once in the same viewport.

## Look
- Faces: `MeshBasicMaterial` in the paper colour (no lighting, no shading) with polygon offset, so hidden edges are occluded cleanly.
- Edges: `LineSegments` of `EdgesGeometry` in the ink colour, 1px: the hairline.
- Accent: exactly one part in the accent colour, flat. No glow, bloom, environment maps, chrome, plastic, gradients or coloured lights. No default sample-scene lighting (no lights at all).
- Colours come from the CSS tokens at runtime and update when the theme changes.

## Performance and fallbacks
- Pixel ratio capped at 2 (1.5 on small screens). Antialiasing on.
- The canvas mounts only when its block is within one viewport of the screen (IntersectionObserver), and the GPU work stops when it leaves the screen or the tab is hidden.
- Static SVG twin shown when: `prefers-reduced-motion: reduce`, low-power hints (`saveData`, `deviceMemory ≤ 2`, `hardwareConcurrency ≤ 2`), WebGL unavailable, a software renderer (SwiftShader, llvmpipe: measured at 33ms median / 133ms p95 frames while scrolling, against a steady 16.7ms on a GPU), or the WebGL context is lost. The SVG is in the server HTML, so the page works with no script at all; the canvas fades in over it.
- Dispose geometries, materials and the renderer on unmount.

# AGENTS

## Purpose

Paints Lana `STATE(p, d)` values into a fixed 100 × 60 world and watches influence spread, repel, and decay. Static web app: HTML, CSS, JS, Canvas 2d, and a Lana 4.1.0 WebAssembly engine. No service or database.

## Architecture

- `index.html` — loads `src/app.js`, controls, and the 1200 × 720 canvas.
- `src/app.js` — render loop (`STEP = 1/30`) calling `lana.tick`/`paint`/`getStateBuffer`; frames via `requestAnimationFrame`; runs at most one tick per frame and redraws only when state changes.
- `src/lanaBridge.js` — JS↔WASM bridge; gates action buttons until `initialize` succeeds.
- `src/input.js`, `src/renderer.js` — mouse painting and Canvas 2d rendering, wired by `app.js`.
- `wasm/src/lib.rs` — `#[wasm_bindgen]` `LivingCanvasEngine`; hard-codes `WIDTH=100`, `HEIGHT=60`, `STRIDE=4`.
- `lana/living_canvas.lana` — Lana source; bytecode is `dist/living_canvas.labc`, embedded via `include_bytes!`.
- Cells are row-major; each cell has 3 lanes (p, d, age) in the JSON I/O.

## Conventions

- Grid is fixed 100 × 60; the constructor rejects other sizes.
- `spread`, `decay`, `memory`, `dt` are floats; the three controls clamp to `[0, 1]`.
- `dist/` must ship with source when publishing (GitHub Pages subpath `oponite.github.io/living-canvas/`).

## Build / Run

- Run locally: `python3 -m http.server 8000`, open `http://localhost:8000/` (static server required for module + WASM).
- Rebuild engine: pin Lana commit `4e1606a390f44778029ff45bf0b8af7ff9b41272`; build compiler, `lana compile`, add `wasm32-unknown-unknown`, `cargo build --release`, `wasm-bindgen --target web`. Do not use an older `lana` on `PATH`. On non-macOS, drop the `DYLD_FALLBACK_LIBRARY_PATH` env var.
- No unit tests; verify via README visual checks (Colony, Diffusion, Repulsion, Ghost).

## Known Traps

- Optimized WASM tick (~34 ms steady, ~69 ms first) exceeds the 33 ms budget for 30 ticks/s — frame rate not yet met; assume the cold start.
- Strong negative `d` (< −0.5) cells are intentionally preserved to form opposing bands.

## Invariants

- `next_p` clamped to `[0, 1]`; `next_d` to `[-1, 1]`.
- Cells with `probability < 0.0001` reset to 0.
- Buffer is always 6000 cells (18000 output values).

## Environment

- OS: macOS (Apple Silicon). Runtime: Python 3. Toolchain: Rust (`rustup`) + `wasm-bindgen-cli` 0.2.100, target `wasm32-unknown-unknown`; Lana 4.1.0.
- No non-secret env vars or config files; no background services — the app is purely client-side.

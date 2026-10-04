# Living Canvas

Paint native Lana `STATE(p, d)` values into a 100 × 60 world and watch their influence spread, repel, and decay. The site is static: HTML, CSS, JavaScript, Canvas 2D, and a Lana 4.1.0 WebAssembly engine. No service or database is needed.

## Open locally

From this directory, run `python3 -m http.server 8000` and open `http://localhost:8000/`. A static HTTP server is needed for browser module and WASM loading. The checked-in `dist/` files are sufficient to serve the app without Rust or Lana installed.

Drag the mouse to paint. **Size** is the circular brush radius in cells. **Intensity p** controls brightness; **Influence d** controls hue and how a cell affects its neighbors. Positive `d` draws neighbors toward its `p`; negative `d` pushes them toward `1 − p`. Lana's native `STATE` rule sets `d` to zero when `p` is exactly 0 or 1.

Pause preserves the current artwork and still allows painting. Clear resets every cell. Export PNG downloads the visible 1200 × 720 canvas.

## Rebuild the Lana engine

The WASM adapter is pinned to Lana 4.1.0 commit `4e1606a390f44778029ff45bf0b8af7ff9b41272`. Build the compiler from that tag, then compile the program before building the adapter. Do not use an older `lana` binary on `PATH`.

```sh
git clone --branch v4.1.0 --depth 1 https://github.com/oponite/lana.git /tmp/living-canvas-lana
python3 /tmp/living-canvas-lana/tools/build.py build
/tmp/living-canvas-lana/target/lana/bin/lana version
/tmp/living-canvas-lana/target/lana/bin/lana compile lana/living_canvas.lana -o dist/living_canvas.labc
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli --version 0.2.100 --locked
RUSTC="$(rustup which rustc)" DYLD_FALLBACK_LIBRARY_PATH="$("$(rustup which rustc)" --print sysroot)/lib" cargo build --manifest-path wasm/Cargo.toml --locked --release --target wasm32-unknown-unknown
wasm-bindgen --target web --out-dir dist wasm/target/wasm32-unknown-unknown/release/living_canvas_wasm.wasm
```

On systems other than macOS, the `DYLD_FALLBACK_LIBRARY_PATH` setting can be omitted. The Rust CLI build outputs to the Lana checkout's `target/lana` directory. `dist/living_canvas.labc` is embedded in the app's WASM module; the separate bytecode file records the compiled Lana program.

## Visual checks

Paint a short stroke for each configuration after Clear:

| Check | p | d | Spread | Decay | Memory | Expected behavior |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Colony | 0.8 | +0.9 | 0.4 | 0.02 | 0.8 | Persists and slowly influences nearby cells |
| Diffusion | 0.9 | +0.6 | 0.9 | 0.1 | 0.2 | Quickly propagates outward |
| Repulsion | 0.8 | −0.9 | 0.7 | 0.05 | 0.5 | Forms boundaries or opposing gradients |
| Ghost | 0.4 | +0.2 | 0.35 | 0.02 | 0.95 | Lingers subtly for a long time |

All four snapshots were visually checked after 60 Lana ticks: the colony stays compact, diffusion forms a broader bloom, repulsion forms an opposing-color ring, and the ghost remains faint. On this development machine, the optimized WASM engine takes about 34 ms per steady tick in Node and about 69 ms for its first tick. The 33 ms budget for 30 ticks/second is therefore **not yet met**. Browser frame rate and interactive controls still need a browser run; the automated browser surface was unavailable during development. The render loop bounds accumulated work so overload does not grow without limit.

## GitHub Pages

Published site: https://oponite.github.io/living-canvas/

Pages serves the `main` branch from the repository root. All asset URLs are relative, so the app works under the project subpath. Keep `dist/` with the source when publishing changes.

# Living Canvas

Draw on the canvas and watch the world respond. [Try Living Canvas here](https://oponite.github.io/living-canvas/).

## How to Draw

Choose a circle or square brush. Set its **intensity** and  **influence**, then paint. 

Positive influence pulls nearby cells toward a mark; negative influence pushes them away.

Use **Spread**, **Decay**, and **Memory** to shape how the whole canvas changes.

Pause to paint on a still canvas, clear it to start over, or export your result as a PNG.

## Render Locally (on VSCode)

```
python3 -m http.server 8000
```

## Tech Stack

Living Canvas runs in the browser using Canvas 2D and a Lana 4.1.0 WebAssembly engine. It needs no account or backend.

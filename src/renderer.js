const GRID_WIDTH = 100;
const GRID_HEIGHT = 60;
const STRIDE = 4;
const gridCanvas = document.createElement('canvas');
gridCanvas.width = GRID_WIDTH;
gridCanvas.height = GRID_HEIGHT;
const gridContext = gridCanvas.getContext('2d');
const image = gridContext.createImageData(GRID_WIDTH, GRID_HEIGHT);

function channel(n, hue, lightness, chroma) {
  const k = (n + hue / 30) % 12;
  return 255 * (lightness - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
}

export function render(canvas, states) {
  const pixels = image.data;
  for (let index = 0; index < GRID_WIDTH * GRID_HEIGHT; index += 1) {
    const offset = index * STRIDE;
    const p = states[offset];
    if (p <= 0) {
      pixels[offset] = 8;
      pixels[offset + 1] = 7;
      pixels[offset + 2] = 17;
    } else {
      const hue = 215 + ((states[offset + 1] + 1) / 2) * 170;
      const lightness = (5 + p * 70) / 100;
      const chroma = 0.82 * Math.min(lightness, 1 - lightness);
      pixels[offset] = channel(0, hue, lightness, chroma);
      pixels[offset + 1] = channel(8, hue, lightness, chroma);
      pixels[offset + 2] = channel(4, hue, lightness, chroma);
    }
    pixels[offset + 3] = 255;
  }
  gridContext.putImageData(image, 0, 0);
  const context = canvas.getContext('2d', { alpha: false });
  context.imageSmoothingEnabled = false;
  context.drawImage(gridCanvas, 0, 0, canvas.width, canvas.height);
}

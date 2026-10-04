const GRID_WIDTH = 100;
const GRID_HEIGHT = 60;
const STRIDE = 4;

export function render(canvas, states) {
  const context = canvas.getContext('2d', { alpha: false });
  const cellWidth = canvas.width / GRID_WIDTH;
  const cellHeight = canvas.height / GRID_HEIGHT;
  context.fillStyle = '#080711';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      const offset = (y * GRID_WIDTH + x) * STRIDE;
      const p = states[offset];
      if (p <= 0) continue;
      const d = states[offset + 1];
      const hue = 215 + ((d + 1) / 2) * 170;
      const lightness = 5 + p * 70;
      context.fillStyle = `hsl(${hue} 82% ${lightness}%)`;
      context.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
  }
}

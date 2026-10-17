import * as lana from './lanaBridge.js';
import { render } from './renderer.js';
import { attachPainting } from './input.js';

const WIDTH = 100;
const HEIGHT = 60;
const STEP = 1 / 30;
const canvas = document.querySelector('#canvas');
const status = document.querySelector('#status');
const playPause = document.querySelector('#play-pause');
const brushShape = document.querySelector('#brush-shape');
const controls = Object.fromEntries(
  ['brush-size', 'intensity', 'influence', 'spread', 'decay', 'memory']
    .map((id) => [id, document.getElementById(id)]),
);

let playing = true;
let lastFrame = null;
let accumulated = 0;
let lastRendered = null;

function number(id) { return Number(controls[id].value); }

function updateReadout(id) {
  const value = number(id);
  const formatted = id === 'brush-size' ? String(value)
    : id === 'influence' ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
      : value.toFixed(2);
  document.getElementById(`${id}-value`).textContent = formatted;
}

for (const id of Object.keys(controls)) {
  controls[id].addEventListener('input', () => updateReadout(id));
  updateReadout(id);
}

function frame(timestamp) {
  if (lastFrame === null) lastFrame = timestamp;
  const elapsed = (timestamp - lastFrame) / 1000;
  lastFrame = timestamp;
  if (playing && elapsed < 0.5) {
    accumulated = Math.min(accumulated + elapsed, STEP);
    try {
      if (accumulated >= STEP) {
        lana.tick(STEP, number('spread'), number('decay'), number('memory'));
        accumulated -= STEP;
      }
    } catch (error) {
      playing = false;
      playPause.textContent = 'Play';
      playPause.setAttribute('aria-pressed', 'true');
      status.textContent = `Simulation stopped: ${error.message || error}`;
    }
  }
  const states = lana.getStateBuffer();
  if (states !== lastRendered) {
    render(canvas, states);
    lastRendered = states;
  }
  requestAnimationFrame(frame);
}

playPause.addEventListener('click', () => {
  playing = !playing;
  accumulated = 0;
  lastFrame = null;
  playPause.textContent = playing ? 'Pause' : 'Play';
  playPause.setAttribute('aria-pressed', String(!playing));
});

document.querySelector('#clear').addEventListener('click', () => {
  lana.clear();
  accumulated = 0;
  render(canvas, lana.getStateBuffer());
});

document.querySelector('#export').addEventListener('click', () => {
  render(canvas, lana.getStateBuffer());
  canvas.toBlob((blob) => {
    if (!blob) { status.textContent = 'PNG export failed'; return; }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'living-canvas.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
});

try {
  await lana.initialize(WIDTH, HEIGHT);
  for (const button of document.querySelectorAll('.actions button')) button.disabled = false;
  attachPainting(canvas,
    () => ({ shape: brushShape.value, size: number('brush-size'), p: number('intensity'), d: number('influence') }),
    lana.paint);
  status.textContent = '';
  requestAnimationFrame(frame);
} catch (error) {
  status.textContent = `Lana could not load: ${error.message || error}`;
}

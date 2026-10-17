import initWasm, { LivingCanvasEngine } from '../dist/living_canvas_wasm.js';

let engine = null;
let stateBuffer = null;
let dirty = false;

function requireEngine() {
  if (!engine) throw new Error('Lana is not initialized');
  return engine;
}

export async function initialize(width, height) {
  await initWasm();
  engine = new LivingCanvasEngine(width, height);
  dirty = true;
}

export function paint(x, y, radius, p, d, shape) {
  requireEngine().paint(x, y, radius, p, d, shape);
  dirty = true;
}

export function tick(dt, spread, decay, memory) {
  requireEngine().tick(dt, spread, decay, memory);
  dirty = true;
}

export function clear() {
  requireEngine().clear();
  dirty = true;
}

export function getStateBuffer() {
  if (dirty) {
    stateBuffer = requireEngine().get_state_buffer();
    dirty = false;
  }
  return stateBuffer;
}

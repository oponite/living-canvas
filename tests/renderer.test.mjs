import assert from 'node:assert/strict';
import test from 'node:test';

let image;
let uploads = 0;
let draws = 0;
globalThis.document = {
  createElement: () => ({
    getContext: () => ({
      createImageData: () => ({ data: new Uint8ClampedArray(100 * 60 * 4) }),
      putImageData(value) { image = value; uploads += 1; },
    }),
  }),
};
const { render } = await import('../src/renderer.js');

test('renders the grid as one image with the existing colors', () => {
  const context = { drawImage() { draws += 1; } };
  const canvas = { width: 1200, height: 720, getContext: () => context };
  const states = new Float32Array(100 * 60 * 4);
  states[4] = 0.5;
  states[5] = 0;

  render(canvas, states);

  assert.deepEqual([...image.data.slice(0, 8)], [8, 7, 17, 255, 186, 18, 186, 255]);
  assert.equal(context.imageSmoothingEnabled, false);
  assert.equal(uploads, 1);
  assert.equal(draws, 1);
});

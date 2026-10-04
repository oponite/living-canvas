const GRID_WIDTH = 100;
const GRID_HEIGHT = 60;

export function attachPainting(canvas, getBrush, paint) {
  let pointerId = null;
  let previous = null;

  function position(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(GRID_WIDTH, (event.clientX - bounds.left) * GRID_WIDTH / bounds.width)),
      y: Math.max(0, Math.min(GRID_HEIGHT, (event.clientY - bounds.top) * GRID_HEIGHT / bounds.height)),
    };
  }

  function stroke(point) {
    const brush = getBrush();
    if (previous) {
      const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
      const steps = Math.max(1, Math.ceil(distance / Math.max(0.5, brush.size / 3)));
      for (let index = 1; index <= steps; index += 1) {
        const fraction = index / steps;
        paint(previous.x + (point.x - previous.x) * fraction,
          previous.y + (point.y - previous.y) * fraction, brush.size, brush.p, brush.d);
      }
    } else {
      paint(point.x, point.y, brush.size, brush.p, brush.d);
    }
    previous = point;
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || pointerId !== null) return;
    pointerId = event.pointerId;
    canvas.setPointerCapture(pointerId);
    previous = null;
    stroke(position(event));
    event.preventDefault();
  });

  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    stroke(position(event));
  });

  function stop(event) {
    if (event.pointerId !== pointerId) return;
    if (event.type === 'pointerup') stroke(position(event));
    pointerId = null;
    previous = null;
  }

  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
  canvas.addEventListener('lostpointercapture', stop);
}

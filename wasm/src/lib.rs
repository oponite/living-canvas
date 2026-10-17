use std::sync::Arc;

use lana_bytecode::{loader, Chunk, LanaError};
use lana_vm::{state, Vm};
use serde::Serialize;
use wasm_bindgen::prelude::*;

const WIDTH: usize = 100;
const HEIGHT: usize = 60;
const CELLS: usize = WIDTH * HEIGHT;
const STRIDE: usize = 4;
const BYTECODE: &[u8] = include_bytes!("../../dist/living_canvas.labc");

#[derive(Serialize)]
struct TickRequest<'a> {
    cells: &'a [[f32; 3]],
    dt: f64,
    spread: f64,
    decay: f64,
    memory: f64,
}

#[wasm_bindgen]
pub struct LivingCanvasEngine {
    chunk: Arc<Chunk>,
    current: Vec<f32>,
    next: Vec<f32>,
}

#[wasm_bindgen]
impl LivingCanvasEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> Result<LivingCanvasEngine, JsValue> {
        if width != WIDTH || height != HEIGHT {
            return Err(JsValue::from_str("Living Canvas requires a 100 x 60 grid"));
        }
        let chunk = loader::load(BYTECODE).map_err(|error| JsValue::from_str(&error.message))?;
        Ok(Self {
            chunk: Arc::new(chunk),
            current: vec![0.0; CELLS * STRIDE],
            next: vec![0.0; CELLS * STRIDE],
        })
    }

    pub fn paint(&mut self, x: f64, y: f64, radius: f64, p: f64, d: f64, shape: &str) -> Result<(), JsValue> {
        if !x.is_finite() || !y.is_finite() || !radius.is_finite() || radius < 0.0 {
            return Err(JsValue::from_str("invalid brush position or radius"));
        }
        let mut painted = state::State::default();
        if state::make(p, d, &mut painted) != LanaError::Ok {
            return Err(JsValue::from_str("invalid STATE(p, d)"));
        }
        let square = match shape {
            "circle" => false,
            "square" => true,
            _ => return Err(JsValue::from_str("invalid brush shape")),
        };
        let left = ((x - radius).floor() as isize).max(0) as usize;
        let right = ((x + radius).ceil() as isize).min(WIDTH as isize - 1).max(-1);
        let top = ((y - radius).floor() as isize).max(0) as usize;
        let bottom = ((y + radius).ceil() as isize).min(HEIGHT as isize - 1).max(-1);
        if right < 0 || bottom < 0 { return Ok(()); }
        for row in top..=bottom as usize {
            for column in left..=right as usize {
                let dx = column as f64 + 0.5 - x;
                let dy = row as f64 + 0.5 - y;
                if (square && (dx.abs() > radius || dy.abs() > radius))
                    || (!square && dx * dx + dy * dy > radius * radius) { continue; }
                let offset = (row * WIDTH + column) * STRIDE;
                self.current[offset + 2] = self.current[offset];
                self.current[offset] = painted.p as f32;
                self.current[offset + 1] = painted.d_re as f32;
                self.current[offset + 3] = 0.0;
            }
        }
        Ok(())
    }

    pub fn tick(&mut self, dt: f64, spread: f64, decay: f64, memory: f64) -> Result<(), JsValue> {
        if !dt.is_finite() || dt <= 0.0 || dt > 1.0 / 30.0 + 1e-9
            || ![spread, decay, memory].iter().all(|value| value.is_finite() && (0.0..=1.0).contains(value))
        {
            return Err(JsValue::from_str("invalid simulation controls"));
        }
        let cells: Vec<[f32; 3]> = self.current.chunks_exact(STRIDE)
            .map(|cell| [cell[0], cell[1], cell[3]])
            .collect();
        let request = serde_json::to_string(&TickRequest {
            cells: &cells, dt, spread, decay, memory,
        }).map_err(|error| JsValue::from_str(&format!("input encoding failed: {error}")))?;

        let mut vm = Vm::new_owned(Arc::clone(&self.chunk));
        vm.set_program_args(&[request]);
        if vm.run() != LanaError::Ok {
            return Err(JsValue::from_str(&format!("Lana tick: {}", vm.error().message)));
        }
        let result = vm.result().map_err(|error| JsValue::from_str(error.name()))?;
        if result.type_name() != "string" {
            return Err(JsValue::from_str("Lana tick returned a non-string result"));
        }
        let values: Vec<f64> = serde_json::from_str(&result.as_string())
            .map_err(|error| JsValue::from_str(&format!("invalid Lana tick result: {error}")))?;
        if values.len() != CELLS * 3 {
            return Err(JsValue::from_str("Lana tick returned the wrong buffer length"));
        }
        for (index, cell) in values.chunks_exact(3).enumerate() {
            let offset = index * STRIDE;
            for (lane, value) in cell.iter().enumerate() {
                if !value.is_finite() { return Err(JsValue::from_str("Lana tick returned a non-finite number")); }
                self.next[offset + if lane == 2 { 3 } else { lane }] = *value as f32;
            }
            self.next[offset + 2] = self.current[offset];
        }
        std::mem::swap(&mut self.current, &mut self.next);
        Ok(())
    }

    pub fn clear(&mut self) {
        self.current.fill(0.0);
        self.next.fill(0.0);
    }

    pub fn get_state_buffer(&self) -> Vec<f32> {
        self.current.clone()
    }
}

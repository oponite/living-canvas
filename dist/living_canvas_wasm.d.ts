/* tslint:disable */
/* eslint-disable */
export class LivingCanvasEngine {
  free(): void;
  get_state_buffer(): Float32Array;
  constructor(width: number, height: number);
  tick(dt: number, spread: number, decay: number, memory: number): void;
  clear(): void;
  paint(x: number, y: number, radius: number, p: number, d: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_livingcanvasengine_free: (a: number, b: number) => void;
  readonly livingcanvasengine_clear: (a: number) => void;
  readonly livingcanvasengine_get_state_buffer: (a: number) => [number, number];
  readonly livingcanvasengine_new: (a: number, b: number) => [number, number, number];
  readonly livingcanvasengine_paint: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
  readonly livingcanvasengine_tick: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;

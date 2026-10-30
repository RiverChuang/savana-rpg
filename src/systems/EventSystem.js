export class EventSystem {
  #handlers = new Map();
  on(type, handler) {
    if (!this.#handlers.has(type)) this.#handlers.set(type, new Set());
    this.#handlers.get(type).add(handler);
    return () => this.#handlers.get(type)?.delete(handler);
  }
  emit(type, detail) {
    for (const handler of this.#handlers.get(type) || []) handler(detail);
    for (const handler of this.#handlers.get('*') || []) handler({ type, ...detail });
  }
}

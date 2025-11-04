// frontend/src/lib/eventBus.js
const bus = new EventTarget();

export function on(type, cb) {
  const fn = (e) => cb(e.detail);
  bus.addEventListener(type, fn);
  return () => bus.removeEventListener(type, fn);
}

export function emit(type, detail) {
  bus.dispatchEvent(new CustomEvent(type, { detail }));
}

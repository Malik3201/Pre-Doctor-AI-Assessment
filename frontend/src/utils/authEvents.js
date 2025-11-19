const listeners = new Set();

export function subscribeAuthLogout(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function triggerAuthLogout(payload) {
  listeners.forEach((listener) => listener(payload));
}


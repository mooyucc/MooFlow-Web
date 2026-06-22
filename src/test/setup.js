import { vi } from 'vitest';

function createStorage() {
  const store = new Map();
  return {
    get length() {
      return store.size;
    },
    key: (index) => [...store.keys()][index] ?? null,
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

global.localStorage = createStorage();
global.sessionStorage = createStorage();

const windowListeners = new Map();

global.window = {
  addEventListener: vi.fn((type, handler) => {
    if (!windowListeners.has(type)) windowListeners.set(type, new Set());
    windowListeners.get(type).add(handler);
  }),
  removeEventListener: vi.fn((type, handler) => {
    windowListeners.get(type)?.delete(handler);
  }),
  dispatchEvent: vi.fn((event) => {
    windowListeners.get(event.type)?.forEach((handler) => handler(event));
    return true;
  }),
  location: { href: 'http://localhost/', search: '', pathname: '/' },
  history: { replaceState: vi.fn() },
  open: vi.fn(),
};

vi.stubGlobal('innerWidth', 1200);
vi.stubGlobal('innerHeight', 800);

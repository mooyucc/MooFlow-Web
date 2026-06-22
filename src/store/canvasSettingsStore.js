import { create } from 'zustand';

export const DEFAULT_CANVAS_PROPS = {
  colorScheme: '彩虹',
  themeIndex: 1,
  backgroundColor: '#ebebeb',
  fontFamily: '默认',
  lineWidth: '默认',
  rainbowBranch: true,
  showGrid: true,
  snapToGrid: false,
  gridSize: 20,
  mainDirection: 'horizontal',
  showCriticalPath: false,
};

export const useCanvasSettingsStore = create((set) => ({
  canvasProps: { ...DEFAULT_CANVAS_PROPS },
  timeScale: 'month',

  setCanvasProps: (updater) => set((state) => ({
    canvasProps: typeof updater === 'function' ? updater(state.canvasProps) : updater,
  })),

  updateCanvasProps: (partial) => set((state) => ({
    canvasProps: { ...state.canvasProps, ...partial },
  })),

  setTimeScale: (timeScale) => set({ timeScale }),
}));

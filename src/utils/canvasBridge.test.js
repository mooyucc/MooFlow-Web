import { describe, it, expect, beforeEach } from 'vitest';
import { registerCanvasBridge, getCanvasBridge } from './canvasBridge';

describe('canvasBridge', () => {
  beforeEach(() => {
    registerCanvasBridge({ getSnappedPosition: null, cascadeUpdateDates: null });
  });

  it('registers and exposes bridge functions', () => {
    const snap = () => ({ x: 0, y: 0, lines: [] });
    const cascade = () => {};
    registerCanvasBridge({ getSnappedPosition: snap, cascadeUpdateDates: cascade });
    const bridge = getCanvasBridge();
    expect(bridge.getSnappedPosition).toBe(snap);
    expect(bridge.cascadeUpdateDates).toBe(cascade);
  });
});

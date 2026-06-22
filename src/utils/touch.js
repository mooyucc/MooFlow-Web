/** 判断触摸/点击目标是否为可交互 UI 元素 */
export function isTouchInteractiveTarget(el) {
  if (!el || !el.closest) return false;
  return !!el.closest(
    'button, input, textarea, select, a, [role="button"], .canvas-toolbar, .canvas-theme-toolbar, .filebar, .zoom-toolbar, .zoom-select, .format-btn, [data-task-id]'
  );
}

export function getTouchDistance(touches) {
  if (touches.length < 2) return 0;
  const [a, b] = touches;
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export function getTouchCenter(touches) {
  if (touches.length < 2) return { x: 0, y: 0 };
  const [a, b] = touches;
  return {
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2,
  };
}

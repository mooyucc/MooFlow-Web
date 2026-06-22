export function getShapeStrokeDasharray(style) {
  if (style === 'dashed') return '8,4';
  if (style === 'none') return '0';
  return undefined;
}

export function getTaskShadowStyle(task) {
  const shadowColor =
    task.importantLevel === 'important' ? '#e11d48' :
    task.importantLevel === 'secondary' ? '#ff9800' :
    '#222';
  const shadowOpacity =
    task.importantLevel === 'important' || task.importantLevel === 'secondary' ? 0.28 : 0.18;
  return { shadowColor, shadowOpacity };
}

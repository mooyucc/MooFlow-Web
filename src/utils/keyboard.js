const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'radio',
  'range',
  'reset',
  'submit',
]);

/** 当前焦点/事件目标是否为可编辑控件（应使用系统原生剪贴板与撤销快捷键） */
export function isEditableElement(el) {
  if (!el || el.nodeType !== 1) return false;

  const tag = el.tagName;
  if (tag === 'INPUT') {
    const type = (el.type || 'text').toLowerCase();
    if (NON_TEXT_INPUT_TYPES.has(type)) return false;
    return !el.readOnly && !el.disabled;
  }
  if (tag === 'TEXTAREA') return !el.readOnly && !el.disabled;
  if (tag === 'SELECT') return !el.disabled;
  if (el.isContentEditable) return true;
  return false;
}

/** 键盘事件是否发生在可编辑上下文中 */
export function isEditableKeyboardContext(event) {
  const candidates = [event.target, event.currentTarget, globalThis.document?.activeElement].filter(Boolean);
  return candidates.some(isEditableElement);
}

export function isModKey(event) {
  return event.metaKey || event.ctrlKey;
}

export function isMacPlatform() {
  return typeof navigator !== 'undefined'
    && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** 菜单快捷键展示，如 ⌘C / Ctrl+C */
export function modShortcut(key) {
  const letter = String(key).toUpperCase();
  return isMacPlatform() ? `⌘${letter}` : `Ctrl+${letter}`;
}

import { describe, expect, it } from 'vitest';
import { isEditableElement, isEditableKeyboardContext } from './keyboard';

function mockElement(overrides) {
  return {
    nodeType: 1,
    tagName: 'DIV',
    type: 'text',
    readOnly: false,
    disabled: false,
    isContentEditable: false,
    ...overrides,
  };
}

describe('keyboard utils', () => {
  it('treats text inputs as editable', () => {
    expect(isEditableElement(mockElement({ tagName: 'INPUT', type: 'text' }))).toBe(true);
  });

  it('ignores checkbox inputs', () => {
    expect(isEditableElement(mockElement({ tagName: 'INPUT', type: 'checkbox' }))).toBe(false);
  });

  it('detects editable keyboard context from event target', () => {
    const input = mockElement({ tagName: 'INPUT', type: 'text' });
    const event = { target: input, activeElement: null };
    expect(isEditableKeyboardContext(event)).toBe(true);
  });
});

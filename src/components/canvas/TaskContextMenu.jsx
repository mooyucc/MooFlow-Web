import React from 'react';
import { useTranslation } from '../../LanguageContext';
import { CopyIcon, CutIcon, PasteIcon } from '../icons/AppIcons';
import { hasTasksInClipboard } from '../../store/taskStore';
import { modShortcut } from '../../utils/keyboard';
import './TaskContextMenu.css';

const TaskContextMenu = ({ contextMenu, onClose, onCopy, onCut, onPaste }) => {
  const [t] = useTranslation();

  if (!contextMenu) return null;

  const canPaste = hasTasksInClipboard();

  const handleAction = (action) => {
    action(contextMenu.taskId);
    onClose();
  };

  const items = [
    { key: 'copy', label: t('copy'), icon: CopyIcon, shortcut: modShortcut('c'), action: onCopy },
    { key: 'cut', label: t('cut'), icon: CutIcon, shortcut: modShortcut('x'), action: onCut },
    { key: 'paste', label: t('paste'), icon: PasteIcon, shortcut: modShortcut('v'), action: onPaste, disabled: !canPaste },
  ];

  return (
    <div
      className="task-context-menu"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onMouseLeave={onClose}
      role="menu"
    >
      {items.map(({ key, label, icon: Icon, shortcut, action, disabled }) => (
        <button
          key={key}
          type="button"
          className="task-context-menu__item"
          role="menuitem"
          disabled={disabled}
          onClick={() => !disabled && handleAction(action)}
        >
          <span className="task-context-menu__icon" aria-hidden="true">
            <Icon />
          </span>
          <span className="task-context-menu__label">{label}</span>
          <span className="task-context-menu__shortcut">{shortcut}</span>
        </button>
      ))}
    </div>
  );
};

export default TaskContextMenu;

import { useEffect } from 'react';
import { hasTasksInClipboard, useTaskStore } from '../../store/taskStore';
import { isEditableKeyboardContext, isModKey } from '../../utils/keyboard';

/**
 * 画布键盘：RF onNodesDelete 负责删节点；此处处理连线删除、剪贴板、Tab 建子任务等
 */
export function useFlowKeyboard({
  tasks,
  isEditing,
  selectedElement,
  hasSelectedTasks,
  handleAddTask,
  handleCopySelected,
  handleCutSelected,
  deleteSelectedLink,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
      }
    };
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedElement?.type !== 'task') return;
      if (isEditableKeyboardContext(e)) return;
      const isAnyTaskEditing = tasks.some(task => {
        const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
        if (!taskElement) return false;
        const input = taskElement.querySelector('input');
        return input && document.activeElement === input;
      });
      if (isAnyTaskEditing || isEditing) return;
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleAddTask();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, tasks, isEditing, handleAddTask]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditing) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (selectedElement?.type === 'link') {
        deleteSelectedLink();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteSelectedLink, isEditing]);

  useEffect(() => {
    const handler = (e) => {
      if (isEditing || isEditableKeyboardContext(e)) return;
      if (!isModKey(e)) return;

      const k = e.key.toLowerCase();
      if (k === 'z') {
        e.preventDefault();
        if (e.shiftKey) useTaskStore.getState().redo();
        else useTaskStore.getState().undo();
        return;
      }
      if (k === 'y' && e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        useTaskStore.getState().redo();
        return;
      }

      if (e.shiftKey) return;

      if (k === 'c') {
        if (!hasSelectedTasks) return;
        e.preventDefault();
        handleCopySelected();
      } else if (k === 'x') {
        if (!hasSelectedTasks) return;
        e.preventDefault();
        handleCutSelected();
      } else if (k === 'v') {
        if (!hasTasksInClipboard()) return;
        e.preventDefault();
        const ctxId = selectedElement?.type === 'task' ? selectedElement.id : null;
        if (ctxId) {
          useTaskStore.getState().pasteTasksFromClipboard(ctxId, true, { x: 40, y: 40 });
        } else {
          useTaskStore.getState().pasteTasksFromClipboard(null, false, { x: 40, y: 40 }, { forceIndependentTopLevel: true });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isEditing, selectedElement, hasSelectedTasks, handleCopySelected, handleCutSelected]);
}

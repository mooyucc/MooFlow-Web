import { useState, useEffect, useCallback } from 'react';
import { getDisplayTitle, resolveTitleForSave } from '../../utils/taskNodeText';

export function useTaskNodeEdit({ task, selected, t, updateTask, onEditingChange }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(() => getDisplayTitle(task, t));

  const syncDisplayTitle = useCallback(() => getDisplayTitle(task, t), [task, t]);

  useEffect(() => {
    if (!editing) setTitle(syncDisplayTitle());
  }, [editing, syncDisplayTitle]);

  useEffect(() => {
    if (typeof onEditingChange === 'function') onEditingChange(editing);
  }, [editing, onEditingChange]);

  const startEditing = useCallback((e) => {
    setEditing(true);
    setTitle(syncDisplayTitle());
    e?.stopPropagation?.();
  }, [syncDisplayTitle]);

  const commitEdit = useCallback(() => {
    setEditing(false);
    updateTask(task.id, { title: resolveTitleForSave(title, task.title, t) });
  }, [task.id, task.title, t, title, updateTask]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setTitle(syncDisplayTitle());
  }, [syncDisplayTitle]);

  const handleKeyDown = useCallback((e) => {
    if (editing && e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (selected && !editing && e.key === ' ' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      startEditing();
    }
  }, [editing, selected, startEditing]);

  useEffect(() => {
    if (!selected) return undefined;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, selected]);

  useEffect(() => {
    if (!editing) return undefined;
    const handleGlobalKeyDown = (e) => {
      if (e.key !== 'Enter') return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [editing]);

  return {
    editing,
    title,
    setTitle,
    startEditing,
    commitEdit,
    cancelEdit,
  };
}

import React, { useState, useRef } from 'react';
import { useTaskStore } from '../store/taskStore';
import './CanvasToolbar.css';
import { useTranslation } from '../LanguageContext';

// 简单Tooltip组件
const Tooltip = ({ text, children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: '120%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(40,40,40,0.95)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};

const SCALE_OPTIONS = [0.5, 0.75, 1, 1.5, 2];

// 撤销和重做恢复为原来的风格
const UndoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8L6 14L12 20"/><path d="M6 14H18C22.4183 14 26 17.5817 26 22C26 26.4183 22.4183 30 18 30H10"/></svg>
);
const RedoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 8L26 14L20 20"/><path d="M26 14H14C9.58172 14 6 17.5817 6 22C6 26.4183 9.58172 30 14 30H22"/></svg>
);
const AddIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const LinkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 1 7 7l-1 1a5 5 0 0 1-7-7" />
    <path d="M14 11a5 5 0 0 0-7-7l-1 1a5 5 0 0 0 7 7" />
  </svg>
);
const FitIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <rect x="8" y="8" width="8" height="8" rx="2" />
  </svg>
);
const MinusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="18" y2="12" />
  </svg>
);
const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="6" x2="12" y2="18" />
    <line x1="6" y1="12" x2="18" y2="12" />
  </svg>
);
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4,6 8,10 12,6" />
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5" />
    <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5" />
  </svg>
);
// 子任务图标
const ChildTaskIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="9" r="5" fill="currentColor" />
    <circle cx="16" cy="23" r="5" fill="none" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);
// 细分任务图标
const SiblingTaskIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="16" r="5" fill="currentColor" />
    <circle cx="23" cy="16" r="5" fill="none" stroke="currentColor" strokeWidth="2.2" />
  </svg>
);

// 修改props定义，移除onAddChildTask和onAddSiblingTask，只保留onAddTask
const CanvasToolbar = ({ onStartLink, onSetScale, onFitView, onAlignToTimeline, scale, onAddTask, hasSelectedTask, onAutoArrange }) => {
  const addTask = useTaskStore((state) => state.addTask);
  const undo = useTaskStore((state) => state.undo);
  const redo = useTaskStore((state) => state.redo);
  const undoStack = useTaskStore((state) => state.undoStack);
  const redoStack = useTaskStore((state) => state.redoStack);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [t] = useTranslation();

  // 缩放减小
  const handleZoomOut = () => {
    const idx = SCALE_OPTIONS.findIndex(s => s >= scale) - 1;
    if (idx >= 0) onSetScale(SCALE_OPTIONS[idx]);
  };
  // 缩放放大
  const handleZoomIn = () => {
    const idx = SCALE_OPTIONS.findIndex(s => s > scale);
    if (idx !== -1) onSetScale(SCALE_OPTIONS[idx]);
  };
  // 选择缩放
  const handleSelectScale = (s) => {
    onSetScale(s);
    setDropdownOpen(false);
  };
  // 点击外部关闭下拉
  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleAddTask = () => {
    const id = Date.now();
    addTask({
      id,
      title: "新任务",
      position: { x: 200, y: 200 },
      links: []
    });
  };

  return (
    <div className="canvas-toolbar minimal" style={{ touchAction: 'manipulation' }}>
      <Tooltip text={t('undo')}>
        <button className="toolbar-btn" onClick={undo} disabled={undoStack.length === 0} style={undoStack.length === 0 ? {opacity: 0.4, cursor: 'not-allowed'} : {}}>
          <div style={{marginTop:-3}}><UndoIcon /></div>
        </button>
      </Tooltip>
      <Tooltip text={t('redo')}>
        <button className="toolbar-btn" onClick={redo} disabled={redoStack.length === 0} style={redoStack.length === 0 ? {opacity: 0.4, cursor: 'not-allowed'} : {}}>
          <div style={{marginTop:-3}}><RedoIcon /></div>
        </button>
      </Tooltip>
      <div className="toolbar-divider" />
      <Tooltip text={t('add_task')}>
        <button className="toolbar-btn" onClick={onAddTask} disabled={!hasSelectedTask} style={!hasSelectedTask ? {opacity: 0.4, cursor: 'not-allowed'} : {}}>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <AddIcon />
            <div style={{fontSize:12, marginLeft: 6}}>{t('add_task')}</div>
          </div>
        </button>
      </Tooltip>
      <div className="toolbar-divider" />
      <div className="zoom-toolbar">
        <Tooltip text={t('zoom_out')}>
          <button className="zoom-btn" onClick={handleZoomOut}><MinusIcon /></button>
        </Tooltip>
        <div className="zoom-select" onClick={() => setDropdownOpen(v => !v)} ref={dropdownRef}>
          {`${Math.round(scale * 100)}%`} <span className="arrow"><ArrowIcon /></span>
          {dropdownOpen && (
            <div className="zoom-dropdown">
              {SCALE_OPTIONS.map(opt => (
                <div key={opt} className={opt === scale ? 'active' : ''} onClick={() => handleSelectScale(opt)}>
                  {Math.round(opt * 100)}%
                </div>
              ))}
            </div>
          )}
        </div>
        <Tooltip text={t('zoom_in')}>
          <button className="zoom-btn" onClick={handleZoomIn}><PlusIcon /></button>
        </Tooltip>
      </div>
      <div className="toolbar-divider" />
      <Tooltip text={t('fit_view')}>
        <button className="toolbar-btn" onClick={onFitView}>
          <FitIcon />
        </button>
      </Tooltip>
      <Tooltip text={t('refresh_align')}>
        <button className="toolbar-btn" onClick={onAlignToTimeline}>
          <RefreshIcon />
        </button>
      </Tooltip>
    </div>
  );
};

export default CanvasToolbar; 
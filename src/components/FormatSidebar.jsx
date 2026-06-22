import React, { useState, useEffect, useRef } from 'react';
import { useTaskStore, defaultTaskStyle } from '../store/taskStore';
import { useTranslation } from '../LanguageContext';
import { SHAPES } from '../constants/shapes';
import { applyPaletteToTasks } from '../utils/taskPalette';
import { EmptySelectionIcon } from './icons/AppIcons';
import FormatCanvasTab from './formatSidebar/FormatCanvasTab';
import FormatTaskStylePanel from './formatSidebar/FormatTaskStylePanel';
import FormatLinkStylePanel from './formatSidebar/FormatLinkStylePanel';
import './FormatSidebar.css';

const FormatSidebar = ({
  visible,
  onClose,
  canvasProps,
  onCanvasChange,
  selectedTask,
  selectedTasks = [],
  selectedTaskIds = [],
  selectedLink = null,
  onTaskStyleChange,
  onBranchStyleChange,
  paletteIdx,
  onPaletteChange,
}) => {
  const [t] = useTranslation();
  const tasks = useTaskStore(state => state.tasks);

  const [tab, setTab] = useState('canvas');
  const [popupVisible, setPopupVisible] = useState(false);
  const popupRef = useRef(null);

  const [localProps, setLocalProps] = useState(canvasProps);
  const [localTaskStyle, setLocalTaskStyle] = useState(selectedTask);

  const fillPickerRef = useRef(null);
  const borderPickerRef = useRef(null);
  const bgPickerRef = useRef(null);
  const fontPickerRef = useRef(null);
  const branchPickerRef = useRef(null);

  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0 });

  const [hoveredShapeIdx, setHoveredShapeIdx] = useState(-1);
  const currentShape = SHAPES.find(s => s.type === localTaskStyle?.shape) || SHAPES[0];

  useEffect(() => {
    setLocalProps(canvasProps);
  }, [canvasProps]);
  useEffect(() => {
    if (selectedTask) {
      setLocalTaskStyle({ ...defaultTaskStyle, ...selectedTask });
    } else {
      setLocalTaskStyle(null);
    }
    if (!selectedTask) {
      setColorPickerOpen(null);
      setShapeMenuOpen(false);
    }
  }, [selectedTask]);
  useEffect(() => {
    if (!selectedTasks || selectedTasks.length === 0) {
      setColorPickerOpen(null);
      setShapeMenuOpen(false);
    }
  }, [selectedTasks]);
  useEffect(() => {
    if (visible && (selectedTask || selectedTasks.length > 0)) {
      setTab('style');
    } else if (visible && selectedLink) {
      setTab('style');
    } else if (visible && (!selectedTask && selectedTasks.length === 0 && !selectedLink)) {
      setTab('canvas');
    }
  }, [visible, selectedTask, selectedTasks, selectedLink]);
  useEffect(() => {
    if (!selectedLink) {
      setColorPickerOpen(null);
      setShapeMenuOpen(false);
    }
  }, [selectedLink]);

  const handleChange = (key, value) => {
    const updated = { ...localProps, [key]: value };
    setLocalProps(updated);
    onCanvasChange && onCanvasChange(updated);
  };

  function getMultiValue(key) {
    if (!selectedTasks || selectedTasks.length === 0) return '';
    const first = selectedTasks[0]?.[key];
    if (selectedTasks.every(t => t[key] === first)) return first;
    return '';
  }

  const handleTaskStyleChange = (key, value) => {
    setLocalTaskStyle(prev => ({ ...prev, [key]: value }));
    onTaskStyleChange && onTaskStyleChange(key, value);
  };

  useEffect(() => {
    if (visible) {
      setTimeout(() => setPopupVisible(true), 10);
    } else {
      setPopupVisible(false);
    }
  }, [visible]);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);

  useEffect(() => {
    if (!shapeMenuOpen) return;
    const handleClickOutside = (e) => {
      if (popupRef.current) {
        const menu = popupRef.current.querySelector('.format-sidebar__shape-menu');
        if (menu && !menu.contains(e.target)) {
          const btn = popupRef.current.querySelector('.format-sidebar__shape-btn');
          if (btn && btn.contains(e.target)) return;
          setShapeMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shapeMenuOpen]);

  useEffect(() => {
    if (!colorPickerOpen) return;
    const handleClickOutside = (e) => {
      if (colorPickerOpen === 'fill' && fillPickerRef.current && !fillPickerRef.current.contains(e.target)) {
        setColorPickerOpen(null);
      }
      if (colorPickerOpen === 'border' && borderPickerRef.current && !borderPickerRef.current.contains(e.target)) {
        setColorPickerOpen(null);
      }
      if (colorPickerOpen === 'bg' && bgPickerRef.current && !bgPickerRef.current.contains(e.target)) {
        setColorPickerOpen(null);
      }
      if (colorPickerOpen === 'font' && fontPickerRef.current && !fontPickerRef.current.contains(e.target)) {
        setColorPickerOpen(null);
      }
      if (colorPickerOpen === 'branch' && branchPickerRef.current && !branchPickerRef.current.contains(e.target)) {
        setColorPickerOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorPickerOpen]);

  const handleColorButtonClick = (type, event) => {
    if (colorPickerOpen === type) {
      setColorPickerOpen(null);
      return;
    }
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setColorPickerPosition({ top: buttonRect.top - 150 });
    setColorPickerOpen(type);
  };

  const handlePaletteChange = (idx) => {
    if (typeof onPaletteChange === 'function') onPaletteChange(idx);
    const { tasks: tasksAll, updateTask } = useTaskStore.getState();
    applyPaletteToTasks(tasksAll, idx, updateTask);
  };

  if (!visible) return null;

  return (
    <div
      ref={popupRef}
      className={`format-sidebar format-sidebar__panel${popupVisible ? ' format-sidebar__panel--visible' : ''}`}
      role="complementary"
      aria-label={t('style')}
    >
      <div className="format-sidebar__header">
        <div className="format-sidebar__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'canvas'}
            className={`format-sidebar__tab${tab === 'canvas' ? ' format-sidebar__tab--active' : ''}`}
            onClick={() => setTab('canvas')}
          >{t('canvas')}</button>
          <button
            role="tab"
            aria-selected={tab === 'style'}
            className={`format-sidebar__tab${tab === 'style' ? ' format-sidebar__tab--active' : ''}`}
            onClick={() => setTab('style')}
          >{t('style')}</button>
        </div>
      </div>

      <div
        className="format-sidebar__body"
        onWheel={e => e.stopPropagation()}
        onTouchMove={e => e.stopPropagation()}
      >
        {tab === 'canvas' && (
          <FormatCanvasTab
            t={t}
            localProps={localProps}
            handleChange={handleChange}
            paletteIdx={paletteIdx}
            handlePaletteChange={handlePaletteChange}
            handleColorButtonClick={handleColorButtonClick}
            colorPickerOpen={colorPickerOpen}
            setColorPickerOpen={setColorPickerOpen}
            colorPickerPosition={colorPickerPosition}
            popupRef={popupRef}
          />
        )}
        {tab === 'style' && (selectedTask || selectedTasks.length > 0) && (
          <FormatTaskStylePanel
            t={t}
            selectedTask={selectedTask}
            selectedTasks={selectedTasks}
            localTaskStyle={localTaskStyle}
            getMultiValue={getMultiValue}
            handleTaskStyleChange={handleTaskStyleChange}
            handleColorButtonClick={handleColorButtonClick}
            colorPickerOpen={colorPickerOpen}
            setColorPickerOpen={setColorPickerOpen}
            colorPickerPosition={colorPickerPosition}
            popupRef={popupRef}
            shapeMenuOpen={shapeMenuOpen}
            setShapeMenuOpen={setShapeMenuOpen}
            hoveredShapeIdx={hoveredShapeIdx}
            setHoveredShapeIdx={setHoveredShapeIdx}
            currentShape={currentShape}
            onTaskStyleChange={onTaskStyleChange}
          />
        )}
        {tab === 'style' && selectedLink && (
          <FormatLinkStylePanel
            t={t}
            selectedLink={selectedLink}
            selectedTasks={selectedTasks}
            tasks={tasks}
            onBranchStyleChange={onBranchStyleChange}
            handleColorButtonClick={handleColorButtonClick}
            colorPickerOpen={colorPickerOpen}
            setColorPickerOpen={setColorPickerOpen}
            colorPickerPosition={colorPickerPosition}
            popupRef={popupRef}
            branchPickerRef={branchPickerRef}
          />
        )}
        {tab === 'style' && !selectedTask && selectedTasks.length === 0 && !selectedLink && (
          <div className="format-sidebar__empty">
            <div className="format-sidebar__empty-icon" aria-hidden="true">
              <EmptySelectionIcon />
            </div>
            <p className="format-sidebar__empty-text">{t('no_card_selected')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormatSidebar;

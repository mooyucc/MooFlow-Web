import React, { useState, useEffect, useRef } from 'react';
import { SketchPicker } from 'react-color';
import { useTaskStore, defaultTaskStyle, defaultLinkStyle } from '../store/taskStore';
import PopupPortal from './PopupPortal';
import LayoutH from '../../assets/LayoutH.png';
import LayoutV from '../../assets/LayoutV.png';

const COLOR_SCHEMES = [
  { name: '彩虹', colors: ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4'] },
  { name: '蓝绿', colors: ['#1976d2', '#26a69a', '#80cbc4', '#b2dfdb', '#e0f2f1', '#00695c', '#0288d1'] },
  { name: '经典', colors: ['#3f51b5', '#e91e63', '#ffc107', '#009688', '#8bc34a', '#ff5722', '#607d8b'] },
];
const FONTS = [
  { label: '系统默认', value: '-apple-system, BlinkMacSystemFont, Segoe UI, Microsoft YaHei, Arial, sans-serif' },
  { label: '宋体', value: '宋体' },
  { label: '微软雅黑', value: '微软雅黑' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Roboto', value: 'Roboto' },
];
const LINE_WIDTHS = [
  { label: '细', value: 1 },
  { label: '默认', value: 2 },
  { label: '中', value: 3 },
  { label: '粗', value: 4 }
];

// 边框线形选项
const LINE_STYLES = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' }
];

// 箭头样式选项
const ARROW_STYLES = [
  { label: '标准', value: 'normal', icon: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 10h12m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg> },
  { label: '圆形', value: 'circle', icon: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 10h9" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="15" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg> },
  { label: '菱形', value: 'diamond', icon: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 10h12l-6-4 6 4-6 4z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg> },
  { label: '无箭头', value: 'none', icon: <svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 10h12" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg> }
];

// 常用流程图形状及SVG
const SHAPES = [
  { type: 'roundRect', name: '圆角矩形', icon: <svg width="28" height="20"><rect x="3" y="3" width="22" height="14" rx="5" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'rect', name: '矩形', icon: <svg width="28" height="20"><rect x="3" y="3" width="22" height="14" rx="0" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'ellipse', name: '椭圆', icon: <svg width="28" height="20"><ellipse cx="14" cy="10" rx="11" ry="7" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'circle', name: '圆形', icon: <svg width="28" height="20"><ellipse cx="14" cy="10" rx="8" ry="8" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'diamond', name: '菱形', icon: <svg width="28" height="20"><polygon points="14,3 24,10 14,17 4,10" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'parallelogram', name: '平行四边形', icon: <svg width="28" height="20"><polygon points="7,3 24,3 20,17 3,17" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'hexagon', name: '六边形', icon: <svg width="28" height="20"><polygon points="7,3 21,3 24,10 21,17 7,17 4,10" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'pentagon', name: '五边形', icon: <svg width="28" height="20"><polygon points="14,2 21.6,7.5 18.7,16.5 9.3,16.5 6.4,7.5" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'trapezoid', name: '梯形', icon: <svg width="28" height="20"><polygon points="8,3 20,3 24,17 4,17" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'document', name: '文档', icon: <svg width="28" height="20"><path d="M5,5 H23 Q24,5 24,8 V14 Q24,17 21,17 H7 Q5,17 5,14 V8 Q5,5 8,5 Z" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'flag', name: '旗帜', icon: <svg width="28" height="20"><path d="M5,5 L23,5 L20,10 L23,15 L5,15 Z" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'arrowRight', name: '右箭头', icon: <svg width="28" height="20"><polygon points="5,10 17,10 17,6 24,10 17,14 17,10 5,10" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'arrowLeft', name: '左箭头', icon: <svg width="28" height="20"><polygon points="23,10 11,10 11,6 4,10 11,14 11,10 23,10" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
  { type: 'doubleArrow', name: '双箭头', icon: <svg width="28" height="20"><polygon points="4,10 8,6 8,9 20,9 20,6 24,10 20,14 20,11 8,11 8,14 4,10" stroke="var(--shape-stroke)" strokeWidth="1.5" fill="none"/></svg> },
];

// 1. 新增配色方案数据
const COLOR_PALETTES = [
  { name: '律动', colors: ['#F15A4A', '#F6C244', '#5DBA4A', '#3A9BDB', '#3B53C4', '#D94A8A'] },
  { name: '永恒', colors: ['#3B53C4', '#F15A4A', '#F6C244', '#5DBA4A', '#3A9BDB', '#A24AD9'] },
  { name: '花海', colors: ['#A12B3A', '#5DBA4A', '#3A9BDB', '#1B3A5B', '#A24AD9', '#4A1B3A'] },
  { name: '绚丽', colors: ['#F15A4A', '#F6C244', '#3A9BDB', '#3B53C4', '#A24AD9', '#D94A8A'] },
  { name: '香水', colors: ['#A18B4A', '#5DBA4A', '#3A9BDB', '#3B53C4', '#A24AD9', '#4A1B3A'] },
  { name: '奶油', colors: ['#3A9BDB', '#3B53C4', '#F15A4A', '#F6C244', '#5DBA4A', '#1BC4A1'] },
  { name: '珊瑚', colors: ['#F15A4A', '#F6C244', '#5DBA4A', '#3A9BDB', '#A24AD9', '#D94A8A'] },
  { name: '香槟', colors: ['#C4BBA1', '#B4C4A1', '#A1C4B4', '#A1B4C4', '#C4A1B4', '#B4A1C4'] },
  { name: '禅心', colors: ['#FFFFFF', '#E0E0E0', '#B0B0B0', '#707070', '#303030', '#000000'] },
];

const FormatSidebar = ({
  visible,
  onClose,
  canvasProps,
  onCanvasChange,
  selectedTask,
  selectedTasks = [],
  selectedTaskIds = [],
  onTaskStyleChange,
  onBranchStyleChange,
  branchStyle = {},
  paletteIdx,
  onPaletteChange
}) => {
  const tasks = useTaskStore(state => state.tasks);

  // 辅助函数：找到指向目标任务的连线
  const getIncomingLink = (taskId, allTasks) => {
    if (!taskId) return null;
    // 找到链接到当前选中任务的源头任务
    const sourceTask = allTasks.find(source => 
      (source.links || []).some(link => link.toId === taskId)
    );
    if (!sourceTask) return null;
    
    // 返回实际的连线对象
    return (sourceTask.links || []).find(l => l.toId === taskId) || null;
  };

  // 辅助函数：获取分支样式，支持单选和多选
  const getBranchStyleValue = (key) => {
    if (selectedTasks && selectedTasks.length > 0) {
      const firstLink = getIncomingLink(selectedTasks[0].id, tasks);
      const firstValue = firstLink?.[key] ?? defaultLinkStyle[key];

      if (selectedTasks.length === 1) {
        return firstValue;
      }

      const allSame = selectedTasks.slice(1).every(task => {
        const link = getIncomingLink(task.id, tasks);
        return (link?.[key] ?? defaultLinkStyle[key]) === firstValue;
      });
      
      // 对于下拉选择器和颜色按钮，如果值不同，返回一个可识别的 "混合" 状态
      // 对于 select，返回一个默认值。对于 color，返回一个默认颜色。
      return allSame ? firstValue : defaultLinkStyle[key];
    }
    return defaultLinkStyle[key];
  };

  // Tab页状态：canvas/style
  const [tab, setTab] = useState('canvas');
  // 动画状态
  const [popupVisible, setPopupVisible] = useState(false);
  const popupRef = useRef(null);

  // 本地状态用于表单编辑
  const [localProps, setLocalProps] = useState(canvasProps);
  // 新增本地卡片样式状态
  const [localTaskStyle, setLocalTaskStyle] = useState(selectedTask);

  // 在组件顶部添加引用
  const fillPickerRef = useRef(null);
  const borderPickerRef = useRef(null);
  const bgPickerRef = useRef(null);
  const fontPickerRef = useRef(null);

  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0 });

  const [palettePopupOpen, setPalettePopupOpen] = useState(false);
  const [hoveredShapeIdx, setHoveredShapeIdx] = useState(-1);
  const currentShape = SHAPES.find(s => s.type === localTaskStyle?.shape) || SHAPES[0];

  const paletteBtnRef = useRef(null);
  const [palettePopupPosition, setPalettePopupPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    setLocalProps(canvasProps);
  }, [canvasProps]);
  useEffect(() => {
    // 当选中任务变更时，确保本地样式对象包含所有默认样式
    if (selectedTask) {
      setLocalTaskStyle({ ...defaultTaskStyle, ...selectedTask });
    } else {
      setLocalTaskStyle(null);
    }
    // 当卡片取消选择时（selectedTask 变为 null 或 undefined）关闭所有弹窗
    if (!selectedTask) {
      setColorPickerOpen(null);
      setShapeMenuOpen(false);
    }
  }, [selectedTask]);
  // 新增：当多选卡片数组变为空时也关闭弹窗
  useEffect(() => {
    if (!selectedTasks || selectedTasks.length === 0) {
      setColorPickerOpen(null);
      setShapeMenuOpen(false);
    }
  }, [selectedTasks]);
  // 新增：选中任务卡片时自动切换到样式Tab
  useEffect(() => {
    if (visible && selectedTask) {
      setTab('style');
    } else if (visible && (!selectedTask && (!selectedTasks || selectedTasks.length === 0))) {
      setTab('canvas');
    }
  }, [visible, selectedTask, selectedTasks]);

  // 处理属性变更
  const handleChange = (key, value) => {
    const updated = { ...localProps, [key]: value };
    setLocalProps(updated);
    onCanvasChange && onCanvasChange(updated);
  };
  // 新增：多选属性辅助函数
  function getMultiValue(key) {
    if (!selectedTasks || selectedTasks.length === 0) return '';
    const first = selectedTasks[0]?.[key];
    if (selectedTasks.every(t => t[key] === first)) return first;
    return '';
  }
  // 处理卡片样式变更
  const handleTaskStyleChange = (key, value) => {
    setLocalTaskStyle(prev => ({ ...prev, [key]: value }));
    onTaskStyleChange && onTaskStyleChange(key, value);
  };

  // 动画控制
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
        const menu = popupRef.current.querySelector('.shape-dropdown-menu');
        if (menu && !menu.contains(e.target)) {
          setShapeMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shapeMenuOpen]);

  // 在 useEffect 区域添加监听弹窗外点击关闭逻辑
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
      // 新增：字体颜色选择器
      if (colorPickerOpen === 'font' && fontPickerRef.current && !fontPickerRef.current.contains(e.target)) {
        setColorPickerOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorPickerOpen]);

  // 修改颜色按钮的点击处理函数
  const handleColorButtonClick = (type, event) => {
    // 如果已经打开，则关闭
    if (colorPickerOpen === type) {
      setColorPickerOpen(null);
      return;
    }
    
    // 获取点击位置，并上移150px
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setColorPickerPosition({
      top: buttonRect.top - 150,
    });
    setColorPickerOpen(type);
  };

  // 新增：自动同步主线任务及下属任务颜色的 onPaletteChange 包装
  const handlePaletteChange = (idx) => {
    if (typeof onPaletteChange === 'function') onPaletteChange(idx);
    // 自动刷新主线任务及下属任务颜色
    const tasksAll = useTaskStore.getState().tasks;
    const updateTask = useTaskStore.getState().updateTask;
    // 找到所有主线任务（parentId为null），并排除中心任务
    const centerTask = tasksAll.find(t => t.parentId === null);
    const mainTasks = tasksAll.filter(t => t.parentId === null && t.id !== centerTask?.id);
    // 递归获取所有下属任务id
    function collectDescendantIds(parentId, collected = new Set()) {
      tasksAll.forEach(task => {
        if (task.parentId === parentId && !collected.has(task.id)) {
          collected.add(task.id);
          collectDescendantIds(task.id, collected);
        }
      });
      // 通过连线递归
      const parentTask = tasksAll.find(t => t.id === parentId);
      if (parentTask && parentTask.links) {
        parentTask.links.forEach(link => {
          if (!collected.has(link.toId)) {
            collected.add(link.toId);
            collectDescendantIds(link.toId, collected);
          }
        });
      }
      return collected;
    }
    // 1. 先重置所有主线任务及其下属任务的 fillColor
    mainTasks.forEach(mainTask => {
      updateTask(mainTask.id, { fillColor: defaultTaskStyle.fillColor });
      const descendantIds = collectDescendantIds(mainTask.id);
      descendantIds.forEach(id => {
        updateTask(id, { fillColor: defaultTaskStyle.fillColor });
      });
    });
    // 2. 再分配新配色方案色
    if (idx === null) {
      // 无配色方案，全部恢复默认色（中心任务除外）
      // 已在上面重置，无需重复
    } else {
      const palette = COLOR_PALETTES[idx];
      if (palette) {
        mainTasks.forEach((mainTask, i) => {
          const color = palette.colors[i % palette.colors.length];
          updateTask(mainTask.id, { fillColor: color });
          // 递减逻辑在 updateTask 内部自动递归
        });
      }
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: 64,
        right: 0,
        width: 300,
        height: 'calc(100vh - 220px)',
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        backdropFilter: 'blur(48px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(48px) saturate(1.5)',
        boxShadow: '-2px 0 32px #0003',
        zIndex: 9999,
        padding: 0,
        overflowY: 'auto',
        transition: 'transform 0.35s cubic-bezier(.4,1.6,.4,1), opacity 0.25s',
        borderLeft: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '18px 18px 18px 18px',
        marginBottom: 0,
        opacity: popupVisible ? 1 : 0,
        transform: popupVisible ? 'translateX(0)' : 'translateX(100%)',
        borderTop: '1px solid var(--sidebar-border)',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    >
      {/* 顶部Tab栏 */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid var(--sidebar-border)', padding: '0 24px', height: 56, background: 'transparent', position: 'relative' }}>
        <button
          onClick={() => setTab('canvas')}
          style={{
            width: 100,
            height: 40,
            marginTop: 8,
            marginBottom: 0,
            border: 'none',
            background: 'transparent',
            color: tab === 'canvas' ? 'var(--sidebar-text)' : 'var(--sidebar-text)',
            fontWeight: tab === 'canvas' ? 700 : 500,
            fontSize: 14,
            borderRadius: '12px 12px 0 0',
            cursor: 'pointer',
            transition: 'background 0.2s',
            boxShadow: tab === 'canvas' ? '0 2px 8px #316acb11' : 'none',
            borderBottom: tab === 'canvas' ? '3px solid var(--tab-underline)' : '3px solid transparent',
          }}
        >画布</button>
        <button
          onClick={() => setTab('style')}
          style={{
            width: 100,
            height: 40,
            marginTop: 8,
            marginBottom: 0,
            border: 'none',
            background: 'transparent',
            color: tab === 'style' ? 'var(--sidebar-text)' : 'var(--sidebar-text)',
            fontWeight: tab === 'style' ? 700 : 500,
            fontSize: 14,
            borderRadius: '12px 12px 0 0',
            cursor: 'pointer',
            transition: 'background 0.2s',
            boxShadow: tab === 'style' ? '0 2px 8px #316acb11' : 'none',
            borderBottom: tab === 'style' ? '3px solid var(--tab-underline)' : '3px solid transparent',
          }}
        >样式</button>
      </div>
      {/* 内容区 */}
      <div 
        style={{ flex: 1, overflowY: 'auto', padding: 10 }}
        onWheel={e => e.stopPropagation()}
        onTouchMove={e => e.stopPropagation()}
      >
        {tab === 'canvas' && (
          <>
            {/* 配色方案卡片 */}
            <div style={{
              background: 'var(--card-bg)',
              borderRadius: 12,
              boxShadow: '0 1px 4px #0000000d',
              padding: 12,
              marginBottom: 10,
              border: '0px solid var(--sidebar-border)',
              position: 'relative',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sidebar-text)', marginBottom: 10 }}>配色方案</div>
              <button
                ref={paletteBtnRef}
                style={{
                  width: '100%',
                  height: 40,
                  border: '1.5px solid var(--sidebar-border)',
                  background: 'var(--sidebar-bg)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
                onClick={e => {
                  if (paletteBtnRef.current) {
                    const rect = paletteBtnRef.current.getBoundingClientRect();
                    setPalettePopupPosition({
                      top: rect.top - 150,
                      right: window.innerWidth - rect.left + 16
                    });
                  }
                  setPalettePopupOpen(true);
                }}
              >
                {/* 色条 */}
                <div style={{ display: 'flex', gap: 2, flex: 1 }}>
                  {paletteIdx === null ? (
                    <div style={{ color: '#aaa', fontSize: 14, lineHeight: '16px', marginLeft: 2 }}>—</div>
                  ) : (
                    COLOR_PALETTES[paletteIdx]?.colors.map((c, i) => (
                      <div key={i} style={{ width: 28, height: 14, borderRadius: 8, background: c, marginRight: i < 5 ? 2 : 0 }} />
                    ))
                  )}
                </div>
                {/* 名称 */}
                <span style={{
                  marginLeft: 18,
                  fontWeight: 500,
                  fontSize: 14,
                  letterSpacing: 2,
                  whiteSpace: 'nowrap',
                  lineHeight: '1',
                  display: 'inline-block',
                  textAlign: 'left',
                  minWidth: 36
                }}>{paletteIdx === null ? '无配色方案' : COLOR_PALETTES[paletteIdx]?.name}</span>
                {/* 下拉箭头 */}
                <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginLeft: 8 }}><path d="M5 7l4 4 4-4" stroke="#888" strokeWidth="1.5" fill="none"/></svg>
              </button>
              {/* 弹窗 */}
              {palettePopupOpen && (
                <PopupPortal onClickOutside={() => setPalettePopupOpen(false)}>
                  <div
                    style={{
                      position: 'fixed',
                      top: palettePopupPosition.top,
                      right: palettePopupPosition.right,
                      background: 'var(--dropdown-bg)',
                      border: '1.5px solid var(--dropdown-border)',
                      borderRadius: 12,
                      boxShadow: '0 4px 24px #0002',
                      padding: 18,
                      zIndex: 99999,
                      minWidth: 320,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      overflow: 'auto',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--dropdown-text)' }}>经典</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {/* 配色方案选项 */}
                      {COLOR_PALETTES.map((palette, idx) => (
                        <div
                          key={palette.name}
                          onClick={() => { handlePaletteChange(idx); setPalettePopupOpen(false); }}
                          style={{
                            border: paletteIdx === idx ? '2px solid #F15A4A' : '2px solid transparent',
                            borderRadius: 8,
                            padding: 6,
                            cursor: 'pointer',
                            background: paletteIdx === idx ? '#fff6f3' : 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: 6,
                          }}
                        >
                          <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                            {palette.colors.map((c, i) => (
                              <div key={i} style={{ width: 22, height: 12, borderRadius: 6, background: c, marginRight: i < 5 ? 2 : 0 }} />
                            ))}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{palette.name}</span>
                        </div>
                      ))}
                      {/* 无配色方案选项 */}
                      <div
                        onClick={() => { handlePaletteChange(null); setPalettePopupOpen(false); }}
                        style={{
                          border: paletteIdx === null ? '2px solid #F15A4A' : '2px solid transparent',
                          borderRadius: 8,
                          padding: 6,
                          cursor: 'pointer',
                          background: paletteIdx === null ? '#fff6f3' : 'transparent',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 6,
                        }}
                      >
                        <div style={{ color: '#aaa', fontSize: 14, marginBottom: 2 }}>—</div>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>无配色方案</span>
                      </div>
                    </div>
                  </div>
                </PopupPortal>
              )}
            </div>
            {/* 主线任务方向卡片 */}
            <div style={{
              background: 'var(--card-bg)',
              borderRadius: 12,
              boxShadow: '0 1px 4px #0000000d',
              padding: 12,
              marginBottom: 10,
              border: '0px solid var(--sidebar-border)',
              position: 'relative',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sidebar-text)', marginBottom: 10 }}>布局</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{
                    flex: 1,
                    padding: 0,
                    borderRadius: 8,
                    border: '1.5px solid var(--sidebar-border)',
                    background: (localProps.mainDirection || 'horizontal') === 'horizontal' ? '#316acb22' : 'var(--sidebar-bg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 64,
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handleChange('mainDirection', 'horizontal')}
                  title="水平布局"
                >
                  <img src={LayoutH} alt="水平布局" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: (localProps.mainDirection || 'horizontal') === 'horizontal' ? 1 : 0.6, borderRadius: 8 }} />
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: 0,
                    borderRadius: 8,
                    border: '1.5px solid var(--sidebar-border)',
                    background: localProps.mainDirection === 'vertical' ? '#316acb22' : 'var(--sidebar-bg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 64,
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handleChange('mainDirection', 'vertical')}
                  title="垂直布局"
                >
                  <img src={LayoutV} alt="垂直布局" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: localProps.mainDirection === 'vertical' ? 1 : 0.6, borderRadius: 8 }} />
                </button>
              </div>
            </div>
            {/* 卡片1：背景颜色 */}
            <div style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 12,
              boxShadow: '0 1px 4px #0000000d',
              padding: 12,
              marginBottom: 10,
              border: '0px solid var(--sidebar-border)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sidebar-text)', marginBottom: 10 }}>背景颜色</div>
              <button
                style={{
                  width: '100%',
                  height: 32,
                  border: '1.5px solid var(--sidebar-border)',
                  background: localProps.backgroundColor,
                  borderRadius: 8,
                  cursor: 'pointer',
                  verticalAlign: 'middle',
                  position: 'relative',
                  padding: 0,
                }}
                onClick={(e) => handleColorButtonClick('bg', e)}
                aria-label="选择背景颜色"
              />
              {colorPickerOpen === 'bg' && (
                <PopupPortal onClickOutside={() => setColorPickerOpen(null)}>
                  <div
                    style={{
                      position: 'fixed',
                      top: colorPickerPosition.top,
                      right: `calc(${window.innerWidth - (popupRef.current?.getBoundingClientRect().left || 0)}px + 16px)`,
                      borderRadius: 12,
                      border: '1px solid var(--sidebar-border)',
                      background: 'var(--dropdown-bg)',
                      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                      padding: 0,
                      width: 'auto',
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      overflow: 'auto',
                    }}
                  >
                    <SketchPicker
                      color={localProps.backgroundColor}
                      onChange={color => handleChange('backgroundColor', color.hex)}
                      disableAlpha
                      presetColors={COLOR_SCHEMES.flatMap(scheme => scheme.colors)}
                      styles={{
                        default: {
                          picker: {
                            background: 'var(--dropdown-bg)',
                            boxShadow: 'none',
                            borderRadius: 12,
                            width: 260,
                            padding: '12px',
                          },
                        }
                      }}
                    />
                  </div>
                </PopupPortal>
              )}
            </div>
            {/* 卡片2：网格 */}
            <div style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 12,
              boxShadow: '0 1px 4px #0000000d',
              padding: 12,
              marginBottom: 10,
              border: '0px solid var(--sidebar-border)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sidebar-text)', marginBottom: 10 }}>网格</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <input
                  type="checkbox"
                  checked={!!localProps.showGrid}
                  onChange={e => handleChange('showGrid', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#316acb' }}
                />
                <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--sidebar-text)' }}>显示网格</span>
              </label>
              {localProps.showGrid && (
                <div style={{ marginTop: 0 }}>
                  <span style={{ fontSize: 14, marginRight: 8, color: 'var(--sidebar-text)' }}>网格大小</span>
                  <select
                    value={localProps.gridSize || 40}
                    onChange={e => handleChange('gridSize', Number(e.target.value))}
                    style={{
                      width: '100%',
                      fontSize: 14,
                      borderRadius: 8,
                      padding: '4px 12px',
                      height: 32,
                      lineHeight: '24px',
                      border: '1.5px solid var(--sidebar-border)',
                      background: 'var(--sidebar-bg)',
                      color: 'var(--sidebar-text)',
                      fontWeight: 400,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {[10,20,30,40,50,60,70,80,90,100].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </>
        )}
        {tab === 'style' && (selectedTask || (selectedTasks && selectedTasks.length > 1)) && (
          <div>
            {/* 多选提示 */}
            {selectedTasks && selectedTasks.length > 1 && (
              <div style={{ color: '#316acb', fontWeight: 600, marginBottom: 10, fontSize: 15 }}>
                已选中{selectedTasks.length}个卡片，批量设置样式
              </div>
            )}
            {/* 卡片1：重要性 */}
            <div style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 12,
              boxShadow: '0 1px 4px #0000000d',
              padding: 12,
              marginBottom: 10,
              border: '0px solid var(--sidebar-border)',
            }}>
              {/* 重要性选择器 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 0, height: 36 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>重要性</div>
                <select
                  value={(() => {
                    const level = (selectedTasks && selectedTasks.length > 1)
                      ? getMultiValue('importantLevel')
                      : localTaskStyle?.importantLevel;
                    return level || 'normal';
                  })()}
                  onChange={e => {
                    if (e.target.value === 'important') {
                      handleTaskStyleChange('importantLevel', e.target.value);
                      handleTaskStyleChange('borderColor', '#f44336');
                      handleTaskStyleChange('borderWidth', 3);
                    } else if (e.target.value === 'secondary') {
                      handleTaskStyleChange('importantLevel', e.target.value);
                      handleTaskStyleChange('borderColor', '#ff9800');
                      handleTaskStyleChange('borderWidth', 3);
                    } else {
                      handleTaskStyleChange('importantLevel', e.target.value);
                      handleTaskStyleChange('borderColor', defaultTaskStyle.borderColor);
                      handleTaskStyleChange('borderWidth', defaultTaskStyle.borderWidth);
                    }
                  }}
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '0 12px',
                    height: 32,
                    lineHeight: '32px',
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-text)',
                    fontWeight: 400,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'border-color 0.2s',
                    minWidth: 80,
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="important">重要</option>
                  <option value="secondary">次要</option>
                  <option value="normal">一般</option>
                </select>
              </div>
            </div>
            {/* 卡片2：形状/填充/边框/粗细 */}
            <div style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 12,
              boxShadow: '0 1px 4px #0000000d',
              padding: 12,
              marginBottom: 10,
              border: '0px solid var(--sidebar-border)',
            }}>
              {/* 形状选择器 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, height: 36 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>形状</div>
                <div style={{ flex: 1, marginLeft: 12, position: 'relative' }}>
                  <button
                    className="shape-button"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
                      border: '1.5px solid var(--sidebar-border)', borderRadius: 8,
                      background: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', cursor: 'pointer',
                      fontSize: 14, fontWeight: 500, height: 32, width: '100%',
                    }}
                    onClick={() => setShapeMenuOpen(v => !v)}
                  >
                    {(selectedTasks && selectedTasks.length > 1)
                      ? (SHAPES.find(s => s.type === getMultiValue('shape'))?.icon || SHAPES[0].icon)
                      : currentShape.icon}
                    <span style={{ fontSize: 13 }}>
                      {(selectedTasks && selectedTasks.length > 1)
                        ? (SHAPES.find(s => s.type === getMultiValue('shape'))?.name || '-')
                        : currentShape.name}
                    </span>
                  </button>
                  {shapeMenuOpen && (
                    <PopupPortal onClickOutside={() => setShapeMenuOpen(false)}>
                      <div
                        className="shape-dropdown-menu"
                        style={{
                          position: 'fixed',
                          top: popupRef.current?.querySelector('.shape-button')?.getBoundingClientRect().bottom + 8,
                          left: (popupRef.current?.querySelector('.shape-button')?.getBoundingClientRect().left || 0) - 43,
                          width: 220,
                          background: 'var(--dropdown-bg)',
                          border: '1.5px solid var(--dropdown-border)',
                          borderRadius: 10,
                          boxShadow: '0 4px 24px #0002',
                          padding: 8,
                          color: 'var(--dropdown-text)',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 8,
                          fontSize: 14,
                          maxHeight: 400,
                          overflowY: 'auto',
                        }}
                      >
                        {SHAPES.map((s, idx) => {
                          const isSelected = getMultiValue('shape') === s.type;
                          const isHovered = hoveredShapeIdx === idx;
                          return (
                            <div
                              key={s.type}
                              onClick={() => { handleTaskStyleChange('shape', s.type); setShapeMenuOpen(false); }}
                              onMouseEnter={() => setHoveredShapeIdx(idx)}
                              onMouseLeave={() => setHoveredShapeIdx(-1)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '0 4px',
                                borderRadius: 6,
                                background: (isHovered || isSelected) ? 'var(--shape-hover-bg)' : 'transparent',
                                cursor: 'pointer',
                                color: (isHovered || isSelected) ? 'var(--shape-hover-text)' : 'var(--dropdown-text)',
                                fontSize: 13,
                                fontWeight: isSelected ? 700 : 400,
                                transition: 'background 0.18s, color 0.18s',
                                height: 28,
                              }}
                            >
                              {s.icon}
                              <span style={{ fontSize: 13 }}>{s.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </PopupPortal>
                  )}
                </div>
              </div>
              {/* 填充颜色选择器 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, height: 32 }}>
                <div style={{ fontWeight: 400, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>填充</div>
                <div style={{ flex: 1, marginLeft: 12, position: 'relative' }}>
                  <button
                    style={{
                      width: '100%', height: 32,
                      border: '1.5px solid var(--sidebar-border)',
                      background: (selectedTasks && selectedTasks.length > 1)
                        ? (getMultiValue('fillColor') || '#f8f8fa')
                        : (localTaskStyle?.fillColor || '#f8f8fa'),
                      borderRadius: 8, cursor: 'pointer', padding: 0,
                    }}
                    onClick={(e) => handleColorButtonClick('fill', e)}
                    aria-label="选择填充颜色"
                  />
                  {colorPickerOpen === 'fill' && (
                    <PopupPortal onClickOutside={() => setColorPickerOpen(null)}>
                      <div
                        style={{
                          position: 'fixed',
                          top: colorPickerPosition.top,
                          right: `calc(${window.innerWidth - (popupRef.current?.getBoundingClientRect().left || 0)}px + 16px)`,
                          borderRadius: 12,
                          border: '1px solid var(--sidebar-border)',
                          background: 'var(--dropdown-bg)',
                          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                          padding: 0,
                          width: 'auto',
                          maxWidth: '90vw',
                          maxHeight: '90vh',
                          overflow: 'auto',
                        }}
                      >
                        <SketchPicker
                          color={(selectedTasks && selectedTasks.length > 1)
                            ? (getMultiValue('fillColor') || '#f8f8fa')
                            : (localTaskStyle?.fillColor || '#f8f8fa')}
                          onChange={color => handleTaskStyleChange('fillColor', color.hex)}
                          disableAlpha
                          presetColors={COLOR_SCHEMES.flatMap(scheme => scheme.colors)}
                          styles={{
                            default: {
                              picker: {
                                background: 'var(--dropdown-bg)',
                                boxShadow: 'none',
                                borderRadius: 12,
                                width: 260,
                                padding: '12px',
                              },
                            }
                          }}
                        />
                      </div>
                    </PopupPortal>
                  )}
                </div>
              </div>
              {/* 边框线形+颜色选择器 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, height: 32 }}>
                <div style={{ fontWeight: 400, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>边框</div>
                <div style={{ flex: 1, marginLeft: 12, display: 'flex', gap: 8 }}>
                  {/* 线形选择器 */}
                  <select
                    value={localTaskStyle?.borderStyle || 'solid'}
                    onChange={e => handleTaskStyleChange('borderStyle', e.target.value)}
                    style={{
                      flex: 1,
                      fontSize: 14,
                      borderRadius: 8,
                      padding: '0 12px',
                      height: 32,
                      lineHeight: '32px',
                      border: '1.5px solid var(--sidebar-border)',
                      background: 'var(--sidebar-bg)',
                      color: 'var(--sidebar-text)',
                      fontWeight: 400,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      transition: 'border-color 0.2s',
                      minWidth: 80,
                      margin: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    {LINE_STYLES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {/* 边框颜色选择器 */}
                  <div style={{ flex: 1, position: 'relative', height: 32 }}>
                    <button
                      style={{
                        width: '100%',
                        height: 32,
                        border: '1.5px solid var(--sidebar-border)',
                        background: localTaskStyle?.borderColor || '#e0e0e5',
                        borderRadius: 8,
                        cursor: 'pointer',
                        padding: 0,
                        margin: 0,
                        boxSizing: 'border-box',
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: '32px',
                      }}
                      onClick={(e) => handleColorButtonClick('border', e)}
                      aria-label="选择边框颜色"
                    />
                    {colorPickerOpen === 'border' && (
                      <PopupPortal onClickOutside={() => setColorPickerOpen(null)}>
                        <div
                          style={{
                            position: 'fixed',
                            top: colorPickerPosition.top,
                            right: `calc(${window.innerWidth - (popupRef.current?.getBoundingClientRect().left || 0)}px + 16px)`,
                            borderRadius: 12,
                            border: '1px solid var(--sidebar-border)',
                            background: 'var(--dropdown-bg)',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                            padding: 0,
                            width: 'auto',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            overflow: 'auto',
                          }}
                        >
                          <SketchPicker
                            color={localTaskStyle?.borderColor || '#e0e0e5'}
                            onChange={color => handleTaskStyleChange('borderColor', color.hex)}
                            disableAlpha
                            presetColors={COLOR_SCHEMES.flatMap(scheme => scheme.colors)}
                            styles={{
                              default: {
                                picker: {
                                  background: 'var(--dropdown-bg)',
                                  boxShadow: 'none',
                                  borderRadius: 12,
                                  width: 260,
                                  padding: '12px',
                                },
                              }
                            }}
                          />
                        </div>
                      </PopupPortal>
                    )}
                  </div>
                </div>
              </div>
              {/* 边框粗细选择器 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 0, height: 32 }}>
                <div style={{ fontWeight: 400, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>粗细</div>
                <select
                  value={String(localTaskStyle?.borderWidth ?? 1.5)}
                  onChange={e => handleTaskStyleChange('borderWidth', Number(e.target.value))}
                  style={{
                    flex: 1,
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '4px 12px',
                    height: 32,
                    lineHeight: '24px',
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-text)',
                    fontWeight: 400,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'border-color 0.2s',
                    marginLeft: 12,
                    minWidth: 80,
                  }}
                >
                  {LINE_WIDTHS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* 卡片3：文本设置 */}
            <div style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 12,
              boxShadow: '0 1px 4px #0000000d',
              padding: 12,
              marginBottom: 10,
              border: '0px solid var(--sidebar-border)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>文本</div>
              {/* 字体、字号 第一排 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {/* 字体类型 */}
                <select
                  value={localTaskStyle?.fontFamily || FONTS[0].value}
                  onChange={e => handleTaskStyleChange('fontFamily', e.target.value)}
                  style={{
                    width: '65%',
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '0 12px',
                    height: 32,
                    lineHeight: '32px',
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-text)',
                    fontWeight: 400,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'border-color 0.2s',
                    minWidth: 100,
                    boxSizing: 'border-box',
                  }}
                >
                  {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                {/* 字号 */}
                <input
                  type="number"
                  min={10}
                  max={48}
                  value={localTaskStyle?.fontSize || 16}
                  onChange={e => handleTaskStyleChange('fontSize', Number(e.target.value))}
                  style={{
                    width: '35%',
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '0 12px',
                    height: 32,
                    lineHeight: '32px',
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-text)',
                    fontWeight: 400,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'border-color 0.2s',
                    minWidth: 60,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              {/* 粗细、颜色 第二排 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {/* 粗细 */}
                <select
                  value={localTaskStyle?.fontWeight || '500'}
                  onChange={e => handleTaskStyleChange('fontWeight', e.target.value)}
                  style={{
                    width: '65%',
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '0 12px',
                    height: 32,
                    lineHeight: '32px',
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-text)',
                    fontWeight: 400,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'border-color 0.2s',
                    minWidth: 100,
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="300">Light</option>
                  <option value="400">Regular</option>
                  <option value="500">Medium</option>
                  <option value="700">Bold</option>
                </select>
                {/* 字体颜色 */}
                <div style={{ width: '35%', height: 32, display: 'inline-block', verticalAlign: 'middle', position: 'relative' }}>
                  <button
                    style={{
                      width: '100%',
                      height: 32,
                      border: '1.5px solid var(--sidebar-border)',
                      background: localTaskStyle?.color || '#fff',
                      borderRadius: 8,
                      cursor: 'pointer',
                      padding: 0,
                      position: 'relative',
                    }}
                    onClick={(e) => handleColorButtonClick('font', e)}
                    aria-label="选择字体颜色"
                  />
                  {colorPickerOpen === 'font' && (
                    <PopupPortal onClickOutside={() => setColorPickerOpen(null)}>
                      <div
                        style={{
                          position: 'fixed',
                          top: colorPickerPosition.top,
                          right: `calc(${window.innerWidth - (popupRef.current?.getBoundingClientRect().left || 0)}px + 16px)`,
                          borderRadius: 12,
                          border: '1px solid var(--sidebar-border)',
                          background: 'var(--dropdown-bg)',
                          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                          padding: 0,
                          width: 'auto',
                          maxWidth: '90vw',
                          maxHeight: '90vh',
                          overflow: 'auto',
                        }}
                      >
                        <SketchPicker
                          color={localTaskStyle?.color || '#222222'}
                          onChange={color => handleTaskStyleChange('color', color.hex)}
                          disableAlpha
                          presetColors={COLOR_SCHEMES.flatMap(scheme => scheme.colors)}
                          styles={{
                            default: {
                              picker: {
                                background: 'var(--dropdown-bg)',
                                boxShadow: 'none',
                                borderRadius: 12,
                                width: 260,
                                padding: '12px',
                              },
                            }
                          }}
                        />
                      </div>
                    </PopupPortal>
                  )}
                </div>
              </div>
              {/* 样式按钮组：加粗、斜体、删除线、下划线 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid var(--button-border)',
                    fontWeight: 700,
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    background: localTaskStyle?.fontWeight === '700' ? 'var(--button-hover-bg)' : 'none',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sidebar-text)',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleTaskStyleChange('fontWeight', localTaskStyle?.fontWeight === '700' ? '500' : '700')}
                >B</button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid var(--button-border)',
                    fontStyle: 'italic',
                    background: localTaskStyle?.fontStyle === 'italic' ? 'var(--button-hover-bg)' : 'none',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sidebar-text)',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleTaskStyleChange('fontStyle', localTaskStyle?.fontStyle === 'italic' ? 'normal' : 'italic')}
                >I</button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid var(--button-border)',
                    textDecoration: 'line-through',
                    background: localTaskStyle?.textDecoration === 'line-through' ? 'var(--button-hover-bg)' : 'none',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sidebar-text)',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleTaskStyleChange('textDecoration', localTaskStyle?.textDecoration === 'line-through' ? 'none' : 'line-through')}
                >S</button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid var(--button-border)',
                    textDecoration: 'underline',
                    background: localTaskStyle?.textDecoration === 'underline' ? 'var(--button-hover-bg)' : 'none',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sidebar-text)',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleTaskStyleChange('textDecoration', localTaskStyle?.textDecoration === 'underline' ? 'none' : 'underline')}
                >U</button>
              </div>
              {/* 对齐方式 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 0 }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid var(--button-border)',
                    background: localTaskStyle?.textAlign === 'left' ? 'var(--button-hover-bg)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                    color: 'var(--sidebar-text)',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleTaskStyleChange('textAlign', 'left')}
                >
                  <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                    <rect x="2" y="3" width="14" height="1.5" rx="0.75" fill="var(--sidebar-text)"/>
                    <rect x="2" y="8" width="18" height="1.5" rx="0.75" fill="var(--sidebar-text)"/>
                    <rect x="2" y="13" width="10" height="1.5" rx="0.75" fill="var(--sidebar-text)"/>
                  </svg>
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid var(--button-border)',
                    background: localTaskStyle?.textAlign === 'center' ? 'var(--button-hover-bg)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                    color: 'var(--sidebar-text)',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleTaskStyleChange('textAlign', 'center')}
                >
                  <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                    <rect x="4" y="3" width="14" height="1.5" rx="0.75" fill="var(--sidebar-text)"/>
                    <rect x="2" y="8" width="18" height="1.5" rx="0.75" fill="var(--sidebar-text)"/>
                    <rect x="6" y="13" width="10" height="1.5" rx="0.75" fill="var(--sidebar-text)"/>
                  </svg>
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid var(--button-border)',
                    background: localTaskStyle?.textAlign === 'right' ? 'var(--button-hover-bg)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                    color: 'var(--sidebar-text)',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleTaskStyleChange('textAlign', 'right')}
                >
                  <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                    <rect x="6" y="3" width="14" height="1.5" rx="0.75" fill="var(--sidebar-text)"/>
                    <rect x="2" y="8" width="18" height="1.5" rx="0.75" fill="var(--sidebar-text)"/>
                    <rect x="10" y="13" width="10" height="1.5" rx="0.75" fill="var(--sidebar-text)"/>
                  </svg>
                </button>
              </div>
            </div>
            {/* 新增：分支样式卡片 */}
            <div style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 12,
              boxShadow: '0 1px 4px #0000000d',
              padding: 12,
              marginBottom: 10,
              border: '0px solid var(--sidebar-border)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sidebar-text)', marginBottom: 10 }}>分支</div>
              
              {/* 线形选择器 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, height: 32 }}>
                <div style={{ fontWeight: 400, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>线条</div>
                <select
                  value={getBranchStyleValue('lineStyle')}
                  onChange={e => onBranchStyleChange?.('lineStyle', e.target.value)}
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '0 12px',
                    height: 32,
                    lineHeight: '32px',
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-text)',
                    fontWeight: 400,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {LINE_STYLES.map(style => (
                    <option key={style.value} value={style.value}>{style.label}</option>
                  ))}
                </select>
              </div>

              {/* 箭头样式选择器 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, height: 32 }}>
                <div style={{ fontWeight: 400, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>终点</div>
                <select
                  value={getBranchStyleValue('arrowStyle')}
                  onChange={e => onBranchStyleChange?.('arrowStyle', e.target.value)}
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '0 12px',
                    height: 32,
                    lineHeight: '32px',
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-text)',
                    fontWeight: 400,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {ARROW_STYLES.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 线宽选择器 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, height: 32 }}>
                <div style={{ fontWeight: 400, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>粗细</div>
                <select
                  value={getBranchStyleValue('lineWidth')}
                  onChange={e => onBranchStyleChange?.('lineWidth', Number(e.target.value))}
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 14,
                    borderRadius: 8,
                    padding: '0 12px',
                    height: 32,
                    lineHeight: '32px',
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'var(--sidebar-bg)',
                    color: 'var(--sidebar-text)',
                    fontWeight: 400,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {LINE_WIDTHS.map(width => (
                    <option key={width.value} value={width.value}>{width.label}</option>
                  ))}
                </select>
              </div>

              {/* 颜色选择器 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 0, height: 32 }}>
                <div style={{ fontWeight: 400, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>颜色</div>
                <div style={{ flex: 1, marginLeft: 12, position: 'relative' }}>
                  <button
                    style={{
                      width: '100%',
                      height: 32,
                      border: '1.5px solid var(--sidebar-border)',
                      background: getBranchStyleValue('color'),
                      borderRadius: 8,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    onClick={(e) => handleColorButtonClick('branch', e)}
                    aria-label="选择连线颜色"
                  />
                  {colorPickerOpen === 'branch' && (
                    <PopupPortal onClickOutside={() => setColorPickerOpen(null)}>
                      <div
                        style={{
                          position: 'fixed',
                          top: colorPickerPosition.top,
                          right: `calc(${window.innerWidth - (popupRef.current?.getBoundingClientRect().left || 0)}px + 16px)`,
                          borderRadius: 12,
                          border: '1px solid var(--sidebar-border)',
                          background: 'var(--dropdown-bg)',
                          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                          padding: 0,
                          width: 'auto',
                          maxWidth: '90vw',
                          maxHeight: '90vh',
                          overflow: 'auto',
                        }}
                      >
                        <SketchPicker
                          color={getBranchStyleValue('color')}
                          onChange={color => onBranchStyleChange?.('color', color.hex)}
                          disableAlpha
                          presetColors={COLOR_SCHEMES.flatMap(scheme => scheme.colors)}
                          styles={{
                            default: {
                              picker: {
                                background: 'var(--dropdown-bg)',
                                boxShadow: 'none',
                                borderRadius: 12,
                                width: 260,
                                padding: '12px',
                              },
                            }
                          }}
                        />
                      </div>
                    </PopupPortal>
                  )}
                </div>
              </div>
            </div>
            {/* 恢复默认样式按钮 */}
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <button
                onClick={() => {
                  // 恢复任务样式
                  if (onTaskStyleChange && (selectedTask || selectedTasks?.length > 0)) {
                    Object.entries(defaultTaskStyle).forEach(([key, value]) => {
                      onTaskStyleChange(key, value);
                    });
                  }
                  // 恢复分支样式
                  if (onBranchStyleChange && (selectedTask || selectedTasks?.length > 0)) {
                    Object.entries(defaultLinkStyle).forEach(([key, value]) => {
                       onBranchStyleChange(key, value);
                    });
                  }
                }}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: '1px solid var(--button-border)',
                  background: 'none',
                  color: 'var(--sidebar-text)',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    background: 'var(--button-hover-bg)',
                  }
                }}
              >恢复默认样式</button>
            </div>
          </div>
        )}
        {tab === 'style' && !selectedTask && (!selectedTasks || selectedTasks.length === 0) && (
          <div style={{ color: 'var(--sidebar-text)', textAlign: 'center', marginTop: 60, fontSize: 16 }}>未选中任何卡片</div>
        )}
      </div>
    </div>
  );
};

export default FormatSidebar; 
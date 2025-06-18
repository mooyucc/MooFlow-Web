import React, { useState, useEffect, useRef } from 'react';
import { SketchPicker } from 'react-color';
import { defaultTaskStyle } from '../store/taskStore';

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
  { label: '默认', value: 1.5 },
  { label: '细', value: 0.5 },
  { label: '中', value: 2.0 },
  { label: '粗', value: 4.0 }
];

// 边框线形选项
const LINE_STYLES = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '无线框', value: 'none' }
];

// 常用流程图形状及SVG
const SHAPES = [
  { type: 'roundRect', name: '圆角矩形', icon: <svg width="28" height="20"><rect x="3" y="3" width="22" height="14" rx="5" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'rect', name: '矩形', icon: <svg width="28" height="20"><rect x="3" y="3" width="22" height="14" rx="0" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'ellipse', name: '椭圆', icon: <svg width="28" height="20"><ellipse cx="14" cy="10" rx="11" ry="7" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'circle', name: '圆形', icon: <svg width="28" height="20"><ellipse cx="14" cy="10" rx="8" ry="8" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'diamond', name: '菱形', icon: <svg width="28" height="20"><polygon points="14,3 24,10 14,17 4,10" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'parallelogram', name: '平行四边形', icon: <svg width="28" height="20"><polygon points="7,3 24,3 20,17 3,17" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'hexagon', name: '六边形', icon: <svg width="28" height="20"><polygon points="7,3 21,3 24,10 21,17 7,17 4,10" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'pentagon', name: '五边形', icon: <svg width="28" height="20"><polygon points="14,3 24,10 20,17 8,17 4,10" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'trapezoid', name: '梯形', icon: <svg width="28" height="20"><polygon points="8,3 20,3 24,17 4,17" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'document', name: '文档', icon: <svg width="28" height="20"><path d="M5,5 H23 Q24,5 24,8 V14 Q24,17 21,17 H7 Q5,17 5,14 V8 Q5,5 8,5 Z" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'cloud', name: '云', icon: <svg width="28" height="20"><path d="M9,17 Q5,17 5,10 Q2,10 4,6 Q4,3 8,5 Q9,2 14,3 Q19,2 20,5 Q24,3 24,6 Q26,10 21,10 Q21,17 17,17 Q16,19 14,17 Q12,19 9,17 Z" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'flag', name: '旗帜', icon: <svg width="28" height="20"><path d="M5,5 L23,5 L20,10 L23,15 L5,15 Z" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'arrowRight', name: '右箭头', icon: <svg width="28" height="20"><polygon points="5,10 17,10 17,6 24,10 17,14 17,10 5,10" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'arrowLeft', name: '左箭头', icon: <svg width="28" height="20"><polygon points="23,10 11,10 11,6 4,10 11,14 11,10 23,10" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'doubleArrow', name: '双箭头', icon: <svg width="28" height="20"><polygon points="4,10 8,6 8,9 20,9 20,6 24,10 20,14 20,11 8,11 8,14 4,10" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'star', name: '星形', icon: <svg width="28" height="20"><polygon points="14,5 16,14 24,14 17,17 19,25 14,20 9,25 11,17 4,14 12,14" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'heart', name: '心形', icon: <svg width="28" height="20" viewBox="0 0 28 20"><path d="M14 5 C10 1, 4 4, 6 10 C4 15, 10 17, 14 20 C18 17, 24 15, 22 10 C24 4, 18 1, 14 5Z" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'quote', name: '引号', icon: <svg width="28" height="20"><text x="6" y="16" fontSize="13" fill="var(--shape-stroke)">""</text></svg> },
  { type: 'brace', name: '大括号', icon: <svg width="28" height="20"><text x="6" y="16" fontSize="13" fill="var(--shape-stroke)">{}</text></svg> },
  { type: 'bracket', name: '方括号', icon: <svg width="28" height="20"><text x="6" y="16" fontSize="13" fill="var(--shape-stroke)">[ ]</text></svg> },
  { type: 'parenthesis', name: '圆括号', icon: <svg width="28" height="20"><text x="6" y="16" fontSize="13" fill="var(--shape-stroke)">( )</text></svg> },
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
}) => {
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

  useEffect(() => {
    setLocalProps(canvasProps);
  }, [canvasProps]);
  useEffect(() => {
    setLocalTaskStyle(selectedTask);
  }, [selectedTask]);

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
  const [hoveredShapeIdx, setHoveredShapeIdx] = useState(-1);
  const currentShape = SHAPES.find(s => s.type === localTaskStyle?.shape) || SHAPES[0];

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

  if (!visible) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: 64,
        right: 0,
        width: 300,
        height: 'calc(100vh - 200px)',
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        backdropFilter: 'blur(48px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(48px) saturate(1.5)',
        boxShadow: '-2px 0 32px #0003',
        zIndex: 9999,
        padding: 0,
        overflowY: 'auto',
        transition: 'transform 0.35s cubic-bezier(.4,1.6,.4,1), opacity 0.25s',
        borderLeft: '1.5px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '18px 18px 18px 18px',
        marginBottom: 0,
        opacity: popupVisible ? 1 : 0,
        transform: popupVisible ? 'translateX(0)' : 'translateX(100%)',
        borderTop: '1.5px solid var(--sidebar-border)',
        borderBottom: '1.5px solid var(--sidebar-border)',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    >
      {/* 顶部Tab栏 */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid var(--sidebar-border)', padding: '0 24px', height: 56, background: 'transparent', position: 'relative' }}>
        <button
          onClick={() => setTab('canvas')}
          style={{
            flex: 1,
            height: 40,
            marginTop: 8,
            marginBottom: 0,
            border: 'none',
            background: tab === 'canvas' ? 'var(--sidebar-bg)' : 'transparent',
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
            flex: 1,
            height: 40,
            marginTop: 8,
            marginBottom: 0,
            border: 'none',
            background: tab === 'style' ? 'var(--sidebar-bg)' : 'transparent',
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
        <button
          style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--sidebar-text)', transition: 'color 0.2s', position: 'absolute', right: -4, top: -4 }}
          onClick={onClose}
          title="关闭"
          onMouseEnter={e => (e.currentTarget.style.color = '#f44336')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--sidebar-text)')}
        >×</button>
      </div>
      {/* 内容区 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {tab === 'canvas' && (
          <>
            {/* 背景颜色 */}
            <div style={{ marginBottom: 28, position: 'relative' }}>
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
                onClick={() => setColorPickerOpen(v => v === 'bg' ? null : 'bg')}
                aria-label="选择背景颜色"
              />
              {colorPickerOpen === 'bg' && (
                <div
                  ref={bgPickerRef}
                  style={{
                    position: 'absolute',
                    zIndex: 10,
                    top: 40,
                    right: 0,
                    borderRadius: 10,
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'none',
                    boxShadow: '0 4px 24px #0002',
                    padding: 0,
                  }}
                >
                  <SketchPicker
                    color={localProps.backgroundColor}
                    onChange={color => handleChange('backgroundColor', color.hex)}
                    disableAlpha
                    presetColors={['#ffffff', '#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4', '#222222']}
                  />
                </div>
              )}
            </div>
            <div style={{ borderTop: '1.5px solid var(--sidebar-border)', margin: '0 0 24px 0', height: 0 }} />
            {/* 网格开关与大小 */}
            <div style={{ marginBottom: 8 }}>
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
            {/* 重要性选择器 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, height: 36 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>重要性</div>
              <select
                value={(() => {
                  const level = (selectedTasks && selectedTasks.length > 1)
                    ? getMultiValue('importantLevel')
                    : localTaskStyle?.importantLevel;
                  return level || 'normal';
                })()}
                onChange={e => {
                  let fill, color;
                  if (e.target.value === 'important') {
                    fill = '#f44336'; color = '#fff';
                  } else if (e.target.value === 'secondary') {
                    fill = '#ff9800'; color = '#fff';
                  } else {
                    fill = '#f8f8fa'; color = '#222222';
                  }
                  handleTaskStyleChange('importantLevel', e.target.value);
                  handleTaskStyleChange('fillColor', fill);
                  handleTaskStyleChange('color', color);
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
            <div style={{ borderTop: '1.5px solid var(--sidebar-border)', margin: '10px 0', height: 0 }} />
            {/* 第一排：形状标题+形状选择器 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, height: 36 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48 }}>形状</div>
              <div style={{ flex: 1, marginLeft: 12, position: 'relative' }}>
                <button
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
                  <div
                    className="shape-dropdown-menu"
                    style={{
                      position: 'absolute',
                      zIndex: 10,
                      top: 44,
                      left: 'auto',
                      right: 0,
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
                            display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px', borderRadius: 6,
                            background: isHovered ? 'var(--dropdown-hover-bg)' : (isSelected ? 'var(--shape-bg)' : 'transparent'),
                            cursor: 'pointer', color: 'var(--dropdown-text)', fontSize: 13,
                            fontWeight: isSelected ? 700 : 400,
                            transition: 'background 0.18s',
                            height: 28,
                          }}
                        >
                          {s.icon}
                          <span style={{ fontSize: 13 }}>{s.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            {/* 第二排：填充标题+卡片颜色选择器 */}
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
                  onClick={() => setColorPickerOpen(v => v === 'fill' ? null : 'fill')}
                  aria-label="选择填充颜色"
                />
                {colorPickerOpen === 'fill' && (
                  <div
                    ref={fillPickerRef}
                    style={{
                      position: 'absolute', zIndex: 10, top: 40, right: 0,
                      borderRadius: 10, border: '1.5px solid var(--sidebar-border)',
                      background: 'none', boxShadow: '0 4px 24px #0002', padding: 0,
                    }}
                  >
                    <SketchPicker
                      color={(selectedTasks && selectedTasks.length > 1)
                        ? (getMultiValue('fillColor') || '#f8f8fa')
                        : (localTaskStyle?.fillColor || '#f8f8fa')}
                      onChange={color => handleTaskStyleChange('fillColor', color.hex)}
                      disableAlpha
                      presetColors={['#ffffff', '#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4', '#222222']}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* 第三排：边框标题+线形选择器+边框颜色选择器 */}
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
                    onClick={() => setColorPickerOpen(v => v === 'border' ? null : 'border')}
                    aria-label="选择边框颜色"
                  />
                  {colorPickerOpen === 'border' && (
                    <div
                      ref={borderPickerRef}
                      style={{
                        position: 'absolute', zIndex: 10, top: 40, right: 0,
                        borderRadius: 10, border: '1.5px solid var(--sidebar-border)',
                        background: 'none', boxShadow: '0 4px 24px #0002', padding: 0,
                      }}
                    >
                      <SketchPicker
                        color={localTaskStyle?.borderColor || '#e0e0e5'}
                        onChange={color => handleTaskStyleChange('borderColor', color.hex)}
                        disableAlpha
                        presetColors={['#ffffff', '#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4', '#222222']}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* 第四排：粗细标题+边框粗细选择器 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, height: 32 }}>
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
            {/* 分割线 */}
            <div style={{ borderTop: '1.5px solid var(--sidebar-border)', margin: '18px 0', height: 0 }} />
            {/* 文本属性设置区域 */}
            <div style={{ marginBottom: 18 }}>
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
                    onClick={() => setColorPickerOpen(v => v === 'font' ? null : 'font')}
                    aria-label="选择字体颜色"
                  />
                  {colorPickerOpen === 'font' && (
                    <div
                      ref={fontPickerRef}
                      style={{
                        position: 'absolute',
                        zIndex: 10,
                        top: 40,
                        right: 0,
                        borderRadius: 10,
                        border: '1.5px solid var(--sidebar-border)',
                        background: 'none',
                        boxShadow: '0 4px 24px #0002',
                        padding: 0,
                      }}
                    >
                      <SketchPicker
                        color={localTaskStyle?.color || '#222222'}
                        onChange={color => handleTaskStyleChange('color', color.hex)}
                        disableAlpha
                        presetColors={['#222222', '#ffffff', '#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4']}
                      />
                    </div>
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
                    border: '1px solid #ddd',
                    fontWeight: 700,
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    background: localTaskStyle?.fontWeight === '700' ? '#e0e0e5' : 'none',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => handleTaskStyleChange('fontWeight', localTaskStyle?.fontWeight === '700' ? '500' : '700')}
                >B</button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    fontStyle: 'italic',
                    background: localTaskStyle?.fontStyle === 'italic' ? '#e0e0e5' : 'none',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => handleTaskStyleChange('fontStyle', localTaskStyle?.fontStyle === 'italic' ? 'normal' : 'italic')}
                >I</button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    textDecoration: 'line-through',
                    background: localTaskStyle?.textDecoration === 'line-through' ? '#e0e0e5' : 'none',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => handleTaskStyleChange('textDecoration', localTaskStyle?.textDecoration === 'line-through' ? 'none' : 'line-through')}
                >S</button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    textDecoration: 'underline',
                    background: localTaskStyle?.textDecoration === 'underline' ? '#e0e0e5' : 'none',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => handleTaskStyleChange('textDecoration', localTaskStyle?.textDecoration === 'underline' ? 'none' : 'underline')}
                >U</button>
              </div>
              {/* 对齐方式 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    background: localTaskStyle?.textAlign === 'left' ? '#e0e0e5' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                  }}
                  onClick={() => handleTaskStyleChange('textAlign', 'left')}
                >
                  <svg width="22" height="18" viewBox="0 0 22 18" fill="none"><rect x="2" y="3" width="14" height="1.5" rx="0.75" fill="#222222"/><rect x="2" y="8" width="18" height="1.5" rx="0.75" fill="#222222"/><rect x="2" y="13" width="10" height="1.5" rx="0.75" fill="#222222"/></svg>
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    background: localTaskStyle?.textAlign === 'center' ? '#e0e0e5' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                  }}
                  onClick={() => handleTaskStyleChange('textAlign', 'center')}
                >
                  <svg width="22" height="18" viewBox="0 0 22 18" fill="none"><rect x="4" y="3" width="14" height="1.5" rx="0.75" fill="#222222"/><rect x="2" y="8" width="18" height="1.5" rx="0.75" fill="#222222"/><rect x="6" y="13" width="10" height="1.5" rx="0.75" fill="#222222"/></svg>
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    background: localTaskStyle?.textAlign === 'right' ? '#e0e0e5' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                  }}
                  onClick={() => handleTaskStyleChange('textAlign', 'right')}
                >
                  <svg width="22" height="18" viewBox="0 0 22 18" fill="none"><rect x="6" y="3" width="14" height="1.5" rx="0.75" fill="#222222"/><rect x="2" y="8" width="18" height="1.5" rx="0.75" fill="#222222"/><rect x="10" y="13" width="10" height="1.5" rx="0.75" fill="#222222"/></svg>
                </button>
              </div>
            </div>
            {/* 恢复默认样式按钮 */}
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <button
                onClick={() => {
                  setLocalTaskStyle({ ...selectedTask, ...defaultTaskStyle });
                  if (onTaskStyleChange) {
                    Object.entries(defaultTaskStyle).forEach(([key, value]) => {
                      onTaskStyleChange(key, value);
                    });
                  }
                }}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: '1.5px solid var(--tab-underline)',
                  background: 'var(--sidebar-bg)',
                  color: 'var(--tab-underline)',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'background 0.18s, color 0.18s, border-color 0.18s',
                }}
              >恢复默认样式</button>
            </div>
          </div>
        )}
        {tab === 'style' && !selectedTask && (
          <div style={{ color: 'var(--sidebar-text)', textAlign: 'center', marginTop: 60, fontSize: 16 }}>未选中任何卡片</div>
        )}
      </div>
    </div>
  );
};

export default FormatSidebar; 
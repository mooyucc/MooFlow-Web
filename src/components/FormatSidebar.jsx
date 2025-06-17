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
  { type: 'roundRect', name: '圆角矩形', icon: <svg width="36" height="28"><rect x="4" y="4" width="28" height="20" rx="7" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'rect', name: '矩形', icon: <svg width="36" height="28"><rect x="4" y="4" width="28" height="20" rx="0" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'ellipse', name: '椭圆', icon: <svg width="36" height="28"><ellipse cx="18" cy="14" rx="14" ry="10" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'circle', name: '圆形', icon: <svg width="36" height="28"><ellipse cx="18" cy="14" rx="10" ry="10" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'diamond', name: '菱形', icon: <svg width="36" height="28"><polygon points="18,4 32,14 18,24 4,14" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'parallelogram', name: '平行四边形', icon: <svg width="36" height="28"><polygon points="10,4 32,4 26,24 4,24" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'hexagon', name: '六边形', icon: <svg width="36" height="28"><polygon points="9,4 27,4 32,14 27,24 9,24 4,14" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'pentagon', name: '五边形', icon: <svg width="36" height="28"><polygon points="18,4 32,14 26,24 10,24 4,14" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'trapezoid', name: '梯形', icon: <svg width="36" height="28"><polygon points="10,4 26,4 32,24 4,24" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'document', name: '文档', icon: <svg width="36" height="28"><path d="M6,6 H30 Q32,6 32,10 V18 Q32,22 28,22 H8 Q6,22 6,18 V10 Q6,6 10,6 Z" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'cloud', name: '云', icon: <svg width="36" height="28"><path d="M12,22 Q6,22 6,14 Q2,14 4,9 Q4,4 10,6 Q12,2 18,4 Q24,2 26,6 Q32,4 32,9 Q34,14 28,14 Q28,22 22,22 Q20,26 18,22 Q16,26 12,22 Z" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'flag', name: '旗帜', icon: <svg width="36" height="28"><path d="M6,6 L30,6 L26,14 L30,22 L6,22 Z" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'arrowRight', name: '右箭头', icon: <svg width="36" height="28"><polygon points="6,14 22,14 22,8 32,14 22,20 22,14 6,14" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'arrowLeft', name: '左箭头', icon: <svg width="36" height="28"><polygon points="30,14 14,14 14,8 4,14 14,20 14,14 30,14" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'doubleArrow', name: '双箭头', icon: <svg width="36" height="28"><polygon points="4,14 10,8 10,12 26,12 26,8 32,14 26,20 26,16 10,16 10,20 4,14" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'star', name: '星形', icon: <svg width="36" height="28"><polygon points="18,6 21,18 32,18 23,22 26,32 18,26 10,32 13,22 4,18 15,18" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'heart', name: '心形', icon: <svg width="36" height="28" viewBox="0 0 36 28"><path d="M18 6 C12 0, 4 4, 6 12 C4 18, 12 22, 18 26 C24 22, 32 18, 30 12 C32 4, 24 0, 18 6Z" stroke="var(--shape-stroke)" strokeWidth="2" fill="none"/></svg> },
  { type: 'quote', name: '引号', icon: <svg width="36" height="28"><text x="8" y="22" fontSize="18" fill="var(--shape-stroke)">""</text></svg> },
  { type: 'brace', name: '大括号', icon: <svg width="36" height="28"><text x="8" y="22" fontSize="18" fill="var(--shape-stroke)">{}</text></svg> },
  { type: 'bracket', name: '方括号', icon: <svg width="36" height="28"><text x="8" y="22" fontSize="18" fill="var(--shape-stroke)">[ ]</text></svg> },
  { type: 'parenthesis', name: '圆括号', icon: <svg width="36" height="28"><text x="8" y="22" fontSize="18" fill="var(--shape-stroke)">( )</text></svg> },
];

const FormatSidebar = ({
  visible,
  onClose,
  canvasProps,
  onCanvasChange,
  selectedTask,
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
  // 处理卡片样式变更
  const handleTaskStyleChange = (key, value) => {
    const updated = { ...localTaskStyle, [key]: value };
    setLocalTaskStyle(updated);
    onTaskStyleChange && onTaskStyleChange(updated);
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
        height: 'calc(100vh - 256px)',
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
                    left: 0,
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
        {tab === 'style' && selectedTask && (
          <div>
            {/* 形状选择器：下拉菜单方式 */}
            <div style={{ marginBottom: 18, position: 'relative', display: 'flex', alignItems: 'center', height: 36 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48, flex: 'none' }}>形状</div>
               {/* 形状选择器 */}
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
                  border: '1.5px solid var(--sidebar-border)', borderRadius: 8,
                  background: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', cursor: 'pointer',
                  fontSize: 14, fontWeight: 500, height: 32, width: '100%', marginLeft: 12,
                }}
                onClick={() => setShapeMenuOpen(v => !v)}
              >
                {currentShape.icon}
                <span style={{ fontSize: 14 }}>{currentShape.name}</span>
              </button>
              {shapeMenuOpen && (
                <div
                  className="shape-dropdown-menu"
                  style={{
                    position: 'absolute', zIndex: 10, top: 44, left: 0, width: '100%',
                    background: 'var(--dropdown-bg)', border: '1.5px solid var(--dropdown-border)', borderRadius: 10,
                    boxShadow: '0 4px 24px #0002', padding: 8,
                    color: 'var(--dropdown-text)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 2,
                    fontSize: 14,
                  }}
                >
                  {SHAPES.map((s, idx) => {
                    const isSelected = localTaskStyle?.shape === s.type;
                    const isHovered = hoveredShapeIdx === idx;
                    return (
                      <div
                        key={s.type}
                        onClick={() => { handleTaskStyleChange('shape', s.type); setShapeMenuOpen(false); }}
                        onMouseEnter={() => setHoveredShapeIdx(idx)}
                        onMouseLeave={() => setHoveredShapeIdx(-1)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', borderRadius: 6,
                          background: isHovered ? 'var(--dropdown-hover-bg)' : (isSelected ? 'var(--shape-bg)' : 'transparent'),
                          cursor: 'pointer', color: 'var(--dropdown-text)', fontSize: 14,
                          fontWeight: isSelected ? 700 : 400,
                          transition: 'background 0.18s',
                          height: 32,
                        }}
                      >
                        {s.icon}
                        <span style={{ fontSize: 14 }}>{s.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* 填充颜色 */}
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', height: 32 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48, flex: 'none' }}>填充</div>
              <button
                style={{
                  width: '100%',
                  height: 32,
                  border: '1.5px solid var(--sidebar-border)',
                  background: localTaskStyle?.fillColor || '#f8f8fa',
                  borderRadius: 8,
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: 12,
                  position: 'relative',
                }}
                onClick={() => setColorPickerOpen(v => v === 'fill' ? null : 'fill')}
                aria-label="选择填充颜色"
              />
              {colorPickerOpen === 'fill' && (
                <div
                  ref={fillPickerRef}
                  style={{
                    position: 'absolute',
                    zIndex: 10,
                    top: 44,
                    left: 0,
                    borderRadius: 10,
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'none',
                    boxShadow: '0 4px 24px #0002',
                    padding: 0,
                  }}
                >
                  <SketchPicker
                    color={localTaskStyle?.fillColor || '#f8f8fa'}
                    onChange={color => handleTaskStyleChange('fillColor', color.hex)}
                    disableAlpha
                    presetColors={['#ffffff', '#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4', '#222222']}
                  />
                </div>
              )}
            </div>
            {/* 分割线 */}
            <div style={{ borderTop: '1.5px solid var(--sidebar-border)', margin: '0 0 14px 0', height: 0 }} />
            {/* 边框颜色 */}
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', height: 32 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48, flex: 'none' }}>边框</div>
              <button
                style={{
                  width: '100%',
                  height: 32,
                  border: '1.5px solid var(--sidebar-border)',
                  background: localTaskStyle?.borderColor || '#e0e0e5',
                  borderRadius: 8,
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: 12,
                  position: 'relative',
                }}
                onClick={() => setColorPickerOpen(v => v === 'border' ? null : 'border')}
                aria-label="选择边框颜色"
              />
              {colorPickerOpen === 'border' && (
                <div
                  ref={borderPickerRef}
                  style={{
                    position: 'absolute',
                    zIndex: 10,
                    top: 44,
                    left: 0,
                    borderRadius: 10,
                    border: '1.5px solid var(--sidebar-border)',
                    background: 'none',
                    boxShadow: '0 4px 24px #0002',
                    padding: 0,
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
            {/* 边框粗细 */}
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', height: 32 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48, flex: 'none' }}>粗细</div>
              <select
                value={String(localTaskStyle?.borderWidth ?? 1.5)}
                onChange={e => handleTaskStyleChange('borderWidth', Number(e.target.value))}
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
                  marginLeft: 12,
                  minWidth: 100,
                }}
              >
                {LINE_WIDTHS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {/* 边框线形 */}
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', height: 32 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--sidebar-text)', minWidth: 48, flex: 'none' }}>线形</div>
              <select
                value={localTaskStyle?.borderStyle || 'solid'}
                onChange={e => handleTaskStyleChange('borderStyle', e.target.value)}
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
                  marginLeft: 12,
                  minWidth: 100,
                }}
              >
                {LINE_STYLES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {/* 新分割线：线形与文本之间 */}
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
                        left: 0,
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
                onClick={() => { setLocalTaskStyle({ ...selectedTask, ...defaultTaskStyle }); onTaskStyleChange && onTaskStyleChange(Object.assign({}, selectedTask, defaultTaskStyle)); }}
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
import React, { useState, useEffect, useRef } from 'react';
import { SketchPicker } from 'react-color';

const COLOR_SCHEMES = [
  { name: '彩虹', colors: ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4'] },
  { name: '蓝绿', colors: ['#1976d2', '#26a69a', '#80cbc4', '#b2dfdb', '#e0f2f1', '#00695c', '#0288d1'] },
  { name: '经典', colors: ['#3f51b5', '#e91e63', '#ffc107', '#009688', '#8bc34a', '#ff5722', '#607d8b'] },
];
const FONTS = ['默认', '思源黑体', '微软雅黑', 'Arial', 'Times New Roman', 'Roboto'];
const LINE_WIDTHS = ['默认', '细', '中', '粗'];

const FormatSidebar = ({
  visible,
  onClose,
  canvasProps,
  onCanvasChange,
}) => {
  // Tab页状态：canvas/style
  const [tab, setTab] = useState('canvas');
  // 动画状态
  const [popupVisible, setPopupVisible] = useState(false);
  const popupRef = useRef(null);

  // 本地状态用于表单编辑
  const [localProps, setLocalProps] = useState(canvasProps);

  // 处理属性变更
  const handleChange = (key, value) => {
    const updated = { ...localProps, [key]: value };
    setLocalProps(updated);
    onCanvasChange && onCanvasChange(updated);
  };

  // 动画控制
  useEffect(() => {
    if (visible) {
      setTimeout(() => setPopupVisible(true), 10);
    } else {
      setPopupVisible(false);
    }
  }, [visible]);

  // 外部点击关闭
  useEffect(() => {
    if (!visible) return;
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose && onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [visible, onClose]);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  if (!visible) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: 64,
        right: 0,
        width: 340,
        height: 'calc(100vh - 256px)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(48px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(48px) saturate(1.5)',
        boxShadow: '-2px 0 32px #0003',
        zIndex: 9999,
        padding: 0,
        overflowY: 'auto',
        transition: 'transform 0.35s cubic-bezier(.4,1.6,.4,1), opacity 0.25s',
        borderLeft: '1.5px solid #e3eaff',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '18px 0 0 18px',
        marginBottom: 0,
        opacity: popupVisible ? 1 : 0,
        transform: popupVisible ? 'translateX(0)' : 'translateX(100%)',
        borderTop: '1.5px solid #e3eaff',
        borderBottom: '1.5px solid #e3eaff',
        boxSizing: 'border-box',
        color: '#222',
        fontFamily: 'inherit',
      }}
    >
      {/* 顶部Tab栏 */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid #e3eaff', padding: '0 24px', height: 56, background: 'transparent' }}>
        <button
          onClick={() => setTab('canvas')}
          style={{
            flex: 1,
            height: 40,
            marginTop: 8,
            marginBottom: 0,
            border: 'none',
            background: tab === 'canvas' ? '#fff' : 'transparent',
            color: tab === 'canvas' ? '#316acb' : '#222',
            fontWeight: tab === 'canvas' ? 700 : 500,
            fontSize: 17,
            borderRadius: '12px 12px 0 0',
            cursor: 'pointer',
            transition: 'background 0.2s',
            boxShadow: tab === 'canvas' ? '0 2px 8px #316acb11' : 'none',
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
            background: tab === 'style' ? '#fff' : 'transparent',
            color: tab === 'style' ? '#316acb' : '#222',
            fontWeight: tab === 'style' ? 700 : 500,
            fontSize: 17,
            borderRadius: '12px 12px 0 0',
            cursor: 'pointer',
            transition: 'background 0.2s',
            boxShadow: tab === 'style' ? '0 2px 8px #316acb11' : 'none',
          }}
        >样式</button>
        <button
          style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888', transition: 'color 0.2s', marginLeft: 8 }}
          onClick={onClose}
          title="关闭"
          onMouseEnter={e => (e.currentTarget.style.color = '#f44336')}
          onMouseLeave={e => (e.currentTarget.style.color = '#888')}
        >×</button>
      </div>
      {/* 内容区 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {tab === 'canvas' && (
          <>
            {/* 背景颜色 */}
            <div style={{ marginBottom: 28, position: 'relative' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#222', marginBottom: 10 }}>背景颜色</div>
              <button
                style={{
                  width: 40,
                  height: 28,
                  border: '1.5px solid #e3eaff',
                  background: localProps.backgroundColor,
                  borderRadius: 8,
                  cursor: 'pointer',
                  verticalAlign: 'middle',
                  position: 'relative',
                }}
                onClick={() => setColorPickerOpen(v => !v)}
                aria-label="选择背景颜色"
              />
              {colorPickerOpen && (
                <div style={{
                  position: 'absolute',
                  zIndex: 10,
                  top: 40,
                  left: 0,
                  boxShadow: '0 4px 24px #0002',
                  background: '#fff',
                  borderRadius: 10,
                  padding: 16,
                }}>
                  <SketchPicker
                    color={localProps.backgroundColor}
                    onChange={color => handleChange('backgroundColor', color.hex)}
                    disableAlpha
                    presetColors={[
                      '#ffffff', '#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#00bcd4', '#222222'
                    ]}
                  />
                  <div style={{textAlign: 'right', marginTop: 8}}>
                    <button onClick={() => setColorPickerOpen(false)} style={{fontSize: 13, color: '#316acb', background: 'none', border: 'none', cursor: 'pointer'}}>关闭</button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ borderTop: '1.5px solid #f0f1f5', margin: '0 -24px 24px', height: 0 }} />
            {/* 全局字体 */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#222', marginBottom: 10 }}>全局字体</div>
              <select
                value={localProps.fontFamily}
                onChange={e => handleChange('fontFamily', e.target.value)}
                style={{
                  width: '100%',
                  fontSize: 14,
                  borderRadius: 10,
                  padding: '4px 12px',
                  height: 36,
                  lineHeight: '24px',
                  border: '1px solid #e5e5ea',
                  background: '#f9f9fb',
                  color: '#222',
                  fontWeight: 400,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  transition: 'border-color 0.2s',
                }}
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ borderTop: '1.5px solid #f0f1f5', margin: '0 -24px 24px', height: 0 }} />
            {/* 网格开关与大小 */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#222', marginBottom: 10 }}>网格</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <input
                  type="checkbox"
                  checked={!!localProps.showGrid}
                  onChange={e => handleChange('showGrid', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#316acb' }}
                />
                <span style={{ fontWeight: 500, fontSize: 15, color: '#222' }}>显示网格</span>
              </label>
              {localProps.showGrid && (
                <div style={{ marginTop: 0 }}>
                  <span style={{ fontSize: 14, marginRight: 8, color: '#555' }}>网格大小</span>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={localProps.gridSize || 40}
                    onChange={e => handleChange('gridSize', Number(e.target.value))}
                    style={{
                      width: 60,
                      fontSize: 14,
                      borderRadius: 10,
                      padding: '4px 6px',
                      height: 32,
                      lineHeight: '24px',
                      border: '1px solid #e5e5ea',
                      background: '#f9f9fb',
                      color: '#222',
                      fontWeight: 400,
                      appearance: 'textfield',
                      WebkitAppearance: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}
        {tab === 'style' && (
          <div style={{ color: '#aaa', textAlign: 'center', marginTop: 60, fontSize: 16 }}>样式设置内容暂未实现</div>
        )}
      </div>
    </div>
  );
};

export default FormatSidebar; 
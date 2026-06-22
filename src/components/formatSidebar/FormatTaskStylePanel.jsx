import React from 'react';
import { SketchPicker } from 'react-color';
import { defaultTaskStyle } from '../../store/taskStore';
import PopupPortal from '../PopupPortal';
import { SHAPES } from '../../constants/shapes';
import { COLOR_SCHEMES, FONTS, LINE_WIDTHS, LINE_STYLES } from '../../constants/formatOptions';

const pickerStyles = {
  default: {
    picker: {
      background: 'var(--dropdown-bg)',
      boxShadow: 'none',
      borderRadius: 12,
      width: 260,
      padding: '12px',
    },
  },
};

const FormatTaskStylePanel = ({
  t,
  selectedTask,
  selectedTasks,
  localTaskStyle,
  getMultiValue,
  handleTaskStyleChange,
  handleColorButtonClick,
  colorPickerOpen,
  setColorPickerOpen,
  colorPickerPosition,
  popupRef,
  shapeMenuOpen,
  setShapeMenuOpen,
  hoveredShapeIdx,
  setHoveredShapeIdx,
  currentShape,
  onTaskStyleChange,
}) => {
  const popupRight = `calc(${window.innerWidth - (popupRef.current?.getBoundingClientRect().left || 0)}px + 16px)`;

  return (
    <>
      {selectedTasks && selectedTasks.length > 1 && (
        <div className="format-sidebar__banner">
          <span className="format-sidebar__banner-dot" aria-hidden="true" />
          {t('batch_style', { count: selectedTasks.length })}
        </div>
      )}

      {/* 重要性 */}
      <section className="format-sidebar__section">
        <div className="format-sidebar__row">
          <span className="format-sidebar__section-title format-sidebar__section-title--inline">{t('important')}</span>
          <div className="format-sidebar__control">
            <select
              className="format-sidebar__select"
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
                  handleTaskStyleChange('borderWidth', 2);
                } else if (e.target.value === 'secondary') {
                  handleTaskStyleChange('importantLevel', e.target.value);
                  handleTaskStyleChange('borderColor', '#ff9800');
                  handleTaskStyleChange('borderWidth', 2);
                } else {
                  handleTaskStyleChange('importantLevel', e.target.value);
                  handleTaskStyleChange('borderColor', defaultTaskStyle.borderColor);
                  handleTaskStyleChange('borderWidth', defaultTaskStyle.borderWidth);
                }
              }}
            >
              <option value="important">{t('important')}</option>
              <option value="secondary">{t('secondary')}</option>
              <option value="normal">{t('normal')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* 形状 / 填充 / 边框 */}
      <section className="format-sidebar__section">
        <h3 className="format-sidebar__section-title">{t('shape')}</h3>

        <div className="format-sidebar__row">
          <span className="format-sidebar__label">{t('shape')}</span>
          <div className="format-sidebar__control" style={{ position: 'relative' }}>
            <button
              className="format-sidebar__btn format-sidebar__shape-btn"
              onClick={() => setShapeMenuOpen(v => !v)}
            >
              {(selectedTasks && selectedTasks.length > 1)
                ? (SHAPES.find(s => s.type === getMultiValue('shape'))?.icon || SHAPES[0].icon)
                : currentShape.icon}
              <span>
                {(selectedTasks && selectedTasks.length > 1)
                  ? (SHAPES.find(s => s.type === getMultiValue('shape'))?.name || '-')
                  : t(currentShape.name)}
              </span>
            </button>
            {shapeMenuOpen && (
              <PopupPortal onClickOutside={() => setShapeMenuOpen(false)}>
                <div
                  className="format-sidebar format-sidebar__popup format-sidebar__shape-menu"
                  style={{
                    position: 'fixed',
                    top: popupRef.current?.querySelector('.format-sidebar__shape-btn')?.getBoundingClientRect().bottom + 8,
                    left: (popupRef.current?.querySelector('.format-sidebar__shape-btn')?.getBoundingClientRect().left || 0) - 43,
                    zIndex: 99999,
                  }}
                >
                  {SHAPES.map((s, idx) => {
                    const isSelected = getMultiValue('shape') === s.type;
                    const isHovered = hoveredShapeIdx === idx;
                    return (
                      <div
                        key={s.type}
                        className={`format-sidebar__shape-item${(isHovered || isSelected) ? ' format-sidebar__shape-item--active' : ''}`}
                        onClick={() => { handleTaskStyleChange('shape', s.type); setShapeMenuOpen(false); }}
                        onMouseEnter={() => setHoveredShapeIdx(idx)}
                        onMouseLeave={() => setHoveredShapeIdx(-1)}
                      >
                        {s.icon}
                        <span>{t(s.name)}</span>
                      </div>
                    );
                  })}
                </div>
              </PopupPortal>
            )}
          </div>
        </div>

        <div className="format-sidebar__row">
          <span className="format-sidebar__label">{t('fill')}</span>
          <div className="format-sidebar__control">
            <button
              className="format-sidebar__btn format-sidebar__btn--color"
              style={{
                background: (selectedTasks && selectedTasks.length > 1)
                  ? (getMultiValue('fillColor') || '#f8f8fa')
                  : (localTaskStyle?.fillColor || '#f8f8fa'),
              }}
              onClick={(e) => handleColorButtonClick('fill', e)}
              aria-label={t('select_fill_color')}
            />
            {colorPickerOpen === 'fill' && (
              <PopupPortal onClickOutside={() => setColorPickerOpen(null)}>
                <div
                  className="format-sidebar format-sidebar__popup"
                  style={{ position: 'fixed', top: colorPickerPosition.top, right: popupRight, zIndex: 99999, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}
                >
                  <SketchPicker
                    color={(selectedTasks && selectedTasks.length > 1)
                      ? (getMultiValue('fillColor') || '#f8f8fa')
                      : (localTaskStyle?.fillColor || '#f8f8fa')}
                    onChange={color => handleTaskStyleChange('fillColor', color.hex)}
                    disableAlpha
                    presetColors={COLOR_SCHEMES.flatMap(scheme => scheme.colors)}
                    styles={pickerStyles}
                  />
                </div>
              </PopupPortal>
            )}
          </div>
        </div>

        <div className="format-sidebar__row">
          <span className="format-sidebar__label">{t('border')}</span>
          <div className="format-sidebar__control-row">
            <select
              className="format-sidebar__select"
              value={localTaskStyle?.borderStyle || 'solid'}
              onChange={e => handleTaskStyleChange('borderStyle', e.target.value)}
            >
              {LINE_STYLES.map(opt => (
                <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
              ))}
            </select>
            <button
              className="format-sidebar__btn format-sidebar__btn--color"
              style={{ flex: 1, background: localTaskStyle?.borderColor || '#e0e0e5' }}
              onClick={(e) => handleColorButtonClick('border', e)}
              aria-label={t('select_border_color')}
            />
            {colorPickerOpen === 'border' && (
              <PopupPortal onClickOutside={() => setColorPickerOpen(null)}>
                <div
                  className="format-sidebar format-sidebar__popup"
                  style={{ position: 'fixed', top: colorPickerPosition.top, right: popupRight, zIndex: 99999, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}
                >
                  <SketchPicker
                    color={localTaskStyle?.borderColor || '#e0e0e5'}
                    onChange={color => handleTaskStyleChange('borderColor', color.hex)}
                    disableAlpha
                    presetColors={COLOR_SCHEMES.flatMap(scheme => scheme.colors)}
                    styles={pickerStyles}
                  />
                </div>
              </PopupPortal>
            )}
          </div>
        </div>

        <div className="format-sidebar__row">
          <span className="format-sidebar__label">{t('thickness')}</span>
          <div className="format-sidebar__control">
            <select
              className="format-sidebar__select"
              value={String(localTaskStyle?.borderWidth ?? 1.5)}
              onChange={e => handleTaskStyleChange('borderWidth', Number(e.target.value))}
            >
              {LINE_WIDTHS.map(opt => (
                <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 文本设置 */}
      <section className="format-sidebar__section">
        <h3 className="format-sidebar__section-title">{t('text')}</h3>

        <div className="format-sidebar__control-row" style={{ marginBottom: 10 }}>
          <select
            className="format-sidebar__select"
            style={{ flex: '1 1 65%' }}
            value={localTaskStyle?.fontFamily || FONTS[0].value}
            onChange={e => handleTaskStyleChange('fontFamily', e.target.value)}
          >
            {FONTS.map(f => <option key={f.value} value={f.value}>{t(f.label)}</option>)}
          </select>
          <input
            type="number"
            className="format-sidebar__input"
            style={{ flex: '0 0 35%' }}
            min={10}
            max={48}
            value={localTaskStyle?.fontSize || 16}
            onChange={e => handleTaskStyleChange('fontSize', Number(e.target.value))}
            aria-label={t('text')}
          />
        </div>

        <div className="format-sidebar__control-row" style={{ marginBottom: 10 }}>
          <select
            className="format-sidebar__select"
            style={{ flex: '1 1 65%' }}
            value={localTaskStyle?.fontWeight || '500'}
            onChange={e => handleTaskStyleChange('fontWeight', e.target.value)}
          >
            <option value="300">{t('light')}</option>
            <option value="400">{t('regular')}</option>
            <option value="500">{t('medium')}</option>
            <option value="700">{t('bold')}</option>
          </select>
          <button
            className="format-sidebar__btn format-sidebar__btn--color"
            style={{ flex: '0 0 35%', background: localTaskStyle?.color || '#fff' }}
            onClick={(e) => handleColorButtonClick('font', e)}
            aria-label={t('select_font_color')}
          />
          {colorPickerOpen === 'font' && (
            <PopupPortal onClickOutside={() => setColorPickerOpen(null)}>
              <div
                className="format-sidebar format-sidebar__popup"
                style={{ position: 'fixed', top: colorPickerPosition.top, right: popupRight, zIndex: 99999, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}
              >
                <SketchPicker
                  color={localTaskStyle?.color || '#222222'}
                  onChange={color => handleTaskStyleChange('color', color.hex)}
                  disableAlpha
                  presetColors={COLOR_SCHEMES.flatMap(scheme => scheme.colors)}
                  styles={pickerStyles}
                />
              </div>
            </PopupPortal>
          )}
        </div>

        <div className="format-sidebar__toggle-group" style={{ marginBottom: 10 }}>
          <button
            type="button"
            className={`format-sidebar__toggle-btn${localTaskStyle?.fontWeight === '700' ? ' format-sidebar__toggle-btn--active' : ''}`}
            title={t('bold')}
            onClick={() => handleTaskStyleChange('fontWeight', localTaskStyle?.fontWeight === '700' ? '500' : '700')}
          ><b>B</b></button>
          <button
            type="button"
            className={`format-sidebar__toggle-btn${localTaskStyle?.fontStyle === 'italic' ? ' format-sidebar__toggle-btn--active' : ''}`}
            title={t('italic')}
            onClick={() => handleTaskStyleChange('fontStyle', localTaskStyle?.fontStyle === 'italic' ? 'normal' : 'italic')}
          ><i>I</i></button>
          <button
            type="button"
            className={`format-sidebar__toggle-btn${localTaskStyle?.textDecoration === 'underline' ? ' format-sidebar__toggle-btn--active' : ''}`}
            title={t('underline')}
            style={{ textDecoration: 'underline' }}
            onClick={() => handleTaskStyleChange('textDecoration', localTaskStyle?.textDecoration === 'underline' ? 'none' : 'underline')}
          >U</button>
          <button
            type="button"
            className={`format-sidebar__toggle-btn${localTaskStyle?.textDecoration === 'line-through' ? ' format-sidebar__toggle-btn--active' : ''}`}
            title={t('strikethrough')}
            style={{ textDecoration: 'line-through', fontSize: 13 }}
            onClick={() => handleTaskStyleChange('textDecoration', localTaskStyle?.textDecoration === 'line-through' ? 'none' : 'line-through')}
          >ab</button>
        </div>

        <div className="format-sidebar__toggle-group">
          <button
            type="button"
            className={`format-sidebar__toggle-btn${localTaskStyle?.textAlign === 'left' ? ' format-sidebar__toggle-btn--active' : ''}`}
            onClick={() => handleTaskStyleChange('textAlign', 'left')}
            aria-label={t('text')}
          >
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="14" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2" y="8" width="18" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2" y="13" width="10" height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
          </button>
          <button
            type="button"
            className={`format-sidebar__toggle-btn${localTaskStyle?.textAlign === 'center' ? ' format-sidebar__toggle-btn--active' : ''}`}
            onClick={() => handleTaskStyleChange('textAlign', 'center')}
          >
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true">
              <rect x="4" y="3" width="14" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2" y="8" width="18" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="6" y="13" width="10" height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
          </button>
          <button
            type="button"
            className={`format-sidebar__toggle-btn${localTaskStyle?.textAlign === 'right' ? ' format-sidebar__toggle-btn--active' : ''}`}
            onClick={() => handleTaskStyleChange('textAlign', 'right')}
          >
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true">
              <rect x="6" y="3" width="14" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="2" y="8" width="18" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="10" y="13" width="10" height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </section>

      <div className="format-sidebar__footer">
        <button
          className="format-sidebar__btn format-sidebar__btn--secondary"
          onClick={() => {
            if (onTaskStyleChange && (selectedTask || selectedTasks?.length > 0)) {
              Object.entries(defaultTaskStyle).forEach(([key, value]) => {
                onTaskStyleChange(key, value);
              });
            }
          }}
        >{t('reset_style')}</button>
      </div>
    </>
  );
};

export default FormatTaskStylePanel;

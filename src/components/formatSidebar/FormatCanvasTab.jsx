import React, { useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import PopupPortal from '../PopupPortal';
import { COLOR_PALETTES } from '../../constants/colorPalettes';
import { COLOR_SCHEMES } from '../../constants/formatOptions';

const FormatCanvasTab = ({
  t,
  localProps,
  handleChange,
  paletteIdx,
  handlePaletteChange,
  handleColorButtonClick,
  colorPickerOpen,
  setColorPickerOpen,
  colorPickerPosition,
  popupRef,
}) => {
  const paletteBtnRef = useRef(null);
  const [palettePopupOpen, setPalettePopupOpen] = useState(false);
  const [palettePopupPosition, setPalettePopupPosition] = useState({ top: 0, right: 0 });

  return (
    <>
      {/* 配色方案 */}
      <section className="format-sidebar__section">
        <h3 className="format-sidebar__section-title">{t('palette_scheme')}</h3>
        <button
          ref={paletteBtnRef}
          className="format-sidebar__btn format-sidebar__btn--palette"
          onClick={() => {
            if (paletteBtnRef.current) {
              const rect = paletteBtnRef.current.getBoundingClientRect();
              setPalettePopupPosition({
                top: rect.top - 150,
                right: window.innerWidth - rect.left + 16,
              });
            }
            setPalettePopupOpen(true);
          }}
        >
          <div className="format-sidebar__swatches">
            {paletteIdx === null ? (
              <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 13 }}>—</span>
            ) : (
              COLOR_PALETTES[paletteIdx]?.colors.map((c, i) => (
                <div key={i} className="format-sidebar__swatch" style={{ background: c }} />
              ))
            )}
          </div>
          <span className="format-sidebar__palette-name">
            {paletteIdx === null ? t('no_palette_scheme') : t(COLOR_PALETTES[paletteIdx]?.name)}
          </span>
        </button>
        {palettePopupOpen && (
          <PopupPortal onClickOutside={() => setPalettePopupOpen(false)}>
            <div
              className="format-sidebar format-sidebar__popup format-sidebar__popup--palette"
              style={{
                position: 'fixed',
                top: palettePopupPosition.top,
                right: palettePopupPosition.right,
                zIndex: 99999,
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
            >
              <p className="format-sidebar__popup-title">{t('classic')}</p>
              <div className="format-sidebar__palette-grid">
                {COLOR_PALETTES.map((palette, idx) => (
                  <div
                    key={palette.name}
                    className={`format-sidebar__palette-item${paletteIdx === idx ? ' format-sidebar__palette-item--active' : ''}`}
                    onClick={() => { handlePaletteChange(idx); setPalettePopupOpen(false); }}
                  >
                    <div className="format-sidebar__swatches">
                      {palette.colors.map((c, i) => (
                        <div key={i} className="format-sidebar__swatch" style={{ width: 22, height: 12, background: c }} />
                      ))}
                    </div>
                    <span className="format-sidebar__palette-item-label">{t(palette.name)}</span>
                  </div>
                ))}
                <div
                  className={`format-sidebar__palette-item${paletteIdx === null ? ' format-sidebar__palette-item--active' : ''}`}
                  onClick={() => { handlePaletteChange(null); setPalettePopupOpen(false); }}
                >
                  <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 13 }}>—</span>
                  <span className="format-sidebar__palette-item-label">{t('no_palette_scheme')}</span>
                </div>
              </div>
            </div>
          </PopupPortal>
        )}
      </section>

      {/* 背景颜色 */}
      <section className="format-sidebar__section">
        <h3 className="format-sidebar__section-title">{t('background_color')}</h3>
        <button
          className="format-sidebar__btn format-sidebar__btn--color"
          style={{ background: localProps.backgroundColor }}
          onClick={(e) => handleColorButtonClick('bg', e)}
          aria-label={t('select_background_color')}
        />
        {colorPickerOpen === 'bg' && (
          <PopupPortal onClickOutside={() => setColorPickerOpen(null)}>
            <div
              className="format-sidebar format-sidebar__popup"
              style={{
                position: 'fixed',
                top: colorPickerPosition.top,
                right: `calc(${window.innerWidth - (popupRef.current?.getBoundingClientRect().left || 0)}px + 16px)`,
                zIndex: 99999,
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
                  },
                }}
              />
            </div>
          </PopupPortal>
        )}
      </section>

      {/* 网格 */}
      <section className="format-sidebar__section">
        <h3 className="format-sidebar__section-title">{t('grid')}</h3>
        <label className="format-sidebar__checkbox-row">
          <input
            type="checkbox"
            checked={!!localProps.showGrid}
            onChange={e => handleChange('showGrid', e.target.checked)}
          />
          <span className="format-sidebar__checkbox-label">{t('show_grid')}</span>
        </label>
        <label className="format-sidebar__checkbox-row" style={{ marginTop: 10 }}>
          <input
            type="checkbox"
            checked={!!localProps.snapToGrid}
            onChange={e => handleChange('snapToGrid', e.target.checked)}
          />
          <span className="format-sidebar__checkbox-label">{t('snap_to_grid')}</span>
        </label>
        {(localProps.showGrid || localProps.snapToGrid) && (
          <div className="format-sidebar__row" style={{ marginTop: 10 }}>
            <span className="format-sidebar__label">{t('grid_size')}</span>
            <div className="format-sidebar__control">
              <select
                className="format-sidebar__select"
                value={localProps.gridSize || 20}
                onChange={e => handleChange('gridSize', Number(e.target.value))}
              >
                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default FormatCanvasTab;

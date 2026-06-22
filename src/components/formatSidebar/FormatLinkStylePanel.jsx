import React from 'react';
import { SketchPicker } from 'react-color';
import { defaultLinkStyle } from '../../store/taskStore';
import PopupPortal from '../PopupPortal';
import { COLOR_SCHEMES, LINE_WIDTHS, LINE_STYLES } from '../../constants/formatOptions';
import { ARROW_STYLES } from '../../constants/arrowStyles';
import { getBranchStyleValue as getBranchStyleValueUtil } from '../../utils/branchStyle';

const FormatLinkStylePanel = ({
  t,
  selectedLink,
  selectedTasks,
  tasks,
  onBranchStyleChange,
  handleColorButtonClick,
  colorPickerOpen,
  setColorPickerOpen,
  colorPickerPosition,
  popupRef,
  branchPickerRef,
}) => {
  const getBranchStyleValue = (key) =>
    getBranchStyleValueUtil(key, { selectedLink, selectedTasks, tasks });

  return (
    <>
      <section className="format-sidebar__section">
        <h3 className="format-sidebar__section-title">{t('branch')}</h3>

        <div className="format-sidebar__row">
          <span className="format-sidebar__label">{t('line_style')}</span>
          <div className="format-sidebar__control">
            <select
              className="format-sidebar__select"
              value={getBranchStyleValue('lineStyle')}
              onChange={e => onBranchStyleChange?.('lineStyle', e.target.value)}
            >
              {LINE_STYLES.map(style => (
                <option key={style.value} value={style.value}>{t(style.label)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="format-sidebar__row">
          <span className="format-sidebar__label">{t('arrow_style')}</span>
          <div className="format-sidebar__control">
            <select
              className="format-sidebar__select"
              value={getBranchStyleValue('arrowStyle')}
              onChange={e => onBranchStyleChange?.('arrowStyle', e.target.value)}
            >
              {ARROW_STYLES.map(style => (
                <option key={style.value} value={style.value}>{t(style.label)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="format-sidebar__row">
          <span className="format-sidebar__label">{t('thickness')}</span>
          <div className="format-sidebar__control">
            <select
              className="format-sidebar__select"
              value={getBranchStyleValue('lineWidth')}
              onChange={e => onBranchStyleChange?.('lineWidth', Number(e.target.value))}
            >
              {LINE_WIDTHS.map(width => (
                <option key={width.value} value={width.value}>{t(width.label)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="format-sidebar__row">
          <span className="format-sidebar__label">{t('color')}</span>
          <div className="format-sidebar__control">
            <button
              className="format-sidebar__btn format-sidebar__btn--color"
              style={{ background: getBranchStyleValue('color') }}
              onClick={(e) => handleColorButtonClick('branch', e)}
              aria-label={t('select_line_color')}
            />
            {colorPickerOpen === 'branch' && (
              <PopupPortal onClickOutside={() => setColorPickerOpen(null)}>
                <div
                  ref={branchPickerRef}
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
                      },
                    }}
                  />
                </div>
              </PopupPortal>
            )}
          </div>
        </div>
      </section>

      <div className="format-sidebar__footer">
        <button
          className="format-sidebar__btn format-sidebar__btn--secondary"
          onClick={() => {
            if (onBranchStyleChange && selectedLink) {
              Object.entries(defaultLinkStyle).forEach(([key, value]) => {
                onBranchStyleChange(key, value);
              });
            }
          }}
        >{t('reset_style')}</button>
      </div>
    </>
  );
};

export default FormatLinkStylePanel;

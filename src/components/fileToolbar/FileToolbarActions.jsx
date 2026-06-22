import React from 'react';
import Tooltip from '../common/Tooltip';
import { FormatPanelIcon } from '../icons/AppIcons';

const FileToolbarActions = ({
  formatLabel,
  showFormatSidebar,
  onFormatToggle,
}) => (
  <Tooltip text={formatLabel}>
    <button
      type="button"
      className={`toolbar-btn format-btn${showFormatSidebar ? ' toolbar-btn--active' : ''}`}
      onClick={onFormatToggle}
      aria-label={formatLabel}
      aria-pressed={showFormatSidebar}
      style={{ marginRight: 8 }}
    >
      <FormatPanelIcon />
    </button>
  </Tooltip>
);

export default FileToolbarActions;

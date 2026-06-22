import React from 'react';
import Tooltip from '../common/Tooltip';
import { OpenFileIcon, SaveFileIcon, ExportCsvIcon } from './FileToolbarIcons';

const btnStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  padding: '0 8px',
  minHeight: 28,
  whiteSpace: 'nowrap',
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 500,
};

const LocalFileToolbarButtons = ({
  openLabel,
  saveLabel,
  exportCsvLabel,
  openTitle,
  saveTitle,
  exportCsvTitle,
  linkedFileName,
  onOpen,
  onSave,
  onExportCsv,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 4 }}>
    <Tooltip text={openTitle}>
      <button type="button" className="toolbar-btn" onClick={onOpen} aria-label={openTitle} style={btnStyle}>
        <OpenFileIcon />
        <span style={labelStyle}>{openLabel}</span>
      </button>
    </Tooltip>
    <Tooltip text={linkedFileName ? `${saveTitle} (${linkedFileName})` : saveTitle}>
      <button type="button" className="toolbar-btn" onClick={onSave} aria-label={saveTitle} style={btnStyle}>
        <SaveFileIcon />
        <span style={labelStyle}>{saveLabel}</span>
      </button>
    </Tooltip>
    {onExportCsv && (
      <Tooltip text={exportCsvTitle}>
        <button type="button" className="toolbar-btn" onClick={onExportCsv} aria-label={exportCsvTitle} style={btnStyle}>
          <ExportCsvIcon />
          <span style={labelStyle}>{exportCsvLabel}</span>
        </button>
      </Tooltip>
    )}
  </div>
);

export default LocalFileToolbarButtons;

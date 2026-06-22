import React from 'react';
import Tooltip from '../common/Tooltip';
import { NewFileIcon } from './FileToolbarIcons';

const FileNameBar = ({
  fileName,
  renaming,
  renameValue,
  newFileLabel,
  onRenameStart,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  onNewFileClick,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 4 }}>
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
      {renaming ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onBlur={onRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRenameSubmit();
            if (e.key === 'Escape') onRenameCancel();
          }}
          style={{
            maxWidth: 180,
            fontSize: 14,
            fontWeight: 500,
            border: '1px solid var(--accent-color)',
            borderRadius: 8,
            padding: '4px 8px',
            outline: 'none',
            color: 'var(--filebar-text)',
            background: 'var(--card-bg)',
          }}
        />
      ) : (
        <span
          className="file-tab active"
          style={{
            padding: '4px 10px',
            borderRadius: 10,
            background: 'var(--accent-color)',
            color: '#fff',
            fontWeight: 500,
            fontSize: 14,
            maxWidth: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'default',
            alignSelf: 'flex-start',
          }}
          onDoubleClick={onRenameStart}
          title={fileName}
        >
          {fileName}
        </span>
      )}
    </div>
    <Tooltip text={newFileLabel}>
      <button type="button" className="toolbar-btn" onClick={onNewFileClick}>
        <NewFileIcon />
      </button>
    </Tooltip>
  </div>
);

export default FileNameBar;

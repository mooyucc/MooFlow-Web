import React from 'react';
import ReactDOM from 'react-dom';

const DatePickerPortal = ({ anchorRect, children }) => {
  if (!anchorRect) return null;
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: anchorRect.bottom + 4, // 紧贴下方
        left: anchorRect.left,
        zIndex: 9999,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderRadius: 8,
      }}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};

export default DatePickerPortal; 
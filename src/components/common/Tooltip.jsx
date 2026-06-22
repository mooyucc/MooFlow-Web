import React from 'react';

const Tooltip = ({ text, children }) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-text)',
            color: 'var(--color-surface-elevated)',
            padding: '5px 10px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 10000,
            pointerEvents: 'none',
            boxShadow: 'var(--toolbar-shadow)',
            transition: 'opacity var(--transition-fast)',
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default Tooltip;

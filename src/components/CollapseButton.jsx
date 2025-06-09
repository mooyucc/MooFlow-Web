import React from 'react';

// XMind风格的折叠/展开按钮
const CollapseButton = ({ collapsed, onClick }) => (
  <svg
    width="20"
    height="20"
    style={{
      cursor: 'pointer',
      marginRight: 6,
      background: '#fff',
      borderRadius: '50%',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      border: '1px solid #e0e0e5',
      display: 'inline-block',
      verticalAlign: 'middle',
      transition: 'box-shadow 0.2s',
    }}
    onClick={onClick}
  >
    <circle cx="10" cy="10" r="9" fill="#fff" stroke="#e0e0e5" strokeWidth="1" />
    <line x1="6" y1="10" x2="14" y2="10" stroke="#316acb" strokeWidth="2" strokeLinecap="round" />
    {!collapsed && (
      <line x1="10" y1="6" x2="10" y2="14" stroke="#316acb" strokeWidth="2" strokeLinecap="round" />
    )}
  </svg>
);

export default CollapseButton; 
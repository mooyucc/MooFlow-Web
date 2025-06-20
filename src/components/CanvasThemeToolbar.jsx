import React from 'react';
import './CanvasThemeToolbar.css';

const LightModeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

const DarkModeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

const LIGHT_COLOR = '#ebebeb';
const DARK_COLOR = '#2d2d2d';

const CanvasThemeToolbar = ({ canvasProps, setCanvasProps }) => {
    const isDarkMode = canvasProps.backgroundColor === DARK_COLOR;

    const toggleTheme = () => {
        setCanvasProps(prevProps => ({
            ...prevProps,
            backgroundColor: isDarkMode ? LIGHT_COLOR : DARK_COLOR,
        }));
    };

    return (
        <div className="canvas-theme-toolbar">
            <button className="toolbar-btn" title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'} onClick={toggleTheme}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </button>
        </div>
    );
};

export default CanvasThemeToolbar; 
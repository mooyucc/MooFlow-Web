import React from 'react';
import './CanvasThemeToolbar.css';
import { useTranslation } from '../LanguageContext';

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

const LangIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
    </svg>
);

const LIGHT_COLOR = '#ebebeb';
const DARK_COLOR = '#2d2d2d';

const CanvasThemeToolbar = ({ canvasProps, setCanvasProps }) => {
    const isDarkMode = canvasProps.backgroundColor === DARK_COLOR;
    const [t, lang, setLang] = useTranslation();

    const toggleTheme = () => {
        setCanvasProps(prevProps => ({
            ...prevProps,
            backgroundColor: isDarkMode ? LIGHT_COLOR : DARK_COLOR,
        }));
    };

    const toggleLang = () => {
        setLang(lang === 'zh' ? 'en' : 'zh');
    };

    return (
        <div className="canvas-theme-toolbar">
            <button
                className="toolbar-btn"
                title={isDarkMode ? t('toggle_light') : t('toggle_dark')}
                onClick={toggleTheme}
                style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    fontWeight: 700,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </button>
            <button
                className="toolbar-btn"
                title={t('toggle_lang')}
                onClick={toggleLang}
                style={{
                    marginLeft: 8,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    fontWeight: 600,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {lang === 'zh' ? 'En' : '中'}
            </button>
        </div>
    );
};

export default CanvasThemeToolbar; 
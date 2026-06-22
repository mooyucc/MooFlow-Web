import React from 'react';
import './CanvasThemeToolbar.css';
import { useTranslation } from '../LanguageContext';
import { useCanvasSettingsStore } from '../store/canvasSettingsStore';
import { LightModeIcon, DarkModeIcon, LangIcon } from './icons/AppIcons';

const LIGHT_COLOR = '#ebebeb';
const DARK_COLOR = '#2d2d2d';

const CanvasThemeToolbar = () => {
    const canvasProps = useCanvasSettingsStore(state => state.canvasProps);
    const setCanvasProps = useCanvasSettingsStore(state => state.setCanvasProps);
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
        <div className="canvas-theme-toolbar" style={{ touchAction: 'manipulation' }}>
            <button
                type="button"
                className="toolbar-btn"
                title={isDarkMode ? t('toggle_light') : t('toggle_dark')}
                onClick={toggleTheme}
                aria-label={isDarkMode ? t('toggle_light') : t('toggle_dark')}
            >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </button>
            <button
                type="button"
                className="toolbar-btn"
                title={t('toggle_lang')}
                onClick={toggleLang}
                aria-label={t('toggle_lang')}
            >
                <LangIcon />
            </button>
        </div>
    );
};

export default CanvasThemeToolbar;

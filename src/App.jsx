import React, { useEffect, useState } from "react";
import CanvasRouter from "./components/CanvasRouter";
import { LanguageProvider, useTranslation } from "./LanguageContext";
import { useBeforeUnloadSaveGuard } from "./hooks/useBeforeUnloadSaveGuard";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import { useInitialFileLoad } from "./hooks/useFileOperations";
import { consumeNewFileTabParam, isLaunchTabRequest } from "./utils/newFileTab";
import { ArrowRightIcon, LangIcon } from "./components/icons/AppIcons";

const MooFlowLogo = () => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="8" width="10" height="7" rx="2" fill="currentColor" stroke="none" opacity="0.9" />
    <rect x="18" y="17" width="10" height="7" rx="2" fill="currentColor" stroke="none" opacity="0.7" />
    <path d="M14 11.5h4M22 17v-3.5h-4" />
  </svg>
);

function WelcomeScreen({ onEnter }) {
  const [t, lang, setLang] = useTranslation();

  const toggleLang = () => {
    setLang(lang === "zh" ? "en" : "zh");
  };

  return (
    <div className="welcome-screen">
      <button
        type="button"
        className="welcome-lang-btn"
        onClick={toggleLang}
        title={t("toggle_lang")}
        aria-label={t("toggle_lang")}
      >
        <LangIcon />
        <span>{lang === "zh" ? t("lang_en") : t("lang_zh")}</span>
      </button>
      <div className="welcome-card">
        <div className="welcome-logo" aria-hidden="true">
          <MooFlowLogo />
        </div>
        <h1 className="welcome-title">{t("welcome_title")}</h1>
        <p className="welcome-subtitle">{t("welcome_subtitle")}</p>
        <button type="button" className="welcome-cta" onClick={onEnter}>
          <span>{t("enter_canvas")}</span>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

function CanvasApp() {
  useInitialFileLoad();
  useBeforeUnloadSaveGuard(true);
  useDocumentTitle();
  return <CanvasRouter />;
}

export default function App() {
  const [entered, setEntered] = useState(() => isLaunchTabRequest());

  useEffect(() => {
    consumeNewFileTabParam();
  }, []);

  if (!entered) {
    return (
      <LanguageProvider>
        <WelcomeScreen onEnter={() => setEntered(true)} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <CanvasApp />
    </LanguageProvider>
  );
}

import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import app from "./cloudbase";
import MainCanvas from "./components/MainCanvas";
import { LanguageProvider } from "./LanguageContext";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // 检查当前登录状态
    app.auth().getLoginState().then(res => {
      setLoggedIn(res && res.loginState);
    });
  }, []);

  if (!loggedIn) {
    return (
      <LanguageProvider>
        <Login onLogin={() => setLoggedIn(true)} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <MainCanvas />
    </LanguageProvider>
  );
}

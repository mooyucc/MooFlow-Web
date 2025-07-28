import React, { useState, useEffect } from "react";
import MainCanvas from "./components/MainCanvas";
import { LanguageProvider } from "./LanguageContext";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的登录状态
    const savedLoginState = localStorage.getItem('mooflow-login-state');
    if (savedLoginState === 'true') {
      setLoggedIn(true);
    }
    setLoading(false);
  }, []);

  // 处理登录
  const handleLogin = async () => {
    try {
      console.log('开始登录流程...');
      
      // 模拟登录过程
      setLoading(true);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 保存登录状态到本地存储
      localStorage.setItem('mooflow-login-state', 'true');
      setLoggedIn(true);
      setLoading(false);
      
    } catch (error) {
      console.error('登录失败:', error);
      alert('登录失败，请重试');
      setLoading(false);
    }
  };

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('mooflow-login-state');
    setLoggedIn(false);
  };

  if (loading) {
    return (
      <div style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fb"
      }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <LanguageProvider>
        <div style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fb",
          backgroundImage: "url('assets/bg-login.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}>
          <div style={{
            maxWidth: 360,
            width: "100%",
            padding: 32,
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            background: "#fff",
            textAlign: "center"
          }}>
            <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>欢迎使用 MooFlow</h2>
            <p style={{ color: "#666", marginBottom: 32, fontSize: 14 }}>
              智能项目计划平台
            </p>
            <button
              onClick={handleLogin}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 8,
                background: "#316acb",
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(49,106,203,0.08)"
              }}
            >
              登录 / 注册
            </button>
            
            {/* 开发环境测试按钮 */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={async () => {
                  try {
                    // 开发环境快速测试登录
                    console.log('开发环境：测试快速登录');
                    localStorage.setItem('mooflow-login-state', 'true');
                    setLoggedIn(true);
                  } catch (error) {
                    console.error('测试登录失败:', error);
                  }
                }}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 8,
                  background: "#28a745",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  border: "none",
                  cursor: "pointer",
                  marginTop: 12,
                  boxShadow: "0 2px 8px rgba(40,167,69,0.08)"
                }}
              >
                快速登录
              </button>
            )}
          </div>
        </div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <MainCanvas onLogout={handleLogout} />
    </LanguageProvider>
  );
}

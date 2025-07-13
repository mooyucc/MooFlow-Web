import React, { useState } from "react";
import app from "../cloudbase";
import { AiOutlineWechat, AiOutlineMobile, AiOutlineUser, AiOutlineMail } from "react-icons/ai";

const btnStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f7f8fa",
  border: "1px solid #e5e6eb",
  borderRadius: 8,
  padding: "12px 0",
  fontSize: 17,
  fontWeight: 500,
  marginBottom: 16,
  cursor: "pointer",
  transition: "background 0.2s, border 0.2s"
};

const outerStyle = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8f9fb",
  backgroundImage: "url('assets/bg-login.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat"
};
const cardStyle = {
  maxWidth: 360,
  width: "100%",
  padding: 32,
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  background: "#fff"
};

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("main"); // main/phone/password/email
  const [loginType, setLoginType] = useState("password"); // password/sms
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [email, setEmail] = useState("");
  const [emailPwd, setEmailPwd] = useState("");
  const [error, setError] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);

  // 发送短信验证码
  const handleSendSms = async () => {
    setError("");
    setSmsLoading(true);
    try {
      await app.auth().sendSmsCode({ phone });
      setSmsSent(true);
    } catch (e) {
      setError(e.message);
    }
    setSmsLoading(false);
  };

  // 短信验证码登录
  const handleSmsLogin = async () => {
    setError("");
    try {
      await app.auth().signInWithSms(phone, smsCode);
      onLogin && onLogin();
    } catch (e) {
      setError(e.message);
    }
  };

  // 账户密码登录
  const handleLogin = async () => {
    setError("");
    try {
      await app.auth().signInWithUsernameAndPassword(username, pwd);
      onLogin && onLogin();
    } catch (e) {
      setError(e.message);
    }
  };

  // 邮箱登录（假设有邮箱登录方法）
  const handleEmailLogin = async () => {
    setError("");
    try {
      await app.auth().signInWithEmailAndPassword(email, emailPwd);
      onLogin && onLogin();
    } catch (e) {
      setError(e.message);
    }
  };

  // 主界面按钮区
  if (mode === "main") {
    return (
      <div style={outerStyle}>
        <div style={cardStyle}>
          <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>快速注册或登录</h2>
          <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>
            邮箱或其他方式登录MooFlow（免费使用）！
          </p>
          <button style={{...btnStyle, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 0}} disabled>
            <span style={{width: 28, display: 'flex', justifyContent: 'center', alignItems: 'center'}}><AiOutlineWechat style={{fontSize: 18}} /></span>
            <span style={{flex: 1, textAlign: 'center', fontWeight: 600}}>微信登录</span>
          </button>
          <button style={{...btnStyle, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 0}} onClick={() => setMode("phone")}> 
            <span style={{width: 28, display: 'flex', justifyContent: 'center', alignItems: 'center'}}><AiOutlineMobile style={{fontSize: 18}} /></span>
            <span style={{flex: 1, textAlign: 'center', fontWeight: 600}}>手机号码登录</span>
          </button>
          <button style={{...btnStyle, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 0}} onClick={() => setMode("password")}> 
            <span style={{width: 28, display: 'flex', justifyContent: 'center', alignItems: 'center'}}><AiOutlineUser style={{fontSize: 18}} /></span>
            <span style={{flex: 1, textAlign: 'center', fontWeight: 600}}>账户密码登录</span>
          </button>
          <button style={{...btnStyle, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 0}} onClick={() => setMode("email")}> 
            <span style={{width: 28, display: 'flex', justifyContent: 'center', alignItems: 'center'}}><AiOutlineMail style={{fontSize: 18}} /></span>
            <span style={{flex: 1, textAlign: 'center', fontWeight: 600}}>邮箱登录</span>
          </button>
          <div style={{margin: "14px 0", fontSize: 12, color: "#888"}}>
            <input type="checkbox" checked readOnly style={{marginRight: 6}} />
            我已阅读并同意MooFlow的
            <a href="#" style={{color: "#316acb"}}>使用条款</a>、
            <a href="#" style={{color: "#316acb"}}>隐私政策</a>
          </div>
          <button
            onClick={() => onLogin && onLogin()}
            style={{
              width: "100%",
              marginTop: 8,
              background: "#aaa",
              color: "#fff",
              border: "none",
              padding: "8px 0",
              borderRadius: 4,
              fontWeight: 500
            }}
          >
            开发测试一键登录
          </button>
        </div>
      </div>
    );
  }

  // 手机号登录表单
  if (mode === "phone") {
    return (
      <div style={outerStyle}>
        <div style={cardStyle}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>手机号码登录</h2>
          <input
            type="text"
            placeholder="手机号"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{
              display: 'block',
              margin: '0 auto 12px auto',
              width: 'calc(100% - 0px)',
              maxWidth: '100%',
              padding: '0 14px',
              height: 44,
              borderRadius: 8,
              border: '1px solid #e5e6eb',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              placeholder="短信验证码"
              value={smsCode}
              onChange={e => setSmsCode(e.target.value)}
              style={{
                flex: 1,
                padding: "0 14px",
                height: 44,
                borderRadius: 8,
                border: "1px solid #e5e6eb",
                fontSize: 14,
                outline: "none"
              }}
            />
            <button
              onClick={handleSendSms}
              disabled={smsLoading || !phone}
              style={{
                width: 120,
                height: 44,
                borderRadius: 8,
                border: "1px solid #e5e6eb",
                background: smsLoading || !phone ? "#f5f6fa" : "#f7f8fa",
                color: "#888",
                fontWeight: 500,
                fontSize: 14,
                cursor: smsLoading || !phone ? "not-allowed" : "pointer"
              }}
            >
              {smsLoading ? "发送中..." : (smsSent ? "已发送" : "获取验证码")}
            </button>
          </div>
          <button
            onClick={handleSmsLogin}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 8,
              background: "#316acb",
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              marginBottom: 8,
              marginTop: 4,
              boxShadow: "0 2px 8px rgba(49,106,203,0.08)"
            }}
          >
            短信登录
          </button>
          {error && (
            <div style={{ color: "red", margin: "6px 0 0 2px", fontSize: 13, textAlign: 'left' }}>
              {error}
            </div>
          )}
          <button
            onClick={() => setMode("main")}
            style={{
              width: "100%",
              marginTop: 18,
              background: "#eee",
              color: "#333",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              textAlign: "center",
              height: 44,
              lineHeight: "44px",
              padding: 0
            }}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // 账户密码登录表单
  if (mode === "password") {
    return (
      <div style={outerStyle}>
        <div style={cardStyle}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>账户密码登录</h2>
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              display: 'block',
              margin: '0 auto 12px auto',
              width: 'calc(100% - 0px)',
              maxWidth: '100%',
              padding: '0 14px',
              height: 44,
              borderRadius: 8,
              border: '1px solid #e5e6eb',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="密码"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            style={{
              display: 'block',
              margin: '0 auto 12px auto',
              width: 'calc(100% - 0px)',
              maxWidth: '100%',
              padding: '0 14px',
              height: 44,
              borderRadius: 8,
              border: '1px solid #e5e6eb',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
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
              marginBottom: 8,
              marginTop: 4,
              boxShadow: "0 2px 8px rgba(49,106,203,0.08)"
            }}
          >
            登录
          </button>
          {error && (
            <div style={{ color: "red", margin: "6px 0 0 2px", fontSize: 13, textAlign: 'left' }}>
              {error}
            </div>
          )}
          <button
            onClick={() => setMode("main")}
            style={{
              width: "100%",
              marginTop: 18,
              background: "#eee",
              color: "#333",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              textAlign: "center",
              height: 44,
              lineHeight: "44px",
              padding: 0
            }}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // 邮箱登录表单
  if (mode === "email") {
    return (
      <div style={outerStyle}>
        <div style={cardStyle}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>邮箱登录</h2>
          <input
            type="text"
            placeholder="邮箱"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              display: 'block',
              margin: '0 auto 12px auto',
              width: 'calc(100% - 0px)',
              maxWidth: '100%',
              padding: '0 14px',
              height: 44,
              borderRadius: 8,
              border: '1px solid #e5e6eb',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="密码"
            value={emailPwd}
            onChange={e => setEmailPwd(e.target.value)}
            style={{
              display: 'block',
              margin: '0 auto 12px auto',
              width: 'calc(100% - 0px)',
              maxWidth: '100%',
              padding: '0 14px',
              height: 44,
              borderRadius: 8,
              border: '1px solid #e5e6eb',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={handleEmailLogin}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 8,
              background: "#316acb",
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              marginBottom: 8,
              marginTop: 4,
              boxShadow: "0 2px 8px rgba(49,106,203,0.08)"
            }}
          >
            登录
          </button>
          {error && (
            <div style={{ color: "red", margin: "6px 0 0 2px", fontSize: 13, textAlign: 'left' }}>
              {error}
            </div>
          )}
          <button
            onClick={() => setMode("main")}
            style={{
              width: "100%",
              marginTop: 18,
              background: "#eee",
              color: "#333",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              textAlign: "center",
              height: 44,
              lineHeight: "44px",
              padding: 0
            }}
          >
            返回
          </button>
        </div>
      </div>
    );
  }
} 
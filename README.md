# MooPlan 智能项目计划平台

## 项目简介
MooPlan 是一款基于 React + Electron 的智能项目计划与任务管理平台，支持无限画布、结构化任务管理、手绘识别、任务依赖可视化等功能，适用于个人与团队的项目规划与进度管理。

## 技术栈
- **前端框架**：React 18
- **桌面端**：Electron（跨平台桌面应用）
- **构建工具**：Vite 6
- **状态管理**：Zustand
- **样式**：Tailwind CSS（可选，部分组件使用原生 CSS）
- **依赖管理**：npm
- **核心依赖**：
  - react, react-dom
  - zustand（任务状态管理）
  - react-datepicker（日期选择）
  - @vitejs/plugin-react（开发插件）
  - tailwindcss（样式，部分组件）
- **其他**：支持本地存储、Electron 文件导出等

## 主要文件结构
```
MooPlan/
├── electron-main.js           # Electron 主进程入口，负责窗口与文件导出
├── preload.js                 # Electron 预加载脚本，安全暴露 IPC
├── package.json               # 项目依赖与脚本
├── package-lock.json          # 依赖锁定文件
├── vite.config.js             # Vite 构建配置
├── eslint.config.js           # ESLint 配置
├── index.html                 # HTML 模板入口
├── public/                    # 静态资源目录
│   └── vite.svg               # Vite 标志图片
├── src/                       # 前端主代码目录
│   ├── App.jsx                # React 应用主入口
│   ├── App.css                # 应用样式
│   ├── index.css              # 全局样式
│   ├── main.jsx               # 前端入口文件
│   ├── assets/                # 图片等资源
│   │   └── react.svg          # React 标志图片
│   ├── store/                 # 状态管理
│   │   └── taskStore.js       # 任务状态管理
│   └── components/            # 主要功能组件
│        ├── MainCanvas.jsx         # 无限画布与任务可视化核心
│        ├── TaskNode.jsx           # 任务节点组件
│        ├── LinkLine.jsx           # 任务依赖连线组件
│        ├── CanvasToolbar.jsx      # 画布工具栏
│        ├── CanvasToolbar.css      # 工具栏样式
│        ├── CanvasFileToolbar.jsx  # 文件导入导出工具栏
│        ├── TaskTree.jsx           # 任务树结构组件
│        ├── DatePickerPortal.jsx   # 日期选择弹窗
│        ├── CollapseButton.jsx     # 折叠按钮组件
│        └── FormatSidebar.jsx      # 右侧格式栏组件
├── MooPlan 开发技术栈.md      # 详细技术方案与开发手册
├── 「MooPlan」智能项目计划平台.md # 产品文档
└── README.md                  # 项目说明文档
```

> 详细的技术实现与开发手册请参考 `MooPlan 开发技术栈.md`。

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# MooPlan 打包与部署说明

## 一、安装依赖

```bash
npm install
```

## 二、开发环境启动

```bash
npm run dev
```

## 三、项目打包

```bash
npm run build
```

打包完成后，生成的静态文件会在 `dist` 目录下。

## 四、本地预览打包结果

```bash
npm run preview
```

或使用 serve 工具：

```bash
npm install -g serve
serve -s dist
```

## 五、部署到生产环境

将 `dist` 目录下的所有文件上传到你的静态服务器或云服务（如 Vercel、Netlify、阿里云 OSS、腾讯云 COS、GitHub Pages 等）。

### Nginx 示例配置

```
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 六、常见问题

1. **API 地址与跨域**：如有后端接口，注意生产环境的 API 地址和跨域设置。
2. **部署到子路径**：如需部署到非根路径，需在 `vite.config.js` 设置 `base`，如：
   ```js
   export default defineConfig({
     base: '/your-sub-path/',
   })
   ```

---

如有其他问题，欢迎联系开发者。

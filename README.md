# MooFlow 智能项目计划平台

## 项目简介
MooFlow 是一款基于 React + Electron 的智能项目计划与任务管理平台，适用于个人与团队的项目规划与进度管理。平台集成了多种创新功能，旨在提升项目管理的效率与体验。

**主要功能包括：**
- 无限画布：支持自由缩放与拖拽，灵活布局项目任务与结构。
- 结构化任务管理：以节点和树状结构直观展示任务层级与依赖关系。
- 任务依赖可视化：通过连线方式清晰展示任务之间的前后置依赖。
- 手绘识别：支持手绘输入，自动识别并转化为标准任务节点。
- 任务属性编辑：可自定义任务名称、描述、负责人、优先级、截止日期等属性。
- 任务进度追踪：支持任务状态切换、进度百分比展示，便于实时掌控项目进展。
- 日期选择与提醒：集成日期选择器，支持任务截止时间设置与到期提醒。
- 文件导入导出：支持项目数据的本地导入、导出，便于备份与迁移。
- 多平台支持：基于 Electron 实现，兼容 Windows、macOS 等主流桌面系统。
- 本地存储与云同步（可扩展）：支持本地数据持久化，后续可扩展云端同步能力。
- 主题切换：支持深色/浅色主题，适应不同使用场景。
- 团队协作（规划中）：未来将支持多人协作、权限管理与实时同步。

MooFlow 致力于为用户提供高效、智能、可视化的项目管理体验，帮助团队更好地规划、拆解与推进各类项目。

## 技术栈
- **前端框架**：React 18
- **桌面端**：目前是Electron（跨平台桌面应用）
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

## 主要目录结构与核心组件说明
```
MooFlow/
├── electron-main.js           # Electron 主进程入口，窗口与导入/导出
├── preload.js                 # 预加载脚本，安全暴露 IPC
├── electron.cjs               # Electron 构建/启动配置
├── package.json
├── package-lock.json
├── vite.config.js
├── eslint.config.js
├── index.html
├── public/                    # 静态资源目录
│   ├── bg-login.png
│   ├── favicon.png
│   ├── jspdf.umd.min.js
│   └── svg2pdf.umd.min.js
├── assets/                    # 应用图标与示意图
│   ├── icon.icns
│   ├── icon.ico
│   ├── icon.png
│   ├── LayoutH.png
│   └── LayoutV.png
├── src/                       # 前端主代码目录
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   ├── LanguageContext.jsx    # 语言上下文（中英切换）
│   ├── locales/               # 多语言资源
│   │   ├── en.js
│   │   └── zh.js
│   ├── assets/
│   │   └── react.svg
│   ├── store/
│   │   └── taskStore.js       # 任务/画布状态（Zustand）
│   └── components/            # 主要功能组件
│       ├── MainCanvas.jsx          # 无限画布与节点渲染/交互核心
│       ├── TaskNode.jsx            # 任务节点（拖拽、编辑、状态/进度）
│       ├── LinkLine.jsx            # 任务依赖连线
│       ├── CanvasToolbar.jsx       # 画布工具栏（缩放/布局/对齐等）
│       ├── CanvasToolbar.css
│       ├── CanvasFileToolbar.jsx   # 文件导入/导出（含布局方向）
│       ├── CanvasThemeToolbar.jsx  # 主题切换（深色/浅色）
│       ├── CanvasThemeToolbar.css
│       ├── TaskTree.jsx            # 任务树（层级视图）
│       ├── FormatSidebar.jsx       # 右侧属性/格式面板
│       ├── DatePickerPortal.jsx    # 日期选择弹窗
│       ├── PopupPortal.jsx         # 通用弹窗/浮层容器
│       └── CollapseButton.jsx      # 折叠/展开按钮
├── dist/                      # 网页版构建产物
├── dmg/                       # 桌面版打包产物
├── test-vertical-layout-import-export.js  # 纵向布局导入/导出测试脚本
├── update-github.sh
├── update-githubPages.sh
├── MooFlow 开发技术栈.md      # 详细技术方案与开发手册
└── README.md                  # 项目说明文档
```

> 详细的技术实现与开发手册请参考 `MooFlow 开发技术栈.md`。

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# MooFlow 打包与部署说明

##本地打包部署
一、打包网页版程序
1、安装依赖
```bash
npm install
```
2、删除 dist 目录：(一般不需要)
```bash
rm -rf dist
```
3、新建dist文件夹，检查文件夹大小
```bash
npm run build
```

二、打包dmg文件
1、开始打包
```bash
npm run build:electron
```
2、打包完成后，生成的静态文件会在 `dmg` 目录下。

三、打包exe文件
1、Windows程序打包
```bash
npx electron-builder --win
```

## Github 推送
1、查看当前远程仓库地址
```bash
git remote -v
```
2、切换仓库
先移除原有的远程仓库，再添加正确的仓库地址：
```bash
git remote remove origin
git remote add origin https://github.com/mooyucc/MooFlow-Web.git
```
或者
```bash
git remote remove origin
git remote add origin https://github.com/mooyucc/MooFlowPages.git
```
### 将本地代码推送到 GitHub MooFlow仓库
1. 打开终端，进入项目目录：
```bash
cd "/Users/kevinx/Documents/Ai Project/MooFlow-Web"
```
2. 初始化 Git（如未初始化）：
```bash
git init
```
3. 添加远程仓库（如未添加）：
```bash
git remote add origin https://github.com/mooyucc/MooFlow-Web.git
```
4. 推送到 GitHub：
```bash
git add .
git commit -m "YYMMDD代码更新"
git push origin main
```

### 将本地代码推送到 GitHub MooFlowPages仓库
1. 打开终端，进入项目目录：
```bash
cd "/Users/kevinx/Documents/Ai Project/MooFlow/dist"
```
2. 初始化 Git（如未初始化）：
```bash
git init
```
3. 添加远程仓库（如未添加）：
```bash
git remote add origin https://github.com/mooyucc/MooFlowPages.git
```
4. 推送到 GitHub：
```bash
git add .
git commit -m "YYMMDD代码更新"
git push origin main
```

如有其他问题，欢迎联系开发者。

Color颜色标准

| 模式   | 文字颜色         | 背景色           | 说明         |
|--------|------------------|------------------|--------------|
| 深色   | #e8e8ed（灰白）  | #161617（深灰）  | 主色         |
| 深色   | #86868b（灰）    |                  | 次要文字     |
| 浅色   | #484848（深灰）  | #f0f0ee（浅白）  | 主色         |
| 浅色   |                  | #ececea（浅灰）  | 次要背景     |
| 浅色   |                  | #d0d0cd（中灰）  | 辅助背景     |
| 浅色   |                  | #c2c3c1（深中灰）| 辅助背景     |

## 贡献指南

欢迎提交 Issue 或 PR 参与项目共建！如有建议或问题，欢迎联系开发者。

## 联系方式

- GitHub: [xkevin430/MooFlow](https://github.com/xkevin430/MooFlow)
- 邮箱: xkevin430@gmail.com

## 常用脚本

| 命令                        | 说明                   |
|-----------------------------|------------------------|
| npm install                 | 安装依赖               |
| npm run dev                 | 启动开发环境           |
| npm run build               | 构建网页版静态文件      |
| npm run build:electron      | 构建 Electron 应用      |
| npx electron-builder --win  | 打包 Windows 可执行文件 |
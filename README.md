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

## 主要目录结构与核心组件说明
```
MooPlan/
├── electron-main.js           # Electron 主进程入口，负责窗口与文件导出
├── preload.js                 # Electron 预加载脚本，安全暴露 IPC
├── electron.cjs               # Electron 配置或辅助脚本
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
│   ├── assets/                # 前端图片等资源
│   │   └── react.svg          # React 标志图片
│   ├── store/                 # 状态管理
│   │   └── taskStore.js       # 任务状态管理
│   └── components/            # 主要功能组件
│        ├── MainCanvas.jsx         # 无限画布与任务可视化核心
│        ├── TaskNode.jsx           # 单个任务节点，支持拖拽、编辑
│        ├── LinkLine.jsx           # 任务依赖连线组件
│        ├── CanvasToolbar.jsx      # 画布工具栏，常用操作入口
│        ├── CanvasFileToolbar.jsx  # 文件导入导出工具栏
│        ├── TaskTree.jsx           # 任务树结构，层级展示任务
│        ├── DatePickerPortal.jsx   # 日期选择弹窗
│        ├── CollapseButton.jsx     # 折叠/展开按钮
│        └── FormatSidebar.jsx      # 右侧格式栏，任务属性编辑
├── assets/                    # 应用图标等资源（如icon.ico, icon.icns, icon.png）
├── dist/                      # 打包输出目录
├── dmg/                       # Mac DMG 安装包输出目录
├── .github/                   # GitHub 工作流等配置
├── .gitignore                 # Git 忽略文件配置
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
git remote add origin https://github.com/mooyucc/MooPlan.git
```
或者
```bash
git remote remove origin
git remote add origin https://github.com/mooyucc/MooPlanPages.git
```
### 将本地代码推送到 GitHub MooPlan仓库
1. 打开终端，进入项目目录：
```bash
cd "/Users/kevinx/Documents/Ai Project/MooPlan"
```
2. 初始化 Git（如未初始化）：
```bash
git init
```
3. 添加远程仓库（如未添加）：
```bash
git remote add origin https://github.com/mooyucc/MooPlan.git
```
4. 推送到 GitHub：
```bash
git add .
git commit -m "YYMMDD代码更新"
git push origin main
```

### 将本地代码推送到 GitHub MooPlanPages仓库
1. 打开终端，进入项目目录：
```bash
cd "/Users/kevinx/Documents/Ai Project/MooPlan/dist"
```
2. 初始化 Git（如未初始化）：
```bash
git init
```
3. 添加远程仓库（如未添加）：
```bash
git remote add origin https://github.com/mooyucc/MooPlanPages.git
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

- GitHub: [xkevin430/MooPlan](https://github.com/xkevin430/MooPlan)
- 邮箱: xkevin430@gmail.com

## 常用脚本

| 命令                        | 说明                   |
|-----------------------------|------------------------|
| npm install                 | 安装依赖               |
| npm run dev                 | 启动开发环境           |
| npm run build               | 构建网页版静态文件      |
| npm run build:electron      | 构建 Electron 应用      |
| npx electron-builder --win  | 打包 Windows 可执行文件 |
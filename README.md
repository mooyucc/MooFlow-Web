# MooFlow 智能项目计划平台

## 📋 项目简介

**MooFlow** 是一款现代化的智能项目计划与任务管理平台，基于 **React 19 + Vite + Electron** 技术栈构建。它为个人开发者和团队提供了直观、高效的项目规划与进度管理解决方案，通过创新的可视化交互设计，让复杂的项目管理变得简单而有趣。

### 🎯 核心理念
- **可视化优先**：将抽象的项目结构转化为直观的视觉图表
- **交互驱动**：通过自然的拖拽和连线操作简化复杂工作流
- **数据安全**：本地优先的数据存储，保障项目信息安全
- **跨平台体验**：一次开发，多平台无缝使用

### ✨ 核心功能

#### 🎨 **无限画布系统**
- 支持无限缩放与平移的画布空间
- 流畅的拖拽交互体验
- 多选和批量操作支持
- 智能视图自适应

#### 📊 **智能任务管理**
- 节点化任务表示，直观清晰
- 树状结构展示任务层级关系
- 实时进度追踪与状态管理
- 丰富的任务属性自定义

#### 🔗 **依赖关系可视化**
- 通过连线直观展示任务依赖
- 智能路径计算与自动吸附
- 多样化的连线样式与标注
- 关键路径高亮显示

#### 🎨 **个性化定制**
- 深色/浅色主题无缝切换
- 多种节点形状与配色方案
- 自定义字体与样式设置
- 响应式界面适配

#### 📅 **时间管理工具**
- 集成式日期选择器
- 任务截止时间管理
- 进度里程碑设置
- 时间线视图支持

#### 💾 **数据管理**
- 本地数据持久化存储
- JSON/CSV 格式导入导出
- 完整的撤销/重做支持
- 项目数据备份恢复

#### 🌍 **国际化支持**
- 中英文界面无缝切换
- 完整的多语言文本适配
- 本地化日期和数字格式
- 易扩展的语言包架构

### 🚀 技术亮点
- **混合画布引擎**：React Flow 负责视口/拖选，自研 LinkLine + 时间轴保留项目计划语义
- **响应式架构**：Zustand 状态管理，确保数据流的高效和可预测
- **模块化设计**：组件化架构，画布按需懒加载，便于功能扩展和维护
- **跨平台兼容**：Electron 桌面应用，支持 Windows、macOS、Linux

### 🎯 适用场景
- **软件开发**：需求分析、功能规划、开发流程管理
- **项目管理**：任务分解、进度跟踪、资源分配
- **学习规划**：知识图谱构建、学习路径规划
- **创意设计**：思维导图、流程设计、概念梳理

**MooFlow** 让项目管理回归本质 —— 简单、高效、可视化。无论是个人项目规划还是团队协作管理，都能在这里找到最适合的解决方案。

## 🛠️ 技术栈

### 🏗️ **核心架构**
| 技术分类 | 技术选型 | 版本 | 说明 |
|---------|---------|------|------|
| **前端框架** | React | 19.x | 现代化 React Hooks + 函数式组件 |
| **桌面应用** | Electron | 36.x | 跨平台桌面应用框架 |
| **构建工具** | Vite | 6.x | 超快的前端构建工具，HMR支持 |
| **状态管理** | Zustand | 5.x | 轻量级状态管理，多 Store 分工 |
| **测试** | Vitest | 4.x | 单元测试（utils / store） |
| **包管理器** | npm | 最新版 | Node.js 官方包管理器 |

### 🎨 **UI & 样式**
- **CSS架构**：原生CSS + 部分Tailwind CSS
- **主题系统**：深色/浅色主题切换
- **响应式设计**：适配不同屏幕尺寸
- **图标系统**：SVG图标，支持主题色彩

### 📦 **核心依赖库**

#### 🚀 **生产依赖（节选）**
```json
{
  "react": "^19.x",
  "react-dom": "^19.x",
  "zustand": "^5.x",
  "@xyflow/react": "^12.x",
  "antd": "^5.x",
  "papaparse": "^5.x",
  "tinycolor2": "^1.x"
}
```

> 日期选择、颜色选择等能力已逐步内建或精简，请以 `package.json` 为准。

#### 🔧 **开发依赖**
```json
{
  "@vitejs/plugin-react": "^4.x",     // Vite React 插件
  "electron": "^latest",               // Electron 框架
  "electron-builder": "^24.x",        // Electron 打包工具
  "eslint": "^8.x",                   // 代码规范检查
  "tailwindcss": "^3.x"               // 原子化CSS框架
}
```

### ⚡ **性能优化技术**
- **画布懒加载**：`CanvasRouter` 按环境变量加载 React Flow 或旧版画布
- **Vendor 分包**：`xyflow` / `antd` / `react-vendor` 独立 chunk
- **组件懒加载**：路由级 `React.lazy` 减少首屏体积
- **状态订阅优化**：精确的状态更新订阅

### 🔐 **安全特性**
- **CSP策略**：内容安全策略防护
- **预加载脚本**：安全的主进程与渲染进程通信
- **本地存储**：数据不上传云端，保障隐私
- **文件访问控制**：限制文件系统访问权限

### 🌍 **国际化技术**
- **React Context**：多语言状态管理
- **动态语言包**：支持运行时语言切换
- **本地化格式**：日期、数字格式适配
- **RTL支持**：为未来阿拉伯语等做准备

### 📱 **跨平台支持**
| 平台 | 支持状态 | 说明 |
|------|---------|------|
| **Windows** | ✅ 完全支持 | Windows 10+ |
| **macOS** | ✅ 完全支持 | macOS 10.15+ |
| **Linux** | ✅ 完全支持 | Ubuntu 18.04+ |
| **Web** | 🚧 开发中 | 浏览器版本 |

### 🔄 **开发工作流**
- **热重载**：Vite HMR 极速开发体验
- **类型安全**：JSDoc + ESLint 代码质量保障
- **模块化**：ES6+ 模块系统
- **Git工作流**：标准化版本控制流程

### 📊 **数据层架构**
- **fileStore**：多 Tab 文件管理，持久化到 `moo_files` / `moo_active_file_id`
- **taskStore**：当前画布任务运行时状态（撤销/重做、剪贴板）
- **canvasSettingsStore**：画布主题、网格、时间颗粒度等
- **同步机制**：`useSyncActiveFileTasks` 防抖写回当前 Tab；`fileStoreSync` 支持多 Tab 跨页同步
- **导入导出**：JSON / CSV；Electron 下通过 `window.electronAPI.exportFile`

## 主要目录结构与核心组件说明
```
MooFlow/
├── electron.cjs               # Electron 主进程入口（窗口、IPC、导出）
├── preload.js                 # 预加载脚本，暴露 window.electronAPI
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx               # 应用入口（含 fileStore 跨 Tab 同步初始化）
│   ├── store/
│   │   ├── taskStore.js       # 任务运行时、撤销/重做、剪贴板
│   │   ├── fileStore.js       # 多 Tab 文件与 localStorage 持久化
│   │   ├── fileStoreSync.js   # 跨浏览器 Tab 同步
│   │   └── canvasSettingsStore.js
│   ├── hooks/
│   │   └── useFileOperations.js
│   ├── canvas/
│   │   ├── hooks/             # useSnapGuide、useTimeline、useTaskNodeEdit
│   │   └── flow/              # React Flow 画布（adapter、hooks、TaskFlowNode、MooFlowEdge）
│   ├── components/
│   │   ├── CanvasRouter.jsx   # 画布入口（懒加载 MooFlowReactFlow）
│   │   ├── CanvasFileToolbar.jsx
│   │   ├── fileToolbar/       # 文件栏子组件（Tab、最近文件、新建文件）
│   │   └── canvas/            # 画布子组件（连线、时间轴、右键菜单等）
│   ├── utils/                 # 纯函数工具（布局、时间轴、导入导出等）
│   └── layout/                # 自动布局算法
└── README.md
```

> 完整组件树见下方「主要目录结构」；历史文档中的 `electron-main.js` 已合并入 `electron.cjs`。

## 🏗️ 项目架构特性

### 核心技术架构
- **模块化设计**：采用 React 函数式组件，每个组件职责单一，便于维护和扩展
- **状态管理**：使用 Zustand 轻量级状态管理，支持状态持久化和时间旅行调试
- **混合无限画布**：React Flow 引擎 + 自研 SVG 连线/时间轴 overlay，`taskStore` 为唯一数据源
- **响应式设计**：完全响应式界面，适配不同屏幕尺寸和设备类型

### 画布架构（React Flow + 自研）

| 层级 | 模块 | 职责 |
|------|------|------|
| 入口 | `CanvasRouter` | 懒加载，默认 `MooFlowReactFlow` |
| 引擎 | `@xyflow/react` | 视口、框选、拖选、Handle 连线、`ConnectionLine` 预览 |
| 适配 | `flowAdapter.js` | `tasks` ↔ `nodes` / `edges` 派生 |
| 节点 | `TaskFlowNode` + `TaskNodeBody` | 自定义节点 UI |
| 连线 | `MooFlowEdge`（`edgeTypes`） | 包装自研 `LinkLine` 四锚点路由；时长标签经 `EdgeLabelRenderer` |
| 装饰 | `FlowDecorOverlay` | 时间轴、对齐参考线 |
| 交互 | `useFlowNodeChanges` | `onNodesChange`：位置 → taskStore，select → 选中态 |
| 领域 | `taskStore` + utils | 树形任务、布局、防环、日期级联、撤销重做 |

**框选 / 选中**：完全使用 React Flow 内置框选（`selectionOnDrag`）；选中同步走 `onNodesChange` 的 `select` 事件。连线 `selectable: false`，不参与框选，仅点击选中。节点删除走 RF `onNodesDelete` + `Delete`/`Backspace`。

**环境变量**

| 变量 | 说明 |
|------|------|
| （默认） | 使用 React Flow 混合画布 `MooFlowReactFlow` |

### 用户体验特性
- **拖拽交互**：流畅的拖拽体验，支持单选、多选和批量操作
- **视觉反馈**：丰富的动画效果和视觉反馈，提升操作体验
- **智能连线**：自动路径计算和锚点吸附，简化依赖关系建立
- **快捷操作**：键盘快捷键支持，提高操作效率

### 数据持久化
- **单一数据源**：任务数据以 `fileStore`（`moo_files`）为准，不再使用旧的 `moo_tasks_*` 键
- **多 Tab**：每个文件 Tab 含 `tasks`、`mainDirection`、`timeScale` 等
- **跨 Tab 同步**：监听 `localStorage` 的 `storage` 事件自动重载
- **导入导出**：JSON、CSV；内置撤销/重做

### 扩展性设计
- **插件化架构**：组件化设计支持功能模块的独立开发和集成
- **主题系统**：可扩展的主题系统，支持自定义颜色方案
- **多语言框架**：完善的国际化支持，易于添加新语言
- **跨平台兼容**：基于Electron的跨平台桌面应用支持

> 详细的技术实现与开发手册请参考 `MooFlow 开发技术栈.md`。


# MooFlow 打包与部署说明

##本地打包部署
一、打包网页版程序
1、安装依赖
```bash
npm install
npm run dev      # 开发
npm run build    # 网页构建
npm test         # Vitest 单元测试
npm run electron # 桌面开发
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
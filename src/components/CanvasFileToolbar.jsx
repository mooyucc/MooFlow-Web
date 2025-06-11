import React, { useRef, useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import './CanvasToolbar.css';
import FormatSidebar from './FormatSidebar';
import Papa from 'papaparse';

// iOS风格图标
const ExportIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4" />
    <polyline points="8 8 12 4 16 8" />
    <rect x="4" y="20" width="16" height="2" rx="1" />
  </svg>
);
// iOS风格图标
const ImportIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v12" />
    <polyline points="16 16 12 20 8 16" />
    <rect x="4" y="2" width="16" height="2" rx="1" />
  </svg>
);
// iOS风格图标
const NewFileIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
// iOS风格图标
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
// iOS风格图标
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12L12 4l9 8" />
    <path d="M9 21V9h6v12" />
    <path d="M21 21H3" />
  </svg>
);

// 默认新建文件内容
const defaultFile = () => {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return {
    id: Date.now(),
    name: `未命名${timeStr}`,
    tasks: [
      {
        id: 1,
        title: "第一个任务",
        position: { x: 100, y: 100 },
        links: [],
        lock: true,
        parentId: null,
        level: 0,
        date: new Date().toISOString(),
        collapsed: false
      }
    ]
  };
};

const CanvasFileToolbar = ({ canvasProps, setCanvasProps }) => {
  // 多文件（Tab）本地状态
  const [files, setFiles] = useState(() => {
    // 尝试从 localStorage 恢复
    const saved = localStorage.getItem('moo_files');
    if (saved) return JSON.parse(saved);
    return [defaultFile()];
  });
  const [activeFileId, setActiveFileId] = useState(() => {
    const savedId = localStorage.getItem('moo_active_file_id');
    const filesSaved = localStorage.getItem('moo_files');
    const filesArr = filesSaved ? JSON.parse(filesSaved) : [defaultFile()];
    // 兼容字符串和数字id
    if (savedId && filesArr.some(f => String(f.id) === String(savedId))) {
      return typeof filesArr[0].id === 'number' ? Number(savedId) : savedId;
    }
    return filesArr[0].id;
  });
  // 新增：记录正在重命名的Tab id和输入值
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // 任务相关
  const tasks = useTaskStore(state => state.tasks);
  const addTask = useTaskStore(state => state.addTask);
  const clearTasks = useTaskStore(state => state.clearTasks);
  const fileInputRef = useRef(null);

  // 最近打开弹窗状态
  const [showRecent, setShowRecent] = useState(false);
  // 最近文件列表（含内容）
  const [recentFiles, setRecentFiles] = useState(() => {
    const saved = localStorage.getItem('moo_files_history');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const popupRef = useRef(null);

  // 新增：格式侧边栏显示状态
  const [showFormatSidebar, setShowFormatSidebar] = useState(false);

  // 新增：导出/导入下拉菜单状态
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [importMenuOpen, setImportMenuOpen] = useState(false);

  // 画布属性变更回调
  const handleCanvasChange = (props) => {
    setCanvasProps(props);
  };

  // 记录最近打开文件
  const recordRecentFile = (file) => {
    setRecentFiles(prev => {
      // 去重，最新在前
      const filtered = prev.filter(f => f.id !== file.id);
      const newList = [{ ...file, lastOpen: Date.now() }, ...filtered].slice(0, 20);
      localStorage.setItem('moo_files_history', JSON.stringify(newList));
      return newList;
    });
  };

  // 切换Tab时同步store并记录最近打开
  const switchFile = (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      clearTasks();
      file.tasks.forEach(t => addTask(t));
      setActiveFileId(fileId);
      localStorage.setItem('moo_active_file_id', fileId);
      recordRecentFile(file);
    }
  };

  // 新建文件(Tab)时也记录
  const handleNewFile = () => {
    const newFile = defaultFile();
    setFiles(prev => {
      const updated = [...prev, newFile];
      localStorage.setItem('moo_files', JSON.stringify(updated));
      return updated;
    });
    clearTasks();
    newFile.tasks.forEach(t => addTask(t));
    setActiveFileId(newFile.id);
    recordRecentFile(newFile);
  };

  // 关闭文件(Tab)
  const handleCloseFile = (fileId, e) => {
    e.stopPropagation();
    let idx = files.findIndex(f => f.id === fileId);
    if (files.length === 1) {
      // 最后一个Tab不能关闭，重置内容
      const newFile = defaultFile();
      setFiles([newFile]);
      clearTasks();
      newFile.tasks.forEach(t => addTask(t));
      setActiveFileId(newFile.id);
      localStorage.setItem('moo_files', JSON.stringify([newFile]));
      return;
    }
    const newFiles = files.filter(f => f.id !== fileId);
    localStorage.setItem('moo_files', JSON.stringify(newFiles));
    setFiles(newFiles);
    // 如果关闭的是当前Tab，切换到前一个或第一个
    if (activeFileId === fileId) {
      const nextIdx = idx > 0 ? idx - 1 : 0;
      const nextFile = newFiles[nextIdx];
      clearTasks();
      nextFile.tasks.forEach(t => addTask(t));
      setActiveFileId(nextFile.id);
    }
  };

  // 导出当前Tab
  const handleExport = async () => {
    const file = files.find(f => f.id === activeFileId);
    const dataStr = JSON.stringify(file ? file.tasks : [], null, 2);
    // 生成文件名：Tab名-年月日小时分钟
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
    // 去除文件名中的特殊字符
    const safeFileName = (file?.name || 'tasks').replace(/[^\u4e00-\u9fa5\w\-]/g, '');
    const exportFileName = `${safeFileName}-${dateStr}.json`;
    if (window.electron && window.electron.ipcRenderer) {
      try {
        const result = await window.electron.ipcRenderer.invoke('export-tasks', dataStr);
        if (result && result.success) {
          alert('导出成功！');
        } else {
          alert('导出已取消');
        }
      } catch (e) {
        alert('导出失败：' + e.message);
      }
    } else {
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // 导入到当前Tab
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const importedTasks = JSON.parse(evt.target.result);
        if (Array.isArray(importedTasks)) {
          clearTasks();
          importedTasks.forEach(t => addTask(t));
          // 同步到当前Tab
          setFiles(prev => {
            const updated = prev.map(f => f.id === activeFileId ? { ...f, tasks: importedTasks } : f);
            localStorage.setItem('moo_files', JSON.stringify(updated));
            return updated;
          });
          alert('导入成功！');
        } else {
          alert('文件格式不正确');
        }
      } catch {
        alert('导入失败，文件格式错误');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 监听 activeFileId 变化，切换任务内容
  useEffect(() => {
    const file = files.find(f => f.id === activeFileId);
    if (file) {
      clearTasks();
      file.tasks.forEach(t => addTask(t));
    }
    // eslint-disable-next-line
  }, [activeFileId]);

  // 监听任务变化，自动同步到当前Tab
  React.useEffect(() => {
    setFiles(prev => {
      const updated = prev.map(f => f.id === activeFileId ? { ...f, tasks } : f);
      localStorage.setItem('moo_files', JSON.stringify(updated));
      return updated;
    });
    // 自动同步到最近打开
    const file = files.find(f => f.id === activeFileId);
    if (file) recordRecentFile({ ...file, tasks });
    // eslint-disable-next-line
  }, [tasks]);

  // Tab重命名提交
  const handleRenameSubmit = (fileId) => {
    if (!renameValue.trim()) return;
    setFiles(prev => {
      const updated = prev.map(f => f.id === fileId ? { ...f, name: renameValue.trim() } : f);
      localStorage.setItem('moo_files', JSON.stringify(updated));
      return updated;
    });
    setRenamingId(null);
  };

  // Home弹窗打开时刷新最近文件
  const handleShowRecent = () => {
    const saved = localStorage.getItem('moo_files_history');
    setRecentFiles(saved ? JSON.parse(saved) : []);
    setShowRecent(true);
  };

  // 点击最近文件打开
  const handleOpenRecent = (file) => {
    // 如果当前files没有该文件，则加入
    if (!files.find(f => f.id === file.id)) {
      setFiles(prev => {
        const updated = [...prev, file];
        localStorage.setItem('moo_files', JSON.stringify(updated));
        return updated;
      });
    }
    clearTasks();
    file.tasks.forEach(t => addTask(t));
    setActiveFileId(file.id);
    recordRecentFile(file);
    setShowRecent(false);
  };

  // 最近打开弹窗动画状态
  const [recentPopupVisible, setRecentPopupVisible] = useState(false);
  React.useEffect(() => {
    if (showRecent) {
      setTimeout(() => setRecentPopupVisible(true), 10);
    } else {
      setRecentPopupVisible(false);
    }
  }, [showRecent]);

  // 最近打开弹窗外点击关闭（用ref判断）
  useEffect(() => {
    if (!showRecent) return;
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowRecent(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showRecent]);

  // 删除最近打开列表中的文件
  const handleDeleteRecent = (fileId, e) => {
    e.stopPropagation();
    setRecentFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      localStorage.setItem('moo_files_history', JSON.stringify(updated));
      return updated;
    });
  };

  // CSV导出
  const handleExportCSV = () => {
    const file = files.find(f => f.id === activeFileId);
    if (!file) return;
    const tasks = file.tasks || [];
    if (tasks.length === 0) {
      alert('没有可导出的任务');
      return;
    }
    // 构建id到title的映射
    const idTitleMap = Object.fromEntries(tasks.map(t => [t.id, t.title]));
    // 导出title、date、parentTitle
    const csvRows = [
      'title,date,parentTitle',
      ...tasks.map(t => {
        const parentTitle = t.parentId ? (idTitleMap[t.parentId] ?? '') : '';
        return `${JSON.stringify(t.title ?? '')},${t.date ?? ''},${JSON.stringify(parentTitle)}`;
      })
    ];
    const csvStr = csvRows.join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    // 生成文件名：Tab名-年月日小时分钟
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
    const safeFileName = (file?.name || 'tasks').replace(/[^\u4e00-\u9fa5\w\-]/g, '');
    const exportFileName = `${safeFileName}-${dateStr}.csv`;
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  // 导出PNG
  const handleExportPNG = async () => {
    const svgNode = window.mooPlanSvgRef?.current;
    if (!svgNode) {
      alert('未找到画布SVG节点');
      return;
    }
    // 克隆SVG，去除工具栏等干扰
    const clone = svgNode.cloneNode(true);
    // ====== 核心：内联所有样式，保证导出效果一致 ======
    // 1. 画布背景色
    const bgColor = canvasProps?.backgroundColor || '#fff';
    clone.style.background = bgColor;
    // 2. 字体
    const fontFamily = canvasProps?.fontFamily && canvasProps.fontFamily !== '默认' ? canvasProps.fontFamily : '-apple-system, BlinkMacSystemFont, \'SF Pro\', \'Helvetica Neue\', Arial, sans-serif';
    clone.style.fontFamily = fontFamily;
    // 3. 递归内联所有text/rect/line等颜色属性
    function inlineSvgStyles(node) {
      if (node.nodeType !== 1) return;
      // 文字
      if (node.tagName === 'text') {
        if (!node.hasAttribute('fill')) {
          const computed = window.getComputedStyle(svgNode);
          node.setAttribute('fill', computed.color || '#222');
        }
        node.setAttribute('font-family', fontFamily);
      }
      // rect背景
      if (node.tagName === 'rect' && !node.hasAttribute('fill')) {
        node.setAttribute('fill', '#fff');
      }
      // 线条
      if (node.tagName === 'line' && !node.hasAttribute('stroke')) {
        node.setAttribute('stroke', '#222');
      }
      // 递归
      for (let i = 0; i < node.childNodes.length; i++) {
        inlineSvgStyles(node.childNodes[i]);
      }
    }
    inlineSvgStyles(clone);
    // ====== END 核心 ======
    // 创建独立容器
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.appendChild(clone);
    document.body.appendChild(container);
    // 用html2canvas渲染
    try {
      const html2canvas = (await import('html2canvas')).default;
      // 计算SVG实际像素尺寸
      const width = svgNode.clientWidth || window.innerWidth;
      const height = svgNode.clientHeight || window.innerHeight;
      clone.setAttribute('width', width);
      clone.setAttribute('height', height);
      clone.setAttribute('viewBox', svgNode.getAttribute('viewBox'));
      // 用html2canvas渲染div
      const canvas = await html2canvas(container, {
        backgroundColor: null,
        useCORS: true,
        logging: false,
        width,
        height,
        scale: 2
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MooPlan-画布.png';
      a.click();
    } catch (e) {
      alert('导出PNG失败：' + e.message);
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <div className="canvas-toolbar minimal filebar" style={{ display: 'flex', alignItems: 'center' }}>
      {/* Home按钮 */}
      <button className="toolbar-btn" title="最近打开" onClick={handleShowRecent} style={{ marginRight: 8 }}>
        {/* 带门的极简风格房子SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12L12 3l9 9" />
          <path d="M9 21V9h6v12" />
          <path d="M21 21H3" />
        </svg>
      </button>
      {/* 新增：格式按钮 */}
      <button className="toolbar-btn" title="格式" onClick={() => setShowFormatSidebar(v => !v)} style={{ marginRight: 8 }}>
        {/* 侧边栏/面板风格图标SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2.5"/>
          <line x1="9.5" y1="4" x2="9.5" y2="20"/>
          <circle cx="16" cy="9" r="1"/>
          <circle cx="16" cy="15" r="1"/>
        </svg>
      </button>
      {/* Tab栏 */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        {files.map(file => (
          <div
            key={file.id}
            className={`file-tab${file.id === activeFileId ? ' active' : ''}`}
            style={{
              padding: '1px 6px',
              marginRight: 2,
              borderRadius: 10,
              background: file.id === activeFileId ? '#316acb' : 'transparent',
              color: file.id === activeFileId ? '#fff' : 'var(--tab-text-color, #333)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              border: file.id === activeFileId ? 'none' : '1.5px solid transparent',
              position: 'relative',
              minWidth: 56
            }}
            onClick={() => switchFile(file.id)}
          >
            {/* Tab名称支持重命名 */}
            {renamingId === file.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => handleRenameSubmit(file.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameSubmit(file.id);
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                style={{
                  maxWidth: 120,
                  fontSize: 14,
                  fontWeight: 400,
                  border: '1px solid #316acb',
                  borderRadius: 4,
                  padding: '2px 6px',
                  outline: 'none',
                  color: '#316acb',
                  background: '#fff',
                  marginRight: 4
                }}
              />
            ) : (
              <span
                style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14, fontWeight: 400 }}
                onDoubleClick={e => {
                  e.stopPropagation();
                  setRenamingId(file.id);
                  setRenameValue(file.name);
                }}
                title="双击重命名"
              >
                {file.name}
              </span>
            )}
            <span
              style={{ marginLeft: 8, cursor: 'pointer', opacity: 0.7 }}
              onClick={e => handleCloseFile(file.id, e)}
              title="关闭文件"
            >
              <CloseIcon />
            </span>
          </div>
        ))}
        <button className="toolbar-btn" title="新建文件" onClick={handleNewFile} style={{ marginLeft: 4 }}>
          <NewFileIcon />
        </button>
      </div>
      {/* 导出/导入按钮（带下拉菜单） */}
      <div style={{ position: 'relative', marginRight: 4 }}>
        <button className="toolbar-btn" title="导出任务" onClick={() => setExportMenuOpen(v => !v)}>
          <ExportIcon />
        </button>
        {exportMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            background: '#fff',
            border: '1px solid #e3eaff',
            borderRadius: 8,
            boxShadow: '0 2px 12px #0002',
            zIndex: 10,
            minWidth: 120,
            padding: '4px 0',
          }} onMouseLeave={() => setExportMenuOpen(false)}>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer', color: '#333', fontSize: 12 }}
              onClick={handleExport}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f3f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >导出为JSON</div>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer', color: '#333', fontSize: 12 }}
              onClick={handleExportCSV}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f3f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >导出为CSV</div>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer', color: '#333', fontSize: 12 }}
              onClick={handleExportPNG}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f3f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >导出为PNG</div>
          </div>
        )}
      </div>
      <div style={{ position: 'relative', marginRight: 4 }}>
        <button className="toolbar-btn" title="导入任务" onClick={() => setImportMenuOpen(v => !v)}>
          <ImportIcon />
        </button>
        {importMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            background: '#fff',
            border: '1px solid #e3eaff',
            borderRadius: 8,
            boxShadow: '0 2px 12px #0002',
            zIndex: 10,
            minWidth: 120,
            padding: '4px 0',
          }} onMouseLeave={() => setImportMenuOpen(false)}>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer', color: '#333', fontSize: 12 }}
              onClick={() => { setImportMenuOpen(false); fileInputRef.current.click(); }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f3f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >导入JSON</div>
          </div>
        )}
        {/* 隐藏的文件输入框 */}
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>
      {/* 最近打开弹窗 */}
      {showRecent && (
        <div
          ref={popupRef}
          id="recent-popup"
          style={{
            position: 'fixed',
            top: 64,
            right: 0,
            width: 340,
            height: 'calc(100vh - 256px)',
            // VisionOS毛玻璃半透明背景
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(48px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(48px) saturate(1.5)',
            boxShadow: '-2px 0 32px #0003',
            zIndex: 9999,
            padding: 24,
            overflowY: 'auto',
            transition: 'transform 0.35s cubic-bezier(.4,1.6,.4,1), opacity 0.25s',
            borderLeft: '1.5px solid #e3eaff',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '18px 0 0 18px',
            marginBottom: 0,
            opacity: recentPopupVisible ? 1 : 0,
            transform: recentPopupVisible ? 'translateX(0)' : 'translateX(100%)',
            // 视觉细节
            borderTop: '1.5px solid #e3eaff',
            borderBottom: '1.5px solid #e3eaff',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#316acb', flex: 1 }}>最近打开</span>
            <button
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}
              onClick={() => setShowRecent(false)}
              title="关闭"
            >×</button>
          </div>
          {recentFiles.length === 0 ? (
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: 60 }}>暂无最近打开文件</div>
          ) : (
            recentFiles.map(file => (
              <div
                key={file.id}
                style={{
                  padding: '12px 10px',
                  borderRadius: 8,
                  marginBottom: 10,
                  background: '#f6f8ff',
                  boxShadow: '0 1px 4px #0001',
                  cursor: 'pointer',
                  border: file.id === activeFileId ? '1.5px solid #316acb' : '1.5px solid #e3eaff',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
                onClick={() => handleOpenRecent(file)}
              >
                {/* 删除按钮 */}
                <button
                  onClick={e => handleDeleteRecent(file.id, e)}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    background: 'none',
                    border: 'none',
                    color: '#bbb',
                    fontSize: 18,
                    cursor: 'pointer',
                    zIndex: 2,
                    padding: 0,
                    lineHeight: 1,
                    transition: 'color 0.2s',
                  }}
                  title="从列表中移除"
                  onMouseEnter={e => (e.currentTarget.style.color = '#f44336')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#bbb')}
                >×</button>
                <span style={{ fontWeight: 600, color: '#316acb', fontSize: 16 }}>{file.name}</span>
                <span style={{ color: '#888', fontSize: 13, marginTop: 2 }}>最近编辑：{file.lastOpen ? new Date(file.lastOpen).toLocaleString() : ''}</span>
              </div>
            ))
          )}
        </div>
      )}
      {/* 右侧格式侧边栏 */}
      <FormatSidebar
        visible={showFormatSidebar}
        onClose={() => setShowFormatSidebar(false)}
        canvasProps={canvasProps}
        onCanvasChange={handleCanvasChange}
      />
    </div>
  );
};

export default CanvasFileToolbar; 
import React, { useRef, useState, useEffect } from 'react';
import { useTaskStore, defaultTaskStyle } from '../store/taskStore';
import './CanvasToolbar.css';
import FormatSidebar from './FormatSidebar';
import Papa from 'papaparse';
import { useTranslation } from '../LanguageContext';

// 简单Tooltip组件（与CanvasToolbar一致）
const Tooltip = ({ text, children }) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          style={{
            position: 'absolute',
            bottom: '120%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(40,40,40,0.95)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};
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
    name: `MF${timeStr}`,
    tasks: [
      {
        id: 1,
        title: "中心任务",
        position: { x: 100, y: 100 },
        links: [],
        lock: true,
        parentId: null,
        level: 0,
        date: new Date().toISOString(),
        collapsed: false
      }
    ],
    paletteIdx: null, // 新建文件无配色方案
    mainDirection: 'horizontal', // 新增：每个文件独立主线方向
  };
};

const CanvasFileToolbar = ({
  canvasProps,
  setCanvasProps,
  selectedTaskId,
  setSelectedTaskId,
  selectedTaskIds,
  selectedLink,
  // 新增：分支样式属性
  branchStyle,
  onBranchStyleChange,
  autoArrangeTasks
}) => {
  const [t, lang, setLang] = useTranslation();
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
  // 新增：登出确认弹窗状态
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // 获取所有任务
  const tasksAll = useTaskStore(state => state.tasks);
  // 获取updateTask
  const updateTask = useTaskStore(state => state.updateTask);
  // 选中卡片对象
  const selectedTask = tasksAll.find(t => t.id === selectedTaskId);
  // 新增：多选卡片对象数组
  const selectedTasks = tasksAll.filter(t => selectedTaskIds.includes(t.id));
  // 当前文件配色方案索引
  const activeFile = files.find(f => f.id === activeFileId);
  const paletteIdx = activeFile?.paletteIdx ?? null;
  const mainDirection = activeFile?.mainDirection ?? 'horizontal';
  // 批量处理卡片样式变更
  const handleTaskStyleChange = (key, value) => {
    if (selectedTaskIds.length > 1) {
      selectedTaskIds.forEach(id => {
        updateTask(id, { [key]: value });
      });
    } else if (selectedTask) {
      updateTask(selectedTask.id, { [key]: value });
    }
  };

  // 新增：导出/导入下拉菜单状态
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [importMenuOpen, setImportMenuOpen] = useState(false);

  // 画布属性变更回调
  const handleCanvasChange = (props) => {
    setCanvasProps(props);
    setFiles(prev => {
      const updated = prev.map(f =>
        f.id === activeFileId ? { ...f, mainDirection: props.mainDirection ?? f.mainDirection } : f
      );
      localStorage.setItem('moo_files', JSON.stringify(updated));
      return updated;
    });
  };

  // 配色方案变更回调
  const handlePaletteChange = (idx) => {
    setFiles(prev => {
      const updated = prev.map(f => f.id === activeFileId ? { ...f, paletteIdx: idx } : f);
      localStorage.setItem('moo_files', JSON.stringify(updated));
      return updated;
    });

    // 自动刷新主线任务及下属任务颜色
    const tasksAll = useTaskStore.getState().tasks;
    const updateTask = useTaskStore.getState().updateTask;
    // 取当前配色方案
    const COLOR_PALETTES = [
      { name: '律动', colors: ['#F15A4A', '#F6C244', '#5DBA4A', '#3A9BDB', '#3B53C4', '#D94A8A'] },
      { name: '永恒', colors: ['#3B53C4', '#F15A4A', '#F6C244', '#5DBA4A', '#3A9BDB', '#A24AD9'] },
      { name: '花海', colors: ['#A12B3A', '#5DBA4A', '#3A9BDB', '#1B3A5B', '#A24AD9', '#4A1B3A'] },
      { name: '绚丽', colors: ['#F15A4A', '#F6C244', '#3A9BDB', '#3B53C4', '#A24AD9', '#D94A8A'] },
      { name: '香水', colors: ['#A18B4A', '#5DBA4A', '#3A9BDB', '#3B53C4', '#A24AD9', '#4A1B3A'] },
      { name: '奶油', colors: ['#3A9BDB', '#3B53C4', '#F15A4A', '#F6C244', '#5DBA4A', '#1BC4A1'] },
      { name: '珊瑚', colors: ['#F15A4A', '#F6C244', '#5DBA4A', '#3A9BDB', '#A24AD9', '#D94A8A'] },
      { name: '香槟', colors: ['#C4BBA1', '#B4C4A1', '#A1C4B4', '#A1B4C4', '#C4A1B4', '#B4A1C4'] },
      { name: '禅心', colors: ['#FFFFFF', '#E0E0E0', '#B0B0B0', '#707070', '#303030', '#000000'] },
    ];
    // 找到所有主线任务（parentId为null），并排除中心任务
    const centerTask = tasksAll.find(t => t.parentId === null);
    const mainTasks = tasksAll.filter(t => t.parentId === null && t.id !== centerTask?.id);
    // 递归更新下属任务颜色
    function updateDescendantsColor(parentId, color) {
      tasksAll.forEach(task => {
        if (task.parentId === parentId) {
          // 跳过中心任务
          if (task.id === centerTask?.id) return;
          // 只在fillColor等于父色时才继承
          if (!task.fillColor || task.fillColor === color || COLOR_PALETTES.some(p => p.colors.includes(task.fillColor)) || task.fillColor === defaultTaskStyle.fillColor) {
            updateTask(task.id, { fillColor: color });
            updateDescendantsColor(task.id, color);
          }
        }
      });
    }
    if (idx === null) {
      // 无配色方案，全部恢复默认色（中心任务除外）
      mainTasks.forEach(mainTask => {
        updateTask(mainTask.id, { fillColor: defaultTaskStyle.fillColor });
        updateDescendantsColor(mainTask.id, defaultTaskStyle.fillColor);
      });
    } else {
      const palette = COLOR_PALETTES[idx];
      if (palette) {
        mainTasks.forEach((mainTask, i) => {
          const color = palette.colors[i % palette.colors.length];
          updateTask(mainTask.id, { fillColor: color });
          updateDescendantsColor(mainTask.id, color);
        });
      }
    }
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
      // 先保存当前文件的布局信息
      setFiles(prev => {
        const updated = prev.map(f => 
          f.id === activeFileId ? { 
            ...f, 
            mainDirection: canvasProps.mainDirection || 'horizontal' 
          } : f
        );
        localStorage.setItem('moo_files', JSON.stringify(updated));
        return updated;
      });
      
      clearTasks();
      file.tasks.forEach(t => addTask(t));
      setActiveFileId(fileId);
      // 切换时同步 mainDirection 到 canvasProps
      setCanvasProps(prev => ({ ...prev, mainDirection: file.mainDirection ?? 'horizontal' }));
      localStorage.setItem('moo_active_file_id', fileId);
      
      recordRecentFile(file);
    }
  };

  // 新建文件(Tab)时也记录
  const handleNewFile = () => {
    // 先保存当前文件的布局信息
    setFiles(prev => {
      const updated = prev.map(f => 
        f.id === activeFileId ? { 
          ...f, 
          mainDirection: canvasProps.mainDirection || 'horizontal' 
        } : f
      );
      return updated;
    });
    
    const newFile = defaultFile();
    setFiles(prev => {
      const updated = [...prev, newFile];
      localStorage.setItem('moo_files', JSON.stringify(updated));
      return updated;
    });
    clearTasks();
    newFile.tasks.forEach(t => addTask(t));
    setActiveFileId(newFile.id);
    setCanvasProps(prev => ({ ...prev, mainDirection: newFile.mainDirection })); // 新增：同步布局
    
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
      setCanvasProps(prev => ({ ...prev, mainDirection: newFile.mainDirection }));
      localStorage.setItem('moo_files', JSON.stringify([newFile]));
      return;
    }
    
    // 如果关闭的是当前Tab，先保存当前文件的布局信息
    if (activeFileId === fileId) {
      setFiles(prev => {
        const updated = prev.map(f => 
          f.id === activeFileId ? { 
            ...f, 
            mainDirection: canvasProps.mainDirection || 'horizontal' 
          } : f
        );
        return updated;
      });
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
      setCanvasProps(prev => ({ ...prev, mainDirection: nextFile.mainDirection ?? 'horizontal' }));
    }
  };

  // 导出当前Tab
  const handleExport = async () => {
    const file = files.find(f => f.id === activeFileId);
    // 导出数据包含任务和布局方向
    const exportData = {
      tasks: file ? file.tasks : [],
      mainDirection: file?.mainDirection || 'horizontal',
      canvasProps: canvasProps
    };
    const dataStr = JSON.stringify(exportData, null, 2);
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
        const importedData = JSON.parse(evt.target.result);
        
        // 兼容旧格式：如果直接是任务数组，则转换为新格式
        let tasks, mainDirection, canvasProps;
        if (Array.isArray(importedData)) {
          // 旧格式：直接是任务数组
          tasks = importedData;
          mainDirection = 'horizontal'; // 默认水平布局
          canvasProps = {};
        } else if (importedData.tasks && Array.isArray(importedData.tasks)) {
          // 新格式：包含任务和布局信息
          tasks = importedData.tasks;
          mainDirection = importedData.mainDirection || 'horizontal';
          canvasProps = importedData.canvasProps || {};
        } else {
          alert('文件格式不正确');
          return;
        }

        // 先保存当前文件的布局信息
        setFiles(prev => {
          const updated = prev.map(f => 
            f.id === activeFileId ? { 
              ...f, 
              mainDirection: canvasProps.mainDirection || 'horizontal' 
            } : f
          );
          return updated;
        });
        
        clearTasks();
        tasks.forEach(t => addTask(t));
        
        // 同步到当前Tab，包含布局方向
        setFiles(prev => {
          const updated = prev.map(f => f.id === activeFileId ? { 
            ...f, 
            tasks: tasks,
            mainDirection: mainDirection
          } : f);
          localStorage.setItem('moo_files', JSON.stringify(updated));
          return updated;
        });

        // 更新画布属性，包括布局方向
        setCanvasProps(prev => ({
          ...prev,
          ...canvasProps,
          mainDirection: mainDirection
        }));

        alert('导入成功！');
      } catch (error) {
        console.error('导入错误:', error);
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
      const updated = prev.map(f => f.id === activeFileId ? { 
        ...f, 
        tasks,
        mainDirection: canvasProps.mainDirection || 'horizontal' // 同步布局方向
      } : f);
      localStorage.setItem('moo_files', JSON.stringify(updated));
      return updated;
    });
    // 自动同步到最近打开
    const file = files.find(f => f.id === activeFileId);
    if (file) recordRecentFile({ 
      ...file, 
      tasks,
      mainDirection: canvasProps.mainDirection || 'horizontal' // 同步布局方向
    });
    // eslint-disable-next-line
  }, [tasks, canvasProps.mainDirection]);

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
    setShowFormatSidebar(false);
  };

  // 点击最近文件打开
  const handleOpenRecent = (file) => {
    // 先保存当前文件的布局信息
    setFiles(prev => {
      const updated = prev.map(f => 
        f.id === activeFileId ? { 
          ...f, 
          mainDirection: canvasProps.mainDirection || 'horizontal' 
        } : f
      );
      return updated;
    });
    
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
    
    // 同步布局方向到画布属性
    const fileMainDirection = file.mainDirection || 'horizontal';
    setCanvasProps(prev => ({ ...prev, mainDirection: fileMainDirection }));
    
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
    // 导出title、date、importantLevel
    const csvRows = [
      '任务内容,完成时间,重要程度',
      ...tasks.map(t => {
        // 日期格式化为YYYY/MM/DD
        let dateStr = '';
        if (t.date) {
          const d = new Date(t.date);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            dateStr = `${y}/${m}/${day}`;
          }
        }
        // 重要性映射为中文
        let level = t.importantLevel;
        if (level === 'important') level = '重要';
        else if (level === 'secondary') level = '次要';
        else level = '一般';
        return `${JSON.stringify(t.title ?? '')},${dateStr},${level}`;
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

  const handleWheel = (e) => {
    e.stopPropagation();
  };

  // 处理登出确认
  const handleLogoutConfirm = async () => {
    try {
      console.log('开始登出流程...');
      
      // 清除本地存储的数据
      localStorage.removeItem('moo_files');
      localStorage.removeItem('moo_active_file_id');
      localStorage.removeItem('moo_files_history');
      localStorage.removeItem('mooflow-login-state');
      console.log('本地数据已清除');
      
      // 等待一小段时间确保状态更新，然后刷新页面
      setTimeout(() => {
        console.log('刷新页面...');
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('登出失败:', error);
      alert('登出失败，请重试');
    }
  };

  return (
    <div className="canvas-toolbar minimal filebar" style={{ display: 'flex', alignItems: 'center' }}>
      {/* 登出按钮 */}
      <Tooltip text={t('logout')}>
        <button className="toolbar-btn" onClick={() => setShowLogoutConfirm(true)} style={{ marginRight: 8 }}>
          {/* 退出SVG图标 */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
            <path d="M13 5v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
          </svg>
        </button>
      </Tooltip>
      {/* Home按钮 */}
      <Tooltip text={t('recent_open')}>
        <button className="toolbar-btn" onClick={handleShowRecent} style={{ marginRight: 8 }}>
          {/* 带门的极简风格房子SVG */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12L12 3l9 9" />
            <path d="M9 21V9h6v12" />
            <path d="M21 21H3" />
          </svg>
        </button>
      </Tooltip>
      {/* 新增：格式按钮 */}
      <Tooltip text={t('format')}>
        <button
          className="toolbar-btn format-btn"
          onClick={() => setShowFormatSidebar(v => !v)}
          style={{ marginRight: 8, background: showFormatSidebar ? 'var(--format-btn-active-bg)' : 'none' }}
        >
          {/* 侧边栏/面板风格图标SVG */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2.5"/>
            <line x1="9.5" y1="4" x2="9.5" y2="20"/>
            <circle cx="16" cy="9" r="1"/>
            <circle cx="16" cy="15" r="1"/>
          </svg>
        </button>
      </Tooltip>
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
              background: file.id === activeFileId ? 'var(--accent-color)' : 'transparent',
              color: file.id === activeFileId ? '#fff' : 'var(--filebar-text)',
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
                  border: '1px solid var(--accent-color)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  outline: 'none',
                  color: 'var(--accent-color)',
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
              >
                {file.name}
              </span>
            )}
            <span
              style={{ marginLeft: 8, cursor: 'pointer', opacity: 0.7 }}
              onClick={e => handleCloseFile(file.id, e)}
            >
              <CloseIcon />
            </span>
          </div>
        ))}
        <Tooltip text={t('new_file')}>
          <button className="toolbar-btn" onClick={handleNewFile} style={{ marginLeft: 4 }}>
            <NewFileIcon />
          </button>
        </Tooltip>
      </div>
      {/* 导出/导入按钮（带下拉菜单） */}
      <div style={{ position: 'relative', marginRight: 4 }}>
        <Tooltip text={t('export_task')}>
          <button className="toolbar-btn" onClick={() => setExportMenuOpen(v => !v)}>
            <ExportIcon />
          </button>
        </Tooltip>
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
            >{t('export_json')}</div>
            <div
              style={{ padding: '8px 16px', cursor: 'pointer', color: '#333', fontSize: 12 }}
              onClick={handleExportCSV}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f3f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{t('export_csv')}</div>
          </div>
        )}
      </div>
      <div style={{ position: 'relative', marginRight: 4 }}>
        <Tooltip text={t('import_task')}>
          <button className="toolbar-btn" onClick={() => setImportMenuOpen(v => !v)}>
            <ImportIcon />
          </button>
        </Tooltip>
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
            >{t('import_json')}</div>
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
          onWheel={handleWheel}
          style={{
            position: 'fixed',
            top: 64,
            right: 0,
            width: 300,
            height: 'calc(100vh - 256px)',
            background: 'var(--filebar-bg)',
            color: 'var(--filebar-text)',
            backdropFilter: 'blur(48px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(48px) saturate(1.5)',
            boxShadow: '-2px 0 32px #0003',
            zIndex: 9999,
            padding: 24,
            overflowY: 'auto',
            transition: 'transform 0.35s cubic-bezier(.4,1.6,.4,1), opacity 0.25s',
            borderLeft: '1px solid var(--filebar-border)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '18px 18px 18px 18px',
            marginBottom: 0,
            opacity: recentPopupVisible ? 1 : 0,
            transform: recentPopupVisible ? 'translateX(0)' : 'translateX(100%)',
            // 视觉细节
            borderTop: '1px solid var(--filebar-border)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--filebar-text)', flex: 1 }}>{t('recent_open')}</span>
            <button
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--filebar-text)', opacity: 0.6 }}
              onClick={() => setShowRecent(false)}
              title={t('close_file')}
            >×</button>
          </div>
          {recentFiles.length === 0 ? (
            <div style={{ color: 'var(--filebar-text)', opacity: 0.6, textAlign: 'center', marginTop: 60 }}>{t('no_recent_file')}</div>
          ) : (
            recentFiles.map(file => (
              <div
                key={file.id}
                style={{
                  padding: '12px 10px',
                  borderRadius: 8,
                  marginBottom: 10,
                  background: file.id === activeFileId ? 'var(--accent-color)' : 'var(--card-bg)',
                  boxShadow: '0 1px 4px #0001',
                  cursor: 'pointer',
                  border: file.id === activeFileId ? '1.5px solid var(--accent-color)' : '1.5px solid var(--filebar-border)',
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
                    color: file.id === activeFileId ? '#fff' : 'var(--filebar-text)',
                    opacity: 0.5,
                    fontSize: 18,
                    cursor: 'pointer',
                    zIndex: 2,
                    padding: 0,
                    lineHeight: 1,
                    transition: 'color 0.2s, opacity 0.2s',
                  }}
                  title={t('remove_from_list')}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#f44336';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = file.id === activeFileId ? '#fff' : 'var(--filebar-text)';
                    e.currentTarget.style.opacity = '0.5';
                  }}
                >×</button>
                <span style={{ fontWeight: 600, color: file.id === activeFileId ? '#fff' : 'var(--filebar-text)', fontSize: 16 }}>{file.name}</span>
                <span style={{ color: file.id === activeFileId ? '#fff' : 'var(--filebar-text)', opacity: file.id === activeFileId ? 0.9 : 0.7, fontSize: 13, marginTop: 2 }}>{t('recent_edit')}：{file.lastOpen ? new Date(file.lastOpen).toLocaleString() : ''}</span>
              </div>
            ))
          )}
        </div>
      )}
      {/* 右侧格式侧边栏 */}
      <FormatSidebar
        visible={showFormatSidebar}
        onClose={() => setShowFormatSidebar(false)}
        canvasProps={{ ...canvasProps, mainDirection: mainDirection }}
        onCanvasChange={handleCanvasChange}
        selectedTask={selectedTask}
        selectedTasks={selectedTasks}
        selectedTaskIds={selectedTaskIds}
        selectedLink={selectedLink}
        onTaskStyleChange={handleTaskStyleChange}
        // 新增：传递分支样式属性
        branchStyle={branchStyle}
        onBranchStyleChange={onBranchStyleChange}
        paletteIdx={paletteIdx}
        onPaletteChange={handlePaletteChange}
        autoArrangeTasks={typeof autoArrangeTasks === 'function' ? autoArrangeTasks : undefined}
      />
      
      {/* 登出确认弹窗 */}
      {showLogoutConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              maxWidth: 400,
              width: '90%',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* 警告图标 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            
            {/* 标题 */}
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: 20,
              fontWeight: 600,
              color: '#1f2937',
              textAlign: 'center',
            }}>
              确认登出？
            </h3>
            
            {/* 警告内容 */}
            <div style={{
              marginBottom: 24,
              color: '#6b7280',
              fontSize: 14,
              lineHeight: 1.6,
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                登出后将清除所有未保存的数据，包括：
              </p>
              <ul style={{
                margin: '0 0 16px 0',
                paddingLeft: 20,
                color: '#ef4444',
              }}>
                <li>当前编辑的文件</li>
                <li>最近打开记录</li>
                <li>所有本地存储数据</li>
              </ul>
              <p style={{
                margin: 0,
                color: '#f59e0b',
                fontWeight: 500,
                fontSize: 13,
              }}>
                ⚠️ 此操作不可撤销！
              </p>
            </div>
            
            {/* 按钮组 */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
            }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                取消
              </button>
              <button
                onClick={handleLogoutConfirm}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
              >
                确认登出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasFileToolbar; 
import { create } from 'zustand';
import tinycolor from 'tinycolor2';

// 优先从 sessionStorage 获取 fileId，没有则从 localStorage 获取，没有则新生成
let fileId = sessionStorage.getItem('moo_file_id') || localStorage.getItem('moo_file_id');
if (!fileId) {
  fileId = `file_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  localStorage.setItem('moo_file_id', fileId);
}
sessionStorage.setItem('moo_file_id', fileId);

// 本地存储 key（每个 tab 独立）
const TASKS_KEY = `moo_tasks_${fileId}`;

// 辅助函数：根据 parentId/level 推断 type
function inferTaskType(task, tasks) {
  if (task.parentId === null) return 'center';
  if (task.level === 1) return 'main';
  if (task.level === 2) return 'sub';
  if (task.level >= 3) return 'detail';
  // 兜底：根据父任务类型
  const parent = tasks.find(t => t.id === task.parentId);
  if (!parent) return 'main';
  if (parent.type === 'center') return 'main';
  if (parent.type === 'main') return 'sub';
  return 'detail';
}

// 辅助函数：保证所有任务都有 type 字段
function ensureTaskType(tasks) {
  return tasks.map(t => ({
    ...t,
    type: t.type || inferTaskType(t, tasks)
  }));
}

// 辅助函数：保证所有 links 都有完整的属性字段和所有任务有 type 字段
function ensureLinksLabel(tasks) {
  const withType = ensureTaskType(tasks);
  return withType.map(t => ({
    ...t,
    links: (t.links || []).map(l => ({
      ...l,
      label: typeof l.label === 'string' ? l.label : '',
      // 确保连线样式属性存在
      lineStyle: l.lineStyle || defaultLinkStyle.lineStyle,
      arrowStyle: l.arrowStyle || defaultLinkStyle.arrowStyle,
      lineWidth: l.lineWidth || defaultLinkStyle.lineWidth,
      color: l.color || defaultLinkStyle.color,
      // 确保锚点信息存在
      fromAnchor: l.fromAnchor || null,
      toAnchor: l.toAnchor || null
    }))
  }));
}

// 从 localStorage 加载任务数据
function loadTasksFromStorage() {
  try {
    const saved = localStorage.getItem(TASKS_KEY);
    if (saved) {
      return ensureLinksLabel(JSON.parse(saved));
    }
  } catch (e) {
    // 解析失败则忽略
  }
  // 默认初始任务
  return ensureLinksLabel([
    {
      id: 1,
      title: "中心任务",
      position: { x: 100, y: 100 },
      links: [],
      lock: true,
      parentId: null,
      level: 0,
      date: new Date().toISOString(), // 默认当天
      collapsed: false,
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Microsoft YaHei, Arial, sans-serif',
      fontSize: 16,
      fontWeight: '500',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#222222',
      textAlign: 'center',
      importantLevel: 'normal',
    }
  ]);
}

// 保存任务数据到 localStorage
function saveTasksToStorage(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(ensureLinksLabel(tasks)));
  } catch (e) {
    // 存储失败忽略
  }
}

// 默认连线样式
export const defaultLinkStyle = {
  lineStyle: 'solid',
  arrowStyle: 'normal',
  lineWidth: 2,
  color: '#86868b'
};

export const useTaskStore = create((set, get) => ({
  // 初始化时从 localStorage 恢复
  tasks: loadTasksFromStorage(),
  undoStack: [],
  redoStack: [],
  // 保存快照
  _saveSnapshot() {
    const { tasks, undoStack } = get();
    set({
      undoStack: [...undoStack, JSON.parse(JSON.stringify(ensureLinksLabel(tasks)))],
      redoStack: [],
    });
  },
  addTask: (task) => {
    get()._saveSnapshot();
    set((state) => {
      // 自动分配 type 字段
      let type = task.type;
      if (!type) {
        if (task.parentId === null) type = 'center';
        else if (task.level === 1) type = 'main';
        else if (task.level === 2) type = 'sub';
        else if (task.level >= 3) type = 'detail';
        else {
          // 兜底：根据父任务类型
          const parent = state.tasks.find(t => t.id === task.parentId);
          if (!parent) type = 'main';
          else if (parent.type === 'center') type = 'main';
          else if (parent.type === 'main') type = 'sub';
          else type = 'detail';
        }
      }
      
      // 确保任务有完整的位置信息
      const processedTask = {
        ...task,
        type,
        date: task.date || null,
        collapsed: task.collapsed || false,
        importantLevel: task.importantLevel || 'normal',
        position: task.position || { x: 100, y: 100 },
        // 确保样式字段存在
        fillColor: task.fillColor || defaultTaskStyle.fillColor,
        borderColor: task.borderColor || defaultTaskStyle.borderColor,
        borderWidth: task.borderWidth || defaultTaskStyle.borderWidth,
        borderStyle: task.borderStyle || defaultTaskStyle.borderStyle,
        fontFamily: task.fontFamily || defaultTaskStyle.fontFamily,
        fontSize: task.fontSize || defaultTaskStyle.fontSize,
        fontWeight: task.fontWeight || defaultTaskStyle.fontWeight,
        fontStyle: task.fontStyle || defaultTaskStyle.fontStyle,
        textDecoration: task.textDecoration || defaultTaskStyle.textDecoration,
        color: task.color || defaultTaskStyle.color,
        textAlign: task.textAlign || defaultTaskStyle.textAlign,
        shape: task.shape || defaultTaskStyle.shape,
      };
      
      const newTasks = ensureLinksLabel([...state.tasks, processedTask]);
      saveTasksToStorage(newTasks); // 保存到本地
      return { tasks: newTasks };
    });
  },
  updateTask: (id, updates, saveSnapshot = true) => {
    if (saveSnapshot) get()._saveSnapshot();
  
    set((state) => {
      let newTasks = state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
  
      // --- 样式继承逻辑 ---
      const stylePropagationKeys = ['fillColor'];
      const propertiesToPropagate = {};
      let shouldPropagate = false;
  
      for (const key of stylePropagationKeys) {
        if (key in updates) {
          propertiesToPropagate[key] = updates[key];
          shouldPropagate = true;
        }
      }
  
      if (shouldPropagate) {
        const tasksMap = new Map(newTasks.map(t => [t.id, t]));
        
        const initialColor = propertiesToPropagate.fillColor;
        const colorDepth1 = tinycolor(initialColor).lighten(15).toHexString();
        const colorDepth2 = tinycolor(colorDepth1).lighten(15).toHexString();

        const queue = [{ taskId: id, depth: 0 }];
        const visited = new Set([id]);

        while (queue.length > 0) {
          const { taskId, depth } = queue.shift();
          const currentTask = tasksMap.get(taskId);

          if (!currentTask || !currentTask.links) continue;

          for (const link of currentTask.links) {
            const nextTask = tasksMap.get(link.toId);

            if (nextTask && !visited.has(nextTask.id)) {
              const taskToUpdate = tasksMap.get(nextTask.id);
              if (taskToUpdate) {
                // --- 颜色调淡逻辑 ---
                if ('fillColor' in propertiesToPropagate) {
                  const newDepth = depth + 1;
                  if (newDepth === 1) {
                    taskToUpdate.fillColor = colorDepth1;
                  } else { // newDepth >= 2
                    taskToUpdate.fillColor = colorDepth2;
                  }
                }
                // --- 颜色调淡逻辑结束 ---
              }

              visited.add(nextTask.id);
              queue.push({ taskId: nextTask.id, depth: depth + 1 });
            }
          }
        }
        newTasks = Array.from(tasksMap.values());
      }
      // --- 样式继承逻辑结束 ---
  
      const finalTasks = ensureLinksLabel(newTasks);
      saveTasksToStorage(finalTasks);
      return { tasks: finalTasks };
    });
  },
  addLink: (fromId, toId, fromAnchor = null, toAnchor = null, label = "") => {
    get()._saveSnapshot();
    set((state) => {
      const newTasks = ensureLinksLabel(state.tasks.map((t) => {
        if (t.id === fromId) {
          const idx = t.links.findIndex(l => l.toId === toId);
          if (idx !== -1) {
            // 已存在则更新锚点和label，保留现有样式属性
            const newLinks = [...t.links];
            const existingLink = newLinks[idx];
            newLinks[idx] = {
              ...existingLink,
              fromAnchor,
              toAnchor,
              label: typeof existingLink.label === 'string' ? existingLink.label : '',
              // 确保样式属性存在
              lineStyle: existingLink.lineStyle || defaultLinkStyle.lineStyle,
              arrowStyle: existingLink.arrowStyle || defaultLinkStyle.arrowStyle,
              lineWidth: existingLink.lineWidth || defaultLinkStyle.lineWidth,
              color: existingLink.color || defaultLinkStyle.color
            };
            return { ...t, links: newLinks };
          } else {
            // 不存在则添加，包含完整的默认样式
            return {
              ...t,
              links: [...t.links, {
                toId,
                fromAnchor,
                toAnchor,
                label: typeof label === 'string' ? label : '',
                ...defaultLinkStyle
              }]
            };
          }
        }
        return t;
      }));
      saveTasksToStorage(newTasks); // 保存到本地
      return { tasks: newTasks };
    });
  },
  updateLinkLabel: (fromId, toId, label) => {
    get()._saveSnapshot();
    set((state) => {
      const newTasks = ensureLinksLabel(state.tasks.map((t) => {
        if (t.id === fromId) {
          return {
            ...t,
            links: t.links.map(l =>
              l.toId === toId ? { ...l, label: typeof label === 'string' ? label : '' } : l
            )
          };
        }
        return t;
      }));
      saveTasksToStorage(newTasks);
      return { tasks: newTasks };
    });
  },
  deleteTask: (id) => {
    get()._saveSnapshot();
    set((state) => {
      const { tasks } = state;
      const taskToDelete = tasks.find(t => t.id === id);

      if (!taskToDelete) {
        return { tasks }; // 如果找不到任务，则不执行任何操作
      }

      // 如果是主线任务（parentId为null），只删除自己并返回，彻底阻断后续所有级联删除逻辑
      if (taskToDelete.parentId === null) {
        const newTasks = tasks
          .filter(t => t.id !== id)
          .map(t => ({
            ...t,
            links: t.links.filter(l => l.toId !== id),
          }));
        const finalTasks = ensureLinksLabel(newTasks);
        saveTasksToStorage(finalTasks);
        return { tasks: finalTasks };
      }

      // 细分任务/子任务，保留原有级联删除逻辑
      let idsToDelete = new Set([id]);
      // "细分任务"是具有相同 parentId 和 y 坐标的同级任务
      const siblings = tasks.filter(t => 
        t.parentId === taskToDelete.parentId && 
        t.position.y === taskToDelete.position.y
      );
      siblings.sort((a, b) => a.position.x - b.position.x);
      const startIndex = siblings.findIndex(t => t.id === id);
      if (startIndex !== -1) {
        for (let i = startIndex + 1; i < siblings.length; i++) {
          idsToDelete.add(siblings[i].id);
        }
      }

      // 过滤掉要删除的任务，并清理指向它们的链接
      const newTasks = tasks
        .filter(t => !idsToDelete.has(t.id))
        .map(t => ({
          ...t,
          links: t.links.filter(l => !idsToDelete.has(l.toId)),
        }));

      const finalTasks = ensureLinksLabel(newTasks);
      saveTasksToStorage(finalTasks); // 保存到本地
      return { tasks: finalTasks };
    });
  },
  deleteLink: (fromId, toId) => {
    get()._saveSnapshot();
    set((state) => {
      const newTasks = ensureLinksLabel(state.tasks.map((t) =>
        t.id === fromId
          ? { ...t, links: t.links.filter((l) => l.toId !== toId) }
          : t
      ));
      saveTasksToStorage(newTasks); // 保存到本地
      return { tasks: newTasks };
    });
  },
  undo: () => {
    const { undoStack, redoStack, tasks } = get();
    if (undoStack.length === 0) return;
    const prev = ensureLinksLabel(undoStack[undoStack.length - 1]);
    saveTasksToStorage(prev); // 保存到本地
    set({
      tasks: JSON.parse(JSON.stringify(prev)),
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, JSON.parse(JSON.stringify(ensureLinksLabel(tasks)))],
    });
  },
  redo: () => {
    const { undoStack, redoStack, tasks } = get();
    if (redoStack.length === 0) return;
    const next = ensureLinksLabel(redoStack[redoStack.length - 1]);
    saveTasksToStorage(next); // 保存到本地
    set({
      tasks: JSON.parse(JSON.stringify(next)),
      undoStack: [...undoStack, JSON.parse(JSON.stringify(ensureLinksLabel(tasks)))],
      redoStack: redoStack.slice(0, -1),
    });
  },
  toggleCollapse: (id) => {
    set((state) => {
      const newTasks = ensureLinksLabel(state.tasks.map((t) =>
        t.id === id ? { ...t, collapsed: !t.collapsed } : t
      ));
      saveTasksToStorage(newTasks);
      return { tasks: newTasks };
    });
  },
  // 拖动卡片时，强制将相关连线的锚点全部设为null（无论原来是否为null）
  forceResetAnchors: (cardId) => {
    set((state) => {
      const newTasks = ensureLinksLabel(state.tasks.map((t) => {
        let links = t.links.map(l => {
          if (t.id === cardId || l.toId === cardId) {
            return { ...l, fromAnchor: null, toAnchor: null };
          }
          return l;
        });
        return { ...t, links };
      }));
      saveTasksToStorage(newTasks);
      return { tasks: newTasks };
    });
  },
  // 新增：清空所有任务
  clearTasks: () => {
    saveTasksToStorage([]);
    set({ tasks: [] });
  },
  // 新增：静默移动任务（不触发快照）
  moveTaskSilently: (id, position) => {
    set((state) => {
      const newTasks = ensureLinksLabel(state.tasks.map((t) => (t.id === id ? { ...t, position } : t)));
      saveTasksToStorage(newTasks);
      return { tasks: newTasks };
    });
  },
  
  // 新增：批量导入任务（用于文件导入）
  importTasks: (tasks) => {
    set((state) => {
      // 确保所有任务都有完整的信息
      const processedTasks = tasks.map(task => {
        // 自动分配 type 字段
        let type = task.type;
        if (!type) {
          if (task.parentId === null) type = 'center';
          else if (task.level === 1) type = 'main';
          else if (task.level === 2) type = 'sub';
          else if (task.level >= 3) type = 'detail';
          else {
            // 兜底：根据父任务类型
            const parent = tasks.find(t => t.id === task.parentId);
            if (!parent) type = 'main';
            else if (parent.type === 'center') type = 'main';
            else if (parent.type === 'main') type = 'sub';
            else type = 'detail';
          }
        }
        
        // 确保连线信息完整
        const processedLinks = (task.links || []).map(link => ({
          ...link,
          label: typeof link.label === 'string' ? link.label : '',
          // 确保连线样式属性存在
          lineStyle: link.lineStyle || defaultLinkStyle.lineStyle,
          arrowStyle: link.arrowStyle || defaultLinkStyle.arrowStyle,
          lineWidth: link.lineWidth || defaultLinkStyle.lineWidth,
          color: link.color || defaultLinkStyle.color,
          // 确保锚点信息存在
          fromAnchor: link.fromAnchor || null,
          toAnchor: link.toAnchor || null
        }));
        
        return {
          ...task,
          type,
          date: task.date || null,
          collapsed: task.collapsed || false,
          importantLevel: task.importantLevel || 'normal',
          position: task.position || { x: 100, y: 100 },
          links: processedLinks, // 使用处理后的连线信息
          // 确保样式字段存在
          fillColor: task.fillColor || defaultTaskStyle.fillColor,
          borderColor: task.borderColor || defaultTaskStyle.borderColor,
          borderWidth: task.borderWidth || defaultTaskStyle.borderWidth,
          borderStyle: task.borderStyle || defaultTaskStyle.borderStyle,
          fontFamily: task.fontFamily || defaultTaskStyle.fontFamily,
          fontSize: task.fontSize || defaultTaskStyle.fontSize,
          fontWeight: task.fontWeight || defaultTaskStyle.fontWeight,
          fontStyle: task.fontStyle || defaultTaskStyle.fontStyle,
          textDecoration: task.textDecoration || defaultTaskStyle.textDecoration,
          color: task.color || defaultTaskStyle.color,
          textAlign: task.textAlign || defaultTaskStyle.textAlign,
          shape: task.shape || defaultTaskStyle.shape,
        };
      });
      
      const newTasks = ensureLinksLabel(processedTasks);
      saveTasksToStorage(newTasks);
      return { tasks: newTasks };
    });
  },
  updateLinkStyle: (fromId, toId, style) => {
    get()._saveSnapshot();
    set((state) => {
      const newTasks = ensureLinksLabel(state.tasks.map((t) => {
        if (t.id === fromId) {
          const links = t.links.map(l =>
            l.toId === toId ? { ...l, ...style } : l
          );
          return { ...t, links };
        }
        return t;
      }));
      saveTasksToStorage(newTasks);
      return { tasks: newTasks };
    });
  },
}));

// 监听 localStorage 变化，实现多标签页数据同步（仅同步同 fileId 的 tab）
window.addEventListener('storage', (event) => {
  if (event.key === TASKS_KEY) {
    useTaskStore.setState({ tasks: loadTasksFromStorage() });
  }
});

// 全局默认卡片样式
export const defaultTaskStyle = {
  shape: 'roundRect',
  fillColor: '#f8f8fa',
  borderColor: '#e0e0e5',
  borderWidth: 1.5,
  borderStyle: 'solid',
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Microsoft YaHei, Arial, sans-serif',
  fontSize: 16,
  fontWeight: '500',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#222222',
  textAlign: 'center',
  importantLevel: 'normal',
}; 
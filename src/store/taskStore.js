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
  // 如果任务已经被标记为独立任务，保持该类型
  if (task.type === 'independent') return 'independent';
  
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
        if (task.type === 'independent') type = 'independent';
        else if (task.parentId === null) type = 'center';
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
    // 预校验：防环（仅针对非中心/主线任务）
    const tasksBefore = get().tasks;
    const targetPre = tasksBefore.find(t => t.id === toId);
    if (!targetPre) return;
    const isCenterOrMain = targetPre.type === 'center' || targetPre.type === 'main' || targetPre.id === tasksBefore[0]?.id;
    if (!isCenterOrMain) {
      // 如果把 toId 的父设为 fromId，会不会导致 fromId 的祖先链包含 toId
      let cur = fromId;
      const visited = new Set();
      let cycle = false;
      while (true) {
        const node = tasksBefore.find(t => t.id === cur);
        if (!node) break;
        if (node.parentId == null) break;
        if (visited.has(node.parentId)) break;
        if (node.parentId === toId) { cycle = true; break; }
        visited.add(node.parentId);
        cur = node.parentId;
      }
      if (cycle) {
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('该连线会导致父子关系形成闭环，已阻止连线。');
        }
        return;
      }
    }

    get()._saveSnapshot();
    set((state) => {
      const { tasks } = state;
      
      // 找到目标任务
      const targetTask = tasks.find(t => t.id === toId);
      if (!targetTask) {
        return { tasks };
      }
      
      // 检查是否是中心/主线任务（这些任务不受影响）
      const isCenterOrMain = targetTask.type === 'center' || targetTask.type === 'main' || targetTask.id === tasks[0]?.id;
      if (isCenterOrMain) {
        // 中心任务、主线任务和独立任务不受影响，只添加连线
        const newTasks = ensureLinksLabel(tasks.map((t) => {
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
        saveTasksToStorage(newTasks);
        return { tasks: newTasks };
      }
      
      // 对于其他任务：添加/更新连线 + 建立父子关系（并继承折叠与层级/类型）
      const fromTask = tasks.find(t => t.id === fromId);
      const newTasks = ensureLinksLabel(tasks.map((t) => {
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
        // 同时更新目标任务的父子关系
        if (t.id === toId && fromTask) {
          // 根据父任务类型推断新类型
          const newType = fromTask.type === 'center' ? 'main' : (fromTask.type === 'main' ? 'sub' : 'detail');
          return {
            ...t,
            parentId: fromId,
            level: (fromTask.level || 1) + 1,
            collapsed: fromTask.collapsed,
            // 若 B 之前是独立任务，转回普通任务类型
            type: newType
          };
        }
        return t;
      }));
      
      saveTasksToStorage(newTasks);
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
      const { tasks } = state;
      
      // 找到目标任务
      const targetTask = tasks.find(t => t.id === toId);
      if (!targetTask) {
        return { tasks };
      }
      
      // 检查是否是中心任务、主线任务或独立任务（这些任务不受影响）
      if (targetTask.parentId === null || targetTask.type === 'center' || targetTask.type === 'independent') {
        // 中心任务、主线任务和独立任务不受影响，只删除连线
        const newTasks = ensureLinksLabel(tasks.map((t) =>
          t.id === fromId
            ? { ...t, links: t.links.filter((l) => l.toId !== toId) }
            : t
        ));
        saveTasksToStorage(newTasks);
        return { tasks: newTasks };
      }
      
      // 删除连线
      const newTasks = ensureLinksLabel(tasks.map((t) =>
        t.id === fromId
          ? { ...t, links: t.links.filter((l) => l.toId !== toId) }
          : t
      ));
      
      // 计算目标任务的入线数量（删除连线后的状态）
      const incomingLinks = newTasks.flatMap(t => 
        (t.links || []).filter(l => l.toId === toId)
      );
      
      // 检查是否是被删除的父子关系连线
      const wasParentChildLink = targetTask.parentId === fromId;
      
      if (wasParentChildLink) {
        // 删除的是父子关系连线
        if (incomingLinks.length === 0) {
          // 没有其他入线，变成独立任务
          const updatedTasks = newTasks.map((t) => {
            if (t.id === toId) {
              return { 
                ...t, 
                parentId: null,
                level: 1, // 重置为一级任务
                type: 'independent' // 标记为独立任务
              };
            }
            return t;
          });
          saveTasksToStorage(updatedTasks);
          return { tasks: updatedTasks };
        } else {
          // 有其他入线，选择第一个作为新的父子关系
          const newParentId = incomingLinks[0].fromId;
          const newParent = newTasks.find(t => t.id === newParentId);
          
          if (newParent) {
            const updatedTasks = newTasks.map((t) => {
              if (t.id === toId) {
                return { 
                  ...t, 
                  parentId: newParentId,
                  level: (newParent.level || 1) + 1, // 根据新父任务的层级设置
                  collapsed: newParent.collapsed // 继承新父任务的折叠状态
                };
              }
              return t;
            });
            saveTasksToStorage(updatedTasks);
            return { tasks: updatedTasks };
          }
        }
      }
      
      // 如果不是父子关系连线，只删除连线，不改变父子关系
      saveTasksToStorage(newTasks);
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
          if (task.type === 'independent') type = 'independent';
          else if (task.parentId === null) type = 'center';
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
  // 复制所选任务（含可选后代），保存到应用剪贴板（localStorage）
  copyTasksToClipboard: (selectedIds, options = {}) => {
    const { includeDescendants = true } = options;
    const tasks = get().tasks;
    const selectedSet = new Set(selectedIds);

    // 收集层级后代（不包含细分同级链）
    if (includeDescendants) {
      const queue = [...selectedIds];
      while (queue.length) {
        const pid = queue.shift();
        tasks.filter(t => t.parentId === pid).forEach(child => {
          if (!selectedSet.has(child.id)) {
            selectedSet.add(child.id);
            queue.push(child.id);
          }
        });
      }
    }

    const subsetTasks = tasks.filter(t => selectedSet.has(t.id));
    if (subsetTasks.length === 0) return;

    // 仅保留子集内部的连线
    const subsetIds = new Set(subsetTasks.map(t => t.id));
    const subsetWithLinks = subsetTasks.map(t => ({
      ...t,
      links: (t.links || []).filter(l => subsetIds.has(l.toId))
    }));

    // 归一化位置基准（左上对齐），方便粘贴时整体偏移
    const minX = Math.min(...subsetWithLinks.map(t => t.position.x));
    const minY = Math.min(...subsetWithLinks.map(t => t.position.y));

    const payload = {
      version: 1,
      base: { x: minX, y: minY },
      tasks: subsetWithLinks,
    };

    try {
      localStorage.setItem(`moo_clipboard_${fileId}`, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  },
  // 从剪贴板粘贴任务：
  // - contextTaskId: 将顶层粘贴项作为该卡片的同级（默认），或作为子级（asChild=true）
  // - asChild: 是否作为 context 的子任务
  // - offset: 粘贴偏移
  pasteTasksFromClipboard: (contextTaskId = null, asChild = false, offset = { x: 40, y: 40 }, options = {}) => {
    const { forceIndependentTopLevel = false } = options;
    const clipboardRaw = localStorage.getItem(`moo_clipboard_${fileId}`);
    if (!clipboardRaw) return;
    let data;
    try {
      data = JSON.parse(clipboardRaw);
    } catch (e) {
      return;
    }
    if (!data || !Array.isArray(data.tasks) || !data.base) return;

    const state = get();
    state._saveSnapshot();

    const allTasks = state.tasks;
    const contextTask = contextTaskId ? allTasks.find(t => t.id === contextTaskId) : null;
    const contextParentId = contextTask ? (asChild ? contextTask.id : contextTask.parentId ?? null) : null;
    const contextLevel = (() => {
      if (!contextTask) return 1;
      return asChild ? (contextTask.level || 1) + 1 : (contextTask.level || 1);
    })();

    const idMap = new Map();
    const now = Date.now();
    let seq = 0;

    // 先创建所有任务副本（不含链接），计算新位置与父级
    const originalIdToTask = new Map(data.tasks.map(t => [t.id, t]));
    // 找到子集中的“顶层”任务：其 parentId 不在子集内
    const subsetIds = new Set(data.tasks.map(t => t.id));
    const isTopOfSubset = (t) => !subsetIds.has(t.parentId);

    // 生成新任务数组
    const newTasks = data.tasks.map(orig => {
      const newId = now + (++seq);
      idMap.set(orig.id, newId);

      // 相对偏移到新位置
      const dx = (orig.position.x - data.base.x) + (offset?.x || 0);
      const dy = (orig.position.y - data.base.y) + (offset?.y || 0);

      // 计算父级：
      // - 若原父在子集中，指向其映射的新ID
      // - 否则：若存在 context，则把“子集顶层任务”放到 context 上（同级或子级），其余保持层内结构
      let parentId = null;
      if (subsetIds.has(orig.parentId)) {
        parentId = idMap.get(orig.parentId) || null;
      } else if (contextTask) {
        parentId = isTopOfSubset(orig) ? contextParentId : null;
      } else {
        parentId = null; // 顶层仍为 null，但可按 independent 处理
      }

      // 计算层级与类型
      let level = 1;
      if (parentId == null) {
        level = 1;
      } else if (subsetIds.has(orig.parentId)) {
        // 继承原相对层级
        const parentOriginal = originalIdToTask.get(orig.parentId);
        const parentOriginalLevel = (parentOriginal?.level || 1);
        level = parentOriginalLevel + 1;
      } else if (contextTask) {
        level = contextLevel + (isTopOfSubset(orig) ? 0 : 1);
      }

      let type = 'main';
      if (parentId === null) {
        // 若没有上下文且要求顶层为独立任务
        if (!contextTask && isTopOfSubset(orig) && forceIndependentTopLevel) type = 'independent';
        else type = 'main';
      } else if (level === 2) type = 'sub';
      else if (level >= 3) type = 'detail';

      // 若粘贴到折叠父下方，保持与父相同的折叠可见性
      const collapsed = parentId != null ? (allTasks.find(t => t.id === parentId)?.collapsed || false) : (orig.collapsed || false);

      return {
        ...orig,
        id: newId,
        parentId,
        level,
        type,
        collapsed,
        position: { x: (contextTask ? contextTask.position.x : 0) + dx, y: (contextTask ? contextTask.position.y : 0) + dy },
        links: [], // 链接稍后重建
      };
    });

    // 将新任务插入状态
    set({ tasks: ensureLinksLabel([...allTasks, ...newTasks]) });

    // 重建子集内部连线（只保留两端都在子集内的连线）
    const stateAfter = get();
    // 若作为子级粘贴：为每个“子集顶层任务”建立从 context 到它的连线
    if (contextTask && asChild) {
      data.tasks.filter(isTopOfSubset).forEach(origTop => {
        const newTo = idMap.get(origTop.id);
        if (newTo) {
          stateAfter.addLink(contextTask.id, newTo, null, null, '');
        }
      });
    }
    data.tasks.forEach(orig => {
      (orig.links || []).forEach(l => {
        const newFrom = idMap.get(orig.id);
        const newTo = idMap.get(l.toId);
        if (newFrom && newTo) {
          stateAfter.addLink(newFrom, newTo, null, null, typeof l.label === 'string' ? l.label : '');
          // 恢复样式
          stateAfter.updateLinkStyle(newFrom, newTo, {
            lineStyle: l.lineStyle,
            arrowStyle: l.arrowStyle,
            lineWidth: l.lineWidth,
            color: l.color,
          });
        }
      });
    });

    // 保存最终结果
    saveTasksToStorage(get().tasks);
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

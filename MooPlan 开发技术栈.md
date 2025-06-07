# MooPlan 开发技术栈

# Phase 1 开发手册 (SVG/HTML 技术栈)

## 一、技术选型与架构

```other
graph TD
    A[前端框架] --> B[React 18]
    C[SVG操作] --> D[d3.js]
    C --> E[react-spring]
    F[状态管理] --> G[Zustand]
    H[实时协作] --> I[Yjs]
    J[样式] --> K[Tailwind CSS]
    L[构建工具] --> M[Vite]
```

## 二、核心功能实现方案

### 1. 无限画布系统

```other
// 画布核心组件
const InfiniteCanvas = () => {
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [tasks, setTasks] = useState([]);
  const svgRef = useRef(null);

  // 处理画布导航
  const handlePan = (dx, dy) => {
    setViewport(prev => ({
      ...prev,
      x: prev.x + dx / prev.scale,
      y: prev.y + dy / prev.scale
    }));
  };

  // 处理缩放
  const handleZoom = (delta, clientX, clientY) => {
    const newScale = Math.max(0.1, Math.min(5, viewport.scale * (1 + delta * 0.01)));
    
    // 计算缩放中心偏移
    const rect = svgRef.current.getBoundingClientRect();
    const dx = (clientX - rect.left - viewport.x) / viewport.scale;
    const dy = (clientY - rect.top - viewport.y) / viewport.scale;
    
    setViewport({
      scale: newScale,
      x: clientX - dx * newScale,
      y: clientY - dy * newScale
    });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <svg 
        ref={svgRef}
        className="absolute inset-0"
        viewBox={`${viewport.x} ${viewport.y} ${window.innerWidth/viewport.scale} ${window.innerHeight/viewport.scale}`}
        onWheel={(e) => handleZoom(e.deltaY, e.clientX, e.clientY)}
      >
        {/* 网格背景 */}
        <defs>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#eee" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* 任务节点 */}
        {tasks.map(task => (
          <TaskNode key={task.id} task={task} viewport={viewport} />
        ))}
        
        {/* 连接线 */}
        {tasks.flatMap(task => 
          task.links.map(linkId => {
            const target = tasks.find(t => t.id === linkId);
            return target && (
              <LinkLine key={`${task.id}-${linkId}`} source={task} target={target} />
            );
          })
        )}
      </svg>
      
      {/* 工具栏 */}
      <CanvasToolbar onAddTask={handleAddTask} />
    </div>
  );
};
```

### 2. 结构化引擎 (XMind 风格)

```other
// 任务节点组件
const TaskNode = ({ task, viewport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(task.position);
  
  // 拖拽处理
  const handleDrag = useCallback((dx, dy) => {
    setPosition(prev => ({
      x: prev.x + dx / viewport.scale,
      y: prev.y + dy / viewport.scale
    }));
  }, [viewport.scale]);
  
  // 拖拽结束
  const handleDragEnd = () => {
    updateTaskPosition(task.id, position);
    setIsDragging(false);
  };

  return (
    <g 
      transform={`translate(${position.x}, ${position.y})`}
      className="cursor-move"
      onMouseDown={() => setIsDragging(true)}
    >
      <rect 
        width={task.width} 
        height={task.height} 
        rx="6" 
        fill="white" 
        stroke={isDragging ? "#3b82f6" : "#d1d5db"} 
        strokeWidth="2"
      />
      <foreignObject width={task.width} height={task.height} y={8}>
        <div className="px-3 py-2">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}
        </div>
      </foreignObject>
      
      {/* 折叠/展开按钮 */}
      {task.children.length > 0 && (
        <g transform={`translate(${task.width - 20}, 10)`}>
          <circle r="10" fill="#f3f4f6" />
          <text 
            x="0" 
            y="5" 
            textAnchor="middle" 
            fontSize="14" 
            fill="#4b5563"
            onClick={() => toggleTaskExpansion(task.id)}
          >
            {task.expanded ? "−" : "+"}
          </text>
        </g>
      )}
    </g>
  );
};

// 连接线组件
const LinkLine = ({ source, target }) => {
  return (
    <line 
      x1={source.position.x + source.width/2} 
      y1={source.position.y + source.height} 
      x2={target.position.x + target.width/2} 
      y2={target.position.y} 
      stroke="#9ca3af" 
      strokeWidth="2" 
      markerEnd="url(#arrowhead)"
    />
  );
};
```

### 3. 手绘识别引擎

```other
// 手绘箭头识别组件
const FreehandDrawer = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState("");
  const svgRef = useRef(null);
  
  const startDrawing = (e) => {
    const pt = getSVGPoint(e);
    setIsDrawing(true);
    setPath(`M${pt.x},${pt.y}`);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    const pt = getSVGPoint(e);
    setPath(prev => `${prev} L${pt.x},${pt.y}`);
  };
  
  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // 识别箭头连接的任务
    const { startTask, endTask } = recognizeConnection(path);
    if (startTask && endTask) {
      createDependency(startTask.id, endTask.id);
    }
    
    setPath("");
  };
  
  // 获取SVG坐标点
  const getSVGPoint = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  
  return (
    <svg 
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
    >
      {isDrawing && (
        <path 
          d={path} 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="2" 
          strokeDasharray="5,5" 
        />
      )}
    </svg>
  );
};

// 手绘识别算法
const recognizeConnection = (path) => {
  // 简化路径 (Ramer-Douglas-Peucker算法)
  const simplified = simplifyPath(path, 5);
  
  // 获取起点和终点
  const startPoint = getPointAt(simplified, 0);
  const endPoint = getPointAt(simplified, 1);
  
  // 查找最近的任务
  const startTask = findNearestTask(startPoint);
  const endTask = findNearestTask(endPoint);
  
  return { startTask, endTask };
};
```

## 三、性能优化策略

### 1. 虚拟化渲染

```other
// 使用react-window进行任务虚拟化
import { FixedSizeList as List } from 'react-window';

const VirtualizedCanvas = ({ tasks }) => {
  const rowHeight = 100; // 预估任务高度
  
  const Row = ({ index, style }) => {
    const task = tasks[index];
    return (
      <div style={style}>
        <TaskNode task={task} />
      </div>
    );
  };
  
  return (
    <List
      height={window.innerHeight}
      width={window.innerWidth}
      itemCount={tasks.length}
      itemSize={rowHeight}
    >
      {Row}
    </List>
  );
};
```

### 2. 分层渲染

```other
const CanvasLayers = () => (
  <svg className="absolute inset-0">
    {/* 背景层 */}
    <g className="background-layer">
      <Grid />
      <Watermark />
    </g>
    
    {/* 静态内容层 */}
    <g className="static-layer">
      <Milestones />
      <TimelineMarkers />
    </g>
    
    {/* 动态连接层 */}
    <g className="links-layer">
      {links.map(link => <LinkLine key={link.id} {...link} />)}
    </g>
    
    {/* 交互层 */}
    <g className="tasks-layer">
      {tasks.map(task => <TaskNode key={task.id} task={task} />)}
    </g>
    
    {/* 临时绘制层 */}
    <g className="drawing-layer">
      <FreehandDrawer />
      <SelectionBox />
    </g>
  </svg>
);
```

### 3. Web Workers 处理复杂计算

```javascript
// worker.js
self.addEventListener('message', (e) => {
  const { type, payload } = e.data;
  
  switch(type) {
    case 'SIMPLIFY_PATH':
      const simplified = simplifyPath(payload.path, payload.tolerance);
      self.postMessage({ type: 'PATH_SIMPLIFIED', payload: simplified });
      break;
      
    case 'CALCULATE_DEPENDENCIES':
      const criticalPath = calculateCriticalPath(payload.tasks);
      self.postMessage({ type: 'DEPENDENCIES_CALCULATED', payload: criticalPath });
      break;
  }
});

// 主线程使用
const worker = new Worker('./worker.js');

// 路径简化
worker.postMessage({
  type: 'SIMPLIFY_PATH',
  payload: { path: rawPath, tolerance: 5 }
});

worker.onmessage = (e) => {
  if (e.data.type === 'PATH_SIMPLIFIED') {
    setSimplifiedPath(e.data.payload);
  }
};
```

## 四、开发里程碑

```other
gantt
    title Phase1 开发计划 (SVG/HTML版)
    dateFormat  YYYY-MM-DD
    section 核心框架
    画布基础架构       ：2024-08-01, 20d
    任务节点系统       ：2024-08-21, 15d
    结构化引擎        ：2024-09-05, 25d
    
    section 关键功能
    手绘识别         ：2024-08-25, 15d
    多视图切换       ：2024-09-10, 15d
    实时协作基础      ：2024-09-20, 10d
    
    section 优化测试
    性能优化         ：2024-09-25, 15d
    用户测试         ：2024-10-05, 10d
```

## 五、风险控制

| **风险**  | **解决方案**      | **监控指标**                |
| ------- | ------------- | ----------------------- |
| SVG性能瓶颈 | 虚拟化渲染 + 分层更新  | 任务数 > 500时FPS ≥ 30      |
| 复杂手势冲突  | 事件优先级管理 + 手势锁 | 手势冲突率 < 5%              |
| 跨浏览器兼容  | 渐进增强 + 特性检测   | 支持Chrome/Firefox/Safari |
| 内存泄漏    | 严格内存管理 + 性能监控 | 内存增长 < 10MB/小时          |

## 六、交付物指标

| **模块** | **测试标准**    | **目标值** |
| ------ | ----------- | ------- |
| 画布渲染   | 500节点下滚动FPS | ≥ 45    |
| 手绘识别   | 箭头识别准确率     | ≥ 92%   |
| 协作延迟   | 操作同步延迟      | ≤ 300ms |
| 内存占用   | 100节点项目     | ≤ 150MB |

## 七、最佳实践建议

1. **SVG性能优化**
    - 使用`<g>`元素分组相似对象
    - 避免频繁操作DOM，使用`requestAnimationFrame`批量更新
    - 对静态元素使用`pointer-events="none"`
1. **状态管理**

```javascript
// 使用Zustand状态管理
const useTaskStore = create((set) => ({
  tasks: [],
  addTask: (task) => set(state => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set(state => ({
    tasks: state.tasks.map(t => t.id === id ? {...t, ...updates} : t)
  })),
  // 结构化操作
  moveToParent: (childId, parentId) => set(state => {
    // 实现父级变更逻辑
  }),
}));
```

1. **响应式设计**

```css
/* Tailwind配置 */
@media (min-width: 768px) {
  .task-card {
    width: 320px;
  }
}
@media (max-width: 767px) {
  .task-card {
    width: 100%;
    max-width: 100%;
  }
}
```

> **实施建议**：

1. > 优先实现基础画布和任务节点系统
2. > 添加手绘识别功能前确保基础交互稳定
3. > 性能优化贯穿整个开发周期
4. > 使用Storybook组件驱动开发

需要完整的组件代码示例、测试用例或部署方案，请随时告知！
// 测试垂直布局导入导出功能的脚本
const testData = {
  tasks: [
    {
      id: 1,
      title: "中心任务",
      position: { x: 100, y: 100 },
      links: [],
      lock: true,
      parentId: null,
      level: 0,
      type: 'center',
      date: new Date().toISOString(),
      collapsed: false,
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
      shape: 'roundRect'
    },
    {
      id: 2,
      title: "主线任务1",
      position: { x: 100, y: 300 }, // 垂直布局：x相同，y递增
      links: [
        {
          toId: 1,
          fromAnchor: { x: 90, y: 0 }, // 上中
          toAnchor: { x: 90, y: 72 },  // 下中
          label: '依赖关系',
          lineStyle: 'dashed',
          arrowStyle: 'triangle',
          lineWidth: 3,
          color: '#ff6b6b'
        }
      ],
      lock: false,
      parentId: 1,
      level: 1,
      type: 'main',
      date: new Date().toISOString(),
      collapsed: false,
      fillColor: '#F15A4A',
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
      shape: 'roundRect'
    },
    {
      id: 3,
      title: "主线任务2",
      position: { x: 100, y: 500 }, // 垂直布局：x相同，y递增
      links: [
        {
          toId: 2,
          fromAnchor: { x: 90, y: 0 }, // 上中
          toAnchor: { x: 90, y: 72 },  // 下中
          label: '依赖关系',
          lineStyle: 'solid',
          arrowStyle: 'normal',
          lineWidth: 2,
          color: '#4ecdc4'
        }
      ],
      lock: false,
      parentId: 1,
      level: 1,
      type: 'main',
      date: new Date().toISOString(),
      collapsed: false,
      fillColor: '#5DBA4A',
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
      shape: 'roundRect'
    },
    {
      id: 4,
      title: "子任务1",
      position: { x: 400, y: 300 }, // 垂直布局：子任务在主线任务右侧
      links: [
        {
          toId: 2,
          fromAnchor: { x: 0, y: 36 },  // 左中
          toAnchor: { x: 180, y: 36 },  // 右中
          label: '子任务',
          lineStyle: 'solid',
          arrowStyle: 'normal',
          lineWidth: 2,
          color: '#4ecdc4'
        }
      ],
      lock: false,
      parentId: 2,
      level: 2,
      type: 'sub',
      date: new Date().toISOString(),
      collapsed: false,
      fillColor: '#F6C244',
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
      shape: 'roundRect'
    }
  ],
  mainDirection: 'vertical', // 垂直布局
  canvasProps: {
    mainDirection: 'vertical',
    backgroundColor: '#ebebeb',
    showGrid: true
  },
  timeScale: 'week'
};

// 模拟默认连线样式
const defaultLinkStyle = {
  lineStyle: 'solid',
  arrowStyle: 'normal',
  lineWidth: 2,
  color: '#86868b'
};

// 模拟导出
console.log('导出数据格式（垂直布局）:');
console.log(JSON.stringify(testData, null, 2));

// 模拟导入处理
function processImportData(importedData) {
  let tasks, mainDirection, canvasProps, timeScale;
  
  if (Array.isArray(importedData)) {
    // 旧格式：直接是任务数组
    tasks = importedData;
    mainDirection = 'horizontal';
    canvasProps = {};
    timeScale = 'month';
  } else if (importedData.tasks && Array.isArray(importedData.tasks)) {
    // 新格式：包含任务、布局信息和时间颗粒度
    tasks = importedData.tasks;
    mainDirection = importedData.mainDirection || 'horizontal';
    canvasProps = importedData.canvasProps || {};
    timeScale = importedData.timeScale || 'month';
  } else {
    throw new Error('文件格式不正确');
  }

  // 确保所有任务都有完整的位置和连线信息
  const processedTasks = tasks.map(task => {
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
      position: task.position || { x: 100, y: 100 },
      links: processedLinks,
      collapsed: task.collapsed || false,
      importantLevel: task.importantLevel || 'normal',
      fillColor: task.fillColor || '#f8f8fa',
      borderColor: task.borderColor || '#e0e0e5',
      borderWidth: task.borderWidth || 1.5,
      borderStyle: task.borderStyle || 'solid',
      fontFamily: task.fontFamily || '-apple-system, BlinkMacSystemFont, Segoe UI, Microsoft YaHei, Arial, sans-serif',
      fontSize: task.fontSize || 16,
      fontWeight: task.fontWeight || '500',
      fontStyle: task.fontStyle || 'normal',
      textDecoration: task.textDecoration || 'none',
      color: task.color || '#222222',
      textAlign: task.textAlign || 'center',
      shape: task.shape || 'roundRect',
    };
  });

  return {
    tasks: processedTasks,
    mainDirection,
    canvasProps,
    timeScale
  };
}

// 验证垂直布局的合理性
function validateVerticalLayout(tasks, mainDirection) {
  if (mainDirection !== 'vertical') return true;
  
  console.log('\n验证垂直布局合理性:');
  
  // 检查主线任务是否垂直排列
  const mainTasks = tasks.filter(t => t.parentId === null && t.id !== 1); // 排除中心任务
  const centerTask = tasks.find(t => t.id === 1);
  
  if (mainTasks.length > 0) {
    console.log('主线任务垂直排列检查:');
    mainTasks.forEach((task, index) => {
      if (index > 0) {
        const prevTask = mainTasks[index - 1];
        if (task.position.x !== prevTask.position.x) {
          console.log(`❌ 主线任务 ${prevTask.title} 和 ${task.title} 的x坐标不一致: ${prevTask.position.x} vs ${task.position.x}`);
        } else {
          console.log(`✅ 主线任务 ${prevTask.title} 和 ${task.title} 的x坐标一致: ${task.position.x}`);
        }
        if (task.position.y <= prevTask.position.y) {
          console.log(`❌ 主线任务 ${prevTask.title} 和 ${task.title} 的y坐标不是递增的: ${prevTask.position.y} vs ${task.position.y}`);
        } else {
          console.log(`✅ 主线任务 ${prevTask.title} 和 ${task.title} 的y坐标递增: ${prevTask.position.y} -> ${task.position.y}`);
        }
      }
    });
  }
  
  // 检查子任务是否在主线任务右侧
  const subTasks = tasks.filter(t => t.parentId !== null && t.level === 2);
  subTasks.forEach(task => {
    const parentTask = tasks.find(t => t.id === task.parentId);
    if (parentTask) {
      if (task.position.x <= parentTask.position.x) {
        console.log(`❌ 子任务 ${task.title} 不在主线任务 ${parentTask.title} 右侧: ${task.position.x} <= ${parentTask.position.x}`);
      } else {
        console.log(`✅ 子任务 ${task.title} 在主线任务 ${parentTask.title} 右侧: ${parentTask.position.x} -> ${task.position.x}`);
      }
      if (task.position.y !== parentTask.position.y) {
        console.log(`❌ 子任务 ${task.title} 与主线任务 ${parentTask.title} 的y坐标不一致: ${parentTask.position.y} vs ${task.position.y}`);
      } else {
        console.log(`✅ 子任务 ${task.title} 与主线任务 ${parentTask.title} 的y坐标一致: ${task.position.y}`);
      }
    }
  });
  
  return true;
}

// 测试导入处理
console.log('\n导入处理结果:');
try {
  const result = processImportData(testData);
  console.log('处理成功！');
  console.log('任务数量:', result.tasks.length);
  console.log('布局方向:', result.mainDirection);
  console.log('时间颗粒度:', result.timeScale);
  
  // 验证垂直布局
  validateVerticalLayout(result.tasks, result.mainDirection);
  
  // 验证连线属性
  console.log('\n连线属性验证（垂直布局）:');
  result.tasks.forEach(task => {
    if (task.links && task.links.length > 0) {
      console.log(`\n${task.title} 的连线:`);
      task.links.forEach((link, index) => {
        console.log(`  连线 ${index + 1}:`);
        console.log(`    目标任务ID: ${link.toId}`);
        console.log(`    标签: "${link.label}"`);
        console.log(`    线形: ${link.lineStyle}`);
        console.log(`    箭头: ${link.arrowStyle}`);
        console.log(`    线宽: ${link.lineWidth}`);
        console.log(`    颜色: ${link.color}`);
        console.log(`    起始锚点: ${link.fromAnchor ? `(${link.fromAnchor.x}, ${link.fromAnchor.y})` : 'null'}`);
        console.log(`    目标锚点: ${link.toAnchor ? `(${link.toAnchor.x}, ${link.toAnchor.y})` : 'null'}`);
      });
    }
  });
  
  // 验证垂直布局的锚点是否正确
  const task2 = result.tasks.find(t => t.id === 2);
  if (task2 && task2.links.length > 0) {
    const link = task2.links[0];
    // 垂直布局下，主线任务之间的连线应该是上下锚点
    if (link.fromAnchor && link.fromAnchor.x === 90 && link.fromAnchor.y === 0) {
      console.log('\n✅ 垂直布局主线任务连线锚点正确（上中）');
    } else {
      console.log('\n❌ 垂直布局主线任务连线锚点错误');
    }
  }
  
  // 验证子任务的锚点
  const task4 = result.tasks.find(t => t.id === 4);
  if (task4 && task4.links.length > 0) {
    const link = task4.links[0];
    // 垂直布局下，子任务应该在主线任务右侧，连线应该是左右锚点
    if (link.fromAnchor && link.fromAnchor.x === 0 && link.fromAnchor.y === 36) {
      console.log('\n✅ 垂直布局子任务连线锚点正确（左中）');
    } else {
      console.log('\n❌ 垂直布局子任务连线锚点错误');
    }
  }
  
} catch (error) {
  console.error('处理失败:', error.message);
}

console.log('\n测试完成！');

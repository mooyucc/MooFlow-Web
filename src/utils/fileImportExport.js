/** 生成带时间戳的安全导出文件名 */
export function buildExportFileName(baseName, extension) {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
  const safeFileName = (baseName || 'tasks').replace(/[^\u4e00-\u9fa5\w-]/g, '');
  return `${safeFileName}-${dateStr}.${extension}`;
}

export function buildExportPayload(file, canvasProps, timeScale) {
  return {
    tasks: file?.tasks ?? [],
    mainDirection: file?.mainDirection || 'horizontal',
    canvasProps: canvasProps ?? {},
    timeScale: timeScale || 'month',
  };
}

export function serializeExportPayload(exportData) {
  return JSON.stringify(exportData, null, 2);
}

export async function downloadJsonExport(exportData, fileName) {
  const dataStr = serializeExportPayload(exportData);

  if (window.electronAPI?.exportFile) {
    const base64 = btoa(unescape(encodeURIComponent(dataStr)));
    const result = await window.electronAPI.exportFile(base64, fileName);
    if (result && !result.canceled) {
      alert('导出成功！');
    } else {
      alert('导出已取消');
    }
    return;
  }

  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsvExport(tasks, fileName) {
  if (!tasks?.length) {
    alert('没有可导出的任务');
    return false;
  }

  const csvRows = [
    '任务内容,完成时间,重要程度',
    ...tasks.map((task) => {
      let dateStr = '';
      if (task.date) {
        const d = new Date(task.date);
        if (!Number.isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = (d.getMonth() + 1).toString().padStart(2, '0');
          const day = d.getDate().toString().padStart(2, '0');
          dateStr = `${y}/${m}/${day}`;
        }
      }

      let level = task.importantLevel;
      if (level === 'important') level = '重要';
      else if (level === 'secondary') level = '次要';
      else level = '一般';

      return `${JSON.stringify(task.title ?? '')},${dateStr},${level}`;
    }),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

/** 解析导入 JSON，兼容旧版纯任务数组格式 */
export function parseImportedProject(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('文件格式不正确');
  }

  if (Array.isArray(parsed)) {
    return {
      tasks: parsed,
      mainDirection: 'horizontal',
      canvasProps: {},
      timeScale: 'month',
    };
  }

  if (parsed?.tasks && Array.isArray(parsed.tasks)) {
    return {
      tasks: parsed.tasks,
      mainDirection: parsed.mainDirection || 'horizontal',
      canvasProps: parsed.canvasProps || {},
      timeScale: parsed.timeScale || 'month',
    };
  }

  throw new Error('文件格式不正确');
}

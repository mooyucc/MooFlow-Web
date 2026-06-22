import { useTaskStore } from '../store/taskStore';
import { ANCHORS, NODE_WIDTH, NODE_HEIGHT } from '../constants/nodeLayout';

/**
 * 按布局方向自动排列任务，并更新连线锚点与画布视口。
 * @param {string} mainDirection - 'horizontal' | 'vertical'
 * @param {(transform: { scale: number, offsetX: number, offsetY: number }) => void} setTransform
 */
export function autoArrangeTasks(mainDirection, setTransform) {
  const { tasks: allTasks, updateTask, addLink } = useTaskStore.getState();
  const direction = mainDirection || 'horizontal';

  const startX = 100;
  const startY = 200;
  const branchGapH = 300;
  const childGapH = 180;
  const fineGapH = 180;
  const branchGapV = 180;
  const childGapV = 300;
  const fineGapV = 300;

  const centerTask = allTasks[0];
  if (!centerTask) return;

  const branchTasks = allTasks.filter(t => t.parentId === centerTask.id);
  const newPositions = new Map();
  newPositions.set(centerTask.id, { x: startX, y: startY });

  if (direction === 'vertical') {
    branchTasks.forEach((branchTask, i) => {
      const branchX = startX;
      const branchY = startY + (i + 1) * branchGapV;
      newPositions.set(branchTask.id, { x: branchX, y: branchY });

      const children = allTasks.filter(t => t.parentId === branchTask.id);
      children.forEach((child, j) => {
        const childX = branchX + (j + 1) * childGapV;
        const childY = branchY;
        newPositions.set(child.id, { x: childX, y: childY });

        const fineTasks = allTasks.filter(t => t.parentId === child.id);
        fineTasks.forEach((fine, k) => {
          newPositions.set(fine.id, {
            x: childX + (k + 1) * fineGapV,
            y: childY,
          });
        });
      });
    });
  } else {
    branchTasks.forEach((branchTask, i) => {
      const branchX = startX + (i + 1) * branchGapH;
      const branchY = startY;
      newPositions.set(branchTask.id, { x: branchX, y: branchY });

      const children = allTasks.filter(t => t.parentId === branchTask.id);
      children.forEach((child, j) => {
        const childX = branchX;
        const childY = branchY + (j + 1) * childGapH;
        newPositions.set(child.id, { x: childX, y: childY });

        const fineTasks = allTasks.filter(t => t.parentId === child.id);
        fineTasks.forEach((fine, k) => {
          newPositions.set(fine.id, {
            x: childX,
            y: childY + (k + 1) * fineGapH,
          });
        });
      });
    });
  }

  newPositions.forEach((position, taskId) => {
    updateTask(taskId, { position }, false);
  });

  const tasksNow = useTaskStore.getState().tasks;

  tasksNow.forEach(fromTask => {
    (fromTask.links || []).forEach(link => {
      const toTask = tasksNow.find(t => t.id === link.toId);
      if (!toTask) return;

      const fromCenter = {
        x: fromTask.position.x + NODE_WIDTH / 2,
        y: fromTask.position.y + NODE_HEIGHT / 2,
      };
      const toCenter = {
        x: toTask.position.x + NODE_WIDTH / 2,
        y: toTask.position.y + NODE_HEIGHT / 2,
      };
      const dx = toCenter.x - fromCenter.x;
      const dy = toCenter.y - fromCenter.y;
      let fromAnchor;
      let toAnchor;
      if (Math.abs(dx) > Math.abs(dy)) {
        fromAnchor = ANCHORS.RightAnchor;
        toAnchor = ANCHORS.LeftAnchor;
      } else {
        fromAnchor = dy > 0 ? ANCHORS.DownAnchor : ANCHORS.UpAnchor;
        toAnchor = dy > 0 ? ANCHORS.UpAnchor : ANCHORS.DownAnchor;
      }
      addLink(fromTask.id, link.toId, fromAnchor, toAnchor, link.label);
    });
  });

  if (typeof setTransform === 'function') {
    setTransform({
      scale: 1,
      offsetX: window.innerWidth / 4 - centerTask.position.x,
      offsetY: window.innerHeight / 2 - centerTask.position.y - NODE_HEIGHT / 2,
    });
  }
}

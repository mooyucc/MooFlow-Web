export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 72;
/** 卡片垂直避让间距（findAvailablePosition） */
export const NODE_PADDING_Y = 68;
/** 同级任务默认水平间距 */
export const NODE_H_GAP = 300;
/** 同级任务默认垂直间距 */
export const NODE_V_GAP = 180;

export const ANCHORS = {
  UpAnchor: { x: NODE_WIDTH / 2, y: 0 },
  DownAnchor: { x: NODE_WIDTH / 2, y: NODE_HEIGHT },
  LeftAnchor: { x: 0, y: NODE_HEIGHT / 2 },
  RightAnchor: { x: NODE_WIDTH, y: NODE_HEIGHT / 2 },
};

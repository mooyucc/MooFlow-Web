/** 画布运行时桥接，供 TaskNode 等深层组件访问画布提供的函数（吸附、日期级联等） */
const bridge = {
  getSnappedPosition: null,
  cascadeUpdateDates: null,
};

export function registerCanvasBridge(partial) {
  Object.assign(bridge, partial);
}

export function getCanvasBridge() {
  return bridge;
}

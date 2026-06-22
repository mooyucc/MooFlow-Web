import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { NODE_WIDTH, NODE_HEIGHT } from '../../constants/nodeLayout';

export function useFlowViewport() {
  const { getViewport, setViewport, fitView, zoomTo } = useReactFlow();

  const handleSetScale = useCallback((newScale) => {
    const vp = getViewport();
    zoomTo(newScale, { duration: 0 });
    setViewport({ x: vp.x, y: vp.y, zoom: newScale });
  }, [getViewport, setViewport, zoomTo]);

  const handleFitView = useCallback((tasks) => {
    if (!tasks?.length) {
      setViewport({ x: window.innerWidth / 2, y: window.innerHeight / 2, zoom: 1 });
      return;
    }
    fitView({ padding: 0.12, maxZoom: 2, duration: 200 });
  }, [fitView, setViewport]);

  const setViewportFromTransform = useCallback((transform) => {
    setViewport({
      zoom: transform.scale,
      x: transform.offsetX,
      y: transform.offsetY,
    });
  }, [setViewport]);

  return {
    getViewport,
    setViewport,
    fitView,
    handleSetScale,
    handleFitView,
    setViewportFromTransform,
  };
}

export function getFlowViewBox(viewport) {
  const { x, y, zoom } = viewport;
  return {
    x: -x / zoom,
    y: -y / zoom,
    width: window.innerWidth / zoom,
    height: window.innerHeight / zoom,
  };
}

export { NODE_WIDTH, NODE_HEIGHT };

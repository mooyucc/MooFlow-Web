import { useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useTaskStore } from '../../store/taskStore';

/** 批量对齐网格后，强制 React Flow 同步节点位置 */
export default function FlowNodesLayoutSync({ nodes }) {
  const layoutVersion = useTaskStore(state => state.layoutVersion);
  const { setNodes } = useReactFlow();
  const lastSyncedVersion = useRef(0);

  useEffect(() => {
    if (layoutVersion === 0 || layoutVersion === lastSyncedVersion.current) return;
    lastSyncedVersion.current = layoutVersion;
    setNodes(nodes);
  }, [layoutVersion, nodes, setNodes]);

  return null;
}

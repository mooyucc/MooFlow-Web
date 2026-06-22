import { useEffect } from 'react';
import { registerBeforeUnloadGuard } from '../utils/filePersistence';

/** 在画布会话期间注册关闭/刷新前的保存提示 */
export function useBeforeUnloadSaveGuard(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    return registerBeforeUnloadGuard();
  }, [enabled]);
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isNewFileTabRequest,
  isOpenFileTabRequest,
  isLaunchTabRequest,
  openNewFileTab,
  openImportFileTab,
  consumeNewFileTabParam,
  stashPendingFileOpen,
  consumePendingFileOpen,
  purgeAbandonedPendingFileOpens,
} from './newFileTab';

describe('newFileTab', () => {
  beforeEach(() => {
    window.location = { href: 'https://example.com/MooFlowPages/?foo=1', search: '?foo=1', pathname: '/MooFlowPages/' };
    window.open = vi.fn();
    window.history.replaceState = vi.fn();
    delete window.electronAPI;
    localStorage.clear();
  });

  it('isNewFileTabRequest 识别 ?new=1', () => {
    window.location.search = '?new=1';
    expect(isNewFileTabRequest()).toBe(true);
  });

  it('isOpenFileTabRequest 识别 ?open=…', () => {
    window.location.search = '?open=123';
    expect(isOpenFileTabRequest()).toBe(true);
    expect(isLaunchTabRequest()).toBe(true);
  });

  it('openNewFileTab 打开带 new=1 的新标签页', () => {
    openNewFileTab();
    expect(window.open).toHaveBeenCalledWith(
      'https://example.com/MooFlowPages/?foo=1&new=1',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('openImportFileTab 打开带 open= 的新标签页', () => {
    openImportFileTab('999');
    expect(window.open).toHaveBeenCalledWith(
      'https://example.com/MooFlowPages/?foo=1&open=999',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('stashPendingFileOpen 可跨标签读取', () => {
    const id = stashPendingFileOpen({ raw: '{"tasks":[]}', fileName: 'demo.json' });
    expect(consumePendingFileOpen(id)).toEqual({
      raw: '{"tasks":[]}',
      fileName: 'demo.json',
      hasLinkedHandle: false,
    });
    expect(consumePendingFileOpen(id)).toBeNull();
  });

  it('purgeAbandonedPendingFileOpens 清除未消费的暂存', () => {
    localStorage.setItem('moo_pending_open_100', JSON.stringify({ raw: 'a', fileName: 'a.json' }));
    localStorage.setItem('moo_pending_open_200', JSON.stringify({ raw: 'b', fileName: 'b.json' }));
    purgeAbandonedPendingFileOpens('200');
    expect(localStorage.getItem('moo_pending_open_100')).toBeNull();
    expect(localStorage.getItem('moo_pending_open_200')).not.toBeNull();
    purgeAbandonedPendingFileOpens();
    expect(localStorage.getItem('moo_pending_open_200')).toBeNull();
  });

  it('openNewFileTab 在 Electron 环境返回 false', () => {
    window.electronAPI = {};
    expect(openNewFileTab()).toBe(false);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('consumeNewFileTabParam 清除 URL 参数', () => {
    window.location = {
      href: 'https://example.com/MooFlowPages/?new=1',
      search: '?new=1',
      pathname: '/MooFlowPages/',
    };
    consumeNewFileTabParam();
    expect(window.history.replaceState).toHaveBeenCalled();
  });
});

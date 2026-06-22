import { describe, it, expect, beforeEach } from 'vitest';
import {
  storageKeyForFile,
  basenameFromHandle,
  persistLinkedFilePath,
  restoreLinkedFilePath,
  clearLinkedFilePath,
  LINKED_FILE_PATH_KEY,
} from './localFileHandle';

describe('storageKeyForFile', () => {
  it('将 fileId 转为字符串键', () => {
    expect(storageKeyForFile(123)).toBe('123');
    expect(storageKeyForFile(null)).toBe('default');
  });
});

describe('basenameFromHandle', () => {
  it('去掉 .json 扩展名', () => {
    expect(basenameFromHandle({ name: 'MF001234.json' })).toBe('MF001234');
  });

  it('无扩展名时返回原名', () => {
    expect(basenameFromHandle({ name: 'MF001234' })).toBe('MF001234');
  });
});

describe('linked file path session storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('persist 与 restore 按 fileId 匹配', () => {
    persistLinkedFilePath(9, '/tmp/demo.json');
    expect(restoreLinkedFilePath(9)).toBe('/tmp/demo.json');
    expect(restoreLinkedFilePath(10)).toBeNull();
  });

  it('clearLinkedFilePath 移除路径', () => {
    persistLinkedFilePath(9, '/tmp/demo.json');
    clearLinkedFilePath();
    expect(sessionStorage.getItem(LINKED_FILE_PATH_KEY)).toBeNull();
  });
});

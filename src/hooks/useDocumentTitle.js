import { useEffect } from 'react';
import { useFileStore } from '../store/fileStore';

const APP_TITLE = 'MooFlow';

export function useDocumentTitle() {
  const fileName = useFileStore((state) => {
    const file = state.files.find((f) => f.id === state.activeFileId);
    return file?.name;
  });

  useEffect(() => {
    document.title = fileName ? `${APP_TITLE} - ${fileName}` : APP_TITLE;
  }, [fileName]);
}

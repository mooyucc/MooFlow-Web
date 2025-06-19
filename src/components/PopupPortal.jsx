import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const PopupPortal = ({ children, onClickOutside }) => {
  const modalRoot = document.getElementById('modal-root');
  const elRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (elRef.current && !elRef.current.contains(e.target)) {
        onClickOutside?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClickOutside]);

  if (!modalRoot) return null;

  return createPortal(
    <div ref={elRef} style={{ position: 'fixed', zIndex: 10000 }}>
      {children}
    </div>,
    modalRoot
  );
};

export default PopupPortal; 
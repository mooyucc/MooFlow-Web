import React, { Suspense, lazy } from 'react';
import { useTranslation } from '../LanguageContext';

const MooFlowReactFlow = lazy(() => import('../canvas/flow/MooFlowReactFlow'));

const CanvasFallback = () => {
  const [t] = useTranslation();
  return (
    <div className="canvas-loading" role="status" aria-live="polite">
      <div className="canvas-loading-spinner" aria-hidden="true" />
      <span>{t('canvas_loading')}</span>
    </div>
  );
};

export default function CanvasRouter() {
  return (
    <Suspense fallback={<CanvasFallback />}>
      <MooFlowReactFlow />
    </Suspense>
  );
}

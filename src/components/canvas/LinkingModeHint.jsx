import React from 'react';
import { useTranslation } from '../../LanguageContext';

const LinkingModeHint = ({ linking, fromTask }) => {
  const [t] = useTranslation();
  if (!linking) return null;

  return (
    <div className="linking-hint" role="status" aria-live="polite">
      {fromTask ? t('linking_hint_target') : t('linking_hint_start')}
    </div>
  );
};

export default LinkingModeHint;

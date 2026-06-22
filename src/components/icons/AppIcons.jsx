/**
 * Unified toolbar icons — Lucide set via react-icons.
 * Standard: 24×24 viewBox, strokeWidth 1.75, currentColor.
 */
import React from 'react';
import {
  LuUndo2,
  LuRedo2,
  LuCirclePlus,
  LuMinus,
  LuPlus,
  LuChevronDown,
  LuScan,
  LuRefreshCw,
  LuLayoutGrid,
  LuRoute,
  LuSun,
  LuMoon,
  LuLanguages,
  LuPanelLeft,
  LuFilePlus,
  LuFolderOpen,
  LuSave,
  LuFileSpreadsheet,
  LuFileDown,
  LuFileUp,
  LuX,
  LuCalendar,
  LuSquarePlus,
  LuCopy,
  LuScissors,
  LuClipboardPaste,
  LuArrowRight,
} from 'react-icons/lu';

const ICON = 18;
const STROKE = 1.75;

const iconProps = (size = ICON) => ({
  size,
  strokeWidth: STROKE,
  'aria-hidden': true,
});

export const UndoIcon = (p) => <LuUndo2 {...iconProps()} {...p} />;
export const RedoIcon = (p) => <LuRedo2 {...iconProps()} {...p} />;
export const AddIcon = (p) => <LuCirclePlus {...iconProps()} {...p} />;
export const MinusIcon = (p) => <LuMinus {...iconProps()} {...p} />;
export const PlusIcon = (p) => <LuPlus {...iconProps()} {...p} />;
export const ArrowIcon = (p) => <LuChevronDown {...iconProps(14)} {...p} />;
export const FitIcon = (p) => <LuScan {...iconProps()} {...p} />;
export const RefreshIcon = (p) => <LuRefreshCw {...iconProps()} {...p} />;
export const CollapseAllIcon = (p) => <LuLayoutGrid {...iconProps()} {...p} />;
export const CriticalPathIcon = (p) => <LuRoute {...iconProps()} {...p} />;
export const LightModeIcon = (p) => <LuSun {...iconProps()} {...p} />;
export const DarkModeIcon = (p) => <LuMoon {...iconProps()} {...p} />;
export const LangIcon = (p) => <LuLanguages {...iconProps()} {...p} />;
export const FormatPanelIcon = (p) => <LuPanelLeft {...iconProps(20)} {...p} />;
export const NewFileIcon = (p) => <LuFilePlus {...iconProps()} {...p} />;
export const OpenFileIcon = (p) => <LuFolderOpen {...iconProps()} {...p} />;
export const SaveFileIcon = (p) => <LuSave {...iconProps()} {...p} />;
export const ExportCsvIcon = (p) => <LuFileSpreadsheet {...iconProps()} {...p} />;
export const ExportIcon = (p) => <LuFileDown {...iconProps()} {...p} />;
export const ImportIcon = (p) => <LuFileUp {...iconProps()} {...p} />;
export const CloseIcon = (p) => <LuX {...iconProps(14)} {...p} />;
export const CalendarIcon = ({ size = 16, ...p }) => (
  <LuCalendar size={size} strokeWidth={STROKE} aria-hidden {...p} />
);
export const EmptySelectionIcon = (p) => <LuSquarePlus {...iconProps(20)} {...p} />;
export const CopyIcon = (p) => <LuCopy {...iconProps(16)} {...p} />;
export const CutIcon = (p) => <LuScissors {...iconProps(16)} {...p} />;
export const PasteIcon = (p) => <LuClipboardPaste {...iconProps(16)} {...p} />;
export const ArrowRightIcon = (p) => <LuArrowRight {...iconProps(18)} {...p} />;

import { createContext, useContext } from 'react';

export const FlowInteractionContext = createContext({
  onEditingChange: () => {},
  onAnchorMouseDown: null,
  onAnchorMouseEnter: null,
  onAnchorMouseLeave: null,
  clientToFlowPoint: null,
  onSelectLink: null,
  onDeleteLink: null,
  onUpdateLink: null,
  onUpdateLinkLabel: null,
});

export function useFlowInteraction() {
  return useContext(FlowInteractionContext);
}

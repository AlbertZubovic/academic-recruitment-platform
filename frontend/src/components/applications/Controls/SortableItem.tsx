/**
 * SortableItem.tsx
 *
 * A reusable wrapper component that enables drag and drop functionality
 * for its children using @dnd-kit.
 *
 * Key Responsibilities:
 * Handles sortable logic with useSortable from `@dnd-kit/sortable`
 * Applies transform and transition styles during drag
 * Forwards drag listeners and attributes to children via props
 */

import React from "react";
import { Box } from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  children: (dragHandleProps: React.HTMLAttributes<HTMLElement> & {
    [key: string]: unknown;
  }) => React.ReactNode;
  isDragDisabled?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  isDragDisabled = false,
}) => {
  // Hook to make this component sortable in a DnD context
  const {
    attributes,      // props for accessibility and identification
    listeners,       // props for drag event handling
    setNodeRef,      // ref to attach to the drag DOM node
    transform,       // positional transform during drag
    transition,      // animation style for movement
    isDragging,      // boolean indicating if this item is currently dragging
  } = useSortable({ id });

  // Dynamic style applied while dragging
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : "auto", // Bring dragged item to front
  };

  return (
    <Box
      ref={setNodeRef}       // Hook ref so DnD-kit can track this DOM node
      style={style}          // Apply drag-related transformations
      width="100%"
      pointerEvents="auto"
    >
      {/* Pass in drag handle props only if drag isn't disabled */}
      {children(isDragDisabled ? {} : { ...attributes, ...listeners })}
    </Box>
  );
};

export default SortableItem;

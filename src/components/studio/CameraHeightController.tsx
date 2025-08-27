'use client';

import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';

interface CameraHeightControllerProps {
  enabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
  sensitivity?: number;
  onModelHeightChange?: (height: number) => void;
}

const CameraHeightController: React.FC<CameraHeightControllerProps> = ({
  enabled = true,
  minHeight = -2,
  maxHeight = 2,
  sensitivity = 0.005,
  onModelHeightChange
}) => {
  const { gl } = useThree();
  const isRightMouseDown = useRef(false);
  const lastMouseY = useRef(0);
  const initialModelY = useRef(0.2);
  const currentModelHeight = useRef(0.2);

  useEffect(() => {
    if (!enabled) return;

    const domElement = gl.domElement;

    const handleMouseDown = (event: MouseEvent) => {
      // Check for right mouse button (button 2)
      if (event.button === 2) {
        event.preventDefault();
        isRightMouseDown.current = true;
        lastMouseY.current = event.clientY;
        
        // Store initial model height
        initialModelY.current = currentModelHeight.current;
        
        // Change cursor to indicate vertical resize
        domElement.style.cursor = 'ns-resize';
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isRightMouseDown.current) return;

      event.preventDefault();
      
      // Calculate vertical movement
      const deltaY = event.clientY - lastMouseY.current;
      
      // Apply movement to height (invert deltaY so moving mouse up raises model)
      const heightDelta = -deltaY * sensitivity;
      
      // Calculate new model height
      const newHeight = initialModelY.current + heightDelta;
      
      // Clamp to min/max height
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      // Update current height
      currentModelHeight.current = clampedHeight;
      
      // Notify parent component of height change
      onModelHeightChange?.(clampedHeight);
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        event.preventDefault();
        isRightMouseDown.current = false;
        
        // Reset cursor
        domElement.style.cursor = '';
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      // Prevent right-click context menu when our control is active
      if (isRightMouseDown.current) {
        event.preventDefault();
      }
    };

    // Add event listeners
    domElement.addEventListener('mousedown', handleMouseDown);
    domElement.addEventListener('mousemove', handleMouseMove);
    domElement.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      domElement.removeEventListener('mousedown', handleMouseDown);
      domElement.removeEventListener('mousemove', handleMouseMove);
      domElement.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('contextmenu', handleContextMenu);
      
      // Reset cursor on cleanup
      domElement.style.cursor = '';
    };
  }, [enabled, gl.domElement, minHeight, maxHeight, sensitivity, onModelHeightChange]);

  return null; // This component doesn't render anything
};

export default CameraHeightController;

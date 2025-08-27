'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface DraggableLogoProps {
  url: string;
  position: [number, number, number];
  scale?: number;
  onPositionChange?: (position: [number, number, number]) => void;
  onScaleChange?: (scale: number) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

const DraggableLogo: React.FC<DraggableLogoProps> = ({
  url,
  position,
  scale = 0.5,
  onPositionChange,
  onScaleChange,
  isSelected = false,
  onSelect
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<THREE.Vector3>(new THREE.Vector3());
  const { camera, raycaster, scene } = useThree();
  
  // Load the texture
  const texture = useTexture(url);
  
  // Set up texture properties
  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.flipY = false;
    }
  }, [texture]);

  // Handle mouse events
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);
    onSelect?.();

    // Disable orbit controls during drag
    const orbitControls = (event.target as any)?.parent?.parent?.userData?.orbitControls;
    if (orbitControls) {
      orbitControls.enabled = false;
    }

    // Calculate offset from mesh center to click point
    const intersectionPoint = event.point;
    const meshPosition = meshRef.current?.position;
    if (meshPosition && intersectionPoint) {
      setDragOffset(intersectionPoint.clone().sub(meshPosition));
    }
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    setIsDragging(false);

    // Re-enable orbit controls
    const orbitControls = (event.target as any)?.parent?.parent?.userData?.orbitControls;
    if (orbitControls) {
      orbitControls.enabled = true;
    }
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (isDragging && meshRef.current) {
      event.stopPropagation();

      // Get the intersection point and subtract the offset
      const newPosition = event.point.clone().sub(dragOffset);

      // Update mesh position
      meshRef.current.position.copy(newPosition);

      // Notify parent of position change
      onPositionChange?.([newPosition.x, newPosition.y, newPosition.z]);
    }
  };

  // Handle scroll for scaling
  const handleWheel = (event: WheelEvent) => {
    if (isSelected) {
      event.preventDefault();
      const newScale = Math.max(0.1, Math.min(2.0, scale + (event.deltaY > 0 ? -0.1 : 0.1)));
      onScaleChange?.(newScale);
    }
  };

  // Add wheel event listener when selected
  useEffect(() => {
    if (isSelected) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      return () => window.removeEventListener('wheel', handleWheel);
    }
  }, [isSelected, scale]);

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        scale={[scale, scale, 1]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent={true}
          alphaTest={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={position} scale={[scale * 1.1, scale * 1.1, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#ff4444"
            transparent={true}
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Hover indicator - subtle glow */}
      <mesh position={position} scale={[scale * 1.05, scale * 1.05, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent={true}
          opacity={isDragging ? 0.2 : 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default DraggableLogo;

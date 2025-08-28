'use client';

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import UnicornScene from "unicornstudio-react";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920, // Default fallback
    height: typeof window !== 'undefined' ? window.innerHeight : 1080, // Default fallback
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size immediately
    handleResize();

    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export const ShaderBackground = () => {
  const { width, height } = useWindowSize();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render until we're on the client and have proper dimensions
  if (!isClient || width === 0 || height === 0) {
    return (
      <div className={cn("flex flex-col items-center w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900")}>
        {/* Fallback gradient background while loading */}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center")}>
      <UnicornScene
        key={`${width}-${height}`} // Force re-render when dimensions change
        production={true}
        projectId="cbmTT38A0CcuYxeiyj5H"
        width={width}
        height={height}
      />
    </div>
  );
};

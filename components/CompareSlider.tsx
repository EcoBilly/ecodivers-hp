'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';

interface CompareSliderProps {
  originalImage: string;
  processedImage: string;
  strength?: number;
  showOriginal?: boolean;
}

export default function CompareSlider({ 
  originalImage, 
  processedImage, 
  strength = 100,
  showOriginal = false 
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', () => setIsDragging(false));
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', () => setIsDragging(false));
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', () => setIsDragging(false));
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[60vh] max-h-[800px] rounded-xl overflow-hidden select-none shadow-2xl border border-white/10"
    >
      {/* Background/Original Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${originalImage})` }}
      />
      
      {/* Overlay/Processed Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-200"
        style={{ 
          backgroundImage: `url(${processedImage})`,
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          opacity: showOriginal ? 0 : strength / 100,
        }}
      />
      
      {/* Slider Handle (Hide if showOriginal is true) */}
      {!showOriginal && (
        <>
          <div 
            className="absolute inset-y-0 w-1 bg-white/80 shadow-[0_0_10px_rgba(0,0,0,0.5)] transform -translate-x-1/2 flex items-center justify-center cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={(e) => {
              setIsDragging(true);
              handleMove(e.clientX);
            }}
            onTouchStart={(e) => {
              setIsDragging(true);
              handleMove(e.touches[0].clientX);
            }}
          >
            <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200">
              <ArrowLeftRight className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          
          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium z-10 pointer-events-none">
            After
          </div>
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium z-10 pointer-events-none">
            Before
          </div>
        </>
      )}

      {/* Invisible area to capture drag events for the slider if dragging started */}
      {isDragging && (
        <div className="absolute inset-0 z-20 cursor-ew-resize" />
      )}
    </div>
  );
}

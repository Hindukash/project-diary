"use client";

import { useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, alt }: ImageModalProps) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isOpen) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.1), 5));
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('wheel', handleWheel, { passive: false });
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('wheel', handleWheel);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.1))}
            className="p-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded-md">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
            className="p-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70 transition-colors"
            title="Reset"
          >
            Reset
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70 transition-colors"
            title="Download"
          >
            <Download size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70 transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-none max-h-none object-contain select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          draggable={false}
        />
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />

      {/* Help text */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-md">
        <p>Scroll to zoom • Drag to pan • ESC to close</p>
      </div>
    </div>
  );
}
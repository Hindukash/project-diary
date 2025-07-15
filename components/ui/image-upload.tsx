"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({ images, onImagesChange, maxImages = 5, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (validFiles.length === 0) {
      alert('Please select valid image files');
      return;
    }

    if (images.length + validFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Convert files to base64 for storage in mock data
    const promises = validFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64Images => {
      onImagesChange([...images, ...base64Images]);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag & drop images here, or click to select
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {images.length}/{maxImages} images uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image Placeholder */}
      {images.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
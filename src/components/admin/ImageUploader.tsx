"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { uploadAPI } from "@/lib/api";
import { resolveImageUrl } from "@/lib/mappers";
import { X, Upload } from "lucide-react";

interface ImageUploaderProps {
  existingImages?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ existingImages = [], onChange, maxImages = 5 }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateImages = useCallback((newImages: string[]) => {
    setImages(newImages);
    onChange(newImages);
  }, [onChange]);

  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) return;
    const toUpload = fileArray.slice(0, remaining);

    setUploading(true);
    try {
      const result = await uploadAPI.uploadImages(toUpload);
      const newImages = [...images, ...result.urls];
      updateImages(newImages);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (index: number) => {
    const url = images[index];
    try {
      if (url.startsWith("/uploads/")) {
        await uploadAPI.deleteImage(url);
      }
    } catch {
      // ignore delete errors
    }
    const newImages = images.filter((_, i) => i !== index);
    updateImages(newImages);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Image thumbnails */}
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((url, i) => (
            <div key={url + i} className="relative flex-shrink-0 w-20 h-20 rounded border border-base-300 overflow-hidden group">
              <Image
                src={resolveImageUrl(url)}
                alt={`圖片 ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-content text-[10px] text-center py-0.5">
                  主圖
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-0.5 right-0.5 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-base-300 hover:border-primary/50"
          }`}
        >
          {uploading ? (
            <span className="loading loading-spinner loading-md" />
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-2 text-base-content/40" />
              <p className="text-sm text-base-content/60">拖放圖片到此處</p>
              <p className="text-sm text-base-content/60">或 點擊上傳</p>
              <p className="text-xs text-base-content/40 mt-1">JPG/PNG/WebP, 最大 5MB（還可上傳 {maxImages - images.length} 張）</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}

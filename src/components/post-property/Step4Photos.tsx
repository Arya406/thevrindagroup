"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui";
import { UploadedPhoto } from "@/types/postProperty";

export interface Step4PhotosProps {
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  error?: string;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    name: "Living_Room_Interior.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80",
    name: "Master_Bedroom_Balcony.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1000&q=80",
    name: "Modular_Kitchen.jpg",
  },
  {
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
    name: "Exterior_Society_View.jpg",
  },
];

export function Step4Photos({
  photos,
  onPhotosChange,
  error,
}: Step4PhotosProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPhotos: UploadedPhoto[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(file);
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          url: objectUrl,
          name: file.name,
          isCover: photos.length === 0 && newPhotos.length === 0,
        });
      }
    });

    if (newPhotos.length > 0) {
      onPhotosChange([...photos, ...newPhotos]);
    }
  };

  const handleAddPresets = () => {
    const presetPhotos: UploadedPhoto[] = SAMPLE_PHOTO_PRESETS.map(
      (preset, idx) => ({
        id: `preset-${Date.now()}-${idx}`,
        url: preset.url,
        name: preset.name,
        isCover: photos.length === 0 && idx === 0,
      })
    );
    onPhotosChange([...photos, ...presetPhotos]);
  };

  const handleDelete = (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    if (updated.length > 0 && !updated.some((p) => p.isCover)) {
      updated[0].isCover = true;
    }
    onPhotosChange(updated);
  };

  const handleSetCover = (id: string) => {
    const updated = photos.map((p) => ({
      ...p,
      isCover: p.id === id,
    }));
    onPhotosChange(updated);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const newPhotos = [...photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-primary-navy">
            Add Photos of Your Property
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Listings with 3+ high-quality photos receive up to 5x more verified customer enquiries.
          </p>
        </div>

        {/* Quick Demo Preset Adder */}
        <button
          type="button"
          onClick={handleAddPresets}
          className="text-xs font-bold text-accent-gold-hover hover:underline inline-flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Add Sample High-Res Photos
        </button>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
          dragActive
            ? "border-accent-gold bg-accent-gold-light/40 scale-[0.99]"
            : "border-border-default bg-bg-light hover:bg-white hover:border-accent-gold"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-14 h-14 rounded-2xl bg-white shadow-soft-sm border border-border-subtle flex items-center justify-center text-accent-gold">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div>
          <strong className="text-sm font-bold text-primary-navy block">
            Click to upload photos or drag and drop
          </strong>
          <span className="text-xs text-text-muted block mt-0.5">
            Supports JPG, PNG, WEBP up to 10MB per file
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs font-semibold pointer-events-none"
        >
          Browse Files from Device
        </Button>
      </div>

      {error && (
        <p className="text-xs text-error-red font-semibold bg-error-red-light p-2.5 rounded-lg border border-error-red/30">
          {error}
        </p>
      )}

      {/* Photo Thumbnails Gallery */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-navy">
              Uploaded Photos ({photos.length})
            </span>
            <span className="text-[11px] text-text-muted">
              Select star icon to set listing cover image
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className={`group relative aspect-16/10 rounded-xl overflow-hidden border-2 bg-slate-100 shadow-soft-xs transition-all ${
                  photo.isCover
                    ? "border-accent-gold ring-2 ring-accent-gold/40"
                    : "border-border-default hover:border-border-dark"
                }`}
              >
                <Image
                  src={photo.url}
                  alt={photo.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />

                {/* Cover Photo Badge */}
                {photo.isCover && (
                  <div className="absolute top-2 left-2 z-10 bg-accent-gold text-dark-navy text-[10px] font-extrabold px-2 py-0.5 rounded shadow-soft-xs flex items-center gap-1 pointer-events-none">
                    <Star className="w-3 h-3 fill-dark-navy" />
                    COVER PHOTO
                  </div>
                )}

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-dark-navy/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                  {/* Top: Set Cover or Delete */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetCover(photo.id);
                      }}
                      title="Set as Cover Photo"
                      className={`p-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                        photo.isCover
                          ? "bg-accent-gold text-dark-navy"
                          : "bg-white/90 text-text-primary hover:bg-white"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${photo.isCover ? "fill-dark-navy" : ""}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo.id);
                      }}
                      title="Delete photo"
                      className="p-1.5 rounded-md bg-white/90 text-error-red hover:bg-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom: Reorder arrows */}
                  <div className="flex items-center justify-between text-white text-[10px] font-bold">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(idx, "left");
                      }}
                      className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <span>#{idx + 1}</span>

                    <button
                      type="button"
                      disabled={idx === photos.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(idx, "right");
                      }}
                      className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Step4Photos;

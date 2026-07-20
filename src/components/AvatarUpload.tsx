"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { Avatar } from "./Avatar";

const MAX_DIMENSION = 256;
const JPEG_QUALITY = 0.85;

/** Resizes an image file down to a small square-ish JPEG and returns it as a data URL. */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read that image."));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported on this browser."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function AvatarUpload({
  name,
  avatar,
  onChange,
  onResult,
}: {
  name: string;
  avatar: string | null;
  onChange: () => void;
  onResult: (message: string, kind: "success" | "error") => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onResult("Please choose an image file.", "error");
      return;
    }
    if (file.size > 8_000_000) {
      onResult("That image is too large. Please choose one under 8MB.", "error");
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await resizeImage(file);
      const res = await api.post("/api/auth/avatar", { avatar: dataUrl });
      if (!res.success) {
        onResult(res.error, "error");
        return;
      }
      onResult("Profile photo updated.", "success");
      onChange();
    } catch (err) {
      onResult(err instanceof Error ? err.message : "Failed to process image.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setUploading(true);
    const res = await api.delete("/api/auth/avatar");
    setUploading(false);
    if (!res.success) {
      onResult(res.error, "error");
      return;
    }
    onResult("Profile photo removed.", "success");
    onChange();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 shrink-0">
        <Avatar name={name} avatar={avatar} size={64} className="text-xl" />
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white transition-colors"
          >
            <Camera className="h-3.5 w-3.5" />
            {avatar ? "Change photo" : "Upload photo"}
          </button>
          {avatar && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
        <p className="text-[11px] text-muted">JPG or PNG, up to 8MB.</p>
      </div>
    </div>
  );
}
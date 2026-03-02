"use client";

/**
 * ImageUploader
 * ─────────────
 * Lets a vendor add up to MAX_IMAGES images for their venue.
 *
 * Each image can be added ONE AT A TIME via:
 *   • Drag-and-drop / click-to-browse a local file
 *   • Paste / type a public image URL
 *
 * Usage:
 *   <ImageUploader onChange={(urls) => setImages(urls)} />
 *
 * The parent receives a plain string[] of public URLs every time
 * the list changes.  Pass the final list to your server action.
 */

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Link2, Trash2, UploadCloud, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_IMAGES = 5;
const BUCKET = "venue-images"; // Supabase Storage bucket name

type InputMode = "file" | "url";

interface ImageItem {
  url: string;           // final public URL (Supabase storage or external)
  preview: string;       // object-URL for local file preview (same as url for external)
  isUploading?: boolean;
  error?: string;
}

interface Props {
  /** Called every time the image list changes with the current list of public URLs */
  onChange: (urls: string[]) => void;
  /** Pre-seed initial images (e.g. existing venue images when editing) */
  initialImages?: string[];
}

export default function ImageUploader({ onChange, initialImages }: Props) {
  const [images, setImages] = useState<ImageItem[]>(
    (initialImages ?? []).map((url) => ({ url, preview: url }))
  );
  const [mode, setMode] = useState<InputMode>("file");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ──────────────────────────────────────────────

  const notify = useCallback(
    (next: ImageItem[]) => onChange(next.filter((i) => !i.isUploading && !i.error).map((i) => i.url)),
    [onChange]
  );

  const updateImages = (next: ImageItem[]) => {
    setImages(next);
    notify(next);
  };

  const canAdd = images.length < MAX_IMAGES;

  // ── File upload to Supabase Storage ──────────────────────

  const uploadFile = useCallback(async (file: File) => {
    if (!canAdd) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5 MB.");
      return;
    }

    const preview = URL.createObjectURL(file);
    const placeholder: ImageItem = { url: "", preview, isUploading: true };

    setImages((prev) => {
      const next = [...prev, placeholder];
      return next;
    });

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

      setImages((prev) => {
        const next = prev.map((img) =>
          img.preview === preview ? { url: data.publicUrl, preview, isUploading: false } : img
        );
        notify(next);
        return next;
      });
    } catch (err) {
      console.error("Upload error:", err);
      setImages((prev) => {
        const next = prev.map((img) =>
          img.preview === preview
            ? { ...img, isUploading: false, error: "Upload failed. Try URL instead." }
            : img
        );
        notify(next);
        return next;
      });
    }
  }, [canAdd, notify]);

  // ── URL add ───────────────────────────────────────────────

  const addUrl = () => {
    setUrlError("");
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError("Please enter a URL.");
      return;
    }
    try {
      new URL(trimmed); // validate
    } catch {
      setUrlError("Invalid URL. Must start with http:// or https://");
      return;
    }
    if (images.some((i) => i.url === trimmed)) {
      setUrlError("This URL is already added.");
      return;
    }
    const item: ImageItem = { url: trimmed, preview: trimmed };
    updateImages([...images, item]);
    setUrlInput("");
  };

  // ── Remove ────────────────────────────────────────────────

  const remove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    updateImages(next);
  };

  // ── Drag handlers ─────────────────────────────────────────

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Venue Images
          <span className="ml-2 text-xs text-gray-400 font-normal">
            ({images.length}/{MAX_IMAGES})
          </span>
        </label>

        {/* Mode toggle */}
        <div className="flex text-xs rounded-lg overflow-hidden border border-gray-200">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
              mode === "file"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <UploadCloud className="h-3 w-3" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
              mode === "url"
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Link2 className="h-3 w-3" />
            URL
          </button>
        </div>
      </div>

      {/* ── File drag-drop zone ── */}
      {mode === "file" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => canAdd && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 cursor-pointer transition-colors ${
            !canAdd
              ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
              : dragOver
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-gray-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
          }`}
        >
          <ImagePlus className="h-8 w-8 text-gray-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {canAdd ? "Drag & drop an image here" : "Maximum 5 images reached"}
            </p>
            {canAdd && (
              <p className="text-xs text-gray-400 mt-0.5">
                or click to browse · PNG, JPG, WEBP · max 5 MB
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* ── URL input ── */}
      {mode === "url" && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
              disabled={!canAdd}
              placeholder="https://example.com/image.jpg"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={addUrl}
              disabled={!canAdd}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Add
            </button>
          </div>
          {urlError && <p className="text-xs text-red-500">{urlError}</p>}
          <p className="text-xs text-gray-400">
            Tip: you can use Google Drive share links, Cloudinary, ImgBB, or any direct image URL.
          </p>
        </div>
      )}

      {/* ── Preview grid ── */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-gray-100 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.preview}
                alt={`Venue image ${i + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Uploading overlay */}
              {img.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/70 text-white text-xs p-2 text-center">
                  <X className="h-4 w-4 mb-1" />
                  {img.error}
                </div>
              )}

              {/* Cover badge on first image */}
              {i === 0 && !img.isUploading && !img.error && (
                <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-400">
          The <strong>first image</strong> will be used as the cover photo.
          {images.length < MAX_IMAGES && ` You can add ${MAX_IMAGES - images.length} more.`}
        </p>
      )}
    </div>
  );
}

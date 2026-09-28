"use client";

import type React from "react";

import { useState, useRef, useCallback, useEffect } from "react";
import { LiquidGlass } from "./liquid-glass";
import { PickerIsland } from "./filter-island";
import type { Filter } from "./camera-app";
import { MODEL_OPTIONS, getModelWaitHint, type ModelId } from "@/lib/models";

const CameraIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const SwitchCameraIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const FlashIcon = ({
  className,
  off = false,
}: {
  className?: string;
  off?: boolean;
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
    />
    {off && (
      <line
        x1="4"
        y1="4"
        x2="20"
        y2="20"
        strokeWidth={2}
        strokeLinecap="round"
      />
    )}
  </svg>
);

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string, facingMode: "user" | "environment") => void;
  selectedFilter: Filter;
  onFilterSelect: (index: number) => void;
  filterIndex: number;
  filters: Filter[];
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  appearEnabled: boolean;
  appearConfigured: boolean;
  onAppearChange: (enabled: boolean) => void;
}

export function CameraCapture({
  onCapture,
  onFilterSelect,
  filterIndex,
  filters,
  model,
  onModelChange,
  appearEnabled,
  appearConfigured,
  onAppearChange,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const isCapturingRef = useRef(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const startCamera = useCallback(
    async (facing: "user" | "environment" = facingMode) => {
      try {
        setIsLoading(true);
        setError(null);

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }

        setStream(newStream);
        setFacingMode(facing);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      } finally {
        setIsLoading(false);
      }
    },
    [stream, facingMode]
  );

  const compressImage = useCallback(
    (
      imageDataUrl: string,
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.8
    ): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(imageDataUrl);
            return;
          }

          let { width, height } = img;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.src = imageDataUrl;
      });
    },
    []
  );

  const markPhotoTaken = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("banana-camera-photo-taken", "true");
      localStorage.setItem("banana_camera_photo_taken", "true");
      sessionStorage.setItem("banana-camera-photo-taken", "true");
    } catch {
      // ignore storage errors
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturingRef.current) {
      return;
    }

    isCapturingRef.current = true;

    try {
      if (flashEnabled) {
        setIsFlashing(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (facingMode === "user") {
        context.scale(-1, 1);
        context.translate(-canvas.width, 0);
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const compressedImageUrl = await compressImage(imageDataUrl);
      markPhotoTaken();
      onCapture(compressedImageUrl, facingMode);
    } finally {
      setIsFlashing(false);
      isCapturingRef.current = false;
    }
  }, [onCapture, compressImage, facingMode, flashEnabled, markPhotoTaken]);

  const switchCamera = useCallback(() => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    startCamera(newFacing);
  }, [facingMode, startCamera]);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        if (imageDataUrl) {
          const compressedImageUrl = await compressImage(imageDataUrl);
          markPhotoTaken();
          onCapture(compressedImageUrl, "environment");
        }
      };
      reader.readAsDataURL(file);
    },
    [onCapture, compressImage, markPhotoTaken]
  );

  const triggerImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768 && !("ontouchstart" in window));
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start camera once on mount
  }, []);

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4 px-8">
          <CameraIcon className="w-16 h-16 mx-auto text-white/60" />
          <div>
            <h3 className="text-xl font-medium">Camera Error</h3>
            <p className="text-white/60 mt-2">{error}</p>
          </div>
          <LiquidGlass
            variant="button"
            intensity="medium"
            onClick={() => startCamera()}
            className="text-white"
          >
            Retry
          </LiquidGlass>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full relative bg-black select-none border-0"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60">Starting camera...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{
          transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
        }}
        onLoadedMetadata={() => setIsLoading(false)}
      />

      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-linear-to-b from-black/50 to-transparent pointer-events-auto z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/banana-camera-logo.png"
              alt="One Motion 2026"
              className="w-12 h-12 md:w-24 md:h-24 object-contain"
            />
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <LiquidGlass
              variant="button"
              intensity="medium"
              onClick={() => {
                if (!appearConfigured) return;
                onAppearChange(!appearEnabled);
              }}
              className={`rounded-full w-10 h-10 p-0 flex items-center justify-center ${
                appearEnabled
                  ? "text-yellow-400"
                  : appearConfigured
                  ? "text-white"
                  : "text-white/35"
              }`}
              style={{ borderRadius: "50%" }}
            >
              <span className="font-mono text-sm font-semibold leading-none">
                A
              </span>
            </LiquidGlass>

            <LiquidGlass
              variant="button"
              intensity="medium"
              onClick={() => setFlashEnabled((on) => !on)}
              className={`rounded-full w-10 h-10 p-0 flex items-center justify-center ${
                flashEnabled ? "text-yellow-400" : "text-white"
              }`}
              style={{ borderRadius: "50%" }}
            >
              <FlashIcon className="w-4 h-4" off={!flashEnabled} />
            </LiquidGlass>

            <LiquidGlass
              variant="button"
              intensity="medium"
              onClick={triggerImageUpload}
              className="text-white rounded-full w-10 h-10 p-0 flex items-center justify-center"
              style={{ borderRadius: "50%" }}
            >
              <UploadIcon className="w-4 h-4" />
            </LiquidGlass>

            <LiquidGlass
              variant="button"
              intensity="medium"
              onClick={switchCamera}
              className="text-white rounded-full w-10 h-10 p-0 flex items-center justify-center"
              style={{ borderRadius: "50%" }}
            >
              <SwitchCameraIcon className="w-5 h-5" />
            </LiquidGlass>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pb-12 md:pb-8 bg-linear-to-t from-black/50 to-transparent pointer-events-auto z-20">
        <div className="flex justify-center items-center">
          <LiquidGlass
            variant="panel"
            intensity="medium"
            rippleEffect={false}
            flowOnHover={false}
            stretchOnDrag={false}
            className={`${
              isDesktop ? "w-16 h-16" : "w-20 h-20"
            } flex items-center justify-center cursor-pointer`}
            style={{ borderRadius: "50%" }}
            onClick={capturePhoto}
          >
            <CameraIcon
              className={`${isDesktop ? "w-6 h-6" : "w-8 h-8"} text-white`}
            />
          </LiquidGlass>
        </div>

        <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-3 mt-4 md:mt-6">
          <PickerIsland
            title="Model"
            items={MODEL_OPTIONS.map(({ id, label }) => ({
              id,
              name: label,
            }))}
            selectedId={model}
            onSelect={(id) => onModelChange(id as ModelId)}
          />

          <p className="w-full text-white/55 font-mono text-xs text-center px-2">
            {getModelWaitHint(model)}
          </p>

          <PickerIsland
            title="Filters"
            items={filters.map((filter) => ({
              id: filter.id,
              name: filter.name,
            }))}
            selectedId={filters[filterIndex]?.id ?? filters[0]?.id ?? "none"}
            onSelect={(id) => {
              const index = filters.findIndex((filter) => filter.id === id);
              if (index >= 0) onFilterSelect(index);
            }}
          />
        </div>
      </div>

      {isFlashing && (
        <div className="fixed inset-0 z-100 bg-white" aria-hidden="true" />
      )}
    </div>
  );
}

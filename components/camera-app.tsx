"use client";
import { useState, useCallback, useEffect } from "react";
import { CameraCapture } from "./camera-capture";
import { ProcessedImage } from "./processed-image";
import { addWatermark } from "../lib/watermark";

export interface Filter {
  id: string;
  name: string;
  description?: string;
}

const FALLBACK_FILTERS: Filter[] = [
  { id: "none", name: "Original", description: "No filter" },
];

export type ModelId =
  | "nano-banana"
  | "nano-banana-2"
  | "flux-2"
  | "gemini-3.1-flash-image-preview"
  | "flux-2/lora";

export const MODEL_OPTIONS: { id: ModelId; label: string }[] = [
  { id: "nano-banana", label: "Nano Banana" },
  { id: "nano-banana-2", label: "Nano Banana 2" },
  { id: "flux-2", label: "Flux 2" },
  { id: "gemini-3.1-flash-image-preview", label: "Gemini 3.1 Flash" },
  { id: "flux-2/lora", label: "Flux 2 LoRA" },
];

export function CameraApp() {
  const [filters, setFilters] = useState<Filter[]>(FALLBACK_FILTERS);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedWithFrontCamera, setCapturedWithFrontCamera] = useState(false);
  const [model, setModel] = useState<ModelId>("nano-banana");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/filters")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data.filters)) return;
        if (data.filters.length > 0) {
          setFilters(data.filters);
        }
      })
      .catch(() => {
        if (!cancelled) setFilters(FALLBACK_FILTERS);
      })
      .finally(() => {
        if (!cancelled) setFiltersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedFilterIndex >= filters.length && filters.length > 0) {
      setSelectedFilterIndex(0);
    }
  }, [filters.length, selectedFilterIndex]);

  const selectedFilter = filters[selectedFilterIndex] ?? filters[0];

  const handleCapture = useCallback(
    async (imageDataUrl: string, facingMode: "user" | "environment") => {
      setCapturedImage(imageDataUrl);
      setProcessedImage(null);
      setCapturedWithFrontCamera(facingMode === "user");

      if (selectedFilter.id === "none") {
        try {
          const watermarkedImage = await addWatermark(
            imageDataUrl,
            facingMode === "user"
          );
          setProcessedImage(watermarkedImage);
        } catch (error) {
          console.error(
            "weDat Error adding watermark to original image:",
            error
          );
          setProcessedImage(imageDataUrl);
        }
        return;
      }

      setIsProcessing(true);

      try {
        console.log(
          "weDat Starting image processing with filter:",
          selectedFilter.id
        );
        const response = await fetch("/api/process-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: imageDataUrl,
            filter: selectedFilter.id,
            model,
          }),
        });

        console.log("weDat API response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.log("weDat API error response:", errorText);
          throw new Error(
            `Error processing image: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log("weDat API response data:", data);

        if (data.processedImageUrl) {
          console.log(
            "weDat Setting processed image URL:",
            data.processedImageUrl
          );

          try {
            console.log("weDat Adding watermark to processed image");
            const watermarkedImage = await addWatermark(
              data.processedImageUrl,
              facingMode === "user"
            );
            console.log("weDat Watermark applied successfully");
            setProcessedImage(watermarkedImage);
            setIsProcessing(false);
          } catch (watermarkError) {
            console.error("weDat Error adding watermark:", watermarkError);
            setProcessedImage(data.processedImageUrl);
            setIsProcessing(false);
          }

          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            console.log("weDat Processed image loaded successfully");
          };
          img.onerror = (error) => {
            console.log("weDat Error loading processed image:", error);
            console.log("weDat Falling back to original image");
            addWatermark(imageDataUrl, facingMode === "user")
              .then((watermarkedFallback) => {
                setProcessedImage(watermarkedFallback);
                setIsProcessing(false);
              })
              .catch(() => {
                setProcessedImage(imageDataUrl);
                setIsProcessing(false);
              });
          };
          img.src = data.processedImageUrl;
        } else {
          console.log(
            "weDat No processed image URL in response, using original with watermark"
          );
          try {
            const watermarkedImage = await addWatermark(
              imageDataUrl,
              facingMode === "user"
            );
            setProcessedImage(watermarkedImage);
          } catch (error) {
            console.error("weDat Error adding watermark to fallback:", error);
            setProcessedImage(imageDataUrl);
          }
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("weDat Error processing image:", error);
        try {
          const watermarkedImage = await addWatermark(
            imageDataUrl,
            facingMode === "user"
          );
          setProcessedImage(watermarkedImage);
        } catch (watermarkError) {
          console.error(
            "weDat Error adding watermark to error fallback:",
            watermarkError
          );
          setProcessedImage(imageDataUrl);
        }
        setIsProcessing(false);
      }
    },
    [selectedFilter, model]
  );

  const handleReset = () => {
    setCapturedImage(null);
    setProcessedImage(null);
    setIsProcessing(false);
    setCapturedWithFrontCamera(false);
  };

  const handleDownload = () => {
    if (!processedImage) return;

    try {
      if (processedImage.startsWith("data:")) {
        const byteCharacters = atob(processedImage.split(",")[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/jpeg" });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `filtered-photo-${selectedFilter.id}-${Date.now()}.jpg`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 100);
      } else {
        const link = document.createElement("a");
        link.href = processedImage;
        link.download = `filtered-photo-${selectedFilter.id}-${Date.now()}.jpg`;
        link.style.display = "none";
        link.setAttribute("target", "_self");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Download failed:", error);
      window.location.href = processedImage;
    }
  };

  const handleFilterSelect = (index: number) => {
    setSelectedFilterIndex(index);
  };

  return (
    <div
      className="h-dvh w-screen bg-black overflow-hidden fixed inset-0 touch-none select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {!capturedImage ? (
        <CameraCapture
          onCapture={handleCapture}
          selectedFilter={selectedFilter}
          onFilterSelect={handleFilterSelect}
          filterIndex={selectedFilterIndex}
          filters={filters}
          model={model}
          onModelChange={setModel}
        />
      ) : (
        <ProcessedImage
          originalImage={capturedImage}
          processedImage={processedImage}
          isProcessing={isProcessing}
          filterName={selectedFilter.name}
          onReset={handleReset}
          onDownload={handleDownload}
          isFrontCamera={capturedWithFrontCamera}
        />
      )}
    </div>
  );
}

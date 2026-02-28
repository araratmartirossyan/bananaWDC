"use client";
import { useState, useCallback } from "react";
import { CameraCapture } from "./camera-capture";
import { ProcessedImage } from "./processed-image";
import { addWatermark } from "../lib/watermark";

export type FilterType =
  | "none"
  | "matrix"
  | "acid"
  | "matsuri"
  | "greek"
  | "roman"
  | "viking"
  | "napaleon"
  | "renaissance"
  | "pharaon"
  | "burning_man"
  | "mad_max"
  | "gta"
  | "samurai"
  | "car_mechanic"
  | "vintage"
  | "cyberpunk"
  | "underwater"
  | "medieval"
  | "apocalypse"
  | "steampunk"
  | "tropical"
  | "space"
  | "winter"
  | "neon_tokyo"
  | "wild_west"
  | "art_deco"
  | "fairy_tale"
  | "horror"
  | "desert_mirage"
  | "crystal_cave"
  | "floating_islands"
  | "time_machine"
  | "spy"
  | "gothic"
  | "90s"
  | "disco"
  | "dat"
  | "wasen";

export interface Filter {
  id: FilterType;
  name: string;
  description: string;
  prompt?: string;
}

const filters: Filter[] = [
  {
    id: "acid",
    description: "Acid",
    name: "Acid",
  },
  {
    id: "vintage",
    description: "Vintage",
    name: "Vintage",
  },
  {
    id: "cyberpunk",
    description: "Cyberpunk",
    name: "Cyberpunk",
  },
  {
    id: "underwater",
    description: "Underwater",
    name: "Underwater",
  },
  {
    id: "space",
    description: "Space",
    name: "Space",
  },
  {
    id: "medieval",
    description: "Medieval",
    name: "Medieval",
  },
  {
    id: "apocalypse",
    description: "Apocalypse",
    name: "Apocalypse",
  },
  {
    id: "steampunk",
    description: "Steampunk",
    name: "Steampunk",
  },
  {
    id: "tropical",
    description: "Tropical",
    name: "Tropical",
  },
  {
    id: "winter",
    description: "Winter",
    name: "Winter",
  },
  {
    id: "neon_tokyo",
    description: "Neon Tokyo",
    name: "Neon Tokyo",
  },
  {
    id: "wild_west",
    description: "Wild West",
    name: "Wild West",
  },
  {
    id: "art_deco",
    description: "Art Deco",
    name: "Art Deco",
  },
  {
    id: "fairy_tale",
    description: "Fairy Tale",
    name: "Fairy Tale",
  },
  {
    id: "horror",
    description: "Horror",
    name: "Horror",
  },
  {
    id: "desert_mirage",
    description: "Desert Mirage",
    name: "Desert Mirage",
  },
  {
    id: "crystal_cave",
    description: "Crystal Cave",
    name: "Crystal Cave",
  },
  {
    id: "floating_islands",
    description: "Floating Islands",
    name: "Floating Islands",
  },
  {
    id: "time_machine",
    description: "Time Machine",
    name: "Time Machine",
  },
  {
    id: "spy",
    description: "Spy",
    name: "Spy",
  },
  {
    id: "gothic",
    description: "Gothic",
    name: "Gothic",
  },
  {
    id: "90s",
    description: "90s",
    name: "90s",
  },
  {
    id: "disco",
    description: "Disco",
    name: "Disco",
  },
  {
    id: "samurai",
    description: "Samurai",
    name: "Samurai",
  },
  {
    id: "none",
    name: "Original",
    description: "No filter",
  },
  {
    id: "wasen",
    name: "Wasen",
    description: "Wasen",
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "Matrix",
  },
  {
    id: "matsuri",
    name: "Matsuri",
    description: "Matsuri",
  },
  {
    id: "greek",
    name: "Greek",
    description: "Greek",
  },
  {
    id: "roman",
    name: "Roman",
    description: "Roman",
  },
  {
    id: "viking",
    name: "Viking",
    description: "Viking",
  },
  {
    id: "car_mechanic",
    name: "Car Mechanic",
    description: "Car mechanic",
  },
  {
    id: "napaleon",
    name: "Napaleon",
    description: "Napaleon",
  },
  {
    id: "renaissance",
    name: "Renaissance",
    description: "Renaissance",
  },
  {
    id: "pharaon",
    name: "Pharaon",
    description: "Pharaon",
  },
  {
    id: "burning_man",
    name: "Burning Man",
    description: "Burning Man",
  },
  {
    id: "mad_max",
    name: "Mad Max",
    description: "Mad Max",
  },
  {
    id: "dat",
    name: "DAT Agent",
    description: "DAT Agent",
  },
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
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedWithFrontCamera, setCapturedWithFrontCamera] = useState(false);
  const [model, setModel] = useState<ModelId>("nano-banana");

  const selectedFilter = filters[selectedFilterIndex];

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

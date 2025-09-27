"use client";
import { LiquidGlass } from "./liquid-glass";
import { Sparkles, RotateCcw, X, Share2 } from "lucide-react"; // removed Share import

interface ProcessedImageProps {
  originalImage: string;
  processedImage: string | null;
  isProcessing: boolean;
  filterName: string;
  onReset: () => void;
  onDownload: () => void;
  isFrontCamera: boolean;
}

export function ProcessedImage({
  originalImage,
  processedImage,
  isProcessing,
  filterName,
  onReset,
  onDownload,
  isFrontCamera,
}: ProcessedImageProps) {
  const showProcessedImage = !!processedImage;
  const showOriginalImage = !processedImage;

  const handleDownload = async () => {
    if (!processedImage) {
      onDownload();
      return;
    }

    const filename = `wedat-cam-${filterName}-${Date.now()}.jpg`;

    // 1) Try Web Share with files (iOS share sheet lets user "Save Image" to Photos)
    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();

      const navAny =
        typeof navigator !== "undefined"
          ? (navigator as unknown as any)
          : undefined;
      const canUseShare = !!navAny && typeof navAny.share === "function";
      if (canUseShare) {
        const file = new File([blob], filename, {
          type: blob.type || "image/jpeg",
        });
        const canShareFiles =
          !navAny.canShare || navAny.canShare({ files: [file] });
        if (canShareFiles) {
          try {
            await navAny.share({
              files: [file],
              title: "Hello From weDat",
              text: `https://smile.wedat.eu`,
            });
            return; // Shared successfully or user cancelled; no further action needed
          } catch (shareError) {
            // Fall through to open-in-new-tab if user didn't complete share or it failed
          }
        }
      }

      // 2) Fallback: open image in a new tab so user can long-press "Save Image"
      try {
        let urlToOpen = processedImage;
        if (!processedImage.startsWith("blob:")) {
          const fallbackBlobUrl = URL.createObjectURL(blob);
          urlToOpen = fallbackBlobUrl;
        }
        const newTab = window.open(urlToOpen, "_blank", "noopener,noreferrer");
        if (newTab) return;
      } catch (_) {
        // Ignore and proceed to final download fallback
      }
    } catch (_) {
      // Ignore and proceed to final download fallback
    }

    // 3) Final fallback: programmatic download (will typically save to Files on iOS)
    const link = document.createElement("a");
    link.href = processedImage;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full w-full relative bg-black">
      {/* Main image */}
      <div className="h-full w-full relative">
        {showOriginalImage && (
          <img
            src={originalImage || "/placeholder.svg"}
            alt="Original photo"
            className={`w-full h-full object-cover ${
              isProcessing ? "blur-md" : ""
            }`}
          />
        )}

        {showProcessedImage && (
          <img
            src={processedImage || "/placeholder.svg"}
            alt="Processed photo with watermark"
            className="w-full h-full object-cover"
            onLoad={() =>
              console.log("weDat Processed image rendered successfully")
            }
            onError={(e) => {
              console.log("weDat Error rendering processed image:", e);
              console.log("weDat Image src:", processedImage);
            }}
          />
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-center space-y-6">
              <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    animation: "shimmer 2s ease-in-out infinite",
                    background:
                      "linear-gradient(90deg, transparent, white, transparent)",
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
              <p className="text-white/80 font-medium">
                Processing with {filterName}...
              </p>
            </div>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex justify-between items-center">
            <LiquidGlass
              variant="button"
              intensity="medium"
              onClick={onReset}
              className="text-white rounded-full w-10 h-10 p-0 flex items-center justify-center"
              style={{ borderRadius: "50%" }}
            >
              <X className="w-5 h-5" />
            </LiquidGlass>

            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white font-medium">{filterName}</span>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        {!isProcessing && processedImage && (
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pb-12 md:pb-8 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex justify-center items-center space-x-3 md:space-x-4">
              <LiquidGlass
                variant="button"
                intensity="strong"
                onClick={onReset}
                className="text-white backdrop-blur-xl bg-white/10 border-white/20 hover:bg-white/15 p-3 md:p-4 rounded-2xl flex items-center justify-center transition-all duration-300"
              >
                <RotateCcw className="w-5 md:w-6 h-5 md:h-6" />
              </LiquidGlass>

              <LiquidGlass
                variant="button"
                intensity="strong"
                onClick={handleDownload}
                className="text-black backdrop-blur-xl bg-white/90 border-white/30 hover:bg-white p-3 md:p-4 rounded-2xl font-medium flex items-center justify-center transition-all duration-300 shadow-lg"
              >
                <Share2 className="w-5 md:w-6 h-5 md:h-6" />
              </LiquidGlass>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

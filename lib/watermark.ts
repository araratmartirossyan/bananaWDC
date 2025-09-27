// Utility function to add watermark to images
export async function addWatermark(
  imageUrl: string,
  isFrontCamera = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      console.log(
        "[v0] Watermark - Image loaded, dimensions:",
        img.width,
        "x",
        img.height
      );

      const devicePixelRatio = window.devicePixelRatio || 1;
      console.log("[v0] Watermark - Device pixel ratio:", devicePixelRatio);

      // Set canvas size to match image with device pixel ratio for sharp rendering
      canvas.width = img.width * devicePixelRatio;
      canvas.height = img.height * devicePixelRatio;

      // Scale the canvas back down using CSS for proper display
      canvas.style.width = img.width + "px";
      canvas.style.height = img.height + "px";

      // Scale the drawing context so everything draws at the higher resolution
      ctx.scale(devicePixelRatio, devicePixelRatio);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      // ctx.textRenderingOptimization = 'optimizeQuality' // This property is not supported in all browsers

      // Draw the original image without any transformations
      ctx.drawImage(img, 0, 0);

      const watermarkText = "WDC Conference 2025";

      const minFontSize = 80;
      const widthBasedSize = img.width / 2.5;
      const heightBasedSize = img.height / 2.5;
      const calculatedSize = Math.min(widthBasedSize, heightBasedSize);
      const fontSize = Math.max(minFontSize, calculatedSize);

      console.log("[v0] Watermark - Font size calculation:");
      console.log("  - Minimum font size:", minFontSize);
      console.log("  - Width-based size (width/2.5):", widthBasedSize);
      console.log("  - Height-based size (height/2.5):", heightBasedSize);
      console.log("  - Calculated size (min of width/height):", calculatedSize);
      console.log("  - Final font size (max of min and calculated):", fontSize);

      ctx.font = `900 ${fontSize}px var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace`;
      ctx.fillStyle = "rgba(255, 255, 255, 1.0)";

      ctx.textAlign = "end";
      ctx.textBaseline = "bottom";

      const padding = Math.max(10, Math.min(img.width / 50, img.height / 50));
      const x = img.width - padding;
      const y = img.height - padding;

      console.log("[v0] Watermark - Position calculation:");
      console.log("  - Padding:", padding);
      console.log("  - X position:", x);
      console.log("  - Y position:", y);
      console.log("  - Text:", watermarkText);

      ctx.shadowColor = "rgba(0, 0, 0, 0.98)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      console.log("[v0] Watermark - Drawing text with font:", ctx.font);
      ctx.fillText(watermarkText, x, y);
      console.log("[v0] Watermark - Text drawn successfully");

      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(
              "[v0] Watermark - Blob created successfully, size:",
              blob.size,
              "bytes"
            );
            const watermarkedUrl = URL.createObjectURL(blob);
            console.log("[v0] Watermark - Final watermarked URL created");
            resolve(watermarkedUrl);
          } else {
            console.error("[v0] Watermark - Failed to create blob");
            reject(new Error("Failed to create watermarked image"));
          }
        },
        "image/jpeg",
        0.95 // Higher quality
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}

// Server-side watermark function using Canvas API
export async function addWatermarkServer(imageBuffer: Buffer): Promise<Buffer> {
  // This would require a server-side canvas library like 'canvas'
  // For now, we'll handle watermarking on the client side
  return imageBuffer;
}

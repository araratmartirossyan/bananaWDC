"use client";
import { useState, useCallback } from "react";
import { CameraCapture } from "./camera-capture";
import { ProcessedImage } from "./processed-image";
import { addWatermark } from "../lib/watermark";

export type FilterType =
  | "none"
  | "acid"
  | "vintage"
  | "cyberpunk"
  | "underwater"
  | "medieval"
  | "apocalypse"
  | "steampunk"
  | "tropical"
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
  | "disco";

export interface Filter {
  id: FilterType;
  name: string;
  description: string;
  prompt: string;
}

const filters: Filter[] = [
  {
    id: "none",
    name: "Original",
    description: "No filter",
    prompt: "",
  },
  {
    id: "art_deco",
    name: "Art Deco",
    description: "1920s glamour",
    prompt:
      "Transform people with elegant 1920s fashion: men in sharp three-piece suits with bow ties, suspenders, and fedora hats; women in drop-waist beaded dresses, long pearl necklaces, feathered headbands, and T-bar shoes. Add Art Deco environment: geometric patterns on walls, gold and black color schemes, elegant curved lines, stylized sunburst designs, ornate mirrors, crystal chandeliers, marble columns, decorative metalwork, vintage automobiles, jazz age accessories. Apply sophisticated golden lighting with luxurious atmosphere.",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic",
    prompt:
      "Transform people into cyberpunk characters: futuristic clothing with LED strips, leather jackets with neon accents, cybernetic implants, glowing tattoos, colored contact lenses, punk hairstyles with neon highlights, tech accessories, augmented reality visors, metallic jewelry. Add cyberpunk environment: neon signs with Japanese text, holographic displays, futuristic buildings, flying cars, digital billboards, chrome pipes, circuit patterns on walls, glowing cables, rain effects. Apply purple and cyan neon lighting with digital glitches.",
  },
  {
    id: "wild_west",
    name: "Wild West",
    description: "Cowboy frontier",
    prompt:
      "Transform people into cowboys and frontier folk: men in cowboy hats, leather chaps, boots with spurs, bandanas, sheriff badges, gun holsters; women in prairie dresses, bonnets, leather boots, fringed jackets. Add wild west environment: desert cacti, tumbleweeds, old wooden saloons, horse-drawn wagons, wanted posters on walls, oil lamps, wooden barrels, desert mountains in background, vultures circling, dust storms, rustic fences. Apply warm desert tones with dramatic sunset lighting.",
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Retro vibes",
    prompt:
      "Transform people with vintage 1950s style: men in high-waisted trousers, suspenders, bow ties, rolled sleeves, pompadour hairstyles; women in circle skirts, petticoats, cardigans, victory rolls, red lipstick, cat-eye glasses. Add vintage environment: classic diners, jukeboxes, vintage cars, checkered floors, neon signs, milkshake bars, drive-in theaters, retro furniture. Apply warm sepia tones with soft vintage lighting.",
  },
  {
    id: "underwater",
    name: "Underwater",
    description: "Ocean depths",
    prompt:
      "Transform people into underwater explorers: diving suits, oxygen masks, flippers, underwater gear, coral accessories, seaweed hair decorations, pearl jewelry, nautical clothing. Add underwater environment: colorful coral reefs, tropical fish swimming around, sea anemones, underwater caves, sunlight filtering through water, bubbles floating up, shipwrecks, treasure chests, dolphins, sea turtles. Apply blue-green aquatic lighting with water ripple effects.",
  },
  {
    id: "medieval",
    name: "Medieval",
    description: "Knights & castles",
    prompt:
      "Transform people into medieval characters: knights in armor with helmets and shields, princesses in flowing gowns with crowns, peasants in simple tunics, monks in robes, blacksmiths with leather aprons. Add medieval environment: stone castles, wooden bridges, torches on walls, banners with heraldic symbols, cobblestone paths, medieval weapons, horse stables, market stalls, gothic architecture. Apply warm candlelight with dramatic shadows.",
  },
  {
    id: "neon_tokyo",
    name: "Neon Tokyo",
    description: "Japanese nightlife",
    prompt:
      "Transform people with Tokyo street fashion: colorful hair, anime-inspired outfits, LED accessories, kawaii elements, street wear, platform shoes, face masks with designs, tech gadgets. Add neon Tokyo environment: Japanese street signs, vending machines, cherry blossoms, paper lanterns, anime billboards, crowded streets, bullet trains, traditional temples mixed with modern buildings, ramen shops, arcade games. Apply vibrant neon pink and blue lighting.",
  },
  {
    id: "steampunk",
    name: "Steampunk",
    description: "Victorian tech",
    prompt:
      "Transform people into steampunk characters: brass goggles, leather corsets, top hats with gears, mechanical arm pieces, pocket watches, steam-powered accessories, Victorian clothing with industrial elements, copper jewelry. Add steampunk environment: brass pipes, steam engines, clockwork mechanisms, airships, industrial machinery, copper and bronze metals, vintage laboratories, mechanical contraptions, steam clouds. Apply warm brass lighting with industrial atmosphere.",
  },
  {
    id: "spy",
    name: "Spy",
    description: "Secret agent",
    prompt:
      "Transform people into sophisticated secret agents: men in tailored black suits, bow ties, cufflinks, sleek sunglasses, leather gloves, spy watches; women in elegant cocktail dresses, pearl earrings, red lipstick, stylish trench coats, high heels. Add spy environment: casino interiors, luxury hotels, city rooftops at night, vintage sports cars, briefcases, surveillance equipment, martini glasses, poker tables, neon city lights, shadowy alleyways, international landmarks. Apply dramatic film noir lighting with high contrast shadows and mysterious atmosphere.",
  },
  {
    id: "gothic",
    name: "Gothic",
    description: "Dark romance",
    prompt:
      "Transform people into gothic characters: men in black Victorian coats, ruffled shirts, dark eyeliner, silver jewelry, leather boots; women in corsets, flowing black dresses, lace gloves, dark makeup, chokers, dramatic eye shadow. Add gothic environment: ancient cathedrals, stone gargoyles, wrought iron gates, candlelit chambers, stained glass windows, fog-covered graveyards, medieval architecture, ravens, thorny roses, ornate mirrors, velvet curtains. Apply moody purple and blue lighting with dramatic shadows and mysterious ambiance.",
  },
  {
    id: "90s",
    name: "90s",
    description: "Retro nostalgia",
    prompt:
      "Transform people with authentic 90s fashion: men in baggy jeans, flannel shirts, backwards baseball caps, sneakers, chain wallets; women in crop tops, high-waisted jeans, chokers, platform shoes, butterfly clips, denim jackets. Add 90s environment: arcade games, neon mall aesthetics, boom boxes, cassette tapes, VHS stores, roller rinks, geometric patterns, bright colors, old computers, pagers, CD players, grunge concert posters. Apply vibrant neon lighting with retro color schemes and nostalgic atmosphere.",
  },
  {
    id: "disco",
    name: "Disco",
    description: "70s dance fever",
    prompt:
      "Transform people into disco dancers: men in wide-collar shirts, bell-bottom pants, gold chains, afro hairstyles, platform shoes; women in sequined dresses, feathered hair, bold makeup, metallic fabrics, go-go boots, large hoop earrings. Add disco environment: mirror balls, colorful dance floors, neon lights, vinyl records, DJ booths, retro furniture, lava lamps, psychedelic patterns, disco balls reflecting light, dance platforms, vintage microphones. Apply dynamic multicolored lighting with sparkles, reflections, and groovy dance floor atmosphere.",
  },
];

export function CameraApp() {
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedWithFrontCamera, setCapturedWithFrontCamera] = useState(false);

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
    [selectedFilter]
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

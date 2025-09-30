"use client";
import { useState, useCallback } from "react";
import { CameraCapture } from "./camera-capture";
import { ProcessedImage } from "./processed-image";
import { addWatermark } from "../lib/watermark";

export type FilterType =
  | "none"
  | "acid"
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
    id: "acid",
    name: "Acid",
    description: "Psychedelic acid trip",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with psychedelic acid trip aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Apply flowing tie-dye patterns to clothing with photorealistic fabric textures, rainbow color shifts in hair maintaining natural hair physics, kaleidoscope reflections in eyes with anatomically correct eye structure, preserve exact facial features and natural skin textures while adding subtle color morphing effects that look like real light refraction. For LANDSCAPES: Transform sky into swirling rainbow patterns with realistic cloud formations, add flowing color waves across terrain maintaining geological accuracy, create fractal patterns in trees/mountains with photorealistic bark and rock textures, preserve natural lighting physics and atmospheric perspective. For OBJECTS: Add rainbow color shifts with realistic material properties, create kaleidoscope reflections following real optical laws, maintain exact object proportions and surface textures. For FOOD: Add colorful swirling patterns while preserving realistic food textures, moisture, and natural food physics. For ANIMALS: Add colorful fur/feather patterns with anatomically correct animal features, realistic fur/feather physics. CRITICAL: Maintain photorealistic lighting, shadows, reflections, and material properties. Result must look like a real photograph taken with professional camera equipment, not digital art or illustration.",
  },
  {
    id: "space",
    name: "Space",
    description: "NASA space mission",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with authentic NASA space mission aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Transform into authentic astronauts wearing photorealistic NASA EMU (Extravehicular Mobility Unit) space suits with accurate white thermal micrometeoroid garment, realistic gold-tinted helmet visors reflecting Earth and stars, authentic NASA mission patches (Apollo, Artemis, ISS), genuine life support backpack (PLSS) with realistic tubes and connections, accurate space gloves with fingertip lights, realistic communication headset visible inside helmet, authentic NASA name tags and flag patches. Add realistic space suit physics with proper pressurization appearance, authentic fabric textures and wear patterns from actual space missions. For LANDSCAPES: Transform into photorealistic International Space Station interior with accurate control panels, authentic NASA equipment, realistic floating objects in zero gravity, genuine Earth view through cupola windows showing accurate continental geography, realistic LED lighting systems, authentic cable management and handholds. Or create realistic lunar surface with accurate regolith texture, authentic lunar module components, realistic Earth rising over lunar horizon with correct astronomical positioning, genuine NASA equipment scattered realistically. For OBJECTS: Transform into authentic NASA space equipment with realistic materials - titanium, aluminum, Kevlar textures, accurate mission control interfaces, genuine space food packaging, realistic scientific instruments with authentic NASA branding and serial numbers. CRITICAL: Must look like actual NASA mission photography from ISS, Apollo, or Artemis programs. Use authentic space agency aesthetics, realistic zero-gravity physics, accurate astronomical lighting, and genuine NASA equipment details. Perfect space documentary photography quality with authentic mission patch integration and realistic space suit weathering from actual EVA use.",
  },
  {
    id: "gta",
    name: "GTA",
    description: "Grand Theft Auto",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Grand Theft Auto aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic GTA clothing with authentic fabric textures and wear patterns, maintain exact facial features with realistic GTA lighting and natural skin tones. For LANDSCAPES: Transform into photorealistic GTA scenes with authentic GTA buildings and environments, maintain natural GTA lighting physics and atmospheric perspective. For OBJECTS: Add realistic GTA materials with authentic GTA textures and wear patterns, maintain exact proportions with believable GTA weathering. For FOOD: Present authentic GTA cuisine with realistic GTA textures and wear patterns, maintain natural GTA food physics. For ANIMALS: Add realistic GTA animals with authentic GTA textures and wear patterns, maintain anatomically correct features with believable GTA environment interactions. CRITICAL: Must look like an actual GTA photograph taken with professional equipment, with authentic GTA lighting, realistic GTA conditions, and perfect GTA photography quality.",
  },
  {
    id: "car_mechanic",
    name: "Car Mechanic",
    description: "Car mechanic",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with car mechanic aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic car mechanic clothing with authentic fabric textures and wear patterns, maintain exact facial features with realistic car mechanic lighting and natural skin tones. For LANDSCAPES: Transform into photorealistic car mechanic scenes with authentic car mechanic buildings and environments, maintain natural car mechanic lighting physics and atmospheric perspective. For OBJECTS: Add realistic car mechanic materials with authentic car mechanic textures and wear patterns, maintain exact proportions with believable car mechanic weathering. For FOOD: Present authentic car mechanic cuisine with realistic car mechanic textures and wear patterns, maintain natural car mechanic food physics. For ANIMALS: Add realistic car mechanic animals with authentic car mechanic textures and wear patterns, maintain anatomically correct features with believable car mechanic environment interactions. CRITICAL: Must look like an actual car mechanic photograph taken with professional equipment, with authentic car mechanic lighting, realistic car mechanic conditions, and perfect car mechanic photography quality.",
  },
  {
    id: "apocalypse",
    name: "Apocalypse",
    description: "Post-apocalyptic survival",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with post-apocalyptic survival aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistically weathered clothing with authentic wear patterns, genuine survival gear with realistic usage marks, maintain exact facial features with authentic environmental weathering effects on skin. For LANDSCAPES: Transform into photorealistic wasteland scenes with accurate decay physics, realistic structural damage, authentic atmospheric conditions with proper dust and debris physics. For OBJECTS: Add realistic rust and corrosion following actual oxidation processes, authentic makeshift repairs using real materials, maintain exact proportions with believable weathering. For FOOD: Present as realistic survival rations with authentic packaging wear, accurate preservation methods, maintain natural food textures under harsh conditions. For ANIMALS: Add realistic survival adaptations following evolutionary biology, authentic environmental weathering on fur/skin, maintain anatomically correct features. CRITICAL: Must look like an actual documentary photograph of real post-disaster conditions, with authentic weathering, realistic decay processes, and believable survival scenarios. Perfect disaster photography realism.",
  },
  {
    id: "tropical",
    name: "Tropical",
    description: "Tropical paradise",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with vibrant tropical paradise aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic tropical clothing with realistic fabric textures, genuine flower leis with natural plant details, maintain exact facial features with realistic tropical lighting and natural skin tones. For LANDSCAPES: Transform into photorealistic tropical scenes with botanically accurate palm trees, authentic beach geology, crystal-clear water with realistic refraction and reflection physics. For OBJECTS: Add authentic tropical materials with realistic bamboo grain, natural island craftsmanship details, maintain exact proportions with believable tropical weathering. For FOOD: Present authentic tropical cuisine with realistic exotic fruit textures, natural coconut materials, maintain accurate food physics and moisture. For ANIMALS: Add tropical species with anatomically correct features, realistic plumage and fur textures, authentic tropical environment interactions. CRITICAL: Must look like an actual tropical vacation photograph taken with professional equipment, with authentic natural lighting, realistic tropical conditions, and perfect beach photography quality. No artificial or enhanced effects.",
  },
  {
    id: "winter",
    name: "Winter",
    description: "Winter wonderland",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with serene winter wonderland aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic winter clothing with realistic fabric textures and insulation details, natural cold-weather effects on skin like rosy cheeks, maintain exact facial features with realistic winter lighting conditions. For LANDSCAPES: Transform into photorealistic snowy scenes with accurate snow physics, realistic ice formation, authentic frost patterns following natural crystallization, maintain proper winter atmospheric conditions. For OBJECTS: Add realistic snow accumulation following natural physics, authentic frost effects with accurate ice crystal formation, maintain exact proportions with believable winter weathering. For FOOD: Present authentic winter comfort food with realistic steam effects, natural hot food physics, maintain accurate food textures in cold conditions. For ANIMALS: Add realistic winter fur thickness following natural adaptation, authentic snow interaction, maintain anatomically correct features with believable cold-weather behavior. CRITICAL: Must look like an actual winter landscape photograph taken in real snow conditions, with authentic winter lighting, realistic snow physics, and perfect cold-weather photography quality.",
  },
  {
    id: "fairy_tale",
    name: "Fairy Tale",
    description: "Enchanting fairy tale",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with enchanting fairy tale magic aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic magical clothing elements with authentic fabric textures and believable fantasy construction, maintain exact facial features with realistic magical lighting effects that follow optical physics. For LANDSCAPES: Transform into photorealistic enchanted forests with botanically accurate magical plants, realistic fairy lights using authentic light sources, maintain natural forest physics with believable magical enhancements. For OBJECTS: Add realistic magical enhancements with believable sparkle effects using real light physics, maintain exact object proportions with authentic magical craftsmanship. For FOOD: Present magical feast items with realistic food textures enhanced by believable magical presentation, maintain natural food physics with enchanted styling. For ANIMALS: Add realistic fairy tale creature elements following natural biology, maintain anatomically correct features with believable magical adaptations. CRITICAL: Must look like an actual photograph of a real fairy tale movie set or fantasy theme park, with authentic magical effects created through practical means, realistic lighting, and perfect fantasy photography quality. No obvious digital effects.",
  },
  {
    id: "horror",
    name: "Horror",
    description: "Gothic horror",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with atmospheric gothic horror aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic gothic styling with realistic fabric textures and period-accurate construction, maintain exact facial features with realistic dramatic lighting that creates natural shadows and atmospheric effects. For LANDSCAPES: Transform into photorealistic gothic scenes with architecturally accurate old buildings, authentic atmospheric fog using real weather conditions, maintain natural lighting physics with dramatic enhancement. For OBJECTS: Add realistic aged textures following natural weathering processes, authentic antique patina with believable aging, maintain exact proportions with genuine historical wear. For FOOD: Present with authentic gothic presentation using period-accurate serving methods, realistic candlelit ambiance with natural flame lighting. For ANIMALS: Add realistic atmospheric enhancement with natural dramatic lighting, maintain anatomically correct animal features with believable gothic environment adaptation. CRITICAL: Must look like an actual photograph of a real gothic location or horror movie set, with authentic atmospheric conditions, realistic lighting, and perfect dramatic photography quality. Atmospheric but not frightening.",
  },
  {
    id: "desert_mirage",
    name: "Desert Mirage",
    description: "Arabian desert",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with mystical Arabian desert aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic flowing desert robes with realistic fabric physics and wind effects, genuine ornate jewelry with realistic metalwork and gem properties, maintain exact facial features with authentic desert lighting conditions. For LANDSCAPES: Transform into photorealistic vast desert scenes with geologically accurate sand dunes, realistic oasis vegetation, authentic mirage effects following optical physics. For OBJECTS: Add genuine Arabian craftsmanship with realistic metalwork and authentic patina, maintain exact proportions with believable desert weathering and sand effects. For FOOD: Present authentic Arabian cuisine with realistic spice textures, period-accurate serving methods, maintain natural food physics in desert conditions. For ANIMALS: Add realistic desert adaptations following evolutionary biology, maintain anatomically correct features with authentic Middle Eastern environment context. CRITICAL: Must look like an actual desert photograph taken in the Arabian Peninsula, with authentic desert lighting, realistic sand physics, and perfect desert photography quality.",
  },
  {
    id: "crystal_cave",
    name: "Crystal Cave",
    description: "Magical crystal cave",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with magical crystal cave aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic crystalline accessories with authentic mineral properties, genuine gem-like reflections following optical physics, maintain exact facial features with realistic prismatic lighting effects created by real crystal refraction. For LANDSCAPES: Transform into photorealistic crystal caverns with geologically accurate gem formations, authentic prismatic light effects using real crystal optics, maintain natural cave physics with believable crystal growth. For OBJECTS: Add realistic crystal growth following natural mineralogy, authentic gem-like surfaces with proper refractive properties, maintain exact proportions with believable crystalline integration. For FOOD: Present with genuine crystal serving ware, realistic prismatic effects on food surfaces, maintain natural food textures with crystalline enhancement. For ANIMALS: Add realistic crystalline effects on fur/scales following natural physics, maintain anatomically correct features with believable crystal cave adaptations. CRITICAL: Must look like an actual photograph taken inside a real crystal cave or geode, with authentic mineral formations, realistic light refraction, and perfect geological photography quality.",
  },
  {
    id: "floating_islands",
    name: "Floating Islands",
    description: "Ethereal floating islands",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with ethereal floating islands aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic flowing clothing with authentic fabric physics in low gravity, maintain exact facial features with believable aerial lighting conditions and natural wind effects. For LANDSCAPES: Transform into photorealistic floating island scenes with geologically accurate suspended terrain, realistic cloud formations with authentic atmospheric physics, maintain natural lighting with believable aerial perspective. For OBJECTS: Add realistic levitation effects following believable physics, authentic cloud integration with natural vapor properties, maintain exact proportions with credible aerial suspension. For FOOD: Present with realistic weightless presentation following actual zero-gravity physics, maintain natural food textures in aerial conditions. For ANIMALS: Add believable wing adaptations following aerodynamic principles, maintain anatomically correct features with realistic flight physics and aerial behavior. CRITICAL: Must look like an actual photograph of a real floating landscape or aerial photography with practical effects, with authentic atmospheric conditions, realistic physics, and perfect aerial photography quality.",
  },
  {
    id: "time_machine",
    name: "Time Machine",
    description: "Temporal fusion",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with temporal fusion aesthetics blending multiple eras. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic mixed-era clothing with authentic fabric textures from different time periods, maintain exact facial features with believable temporal lighting effects that blend different era photography styles. For LANDSCAPES: Transform into photorealistic scenes blending different historical periods with architecturally accurate buildings from various eras, maintain natural lighting physics with believable temporal overlay. For OBJECTS: Add authentic era-blending design with realistic materials from different time periods, maintain exact proportions with believable temporal wear patterns showing multiple historical influences. For FOOD: Present with realistic mixed-era presentation combining authentic historical serving methods, maintain natural food textures with believable temporal fusion styling. For ANIMALS: Add realistic temporal adaptations showing believable evolutionary variations, maintain anatomically correct features with authentic multi-era environmental context. CRITICAL: Must look like an actual photograph where different time periods have been seamlessly blended using practical effects, with authentic historical materials, realistic temporal physics, and perfect multi-era photography quality.",
  },
  {
    id: "samurai",
    name: "Samurai",
    description: "Samurai warrior",
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with samurai warrior aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic samurai clothing with authentic fabric textures and wear patterns, maintain exact facial features with realistic samurai lighting and natural skin tones. For LANDSCAPES: Transform into photorealistic samurai scenes with authentic samurai buildings and environments, maintain natural samurai lighting physics and atmospheric perspective. For OBJECTS: Add realistic samurai materials with authentic samurai textures and wear patterns, maintain exact proportions with believable samurai weathering. For FOOD: Present authentic samurai cuisine with realistic samurai textures and wear patterns, maintain natural samurai food physics. For ANIMALS: Add realistic samurai animals with authentic samurai textures and wear patterns, maintain anatomically correct features with believable samurai environment interactions. CRITICAL: Must look like an actual samurai warrior photograph taken with professional equipment, with authentic samurai lighting, realistic samurai conditions, and perfect samurai photography quality.",
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

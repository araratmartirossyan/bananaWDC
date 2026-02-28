import { type NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { rateLimiter, getClientIP } from "@/lib/rate-limiter";

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
});

const filterConfigs = {
  acid: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with psychedelic acid trip aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Apply flowing tie-dye patterns to clothing with photorealistic fabric textures, rainbow color shifts in hair maintaining natural hair physics, kaleidoscope reflections in eyes with anatomically correct eye structure, preserve exact facial features and natural skin textures while adding subtle color morphing effects that look like real light refraction. For LANDSCAPES: Transform sky into swirling rainbow patterns with realistic cloud formations, add flowing color waves across terrain maintaining geological accuracy, create fractal patterns in trees/mountains with photorealistic bark and rock textures, preserve natural lighting physics and atmospheric perspective. For OBJECTS: Add rainbow color shifts with realistic material properties, create kaleidoscope reflections following real optical laws, maintain exact object proportions and surface textures. For FOOD: Add colorful swirling patterns while preserving realistic food textures, moisture, and natural food physics. For ANIMALS: Add colorful fur/feather patterns with anatomically correct animal features, realistic fur/feather physics. CRITICAL: Maintain photorealistic lighting, shadows, reflections, and material properties. Result must look like a real photograph taken with professional camera equipment, not digital art or illustration.",
  },
  vintage: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with authentic 1970s vintage aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add period-accurate vintage clothing with realistic fabric wear, authentic 1970s hairstyles with natural hair physics, maintain exact facial features and skin textures with realistic film grain overlay, preserve natural body proportions and lighting. For LANDSCAPES: Apply warm golden hour lighting with realistic sun positioning, vintage color grading using authentic film stock characteristics, add realistic film grain texture, maintain accurate atmospheric perspective and natural lighting physics. For OBJECTS: Add authentic aged textures with realistic wear patterns, vintage patina following real oxidation processes, maintain exact object proportions and material properties. For FOOD: Present with period-accurate serving ware, realistic food textures and moisture, authentic vintage photography lighting. For ANIMALS: Maintain anatomically correct animal features with realistic fur/feather textures, natural animal behavior and positioning. CRITICAL: Must look like an actual vintage photograph from the 1970s shot on film, with authentic grain structure, color characteristics, and lighting conditions. No digital art or illustration effects.",
  },
  cyberpunk: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with futuristic cyberpunk aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic LED accents to clothing with authentic light emission and reflection, cybernetic enhancements that look like real prosthetics, holographic elements with realistic light refraction, maintain exact facial features and natural skin textures with realistic lighting interaction. For LANDSCAPES: Transform into photorealistic neon-lit cityscapes with accurate architectural perspective, realistic LED lighting physics, authentic urban atmosphere and lighting conditions. For OBJECTS: Add realistic LED strips with proper light emission, holographic displays following real optical physics, metallic chrome finishes with accurate reflection properties, maintain exact object proportions. For FOOD: Present with realistic futuristic serving methods, authentic neon lighting effects on food surfaces, maintain natural food textures and physics. For ANIMALS: Add subtle cybernetic enhancements that look like real implants, maintain anatomically correct animal features with realistic fur/skin textures. CRITICAL: Must look like a real photograph taken in an actual cyberpunk environment, with authentic lighting physics, material properties, and atmospheric conditions. No cartoon or digital art effects.",
  },
  underwater: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with immersive underwater aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic underwater hair and clothing physics with natural buoyancy, authentic bubble formation and light refraction, maintain exact facial features with realistic underwater lighting effects on skin. For LANDSCAPES: Transform into photorealistic underwater scenes with accurate water physics, realistic coral formations, authentic marine life, proper underwater light filtering and caustic patterns. For OBJECTS: Add realistic coral growth following natural patterns, authentic seaweed attachment, accurate water distortion effects based on real optics, maintain exact object proportions. For FOOD: Present with realistic underwater physics, authentic bubble effects, maintain natural food textures as they would appear underwater. For ANIMALS: Add realistic swimming motion with accurate hydrodynamics, authentic bubble trails, maintain anatomically correct features with realistic underwater adaptations. CRITICAL: Must look like an actual underwater photograph taken with professional diving equipment, with authentic water physics, light refraction, and marine environment conditions. Perfect underwater photography realism.",
  },
  space: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with authentic NASA space mission aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Transform into authentic astronauts wearing photorealistic NASA EMU (Extravehicular Mobility Unit) space suits with accurate white thermal micrometeoroid garment, realistic gold-tinted helmet visors reflecting Earth and stars, authentic NASA mission patches (Apollo, Artemis, ISS), genuine life support backpack (PLSS) with realistic tubes and connections, accurate space gloves with fingertip lights, realistic communication headset visible inside helmet, authentic NASA name tags and flag patches. Add realistic space suit physics with proper pressurization appearance, authentic fabric textures and wear patterns from actual space missions. For LANDSCAPES: Transform into photorealistic International Space Station interior with accurate control panels, authentic NASA equipment, realistic floating objects in zero gravity, genuine Earth view through cupola windows showing accurate continental geography, realistic LED lighting systems, authentic cable management and handholds. Or create realistic lunar surface with accurate regolith texture, authentic lunar module components, realistic Earth rising over lunar horizon with correct astronomical positioning, genuine NASA equipment scattered realistically. For OBJECTS: Transform into authentic NASA space equipment with realistic materials - titanium, aluminum, Kevlar textures, accurate mission control interfaces, genuine space food packaging, realistic scientific instruments with authentic NASA branding and serial numbers. CRITICAL: Must look like actual NASA mission photography from ISS, Apollo, or Artemis programs. Use authentic space agency aesthetics, realistic zero-gravity physics, accurate astronomical lighting, and genuine NASA equipment details. Perfect space documentary photography quality with authentic mission patch integration and realistic space suit weathering from actual EVA use.",
  },
  medieval: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with authentic medieval fantasy aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add period-accurate clothing with realistic fabric textures and wear patterns, authentic medieval craftsmanship details, maintain exact facial features with realistic candlelit skin tones and shadows. For LANDSCAPES: Transform into photorealistic medieval settings with architecturally accurate castles, authentic stone construction techniques, realistic medieval landscape features with proper atmospheric perspective. For OBJECTS: Add authentic medieval craftsmanship with realistic metalwork, accurate aging and patina, hand-forged details that follow historical accuracy, maintain exact proportions. For FOOD: Present with historically accurate serving methods, realistic medieval food preparation, authentic wooden and ceramic textures. For ANIMALS: Add period-appropriate accessories with realistic leather and metal work, maintain anatomically correct animal features with authentic medieval context. CRITICAL: Must look like an actual photograph of a real medieval reenactment or historical site, with authentic materials, lighting, and historical accuracy. Perfect historical photography realism.",
  },
  apocalypse: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with post-apocalyptic survival aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistically weathered clothing with authentic wear patterns, genuine survival gear with realistic usage marks, maintain exact facial features with authentic environmental weathering effects on skin. For LANDSCAPES: Transform into photorealistic wasteland scenes with accurate decay physics, realistic structural damage, authentic atmospheric conditions with proper dust and debris physics. For OBJECTS: Add realistic rust and corrosion following actual oxidation processes, authentic makeshift repairs using real materials, maintain exact proportions with believable weathering. For FOOD: Present as realistic survival rations with authentic packaging wear, accurate preservation methods, maintain natural food textures under harsh conditions. For ANIMALS: Add realistic survival adaptations following evolutionary biology, authentic environmental weathering on fur/skin, maintain anatomically correct features. CRITICAL: Must look like an actual documentary photograph of real post-disaster conditions, with authentic weathering, realistic decay processes, and believable survival scenarios. Perfect disaster photography realism.",
  },
  steampunk: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Victorian steampunk aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic brass goggles with realistic metal patina, genuine leather accessories with natural wear, period-accurate Victorian clothing with realistic fabric textures, maintain exact facial features with authentic Victorian-era lighting. For LANDSCAPES: Transform into photorealistic industrial Victorian scenes with architecturally accurate steam machinery, authentic brass and iron construction, realistic steam effects with proper physics. For OBJECTS: Add genuine brass fittings with realistic oxidation, authentic steam mechanisms following real engineering principles, accurate clockwork gears with proper mechanical function, maintain exact proportions. For FOOD: Present with authentic Victorian serving ware, realistic steam effects on hot foods, period-accurate presentation methods. For ANIMALS: Add realistic mechanical accessories with authentic craftsmanship, maintain anatomically correct animal features with believable steampunk integration. CRITICAL: Must look like an actual photograph of real Victorian-era industrial equipment and fashion, with authentic materials, realistic mechanical function, and historical accuracy. Perfect Victorian photography realism.",
  },
  tropical: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with vibrant tropical paradise aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic tropical clothing with realistic fabric textures, genuine flower leis with natural plant details, maintain exact facial features with realistic tropical lighting and natural skin tones. For LANDSCAPES: Transform into photorealistic tropical scenes with botanically accurate palm trees, authentic beach geology, crystal-clear water with realistic refraction and reflection physics. For OBJECTS: Add authentic tropical materials with realistic bamboo grain, natural island craftsmanship details, maintain exact proportions with believable tropical weathering. For FOOD: Present authentic tropical cuisine with realistic exotic fruit textures, natural coconut materials, maintain accurate food physics and moisture. For ANIMALS: Add tropical species with anatomically correct features, realistic plumage and fur textures, authentic tropical environment interactions. CRITICAL: Must look like an actual tropical vacation photograph taken with professional equipment, with authentic natural lighting, realistic tropical conditions, and perfect beach photography quality. No artificial or enhanced effects.",
  },
  winter: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with serene winter wonderland aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic winter clothing with realistic fabric textures and insulation details, natural cold-weather effects on skin like rosy cheeks, maintain exact facial features with realistic winter lighting conditions. For LANDSCAPES: Transform into photorealistic snowy scenes with accurate snow physics, realistic ice formation, authentic frost patterns following natural crystallization, maintain proper winter atmospheric conditions. For OBJECTS: Add realistic snow accumulation following natural physics, authentic frost effects with accurate ice crystal formation, maintain exact proportions with believable winter weathering. For FOOD: Present authentic winter comfort food with realistic steam effects, natural hot food physics, maintain accurate food textures in cold conditions. For ANIMALS: Add realistic winter fur thickness following natural adaptation, authentic snow interaction, maintain anatomically correct features with believable cold-weather behavior. CRITICAL: Must look like an actual winter landscape photograph taken in real snow conditions, with authentic winter lighting, realistic snow physics, and perfect cold-weather photography quality.",
  },
  neon_tokyo: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with vibrant Tokyo street night aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic Japanese street fashion with realistic fabric textures, genuine neon light reflections on clothing following optical physics, maintain exact facial features with realistic urban night lighting. For LANDSCAPES: Transform into photorealistic neon-lit Tokyo streets with architecturally accurate Japanese buildings, authentic kanji signage, realistic urban density and perspective. For OBJECTS: Add authentic Japanese design elements with realistic materials, genuine neon lighting effects with proper light emission, maintain exact proportions with believable urban wear. For FOOD: Present authentic Japanese street food with realistic textures, genuine food stall lighting, maintain accurate food physics and presentation. For ANIMALS: Add realistic urban adaptation features, authentic city lighting effects on fur/feathers, maintain anatomically correct animal characteristics. CRITICAL: Must look like an actual night street photograph taken in Tokyo with professional camera equipment, with authentic neon lighting physics, realistic urban atmosphere, and perfect street photography quality. No artificial enhancement effects.",
  },
  wild_west: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with authentic Wild West frontier aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add period-accurate cowboy attire with realistic leather textures and authentic wear patterns, maintain exact facial features with realistic desert lighting and natural weathering effects. For LANDSCAPES: Transform into photorealistic desert frontier scenes with geologically accurate formations, authentic American Southwest vegetation, realistic atmospheric perspective and desert lighting conditions. For OBJECTS: Add authentic frontier materials with realistic wood grain and metal patina, genuine leather work with natural aging, maintain exact proportions with believable frontier craftsmanship. For FOOD: Present authentic frontier cuisine with realistic campfire cooking effects, period-accurate preparation methods, maintain natural food textures under frontier conditions. For ANIMALS: Add realistic Western context with authentic horse tack and cattle features, maintain anatomically correct animal characteristics with believable frontier environment adaptation. CRITICAL: Must look like an actual historical Wild West photograph or modern Western reenactment, with authentic period materials, realistic desert conditions, and perfect frontier photography quality.",
  },
  art_deco: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with elegant 1920s Art Deco aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic 1920s fashion with realistic fabric textures and period-accurate construction, genuine geometric jewelry with realistic metal and gem properties, maintain exact facial features with authentic Jazz Age lighting and makeup styles. For LANDSCAPES: Transform into photorealistic Art Deco cityscapes with architecturally accurate 1920s buildings, authentic geometric design elements, realistic urban lighting and atmospheric conditions. For OBJECTS: Add genuine geometric patterns with realistic material execution, authentic gold accents with proper metallic properties, maintain exact proportions with believable 1920s craftsmanship. For FOOD: Present with authentic 1920s presentation using period-accurate serving ware, realistic geometric plating, maintain natural food textures with elegant styling. For ANIMALS: Add realistic Art Deco styling context with authentic 1920s luxury environment, maintain anatomically correct animal features. CRITICAL: Must look like an actual 1920s photograph or modern Art Deco recreation, with authentic period materials, realistic luxury finishes, and perfect Jazz Age photography quality.",
  },
  fairy_tale: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with enchanting fairy tale magic aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic magical clothing elements with authentic fabric textures and believable fantasy construction, maintain exact facial features with realistic magical lighting effects that follow optical physics. For LANDSCAPES: Transform into photorealistic enchanted forests with botanically accurate magical plants, realistic fairy lights using authentic light sources, maintain natural forest physics with believable magical enhancements. For OBJECTS: Add realistic magical enhancements with believable sparkle effects using real light physics, maintain exact object proportions with authentic magical craftsmanship. For FOOD: Present magical feast items with realistic food textures enhanced by believable magical presentation, maintain natural food physics with enchanted styling. For ANIMALS: Add realistic fairy tale creature elements following natural biology, maintain anatomically correct features with believable magical adaptations. CRITICAL: Must look like an actual photograph of a real fairy tale movie set or fantasy theme park, with authentic magical effects created through practical means, realistic lighting, and perfect fantasy photography quality. No obvious digital effects.",
  },
  horror: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with atmospheric gothic horror aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic gothic styling with realistic fabric textures and period-accurate construction, maintain exact facial features with realistic dramatic lighting that creates natural shadows and atmospheric effects. For LANDSCAPES: Transform into photorealistic gothic scenes with architecturally accurate old buildings, authentic atmospheric fog using real weather conditions, maintain natural lighting physics with dramatic enhancement. For OBJECTS: Add realistic aged textures following natural weathering processes, authentic antique patina with believable aging, maintain exact proportions with genuine historical wear. For FOOD: Present with authentic gothic presentation using period-accurate serving methods, realistic candlelit ambiance with natural flame lighting. For ANIMALS: Add realistic atmospheric enhancement with natural dramatic lighting, maintain anatomically correct animal features with believable gothic environment adaptation. CRITICAL: Must look like an actual photograph of a real gothic location or horror movie set, with authentic atmospheric conditions, realistic lighting, and perfect dramatic photography quality. Atmospheric but not frightening.",
  },
  desert_mirage: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with mystical Arabian desert aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic flowing desert robes with realistic fabric physics and wind effects, genuine ornate jewelry with realistic metalwork and gem properties, maintain exact facial features with authentic desert lighting conditions. For LANDSCAPES: Transform into photorealistic vast desert scenes with geologically accurate sand dunes, realistic oasis vegetation, authentic mirage effects following optical physics. For OBJECTS: Add genuine Arabian craftsmanship with realistic metalwork and authentic patina, maintain exact proportions with believable desert weathering and sand effects. For FOOD: Present authentic Arabian cuisine with realistic spice textures, period-accurate serving methods, maintain natural food physics in desert conditions. For ANIMALS: Add realistic desert adaptations following evolutionary biology, maintain anatomically correct features with authentic Middle Eastern environment context. CRITICAL: Must look like an actual desert photograph taken in the Arabian Peninsula, with authentic desert lighting, realistic sand physics, and perfect desert photography quality.",
  },
  crystal_cave: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with magical crystal cave aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic crystalline accessories with authentic mineral properties, genuine gem-like reflections following optical physics, maintain exact facial features with realistic prismatic lighting effects created by real crystal refraction. For LANDSCAPES: Transform into photorealistic crystal caverns with geologically accurate gem formations, authentic prismatic light effects using real crystal optics, maintain natural cave physics with believable crystal growth. For OBJECTS: Add realistic crystal growth following natural mineralogy, authentic gem-like surfaces with proper refractive properties, maintain exact proportions with believable crystalline integration. For FOOD: Present with genuine crystal serving ware, realistic prismatic effects on food surfaces, maintain natural food textures with crystalline enhancement. For ANIMALS: Add realistic crystalline effects on fur/scales following natural physics, maintain anatomically correct features with believable crystal cave adaptations. CRITICAL: Must look like an actual photograph taken inside a real crystal cave or geode, with authentic mineral formations, realistic light refraction, and perfect geological photography quality.",
  },
  floating_islands: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with ethereal floating islands aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic flowing clothing with authentic fabric physics in low gravity, maintain exact facial features with believable aerial lighting conditions and natural wind effects. For LANDSCAPES: Transform into photorealistic floating island scenes with geologically accurate suspended terrain, realistic cloud formations with authentic atmospheric physics, maintain natural lighting with believable aerial perspective. For OBJECTS: Add realistic levitation effects following believable physics, authentic cloud integration with natural vapor properties, maintain exact proportions with credible aerial suspension. For FOOD: Present with realistic weightless presentation following actual zero-gravity physics, maintain natural food textures in aerial conditions. For ANIMALS: Add believable wing adaptations following aerodynamic principles, maintain anatomically correct features with realistic flight physics and aerial behavior. CRITICAL: Must look like an actual photograph of a real floating landscape or aerial photography with practical effects, with authentic atmospheric conditions, realistic physics, and perfect aerial photography quality.",
  },
  time_machine: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with temporal fusion aesthetics blending multiple eras. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic mixed-era clothing with authentic fabric textures from different time periods, maintain exact facial features with believable temporal lighting effects that blend different era photography styles. For LANDSCAPES: Transform into photorealistic scenes blending different historical periods with architecturally accurate buildings from various eras, maintain natural lighting physics with believable temporal overlay. For OBJECTS: Add authentic era-blending design with realistic materials from different time periods, maintain exact proportions with believable temporal wear patterns showing multiple historical influences. For FOOD: Present with realistic mixed-era presentation combining authentic historical serving methods, maintain natural food textures with believable temporal fusion styling. For ANIMALS: Add realistic temporal adaptations showing believable evolutionary variations, maintain anatomically correct features with authentic multi-era environmental context. CRITICAL: Must look like an actual photograph where different time periods have been seamlessly blended using practical effects, with authentic historical materials, realistic temporal physics, and perfect multi-era photography quality.",
  },
  spy: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with sophisticated secret agent aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic spy attire with realistic tailored suits, genuine leather accessories, professional spy gadgets with realistic materials, maintain exact facial features with dramatic film noir lighting and natural shadows. For LANDSCAPES: Transform into photorealistic spy environments with architecturally accurate luxury locations, authentic urban nighttime settings, realistic casino interiors with proper lighting and atmosphere. For OBJECTS: Add genuine spy equipment with realistic materials and authentic functionality, maintain exact proportions with believable high-tech integration. For FOOD: Present with sophisticated presentation using authentic luxury serving methods, realistic martini glasses and elegant dining settings. For ANIMALS: Add realistic spy context with authentic luxury environment, maintain anatomically correct animal features. CRITICAL: Must look like an actual photograph from a real spy thriller movie set or luxury location, with authentic materials, realistic dramatic lighting, and perfect cinematic photography quality.",
  },
  gothic: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with elegant gothic romance aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic Victorian gothic clothing with realistic fabric textures and period-accurate construction, genuine ornate jewelry with realistic metalwork, maintain exact facial features with dramatic candlelit lighting and natural shadows. For LANDSCAPES: Transform into photorealistic gothic architecture with historically accurate cathedral details, authentic stone construction, realistic atmospheric fog and dramatic lighting conditions. For OBJECTS: Add genuine gothic craftsmanship with realistic metalwork and authentic aging, maintain exact proportions with believable historical wear patterns. For FOOD: Present with authentic gothic presentation using period-accurate serving methods, realistic candlelit ambiance with natural flame lighting. For ANIMALS: Add realistic gothic environment context with authentic historical setting, maintain anatomically correct animal features. CRITICAL: Must look like an actual photograph of a real gothic cathedral or Victorian mansion, with authentic historical materials, realistic atmospheric conditions, and perfect gothic photography quality.",
  },
  "90s": {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with authentic 1990s nostalgia aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add genuine 90s fashion with realistic fabric textures and period-accurate styling, authentic accessories like chokers and platform shoes, maintain exact facial features with realistic 90s photography lighting and film grain. For LANDSCAPES: Transform into photorealistic 90s environments with architecturally accurate mall aesthetics, authentic neon lighting, realistic arcade settings with period-correct technology. For OBJECTS: Add authentic 90s design elements with realistic materials and genuine retro technology, maintain exact proportions with believable 90s wear patterns. For FOOD: Present with authentic 90s presentation using period-accurate packaging and serving methods, realistic fast food aesthetics. For ANIMALS: Add realistic 90s context with authentic decade environment, maintain anatomically correct animal features. CRITICAL: Must look like an actual photograph taken in the 1990s with period camera equipment, with authentic 90s materials, realistic film photography quality, and perfect decade-specific atmosphere.",
  },
  disco: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with vibrant 1970s disco fever aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add authentic disco fashion with realistic sequined fabrics and metallic textures, genuine platform shoes and bell-bottom pants, maintain exact facial features with realistic disco ball lighting and colorful reflections. For LANDSCAPES: Transform into photorealistic disco club environments with authentic mirror ball effects, realistic dance floor lighting, genuine 70s interior design with period-accurate materials. For OBJECTS: Add authentic disco elements with realistic mirror ball reflections, genuine vinyl records and period-correct audio equipment, maintain exact proportions with believable 70s craftsmanship. For FOOD: Present with authentic 70s presentation using period-accurate serving methods, realistic cocktail presentations with disco lighting effects. For ANIMALS: Add realistic disco context with authentic 70s party environment, maintain anatomically correct animal features. CRITICAL: Must look like an actual photograph taken at a real 1970s disco club, with authentic period materials, realistic disco lighting physics, and perfect 70s party photography quality.",
  },
  samurai: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with samurai warrior aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic samurai clothing with authentic fabric textures and wear patterns, maintain exact facial features with realistic samurai lighting and natural skin tones. For LANDSCAPES: Transform into photorealistic samurai scenes with authentic samurai buildings and environments, maintain natural samurai lighting physics and atmospheric perspective. For OBJECTS: Add realistic samurai materials with authentic samurai textures and wear patterns, maintain exact proportions with believable samurai weathering. For FOOD: Present authentic samurai cuisine with realistic samurai textures and wear patterns, maintain natural samurai food physics. For ANIMALS: Add realistic samurai animals with authentic samurai textures and wear patterns, maintain anatomically correct features with believable samurai environment interactions. CRITICAL: Must look like an actual samurai warrior photograph taken with professional equipment, with authentic samurai lighting, realistic samurai conditions, and perfect samurai photography quality.",
  },
  gta: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Grand Theft Auto aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic GTA clothing with authentic fabric textures and wear patterns, maintain exact facial features with realistic GTA lighting and natural skin tones. For LANDSCAPES: Transform into photorealistic GTA scenes with authentic GTA buildings and environments, maintain natural GTA lighting physics and atmospheric perspective. For OBJECTS: Add realistic GTA materials with authentic GTA textures and wear patterns, maintain exact proportions with believable GTA weathering. For FOOD: Present authentic GTA cuisine with realistic GTA textures and wear patterns, maintain natural GTA food physics. For ANIMALS: Add realistic GTA animals with authentic GTA textures and wear patterns, maintain anatomically correct features with believable GTA environment interactions. CRITICAL: Must look like an actual GTA photograph taken with professional equipment, with authentic GTA lighting, realistic GTA conditions, and perfect GTA photography quality.",
  },
  car_mechanic: {
    prompt:
      "Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with car mechanic aesthetics. ULTRA-REALISTIC DETAILS: For PEOPLE: Add realistic car mechanic clothing with authentic fabric textures and wear patterns, maintain exact facial features with realistic car mechanic lighting and natural skin tones. For LANDSCAPES: Transform into photorealistic car mechanic scenes with authentic car mechanic buildings and environments, maintain natural car mechanic lighting physics and atmospheric perspective. For OBJECTS: Add realistic car mechanic materials with authentic car mechanic textures and wear patterns, maintain exact proportions with believable car mechanic weathering. For FOOD: Present authentic car mechanic cuisine with realistic car mechanic textures and wear patterns, maintain natural car mechanic food physics. For ANIMALS: Add realistic car mechanic animals with authentic car mechanic textures and wear patterns, maintain anatomically correct features with believable car mechanic environment interactions. CRITICAL: Must look like an actual car mechanic photograph taken with professional equipment, with authentic car mechanic lighting, realistic car mechanic conditions, and perfect car mechanic photography quality.",
  },
  matsuri: {
    prompt: `
    Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Japanese Matsuri aesthetics.
ULTRA-REALISTIC DETAILS:

For PEOPLE: Add authentic festival clothing (yukata, happi coats, traditional masks, paper fans), maintain exact facial features with warm lantern lighting and natural Japanese summer skin tones.

For LANDSCAPES: Transform into photorealistic festival settings (shrine gates, food stalls, fireworks, lantern-lined streets), maintain natural Matsuri lighting physics with glowing reds, yellows, and flickering firelight.

For OBJECTS: Add authentic Matsuri items (paper lanterns, taiko drums, festival floats, masks, calligraphy banners) with realistic textures and festival wear.

For FOOD: Present authentic festival cuisine (takoyaki, yakitori, taiyaki, cotton candy, shaved ice) with realistic textures, warm plating, and natural steam or smoke.

For ANIMALS: Add realistic Japanese animals in a festival context (goldfish in bowls, festival horses, owls perched near shrines) with believable lighting and interactions.

CRITICAL: Must look like an actual Japanese Matsuri photograph with authentic lantern light, festival atmosphere, and perfect photorealistic quality.
    `,
  },
  viking: {
    prompt: `
      Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Viking Age aesthetics.
ULTRA-REALISTIC DETAILS:

For PEOPLE: Add authentic Viking clothing (woolen tunics, fur cloaks, leather belts, iron chainmail, horned-less helmets, braided hair, detailed jewelry of bronze and silver), maintain exact facial features with realistic Northern lighting (cold daylight, firelit interiors) and natural rugged skin tones shaped by harsh climates.

For LANDSCAPES: Transform into photorealistic Viking environments (fjords, wooden longhouses, icy seas, snow-dusted forests, stone rune monuments), maintain natural Nordic lighting physics with low-angle sunlight, fog, and dramatic weather.

For OBJECTS: Add authentic Viking artifacts (longswords, axes, round shields with painted patterns, drinking horns, carved wooden ships), maintain exact proportions with believable wear, rust, wood grain, and battle scars.

For FOOD: Present authentic Viking cuisine (smoked fish, roasted meats, bread, mead in wooden cups, berries, cheese) with rustic textures, wooden tableware, and firelit presentation.

For ANIMALS: Add realistic Viking Age animals (ravens, wolves, horses, longship-dragons, hunting dogs) with authentic textures, natural fur details, and believable interaction with the Viking environment.

CRITICAL: Must look like an actual Viking Age photograph as if captured in the 9th century with professional equipment, featuring authentic Nordic lighting, natural weathered textures, and perfect historical photographic quality.
    `,
  },
  roman: {
    prompt: `
      Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Ancient Roman aesthetics.
ULTRA-REALISTIC DETAILS:

For PEOPLE: Add authentic Roman clothing (togas with colored trims, tunics, leather armor, helmets, sandals, senator’s robes), maintain exact facial features with realistic Roman lighting (sunlight with strong shadows, torch-lit interiors) and natural Mediterranean skin tones.

For LANDSCAPES: Transform into photorealistic Roman environments (Colosseum, aqueducts, Roman baths, bustling forums, cobblestone streets), maintain natural Roman lighting physics with atmospheric depth and urban realism.

For OBJECTS: Add authentic Roman artifacts (gladius swords, shields, scrolls, wax tablets, mosaics, marble statues), maintain exact proportions with believable weathering, scratches, and patina.

For FOOD: Present authentic Roman cuisine (platters of bread, cheese, roasted meats, garum-seasoned fish, fruits, wine in goblets) with hyper-real textures, warm candlelight, and rustic presentation.

For ANIMALS: Add realistic Roman animals (horses pulling chariots, lions for arenas, eagles, dogs) with authentic textures and natural integration into Roman life.

CRITICAL: Must look like an actual Ancient Roman photograph as if captured during the height of the empire with professional equipment, featuring authentic Roman lighting, textures of marble and bronze, and perfect historical photographic quality.
    `,
  },
  greek: {
    prompt: `
      Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Ancient Greek aesthetics.
        ULTRA-REALISTIC DETAILS:

        For PEOPLE: Add authentic Greek clothing (white linen chitons, togas, laurel crowns, bronze armor, leather sandals), maintain exact facial features with realistic Mediterranean lighting and natural skin tones inspired by marble statues brought to life.

        For LANDSCAPES: Transform into photorealistic Greek environments (marble temples, olive groves, amphitheaters, sunlit coastlines, Aegean seascapes), maintain authentic Mediterranean lighting physics with deep blue skies and atmospheric clarity.

        For OBJECTS: Add authentic Greek artifacts (bronze shields, pottery with red/black-figure designs, lyres, marble columns), maintain exact proportions with believable aging, patina, and weathering.

        For FOOD: Present authentic Greek cuisine (bread, olives, grapes, figs, wine amphorae, roasted lamb, honey cakes) with realistic textures, golden sunlight, and natural presentation.

        For ANIMALS: Add realistic Greek animals (horses, goats, owls, dolphins) with authentic textures and believable interactions in Mediterranean settings.

        CRITICAL: Must look like an actual Ancient Greek photograph as if taken in antiquity with professional equipment, featuring authentic Mediterranean lighting, marble-and-bronze details, and perfect historical photographic quality.
    `,
  },
  wasen: {
    prompt: `
Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Wasen Oktoberfest aesthetics.
ULTRA-REALISTIC DETAILS:

For PEOPLE: Add authentic Oktoberfest clothing (traditional Bavarian dirndl dresses, lederhosen, rustic shirts, embroidered vests, leather belts, detailed buttons, and polished shoes), maintain exact facial features with realistic festive lighting (warm tent glow, lanterns, and neon carnival reflections) and natural skin tones.

For LANDSCAPES: Transform into photorealistic Wasen festival grounds (massive beer tents, decorated wooden facades, ferris wheels, carnival rides, Oktoberfest banners), maintain natural festive lighting physics (string lights, neon glows, candlelight) and atmospheric depth filled with cheerful crowds.

For OBJECTS: Add authentic Oktoberfest props (large beer steins with condensation, roasted pretzels with coarse salt, grilled sausages on rustic wooden plates, carnival prizes), maintain exact proportions with believable wear, shine, and texture.

For FOOD: Present traditional Oktoberfest cuisine (giant pretzels, roasted chicken, Schweinshaxe pork knuckle, bratwurst with mustard, sauerkraut, and foamy Maß beer mugs) with hyper-real textures, golden browns, and perfect festive plating.

For ANIMALS: Add realistic Oktoberfest-related animals (festive horses pulling decorated beer wagons, farm animals in folk parade scenes) with authentic textures, natural festive accessories, and believable interaction with the festival environment.

CRITICAL: Must look like an actual Wasen Oktoberfest photograph taken with professional equipment, with authentic festive lighting, lively autumn atmosphere, and perfect photorealistic festival photography quality.
    `,
  },
  matrix: {
    prompt: `
      Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Matrix aesthetics.
ULTRA-REALISTIC DETAILS:

For PEOPLE: Add authentic Matrix clothing (long coats, tactical gear, sunglasses, sleek black fabrics with subtle digital green reflections), maintain exact facial features with realistic Matrix lighting (neon glows, digital rain glimmers) and natural skin tones enhanced by cinematic grading.

For LANDSCAPES: Transform into photorealistic Matrix cityscapes (futuristic skyscrapers, digital code overlays, simulated urban decay), maintain natural Matrix physics with dramatic shadows, green-tinted atmosphere, and authentic cinematic depth.

For OBJECTS: Add Matrix-style digital materials (metal, glass, and holographic textures infused with green code), maintain exact proportions with believable simulated wear, distortion, or “glitching.”

For FOOD: Present simulated Matrix cuisine with hyper-real textures, slightly uncanny patterns of digital code, maintain realistic Matrix “simulation” physics and plating.

For ANIMALS: Add Matrix-inspired animals (anomalous cats, digital ravens, code-fragmented dogs) with authentic Matrix textures, subtle glitch patterns, anatomically correct features yet slightly uncanny “simulation” presence.

CRITICAL: Must look like an actual Matrix photograph, as if taken within the simulation with professional equipment, featuring authentic Matrix lighting, ultra-real digital conditions, and perfect cinematic photography quality.
    `,
  },
  burning_man: {
    prompt: `
    Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Burning Man festival aesthetics.
ULTRA-REALISTIC DETAILS:

For PEOPLE: Add authentic outfits (futuristic costumes, desert goggles, LED suits, tribal accessories, face paint), maintain exact facial features with desert lighting and natural skin tones tinted by dust.

For LANDSCAPES: Transform into photorealistic Black Rock Desert environments (dust storms, sunrise over the playa, giant art installations, neon-lit night scenes), maintain natural desert lighting physics and atmospheric haze.

For OBJECTS: Add authentic Burning Man props (bicycles decorated with LEDs, mutant vehicles, wooden structures, glowing art sculptures) with realistic textures and playa dust.

For FOOD: Present realistic festival food (communal meals, desert hydration setups, eclectic plating) with authentic textures.

For ANIMALS: Add symbolic or surreal Burning Man-inspired animals (giant wooden effigies, sculptural birds, desert insects) integrated with installations.

CRITICAL: Must look like an actual Burning Man photograph, dusty desert light, glowing neon nights, perfect photorealistic festival quality.
    `,
  },
  mad_max: {
    prompt: `
    Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Mad Max aesthetics.
      ULTRA-REALISTIC DETAILS:

      For PEOPLE: Add authentic post-apocalyptic outfits (leather armor, metal scraps, goggles, dust masks, torn fabrics), maintain exact facial features with desert lighting and weathered, scarred skin tones.

      For LANDSCAPES: Transform into photorealistic wastelands (abandoned highways, rusting vehicles, scorched deserts, improvised fortresses), maintain natural desert lighting physics with storm clouds and dust.

      For OBJECTS: Add authentic survival props (spiked cars, flamethrowers, scavenged metal, jerrycans, motorcycles) with realistic weathering, rust, and oil stains.

      For FOOD: Present survival rations (cans, makeshift grills, dried meat, scavenged grains) with gritty realism.

      For ANIMALS: Add realistic desert animals (crows, mutant dogs, camels, buzzards) integrated with the harsh environment.

      CRITICAL: Must look like an actual Mad Max world photograph with gritty desert light, rust, survival textures, and perfect cinematic photorealism.
    `,
  },
  pharaon: {
    prompt: `
    Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Pharaoh’s Egypt aesthetics.
ULTRA-REALISTIC DETAILS:

For PEOPLE: Add authentic Egyptian clothing (linen kilts, gold collars, elaborate headdresses, Pharaoh crowns, painted eye makeup), maintain exact facial features with desert lighting and natural sunlit skin tones.

For LANDSCAPES: Transform into photorealistic Egyptian settings (pyramids, Sphinx, temple columns, Nile landscapes), maintain natural desert lighting physics with sharp shadows and golden light.

For OBJECTS: Add authentic Egyptian artifacts (hieroglyph-covered stelae, golden sarcophagi, papyrus scrolls, obsidian statues) with realistic textures, gold shine, and patina.

For FOOD: Present authentic Egyptian offerings (dates, figs, bread, honey, beer in jars, roasted fish) with realistic textures and natural desert presentation.

For ANIMALS: Add realistic Egyptian animals (sacred cats, falcons, crocodiles, scarabs, camels) with authentic textures and believable interactions.

CRITICAL: Must look like an actual Pharaonic Egypt photograph, golden desert light, authentic temple textures, and perfect historical photorealistic quality.
    `,
  },
  renaissance: {
    prompt: `
      Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Renaissance Italy aesthetics.
ULTRA-REALISTIC DETAILS:

For PEOPLE: Add authentic Renaissance clothing (velvet robes, embroidered gowns, doublets, capes, ruffled collars, jewelry), maintain exact facial features with candlelight or soft Florence daylight.

For LANDSCAPES: Transform into photorealistic Renaissance settings (Florentine piazzas, Venice canals, marble palaces, workshops of painters), maintain natural Italian lighting physics with warm golden tones.

For OBJECTS: Add authentic Renaissance artifacts (oil paintings in progress, marble sculptures, ornate books, gilded chalices, musical instruments) with realistic patina and workshop details.

For FOOD: Present authentic Renaissance cuisine (bread, wine, roasted meats, olives, cheeses, fruits) with rustic wooden presentation and candlelit detail.

For ANIMALS: Add realistic Italian animals (horses, dogs, doves, pigeons in piazzas) with authentic interactions in Renaissance settings.

CRITICAL: Must look like an actual Renaissance Italy photograph, warm candlelight, marble textures, and perfect historical photorealistic quality.
    `,
  },
  napaleon: {
    prompt: `
    Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with Napoleonic French aesthetics.
ULTRA-REALISTIC DETAILS:

For PEOPLE: Add authentic Napoleonic clothing (military uniforms with epaulettes, bicorne hats, cavalry gear, elegant empire-era dresses), maintain exact facial features with battlefield or ballroom lighting and realistic skin tones.

For LANDSCAPES: Transform into photorealistic French settings (battlefields with smoke, Parisian boulevards, Versailles interiors, campaign tents), maintain natural European lighting physics with cloudy skies or chandelier glow.

For OBJECTS: Add authentic Napoleonic artifacts (sabers, cannons, muskets, maps, imperial standards, medals), maintain exact proportions with realistic wear, patina, and smoke detail.

For FOOD: Present authentic French cuisine of the era (bread, roasted meats, wine, cheese, pastries) with rustic plating and warm presentation.

For ANIMALS: Add realistic Napoleonic animals (war horses, hunting dogs, doves, crows on battlefields) with believable anatomy and integration.

CRITICAL: Must look like an actual Napoleonic France photograph, with authentic military detail, European lighting, and perfect historical photorealistic quality.
    `,
  },
  dat: {
    prompt: `
      Create a HYPER-REALISTIC, PHOTOGRAPHIC transformation with DAT corporate automotive aesthetics.
        ULTRA-REALISTIC DETAILS:

        Brand Colors:

        Primary Deep Blue: #103366

        Accent Yellow: #FFE602
        Always use Deep Blue (#103366) as the dominant corporate base (backgrounds, suits, signage) and Bright Yellow (#FFE602) as the secondary accent (icons, highlights, overlays).

        For PEOPLE: Add authentic corporate clothing (elegant suits, smart dresses, business shoes) with subtle accents in DAT brand colors. Maintain exact facial features with professional expo or office lighting and confident expressions.

        For LANDSCAPES: Transform into photorealistic DAT settings (corporate expo booths, modern offices, premium car dealerships, high-tech electric charging stations). Integrate blue and yellow branding in signage, panels, banners, and digital displays.

        For OBJECTS: Add DAT-related objects (luxury cars, electric vehicles, charging stations, digital dashboards, tablets with software interfaces). Maintain exact proportions, clean reflections, and integrate brand colors into small details (lines, UI highlights, lighting).

        For FOOD/BEVERAGE (if present): Present sleek corporate catering or coffee setups with polished textures and subtle yellow/blue details in cups, napkins, or presentation trays.

        For ANIMALS (rare/optional): If animals are included, they should be symbolic and corporate-stylized (e.g., metallic falcon sculptures, sleek silhouettes), always subtle and integrated into the business context.

        CRITICAL: Must look like an actual DAT corporate photograph, as if captured at a premium automotive expo or dealership. The image must feature:

        Authentic DAT brand colors (#103366 / #FFE602) in backgrounds, accents, or highlights.

        Luxury cars and corporate professionals in suits.

        Modern, clean lighting with high realism, sharp reflections, and perfect photographic quality.
    `,
  },
};

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimitResult = await rateLimiter.isAllowed(clientIP);

    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime || 0).toISOString();
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetTime,
          remaining: 0,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetTime,
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime! - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const { imageUrl, filter, model: requestModel } = await request.json();

    if (!imageUrl || !filter) {
      return NextResponse.json(
        { error: "Image URL and filter are required" },
        { status: 400 }
      );
    }

    const allowedModels = [
      "nano-banana",
      "nano-banana-2",
      "flux-2",
      "gemini-3.1-flash-image-preview",
      "flux-2/lora",
    ] as const;
    const model =
      requestModel && allowedModels.includes(requestModel)
        ? requestModel
        : "nano-banana";

    if (filter === "none") {
      return NextResponse.json(
        { processedImageUrl: imageUrl },
        {
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining":
              rateLimitResult.remaining?.toString() || "0",
            "X-RateLimit-Reset": new Date(
              rateLimitResult.resetTime || 0
            ).toISOString(),
          },
        }
      );
    }

    const config = filterConfigs[filter as keyof typeof filterConfigs];
    if (!config) {
      return NextResponse.json({ error: "Invalid filter" }, { status: 400 });
    }

    console.log("weDat Processing image with", model, ":", filter);
    console.log("weDat Using dramatic transformation prompt");

    const result = await fal.subscribe(`fal-ai/${model}/edit`, {
      input: {
        prompt: config.prompt,
        image_urls: [imageUrl],
        num_images: 1,
      },
    });

    console.log("weDat Nano Banana transformation result:", result);

    const processedImageUrl = result.data?.images?.[0]?.url;

    if (!processedImageUrl) {
      throw new Error("No processed image returned from Nano Banana");
    }

    console.log("weDat Returning processed image without watermark");

    return NextResponse.json(
      {
        processedImageUrl: processedImageUrl,
      },
      {
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "0",
          "X-RateLimit-Reset": new Date(
            rateLimitResult.resetTime || 0
          ).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("weDat Error with Nano Banana processing:", error);
    return NextResponse.json(
      {
        error: "Failed to process image with Nano Banana",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

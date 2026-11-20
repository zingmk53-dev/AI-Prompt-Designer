import {
  AspectRatioId,
  CampaignGoalId,
  GeneratorEngineId,
  ProductVariant,
  ReferenceAdStudy,
  ScenePreset,
  StudioConfig,
} from '../types';

export const REF_IMAGES = {
  creamSwirl: '/assets/aistudio/IMG_1343_15926930.jpeg',
  hydrationPlinth: '/assets/aistudio/IMG_1342_8e2be4b2.jpeg',
  staircasePodium: '/assets/aistudio/IMG_1340_c043214e.jpeg',
};

export const PRODUCT_VARIANTS: ProductVariant[] = [
  {
    id: 'duo',
    nameKm: 'ឈុតគូប្រណិត (Rosy Violet + Black Vanilla)',
    nameEn: 'Signature Duo Set (Rosy Violet + Black Vanilla)',
    scentNotesKm: 'ផ្កាកុលាបស្វាយស្រទន់ + វ៉ានីឡាខ្មៅប្រណិត',
    scentNotesEn: 'Velvet Rose-Violet petals paired with sensual Black Vanilla mist',
    packagingDescription:
      'two luxury 150ml matte cosmetic squeeze tubes staged together: on the left, the "ROSY VIOLET" soft blush-pink tube adorned with delicate rose-burgundy botanical floral line-art illustrations and a matching pastel pink flip-top cap; on the right, the "BLACK VANILLA" pearl-white tube featuring dreamy lavender-indigo watercolor marble strata veined with fine liquid gold foil and a matte powder-blue flip-top cap, both displaying crisp refined calligraphy branding',
    accentHex: '#9E3B5B',
    secondaryHex: '#4A5D8F',
    previewImage: REF_IMAGES.staircasePodium,
  },
  {
    id: 'rosy-violet',
    nameKm: 'Rosy Violet — ផ្កាកុលាបស្វាយ',
    nameEn: 'Rosy Violet — Botanical Floral',
    scentNotesKm: 'ផ្អែមស្រទន់ ទាក់ទាញ ស្រស់ស្រាយបែបសុភាពនារី',
    scentNotesEn: 'Soft blush rose, violet blossom, powdery silk musk',
    packagingDescription:
      'a luxury 150ml matte blush-pink perfume lotion squeeze tube ("ROSY VIOLET") decorated with intricate burgundy-rose botanical floral line-art sketches across the tube body, delicate script "Perfume Lotion" branding, and a smooth pastel-pink flip-top cap',
    accentHex: '#9E3B5B',
    secondaryHex: '#E9B9C8',
    previewImage: REF_IMAGES.creamSwirl,
  },
  {
    id: 'black-vanilla',
    nameKm: 'Black Vanilla — វ៉ានីឡាខ្មៅប្រណិត',
    nameEn: 'Black Vanilla — Marble & Gold',
    scentNotesKm: 'ក្រអូបជ្រាលជ្រៅ ប្រណិត មានមន្តស្នេហ៍ជាប់យូរ',
    scentNotesEn: 'Smoky Madagascar vanilla, iris mist, warm amber cashmere',
    packagingDescription:
      'a sleek 150ml pearl-white perfume lotion squeeze tube ("BLACK VANILLA") with flowing lavender, violet, and ice-blue watercolor marble waves across the lower half accented by delicate metallic gold veins, crisp blue-toned calligraphy branding, and a matte powder-blue flip-top cap',
    accentHex: '#4A5D8F',
    secondaryHex: '#C7D3EA',
    previewImage: REF_IMAGES.hydrationPlinth,
  },
  {
    id: 'custom',
    nameKm: 'ផ្ទុកឡើងរូបផលិតផលផ្ទាល់ខ្លួន',
    nameEn: 'Custom Product Reference Upload',
    scentNotesKm: 'ប្រើរូបផលិតផលផ្ទាល់ខ្លួនសម្រាប់ AI វិភាគ',
    scentNotesEn: 'Upload your own tube/bottle photo for tailored prompt matching',
    packagingDescription:
      'the exact uploaded luxury perfume lotion packaging preserving its authentic tube silhouette, material sheen, cap shape, color palette, and label typography cleanly',
    accentHex: '#2A1926',
    secondaryHex: '#D8CFC8',
    previewImage: REF_IMAGES.staircasePodium,
  },
];

export const GENERATOR_ENGINES: {
  id: GeneratorEngineId;
  label: string;
  noteKm: string;
  noteEn: string;
}[] = [
  {
    id: 'midjourney',
    label: 'Midjourney v6.1',
    noteKm: 'ល្អបំផុតសម្រាប់ពន្លឺ និងសាច់រូបថតប្រណិត (--ar, --style raw)',
    noteEn: 'Editorial lighting & ultra-photorealistic textures with MJ parameters',
  },
  {
    id: 'gemini-image',
    label: 'Nano Banana / Gemini',
    noteKm: 'រក្សារាងដប និងអក្សរបានច្បាស់ល្អ ពេលប្រើជាមួយរូបដើម',
    noteEn: 'High packaging fidelity & clean spatial control with reference photos',
  },
  {
    id: 'flux',
    label: 'Flux Pro',
    noteKm: 'ល្អខ្លាំងខាងសាច់ស្បែកដៃ ពន្លឺធម្មជាតិ និងសាច់គ្រីម',
    noteEn: 'Natural skin texture, hand anatomy, and crisp cosmetic speculars',
  },
  {
    id: 'ideogram',
    label: 'Ideogram 2.0',
    noteKm: 'រៀបប្លង់ Poster Facebook Ads និង Typography បានស្អាត',
    noteEn: 'Commercial poster layouts with balanced editorial typography zones',
  },
  {
    id: 'dalle',
    label: 'ChatGPT / DALL·E',
    noteKm: 'ងាយស្រួលបកស្រាយប្លង់សាច់រឿង និងពណ៌ស្រស់ថ្លា',
    noteEn: 'Rich art-directed scenes with natural descriptive paragraphs',
  },
];

export const ASPECT_RATIOS: {
  id: AspectRatioId;
  labelKm: string;
  labelEn: string;
  dims: string;
  placementKm: string;
  placementEn: string;
}[] = [
  {
    id: '4:5',
    labelKm: '4:5 Feed បញ្ឈរ',
    labelEn: '4:5 Portrait Feed',
    dims: '1080 × 1350',
    placementKm: 'ពេញនិយមបំផុតលើ Facebook Mobile Feed',
    placementEn: 'Highest screen share on Facebook mobile feed',
  },
  {
    id: '1:1',
    labelKm: '1:1 ការ៉េ',
    labelEn: '1:1 Square Feed',
    dims: '1080 × 1080',
    placementKm: 'សមសម្រាប់ Carousel & Album Ads',
    placementEn: 'Ideal for Carousel & multi-product grids',
  },
  {
    id: '9:16',
    labelKm: '9:16 Story / Reels',
    labelEn: '9:16 Story / Reels',
    dims: '1080 × 1920',
    placementKm: 'ពេញអេក្រង់ Stories និង Reels Cover',
    placementEn: 'Full-screen vertical Stories & Reels ads',
  },
  {
    id: '16:9',
    labelKm: '16:9 Banner ផ្ដេក',
    labelEn: '16:9 Landscape Banner',
    dims: '1200 × 628',
    placementKm: 'សមសម្រាប់ Cover Page & Website Hero',
    placementEn: 'Best for Facebook Page Cover & link banners',
  },
];

export const SCENE_PRESETS: ScenePreset[] = [
  {
    id: 'fooh-giant-pavilion',
    category: 'avant-garde',
    nameKm: 'FOOH 3D ដបយក្សកណ្តាលវិថីប្រណិត',
    nameEn: 'FOOH Giant Architectural Boulevard',
    subtitleKm: 'ឡូយៗខ្លាំង · ស្ទីល Viral 3D Fake-Out-Of-Home ល្បីខ្លាំងលើ FB',
    subtitleEn: 'Viral Fake-Out-Of-Home giant tubes emerging in a sunlit luxury city plaza',
    promptSnippet:
      'viral luxury FOOH (Fake Out Of Home) architectural campaign photograph: colossal towering 6-meter sculptural Sneh Perfume Lotion tubes emerging gracefully out of a sleek minimalist glass-and-limestone luxury boutique pavilion on a sunlit Parisian-inspired boulevard, thousands of real silky pink rose petals drifting through crisp morning air past the monument while stylish pedestrians admire in soft scale below, photorealistic cinema-grade daylight',
    recommendedLighting: 'morning-dew',
    recommendedProps: ['rose-petals', 'glass-prism'],
    palette: ['#EAE6E1', '#C86D8B', '#4A5D8F'],
  },
  {
    id: 'liquid-chrome-murano',
    category: 'avant-garde',
    nameKm: 'លោហៈរាវ Chrome & កញ្ចក់ផ្កា Murano',
    nameEn: 'Liquid Chrome & Murano Glass Ribbon',
    subtitleKm: 'ឡូយៗខ្លាំង · ស្ទីល Tamburins សេអ៊ូល ទំនើបកម្រិត High-Fashion',
    subtitleEn: 'Seoul avant-garde sculptural chrome waves fused with blown rose glass',
    promptSnippet:
      'avant-garde Seoul luxury fragrance editorial inspired by contemporary gallery installations: mirror-polished liquid chrome organic waves cradling the upright perfume lotion tubes, intertwined with translucent hand-blown blush-pink Murano glass ribbons refracting razor-sharp prismatic light across a cool alabaster gallery cyclorama',
    recommendedLighting: 'pearl-iridescent',
    recommendedProps: ['glass-prism', 'gold-veins'],
    palette: ['#E8ECF2', '#B76E8A', '#4D5F92'],
  },
  {
    id: 'crystal-ice-monolith',
    category: 'avant-garde',
    nameKm: 'ដុំទឹកកកគ្រីស្តាល់ & ផ្កាកកក្នុងទឹកកក',
    nameEn: 'Sculpted Crystal Ice Monolith',
    subtitleKm: 'ឡូយៗខ្លាំង · ត្រជាក់ភ្លឺឆ្លុះពន្លឺ ទាក់ទាញភ្នែក ១០០%',
    subtitleEn: 'Chiseled glacial crystal block encasing suspended roses and micro-bubbles',
    promptSnippet:
      'breathtaking high-fashion macro still life of the perfume lotion tubes poised dramatically within a freshly chiseled crystal-clear glacial ice monolith; suspended pink Damask rose petals, dark vanilla pods, and shimmering silver air micro-bubbles frozen inside the translucent ice while crisp melting specular water beads trace down the edges',
    recommendedLighting: 'pearl-iridescent',
    recommendedProps: ['water-droplets', 'rose-petals', 'glass-prism'],
    palette: ['#EBF2F9', '#7B90C2', '#D48AA2'],
  },
  {
    id: 'kinetic-silk-tornado',
    category: 'avant-garde',
    nameKm: 'ព្យុះសូត្រ & រលកគ្រីមហោះវិល 3D',
    nameEn: 'Kinetic Silk & Cream Vortex',
    subtitleKm: 'ឡូយៗខ្លាំង · ដូចស្ពតពាណិជ្ជកម្មទឹកអប់បារាំងកម្រិត 8K',
    subtitleEn: 'High-speed frozen spiral of glossy lotion ribbon and champagne silk',
    promptSnippet:
      'high-speed 1/8000s luxury commercial studio shot capturing a breathtaking sculptural vortex of glossy whipped white perfume lotion and weightless blush-champagne silk ribbons spiraling dynamically around the levitating Sneh Perfume Lotion tubes, crisp specular rim highlights, ultra-clean dove-lavender studio backdrop',
    recommendedLighting: 'softbox-beauty',
    recommendedProps: ['cream-swirl', 'silk-fabric', 'gold-veins'],
    palette: ['#F4EFEA', '#B55575', '#5C6FA0'],
  },
  {
    id: 'obsidian-night-gold-dust',
    category: 'avant-garde',
    nameKm: 'កញ្ចក់រាត្រីខ្មៅប្រណិត & ធូលីមាសអណ្តែត',
    nameEn: 'Moonlit Obsidian & 24K Gold Mist',
    subtitleKm: 'ឡូយៗខ្លាំង · ស្ទីល Dark Luxury Night Perfume មានអំណាច',
    subtitleEn: 'Black volcanic mirror water with eclipse halo light and 24K gold dust',
    promptSnippet:
      'ultra-luxurious night-time haute-parfumerie campaign set on still black obsidian mirror water; a glowing luminous lunar halo illuminates the perfume lotion tubes from behind, carving crisp metallic silhouettes as suspended 24-karat gold dust constellations and gossamer plum-violet fragrance mist drift weightlessly across the dark velvet horizon',
    recommendedLighting: 'editorial-contrast',
    recommendedProps: ['gold-veins', 'water-droplets'],
    palette: ['#1A1519', '#C9A568', '#C66688'],
  },
  {
    id: 'seoul-gallery-prism-arch',
    category: 'avant-garde',
    nameKm: 'វិចិត្រសាលសេអ៊ូល & ពន្លឺឥន្ទធនូឆ្លុះកញ្ចក់',
    nameEn: 'Seoul Concrete Arch & Rainbow Prism',
    subtitleKm: 'ឡូយៗខ្លាំង · ស្ថាបត្យកម្ម Minimalist ទំនើប និងពន្លឺចាំងប្លែក',
    subtitleEn: 'Brutalist silky architectural arches sliced by spectral prism beams',
    promptSnippet:
      'museum-grade Korean luxury beauty editorial set inside a serene sunlit architectural concrete gallery with sweeping curved monolith arches; a razor-sharp diagonal shaft of golden daylight passes through a giant optical crystal prism casting delicate lavender, rose, and pearl spectral light beams directly across the perfume lotion plinth',
    recommendedLighting: 'window-gobo',
    recommendedProps: ['glass-prism', 'travertine-stone'],
    palette: ['#EFECE8', '#8D7BB5', '#C97B97'],
  },
  {
    id: 'molten-gold-cream-splash',
    category: 'avant-garde',
    nameKm: 'រលកទឹកមាស & គ្រីមឡេបាញ់ឡើងកម្រិត 8K',
    nameEn: 'Molten Gold & Cream Wave Collision',
    subtitleKm: 'ឡូយៗខ្លាំង · ចលនាបាញ់ឡើងដ៏អស្ចារ្យ ទាក់ទាញភ្លាមៗ',
    subtitleEn: 'Dramatic frozen splash of silky white lotion colliding with liquid gold',
    promptSnippet:
      'dramatic high-speed commercial liquid choreography photograph: a graceful cresting wave of glossy white moisturizing perfume lotion colliding mid-air with an arc of molten champagne-gold liquid silk right behind the poised Sneh Perfume Lotion tubes, razor-sharp frozen micro-droplets sparkling under sculpted studio strobe lighting',
    recommendedLighting: 'golden-hour',
    recommendedProps: ['cream-swirl', 'gold-veins', 'water-droplets'],
    palette: ['#FAF5EE', '#C89F5B', '#9E3B5B'],
  },
  {
    id: 'swan-feather-perfume-cloud',
    category: 'avant-garde',
    nameKm: 'រោមហង្សស & ពពកផ្សែងទឹកអប់ប្រណិត',
    nameEn: 'Swan Feathers & Luminous Scent Cloud',
    subtitleKm: 'ឡូយៗខ្លាំង · អារម្មណ៍ទន់ភ្លន់ដូចស្លាបសត្វ និងក្លិនហោះចេញ',
    subtitleEn: 'Weightless white ostrich feathers floating through backlit fragrance mist',
    promptSnippet:
      'ethereal couture fragrance campaign photograph of the perfume lotion tubes suspended gently among drifting silky white swan and ostrich feathers illuminated by a dreamy backlit cloud of iridescent pearl-lavender perfume mist, soft floating bokeh sparkles, ultra-tactile feather barb detail on a luminous alabaster canvas',
    recommendedLighting: 'pearl-iridescent',
    recommendedProps: ['silk-fabric', 'rose-petals'],
    palette: ['#F7F5F9', '#D6A4B8', '#6B7EB0'],
  },
  {
    id: 'cream-swirl-flatlay',
    category: 'sensory',
    nameKm: 'សាច់ឡេទន់រលោង និងដៃកាន់ប្រណិត',
    nameEn: 'Silky Lotion Swirl & Hands Flatlay',
    subtitleKm: 'រចនាប័ទ្មដូចគំរូទី ១ — បង្ហាញសាច់គ្រីមទន់ម៉ដ្ឋ',
    subtitleEn: 'Signature tactile top-down swirl with graceful hands',
    promptSnippet:
      'overhead flatlay studio composition on an expansive sculptural bed of glossy whipped white perfume lotion swirls with soft creamy peaks; graceful feminine hands with natural manicured nails gently cradling the product upright in center frame, a delicate translucent swatch of moisturizing lotion brushed subtly onto the wrist',
    recommendedLighting: 'softbox-beauty',
    recommendedProps: ['cream-swirl', 'hands-holding'],
    palette: ['#FAF7F4', '#E6B2C2', '#5A6FA0'],
    referenceImage: REF_IMAGES.creamSwirl,
  },
  {
    id: 'hydration-plinth',
    category: 'sensory',
    nameKm: 'ថ្ម Travertine និងពពុះសំណើមថ្លា',
    nameEn: 'Travertine Plinth & Moisture Molecules',
    subtitleKm: 'រចនាប័ទ្មដូចគំរូទី ២ — បង្ហាញភាពផ្តល់សំណើមខ្ពស់',
    subtitleEn: 'Clean hydration lab aesthetic with stone pedestal & bubbles',
    promptSnippet:
      'clean airy luxury skincare studio composition: graceful hands squeezing a silky ribbon of white perfume lotion from the tilted tube into an open palm on the left, while the companion tube stands poised on a raw beige honed travertine stone block on the right, surrounded by crystal-clear iridescent floating moisture bubbles and glass hydration spheres',
    recommendedLighting: 'pearl-iridescent',
    recommendedProps: ['travertine-stone', 'hydration-bubbles', 'hands-squeezing'],
    palette: ['#F2F3F7', '#7F91C4', '#DFB6C3'],
    referenceImage: REF_IMAGES.hydrationPlinth,
  },
  {
    id: 'lavender-staircase',
    category: 'architectural',
    nameKm: 'ជណ្តើរស្ថាបត្យកម្មពណ៌ស្វាយស្រាល',
    nameEn: 'Pastel Lavender Architectural Podium',
    subtitleKm: 'រចនាប័ទ្មដូចគំរូទី ៣ — ប្រណិតស្អាតបែប Editorial',
    subtitleEn: 'Sculptural matte lilac steps with petals & gold marble',
    promptSnippet:
      'minimalist luxury editorial set featuring a matte pastel-lavender stepped architectural podium with crisp geometric stairs; the perfume lotion tubes levitate gracefully at a slight dynamic tilt just above the central plinth, framed by soft floating pink rose petals drifting from the left and sheer watercolor lavender-and-gold veined marble wisps on the right wall',
    recommendedLighting: 'window-gobo',
    recommendedProps: ['rose-petals', 'gold-veins'],
    palette: ['#EBE6F4', '#C48CA3', '#232854'],
    referenceImage: REF_IMAGES.staircasePodium,
  },
  {
    id: 'silk-golden-hour',
    category: 'lifestyle',
    nameKm: 'សំពត់សូត្រ និងពន្លឺថ្ងៃមាសពេលល្ងាច',
    nameEn: 'Liquid Silk Drapery & Golden Hour',
    subtitleKm: 'អារម្មណ៍កក់ក្តៅ ទន់ភ្លន់ ដូចស្បែកសូត្រ',
    subtitleEn: 'Champagne silk folds bathed in warm sunlit caustics',
    promptSnippet:
      'sumptuous waves of champagne-ivory and blush mulberry silk fabric cascading effortlessly across a warm studio stage; the perfume lotion rests nestled within soft satin folds as warm late-afternoon sunlight casts delicate fluted-glass prism refractions across the surface',
    recommendedLighting: 'golden-hour',
    recommendedProps: ['silk-fabric', 'glass-prism'],
    palette: ['#F5EDE4', '#C9A37C', '#8C3B58'],
  },
  {
    id: 'water-mirror-petals',
    category: 'sensory',
    nameKm: 'ផ្ទៃទឹករលកថ្លា និងផ្កាកុលាបអណ្តែត',
    nameEn: 'Water Ripple Mirror & Floating Petals',
    subtitleKm: 'ស្រស់ស្រាយ ឆ្លុះពន្លឺភ្លឺរលោង ទាក់ទាញភ្នែកភ្លាម',
    subtitleEn: 'Shallow crystal pool with concentric ripples and rose petals',
    promptSnippet:
      'shallow crystal-clear reflective water mirror surface tinted softly with pearl-lilac reflections; the perfume lotion stands on a submerged frosted quartz slab generating delicate concentric water ripples, accented by fresh dewy pink rose petals and fine silver-gold light sparkles skimming the water',
    recommendedLighting: 'morning-dew',
    recommendedProps: ['water-droplets', 'rose-petals'],
    palette: ['#EFF3F8', '#D79BB0', '#4A5D8F'],
  },
  {
    id: 'parisian-marble-vanity',
    category: 'architectural',
    nameKm: 'តុថ្មម៉ាបប៉ារីស និងគ្រីស្តាល់ឆ្លុះពន្លឺ',
    nameEn: 'Parisian Calacatta Vanity & Crystal',
    subtitleKm: 'ភាពប្រណិតកម្រិតទឹកអប់បារាំង High-Fashion',
    subtitleEn: 'Haute-parfumerie vanity with Calacatta marble & faceted crystal',
    promptSnippet:
      'haute-parfumerie dressing table crafted from white Calacatta Viola marble with subtle burgundy-gold veining, paired with a faceted optical crystal prism casting soft rainbow dispersion light and an arched vintage brushed-brass mirror softly out of focus in the background',
    recommendedLighting: 'window-gobo',
    recommendedProps: ['glass-prism', 'gold-veins'],
    palette: ['#F7F5F2', '#7E354E', '#C4A56D'],
  },
  {
    id: 'velvet-twilight-luxury',
    category: 'dramatic',
    nameKm: 'ពន្លឺ Chiaroscuro ពេលរាត្រីដ៏មានមន្តស្នេហ៍',
    nameEn: 'Twilight Velvet Chiaroscuro',
    subtitleKm: 'ប្លែកភ្នែក លេចធ្លោខ្លាំងលើ News Feed ពណ៌ស',
    subtitleEn: 'Deep plum-velvet shadows with sculpted rim lighting',
    promptSnippet:
      'high-contrast luxury fragrance campaign staged on honed charcoal-plum stone draped with dark twilight velvet; sculpted silver-gold rim lighting carves crisp luminous contours around the perfume lotion packaging while a subtle ribbon of luminous vanilla-petal mist curls softly behind it',
    recommendedLighting: 'editorial-contrast',
    recommendedProps: ['gold-veins', 'silk-fabric'],
    palette: ['#231926', '#A64D6B', '#C9B18A'],
  },
  {
    id: 'botanical-greenhouse',
    category: 'lifestyle',
    nameKm: 'សួនផ្កាពេលព្រឹក និងតំណក់ទឹកសន្សើម',
    nameEn: 'Botanical Morning Dew Conservatory',
    subtitleKm: 'ធម្មជាតិបរិសុទ្ធ ក្លិនក្រអូបស្រស់ថ្លា',
    subtitleEn: 'Sunlit glasshouse limestone ledge with fresh botanicals',
    promptSnippet:
      'sun-drenched Parisian botanical conservatory ledge made of pale weathered limestone; fresh garden roses, violet stems, and translucent morning dew droplets rest beside the perfume lotion tube while dappled botanical foliage shadows dance delicately across the airy plaster wall',
    recommendedLighting: 'morning-dew',
    recommendedProps: ['rose-petals', 'water-droplets'],
    palette: ['#F6F5F0', '#C47E96', '#69786E'],
  },
  {
    id: 'frosted-quartz-mist',
    category: 'architectural',
    nameKm: 'កញ្ចក់ទឹកកកស្រអាប់ និងផ្សែងសូត្រ',
    nameEn: 'Frosted Quartz Ice & Satin Mist',
    subtitleKm: 'ត្រជាក់ភ្នែក ទំនើប សមនឹងរដូវក្តៅនៅកម្ពុជា',
    subtitleEn: 'Sculptural translucent ice blocks with cool lavender-pearl haze',
    promptSnippet:
      'modern sculptural arrangement of translucent frosted quartz and fluted frosted glass pedestals glowing with soft lavender-pearl backlighting; crisp micro-condensation beads glisten delicately on the glass while silky cool fragrance mist weaves around the perfume lotion base',
    recommendedLighting: 'pearl-iridescent',
    recommendedProps: ['water-droplets', 'glass-prism'],
    palette: ['#EEF2F8', '#8A9AC4', '#D9B9C8'],
  },
  {
    id: 'champagne-pearl-shell',
    category: 'dramatic',
    nameKm: 'គុជខ្យងភ្លឺចែងចាំង និងសន្លឹកមាសស្តើង',
    nameEn: 'Iridescent Pearl & Champagne Gold Leaf',
    subtitleKm: 'សក្តិសមសម្រាប់ Campaign ប្រូម៉ូសិនពិសេស & កាដូ',
    subtitleEn: 'Mother-of-pearl luster paired with delicate floating gold leaf',
    promptSnippet:
      'opulent luxury cosmetic still-life set upon sculpted matte ivory porcelain arches adorned with natural baroque freshwater pearls and ultra-thin drifting champagne gold leaf flakes, reflecting soft pearlescent luminescence across the perfume lotion tube',
    recommendedLighting: 'golden-hour',
    recommendedProps: ['gold-veins', 'silk-fabric'],
    palette: ['#FAF6F0', '#C8A86B', '#9E3B5B'],
  },
  {
    id: 'zero-gravity-editorial',
    category: 'dramatic',
    nameKm: 'អណ្តែតក្នុងអាកាសបែបទស្សនាវដ្តី Vogue',
    nameEn: 'Zero-Gravity Haute Editorial',
    subtitleKm: 'ទាក់ទាញភ្នែកក្នុង ១ វិនាទីដំបូង (Scroll-Stopper)',
    subtitleEn: 'Suspended mid-air tubes with sculptural cream ribbon & petals',
    promptSnippet:
      'high-speed commercial advertising photograph capturing the perfume lotion tubes suspended gracefully in zero gravity amid a dynamic sculptural ribbon of glossy white cream, weightless velvet rose petals, and fine golden shimmer particles frozen crisply against an airy dove-lavender gradient backdrop',
    recommendedLighting: 'softbox-beauty',
    recommendedProps: ['cream-swirl', 'rose-petals', 'gold-veins'],
    palette: ['#F3EFF6', '#A84868', '#516599'],
  },
  {
    id: 'sensory-skin-application',
    category: 'lifestyle',
    nameKm: 'លាបលើស្បែកភ្លឺរលោង Close-Up',
    nameEn: 'Sensory Luminous Skin Application',
    subtitleKm: 'បង្ហាញប្រសិទ្ធភាពស្បែកម៉ដ្ឋភ្លឺ មានសំណើមពិតៗ',
    subtitleEn: 'Intimate beauty editorial showing glowing hydrated skin & lotion',
    promptSnippet:
      'intimate luxury beauty close-up photograph of a woman with luminous, hydrated, velvety-smooth glowing skin gently applying a pearl-sized dab of creamy white perfume lotion along her collarbone and forearm while holding the Sneh Perfume Lotion tube gracefully in soft focus, airy sunlit bedroom linen backdrop',
    recommendedLighting: 'morning-dew',
    recommendedProps: ['hands-holding', 'cream-swirl'],
    palette: ['#F8F2EC', '#D9A7B4', '#7C5D68'],
  },
];

export const LIGHTING_OPTIONS = [
  {
    id: 'window-gobo',
    nameKm: 'ស្រមោលស្លឹកឈើតាមបង្អួច',
    nameEn: 'Sunlit Window Leaf Gobo Shadows',
    snippet:
      'natural angled morning sunlight casting soft poetic botanical leaf gobo shadows across a clean plaster backdrop with gentle shadow falloff',
  },
  {
    id: 'softbox-beauty',
    nameKm: 'ពន្លឺ Studio Softbox ស្អាតភ្លឺ',
    nameEn: 'Diffused Beauty Softbox Studio',
    snippet:
      'ultra-clean diffused overhead beauty softbox lighting with wrap-around silk bounce cards, zero harsh glare, crisp packaging readability',
  },
  {
    id: 'pearl-iridescent',
    nameKm: 'ពន្លឺគុជភ្លឺចែងចាំង (Hydration Glow)',
    nameEn: 'Iridescent Pearl Hydration Glow',
    snippet:
      'luminous cool-pearl studio backlighting creating ethereal iridescent caustics and crystal-clear specular highlights on moisture droplets',
  },
  {
    id: 'golden-hour',
    nameKm: 'ពន្លឺថ្ងៃលិចពណ៌មាសកក់ក្តៅ',
    nameEn: 'Warm Golden Hour Rim Light',
    snippet:
      'warm golden-hour directional sunlight skimming the edges of the tubes with a delicate champagne rim glow and romantic amber undertones',
  },
  {
    id: 'morning-dew',
    nameKm: 'ពន្លឺធម្មជាតិពេលព្រឹកបរិសុទ្ធ',
    nameEn: 'Airy Daylight Morning Glow',
    snippet:
      'fresh airy north-facing daylight with velvety natural skin tones, soft silver reflectors, and crisp morning freshness',
  },
  {
    id: 'editorial-contrast',
    nameKm: 'ពន្លឺ Editorial កម្រិតខ្ពស់',
    nameEn: 'High-Fashion Sculpted Chiaroscuro',
    snippet:
      'sculpted high-fashion editorial key light paired with dramatic velvet shadows and razor-sharp metallic specular accents',
  },
];

export const CAMERA_OPTIONS = [
  {
    id: 'hero-eye-level',
    nameKm: 'កម្រិតភ្នែក Hero Product (85mm)',
    nameEn: 'Hero Eye-Level Commercial (85mm)',
    snippet:
      'shot on Hasselblad H6D-100c with 85mm f/2.8 macro lens, eye-level commercial hero perspective, shallow creamy depth of field, tack-sharp packaging label focus',
  },
  {
    id: 'top-down-flatlay',
    nameKm: 'ថតពីលើចុះក្រោម (Flatlay 90°)',
    nameEn: '90° Overhead Editorial Flatlay',
    snippet:
      'precision 90-degree overhead flatlay captured on Phase One IQ4 150MP, 55mm lens at f/5.6, balanced symmetrical luxury composition',
  },
  {
    id: 'low-angle-monumental',
    nameKm: 'មុំទាបលើកភាពប្រណិត (Low Angle)',
    nameEn: 'Elevated Low-Angle Prestige',
    snippet:
      'slight low-angle prestige product angle on 100mm macro lens giving the tubes sculptural poise and haute-couture authority',
  },
  {
    id: 'dynamic-45-tilt',
    nameKm: 'មុំ 45° រស់រវើកទាក់ទាញភ្នែក',
    nameEn: 'Dynamic 45° Editorial Angle',
    snippet:
      'dynamic three-quarter 45-degree editorial angle with subtle floating depth separation and razor-sharp micro-texture detail',
  },
];

export const MOOD_HARMONIES = [
  {
    id: 'porcelain-rose',
    nameKm: 'Porcelain Rose & Lavender (ហ្ស៊ីនប្រេន)',
    nameEn: 'Signature Porcelain Rose & Lavender',
    snippet:
      'refined porcelain alabaster, blush rose quartz, and soft periwinkle-lavender color grading harmonized directly with the Sneh packaging',
    swatches: ['#FAF8F6', '#D48DA3', '#6678A8'] as [string, string, string],
  },
  {
    id: 'champagne-gold',
    nameKm: 'Champagne Ivory & Gold Leaf',
    nameEn: 'Champagne Ivory & Gold',
    snippet:
      'warm champagne ivory, brushed antique gold, and dusty mauve tonal palette evoking Parisian luxury perfumery',
    swatches: ['#F7F2E8', '#C5A267', '#8F405B'] as [string, string, string],
  },
  {
    id: 'dewy-pearl',
    nameKm: 'Dewy Pearl & Ice Mist',
    nameEn: 'Dewy Pearl & Ice Mist',
    snippet:
      'crisp luminous pearl white, glacial lavender-blue, and translucent crystal silver palette emphasizing deep hydration and freshness',
    swatches: ['#F3F6FA', '#899BC9', '#E0B4C5'] as [string, string, string],
  },
  {
    id: 'velvet-plum',
    nameKm: 'Velvet Plum & Midnight Vanilla',
    nameEn: 'Velvet Plum & Midnight Vanilla',
    snippet:
      'deep velvet plum, midnight indigo, and luminous warm gold highlights for bold scroll-stopping luxury contrast',
    swatches: ['#281B29', '#9E3B5B', '#D0B483'] as [string, string, string],
  },
];

export const SENSORY_PROPS = [
  {
    id: 'cream-swirl',
    labelKm: 'សាច់គ្រីមឡេរមួលទន់',
    labelEn: 'Whipped Lotion Swirls',
    snippet: 'glossy sculptural white perfume lotion cream swirls with velvety soft peaks',
  },
  {
    id: 'rose-petals',
    labelKm: 'ស្រទាប់ផ្កាកុលាបអណ្តែត',
    labelEn: 'Floating Rose Petals',
    snippet: 'delicate fresh pink and violet rose petals suspended softly with subtle motion depth',
  },
  {
    id: 'gold-veins',
    labelKm: 'ខ្សែមាស & ថ្មម៉ាបប្រណិត',
    labelEn: 'Liquid Gold Veins',
    snippet: 'fine liquid gold metallic veins and gossamer watercolor marble wisps',
  },
  {
    id: 'hydration-bubbles',
    labelKm: 'ពពុះសំណើមថ្លា (3D Moisture)',
    labelEn: 'Iridescent Moisture Bubbles',
    snippet: 'translucent iridescent glass-like hydration bubbles and micro-moisture spheres',
  },
  {
    id: 'water-droplets',
    labelKm: 'តំណក់ទឹកសន្សើមភ្លឺថ្លា',
    labelEn: 'Crystal Dew Droplets',
    snippet: 'crisp micro-droplets of crystal dew glistening softly on nearby stone and petals',
  },
  {
    id: 'hands-holding',
    labelKm: 'ដៃនារីកាន់ផលិតផលស្អាត',
    labelEn: 'Graceful Hands Holding',
    snippet: 'elegant feminine hands with natural clean manicured nails delicately holding the packaging',
  },
  {
    id: 'hands-squeezing',
    labelKm: 'ដៃច្របាច់ឡេចេញមកបាតដៃ',
    labelEn: 'Squeezing Lotion Ribbon',
    snippet: 'graceful hands gently squeezing a smooth glossy ribbon of white lotion into an open palm',
  },
  {
    id: 'travertine-stone',
    labelKm: 'ជើងទម្រថ្ម Travertine',
    labelEn: 'Travertine Stone Plinth',
    snippet: 'raw honed beige travertine stone architectural plinth with tactile natural pores',
  },
  {
    id: 'silk-fabric',
    labelKm: 'សំពត់សូត្ររលោង',
    labelEn: 'Draped Mulberry Silk',
    snippet: 'fluid undulating folds of pearlescent champagne-blush mulberry silk',
  },
  {
    id: 'glass-prism',
    labelKm: 'កែវគ្រីស្តាល់ឆ្លុះពន្លឺ',
    labelEn: 'Crystal Light Prisms',
    snippet: 'faceted optical glass prism refracting delicate luminous caustics',
  },
];

export const KHMER_HEADLINE_PRESETS = [
  {
    headline: 'ក្លិន ក្រអូប ដូចក្លិនយើងចឹង..!',
    subHeadline: 'SIGNATURE PERFUME LOTION',
    angleKm: 'ទាក់ទាញបែបស្និទ្ធស្នាល & ជឿជាក់',
  },
  {
    headline: 'ស្នេហ៍លាបហើយ ធ្វើអោយ ស្បែកមានសំណើម',
    subHeadline: 'DEEP HYDRATION · 24H SCENT',
    angleKm: 'ផ្តោតលើសំណើម & ការថែរក្សាស្បែក',
  },
  {
    headline: 'លាបពេលណា នឹកសង្សារចាស់',
    subHeadline: 'SMOOTH & BRIGHTENING',
    angleKm: 'Hook បែប Viral ទាក់ទាញការចែករំលែក',
  },
  {
    headline: 'ដើរកាត់អ្នកណា ក៏ងាកមកមើលក្លិនស្នេហ៍',
    subHeadline: 'HAUTE PERFUME BODY LOTION',
    angleKm: 'ឡូយៗខ្លាំង · បង្កើតអារម្មណ៍លេចធ្លោគ្រប់ជំហាន',
  },
  {
    headline: 'មិនបាច់បាញ់ទឹកអប់ គ្រាន់តែលាបក៏ក្រអូបជាប់ចិត្ត',
    subHeadline: 'ROSY VIOLET · BLACK VANILLA',
    angleKm: 'បញ្ជាក់ភាពងាយស្រួល និងក្លិនប្រណិតខ្លាំង',
  },
  {
    headline: 'ក្លិនទឹកអប់ប្រណិត ជាប់ស្បែកពេញមួយថ្ងៃ',
    subHeadline: '24H LONG-LASTING FRAGRANCE',
    angleKm: 'ផ្តោតលើភាពប្រណិត និងក្លិនជាប់យូរ',
  },
  {
    headline: 'ស្បែកទន់ដូចសូត្រ ក្លិនក្រអូបដូចទឹកអប់បារាំង',
    subHeadline: 'SILK TOUCH · LUXURY SCENT',
    angleKm: 'ប្រៀបធៀបកម្រិតប្រេនអន្តរជាតិ',
  },
];

export const VIRAL_DESIGN_SPARKS: {
  id: string;
  labelKm: string;
  labelEn: string;
  brief: string;
}[] = [
  {
    id: 'fooh-city',
    labelKm: 'FOOH 3D ដបយក្សកណ្តាលក្រុង',
    labelEn: 'FOOH Giant 3D City',
    brief:
      'Viral 3D Fake-Out-Of-Home (FOOH) luxury surrealism: colossal perfume lotion tubes installed dramatically in a sunlit luxury city square or floating over a silk-draped glass atrium with drifting rose petals.',
  },
  {
    id: 'tamburins-seoul',
    labelKm: 'ស្ទីល Tamburins កូរ៉េប្រណិត',
    labelEn: 'Seoul Tamburins Gallery',
    brief:
      'Ultra-cool Seoul Tamburins & Gentle Monster inspired gallery aesthetic: liquid chrome sculptures, blown Murano glass ribbons, raw travertine monoliths, and poetic diagonal rainbow prism light.',
  },
  {
    id: 'dark-night-luxury',
    labelKm: 'Dark Luxury រាត្រី & ធូលីមាស',
    labelEn: 'Obsidian Night & Gold',
    brief:
      'Night-time Dior/YSL luxury fragrance aesthetic: black volcanic obsidian water mirror, eclipse rim light halo, floating 24K gold dust, and velvet plum mist.',
  },
  {
    id: 'kinetic-splash',
    labelKm: 'រលកគ្រីម + មាសហោះ 8K',
    labelEn: '8K Cream & Gold Splash',
    brief:
      'High-speed 1/8000s kinetic liquid choreography: glossy white perfume lotion waves colliding with molten champagne gold liquid silk and floating Damask rose petals.',
  },
  {
    id: 'crystal-ice',
    labelKm: 'ដុំទឹកកកគ្រីស្តាល់ & ផ្កាកក',
    labelEn: 'Crystal Ice Monolith',
    brief:
      'Razor-sharp sculpted glacial crystal ice monoliths encasing frozen violet-pink roses and glistening dew droplets, refreshing and ultra-luxurious.',
  },
];

export const CAMPAIGN_GOALS: {
  id: CampaignGoalId;
  nameKm: string;
  nameEn: string;
  descKm: string;
  descEn: string;
}[] = [
  {
    id: 'avant-garde-viral',
    nameKm: 'Design ឡូយៗខ្លាំង (Viral 3D / High-Fashion)',
    nameEn: 'Bold Avant-Garde & Viral 3D',
    descKm: 'ស្ទីល FOOH ដបយក្ស, Tamburins សេអ៊ូល, ទឹកកកគ្រីស្តាល់ & លោហៈរាវ Chrome',
    descEn: 'FOOH surrealism, Seoul gallery Chrome, kinetic cream waves & night luxury',
  },
  {
    id: 'scroll-stopper',
    nameKm: 'បញ្ឈប់ម្រាមដៃ (Scroll-Stopper)',
    nameEn: 'Thumb-Stopping Viral',
    descKm: 'ប្លង់ប្លែកភ្នែក កម្រិតពន្លឺខ្ពស់ ទាក់ទាញក្នុង ១ វិនាទី',
    descEn: 'Unexpected sculptural motion, surreal luxury physics, bold hooks',
  },
  {
    id: 'brand-luxury',
    nameKm: 'លើកតម្លៃប្រេន (Haute Luxury)',
    nameEn: 'Haute Luxury Branding',
    descKm: 'ស្ទីលទស្សនាវដ្តីអន្តរជាតិ បង្កើនទំនុកចិត្តខ្ពស់',
    descEn: 'Editorial magazine elegance inspired by Parisian fragrance houses',
  },
  {
    id: 'conversion',
    nameKm: 'បង្កើនការលក់ (Direct Conversion)',
    nameEn: 'Direct Conversion',
    descKm: 'បង្ហាញសាច់ឡេ ភាពច្បាស់ផលិតផល និងការទាក់ទាញឆាតទិញ',
    descEn: 'Product clarity, tactile texture proof, and persuasive offer space',
  },
  {
    id: 'promo-bundle',
    nameKm: 'ឈុតប្រូម៉ូសិន & កាដូ (Duo Bundle)',
    nameEn: 'Duo Promo & Gifting',
    descKm: 'លេចធ្លោទាំង ២ ក្លិន Rosy Violet & Black Vanilla',
    descEn: 'Balanced dual-bottle presentation built for bundle offers',
  },
];

export const REFERENCE_AD_STUDIES: ReferenceAdStudy[] = [
  {
    id: 'ref-cream-swirl',
    image: REF_IMAGES.creamSwirl,
    titleKm: 'គំរូទី ១ — សាច់ឡេរមួលទន់ & ដៃកាន់គូប្រណិត',
    titleEn: 'Reference 01 — Tactile Cream Swirl Duo',
    tagKm: 'Sensory Texture · 4:5 Feed',
    tagEn: 'Sensory Texture · 4:5 Feed',
    khmerHeadlineOnImage: 'ក្លិន ក្រអូប ដូចក្លិនយើងចឹង..!',
    compositionKm:
      'ប្លង់ថតពីលើចុះក្រោម (90° Flatlay) ដោយយកសាច់ឡេពណ៌សរមួលពេញផ្ទៃខាងក្រោយ បង្កើតអារម្មណ៍ទន់ម៉ដ្ឋភ្លាមៗ រួមនឹងដៃកាន់ដបទាំង ២ និងស្នាមលាបសាកល្បងលើកដៃ។',
    compositionEn:
      'Overhead 90° flatlay set on a lush bed of whipped cream swirls with both tubes held symmetrically in-hand plus a subtle wrist swatch.',
    whyItWorksKm:
      'អតិថិជនអាច "មានអារម្មណ៍ដល់សាច់ឡេ" ដោយគ្រាន់តែមើលរូប ហើយការកាន់ផ្ទាល់ដៃជួយបង្កើនទំនុកចិត្ត និងបង្ហាញទំហំដបពិតប្រាកដ។',
    whyItWorksEn:
      'Triggers immediate tactile craving while human hands anchor authentic bottle scale and organic trust.',
    palette: ['#F6F3EE', '#E4A8BA', '#5A6FA0'],
    studioPreset: {
      variantId: 'duo',
      aspectRatio: '4:5',
      sceneId: 'cream-swirl-flatlay',
      lightingId: 'softbox-beauty',
      cameraId: 'top-down-flatlay',
      moodId: 'porcelain-rose',
      selectedProps: ['cream-swirl', 'hands-holding'],
      khmerHeadline: 'ក្លិន ក្រអូប ដូចក្លិនយើងចឹង..!',
      subHeadline: 'PERFUME LOTION DUO',
    },
  },
  {
    id: 'ref-hydration-plinth',
    image: REF_IMAGES.hydrationPlinth,
    titleKm: 'គំរូទី ២ — ពពុះសំណើម & ច្របាច់សាច់ឡេផ្ទាល់',
    titleEn: 'Reference 02 — Hydration Plinth & Pour',
    tagKm: 'Moisture Proof · 4:5 Feed',
    tagEn: 'Moisture Proof · 4:5 Feed',
    khmerHeadlineOnImage: 'ស្នេហ៍លាបហើយ ធ្វើអោយ ស្បែកមានសំណើម',
    compositionKm:
      'បំបែកប្លង់ឆ្វេង-ស្តាំយ៉ាងមានតុល្យភាព៖ ខាងឆ្វេងបង្ហាញចលនាច្របាច់ឡេ Black Vanilla ចូលបាតដៃ ខាងស្តាំដាក់ Rosy Violet លើជើងទម្រថ្ម Travertine និងពពុះសំណើមអណ្តែត។',
    compositionEn:
      'Asymmetric balance: active lotion squeeze on the left paired with Rosy Violet anchored on honed travertine stone and iridescent moisture molecules.',
    whyItWorksKm:
      'មានចលនារស់រវើក (Action Shot) ផ្ទៃខាងស្តាំផ្នែកលើទំនេរស្អាតសម្រាប់ដាក់អក្សរខ្មែរធំច្បាស់ ងាយអានក្នុង ២ វិនាទីលើទូរស័ព្ទ។',
    whyItWorksEn:
      'Combines kinetic product-in-use proof with crisp negative space tailored for high-legibility Khmer benefit headlines.',
    palette: ['#F2F3F7', '#7F91C4', '#DFB6C3'],
    studioPreset: {
      variantId: 'duo',
      aspectRatio: '4:5',
      sceneId: 'hydration-plinth',
      lightingId: 'pearl-iridescent',
      cameraId: 'hero-eye-level',
      moodId: 'dewy-pearl',
      selectedProps: ['travertine-stone', 'hydration-bubbles', 'hands-squeezing'],
      khmerHeadline: 'ស្នេហ៍លាបហើយ ធ្វើអោយ ស្បែកមានសំណើម',
      subHeadline: 'PERFUME LOTION',
    },
  },
  {
    id: 'ref-staircase-podium',
    image: REF_IMAGES.staircasePodium,
    titleKm: 'គំរូទី ៣ — ជណ្តើរពណ៌ស្វាយស្រាល & ស្រទាប់ផ្កា',
    titleEn: 'Reference 03 — Architectural Lilac Podium',
    tagKm: 'Editorial Luxury · 4:5 Feed',
    tagEn: 'Editorial Luxury · 4:5 Feed',
    khmerHeadlineOnImage: 'លាបពេលណា នឹកសង្សារចាស់',
    compositionKm:
      'ប្រើជណ្តើរស្ថាបត្យកម្មពណ៌ស្វាយស្រាល ស្រមោលស្លឹកឈើតាមបង្អួច ស្រទាប់ផ្កាពណ៌ផ្កាឈូកខាងឆ្វេង និងខ្សែម៉ាបពណ៌មាសខាងស្តាំ ធ្វើឲ្យដបទាំង ២ លេចធ្លោដូចអណ្តែត។',
    compositionEn:
      'Stepped pastel-lavender architectural podium with botanical window shadows, floating rose petals left, and gold-veined marble wisps right.',
    whyItWorksKm:
      'បង្កើតភាពប្រណិតកម្រិតប្រេនអន្តរជាតិ រួមបញ្ចូលជាមួយ Hook អក្សរខ្មែរបែប Viral ធ្វើឲ្យអ្នកមើលចង់ Comment និង Share ភ្លាមៗ។',
    whyItWorksEn:
      'Pairs museum-grade luxury staging with a playful viral Khmer hook — high prestige visuals meet high engagement copy.',
    palette: ['#EBE6F4', '#C48CA3', '#232854'],
    studioPreset: {
      variantId: 'duo',
      aspectRatio: '4:5',
      sceneId: 'lavender-staircase',
      lightingId: 'window-gobo',
      cameraId: 'low-angle-monumental',
      moodId: 'porcelain-rose',
      selectedProps: ['rose-petals', 'gold-veins'],
      khmerHeadline: 'លាបពេលណា នឹកសង្សារចាស់',
      subHeadline: 'SMOOTH & BRIGHTENING',
    },
  },
];

export const DEFAULT_STUDIO_CONFIG: StudioConfig = {
  variantId: 'duo',
  engineId: 'midjourney',
  aspectRatio: '4:5',
  sceneId: 'lavender-staircase',
  lightingId: 'window-gobo',
  cameraId: 'hero-eye-level',
  moodId: 'porcelain-rose',
  selectedProps: ['rose-petals', 'gold-veins'],
  khmerHeadline: 'លាបពេលណា នឹកសង្សារចាស់',
  subHeadline: 'SMOOTH & BRIGHTENING',
  textPlacement: 'clean-space',
  brandLogoInclude: true,
  customNote: '',
};

export const VIDEO_ENGINES: {
  id: 'veo3' | 'kling' | 'runway' | 'sora' | 'luma';
  label: string;
  noteKm: string;
  noteEn: string;
}[] = [
  {
    id: 'veo3',
    label: 'Google Veo 3',
    noteKm: 'ល្អបំផុតសម្រាប់វីដេអូប្រណិត 4K + សំឡេង ASMR និងភ្លេងស្វ័យប្រវត្តិ',
    noteEn: 'Cinema-grade lighting, physics, plus native audio & ASMR sound cues',
  },
  {
    id: 'kling',
    label: 'Kling 2.0',
    noteKm: 'ចលនាដៃ សាច់គ្រីម សំពត់សូត្រ និង Image-to-Video រលូនខ្លាំង',
    noteEn: 'Fluid human motion, cloth physics, and crisp image-to-video fidelity',
  },
  {
    id: 'runway',
    label: 'Runway Gen-4',
    noteKm: 'គ្រប់គ្រងចលនាកាមេរ៉ា Cinema (Dolly, Orbit, Slow-Mo) បានច្បាស់',
    noteEn: 'Precision directorial camera movement and consistent product framing',
  },
  {
    id: 'sora',
    label: 'OpenAI Sora',
    noteKm: 'ល្អខ្លាំងខាងប្លង់សាច់រឿងវែង និង FOOH 3D Surreal ទំនើប',
    noteEn: 'Rich multi-beat storytelling and hyper-real architectural surrealism',
  },
  {
    id: 'luma',
    label: 'Luma / Hailuo',
    noteKm: 'ល្បឿនលឿន ពន្លឺភ្លឺថ្លា និងចលនាផលិតផលលេចធ្លោលើ Reels',
    noteEn: 'Fast glossy commercial product orbits and luminous cosmetic lighting',
  },
];

export const TVC_DURATIONS: {
  id: '15s-vertical' | '30s-cinema' | '6s-bumper';
  labelKm: string;
  labelEn: string;
  aspectRatio: AspectRatioId;
  shotsCount: number;
  descKm: string;
  descEn: string;
}[] = [
  {
    id: '15s-vertical',
    labelKm: '15 វិនាទី · Reels / TikTok / FB (9:16)',
    labelEn: '15s Reels / TikTok / FB (9:16)',
    aspectRatio: '9:16',
    shotsCount: 4,
    descKm: 'ទាក់ទាញក្នុង ៣ វិនាទីដំបូង — ពេញនិយមបំផុតសម្រាប់ Facebook Ads',
    descEn: 'High-retention 3s hook built for Facebook Reels & Stories ads',
  },
  {
    id: '30s-cinema',
    labelKm: '30 វិនាទី · TVC ស៊ីណេម៉ាពេញលេញ (16:9)',
    labelEn: '30s Full Cinema TVC (16:9)',
    aspectRatio: '16:9',
    shotsCount: 4,
    descKm: 'សាច់រឿងពេញលេញ ៤ ឈុតកម្រិតទូរទស្សន៍ និង LED Billboard',
    descEn: 'Full 4-act television & YouTube commercial film narrative',
  },
  {
    id: '6s-bumper',
    labelKm: '6 វិនាទី · បញ្ឈប់ម្រាមដៃខ្លី (4:5)',
    labelEn: '6s Scroll-Stopper Loop (4:5)',
    aspectRatio: '4:5',
    shotsCount: 2,
    descKm: 'វីដេអូខ្លី ២ ឈុតលឿនច្បាស់ សម្រាប់បាញ់ Ads Retargeting',
    descEn: 'Ultra-punchy 2-shot luxury product burst for mobile feed',
  },
];

export const TVC_STYLES: {
  id:
    | 'haute-parfumerie'
    | 'seoul-avant-garde'
    | 'fooh-viral-3d'
    | 'asmr-sensory'
    | 'romantic-story'
    | 'dark-night-luxury';
  nameKm: string;
  nameEn: string;
  descKm: string;
  descEn: string;
  palette: [string, string, string];
}[] = [
  {
    id: 'haute-parfumerie',
    nameKm: 'ស៊ីណេម៉ាទឹកអប់បារាំង (Dior / Chanel Style)',
    nameEn: 'Parisian Haute-Parfumerie Cinema',
    descKm: 'Slow-motion 120fps សំពត់សូត្រ ផ្កាកុលាបហោះ និងពន្លឺមាសប្រណិត',
    descEn: '120fps slow-motion silk waves, sunlit rose petals & iconic hero packshot',
    palette: ['#F7F2EA', '#C4859A', '#C8A565'],
  },
  {
    id: 'seoul-avant-garde',
    nameKm: 'ស្ទីលកូរ៉េទំនើប (Tamburins Art Film)',
    nameEn: 'Seoul Tamburins Avant-Garde',
    descKm: 'ចលនាកាមេរ៉ាទំនើប លោហៈរាវ Chrome កញ្ចក់ Prism និងពន្លឺវិចិត្រសាល',
    descEn: 'Sleek gallery chrome, prismatic sunbeams & crisp modern editorial cuts',
    palette: ['#ECEFF5', '#9E5874', '#506498'],
  },
  {
    id: 'fooh-viral-3d',
    nameKm: 'FOOH 3D ដបយក្សកណ្តាលក្រុង (Viral)',
    nameEn: 'Viral 3D FOOH City Spectacle',
    descKm: 'ដបឡេយក្សបង្ហាញខ្លួនកណ្តាលក្រុង បាចស្រទាប់ផ្កា និងគ្រីមសូត្រហោះ',
    descEn: 'Colossal surreal tubes towering in a sunlit plaza with drifting petals',
    palette: ['#EFEBE6', '#C96F8D', '#4A5D8F'],
  },
  {
    id: 'asmr-sensory',
    nameKm: 'ASMR សាច់ឡេទន់រលោង & ពពុះសំណើម',
    nameEn: 'ASMR Tactile Texture & Hydration',
    descKm: 'Macro ជិតៗ ច្របាច់ឡេ រលកគ្រីម តំណក់ទឹកភ្លឺថ្លា ឮសំឡេង ASMR ស្រទន់',
    descEn: 'Hyper-tactile macro cream ribbons, water ripples & soothing ASMR audio',
    palette: ['#F3F5FA', '#7F91C4', '#E1B5C4'],
  },
  {
    id: 'romantic-story',
    nameKm: 'សាច់រឿងស្នេហ៍រ៉ូមែនទិក & ទំនុកចិត្ត',
    nameEn: 'Golden Hour Allure Lifestyle',
    descKm: 'នារីលាបឡេមុនចេញក្រៅ ដើរកាត់អ្នកណាក៏ងាកមើលព្រោះក្លិនក្រអូបប្រហើរ',
    descEn: 'Confident beauty ritual turning heads with an unforgettable scent trail',
    palette: ['#F8EFEA', '#B54E6E', '#7D5C6E'],
  },
  {
    id: 'dark-night-luxury',
    nameKm: 'រាត្រីប្រណិត Dark Luxury (Obsidian & Gold)',
    nameEn: 'Obsidian Night & 24K Gold Film',
    descKm: 'ផ្ទៃទឹកកញ្ចក់ខ្មៅ ពន្លឺព្រះច័ន្ទ ធូលីមាសហោះវិល និងផ្សែងទឹកអប់ប្រណិត',
    descEn: 'Moonlit volcanic mirror water, eclipse rim light & swirling 24K gold dust',
    palette: ['#1A1519', '#C9A568', '#C66688'],
  },
];

export const TVC_VFX_CGI_PRESETS: {
  id:
    | 'liquid-gold-silk'
    | 'zero-g-cream-fluid'
    | 'fooh-giant-cgi'
    | 'crystal-caustics-raytrace'
    | 'botanical-bloom-vfx'
    | 'liquid-chrome-morph'
    | 'obsidian-stardust-vfx'
    | 'macro-hydration-spheres';
  nameKm: string;
  nameEn: string;
  descKm: string;
  descEn: string;
}[] = [
  {
    id: 'liquid-gold-silk',
    nameKm: 'CGI រលកសូត្ររាវ & មាស 24K ហោះរុំដប',
    nameEn: 'Molten 24K Gold & Liquid Silk CGI',
    descKm: 'Houdini 3D ខ្សែមាសរលាយ និងសំពត់សូត្រពណ៌ផ្កាឈូកហោះវិលជុំវិញដប 120fps',
    descEn: 'Houdini fluid simulation of molten gold ribbons weaving with blush silk',
  },
  {
    id: 'zero-g-cream-fluid',
    nameKm: 'CGI សាច់គ្រីមឡេអណ្តែត Zero-Gravity',
    nameEn: 'Zero-Gravity Whipped Cream Fluid CGI',
    descKm: 'រលកគ្រីមពណ៌សរលោងហោះផ្ទុះជាខ្សែទន់ម៉ដ្ឋជុំវិញផលិតផលក្នុងលំហគ្មានទំនាញ',
    descEn: 'Sculptural zero-gravity glossy white lotion ribbons spiraling smoothly',
  },
  {
    id: 'fooh-giant-cgi',
    nameKm: 'FOOH 3D CGI ដបយក្សកណ្តាលទីក្រុង',
    nameEn: 'FOOH Hyper-Real Giant 3D City CGI',
    descKm: 'បច្ចេកទេស VFX ដាក់ដបឡេយក្សកម្ពស់អគារពិតៗ ជាមួយភ្លៀងផ្កាកុលាប 3D',
    descEn: 'Photorealistic Fake-Out-Of-Home colossal tube composited in sunlit city',
  },
  {
    id: 'crystal-caustics-raytrace',
    nameKm: 'VFX ពន្លឺគ្រីស្តាល់ Prism & ដុំទឹកកកបំបែក',
    nameEn: 'Crystal Prism Caustics & Glacial Shatter VFX',
    descKm: 'Octane Raytracing ដុំកញ្ចក់គ្រីស្តាល់បែកពន្លឺឥន្ទធនូ និងដំណក់សន្សើម 8K',
    descEn: 'Refractive optical glass prisms casting luminous rainbow caustics & dew',
  },
  {
    id: 'botanical-bloom-vfx',
    nameKm: 'CGI ផ្កាកុលាប & វ៉ានីឡារីក Time-Lapse',
    nameEn: '3D Botanical Rose & Vanilla Bloom CGI',
    descKm: 'ផ្កាកុលាប និងផ្កាវ៉ានីឡារីកលូតលាស់ជុំវិញដប ហើយបែកជាលំអងក្លិនក្រអូបភ្លឺ',
    descEn: 'Hyper-real CGI damask roses & vanilla orchids blooming into scent particles',
  },
  {
    id: 'liquid-chrome-morph',
    nameKm: 'CGI លោហៈរាវ Chrome បំលែងរូប (Seoul Art)',
    nameEn: 'Liquid Mercury Chrome Morphing CGI',
    descKm: 'លោហៈកញ្ចក់រាវពណ៌ប្រាក់-ស្វាយបំលែងជាជើងទម្រ និងរលកអណ្តែតស្ទីល Tamburins',
    descEn: 'Reflective liquid chrome waves morphing into sculptural pedestals',
  },
  {
    id: 'obsidian-stardust-vfx',
    nameKm: 'VFX ផ្សែងទឹកអប់ពណ៌ស្វាយ & ធូលីផ្កាយមាស',
    nameEn: 'Volumetric Perfume Mist & Gold Stardust VFX',
    descKm: 'ផ្សែងទឹកអប់ Volumetric ពណ៌ស្វាយ-ផ្កាឈូក រលកទឹកកញ្ចក់ខ្មៅ និងពន្លឺផ្កាយ',
    descEn: 'Volumetric twilight fragrance mist, black mirror ripples & floating gold dust',
  },
  {
    id: 'macro-hydration-spheres',
    nameKm: 'CGI ពពុះសំណើម 3D ផ្ទុះចូលស្បែកភ្លឺថ្លា',
    nameEn: '3D Iridescent Hydration Micro-Spheres CGI',
    descKm: 'ពពុះសំណើមថ្លា 3D អណ្តែតជុំវិញដប និងរលាយចូលស្បែកបង្កើតពន្លឺសំណើម',
    descEn: 'Translucent pearl hydration spheres orbiting & dissolving into luminous glow',
  },
];


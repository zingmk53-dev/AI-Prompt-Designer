export type Language = 'km' | 'en';

export type ActiveTab = 'studio' | 'tvc' | 'references' | 'fresh' | 'vault';

export type ProductVariantId = 'duo' | 'rosy-violet' | 'black-vanilla' | 'custom';

export type GeneratorEngineId =
  | 'midjourney'
  | 'flux'
  | 'gemini-image'
  | 'ideogram'
  | 'dalle';

export type AspectRatioId = '4:5' | '1:1' | '9:16' | '16:9';

export type TextPlacementMode = 'clean-space' | 'integrated-khmer' | 'english-minimal';

export type CampaignGoalId =
  | 'avant-garde-viral'
  | 'conversion'
  | 'brand-luxury'
  | 'scroll-stopper'
  | 'promo-bundle';

export interface ProductVariant {
  id: ProductVariantId;
  nameKm: string;
  nameEn: string;
  scentNotesKm: string;
  scentNotesEn: string;
  packagingDescription: string;
  accentHex: string;
  secondaryHex: string;
  previewImage: string;
}

export interface ScenePreset {
  id: string;
  category: 'avant-garde' | 'sensory' | 'architectural' | 'lifestyle' | 'dramatic';
  nameKm: string;
  nameEn: string;
  subtitleKm: string;
  subtitleEn: string;
  promptSnippet: string;
  recommendedLighting: string;
  recommendedProps: string[];
  palette: [string, string, string];
  referenceImage?: string;
}

export interface StudioConfig {
  variantId: ProductVariantId;
  engineId: GeneratorEngineId;
  aspectRatio: AspectRatioId;
  sceneId: string;
  lightingId: string;
  cameraId: string;
  moodId: string;
  selectedProps: string[];
  khmerHeadline: string;
  subHeadline: string;
  textPlacement: TextPlacementMode;
  brandLogoInclude: boolean;
  customNote: string;
  customImageDataUrl?: string;
  customImageName?: string;
}

export interface GeneratedConcept {
  id: string;
  titleKm: string;
  titleEn: string;
  visualDirectionKm: string;
  visualDirectionEn: string;
  masterPrompt: string;
  negativePrompt: string;
  khmerHeadline: string;
  subHeadline: string;
  fbPrimaryCopyKm: string;
  fbCtaKm: string;
  cameraSpec: string;
  lightingSpec: string;
  palette: [string, string, string];
  engineId: GeneratorEngineId;
  aspectRatio: AspectRatioId;
  variantId: ProductVariantId;
  createdAt: string;
  source: 'studio' | 'ai-remix' | 'ai-fresh';
}

export interface ReferenceAdStudy {
  id: string;
  image: string;
  titleKm: string;
  titleEn: string;
  tagKm: string;
  tagEn: string;
  khmerHeadlineOnImage: string;
  compositionKm: string;
  compositionEn: string;
  whyItWorksKm: string;
  whyItWorksEn: string;
  palette: [string, string, string];
  studioPreset: Partial<StudioConfig>;
}

export type VideoEngineId = 'veo3' | 'kling' | 'runway' | 'sora' | 'luma';

export type TvcDurationId = '15s-vertical' | '30s-cinema' | '6s-bumper';

export type TvcStyleId =
  | 'auto'
  | 'haute-parfumerie'
  | 'seoul-avant-garde'
  | 'fooh-viral-3d'
  | 'asmr-sensory'
  | 'romantic-story'
  | 'dark-night-luxury';

export type TvcVfxId =
  | 'auto'
  | 'liquid-gold-silk'
  | 'zero-g-cream-fluid'
  | 'fooh-giant-cgi'
  | 'crystal-caustics-raytrace'
  | 'botanical-bloom-vfx'
  | 'liquid-chrome-morph'
  | 'obsidian-stardust-vfx'
  | 'macro-hydration-spheres';

export interface TvcShot {
  shotNumber: number;
  timecode: string;
  roleKm: string;
  roleEn: string;
  cameraMovement: string;
  videoPrompt: string;
  vfxCgiCue: string;
  voiceoverKm: string;
  onScreenTextKm: string;
  sfxCue: string;
}

export interface GeneratedTvc {
  id: string;
  titleKm: string;
  titleEn: string;
  loglineKm: string;
  loglineEn: string;
  masterVideoPrompt: string;
  vfxCgiDirectionKm: string;
  vfxCgiDirectionEn: string;
  vfxPresetId: TvcVfxId;
  musicDirectionKm: string;
  musicDirectionEn: string;
  ctaLineKm: string;
  palette: [string, string, string];
  shots: TvcShot[];
  videoEngine: VideoEngineId;
  durationId: TvcDurationId;
  styleId: TvcStyleId;
  aspectRatio: AspectRatioId;
  createdAt: string;
}

export interface MemoryEntry {
  id: string;
  kind: 'image' | 'tvc';
  titleKm: string;
  titleEn: string;
  metaLabel: string;
  palette: [string, string, string];
  createdAt: string;
  concept?: GeneratedConcept;
  tvc?: GeneratedTvc;
}


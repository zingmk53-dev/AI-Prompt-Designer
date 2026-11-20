import {
  CAMERA_OPTIONS,
  KHMER_HEADLINE_PRESETS,
  LIGHTING_OPTIONS,
  MOOD_HARMONIES,
  PRODUCT_VARIANTS,
  SCENE_PRESETS,
  SENSORY_PROPS,
} from '../data/presets';
import { GeneratedConcept, StudioConfig } from '../types';

export function buildLivePrompt(config: StudioConfig): GeneratedConcept {
  const variant =
    PRODUCT_VARIANTS.find((v) => v.id === config.variantId) ?? PRODUCT_VARIANTS[0];
  const scene =
    SCENE_PRESETS.find((s) => s.id === config.sceneId) ?? SCENE_PRESETS[0];
  const lighting =
    LIGHTING_OPTIONS.find((l) => l.id === config.lightingId) ?? LIGHTING_OPTIONS[0];
  const camera =
    CAMERA_OPTIONS.find((c) => c.id === config.cameraId) ?? CAMERA_OPTIONS[0];
  const mood =
    MOOD_HARMONIES.find((m) => m.id === config.moodId) ?? MOOD_HARMONIES[0];

  const propSnippets = SENSORY_PROPS.filter((p) =>
    config.selectedProps.includes(p.id)
  ).map((p) => p.snippet);

  const textLayoutDirective =
    config.textPlacement === 'clean-space'
      ? 'generous uncluttered clean negative space in the upper third specifically reserved for Khmer Facebook advertising typography overlay, zero baked-in gibberish text'
      : config.textPlacement === 'integrated-khmer'
        ? `luxury commercial poster composition with intentional upper headline typography zone reserved for "${config.khmerHeadline || 'Sneh Perfume Lotion'}" and subtle balanced bottom tagline margin`
        : `refined minimalist luxury magazine typography subtly balanced in the upper composition ("${config.subHeadline || 'PERFUME LOTION'}") with generous airy margins`;

  const brandNote = config.brandLogoInclude
    ? 'preserving pristine crisp luxury cosmetic tube packaging fidelity and delicate calligraphic branding'
    : 'clean unbranded minimal tube silhouette ready for post-production logo compositing';

  const coreParts = [
    `High-end luxury Facebook commercial advertising photograph of ${variant.packagingDescription}`,
    scene.promptSnippet,
    propSnippets.length > 0 ? `styled with ${propSnippets.join(', ')}` : '',
    lighting.snippet,
    mood.snippet,
    camera.snippet,
    brandNote,
    textLayoutDirective,
    config.customNote.trim() ? config.customNote.trim() : '',
    'ultra-detailed 8k haute-parfumerie commercial retouching, natural specular highlights, refined tactile materials, thumb-stopping luxury beauty editorial aesthetic',
  ].filter(Boolean);

  let masterPrompt = '';
  switch (config.engineId) {
    case 'midjourney':
      masterPrompt = `${coreParts.join(', ')} --ar ${config.aspectRatio} --style raw --s 250 --v 6.1`;
      break;
    case 'flux':
      masterPrompt = `Commercial beauty advertising photograph in ${config.aspectRatio} framing. ${coreParts.join('. ')}.`;
      break;
    case 'gemini-image':
      masterPrompt = `Create a photorealistic luxury skincare & perfume lotion Facebook Ad image (${config.aspectRatio} aspect ratio). Subject: ${variant.packagingDescription}. Scene & Set Design: ${scene.promptSnippet}${propSnippets.length > 0 ? `, accented with ${propSnippets.join(', ')}` : ''}. Lighting & Color: ${lighting.snippet}; ${mood.snippet}. Camera: ${camera.snippet}. Composition: ${textLayoutDirective}.${config.customNote.trim() ? ` Additional art direction: ${config.customNote.trim()}.` : ''}`;
      break;
    case 'ideogram':
      masterPrompt = `Luxury commercial Facebook Ad poster design (${config.aspectRatio}). ${coreParts.join(', ')}.`;
      break;
    case 'dalle':
    default:
      masterPrompt = `A breathtaking high-fashion cosmetic advertising photograph formatted in ${config.aspectRatio} aspect ratio. ${coreParts.join('. ')}.`;
      break;
  }

  const negativePrompt =
    'cheap plastic glare, distorted tube shape, misspelled gibberish text, blurry label, deformed fingers, extra hands, harsh neon colors, cluttered busy background, low resolution, muddy shadows, oversaturated pink, watermark, stock photo look';

  const variantLabelKm =
    config.variantId === 'rosy-violet'
      ? 'Rosy Violet ផ្កាកុលាបស្វាយ'
      : config.variantId === 'black-vanilla'
        ? 'Black Vanilla វ៉ានីឡាខ្មៅ'
        : 'Sស្នេហ៍h Perfume Lotion ទាំង ២ ក្លិន (Rosy Violet & Black Vanilla)';

  const fbPrimaryCopyKm = `${config.khmerHeadline || 'ក្រអូបជឿជាក់ ស្បែកទន់ម៉ដ្ឋពេញមួយថ្ងៃ'}\nលាបភ្លាម ជ្រាបចូលស្បែកភ្លែត មិនស្អិត ផ្តល់សំណើមជ្រៅ រួមជាមួយក្លិនទឹកអប់ប្រណិត ${variantLabelKm} ជាប់បានយូរ។\nឆាតមកឥឡូវនេះ ដើម្បីទទួលបានការណែនាំក្លិនដែលស័ក្តិសមនឹងស្ទីលរបស់អ្នក។`;

  return {
    id: `studio-${Date.now()}`,
    titleKm: scene.nameKm,
    titleEn: scene.nameEn,
    visualDirectionKm: `${scene.subtitleKm} · ប្រើពន្លឺ ${lighting.nameKm} និង ${camera.nameKm} ដើម្បីឲ្យដបឡេលេចធ្លោខ្លាំងលើ Facebook Feed។`,
    visualDirectionEn: `${scene.subtitleEn} paired with ${lighting.nameEn.toLowerCase()} and ${camera.nameEn.toLowerCase()}.`,
    masterPrompt,
    negativePrompt,
    khmerHeadline: config.khmerHeadline,
    subHeadline: config.subHeadline,
    fbPrimaryCopyKm,
    fbCtaKm: 'ឆាតសួរព័ត៌មាន',
    cameraSpec: camera.nameEn,
    lightingSpec: lighting.nameEn,
    palette: mood.swatches,
    engineId: config.engineId,
    aspectRatio: config.aspectRatio,
    variantId: config.variantId,
    createdAt: new Date().toISOString(),
    source: 'studio',
  };
}

export function createFreshRandomStudioConfig(
  current: StudioConfig,
  recentSceneIds: string[]
): StudioConfig {
  const availableScenes = SCENE_PRESETS.filter(
    (s) => s.id !== current.sceneId && !recentSceneIds.slice(-4).includes(s.id)
  );
  const pool = availableScenes.length > 0 ? availableScenes : SCENE_PRESETS;
  const pickedScene = pool[Math.floor(Math.random() * pool.length)];

  const lightingChoices = LIGHTING_OPTIONS.filter((l) => l.id !== current.lightingId);
  const pickedLighting =
    lightingChoices[Math.floor(Math.random() * lightingChoices.length)] ??
    LIGHTING_OPTIONS[0];

  const cameraChoices = CAMERA_OPTIONS.filter((c) => c.id !== current.cameraId);
  const pickedCamera =
    cameraChoices[Math.floor(Math.random() * cameraChoices.length)] ?? CAMERA_OPTIONS[0];

  const moodChoices = MOOD_HARMONIES.filter((m) => m.id !== current.moodId);
  const pickedMood =
    moodChoices[Math.floor(Math.random() * moodChoices.length)] ?? MOOD_HARMONIES[0];

  const headlineChoices = KHMER_HEADLINE_PRESETS.filter(
    (h) => h.headline !== current.khmerHeadline
  );
  const pickedHeadline =
    headlineChoices[Math.floor(Math.random() * headlineChoices.length)] ??
    KHMER_HEADLINE_PRESETS[0];

  return {
    ...current,
    sceneId: pickedScene.id,
    lightingId: pickedScene.recommendedLighting || pickedLighting.id,
    cameraId: pickedCamera.id,
    moodId: pickedMood.id,
    selectedProps: pickedScene.recommendedProps,
    khmerHeadline: pickedHeadline.headline,
    subHeadline: pickedHeadline.subHeadline,
  };
}

export function exportConceptAsText(concept: GeneratedConcept): void {
  const content = [
    `SNEH ATELIER — FACEBOOK ADS IMAGE PROMPT BRIEF`,
    `============================================================`,
    `Concept: ${concept.titleKm} (${concept.titleEn})`,
    `Engine: ${concept.engineId} | Ratio: ${concept.aspectRatio} | Variant: ${concept.variantId}`,
    `Camera: ${concept.cameraSpec}`,
    `Lighting: ${concept.lightingSpec}`,
    `Palette: ${concept.palette.join(', ')}`,
    ``,
    `[MASTER IMAGE PROMPT]`,
    concept.masterPrompt,
    ``,
    `[NEGATIVE PROMPT]`,
    concept.negativePrompt,
    ``,
    `[KHMER AD HEADLINE]`,
    concept.khmerHeadline,
    `Sub-headline: ${concept.subHeadline}`,
    ``,
    `[FACEBOOK PRIMARY COPY (KHMER)]`,
    concept.fbPrimaryCopyKm,
    `CTA: ${concept.fbCtaKm}`,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sneh-ad-prompt-${concept.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportVaultAsJson(items: GeneratedConcept[]): void {
  const blob = new Blob([JSON.stringify(items, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sneh-atelier-vault-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

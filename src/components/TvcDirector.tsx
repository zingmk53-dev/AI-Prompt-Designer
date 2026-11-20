import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Copy,
  Download,
  Film,
  ImagePlus,
  Loader2,
  Mic,
  Music,
  Shuffle,
  Sparkles,
  Type as TypeIcon,
  Volume2,
  Wand2,
  X,
} from 'lucide-react';
import {
  PRODUCT_VARIANTS,
  REF_IMAGES,
  TVC_DURATIONS,
  TVC_STYLES,
  TVC_VFX_CGI_PRESETS,
  VIDEO_ENGINES,
} from '../data/presets';
import {
  GeneratedConcept,
  GeneratedTvc,
  Language,
  ProductVariantId,
  TvcDurationId,
  TvcStyleId,
  TvcVfxId,
  VideoEngineId,
} from '../types';
import { compressImageFile } from '../utils/imageResize';

interface TvcDirectorProps {
  lang: Language;
  tvc: GeneratedTvc | null;
  onSetTvc: (tvc: GeneratedTvc) => void;
  avoidTitles: string[];
  onAddAvoidTitles: (titles: string[]) => void;
  onSaveToVault: (concept: GeneratedConcept) => void;
}

function buildTvcTextExport(tvc: GeneratedTvc): string {
  const engineLabel =
    VIDEO_ENGINES.find((e) => e.id === tvc.videoEngine)?.label ?? tvc.videoEngine;
  const durationLabel =
    TVC_DURATIONS.find((d) => d.id === tvc.durationId)?.labelEn ?? tvc.durationId;
  const styleLabel =
    TVC_STYLES.find((s) => s.id === tvc.styleId)?.nameEn ?? tvc.styleId;
  const vfxLabel =
    TVC_VFX_CGI_PRESETS.find((v) => v.id === tvc.vfxPresetId)?.nameEn ??
    tvc.vfxPresetId;

  const shotLines = tvc.shots
    .map(
      (shot) =>
        `------------------------------------------------------------\n` +
        `SHOT ${String(shot.shotNumber).padStart(2, '0')} | ${shot.timecode}\n` +
        `Role: ${shot.roleKm} (${shot.roleEn})\n` +
        `Camera: ${shot.cameraMovement}\n` +
        `VFX & CGI: ${shot.vfxCgiCue || '-'}\n` +
        `Voiceover (KH): "${shot.voiceoverKm}"\n` +
        `On-Screen Text (KH): ${shot.onScreenTextKm}\n` +
        `SFX / Audio Cue: ${shot.sfxCue}\n\n` +
        `AI VIDEO PROMPT:\n${shot.videoPrompt}\n`
    )
    .join('\n');

  return [
    '============================================================',
    'SNEH ATELIER — MODERN TVC DIRECTOR BLUEPRINT (VFX & CGI)',
    '============================================================',
    `Campaign Title (KH): ${tvc.titleKm}`,
    `Campaign Title (EN): ${tvc.titleEn}`,
    `Video Engine: ${engineLabel} | Format: ${durationLabel} | Ratio: ${tvc.aspectRatio}`,
    `Film Style: ${styleLabel}`,
    `VFX & CGI Signature: ${vfxLabel}`,
    `Color Grading Palette: ${tvc.palette.join(' · ')}`,
    '',
    'DIRECTOR LOGLINE (KH):',
    tvc.loglineKm,
    '',
    'DIRECTOR LOGLINE (EN):',
    tvc.loglineEn,
    '',
    'VFX & CGI PIPELINE DIRECTION:',
    `${tvc.vfxCgiDirectionKm || ''} / ${tvc.vfxCgiDirectionEn || ''}`,
    '',
    'MUSIC & SOUND DESIGN:',
    `${tvc.musicDirectionKm} / ${tvc.musicDirectionEn}`,
    '',
    'CLOSING PACKSHOT CTA (KH):',
    tvc.ctaLineKm,
    '',
    '============================================================',
    'MASTER ALL-IN-ONE AI VIDEO PROMPT',
    '============================================================',
    tvc.masterVideoPrompt,
    '',
    '============================================================',
    'TIMED SCENE-BY-SCENE STORYBOARD',
    '============================================================',
    shotLines,
  ].join('\n');
}

function downloadTvcScript(tvc: GeneratedTvc): void {
  const content = buildTvcTextExport(tvc);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sneh-tvc-vfx-${tvc.videoEngine}-${tvc.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function tvcToVaultConcept(
  tvc: GeneratedTvc,
  variantId: ProductVariantId
): GeneratedConcept {
  const shotSummary = tvc.shots
    .map(
      (s) =>
        `[${s.timecode}] ${s.roleKm}\nVFX/CGI: ${s.vfxCgiCue || '-'}\nVO: "${s.voiceoverKm}" | Text: ${s.onScreenTextKm}`
    )
    .join('\n\n');

  const engineLabel =
    VIDEO_ENGINES.find((e) => e.id === tvc.videoEngine)?.label ?? tvc.videoEngine;

  return {
    id: tvc.id,
    titleKm: `[TVC · ${engineLabel}] ${tvc.titleKm}`,
    titleEn: `[TVC · ${engineLabel}] ${tvc.titleEn}`,
    visualDirectionKm: `${tvc.loglineKm}${tvc.vfxCgiDirectionKm ? ` · VFX/CGI: ${tvc.vfxCgiDirectionKm}` : ''}`,
    visualDirectionEn: `${tvc.loglineEn}${tvc.vfxCgiDirectionEn ? ` · VFX/CGI: ${tvc.vfxCgiDirectionEn}` : ''}`,
    masterPrompt: tvc.masterVideoPrompt,
    negativePrompt:
      'flickering packaging text, distorted perfume lotion tube, warped hands, low-res CGI artifacts, fake plastic physics, harsh flat fluorescent lighting',
    khmerHeadline: tvc.ctaLineKm,
    subHeadline: `${engineLabel.toUpperCase()} · ${tvc.aspectRatio} TVC VFX`,
    fbPrimaryCopyKm: `${tvc.loglineKm}\n\n${shotSummary}\n\n${tvc.ctaLineKm}`,
    fbCtaKm: tvc.ctaLineKm,
    cameraSpec: tvc.shots[0]?.cameraMovement || '120fps cinema slow-motion dolly',
    lightingSpec: tvc.vfxCgiDirectionEn || tvc.musicDirectionEn,
    palette: tvc.palette,
    engineId: 'gemini-image',
    aspectRatio: tvc.aspectRatio,
    variantId,
    createdAt: tvc.createdAt,
    source: 'ai-fresh',
  };
}

export function TvcDirector({
  lang,
  tvc,
  onSetTvc,
  avoidTitles,
  onAddAvoidTitles,
  onSaveToVault,
}: TvcDirectorProps) {
  const [variantId, setVariantId] = useState<ProductVariantId>('duo');
  const [videoEngine, setVideoEngine] = useState<VideoEngineId>('veo3');
  const [durationId, setDurationId] = useState<TvcDurationId>('15s-vertical');

  // Auto-selected by default so the tool randomly crafts modern VFX & CGI concepts automatically
  const [styleId, setStyleId] = useState<TvcStyleId>('auto');
  const [vfxId, setVfxId] = useState<TvcVfxId>('auto');
  const [showManualOverrides, setShowManualOverrides] = useState(false);

  const [recentStyleIds, setRecentStyleIds] = useState<string[]>([]);
  const [recentVfxIds, setRecentVfxIds] = useState<string[]>([]);

  const [customBrief, setCustomBrief] = useState('');
  const [customImageDataUrl, setCustomImageDataUrl] = useState<string | undefined>(
    undefined
  );
  const [customImageName, setCustomImageName] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeDuration =
    TVC_DURATIONS.find((d) => d.id === durationId) ?? TVC_DURATIONS[0];
  const activeEngine =
    VIDEO_ENGINES.find((e) => e.id === videoEngine) ?? VIDEO_ENGINES[0];
  const isFullAuto = styleId === 'auto' && vfxId === 'auto';

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  const handleGenerateTvc = async (overrides?: {
    variantId?: ProductVariantId;
    customImageDataUrl?: string;
    styleId?: TvcStyleId;
    vfxId?: TvcVfxId;
    durationId?: TvcDurationId;
    videoEngine?: VideoEngineId;
    customBrief?: string;
  }) => {
    const targetVariant = overrides?.variantId ?? variantId;
    const targetEngine = overrides?.videoEngine ?? videoEngine;
    const targetDurationId = overrides?.durationId ?? durationId;
    const targetStyle = overrides?.styleId ?? styleId;
    const targetVfx = overrides?.vfxId ?? vfxId;
    const targetBrief = overrides?.customBrief ?? customBrief;
    const targetImage =
      overrides && 'customImageDataUrl' in overrides
        ? overrides.customImageDataUrl
        : customImageDataUrl;
    const targetAspect =
      TVC_DURATIONS.find((d) => d.id === targetDurationId)?.aspectRatio ?? '9:16';

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const payload = JSON.stringify({
        variantId: targetVariant,
        videoEngine: targetEngine,
        durationId: targetDurationId,
        styleId: targetStyle,
        vfxId: targetVfx,
        aspectRatio: targetAspect,
        customBrief: targetBrief,
        avoidTitles,
        avoidStyleIds: recentStyleIds.slice(-4),
        avoidVfxIds: recentVfxIds.slice(-5),
        customImageDataUrl: targetImage,
      });

      let response: Response | null = null;
      let lastFetchError: unknown = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await fetch('/api/generate-tvc-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          });
          break;
        } catch (err) {
          lastFetchError = err;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 900));
          }
        }
      }

      if (!response) {
        throw lastFetchError instanceof Error
          ? lastFetchError
          : new Error(
              lang === 'km'
                ? 'ការតភ្ជាប់ត្រូវបានផ្អាក សូមចុចបង្កើតម្តងទៀត'
                : 'Connection interrupted. Please try again.'
            );
      }

      const raw = await response.text();
      let data: { tvc?: GeneratedTvc; error?: string } = {};
      try {
        data = raw.trim() ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          lang === 'km'
            ? 'ទទួលបានទិន្នន័យមិនពេញលេញ សូមសាកល្បងម្តងទៀត'
            : 'Incomplete server response. Please try again.'
        );
      }

      if (!response.ok || data.error || !data.tvc) {
        throw new Error(
          data.error ||
            (lang === 'km'
              ? 'មិនអាចបង្កើត Prompt TVC បានទេ'
              : 'Failed to generate TVC blueprint')
        );
      }

      onSetTvc(data.tvc);
      onAddAvoidTitles([data.tvc.titleEn, data.tvc.titleKm].filter(Boolean));
      if (data.tvc.styleId && data.tvc.styleId !== 'auto') {
        setRecentStyleIds((prev) => [...prev.slice(-5), data.tvc!.styleId]);
      }
      if (data.tvc.vfxPresetId && data.tvc.vfxPresetId !== 'auto') {
        setRecentVfxIds((prev) => [...prev.slice(-6), data.tvc!.vfxPresetId]);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : lang === 'km'
            ? 'មានបញ្ហាក្នុងការបង្កើត Prompt TVC សូមព្យាយាមម្តងទៀត'
            : 'Unable to generate TVC prompt right now.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        lang === 'km'
          ? 'សូមជ្រើសរើសឯកសារជារូបភាព (JPG, PNG, WebP)'
          : 'Please upload a valid image file (JPG, PNG, WebP).'
      );
      return;
    }

    try {
      const dataUrl = await compressImageFile(file, 1024);
      setCustomImageDataUrl(dataUrl);
      setCustomImageName(file.name);
      setVariantId('custom');
      await handleGenerateTvc({
        variantId: 'custom',
        customImageDataUrl: dataUrl,
      });
    } catch {
      setErrorMsg(
        lang === 'km'
          ? 'មិនអាចអានរូបភាពនេះបានទេ សូមជ្រើសរូបភាពផ្សេង'
          : 'Unable to process this image. Please try another photo.'
      );
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processImageFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processImageFile(file);
    }
  };

  const handleSelectReferenceImage = async (
    label: string,
    nextVariant: ProductVariantId
  ) => {
    setVariantId(nextVariant);
    setCustomImageDataUrl(undefined);
    setCustomImageName(label);
    await handleGenerateTvc({
      variantId: nextVariant,
      customImageDataUrl: undefined,
    });
  };

  const handleRandomAutoVfx = () => {
    setStyleId('auto');
    setVfxId('auto');
    void handleGenerateTvc({ styleId: 'auto', vfxId: 'auto' });
  };

  const handleSaveTvc = () => {
    if (!tvc) return;
    onSaveToVault(tvcToVaultConcept(tvc, variantId));
    setSavedId(tvc.id);
    setTimeout(() => setSavedId((prev) => (prev === tvc.id ? null : prev)), 2200);
  };

  const currentEngineObj = tvc
    ? VIDEO_ENGINES.find((e) => e.id === tvc.videoEngine)
    : activeEngine;
  const currentStyleObj = tvc
    ? TVC_STYLES.find((s) => s.id === tvc.styleId)
    : undefined;
  const currentVfxObj = tvc
    ? TVC_VFX_CGI_PRESETS.find((v) => v.id === tvc.vfxPresetId)
    : undefined;

  return (
    <div className="atelier-enter space-y-6">
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E2DC] dark:border-[#382E36] pb-5">
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-[#9E3B5B] dark:text-[#E584A4]">
            {lang === 'km'
              ? 'Sneh TVC Director · Auto VFX & CGI · Veo 3 · Kling · Runway · Sora'
              : 'Sneh TVC Director · Auto VFX & CGI · Veo 3 · Kling · Runway · Sora'}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#221820] dark:text-[#F5EFF3]">
            {lang === 'km'
              ? 'អ្នកដឹកនាំសរសេរ Prompt TVC · Auto VFX & CGI'
              : 'Modern TVC Director · Auto Random VFX & CGI'}
          </h1>
          <p className="text-sm text-[#5E525A] dark:text-[#C4B7C0] max-w-2xl leading-relaxed">
            {lang === 'km'
              ? 'Tool ជ្រើសរើសស្ទីល និងបច្ចេកទេស VFX / CGI ទំនើបដោយស្វ័យប្រវត្តិ (Houdini Fluid, FOOH 3D, Crystal Caustics, Chrome Morph, ផ្កាកុលាប 3D) មិនបាច់ពិបាកជ្រើស គ្រាន់តែចុចបង្កើត ឬ Upload រូបផលិតផលភ្លាមៗ។'
              : 'Auto-directs modern luxury TVCs with randomized cinema VFX & CGI simulations (Houdini fluids, FOOH 3D, crystal raytracing, liquid chrome, botanical bloom) plus timed shots and Khmer voiceover.'}
          </p>
        </div>

        <button
          type="button"
          disabled={isGenerating}
          onClick={handleRandomAutoVfx}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Shuffle className="w-4 h-4 text-[#E8B7C7] dark:text-[#9E3B5B]" aria-hidden="true" />
          )}
          <span>
            {isGenerating
              ? lang === 'km'
                ? 'កំពុងបង្កើត TVC + VFX/CGI...'
                : 'Directing VFX/CGI TVC...'
              : lang === 'km'
                ? 'Random TVC · VFX & CGI ថ្មី'
                : 'Random VFX & CGI TVC'}
          </span>
        </button>
      </div>

      {/* Main 2-Column TVC Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Zero-Friction Auto VFX/CGI Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Product Photo Auto-TVC Dropzone */}
          <section className="atelier-panel bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
                {lang === 'km'
                  ? '១. Upload រូបផលិតផល ឬជ្រើសគំរូ Sស្នេហ៍h'
                  : '1. Upload Product Photo or Pick Sneh Bottle'}
              </h2>
              <p className="text-xs text-[#6A5E66] dark:text-[#A99AA4] mt-0.5">
                {lang === 'km'
                  ? 'Upload រូបផលិតផលចូល Tool នឹងចាប់រូបរាងដប និងច្នៃ VFX & CGI TVC ស្វ័យប្រវត្តិភ្លាមៗ'
                  : 'Drop any product photo for instant packaging-locked Auto VFX & CGI TVC'}
              </p>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border border-dashed rounded-xl p-4 transition-colors cursor-pointer ${
                isDragging
                  ? 'border-[#9E3B5B] dark:border-[#E584A4] bg-[#FAF4F6] dark:bg-[#2E212B]'
                  : 'border-[#D5CFC7] dark:border-[#493D47] bg-[#FAF9F7] dark:bg-[#161215] hover:border-[#9E3B5B] dark:hover:border-[#E584A4]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {customImageDataUrl ? (
                <div className="flex items-center gap-3.5">
                  <img
                    src={customImageDataUrl}
                    alt={customImageName || 'Uploaded product'}
                    className="w-16 h-16 rounded-lg object-cover border border-[#E6E2DC] dark:border-[#382E36] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3] truncate">
                      {customImageName ||
                        (lang === 'km' ? 'រូបផលិតផលរបស់អ្នក' : 'Your product photo')}
                    </div>
                    <div className="text-[11px] text-[#9E3B5B] dark:text-[#E584A4] mt-0.5">
                      {lang === 'km'
                        ? 'ចាក់សោដបនេះក្នុងគ្រប់ឈុត VFX/CGI · ចុចដើម្បីប្តូររូប'
                        : 'Locked across all VFX/CGI shots · Click to replace'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomImageDataUrl(undefined);
                      setCustomImageName(undefined);
                      setVariantId('duo');
                    }}
                    aria-label="Remove uploaded image"
                    className="p-1.5 text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3] rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] flex items-center justify-center shrink-0">
                    <ImagePlus
                      className="w-5 h-5 text-[#9E3B5B] dark:text-[#E584A4]"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                      {lang === 'km'
                        ? 'ចុច Upload ឬអូសរូបផលិតផលចូល (Auto VFX TVC)'
                        : 'Upload or Drop Product Photo (Auto VFX TVC)'}
                    </div>
                    <div className="text-[11px] text-[#6A5E66] dark:text-[#A99AA4] mt-0.5">
                      {lang === 'km'
                        ? 'JPG, PNG, WebP · បង្រួមរូបស្វ័យប្រវត្តិលឿនលើទូរស័ព្ទ'
                        : 'JPG, PNG, WebP · Auto-optimized for fast mobile response'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Built-in Sneh Bottle Variant Selector */}
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_VARIANTS.map((variant) => {
                const isSelected = !customImageDataUrl && variantId === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      setCustomImageDataUrl(undefined);
                      setCustomImageName(undefined);
                      setVariantId(variant.id);
                    }}
                    className={`text-left p-2 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                        : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#231C22] hover:border-[#9E3B5B]/50 dark:hover:border-[#E584A4]/50'
                    }`}
                  >
                    <img
                      src={variant.previewImage}
                      alt={variant.nameEn}
                      className="w-full h-14 object-cover rounded-md mb-1.5"
                    />
                    <div className="text-[11px] font-semibold text-[#221820] dark:text-[#F5EFF3] leading-tight line-clamp-1">
                      {lang === 'km' ? variant.nameKm : variant.nameEn}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 1-Tap Quick Launch from Reference Ads */}
            <div className="pt-2 border-t border-[#EFECE7] dark:border-[#322930] flex items-center justify-between gap-2 text-[11px] text-[#6A5E66] dark:text-[#A99AA4]">
              <span>
                {lang === 'km' ? 'បង្កើត Auto VFX TVC ពីរូបគំរូ៖' : '1-tap Auto VFX TVC:'}
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { img: REF_IMAGES.creamSwirl, label: 'Ref 1', v: 'duo' as ProductVariantId },
                  {
                    img: REF_IMAGES.hydrationPlinth,
                    label: 'Ref 2',
                    v: 'black-vanilla' as ProductVariantId,
                  },
                  {
                    img: REF_IMAGES.staircasePodium,
                    label: 'Ref 3',
                    v: 'rosy-violet' as ProductVariantId,
                  },
                ].map((ref) => (
                  <button
                    key={ref.label}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleSelectReferenceImage(ref.label, ref.v)}
                    title={
                      lang === 'km'
                        ? `បង្កើត TVC ពី ${ref.label}`
                        : `Direct TVC from ${ref.label}`
                    }
                    className="w-7 h-7 rounded-md overflow-hidden border border-[#E6E2DC] dark:border-[#382E36] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] transition-colors cursor-pointer shrink-0"
                  >
                    <img
                      src={ref.img}
                      alt={ref.label}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 2. Auto Random VFX & CGI Brain + Video Engine & Duration */}
          <section className="atelier-panel bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 space-y-5">
            {/* Auto VFX & CGI Director Mode Banner (Default Active) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
                  {lang === 'km'
                    ? '២. គំនិត VFX & CGI ស្វ័យប្រវត្តិតាម Tool'
                    : '2. Auto VFX & CGI Creative Director'}
                </h2>
                {!isFullAuto && (
                  <button
                    type="button"
                    onClick={() => {
                      setStyleId('auto');
                      setVfxId('auto');
                    }}
                    className="text-[11px] font-semibold text-[#9E3B5B] dark:text-[#E584A4] hover:underline cursor-pointer"
                  >
                    {lang === 'km' ? 'ត្រឡប់ទៅ Auto វិញ' : 'Reset to Auto'}
                  </button>
                )}
              </div>

              <div
                className={`p-3.5 rounded-lg border transition-colors ${
                  isFullAuto
                    ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                    : 'border-[#E6E2DC] dark:border-[#382E36] bg-[#FAF9F7] dark:bg-[#161215]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <Wand2
                    className="w-4 h-4 text-[#9E3B5B] dark:text-[#E584A4] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                      {isFullAuto
                        ? lang === 'km'
                          ? 'Auto Selected · Random VFX & CGI ថ្មីរហូតតាមគំនិត Tool'
                          : 'Auto Selected · Random Luxury VFX & CGI Active'
                        : lang === 'km'
                          ? 'កំពុងប្រើការកំណត់ VFX / ស្ទីលដោយខ្លួនឯង'
                          : 'Custom Style / VFX Selection Active'}
                    </div>
                    <p className="text-[11px] text-[#5E525A] dark:text-[#C4B7C0] leading-relaxed">
                      {lang === 'km'
                        ? 'រាល់ពេលចុចបង្កើត Tool នឹងចៃដន្យផ្គូផ្គងស្ទីលភាពយន្ត + បច្ចេកទេស VFX/CGI ថ្មីមិនជាន់គ្នា (មាស 24K រលាយ, គ្រីម Zero-G, FOOH 3D, គ្រីស្តាល់ Prism, ផ្កាកុលាប 3D, Chrome រាវ, ធូលីផ្កាយ ឬ ពពុះសំណើម 3D)។'
                        : 'Each run automatically pairs a fresh non-repeating cinema style with high-end VFX/CGI (24K molten gold, Zero-G cream fluid, FOOH 3D, crystal caustics, botanical bloom, liquid chrome, stardust mist, or hydration spheres).'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Engine */}
            <div className="space-y-2.5 pt-4 border-t border-[#EFECE7] dark:border-[#322930]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
                  {lang === 'km' ? '៣. AI Video Engine' : '3. Target AI Video Generator'}
                </h2>
                <span className="text-[11px] text-[#9E3B5B] dark:text-[#E584A4] font-medium">
                  {activeEngine.label}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VIDEO_ENGINES.map((engine) => {
                  const isSelected = videoEngine === engine.id;
                  return (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => setVideoEngine(engine.id)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C] text-[#221820] dark:text-[#F5EFF3]'
                          : 'border-[#E6E2DC] dark:border-[#382E36] bg-[#FAF9F7] dark:bg-[#161215] text-[#5E525A] dark:text-[#C4B7C0] hover:border-[#9E3B5B]/50 dark:hover:border-[#E584A4]/50'
                      }`}
                    >
                      {engine.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#6A5E66] dark:text-[#A99AA4]">
                {lang === 'km' ? activeEngine.noteKm : activeEngine.noteEn}
              </p>
            </div>

            {/* Duration & Ratio */}
            <div className="space-y-2.5 pt-4 border-t border-[#EFECE7] dark:border-[#322930]">
              <h2 className="text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
                {lang === 'km' ? '៤. រយៈពេល & ទំហំ TVC' : '4. Duration & Aspect Ratio'}
              </h2>
              <div className="space-y-2">
                {TVC_DURATIONS.map((dur) => {
                  const isSelected = durationId === dur.id;
                  return (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => setDurationId(dur.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                          : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#231C22] hover:border-[#9E3B5B]/50 dark:hover:border-[#E584A4]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                          {lang === 'km' ? dur.labelKm : dur.labelEn}
                        </span>
                        <span className="text-[11px] font-mono text-[#6A5E66] dark:text-[#A99AA4] tabular-nums shrink-0">
                          {dur.shotsCount} {lang === 'km' ? 'ឈុត' : 'shots'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6A5E66] dark:text-[#A99AA4] mt-0.5">
                        {lang === 'km' ? dur.descKm : dur.descEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Manual Override Drawer (Hidden by default to keep Auto effortless) */}
            <div className="pt-4 border-t border-[#EFECE7] dark:border-[#322930]">
              <button
                type="button"
                onClick={() => setShowManualOverrides((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 text-xs font-semibold text-[#5E525A] dark:text-[#C4B7C0] hover:text-[#221820] dark:hover:text-[#F5EFF3] cursor-pointer"
              >
                <span>
                  {lang === 'km'
                    ? 'ជ្រើសរើស VFX / CGI និងស្ទីលដោយខ្លួនឯង (មិនបាច់ចុចក៏បាន — មាន Auto ស្រាប់)'
                    : 'Optional: Lock Specific VFX/CGI or Film Style'}
                </span>
                {showManualOverrides ? (
                  <ChevronUp className="w-4 h-4 shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
              </button>

              {showManualOverrides && (
                <div className="mt-4 space-y-5">
                  {/* Manual VFX/CGI Selector */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                      {lang === 'km' ? 'បច្ចេកទេស VFX & CGI' : 'VFX & CGI Simulation'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVfxId('auto')}
                        className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer sm:col-span-2 ${
                          vfxId === 'auto'
                            ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                            : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#231C22]'
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#9E3B5B] dark:text-[#E584A4]">
                          {lang === 'km'
                            ? 'Auto Random VFX & CGI (តាមគំនិត Tool)'
                            : 'Auto Random VFX & CGI (Tool Decides)'}
                        </div>
                      </button>
                      {TVC_VFX_CGI_PRESETS.map((preset) => {
                        const isSelected = vfxId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setVfxId(preset.id)}
                            className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                              isSelected
                                ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                                : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#231C22] hover:border-[#9E3B5B]/50 dark:hover:border-[#E584A4]/50'
                            }`}
                          >
                            <div className="text-[11px] font-semibold text-[#221820] dark:text-[#F5EFF3] leading-snug">
                              {lang === 'km' ? preset.nameKm : preset.nameEn}
                            </div>
                            <p className="text-[11px] text-[#6A5E66] dark:text-[#A99AA4] mt-0.5 line-clamp-2">
                              {lang === 'km' ? preset.descKm : preset.descEn}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual Film Style Selector */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                      {lang === 'km' ? 'ស្ទីលភាពយន្ត TVC' : 'Commercial Film Style'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStyleId('auto')}
                        className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer sm:col-span-2 ${
                          styleId === 'auto'
                            ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                            : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#231C22]'
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#9E3B5B] dark:text-[#E584A4]">
                          {lang === 'km'
                            ? 'Auto Random ស្ទីលភាពយន្ត (តាមគំនិត Tool)'
                            : 'Auto Random Film Style (Tool Decides)'}
                        </div>
                      </button>
                      {TVC_STYLES.map((st) => {
                        const isSelected = styleId === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setStyleId(st.id)}
                            className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                              isSelected
                                ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                                : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#231C22] hover:border-[#9E3B5B]/50 dark:hover:border-[#E584A4]/50'
                            }`}
                          >
                            <div className="text-[11px] font-semibold text-[#221820] dark:text-[#F5EFF3] leading-snug">
                              {lang === 'km' ? st.nameKm : st.nameEn}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {st.palette.map((hex) => (
                                <span
                                  key={hex}
                                  className="w-3 h-3 rounded-full border border-black/10 dark:border-white/15"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional Custom Director Note */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="tvc-custom-brief"
                      className="block text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]"
                    >
                      {lang === 'km'
                        ? 'គំនិតបន្ថែមពីអ្នក (Optional)'
                        : 'Optional Custom Note'}
                    </label>
                    <textarea
                      id="tvc-custom-brief"
                      rows={2}
                      value={customBrief}
                      onChange={(e) => setCustomBrief(e.target.value)}
                      placeholder={
                        lang === 'km'
                          ? 'ឧទាហរណ៍៖ បញ្ចប់ដោយប្រូម៉ូសិនទិញ ១ ថែម ១ ឬឈុតនារីដើរកាត់ភ្នំពេញ...'
                          : 'e.g., End with Duo Gift promo, or twilight rooftop reveal...'
                      }
                      className="w-full px-3 py-2 text-xs text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg focus:outline-none focus:border-[#9E3B5B] dark:focus:border-[#E584A4] placeholder:text-[#8E828A] dark:placeholder:text-[#7F707B]"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerateTvc()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles
                  className="w-4 h-4 text-[#E8B7C7] dark:text-[#9E3B5B]"
                  aria-hidden="true"
                />
              )}
              <span>
                {isGenerating
                  ? lang === 'km'
                    ? 'កំពុងច្នៃ VFX & CGI TVC...'
                    : 'Directing VFX & CGI TVC...'
                  : isFullAuto
                    ? lang === 'km'
                      ? `បង្កើត Auto TVC · Random VFX/CGI (${activeDuration.aspectRatio})`
                      : `Generate Auto VFX/CGI TVC (${activeDuration.aspectRatio})`
                    : lang === 'km'
                      ? `បង្កើត Prompt TVC (${activeDuration.aspectRatio})`
                      : `Generate ${activeDuration.aspectRatio} TVC`}
              </span>
            </button>
          </section>
        </div>

        {/* RIGHT COLUMN: Director's TVC Blueprint Output */}
        <div className="lg:col-span-7 space-y-5">
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-3 p-4 rounded-xl border border-[#D89AAA] dark:border-[#7B3B4E] bg-[#FDF4F6] dark:bg-[#2E1B22] text-xs text-[#7D223B] dark:text-[#F5B7C8]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <div className="font-semibold">
                  {lang === 'km' ? 'មិនអាចបង្កើត TVC បានទេ' : 'TVC Generation Error'}
                </div>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {isGenerating ? (
            <div className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Loader2
                  className="w-5 h-5 animate-spin text-[#9E3B5B] dark:text-[#E584A4]"
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km'
                      ? 'Tool កំពុងជ្រើសរើស VFX & CGI ថ្មី និងដឹកនាំឈុត TVC...'
                      : 'Auto-selecting fresh VFX/CGI & directing your TVC storyboard...'}
                  </div>
                  <div className="text-xs text-[#6A5E66] dark:text-[#A99AA4] mt-0.5">
                    {activeEngine.label} · {activeDuration.aspectRatio} ·{' '}
                    {activeDuration.shotsCount} {lang === 'km' ? 'ឈុតស៊ីណេម៉ា' : 'cinema shots'}
                  </div>
                </div>
              </div>
              <div className="space-y-3 animate-pulse">
                <div className="h-6 w-2/3 bg-[#EFECE7] dark:bg-[#322930] rounded-md" />
                <div className="h-4 w-full bg-[#EFECE7] dark:bg-[#322930] rounded-md" />
                <div className="h-28 w-full bg-[#FAF9F7] dark:bg-[#161215] rounded-lg border border-[#EFECE7] dark:border-[#322930]" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="h-36 bg-[#FAF9F7] dark:bg-[#161215] rounded-lg border border-[#EFECE7] dark:border-[#322930]" />
                  <div className="h-36 bg-[#FAF9F7] dark:bg-[#161215] rounded-lg border border-[#EFECE7] dark:border-[#322930]" />
                </div>
              </div>
            </div>
          ) : !tvc ? (
            /* Empty Inviting Director Stage */
            <div className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-8 sm:p-10 text-center space-y-5">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] flex items-center justify-center">
                <Film className="w-6 h-6 text-[#9E3B5B] dark:text-[#E584A4]" aria-hidden="true" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="font-display text-xl font-semibold text-[#221820] dark:text-[#F5EFF3]">
                  {lang === 'km'
                    ? 'Auto TVC Director · Random VFX & CGI តាមគំនិត Tool'
                    : 'Auto TVC Director · Random VFX & CGI Ready'}
                </h2>
                <p className="text-xs sm:text-sm text-[#5E525A] dark:text-[#C4B7C0] leading-relaxed">
                  {lang === 'km'
                    ? 'មិនបាច់ពិបាកជ្រើសរើសទេ! ចុចប៊ូតុងខាងក្រោម ឬ Upload រូបផលិតផល Tool នឹងចៃដន្យបង្កើតគំនិត TVC ប្រណិតថ្មីភ្ជាប់មកជាមួយបច្ចេកទេស VFX & CGI កម្រិតអន្តរជាតិ ឈុតកាមេរ៉ាតាមវិនាទី និង Voiceover ខ្មែរភ្លាមៗ។'
                    : 'Zero manual setup needed. Click below or upload your product photo to automatically roll a fresh cinema TVC concept complete with luxury Houdini/3D VFX & CGI cues, timed shots, and Khmer voiceover.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-xs text-[#6A5E66] dark:text-[#A99AA4]">
                <span>{lang === 'km' ? 'Auto Random VFX & CGI' : 'Auto Random VFX & CGI'}</span>
                <span>·</span>
                <span>{lang === 'km' ? 'Master Video Prompt' : 'Master Video Prompt'}</span>
                <span>·</span>
                <span>{lang === 'km' ? 'Voiceover ខ្មែរ' : 'Khmer Voiceover'}</span>
                <span>·</span>
                <span>{lang === 'km' ? 'Script (.TXT)' : '.TXT Script'}</span>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleRandomAutoVfx}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <Clapperboard
                    className="w-4 h-4 text-[#E8B7C7] dark:text-[#9E3B5B]"
                    aria-hidden="true"
                  />
                  <span>
                    {lang === 'km'
                      ? 'បង្កើត Auto TVC · Random VFX & CGI ឥឡូវនេះ'
                      : 'Direct Auto Random VFX & CGI TVC'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Generated Modern TVC Blueprint */
            <div className="space-y-5">
              {/* Campaign Treatment Header + Master Video Prompt */}
              <article className="atelier-panel bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 sm:p-6 space-y-5">
                {/* Metadata Line (Zero Pills) */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE7] dark:border-[#322930] pb-4">
                  <div className="text-[11px] font-medium text-[#6A5E66] dark:text-[#A99AA4] flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-[#9E3B5B] dark:text-[#E584A4]">
                      {currentEngineObj?.label ?? tvc.videoEngine}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{tvc.aspectRatio}</span>
                    <span>·</span>
                    <span>
                      {tvc.shots.length} {lang === 'km' ? 'ឈុត' : 'Shots'}
                    </span>
                    {currentStyleObj && (
                      <>
                        <span>·</span>
                        <span>
                          {lang === 'km' ? currentStyleObj.nameKm : currentStyleObj.nameEn}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Color Grading Palette Swatches */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#7D7179] dark:text-[#9E8F99] mr-1">
                      {lang === 'km' ? 'ពណ៌ភាពយន្ត' : 'Grade'}
                    </span>
                    {tvc.palette.map((hex, i) => (
                      <span
                        key={`${hex}-${i}`}
                        className="w-4 h-4 rounded-full border border-black/10 dark:border-white/15"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>

                {/* Title & Director Logline */}
                <div className="space-y-2">
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#221820] dark:text-[#F5EFF3] leading-snug">
                    {lang === 'km' ? tvc.titleKm : tvc.titleEn}
                  </h2>
                  <div className="text-xs font-medium text-[#7D7179] dark:text-[#9E8F99]">
                    {lang === 'km' ? tvc.titleEn : tvc.titleKm}
                  </div>
                  <p className="text-sm text-[#4A3F47] dark:text-[#D5C9D1] leading-relaxed pt-1">
                    {lang === 'km' ? tvc.loglineKm : tvc.loglineEn}
                  </p>
                </div>

                {/* Auto-Picked VFX & CGI Hero Direction */}
                {(tvc.vfxCgiDirectionKm || tvc.vfxCgiDirectionEn || currentVfxObj) && (
                  <div className="p-4 rounded-lg bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9E3B5B] dark:text-[#E584A4]">
                        <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {lang === 'km'
                            ? 'បច្ចេកទេស VFX & CGI (Tool ជ្រើសរើសស្វ័យប្រវត្តិ)'
                            : 'Signature VFX & CGI Direction (Auto-Selected)'}
                        </span>
                      </div>
                      {currentVfxObj && (
                        <span className="text-[11px] font-medium text-[#4A5D8F] dark:text-[#9CB0E3]">
                          {lang === 'km' ? currentVfxObj.nameKm : currentVfxObj.nameEn}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#221820] dark:text-[#F0E7ED] leading-relaxed">
                      {lang === 'km'
                        ? tvc.vfxCgiDirectionKm || currentVfxObj?.descKm
                        : tvc.vfxCgiDirectionEn || currentVfxObj?.descEn}
                    </p>
                  </div>
                )}

                {/* Music Direction & Closing Packshot CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#FAF9F7] dark:bg-[#161215] border border-[#EFECE7] dark:border-[#322930] space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#4A5D8F] dark:text-[#9CB0E3]">
                      <Music className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {lang === 'km' ? 'ភ្លេង & សំឡេង ASMR' : 'Music & Sound Design'}
                      </span>
                    </div>
                    <p className="text-xs text-[#3C3139] dark:text-[#DCD1D8] leading-relaxed">
                      {lang === 'km' ? tvc.musicDirectionKm : tvc.musicDirectionEn}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#FAF9F7] dark:bg-[#161215] border border-[#EFECE7] dark:border-[#322930] space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9E3B5B] dark:text-[#E584A4]">
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {lang === 'km'
                          ? 'ពាក្យបិទបញ្ចប់ TVC (Packshot CTA)'
                          : 'Closing Tagline CTA'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3] leading-relaxed">
                      {tvc.ctaLineKm}
                    </p>
                  </div>
                </div>

                {/* Master All-in-One AI Video Prompt */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                      {lang === 'km'
                        ? 'Master Prompt វីដេអូរួម (មាន VFX & CGI ពេញលេញ)'
                        : 'Master All-in-One AI Video Prompt (With VFX & CGI)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('master', tvc.masterVideoPrompt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-md transition-colors cursor-pointer"
                    >
                      {copiedId === 'master' ? (
                        <>
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{lang === 'km' ? 'បានចម្លង' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{lang === 'km' ? 'ចម្លង Master Prompt' : 'Copy Master'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 rounded-lg bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] text-xs font-mono text-[#221820] dark:text-[#F0E7ED] whitespace-pre-wrap leading-relaxed select-all">
                    {tvc.masterVideoPrompt}
                  </pre>
                </div>

                {/* Blueprint Action Bar */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#EFECE7] dark:border-[#322930]">
                  <button
                    type="button"
                    onClick={handleSaveTvc}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] rounded-lg transition-colors cursor-pointer"
                  >
                    {savedId === tvc.id ? (
                      <>
                        <Check
                          className="w-3.5 h-3.5 text-[#9E3B5B] dark:text-[#E584A4]"
                          aria-hidden="true"
                        />
                        <span>
                          {lang === 'km' ? 'បានរក្សាទុកក្នុង Vault' : 'Saved to Vault'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{lang === 'km' ? 'រក្សាទុក TVC' : 'Save to Vault'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadTvcScript(tvc)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {lang === 'km' ? 'ទាញយក Script (.TXT)' : 'Download .TXT Script'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleRandomAutoVfx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#9E3B5B] dark:text-[#E584A4] hover:text-[#221820] dark:hover:text-[#F5EFF3] ml-auto cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {lang === 'km' ? 'Random VFX & CGI ថ្មីទៀត' : 'Roll New VFX & CGI'}
                    </span>
                  </button>
                </div>
              </article>

              {/* Scene-by-Scene Timed Storyboard */}
              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km'
                      ? `ឈុតឆាកលម្អិតតាមវិនាទី + VFX/CGI (${tvc.shots.length} ឈុត)`
                      : `Timed Storyboard + VFX/CGI (${tvc.shots.length} Shots)`}
                  </h3>
                  <span className="text-xs text-[#6A5E66] dark:text-[#A99AA4]">
                    {lang === 'km'
                      ? 'ចម្លង Prompt ឈុតនីមួយៗទៅបង្កើតវីដេអូ'
                      : 'Copy each shot individually for clean AI clips'}
                  </span>
                </div>

                <div className="space-y-3">
                  {tvc.shots.map((shot) => {
                    const shotCopyKey = `shot-${shot.shotNumber}`;
                    return (
                      <div
                        key={shot.shotNumber}
                        className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 space-y-3.5"
                      >
                        {/* Shot Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFECE7] dark:border-[#322930] pb-3">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="font-mono text-xs font-semibold text-[#9E3B5B] dark:text-[#E584A4] tabular-nums">
                              {shot.timecode}
                            </span>
                            <span className="text-[#C8BFC5] dark:text-[#574954]">·</span>
                            <span className="text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
                              {lang === 'km' ? shot.roleKm : shot.roleEn}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy(shotCopyKey, shot.videoPrompt)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] rounded-md transition-colors cursor-pointer"
                          >
                            {copiedId === shotCopyKey ? (
                              <>
                                <Check
                                  className="w-3.5 h-3.5 text-[#9E3B5B] dark:text-[#E584A4]"
                                  aria-hidden="true"
                                />
                                <span>{lang === 'km' ? 'បានចម្លង' : 'Copied'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>
                                  {lang === 'km' ? 'ចម្លងឈុតនេះ' : 'Copy Shot Prompt'}
                                </span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Camera + VFX/CGI Technical Line */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5E525A] dark:text-[#C4B7C0]">
                          <div className="flex items-start gap-2">
                            <Camera
                              className="w-3.5 h-3.5 text-[#4A5D8F] dark:text-[#9CB0E3] shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                            <span>{shot.cameraMovement}</span>
                          </div>
                          {shot.vfxCgiCue && (
                            <div className="flex items-start gap-2">
                              <Wand2
                                className="w-3.5 h-3.5 text-[#9E3B5B] dark:text-[#E584A4] shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span className="text-[#221820] dark:text-[#F0E7ED]">
                                {shot.vfxCgiCue}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Standalone Shot Video Prompt */}
                        <pre className="p-3.5 rounded-lg bg-[#FAF9F7] dark:bg-[#161215] border border-[#EFECE7] dark:border-[#322930] text-xs font-mono text-[#221820] dark:text-[#F0E7ED] whitespace-pre-wrap leading-relaxed">
                          {shot.videoPrompt}
                        </pre>

                        {/* Voiceover, On-Screen Text & SFX Strip */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9E3B5B] dark:text-[#E584A4]">
                              <Mic className="w-3 h-3" aria-hidden="true" />
                              <span>
                                {lang === 'km' ? 'សំឡេង Voiceover' : 'Khmer Voiceover'}
                              </span>
                            </div>
                            <p className="text-[#221820] dark:text-[#F5EFF3] leading-relaxed">
                              “{shot.voiceoverKm}”
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4A5D8F] dark:text-[#9CB0E3]">
                              <TypeIcon className="w-3 h-3" aria-hidden="true" />
                              <span>
                                {lang === 'km' ? 'អក្សរលើវីដេអូ' : 'On-Screen Text'}
                              </span>
                            </div>
                            <p className="font-medium text-[#221820] dark:text-[#F5EFF3] leading-relaxed">
                              {shot.onScreenTextKm}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6A5E66] dark:text-[#A99AA4]">
                              <Volume2 className="w-3 h-3" aria-hidden="true" />
                              <span>
                                {lang === 'km' ? 'សំឡេង SFX / ASMR' : 'SFX / ASMR Cue'}
                              </span>
                            </div>
                            <p className="text-[#5E525A] dark:text-[#C4B7C0] leading-relaxed">
                              {shot.sfxCue}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  RotateCcw,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ASPECT_RATIOS,
  CAMERA_OPTIONS,
  DEFAULT_STUDIO_CONFIG,
  GENERATOR_ENGINES,
  KHMER_HEADLINE_PRESETS,
  LIGHTING_OPTIONS,
  MOOD_HARMONIES,
  PRODUCT_VARIANTS,
  REF_IMAGES,
  SCENE_PRESETS,
  SENSORY_PROPS,
} from '../data/presets';
import {
  AspectRatioId,
  GeneratedConcept,
  GeneratorEngineId,
  Language,
  ScenePreset,
  StudioConfig,
  TextPlacementMode,
} from '../types';
import {
  buildLivePrompt,
  createFreshRandomStudioConfig,
  exportConceptAsText,
} from '../utils/promptBuilder';
import { compressImageFile } from '../utils/imageResize';
import { AdPreviewFrame } from './AdPreviewFrame';

interface PromptStudioProps {
  config: StudioConfig;
  onChangeConfig: (next: StudioConfig) => void;
  aiOverrideConcept: GeneratedConcept | null;
  onSetAiOverride: (concept: GeneratedConcept | null) => void;
  onSaveToVault: (concept: GeneratedConcept) => void;
  onRecordMemory?: (concept: GeneratedConcept) => void;
  lang: Language;
}

async function fetchImageUrlAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Failed to read image'));
    reader.onerror = () => reject(new Error('Failed to convert image'));
    reader.readAsDataURL(blob);
  });
}

export function PromptStudio({
  config,
  onChangeConfig,
  aiOverrideConcept,
  onSetAiOverride,
  onSaveToVault,
  onRecordMemory,
  lang,
}: PromptStudioProps) {
  const [sceneCategory, setSceneCategory] = useState<'all' | ScenePreset['category']>(
    'all'
  );
  const [outputTab, setOutputTab] = useState<'prompt' | 'negative' | 'copy'>('prompt');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [isAutoDesigning, setIsAutoDesigning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [remixError, setRemixError] = useState<string | null>(null);
  const [showManualControls, setShowManualControls] = useState(false);
  const [autoConcepts, setAutoConcepts] = useState<GeneratedConcept[]>([]);
  const [activeAutoIndex, setActiveAutoIndex] = useState<number>(0);
  const [productInsight, setProductInsight] = useState<{
    km: string;
    en: string;
  } | null>(null);
  const [autoAvoidTitles, setAutoAvoidTitles] = useState<string[]>([]);
  const [recentScenes, setRecentScenes] = useState<string[]>([]);
  const [recentRemixTitles, setRecentRemixTitles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const liveConcept = useMemo(() => buildLivePrompt(config), [config]);
  const activeConcept = aiOverrideConcept ?? liveConcept;

  const updateConfig = (patch: Partial<StudioConfig>) => {
    onSetAiOverride(null);
    setRemixError(null);
    onChangeConfig({ ...config, ...patch });
  };

  const toggleProp = (propId: string) => {
    const exists = config.selectedProps.includes(propId);
    const next = exists
      ? config.selectedProps.filter((id) => id !== propId)
      : [...config.selectedProps, propId];
    updateConfig({ selectedProps: next });
  };

  const handleShuffleFresh = () => {
    const next = createFreshRandomStudioConfig(config, recentScenes);
    setRecentScenes((prev) => [...prev.slice(-6), next.sceneId]);
    onSetAiOverride(null);
    setRemixError(null);
    onChangeConfig(next);
  };

  const handleReset = () => {
    onSetAiOverride(null);
    setAutoConcepts([]);
    setProductInsight(null);
    setRemixError(null);
    onChangeConfig(DEFAULT_STUDIO_CONFIG);
  };

  const runAutoDesignFromPhoto = async (
    imageDataUrl: string,
    imageName: string,
    engineId: GeneratorEngineId = config.engineId,
    aspectRatio: AspectRatioId = config.aspectRatio,
    avoidList: string[] = autoAvoidTitles
  ) => {
    setIsAutoDesigning(true);
    setRemixError(null);

    const updatedConfig: StudioConfig = {
      ...config,
      variantId: 'custom',
      engineId,
      aspectRatio,
      customImageDataUrl: imageDataUrl,
      customImageName: imageName,
    };
    onChangeConfig(updatedConfig);

    try {
      let response: Response | null = null;
      let lastFetchErr: unknown = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await fetch('/api/auto-design-from-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageDataUrl,
              engineId,
              aspectRatio,
              avoidTitles: avoidList,
            }),
          });
          break;
        } catch (fetchErr) {
          lastFetchErr = fetchErr;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 700));
          }
        }
      }

      if (!response) {
        throw lastFetchErr instanceof Error
          ? new Error(
              lang === 'km'
                ? 'ការតភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេត្រូវបានរំខាន។ សូមសាកល្បងម្តងទៀត។'
                : 'Connection interrupted before the server responded. Please try again.'
            )
          : new Error('Network error. Please try again.');
      }

      const raw = await response.text();
      let data: {
        productInsightKm?: string;
        productInsightEn?: string;
        concepts?: GeneratedConcept[];
        error?: string;
      } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          lang === 'km'
            ? 'ម៉ាស៊ីនមេកំពុងចាប់ផ្តើមឡើងវិញ។ សូមសាកល្បងម្តងទៀតក្នុងពេលបន្តិច។'
            : 'Server returned an unexpected response. Please try again.'
        );
      }

      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Auto-design failed. Please try again.');
      }

      const concepts = Array.isArray(data.concepts) ? data.concepts : [];
      if (concepts.length === 0) {
        throw new Error(
          lang === 'km'
            ? 'មិនទាន់ទទួលបាន Prompt ទេ។ សូមសាកល្បងម្តងទៀត។'
            : 'No concepts returned. Please try again.'
        );
      }

      setAutoConcepts(concepts);
      setActiveAutoIndex(0);
      setProductInsight(
        data.productInsightKm || data.productInsightEn
          ? {
              km: data.productInsightKm || '',
              en: data.productInsightEn || '',
            }
          : null
      );
      setAutoAvoidTitles((prev) =>
        Array.from(new Set([...prev, ...concepts.map((c) => c.titleEn)])).slice(-18)
      );

      const lead = concepts[0];
      onChangeConfig({
        ...updatedConfig,
        khmerHeadline: lead.khmerHeadline || updatedConfig.khmerHeadline,
        subHeadline: lead.subHeadline || updatedConfig.subHeadline,
      });
      onSetAiOverride(lead);
      onRecordMemory?.(lead);
      setOutputTab('prompt');
    } catch (err) {
      setRemixError(
        err instanceof Error
          ? err.message
          : 'Unable to auto-design from this photo. Please try again.'
      );
    } finally {
      setIsAutoDesigning(false);
    }
  };

  const processSelectedFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setRemixError(
        lang === 'km'
          ? 'សូមជ្រើសរើសឯកសាររូបភាព (JPG, PNG, WEBP)។'
          : 'Please upload an image file (JPG, PNG, or WEBP).'
      );
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setRemixError(
        lang === 'km'
          ? 'រូបភាពធំពេក (អតិបរមា 15MB)។ សូមជ្រើសរើសរូបភាពតូចជាងនេះ។'
          : 'Image exceeds 15MB limit. Please choose a smaller image.'
      );
      return;
    }
    try {
      const compressedDataUrl = await compressImageFile(file, 1024);
      await runAutoDesignFromPhoto(compressedDataUrl, file.name);
    } catch {
      setRemixError(
        lang === 'km'
          ? 'មិនអាចអានរូបភាពនេះបានទេ។ សូមសាកល្បងរូបភាពផ្សេង។'
          : 'Unable to read this image file. Please try another photo.'
      );
    }
  };

  const handleUploadCustomImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await processSelectedFile(file);
  };

  const handleDropFile = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const handleQuickAutoDesignSample = async (sampleUrl: string, label: string) => {
    try {
      setIsAutoDesigning(true);
      setRemixError(null);
      const dataUrl = await fetchImageUrlAsDataUrl(sampleUrl);
      await runAutoDesignFromPhoto(dataUrl, label);
    } catch {
      setIsAutoDesigning(false);
      setRemixError(
        lang === 'km'
          ? 'មិនអាចទាញយករូបគំរូនេះបានទេ។ សូមបង្ហោះរូបភាពផ្ទាល់ខ្លួន។'
          : 'Could not load sample image. Please upload a photo directly.'
      );
    }
  };

  const handleSelectAutoConcept = (concept: GeneratedConcept, idx: number) => {
    setActiveAutoIndex(idx);
    onSetAiOverride(concept);
    onChangeConfig({
      ...config,
      khmerHeadline: concept.khmerHeadline || config.khmerHeadline,
      subHeadline: concept.subHeadline || config.subHeadline,
    });
    setOutputTab('prompt');
  };

  const handleAiRemix = async () => {
    setIsRemixing(true);
    setRemixError(null);
    try {
      let response: Response | null = null;
      let lastFetchErr: unknown = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await fetch('/api/remix-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              config,
              basePrompt: liveConcept.masterPrompt,
              previousRemixTitles: recentRemixTitles,
            }),
          });
          break;
        } catch (fetchErr) {
          lastFetchErr = fetchErr;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 700));
          }
        }
      }

      if (!response) {
        throw lastFetchErr instanceof Error
          ? new Error(
              lang === 'km'
                ? 'ការតភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេត្រូវបានរំខាន។ សូមចុចសាកល្បងម្តងទៀត។'
                : 'Connection interrupted before the server responded. Please try again.'
            )
          : new Error('Network error. Please try again.');
      }

      const raw = await response.text();
      let data: { concept?: GeneratedConcept; error?: string } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          lang === 'km'
            ? 'ម៉ាស៊ីនមេកំពុងចាប់ផ្តើមឡើងវិញ។ សូមចុចសាកល្បងម្តងទៀតក្នុងពេលបន្តិច។'
            : 'Server returned an unexpected response. Please try again.'
        );
      }

      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Failed to remix prompt with AI.');
      }

      if (data?.concept) {
        onSetAiOverride(data.concept);
        onRecordMemory?.(data.concept);
        setRecentRemixTitles((prev) => [...prev.slice(-10), data.concept!.titleEn]);
        setOutputTab('prompt');
      }
    } catch (err) {
      setRemixError(
        err instanceof Error
          ? err.message
          : 'Unable to reach AI remix service. Please try again.'
      );
    } finally {
      setIsRemixing(false);
    }
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleSave = () => {
    onSaveToVault({
      ...activeConcept,
      id: `${activeConcept.source}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  const filteredScenes =
    sceneCategory === 'all'
      ? SCENE_PRESETS
      : SCENE_PRESETS.filter((s) => s.category === sceneCategory);

  const selectedEngine =
    GENERATOR_ENGINES.find((e) => e.id === config.engineId) ?? GENERATOR_ENGINES[0];

  const isBusy = isAutoDesigning || isRemixing;

  return (
    <div className="atelier-enter space-y-6">
      {/* Hidden File Input shared by Dropzone & Manual Controls */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUploadCustomImage}
        className="hidden"
      />

      {/* Signature Haute-Parfumerie Editorial Header with Authentic Sneh Triptych */}
      <div className="atelier-panel relative overflow-hidden rounded-2xl border border-[#E6E2DC] dark:border-[#382E36] bg-white/95 dark:bg-[#231C22]/95 px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-xs font-medium text-[#9E3B5B] dark:text-[#E584A4]">
              {lang === 'km'
                ? 'Sneh Haute-Parfumerie Atelier · Auto Luxury Designer & Prompt Studio'
                : 'Sneh Haute-Parfumerie Atelier · Auto Luxury Designer & Prompt Studio'}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#221820] dark:text-[#F5EFF3] tracking-tight leading-[1.15]">
              {lang === 'km'
                ? 'បង្ហោះរូបផលិតផល ឲ្យ Designer រចនា Prompt ប្រណិតភ្លាមៗ'
                : 'Upload Once — Unforgettable Luxury Ad Prompts'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5E525A] dark:text-[#C4B7C0] leading-relaxed">
              {lang === 'km'
                ? 'បង្កើតគំនិតរូបភាព Facebook Ads កម្រិតប្រេនទឹកអប់អន្តរជាតិ ជាមួយពាក្យខ្មែរទាក់ទាញ ក្ដារពណ៌ប្រណិត និងការចងចាំប្រវត្តិស្នាដៃស្វ័យប្រវត្តិ។'
                : 'Craft Parisian & Seoul-grade perfume lotion ad prompts with curated color harmonies, Khmer hooks, and automatic creative memory.'}
            </p>

            <div className="pt-1 flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleShuffleFresh}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#DED8D0] dark:border-[#3E333C] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Shuffle
                  className="w-3.5 h-3.5 text-[#9E3B5B] dark:text-[#E584A4]"
                  aria-hidden="true"
                />
                <span>{lang === 'km' ? 'ស៊ុំស្ទីលថ្មី' : 'Shuffle Style'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3] hover:bg-[#F3F1EE] dark:hover:bg-[#2A2229] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{lang === 'km' ? 'កំណត់ដើម' : 'Reset'}</span>
              </button>
            </div>
          </div>

          {/* Iconic Sneh Perfume Lotion Mini-Triptych (1-Tap Auto Design Launch) */}
          <div className="flex items-end gap-3 shrink-0 self-start lg:self-center">
            {[
              {
                url: REF_IMAGES.creamSwirl,
                label: 'Sneh Cream Swirl Duo',
                heightClass: 'h-24 sm:h-28',
              },
              {
                url: REF_IMAGES.staircasePodium,
                label: 'Sneh Lilac Podium',
                heightClass: 'h-28 sm:h-32',
              },
              {
                url: REF_IMAGES.hydrationPlinth,
                label: 'Sneh Hydration Plinth',
                heightClass: 'h-24 sm:h-28',
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={isAutoDesigning}
                onClick={() => handleQuickAutoDesignSample(item.url, item.label)}
                title={
                  lang === 'km'
                    ? `ចុចដើម្បី Auto Design ពី ${item.label}`
                    : `Click to Auto-Design from ${item.label}`
                }
                className={`group relative w-20 sm:w-24 ${item.heightClass} rounded-xl overflow-hidden border border-[#E6E2DC] dark:border-[#3E333C] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer bg-[#FAF9F7] dark:bg-[#161215]`}
              >
                <img
                  src={item.url}
                  alt={item.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/55 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1 text-[10px] font-medium text-white"
                >
                  Auto
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Instant Auto-Designer Dropzone + Designer Concepts + Optional Manual Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* HERO CARD: Instant Upload -> Auto Designer Prompt */}
          <section className="atelier-panel bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 sm:p-6 space-y-5 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#221820] dark:text-[#F5EFF3]">
                  {lang === 'km'
                    ? 'បង្ហោះរូបផលិតផល (ចាប់ Prompt ស្វ័យប្រវត្តិ ១០០%)'
                    : 'Upload Product Photo (Instant Auto-Prompt)'}
                </h2>
                <p className="mt-0.5 text-xs text-[#6A5E66] dark:text-[#A99AA4]">
                  {lang === 'km'
                    ? 'មិនបាច់ពិបាកជ្រើសមុខងារច្រើនទេ — បង្ហោះរូបភ្លាម AI Designer វិភាគរូបដប ហើយច្នៃ ៣ គំនិតផ្សារប្រណិតទាក់ទាញជូនភ្លាមៗ'
                    : 'Zero configuration needed — upload a product photo and our AI Art Director immediately crafts 3 luxury commercial Facebook Ad prompts.'}
                </p>
              </div>
            </div>

            {/* Effortless Drag & Drop / Tap Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropFile}
              onClick={() => !isAutoDesigning && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isAutoDesigning) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`relative rounded-xl border-2 border-dashed p-6 sm:p-7 transition-all cursor-pointer ${
                isDragging
                  ? 'border-[#9E3B5B] dark:border-[#E584A4] bg-[#9E3B5B]/5 dark:bg-[#E584A4]/10'
                  : 'border-[#D9D2CB] dark:border-[#493B46] bg-[#FAF9F7] dark:bg-[#181317] hover:border-[#9E3B5B] dark:hover:border-[#E584A4]'
              }`}
            >
              {isAutoDesigning ? (
                <div className="py-4 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-7 h-7 text-[#9E3B5B] dark:text-[#E584A4] animate-spin" />
                  <p className="mt-3 text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km'
                      ? 'AI Designer កំពុងវិភាគរូបផលិតផល និងរចនា Prompt ប្រណិត ៣ ស្ទីល...'
                      : 'AI Designer is analyzing your product photo & crafting 3 luxury ad concepts...'}
                  </p>
                  <p className="mt-1 text-xs text-[#6A5E66] dark:text-[#A99AA4]">
                    {lang === 'km'
                      ? 'រៀបចំប្លង់ថត ពន្លឺ ក្ដារពណ៌ ចំណងជើងខ្មែរ និង Caption Facebook ស្វ័យប្រវត្តិ'
                      : 'Composing set design, lighting physics, color harmony & Khmer ad copy'}
                  </p>
                </div>
              ) : config.customImageDataUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-24 h-28 rounded-lg overflow-hidden bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] shrink-0">
                    <img
                      src={config.customImageDataUrl}
                      alt={config.customImageName || 'Uploaded product'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <p className="text-xs font-medium text-[#9E3B5B] dark:text-[#E584A4]">
                      {lang === 'km'
                        ? 'បានវិភាគរូបភាពរួចរាល់ · ចុចទីនេះដើម្បីប្ដូររូបថ្មី'
                        : 'Product analyzed · Click anywhere to upload a different photo'}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#221820] dark:text-[#F5EFF3] truncate">
                      {config.customImageName || 'product-photo.jpg'}
                    </p>
                    {productInsight && (
                      <p className="mt-1.5 text-xs text-[#5E525A] dark:text-[#C4B7C0] leading-relaxed">
                        {lang === 'km' ? productInsight.km : productInsight.en}
                      </p>
                    )}
                    <div
                      className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          runAutoDesignFromPhoto(
                            config.customImageDataUrl!,
                            config.customImageName || 'product.jpg',
                            config.engineId,
                            config.aspectRatio,
                            autoAvoidTitles
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {lang === 'km' ? 'បង្កើត ៣ គំនិតថ្មីទៀត' : '3 More Fresh Designs'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-white dark:bg-[#231C22] border border-[#DED8D0] dark:border-[#382E36] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{lang === 'km' ? 'បង្ហោះរូបថ្មី' : 'Upload New'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAutoConcepts([]);
                          setProductInsight(null);
                          updateConfig({
                            variantId: 'duo',
                            customImageDataUrl: undefined,
                            customImageName: undefined,
                          });
                        }}
                        className="p-2 text-[#9E3B5B] dark:text-[#E584A4] hover:bg-[#9E3B5B]/10 rounded-lg transition-colors cursor-pointer"
                        aria-label="Remove uploaded photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-3 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] flex items-center justify-center text-[#9E3B5B] dark:text-[#E584A4]">
                    <Upload className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km'
                      ? 'ចុចទីនេះ ឬអូសរូបផលិតផលមកទម្លាក់ ដើម្បីចាប់ Prompt ភ្លាមៗ'
                      : 'Tap or Drop Your Product Photo for Instant Luxury Prompts'}
                  </p>
                  <p className="mt-1 text-xs text-[#6A5E66] dark:text-[#A99AA4]">
                    {lang === 'km'
                      ? 'គាំទ្រ JPG, PNG, WEBP · AI Designer នឹងជ្រើសប្លង់ ពន្លឺ និងចំណងជើងលក់ដាច់ជូនដោយស្វ័យប្រវត្តិ'
                      : 'Supports JPG, PNG, WEBP · Automatically styles lighting, set design, and Khmer ad hooks'}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Compact Format Strip (Engine + Ratio only — zero overwhelm!) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-medium text-[#7D7179] dark:text-[#9E8F99]">
                  {lang === 'km' ? 'AI រូបភាព៖' : 'Generator:'}
                </span>
                <select
                  aria-label="Target Image Generator"
                  value={config.engineId}
                  onChange={(e) => {
                    const nextEngine = e.target.value as GeneratorEngineId;
                    onChangeConfig({ ...config, engineId: nextEngine });
                    if (config.customImageDataUrl && !isAutoDesigning) {
                      runAutoDesignFromPhoto(
                        config.customImageDataUrl,
                        config.customImageName || 'product.jpg',
                        nextEngine,
                        config.aspectRatio,
                        []
                      );
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg"
                >
                  {GENERATOR_ENGINES.map((engine) => (
                    <option key={engine.id} value={engine.id}>
                      {engine.label}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Facebook Ad Aspect Ratio"
                  value={config.aspectRatio}
                  onChange={(e) => {
                    const nextRatio = e.target.value as AspectRatioId;
                    onChangeConfig({ ...config, aspectRatio: nextRatio });
                    if (config.customImageDataUrl && !isAutoDesigning) {
                      runAutoDesignFromPhoto(
                        config.customImageDataUrl,
                        config.customImageName || 'product.jpg',
                        config.engineId,
                        nextRatio,
                        []
                      );
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg"
                >
                  {ASPECT_RATIOS.map((ratio) => (
                    <option key={ratio.id} value={ratio.id}>
                      {lang === 'km' ? ratio.labelKm : ratio.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* 1-Tap Instant Test with the 3 Sneh Reference Photos */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#7D7179] dark:text-[#9E8F99] whitespace-nowrap">
                  {lang === 'km' ? 'ឬសាករូប Sស្នេហ៍h៖' : 'Or try Sneh:'}
                </span>
                {[
                  { src: REF_IMAGES.creamSwirl, name: 'Sneh Cream Swirl Duo' },
                  { src: REF_IMAGES.hydrationPlinth, name: 'Sneh Hydration Plinth' },
                  { src: REF_IMAGES.staircasePodium, name: 'Sneh Lilac Podium' },
                ].map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    disabled={isAutoDesigning}
                    onClick={() => handleQuickAutoDesignSample(sample.src, sample.name)}
                    title={sample.name}
                    className="w-8 h-9 rounded-md overflow-hidden border border-[#DED8D0] dark:border-[#382E36] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] transition-all hover:-translate-y-0.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <img
                      src={sample.src}
                      alt={sample.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Generated 3 Luxury Commercial Designer Concepts Selector */}
            {autoConcepts.length > 0 && (
              <div className="pt-4 border-t border-[#EFECE7] dark:border-[#322930] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km'
                      ? 'គំនិត Designer ប្រណិត ៣ ស្ទីល (ចុចជ្រើសដើម្បីចម្លង Prompt)៖'
                      : '3 Auto-Designed Luxury Commercial Concepts (Click to switch):'}
                  </p>
                  <span className="text-[11px] text-[#7D7179] dark:text-[#9E8F99] tabular-nums">
                    {activeAutoIndex + 1} / {autoConcepts.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {autoConcepts.map((item, idx) => {
                    const isSelected = activeAutoIndex === idx && aiOverrideConcept?.id === item.id;
                    const tierLabelKm =
                      idx === 0
                        ? '01 · លក់ដាច់ប្រណិត'
                        : idx === 1
                          ? '02 · ឡូយៗខ្លាំង Viral'
                          : '03 · ទាក់ទាញអារម្មណ៍';
                    const tierLabelEn =
                      idx === 0
                        ? '01 · Best-Seller Hero'
                        : idx === 1
                          ? '02 · Bold Viral Luxury'
                          : '03 · Sensory Allure';

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectAutoConcept(item, idx)}
                        className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                            : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#1E181D] hover:border-[#CBBEC7] dark:hover:border-[#594755]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[11px] font-medium text-[#9E3B5B] dark:text-[#E584A4]">
                              {lang === 'km' ? tierLabelKm : tierLabelEn}
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {item.palette.map((hex, i) => (
                                <span
                                  key={`${hex}-${i}`}
                                  className="w-2.5 h-2.5 rounded-full border border-black/15 dark:border-white/20"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-1.5 text-xs font-semibold text-[#221820] dark:text-[#F5EFF3] leading-snug line-clamp-2">
                            {lang === 'km' ? item.titleKm : item.titleEn}
                          </p>
                          <p className="mt-1 text-[11px] text-[#6A5E66] dark:text-[#A99AA4] line-clamp-2 leading-relaxed">
                            {item.khmerHeadline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* COLLAPSIBLE OPTIONAL MANUAL STUDIO CONTROLS (Zero Clutter Default!) */}
          <div className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl overflow-hidden transition-colors duration-200">
            <button
              type="button"
              onClick={() => setShowManualControls((prev) => !prev)}
              aria-expanded={showManualControls}
              className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#FAF9F7] dark:hover:bg-[#292128] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <SlidersHorizontal
                  className="w-4 h-4 text-[#6A5E66] dark:text-[#A99AA4] shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km'
                      ? 'កែសម្រួលលម្អិតដោយខ្លួនឯង (ស្រេចចិត្ត — ២០ ប្លង់, ពន្លឺ, អក្សរខ្មែរ)'
                      : 'Optional Manual Fine-Tuning (20 Sets, Lighting, Props & Copy)'}
                  </p>
                  <p className="text-[11px] text-[#6A5E66] dark:text-[#A99AA4] truncate">
                    {lang === 'km'
                      ? 'បើកតែពេលអ្នកចង់ជ្រើសប្លង់ ពន្លឺ ឬបញ្ចូលចំណងជើងផ្ទាល់ខ្លួនបន្ថែម'
                      : 'Expand only when you want manual control over sets, camera, props, or headlines'}
                  </p>
                </div>
              </div>
              {showManualControls ? (
                <ChevronUp className="w-4 h-4 text-[#6A5E66] dark:text-[#A99AA4] shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#6A5E66] dark:text-[#A99AA4] shrink-0" />
              )}
            </button>

            {showManualControls && (
              <div className="px-5 pb-6 pt-2 border-t border-[#EFECE7] dark:border-[#322930] space-y-6">
                {/* 01. Product Variant */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km'
                      ? '01. ជ្រើសរើសប្រភេទដប Sស្នេហ៍h'
                      : '01. Product Variant'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRODUCT_VARIANTS.map((variant) => {
                      const isSelected = config.variantId === variant.id;
                      const isCustom = variant.id === 'custom';
                      const thumbSrc =
                        isCustom && config.customImageDataUrl
                          ? config.customImageDataUrl
                          : variant.previewImage;

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => {
                            if (isCustom && !config.customImageDataUrl) {
                              fileInputRef.current?.click();
                            } else {
                              updateConfig({ variantId: variant.id });
                            }
                          }}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                              : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#1E181D] hover:border-[#CBBEC7] dark:hover:border-[#594755]'
                          }`}
                        >
                          <div className="w-11 h-13 rounded-md overflow-hidden bg-[#F3F1EE] dark:bg-[#171216] shrink-0 border border-black/5 dark:border-white/10">
                            <img
                              src={thumbSrc}
                              alt={variant.nameEn}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3] truncate">
                              {lang === 'km' ? variant.nameKm : variant.nameEn}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#6A5E66] dark:text-[#A99AA4] line-clamp-1">
                              {isCustom && config.customImageName
                                ? config.customImageName
                                : lang === 'km'
                                  ? variant.scentNotesKm
                                  : variant.scentNotesEn}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 02. Luxury Scene & Set Design */}
                <div className="pt-4 border-t border-[#EFECE7] dark:border-[#322930] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                      {lang === 'km'
                        ? '02. ឈុតឆាក និងរចនាប័ទ្មថត (20 ស្ទីល)'
                        : '02. Luxury Set Direction (20 Sets)'}
                    </h3>

                    <div className="flex items-center gap-1 p-0.5 bg-[#F3F1EE] dark:bg-[#1A1519] rounded-lg overflow-x-auto">
                      {(
                        [
                          { id: 'all', km: 'ទាំងអស់', en: 'All' },
                          { id: 'avant-garde', km: 'ឡូយៗខ្លាំង', en: 'Bold Viral' },
                          { id: 'sensory', km: 'សាច់ឡេ', en: 'Sensory' },
                          { id: 'architectural', km: 'ស្ថាបត្យកម្ម', en: 'Podium' },
                          { id: 'lifestyle', km: 'ធម្មជាតិ', en: 'Lifestyle' },
                          { id: 'dramatic', km: 'លេចធ្លោ', en: 'Dramatic' },
                        ] as const
                      ).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSceneCategory(cat.id)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            sceneCategory === cat.id
                              ? 'bg-white dark:bg-[#342A32] text-[#221820] dark:text-[#F5EFF3] shadow-xs'
                              : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
                          }`}
                        >
                          {lang === 'km' ? cat.km : cat.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredScenes.map((scene) => {
                      const isSelected = config.sceneId === scene.id;
                      return (
                        <button
                          key={scene.id}
                          type="button"
                          onClick={() =>
                            updateConfig({
                              sceneId: scene.id,
                              lightingId: scene.recommendedLighting,
                              selectedProps: scene.recommendedProps,
                            })
                          }
                          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                              : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#1E181D] hover:border-[#CBBEC7] dark:hover:border-[#594755]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3] truncate">
                              {lang === 'km' ? scene.nameKm : scene.nameEn}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {scene.palette.map((hex) => (
                                <span
                                  key={hex}
                                  className="w-2.5 h-2.5 rounded-full border border-black/15 dark:border-white/20"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-1 text-[11px] text-[#6A5E66] dark:text-[#A99AA4] line-clamp-1">
                            {lang === 'km' ? scene.subtitleKm : scene.subtitleEn}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 03. Lighting, Camera, Harmony & Props */}
                <div className="pt-4 border-t border-[#EFECE7] dark:border-[#322930] space-y-4">
                  <h3 className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km'
                      ? '03. ពន្លឺ កាមេរ៉ា ក្ដារពណ៌ & ធាតុផ្សំ'
                      : '03. Lighting, Camera, Palette & Props'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      aria-label="Studio Lighting"
                      value={config.lightingId}
                      onChange={(e) => updateConfig({ lightingId: e.target.value })}
                      className="w-full px-3 py-2 text-xs text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg"
                    >
                      {LIGHTING_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {lang === 'km' ? opt.nameKm : opt.nameEn}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Camera and Lens"
                      value={config.cameraId}
                      onChange={(e) => updateConfig({ cameraId: e.target.value })}
                      className="w-full px-3 py-2 text-xs text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg"
                    >
                      {CAMERA_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {lang === 'km' ? opt.nameKm : opt.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MOOD_HARMONIES.map((mood) => {
                      const active = config.moodId === mood.id;
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => updateConfig({ moodId: mood.id })}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                            active
                              ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                              : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#1E181D] hover:border-[#CBBEC7] dark:hover:border-[#594755]'
                          }`}
                        >
                          <span className="text-xs font-medium text-[#221820] dark:text-[#F5EFF3] truncate">
                            {lang === 'km' ? mood.nameKm : mood.nameEn}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {mood.swatches.map((hex) => (
                              <span
                                key={hex}
                                className="w-3 h-3 rounded-full border border-black/15 dark:border-white/20"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SENSORY_PROPS.map((prop) => {
                      const active = config.selectedProps.includes(prop.id);
                      return (
                        <button
                          key={prop.id}
                          type="button"
                          onClick={() => toggleProp(prop.id)}
                          className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors truncate cursor-pointer ${
                            active
                              ? 'border-[#9E3B5B] dark:border-[#E584A4] bg-[#9E3B5B]/8 dark:bg-[#E584A4]/15 text-[#2A1926] dark:text-[#F5EFF3] font-medium'
                              : 'border-[#E6E2DC] dark:border-[#382E36] text-[#574C54] dark:text-[#B9AAB4] hover:border-[#CBBEC7] dark:hover:border-[#594755]'
                          }`}
                        >
                          {lang === 'km' ? prop.labelKm : prop.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 04. Khmer Headline & Notes */}
                <div className="pt-4 border-t border-[#EFECE7] dark:border-[#322930] space-y-3">
                  <h3 className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km'
                      ? '04. ចំណងជើងខ្មែរ & ទីតាំងអក្សរ'
                      : '04. Khmer Headline & Typography Zone'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(
                      [
                        {
                          id: 'clean-space',
                          km: 'ផ្ទៃទំនេរស្អាត',
                          en: 'Clean Space',
                        },
                        {
                          id: 'integrated-khmer',
                          km: 'ប្លង់ Poster អក្សរខ្មែរ',
                          en: 'Poster Layout',
                        },
                        {
                          id: 'english-minimal',
                          km: 'អក្សរអង់គ្លេសប្រណិត',
                          en: 'Minimal English',
                        },
                      ] as { id: TextPlacementMode; km: string; en: string }[]
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => updateConfig({ textPlacement: mode.id })}
                        className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors cursor-pointer ${
                          config.textPlacement === mode.id
                            ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C] text-[#221820] dark:text-[#F5EFF3] font-semibold'
                            : 'border-[#E6E2DC] dark:border-[#382E36] text-[#574C54] dark:text-[#B9AAB4]'
                        }`}
                      >
                        {lang === 'km' ? mode.km : mode.en}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={config.khmerHeadline}
                      onChange={(e) => updateConfig({ khmerHeadline: e.target.value })}
                      placeholder="ឧ. លាបពេលណា នឹកសង្សារចាស់"
                      className="w-full px-3 py-2 text-xs text-[#221820] dark:text-[#F5EFF3] placeholder:text-[#968A92] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg"
                    />
                    <input
                      type="text"
                      value={config.subHeadline}
                      onChange={(e) => updateConfig({ subHeadline: e.target.value })}
                      placeholder="SMOOTH & BRIGHTENING"
                      className="w-full px-3 py-2 text-xs text-[#221820] dark:text-[#F5EFF3] placeholder:text-[#968A92] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg"
                    />
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                    {KHMER_HEADLINE_PRESETS.map((preset) => (
                      <button
                        key={preset.headline}
                        type="button"
                        onClick={() =>
                          updateConfig({
                            khmerHeadline: preset.headline,
                            subHeadline: preset.subHeadline,
                          })
                        }
                        className="text-[#4A5D8F] dark:text-[#9CB0E3] hover:text-[#9E3B5B] dark:hover:text-[#E584A4] underline underline-offset-4 decoration-[#D8D3CC] dark:decoration-[#4A3D47] cursor-pointer"
                      >
                        {preset.headline}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={config.customNote}
                    onChange={(e) => updateConfig({ customNote: e.target.value })}
                    placeholder={
                      lang === 'km'
                        ? 'ព័ត៌មានបន្ថែមសម្រាប់ AI (ស្រេចចិត្ត)...'
                        : 'Optional custom art direction notes...'
                    }
                    className="w-full px-3 py-2 text-xs text-[#221820] dark:text-[#F5EFF3] placeholder:text-[#968A92] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Blueprint Preview & Master Prompt Output */}
        <div className="lg:col-span-5 lg:sticky lg:top-22 space-y-5">
          {/* Interactive Facebook Ad Preview */}
          <AdPreviewFrame config={config} concept={activeConcept} lang={lang} />

          {/* Master Prompt Output Panel */}
          <div className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl overflow-hidden transition-colors duration-200">
            {/* Output Header */}
            <div className="px-4 py-3 border-b border-[#E6E2DC] dark:border-[#382E36] flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1 p-0.5 bg-[#F3F1EE] dark:bg-[#1A1519] rounded-lg">
                {(
                  [
                    { id: 'prompt', km: 'Master Prompt', en: 'Master Prompt' },
                    { id: 'negative', km: 'Negative', en: 'Negative' },
                    { id: 'copy', km: 'Caption FB', en: 'FB Copy & Specs' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setOutputTab(tab.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      outputTab === tab.id
                        ? 'bg-white dark:bg-[#342A32] text-[#221820] dark:text-[#F5EFF3] shadow-xs'
                        : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
                    }`}
                  >
                    {lang === 'km' ? tab.km : tab.en}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono text-[#7D7179] dark:text-[#9E8F99] tabular-nums">
                {activeConcept.source === 'ai-remix'
                  ? 'AI Remixed'
                  : activeConcept.source === 'ai-fresh'
                    ? 'Auto Designer'
                    : 'Live Studio'}{' '}
                · {activeConcept.masterPrompt.length} chars
              </span>
            </div>

            {/* Error State */}
            {remixError && (
              <div
                role="alert"
                className="mx-4 mt-4 p-3 bg-[#FEF2F2] dark:bg-[#33191D] border border-[#FECACA] dark:border-[#6E2D36] rounded-lg flex items-start gap-2.5 text-xs text-[#991B1B] dark:text-[#FCA5A5]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="leading-relaxed">{remixError}</p>
              </div>
            )}

            {/* Output Body */}
            <div className="p-4">
              {isBusy ? (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-6 h-6 text-[#9E3B5B] dark:text-[#E584A4] animate-spin" />
                  <p className="mt-3 text-xs font-medium text-[#221820] dark:text-[#F5EFF3]">
                    {isAutoDesigning
                      ? lang === 'km'
                        ? 'AI Designer កំពុងចាប់ Prompt ប្រណិតពីរូបផលិតផលរបស់អ្នក...'
                        : 'AI Designer is crafting prompts directly from your photo...'
                      : lang === 'km'
                        ? 'AI កំពុងច្នៃប្រឌិត Prompt ថ្មីកម្រិតប្រណិត...'
                        : 'AI Art Director is elevating your prompt...'}
                  </p>
                </div>
              ) : outputTab === 'prompt' ? (
                <div>
                  <div className="mb-2.5 flex items-baseline justify-between gap-2">
                    <h3 className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                      {lang === 'km' ? activeConcept.titleKm : activeConcept.titleEn}
                    </h3>
                    <span className="text-[11px] text-[#7D7179] dark:text-[#9E8F99] whitespace-nowrap">
                      {selectedEngine.label} · {config.aspectRatio}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-[#5E525A] dark:text-[#C4B7C0] leading-relaxed">
                    {lang === 'km'
                      ? activeConcept.visualDirectionKm
                      : activeConcept.visualDirectionEn}
                  </p>
                  <div className="p-3.5 bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg font-mono text-xs text-[#221820] dark:text-[#EAE1E7] leading-relaxed max-h-[210px] overflow-y-auto select-all">
                    {activeConcept.masterPrompt}
                  </div>
                </div>
              ) : outputTab === 'negative' ? (
                <div>
                  <p className="text-xs text-[#5E525A] dark:text-[#C4B7C0] mb-2.5">
                    {lang === 'km'
                      ? 'ដាក់ចូលប្រអប់ Negative Prompt ដើម្បីការពាររាងដបវៀច ដៃខុសទ្រង់ទ្រាយ ឬពន្លឺប្លាស្ទិកមិនស្អាត។'
                      : 'Paste into your Negative Prompt box to prevent warped tubes, plastic glare, and hand artifacts.'}
                  </p>
                  <div className="p-3.5 bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg font-mono text-xs text-[#4B4148] dark:text-[#C4B7C0] leading-relaxed select-all">
                    {activeConcept.negativePrompt}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-[11px] font-medium text-[#7D7179] dark:text-[#9E8F99] mb-1">
                      {lang === 'km'
                        ? 'Caption ផ្សព្វផ្សាយលើ Facebook'
                        : 'Khmer Facebook Primary Copy'}
                    </p>
                    <div className="p-3 bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg text-[#221820] dark:text-[#EAE1E7] whitespace-pre-line leading-relaxed">
                      {activeConcept.fbPrimaryCopyKm}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                    <div>
                      <span className="text-[#7D7179] dark:text-[#9E8F99] block">
                        Camera Spec
                      </span>
                      <span className="font-medium text-[#221820] dark:text-[#F5EFF3]">
                        {activeConcept.cameraSpec}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7D7179] dark:text-[#9E8F99] block">
                        Lighting Spec
                      </span>
                      <span className="font-medium text-[#221820] dark:text-[#F5EFF3]">
                        {activeConcept.lightingSpec}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Action Bar */}
              <div className="mt-4 pt-4 border-t border-[#EFECE7] dark:border-[#322930] flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      outputTab === 'negative'
                        ? activeConcept.negativePrompt
                        : outputTab === 'copy'
                          ? activeConcept.fbPrimaryCopyKm
                          : activeConcept.masterPrompt,
                      outputTab
                    )
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedField === outputTab ? (
                    <>
                      <Check
                        className="w-3.5 h-3.5 text-[#86EFAC] dark:text-[#15803D]"
                        aria-hidden="true"
                      />
                      <span>
                        {lang === 'km' ? 'បានចម្លងរួចរាល់!' : 'Copied to Clipboard'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {outputTab === 'negative'
                          ? lang === 'km'
                            ? 'ចម្លង Negative'
                            : 'Copy Negative'
                          : outputTab === 'copy'
                            ? lang === 'km'
                              ? 'ចម្លង Caption'
                              : 'Copy Caption'
                            : lang === 'km'
                              ? 'ចម្លង Prompt'
                              : 'Copy Prompt'}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleAiRemix}
                  disabled={isBusy}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-[#9E3B5B] dark:text-[#E584A4] bg-[#9E3B5B]/8 dark:bg-[#E584A4]/12 hover:bg-[#9E3B5B]/15 dark:hover:bg-[#E584A4]/20 border border-[#9E3B5B]/25 dark:border-[#E584A4]/30 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{lang === 'km' ? 'AI កែលម្អឲ្យថ្មី' : 'AI Remix'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  title={lang === 'km' ? 'រក្សាទុកក្នុងបញ្ជី' : 'Save to Vault'}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-white dark:bg-[#1E181D] border border-[#DED8D0] dark:border-[#382E36] hover:border-[#2A1926] dark:hover:border-[#E584A4] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {justSaved ? (
                    <Check
                      className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#4ADE80]"
                      aria-hidden="true"
                    />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">
                    {justSaved
                      ? lang === 'km'
                        ? 'បានរក្សាទុក'
                        : 'Saved'
                      : lang === 'km'
                        ? 'រក្សាទុក'
                        : 'Save'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => exportConceptAsText(activeConcept)}
                  title={
                    lang === 'km' ? 'ទាញយកជាឯកសារ .TXT' : 'Download Brief (.txt)'
                  }
                  className="inline-flex items-center justify-center p-2.5 text-[#574C54] dark:text-[#B9AAB4] bg-white dark:bg-[#1E181D] border border-[#DED8D0] dark:border-[#382E36] hover:border-[#2A1926] dark:hover:border-[#E584A4] hover:text-[#221820] dark:hover:text-[#F5EFF3] rounded-lg transition-colors shrink-0 cursor-pointer"
                  aria-label="Export prompt brief as text file"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Bookmark,
  Check,
  Copy,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  ASPECT_RATIOS,
  CAMPAIGN_GOALS,
  GENERATOR_ENGINES,
  PRODUCT_VARIANTS,
  VIRAL_DESIGN_SPARKS,
} from '../data/presets';
import {
  AspectRatioId,
  CampaignGoalId,
  GeneratedConcept,
  GeneratorEngineId,
  Language,
  ProductVariantId,
  TextPlacementMode,
} from '../types';
import { compressImageFile } from '../utils/imageResize';

interface FreshIdeasLabProps {
  lang: Language;
  concepts: GeneratedConcept[];
  onSetConcepts: (items: GeneratedConcept[]) => void;
  avoidTitles: string[];
  onAddAvoidTitles: (titles: string[]) => void;
  onSaveToVault: (concept: GeneratedConcept) => void;
  onOpenInStudio: (concept: GeneratedConcept) => void;
}

export function FreshIdeasLab({
  lang,
  concepts,
  onSetConcepts,
  avoidTitles,
  onAddAvoidTitles,
  onSaveToVault,
  onOpenInStudio,
}: FreshIdeasLabProps) {
  const [goalId, setGoalId] = useState<CampaignGoalId>('avant-garde-viral');
  const [variantId, setVariantId] = useState<ProductVariantId>('duo');
  const [engineId, setEngineId] = useState<GeneratorEngineId>('midjourney');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>('4:5');
  const [textPlacement, setTextPlacement] = useState<TextPlacementMode>('clean-space');
  const [customBrief, setCustomBrief] = useState('');
  const [customImageDataUrl, setCustomImageDataUrl] = useState<string | undefined>();
  const [customImageName, setCustomImageName] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError(
        lang === 'km'
          ? 'រូបភាពធំពេក (អតិបរមា 15MB)។'
          : 'Image exceeds 15MB limit.'
      );
      return;
    }
    try {
      const compressed = await compressImageFile(file, 1024);
      setCustomImageDataUrl(compressed);
      setCustomImageName(file.name);
      setVariantId('custom');
      await handleGenerateBatch({ imageOverride: compressed, variantOverride: 'custom' });
    } catch {
      setError(
        lang === 'km'
          ? 'មិនអាចអានរូបភាពនេះបានទេ។'
          : 'Unable to read selected image file.'
      );
    }
  };

  const handleGenerateBatch = async (opts?: {
    imageOverride?: string;
    variantOverride?: ProductVariantId;
  }) => {
    setIsLoading(true);
    setError(null);
    const activeImage = opts?.imageOverride ?? customImageDataUrl;
    const activeVariant = opts?.variantOverride ?? variantId;
    try {
      let response: Response | null = null;
      let lastFetchErr: unknown = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await fetch('/api/generate-fresh-concepts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              variantId: activeVariant,
              engineId,
              aspectRatio,
              campaignGoal: goalId,
              textPlacement,
              customBrief,
              avoidTitles,
              customImageDataUrl: activeImage,
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
      let data: { concepts?: GeneratedConcept[]; error?: string } = {};
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
        throw new Error(data?.error || 'Failed to generate fresh AI concepts.');
      }

      const nextConcepts: GeneratedConcept[] = Array.isArray(data?.concepts)
        ? data.concepts
        : [];
      if (nextConcepts.length === 0) {
        throw new Error('No concepts returned. Please try again.');
      }

      onSetConcepts(nextConcepts);
      onAddAvoidTitles(nextConcepts.map((c) => c.titleEn));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to generate fresh concepts.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSave = (concept: GeneratedConcept) => {
    onSaveToVault(concept);
    setSavedIds((prev) => ({ ...prev, [concept.id]: true }));
  };

  return (
    <div className="atelier-enter space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6E2DC] dark:border-[#382E36]">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-[#9E3B5B] dark:text-[#E584A4]">
            {lang === 'km'
              ? 'AI Creative Director · បង្កើតគំនិតផ្សព្វផ្សាយថ្មីៗរហូត មិនច្រំដែល'
              : 'AI Creative Director · Endless Non-Repeating Luxury Ad Concepts'}
          </p>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-semibold text-[#221820] dark:text-[#F5EFF3] tracking-tight">
            {lang === 'km'
              ? 'បង្កើត ៣ គំនិត Facebook Ads ថ្មីប្លែកភ្លាមៗ'
              : 'Generate 3 Brand-New Campaign Concepts'}
          </h1>
          <p className="mt-2 text-sm text-[#5E525A] dark:text-[#C4B7C0] leading-relaxed">
            {lang === 'km'
              ? 'រាល់ពេលចុចបង្កើត ប្រព័ន្ធនឹងចងចាំគំនិតចាស់ៗដើម្បីកុំឲ្យជាន់គ្នា ហើយបង្កើតឈុតឆាក ពន្លឺ Prompt អង់គ្លេស ចំណងជើងខ្មែរ និង Caption Facebook ថ្មីទាំងស្រុង។'
              : 'Every generation remembers previous scenes so it never repeats clichés — producing 3 distinct luxury visual directions, ready-to-paste prompts, and Khmer Facebook copy.'}
          </p>
        </div>

        {avoidTitles.length > 0 && (
          <div className="text-xs text-[#6A5E66] dark:text-[#A99AA4] tabular-nums shrink-0">
            {lang === 'km'
              ? `បានបង្កើតគំនិតថ្មីសរុប ${avoidTitles.length} មិនជាន់គ្នា`
              : `${avoidTitles.length} unique concepts tracked`}
          </div>
        )}
      </div>

      {/* Creative Brief Configurator */}
      <div className="atelier-panel bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 sm:p-6 space-y-6 transition-colors duration-200">
        {/* Campaign Goal */}
        <div>
          <p className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3] mb-2.5">
            {lang === 'km' ? '១. គោលដៅយុទ្ធនាការ (Campaign Goal)' : '1. Campaign Objective'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CAMPAIGN_GOALS.map((goal) => {
              const active = goalId === goal.id;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setGoalId(goal.id)}
                  className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    active
                      ? 'border-[#2A1926] dark:border-[#E584A4] bg-[#FAF8FA] dark:bg-[#2F232C]'
                      : 'border-[#E6E2DC] dark:border-[#382E36] bg-white dark:bg-[#1E181D] hover:border-[#CBBEC7] dark:hover:border-[#594755]'
                  }`}
                >
                  <p className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km' ? goal.nameKm : goal.nameEn}
                  </p>
                  <p className="mt-1 text-[11px] text-[#6A5E66] dark:text-[#A99AA4] leading-snug">
                    {lang === 'km' ? goal.descKm : goal.descEn}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product, Engine, Ratio Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[#EFECE7] dark:border-[#322930]">
          <div>
            <label
              htmlFor="fresh-variant"
              className="block text-xs font-medium text-[#4B4148] dark:text-[#C4B7C0] mb-1.5"
            >
              {lang === 'km' ? 'ផលិតផល' : 'Product'}
            </label>
            <select
              id="fresh-variant"
              value={variantId}
              onChange={(e) => setVariantId(e.target.value as ProductVariantId)}
              className="w-full px-3 py-2.5 text-xs text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg"
            >
              {PRODUCT_VARIANTS.map((v) => (
                <option key={v.id} value={v.id}>
                  {lang === 'km' ? v.nameKm : v.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="fresh-engine"
              className="block text-xs font-medium text-[#4B4148] dark:text-[#C4B7C0] mb-1.5"
            >
              {lang === 'km' ? 'កម្មវិធី AI រូបភាព' : 'Target Generator'}
            </label>
            <select
              id="fresh-engine"
              value={engineId}
              onChange={(e) => setEngineId(e.target.value as GeneratorEngineId)}
              className="w-full px-3 py-2.5 text-xs text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg"
            >
              {GENERATOR_ENGINES.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="fresh-ratio"
              className="block text-xs font-medium text-[#4B4148] dark:text-[#C4B7C0] mb-1.5"
            >
              {lang === 'km' ? 'ទំហំប្លង់' : 'Aspect Ratio'}
            </label>
            <select
              id="fresh-ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatioId)}
              className="w-full px-3 py-2.5 text-xs text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg"
            >
              {ASPECT_RATIOS.map((r) => (
                <option key={r.id} value={r.id}>
                  {lang === 'km' ? r.labelKm : r.labelEn} ({r.dims})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="fresh-text-mode"
              className="block text-xs font-medium text-[#4B4148] dark:text-[#C4B7C0] mb-1.5"
            >
              {lang === 'km' ? 'ទីតាំងអក្សរ Ads' : 'Typography Space'}
            </label>
            <select
              id="fresh-text-mode"
              value={textPlacement}
              onChange={(e) => setTextPlacement(e.target.value as TextPlacementMode)}
              className="w-full px-3 py-2.5 text-xs text-[#221820] dark:text-[#F5EFF3] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg"
            >
              <option value="clean-space">
                {lang === 'km'
                  ? 'ផ្ទៃទំនេរស្អាត (ដាក់អក្សរខ្មែរក្រោយ)'
                  : 'Clean Negative Space'}
              </option>
              <option value="integrated-khmer">
                {lang === 'km' ? 'ប្លង់ Poster សម្រាប់អក្សរខ្មែរ' : 'Poster Layout Zone'}
              </option>
              <option value="english-minimal">
                {lang === 'km' ? 'អក្សរអង់គ្លេសប្រណិត' : 'Minimal English Editorial'}
              </option>
            </select>
          </div>
        </div>

        {/* Optional Custom Brief + Custom Product Upload + Primary Action */}
        <div className="flex flex-col lg:flex-row gap-3 pt-2">
          <input
            type="text"
            value={customBrief}
            onChange={(e) => setCustomBrief(e.target.value)}
            placeholder={
              lang === 'km'
                ? 'បញ្ជាក់រដូវកាល ឬអារម្មណ៍បន្ថែម (ឧ. ប្រូម៉ូសិនថ្ងៃបុណ្យអុំទូក, ស្ទីលរាត្រីប្រណិត, ផ្កាពណ៌ស...)'
                : 'Optional season, theme, or campaign mood (e.g. Rainy season cozy vanilla, Water Festival glow...)'
            }
            className="flex-1 px-4 py-2.5 text-xs text-[#221820] dark:text-[#F5EFF3] placeholder:text-[#968A92] dark:placeholder:text-[#786A73] bg-[#FAF9F7] dark:bg-[#1A1519] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg focus:border-[#9E3B5B] dark:focus:border-[#E584A4] focus:bg-white dark:focus:bg-[#231C22]"
          />

          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-white dark:bg-[#1E181D] border border-[#DED8D0] dark:border-[#382E36] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5 text-[#4A5D8F] dark:text-[#9CB0E3]" aria-hidden="true" />
              <span>
                {customImageName
                  ? customImageName.slice(0, 14)
                  : lang === 'km'
                    ? 'ភ្ជាប់រូបដប'
                    : 'Attach Photo'}
              </span>
            </button>

            {customImageDataUrl && (
              <button
                type="button"
                onClick={() => {
                  setCustomImageDataUrl(undefined);
                  setCustomImageName(undefined);
                  setVariantId('duo');
                }}
                className="p-2.5 text-[#9E3B5B] dark:text-[#E584A4] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg hover:bg-[#FAF9F7] dark:hover:bg-[#2D242B] cursor-pointer"
                aria-label="Remove attached photo"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleGenerateBatch()}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#E8B7C7] dark:text-[#9E3B5B]" aria-hidden="true" />
              )}
              <span>
                {isLoading
                  ? lang === 'km'
                    ? 'កំពុងបង្កើតគំនិតថ្មី...'
                    : 'Crafting Concepts...'
                  : lang === 'km'
                    ? 'បង្កើត ៣ គំនិតថ្មីប្លែក'
                    : 'Generate 3 Fresh Concepts'}
              </span>
            </button>
          </div>
        </div>

        {/* 1-Click Ultra-Cool Viral Inspiration Sparks */}
        <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <span className="text-[11px] font-medium text-[#7D7179] dark:text-[#9E8F99]">
            {lang === 'km' ? 'គំនិតឡូយៗខ្លាំង (ចុចជ្រើសភ្លាម)៖' : 'Bold sparks:'}
          </span>
          {VIRAL_DESIGN_SPARKS.map((spark) => (
            <button
              key={spark.id}
              type="button"
              onClick={() => {
                setGoalId('avant-garde-viral');
                setCustomBrief(spark.brief);
              }}
              className="text-[#4A5D8F] dark:text-[#9CB0E3] hover:text-[#9E3B5B] dark:hover:text-[#E584A4] underline underline-offset-4 decoration-[#D8D3CC] dark:decoration-[#4A3D47] hover:decoration-[#9E3B5B] dark:hover:decoration-[#E584A4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {lang === 'km' ? spark.labelKm : spark.labelEn}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="p-3.5 bg-[#FEF2F2] dark:bg-[#33191D] border border-[#FECACA] dark:border-[#6E2D36] rounded-lg flex items-start gap-2.5 text-xs text-[#991B1B] dark:text-[#FCA5A5]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}
      </div>

      {/* Results Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 space-y-4 animate-pulse"
            >
              <div className="h-3 w-28 bg-[#EFECE7] dark:bg-[#342A32] rounded" />
              <div className="h-6 w-3/4 bg-[#EFECE7] dark:bg-[#342A32] rounded" />
              <div className="h-12 w-full bg-[#F5F3EF] dark:bg-[#2B222A] rounded" />
              <div className="h-32 w-full bg-[#FAF9F7] dark:bg-[#1A1519] rounded-lg" />
              <div className="h-9 w-full bg-[#EFECE7] dark:bg-[#342A32] rounded-lg" />
            </div>
          ))}
        </div>
      ) : concepts.length === 0 ? (
        <div className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-10 text-center max-w-2xl mx-auto">
          <p className="font-display text-2xl font-semibold text-[#221820] dark:text-[#F5EFF3]">
            {lang === 'km'
              ? 'ត្រៀមរួចរាល់សម្រាប់គំនិតថ្មីប្លែកប្រចាំថ្ងៃ'
              : 'Ready for Fresh Editorial Direction'}
          </p>
          <p className="mt-2 text-sm text-[#6A5E66] dark:text-[#A99AA4] leading-relaxed">
            {lang === 'km'
              ? 'ចុចប៊ូតុង "បង្កើត ៣ គំនិតថ្មីប្លែក" ខាងលើ ដើម្បីឲ្យ AI Art Director ច្នៃប្លង់ថតផលិតផល Sស្នេហ៍h Perfume Lotion ថ្មីៗ ៣ ស្ទីលខុសគ្នាភ្លាមៗ។'
              : 'Click "Generate 3 Fresh Concepts" above to receive three distinct, luxury art-directed prompts, color palettes, and Khmer Facebook Ad captions.'}
          </p>
          <button
            type="button"
            onClick={() => handleGenerateBatch()}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8B7C7] dark:text-[#9E3B5B]" aria-hidden="true" />
            <span>
              {lang === 'km' ? 'ចាប់ផ្តើមបង្កើតឥឡូវនេះ' : 'Generate First 3 Concepts'}
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {concepts.map((concept, index) => {
            const isCopied = copiedId === concept.id;
            const isSaved = Boolean(savedIds[concept.id]);

            return (
              <article
                key={concept.id}
                className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 flex flex-col justify-between hover:border-[#CBBEC7] dark:hover:border-[#594755] transition-colors"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[#7D7179] dark:text-[#9E8F99] tabular-nums">
                      0{index + 1} · {concept.aspectRatio} · {concept.engineId}
                    </span>
                    <div className="flex items-center gap-1">
                      {concept.palette.map((hex, i) => (
                        <span
                          key={`${hex}-${i}`}
                          title={hex}
                          className="w-3.5 h-3.5 rounded-full border border-black/15 dark:border-white/20"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[#221820] dark:text-[#F5EFF3] leading-snug">
                      {lang === 'km' ? concept.titleKm : concept.titleEn}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#7D7179] dark:text-[#9E8F99]">
                      {lang === 'km' ? concept.titleEn : concept.titleKm}
                    </p>
                  </div>

                  <p className="text-xs text-[#574C54] dark:text-[#C4B7C0] leading-relaxed">
                    {lang === 'km'
                      ? concept.visualDirectionKm
                      : concept.visualDirectionEn}
                  </p>

                  {/* Khmer Headline Preview */}
                  <div className="py-2.5 border-y border-[#EFECE7] dark:border-[#322930]">
                    <p className="text-[11px] text-[#7D7179] dark:text-[#9E8F99]">
                      {lang === 'km' ? 'ចំណងជើងលើរូបភាព៖' : 'Recommended Headline:'}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[#9E3B5B] dark:text-[#E584A4]">
                      {concept.khmerHeadline}
                    </p>
                    <p className="text-[11px] tracking-wider text-[#6A5E66] dark:text-[#A99AA4]">
                      {concept.subHeadline}
                    </p>
                  </div>

                  {/* Master Prompt */}
                  <div>
                    <p className="text-[11px] font-medium text-[#4B4148] dark:text-[#C4B7C0] mb-1">
                      Master Prompt
                    </p>
                    <div className="p-3 bg-[#FAF9F7] dark:bg-[#161215] border border-[#EFECE7] dark:border-[#322930] rounded-lg font-mono text-[11px] text-[#221820] dark:text-[#EAE1E7] leading-relaxed max-h-40 overflow-y-auto select-all">
                      {concept.masterPrompt}
                    </div>
                  </div>

                  {/* Khmer FB Caption */}
                  <div>
                    <p className="text-[11px] font-medium text-[#4B4148] dark:text-[#C4B7C0] mb-1">
                      {lang === 'km' ? 'Caption Facebook (ខ្មែរ)' : 'Khmer Facebook Caption'}
                    </p>
                    <p className="text-xs text-[#4B4148] dark:text-[#C4B7C0] whitespace-pre-line leading-relaxed line-clamp-3">
                      {concept.fbPrimaryCopyKm}
                    </p>
                  </div>

                  <div className="text-[11px] text-[#7D7179] dark:text-[#9E8F99] pt-1">
                    {concept.cameraSpec} · {concept.lightingSpec}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-4 border-t border-[#EFECE7] dark:border-[#322930] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(concept.id, concept.masterPrompt)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check
                          className="w-3.5 h-3.5 text-[#86EFAC] dark:text-[#15803D]"
                          aria-hidden="true"
                        />
                        <span>{lang === 'km' ? 'បានចម្លង' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{lang === 'km' ? 'ចម្លង Prompt' : 'Copy Prompt'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave(concept)}
                    className="p-2 text-[#221820] dark:text-[#F5EFF3] border border-[#DED8D0] dark:border-[#382E36] hover:border-[#2A1926] dark:hover:border-[#E584A4] rounded-lg transition-colors cursor-pointer"
                    title={lang === 'km' ? 'រក្សាទុក' : 'Save to Vault'}
                    aria-label="Save concept"
                  >
                    {isSaved ? (
                      <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#4ADE80]" aria-hidden="true" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenInStudio(concept)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#9E3B5B] dark:text-[#E584A4] hover:bg-[#9E3B5B]/8 dark:hover:bg-[#E584A4]/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Studio</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

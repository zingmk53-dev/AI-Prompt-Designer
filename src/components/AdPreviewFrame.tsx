import { useState } from 'react';
import { Eye, Grid3X3, MessageCircle, Smartphone, ThumbsUp, Share2 } from 'lucide-react';
import { PRODUCT_VARIANTS, SCENE_PRESETS } from '../data/presets';
import { GeneratedConcept, Language, StudioConfig } from '../types';

interface AdPreviewFrameProps {
  config: StudioConfig;
  concept: GeneratedConcept;
  lang: Language;
}

export function AdPreviewFrame({ config, concept, lang }: AdPreviewFrameProps) {
  const [showFbChrome, setShowFbChrome] = useState(true);
  const [showSafeGrid, setShowSafeGrid] = useState(false);
  const [showHeadlineOverlay, setShowHeadlineOverlay] = useState(true);
  const [imgError, setImgError] = useState(false);

  const selectedScene = SCENE_PRESETS.find((s) => s.id === config.sceneId);
  const selectedVariant = PRODUCT_VARIANTS.find((v) => v.id === config.variantId);

  const previewSrc =
    config.variantId === 'custom' && config.customImageDataUrl
      ? config.customImageDataUrl
      : selectedScene?.referenceImage ??
        selectedVariant?.previewImage ??
        '/assets/aistudio/IMG_1340_c043214e.jpeg';

  const aspectClass =
    config.aspectRatio === '4:5'
      ? 'aspect-[4/5]'
      : config.aspectRatio === '1:1'
        ? 'aspect-square'
        : config.aspectRatio === '9:16'
          ? 'aspect-[9/16] max-w-[290px] mx-auto'
          : 'aspect-[16/9]';

  return (
    <div className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl overflow-hidden transition-colors duration-200">
      {/* Preview control strip */}
      <div className="px-4 py-3 border-b border-[#E6E2DC] dark:border-[#382E36] flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs text-[#6A5E66] dark:text-[#A99AA4] flex items-center gap-2 tabular-nums">
          <span className="font-medium text-[#221820] dark:text-[#F5EFF3]">
            {lang === 'km' ? 'ទិដ្ឋភាពប្លង់ Facebook Ad' : 'Ad Blueprint Preview'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{config.aspectRatio}</span>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-[#F3F1EE] dark:bg-[#1A1519] rounded-lg">
          <button
            type="button"
            onClick={() => setShowFbChrome((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showFbChrome
                ? 'bg-white dark:bg-[#342A32] text-[#221820] dark:text-[#F5EFF3] shadow-xs'
                : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{lang === 'km' ? 'ស៊ុម FB' : 'FB Frame'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowHeadlineOverlay((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showHeadlineOverlay
                ? 'bg-white dark:bg-[#342A32] text-[#221820] dark:text-[#F5EFF3] shadow-xs'
                : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{lang === 'km' ? 'អក្សរ' : 'Type'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSafeGrid((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showSafeGrid
                ? 'bg-white dark:bg-[#342A32] text-[#221820] dark:text-[#F5EFF3] shadow-xs'
                : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{lang === 'km' ? 'បន្ទាត់ប្លង់' : 'Grid'}</span>
          </button>
        </div>
      </div>

      {/* Simulated Facebook Sponsored Header */}
      <div className="p-4 bg-[#FAF9F7] dark:bg-[#171216]">
        <div className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg overflow-hidden max-w-[440px] mx-auto">
          {showFbChrome && (
            <div className="px-3.5 py-2.5 border-b border-[#EFECE7] dark:border-[#322930]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#2A1926] dark:bg-[#F2E9EE] text-white dark:text-[#1A1519] font-display text-sm font-semibold flex items-center justify-center shrink-0">
                    S
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3] truncate">
                      Sស្នេហ៍h Perfume Lotion Official
                    </p>
                    <p className="text-[11px] text-[#7D7179] dark:text-[#9E8F99]">
                      Sponsored · {lang === 'km' ? 'សាធារណៈ' : 'Public'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#7D7179] dark:text-[#9E8F99] tracking-widest">
                  •••
                </span>
              </div>
              <p className="mt-2 text-xs text-[#382E35] dark:text-[#D5C9D1] leading-relaxed line-clamp-2 whitespace-pre-line">
                {concept.fbPrimaryCopyKm}
              </p>
            </div>
          )}

          {/* Creative Media Canvas */}
          <div className={`relative w-full overflow-hidden bg-[#EFECE7] dark:bg-[#1D171C] ${aspectClass}`}>
            {!imgError ? (
              <img
                src={previewSrc}
                alt={concept.titleEn}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-300"
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                style={{
                  background: `linear-gradient(135deg, ${concept.palette[0]} 0%, ${concept.palette[1]}40 100%)`,
                }}
              >
                <span className="font-display text-2xl text-[#221820]">Sneh Atelier</span>
                <span className="text-xs text-[#6A5E66] mt-1">{concept.titleEn}</span>
              </div>
            )}

            {/* Measured Headline Safe-Zone Overlay Preview */}
            {showHeadlineOverlay && config.khmerHeadline.trim() && (
              <div className="absolute inset-x-0 top-0 p-4 pt-5 bg-gradient-to-b from-[#1E131B]/80 via-[#1E131B]/40 to-transparent text-center pointer-events-none">
                <p className="text-white text-sm sm:text-base font-semibold leading-snug drop-shadow-xs">
                  {config.khmerHeadline}
                </p>
                {config.subHeadline.trim() && (
                  <p className="mt-1 text-[10px] tracking-[0.2em] text-white/90 font-medium">
                    {config.subHeadline}
                  </p>
                )}
              </div>
            )}

            {/* Composition & FB Safe Zone Guide */}
            {showSafeGrid && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div key={idx} className="border border-white/35" />
                  ))}
                </div>
                <div className="absolute inset-x-3 top-3 h-[22%] border border-dashed border-[#E8B7C7] bg-[#2A1926]/20 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-white px-2 py-0.5 bg-[#2A1926]/80 rounded">
                    Headline Safe Zone
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Facebook Sponsored Footer Bar */}
          {showFbChrome && (
            <div className="bg-[#FAF9F7] dark:bg-[#1E181D] px-3.5 py-2.5 border-t border-[#EFECE7] dark:border-[#322930]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-[#7D7179] dark:text-[#9E8F99] truncate">
                    MESSENGER · SNEH PERFUME LOTION
                  </p>
                  <p className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3] truncate">
                    {config.khmerHeadline || concept.titleKm}
                  </p>
                </div>
                <span className="px-3 py-1.5 text-xs font-medium bg-[#E8E4DE] dark:bg-[#342A32] text-[#221820] dark:text-[#F5EFF3] rounded-md whitespace-nowrap shrink-0">
                  {concept.fbCtaKm || 'ផ្ញើសារ'}
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#E6E2DC] dark:border-[#322930] flex items-center justify-around text-[11px] text-[#6A5E66] dark:text-[#A99AA4]">
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" /> Like
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" /> Comment
                </span>
                <span className="inline-flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" /> Share
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Palette & Technical Metadata Strip (Zero-pill typography) */}
        <div className="mt-3.5 flex items-center justify-between gap-4 text-xs text-[#6A5E66] dark:text-[#A99AA4] flex-wrap">
          <div className="flex items-center gap-2">
            <span>{lang === 'km' ? 'ក្ដារពណ៌៖' : 'Palette:'}</span>
            <div className="flex items-center gap-1.5">
              {concept.palette.map((hex, idx) => (
                <span
                  key={`${hex}-${idx}`}
                  title={hex}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-[#4E434B] dark:text-[#C4B7C0]"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/15 dark:border-white/20 inline-block"
                    style={{ backgroundColor: hex }}
                  />
                  {hex}
                </span>
              ))}
            </div>
          </div>
          <span className="font-mono text-[11px] text-[#6A5E66] dark:text-[#A99AA4]">
            {concept.lightingSpec}
          </span>
        </div>
      </div>
    </div>
  );
}

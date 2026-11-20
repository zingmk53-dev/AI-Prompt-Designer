import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import {
  DEFAULT_STUDIO_CONFIG,
  REFERENCE_AD_STUDIES,
  SCENE_PRESETS,
} from '../data/presets';
import { Language, ScenePreset, StudioConfig } from '../types';
import { buildLivePrompt } from '../utils/promptBuilder';

interface ReferenceLibraryProps {
  lang: Language;
  onLoadIntoStudio: (patch: Partial<StudioConfig>) => void;
}

export function ReferenceLibrary({ lang, onLoadIntoStudio }: ReferenceLibraryProps) {
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | ScenePreset['category']
  >('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: {
    id: 'all' | ScenePreset['category'];
    labelKm: string;
    labelEn: string;
  }[] = [
    { id: 'all', labelKm: 'ទាំងអស់ (20)', labelEn: 'All Blueprints (20)' },
    { id: 'avant-garde', labelKm: 'ឡូយៗខ្លាំង (8)', labelEn: 'Bold Viral (8)' },
    { id: 'sensory', labelKm: 'សាច់ឡេ & សំណើម', labelEn: 'Sensory & Moisture' },
    { id: 'architectural', labelKm: 'ស្ថាបត្យកម្មប្រណិត', labelEn: 'Architectural' },
    { id: 'lifestyle', labelKm: 'ធម្មជាតិ & ស្បែកស្អាត', labelEn: 'Lifestyle Glow' },
    { id: 'dramatic', labelKm: 'ទាក់ទាញភ្នែកខ្ពស់', labelEn: 'Editorial Dramatic' },
  ];

  const filteredScenes =
    categoryFilter === 'all'
      ? SCENE_PRESETS
      : SCENE_PRESETS.filter((s) => s.category === categoryFilter);

  const handleCopyScenePrompt = (scene: ScenePreset) => {
    const built = buildLivePrompt({
      ...DEFAULT_STUDIO_CONFIG,
      sceneId: scene.id,
      lightingId: scene.recommendedLighting,
      selectedProps: scene.recommendedProps,
    });
    navigator.clipboard.writeText(built.masterPrompt);
    setCopiedId(scene.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="atelier-enter space-y-12">
      {/* Section 1: The 3 Uploaded Sneh Signature Reference Ads */}
      <section aria-labelledby="signature-refs-heading">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6E2DC] dark:border-[#382E36]">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-[#9E3B5B] dark:text-[#E584A4]">
              {lang === 'km'
                ? '០១. ការវិភាគគំរូរូបភាពផលិតផលទាំង ៣ របស់អ្នក'
                : '01. Visual Deconstruction of Your 3 Signature Ads'}
            </p>
            <h1
              id="signature-refs-heading"
              className="mt-1.5 font-display text-3xl sm:text-4xl font-semibold text-[#221820] dark:text-[#F5EFF3] tracking-tight"
            >
              {lang === 'km'
                ? 'រចនាប័ទ្មគំរូ Sស្នេហ៍h Perfume Lotion'
                : 'Signature Sneh Campaign Studies'}
            </h1>
            <p className="mt-2 text-sm text-[#5E525A] dark:text-[#C4B7C0] leading-relaxed">
              {lang === 'km'
                ? 'ចុចលើគំរូណាមួយខាងក្រោម ដើម្បីទាញយកប្លង់ ពន្លឺ ក្ដារពណ៌ និងរចនាប័ទ្មទាំងអស់ចូលទៅក្នុង Prompt Studio ភ្លាមៗ រួចកែច្នៃឲ្យចេញជាគំនិតថ្មីប្លែក។'
                : 'Load any of your three benchmark Sneh ads directly into the Prompt Studio to preserve its winning visual DNA while remixing fresh sets and lighting.'}
            </p>
          </div>
          <div className="text-xs text-[#6A5E66] dark:text-[#A99AA4] tabular-nums shrink-0">
            Rosy Violet · Black Vanilla · 4:5 Feed
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-7">
          {REFERENCE_AD_STUDIES.map((study) => (
            <article
              key={study.id}
              className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl overflow-hidden flex flex-col hover:border-[#CBBEC7] dark:hover:border-[#594755] transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="aspect-[4/5] w-full bg-[#F3F1EE] dark:bg-[#171216] overflow-hidden">
                <img
                  src={study.image}
                  alt={study.titleEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-[#7D7179] dark:text-[#9E8F99]">
                  {lang === 'km' ? study.tagKm : study.tagEn}
                </p>
                <h2 className="mt-1 text-base font-semibold text-[#221820] dark:text-[#F5EFF3] leading-snug">
                  {lang === 'km' ? study.titleKm : study.titleEn}
                </h2>
                <p className="mt-2.5 text-sm text-[#574C54] dark:text-[#C4B7C0] leading-relaxed">
                  {lang === 'km' ? study.compositionKm : study.compositionEn}
                </p>
                <p className="mt-2.5 text-xs text-[#6A5E66] dark:text-[#A99AA4] leading-relaxed pt-2.5 border-t border-[#EFECE7] dark:border-[#322930]">
                  <span className="font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km' ? 'ចំណុចទាក់ទាញ៖ ' : 'Why it converts: '}
                  </span>
                  {lang === 'km' ? study.whyItWorksKm : study.whyItWorksEn}
                </p>

                <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {study.palette.map((hex) => (
                      <span
                        key={hex}
                        title={hex}
                        className="w-4 h-4 rounded-full border border-black/15 dark:border-white/20"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => onLoadIntoStudio(study.studioPreset)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>
                      {lang === 'km' ? 'ប្រើរចនាប័ទ្មនេះ' : 'Load in Studio'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Section 2: 12 Fresh Luxury Set Design Blueprints */}
      <section aria-labelledby="fresh-blueprints-heading">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[#E6E2DC] dark:border-[#382E36]">
          <div>
            <p className="text-xs font-medium text-[#4A5D8F] dark:text-[#9CB0E3]">
              {lang === 'km'
                ? '០២. បណ្ណាល័យប្លង់ថតប្រណិត ២០ ស្ទីល (រួមមាន ៨ គំនិតឡូយៗខ្លាំង)'
                : '02. 20 Curated Editorial & Bold Viral Set Blueprints'}
            </p>
            <h2
              id="fresh-blueprints-heading"
              className="mt-1.5 font-display text-2xl sm:text-3xl font-semibold text-[#221820] dark:text-[#F5EFF3]"
            >
              {lang === 'km'
                ? 'ប្លង់ Design ឡូយៗខ្លាំង និងថ្មីៗមិនច្រំដែល'
                : 'Twenty Bold & Luxury Ad Directions'}
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F3F1EE] dark:bg-[#231C22] border border-transparent dark:border-[#382E36] rounded-lg overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-white dark:bg-[#342A32] text-[#221820] dark:text-[#F5EFF3] shadow-xs'
                    : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
                }`}
              >
                {lang === 'km' ? cat.labelKm : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenes.map((scene) => {
            const isCopied = copiedId === scene.id;
            return (
              <div
                key={scene.id}
                className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 flex flex-col justify-between hover:border-[#CBBEC7] dark:hover:border-[#594755] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#7D7179] dark:text-[#9E8F99] capitalize">
                      {scene.category} · 4:5 / 1:1 / 9:16
                    </span>
                    <div className="flex items-center gap-1">
                      {scene.palette.map((hex) => (
                        <span
                          key={hex}
                          className="w-3 h-3 rounded-full border border-black/15 dark:border-white/20"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="mt-2 text-base font-semibold text-[#221820] dark:text-[#F5EFF3]">
                    {lang === 'km' ? scene.nameKm : scene.nameEn}
                  </h3>
                  <p className="mt-1 text-xs text-[#6A5E66] dark:text-[#A99AA4]">
                    {lang === 'km' ? scene.subtitleKm : scene.subtitleEn}
                  </p>
                  <p className="mt-3 text-xs font-mono text-[#4B4148] dark:text-[#D5C9D1] bg-[#FAF9F7] dark:bg-[#161215] border border-[#EFECE7] dark:border-[#322930] rounded-lg p-3 line-clamp-3 leading-relaxed">
                    {scene.promptSnippet}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFECE7] dark:border-[#322930] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyScenePrompt(scene)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] hover:bg-[#F3F1EE] dark:hover:bg-[#2F252D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#4ADE80]" aria-hidden="true" />
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
                    onClick={() =>
                      onLoadIntoStudio({
                        sceneId: scene.id,
                        lightingId: scene.recommendedLighting,
                        selectedProps: scene.recommendedProps,
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#9E3B5B] dark:text-[#E584A4] hover:text-[#7A2944] dark:hover:text-[#F4A6BE] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{lang === 'km' ? 'បើកក្នុង Studio' : 'Open in Studio'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

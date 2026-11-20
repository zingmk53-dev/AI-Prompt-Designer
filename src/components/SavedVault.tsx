import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { GENERATOR_ENGINES } from '../data/presets';
import { GeneratedConcept, GeneratorEngineId, Language } from '../types';
import { exportConceptAsText, exportVaultAsJson } from '../utils/promptBuilder';

interface SavedVaultProps {
  items: GeneratedConcept[];
  lang: Language;
  onDelete: (id: string) => void;
  onOpenInStudio: (concept: GeneratedConcept) => void;
  onGoToFresh: () => void;
}

export function SavedVault({
  items,
  lang,
  onDelete,
  onOpenInStudio,
  onGoToFresh,
}: SavedVaultProps) {
  const [query, setQuery] = useState('');
  const [engineFilter, setEngineFilter] = useState<'all' | GeneratorEngineId>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (engineFilter !== 'all' && item.engineId !== engineFilter) return false;
      if (!q) return true;
      return (
        item.titleKm.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.masterPrompt.toLowerCase().includes(q) ||
        item.khmerHeadline.toLowerCase().includes(q)
      );
    });
  }, [items, query, engineFilter]);

  const handleCopy = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="atelier-enter space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6E2DC] dark:border-[#382E36]">
        <div>
          <p className="text-xs font-medium text-[#9E3B5B] dark:text-[#E584A4]">
            {lang === 'km'
              ? 'បណ្ណាល័យផ្ទាល់ខ្លួន · រក្សាទុកស្វ័យប្រវត្តិលើឧបករណ៍របស់អ្នក'
              : 'Campaign Prompt Archive · Persisted Locally'}
          </p>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-semibold text-[#221820] dark:text-[#F5EFF3] tracking-tight">
            {lang === 'km'
              ? `Prompt ដែលបានរក្សាទុក (${items.length})`
              : `Saved Prompt Vault (${items.length})`}
          </h1>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => exportVaultAsJson(items)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-white dark:bg-[#231C22] border border-[#DED8D0] dark:border-[#382E36] hover:border-[#2A1926] dark:hover:border-[#E584A4] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{lang === 'km' ? 'នាំចេញទាំងអស់ (.JSON)' : 'Export All (.JSON)'}</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-[#7D7179] dark:text-[#9E8F99] absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                lang === 'km'
                  ? 'ស្វែងរកតាមចំណងជើង ឬពាក្យក្នុង Prompt...'
                  : 'Search saved titles, headlines, or prompts...'
              }
              className="w-full pl-9 pr-3 py-2 text-xs text-[#221820] dark:text-[#F5EFF3] placeholder:text-[#968A92] dark:placeholder:text-[#786A73] bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-lg focus:border-[#9E3B5B] dark:focus:border-[#E584A4]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F3F1EE] dark:bg-[#231C22] border border-transparent dark:border-[#382E36] rounded-lg overflow-x-auto">
            <button
              type="button"
              onClick={() => setEngineFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                engineFilter === 'all'
                  ? 'bg-white dark:bg-[#342A32] text-[#221820] dark:text-[#F5EFF3] shadow-xs'
                  : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
              }`}
            >
              {lang === 'km' ? 'ទាំងអស់' : 'All'}
            </button>
            {GENERATOR_ENGINES.map((engine) => (
              <button
                key={engine.id}
                type="button"
                onClick={() => setEngineFilter(engine.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  engineFilter === engine.id
                    ? 'bg-white dark:bg-[#342A32] text-[#221820] dark:text-[#F5EFF3] shadow-xs'
                    : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
                }`}
              >
                {engine.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty or Populated List */}
      {items.length === 0 ? (
        <div className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-10 text-center max-w-xl mx-auto">
          <p className="font-display text-2xl font-semibold text-[#221820] dark:text-[#F5EFF3]">
            {lang === 'km'
              ? 'មិនទាន់មាន Prompt ដែលបានរក្សាទុកនៅឡើយទេ'
              : 'Your Saved Vault is Empty'}
          </p>
          <p className="mt-2 text-sm text-[#6A5E66] dark:text-[#A99AA4] leading-relaxed">
            {lang === 'km'
              ? 'រក្សាទុក Prompt ដែលអ្នកពេញចិត្តពី Studio ឬបង្កើតគំនិតថ្មីដោយ AI ដើម្បីងាយស្រួលយកទៅផលិតរូបភាព Ads លើកក្រោយ។'
              : 'Save favorite ad prompts from the Studio or AI Fresh Ideas Lab to organize your seasonal Facebook campaigns here.'}
          </p>
          <button
            type="button"
            onClick={onGoToFresh}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8B7C7] dark:text-[#9E3B5B]" aria-hidden="true" />
            <span>{lang === 'km' ? 'បង្កើតគំនិតថ្មី AI' : 'Generate Fresh Concepts'}</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-8 text-center text-sm text-[#6A5E66] dark:text-[#A99AA4]">
          {lang === 'km'
            ? 'រកមិនឃើញ Prompt ដែលត្រូវនឹងពាក្យស្វែងរកនេះទេ។'
            : 'No saved prompts match your current filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <article
                key={item.id}
                className="bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#7D7179] dark:text-[#9E8F99]">
                    <span className="tabular-nums">
                      {item.engineId} · {item.aspectRatio} ·{' '}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.palette.map((hex, i) => (
                        <span
                          key={`${hex}-${i}`}
                          className="w-3 h-3 rounded-full border border-black/15 dark:border-white/20"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[#221820] dark:text-[#F5EFF3]">
                      {lang === 'km' ? item.titleKm : item.titleEn}
                    </h2>
                    {item.khmerHeadline && (
                      <p className="mt-0.5 text-xs font-medium text-[#9E3B5B] dark:text-[#E584A4]">
                        {item.khmerHeadline}
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-[#FAF9F7] dark:bg-[#161215] border border-[#EFECE7] dark:border-[#322930] rounded-lg font-mono text-[11px] text-[#221820] dark:text-[#EAE1E7] leading-relaxed line-clamp-4 select-all">
                    {item.masterPrompt}
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#EFECE7] dark:border-[#322930] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.masterPrompt)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
                          <span>{lang === 'km' ? 'ចម្លង' : 'Copy'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenInStudio(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#4A5D8F] dark:text-[#9CB0E3] hover:bg-[#F3F1EE] dark:hover:bg-[#2F252D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>{lang === 'km' ? 'បើក Studio' : 'Open'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => exportConceptAsText(item)}
                      className="p-1.5 text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3] hover:bg-[#F3F1EE] dark:hover:bg-[#2F252D] rounded-md transition-colors cursor-pointer"
                      aria-label="Download text brief"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#DC2626] dark:hover:text-[#F87171] hover:bg-[#FEF2F2] dark:hover:bg-[#33191D] rounded-md transition-colors cursor-pointer"
                      aria-label="Delete saved prompt"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

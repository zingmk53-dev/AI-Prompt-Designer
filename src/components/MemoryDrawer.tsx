import { Clock, Film, Image as ImageIcon, RotateCcw, Trash2, X } from 'lucide-react';
import { Language, MemoryEntry } from '../types';

interface MemoryDrawerProps {
  entries: MemoryEntry[];
  lang: Language;
  onRestore: (entry: MemoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

function formatShortTime(iso: string, lang: Language): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(lang === 'km' ? 'km-KH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function MemoryDrawer({
  entries,
  lang,
  onRestore,
  onDelete,
  onClearAll,
  onClose,
}: MemoryDrawerProps) {
  return (
    <section
      aria-label={lang === 'km' ? 'ប្រវត្តិចងចាំ Atelier' : 'Atelier Memory'}
      className="atelier-enter atelier-panel mb-6 bg-white/95 dark:bg-[#231C22]/95 border border-[#E6E2DC] dark:border-[#382E36] rounded-xl p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE7] dark:border-[#322930] pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#221820] dark:text-[#F5EFF3]">
            <Clock
              className="w-4 h-4 text-[#9E3B5B] dark:text-[#E584A4]"
              aria-hidden="true"
            />
            <span>
              {lang === 'km'
                ? 'ប្រវត្តិចងចាំស្វ័យប្រវត្តិ (Atelier Memory)'
                : 'Atelier Creative Memory'}
            </span>
          </div>
          <p className="text-xs text-[#6A5E66] dark:text-[#A99AA4]">
            {lang === 'km'
              ? 'Tool ចងចាំគ្រប់ Prompt រូបភាព និង TVC ដែលអ្នកទើបបង្កើតដោយស្វ័យប្រវត្តិ ទោះបីបិទបើកទំព័រឡើងវិញក៏មិនបាត់។'
              : 'Every generated Image Ad concept and TVC storyboard is automatically remembered across refreshes for 1-click return.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {entries.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#9E3B5B] dark:hover:text-[#E584A4] rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{lang === 'km' ? 'សម្អាតទាំងអស់' : 'Clear All'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'km' ? 'បិទប្រវត្តិចងចាំ' : 'Close memory panel'}
            className="p-1.5 text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="py-5 text-center text-xs text-[#6A5E66] dark:text-[#A99AA4]">
          {lang === 'km'
            ? 'មិនទាន់មានប្រវត្តិចងចាំនៅឡើយទេ — ចាប់ផ្តើមបង្កើត Prompt រូបភាព ឬ Prompt TVC ដំបូង ហើយ Tool នឹងចងចាំជូនស្វ័យប្រវត្តិ។'
            : 'No recent items yet — generate an Image Prompt or TVC Blueprint and it will appear here automatically.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group flex flex-col justify-between gap-3 p-3.5 rounded-lg bg-[#FAF9F7] dark:bg-[#181317] border border-[#E6E2DC] dark:border-[#352B33] hover:border-[#9E3B5B]/60 dark:hover:border-[#E584A4]/60 transition-colors"
            >
              <div className="space-y-1.5">
                {/* Quiet metadata line (zero pills) */}
                <div className="flex items-center justify-between gap-2 text-[11px] text-[#6A5E66] dark:text-[#A99AA4]">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#9E3B5B] dark:text-[#E584A4]">
                    {entry.kind === 'tvc' ? (
                      <Film className="w-3 h-3" aria-hidden="true" />
                    ) : (
                      <ImageIcon className="w-3 h-3" aria-hidden="true" />
                    )}
                    <span>
                      {entry.kind === 'tvc'
                        ? lang === 'km'
                          ? 'វីដេអូ TVC'
                          : 'TVC Film'
                        : lang === 'km'
                          ? 'រូបភាព Ads'
                          : 'Image Ad'}
                    </span>
                  </span>
                  <span className="tabular-nums text-[11px]">
                    {entry.metaLabel} · {formatShortTime(entry.createdAt, lang)}
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#221820] dark:text-[#F5EFF3] leading-snug line-clamp-2">
                  {lang === 'km' ? entry.titleKm : entry.titleEn}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EFECE7] dark:border-[#2C232A]">
                <div className="flex items-center gap-1">
                  {entry.palette.slice(0, 3).map((hex, i) => (
                    <span
                      key={`${hex}-${i}`}
                      className="w-3 h-3 rounded-full border border-black/10 dark:border-white/15"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    aria-label={lang === 'km' ? 'លុបចេញពីប្រវត្តិ' : 'Remove from memory'}
                    className="p-1 text-[#8E828A] dark:text-[#8E7F8A] hover:text-[#9E3B5B] dark:hover:text-[#E584A4] rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRestore(entry)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-md transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    <span>{lang === 'km' ? 'បើកឡើងវិញ' : 'Restore'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

import { Sparkles } from 'lucide-react';
import { ActiveTab, Language } from '../types';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  vaultCount: number;
  lang: Language;
  onQuickFresh: () => void;
}

export function TopBar({
  activeTab,
  onSelectTab,
  vaultCount,
  lang,
  onQuickFresh,
}: TopBarProps) {
  const navItems: { id: ActiveTab; labelKm: string; labelEn: string }[] = [
    { id: 'studio', labelKm: 'បង្កើត Prompt', labelEn: 'Prompt Studio' },
    { id: 'tvc', labelKm: 'Prompt TVC', labelEn: 'TVC Director' },
    { id: 'references', labelKm: 'គំរូប្រណិត', labelEn: 'Reference Ads' },
    { id: 'fresh', labelKm: 'គំនិតថ្មី AI', labelEn: 'AI Fresh Ideas' },
    {
      id: 'vault',
      labelKm: vaultCount > 0 ? `រក្សាទុក (${vaultCount})` : 'បានរក្សាទុក',
      labelEn: vaultCount > 0 ? `Saved (${vaultCount})` : 'Saved Vault',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F7]/90 dark:bg-[#1A1519]/90 backdrop-blur-md border-b border-[#E6E2DC]/90 dark:border-[#352B33] transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element luxury brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('studio')}
          className="font-display text-[26px] font-semibold tracking-tight text-[#221820] dark:text-[#F5EFF3] whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity cursor-pointer"
        >
          Sneh{' '}
          <span className="italic font-medium text-[#9E3B5B] dark:text-[#E584A4]">
            Atelier
          </span>
        </button>

        {/* Zone 2: Clean single-line text navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#221820] dark:text-[#F5EFF3] font-semibold'
                    : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
                }`}
              >
                <span className="tabular-nums">
                  {lang === 'km' ? item.labelKm : item.labelEn}
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[21px] h-[2px] bg-gradient-to-r from-[#9E3B5B] via-[#C8A565] to-[#9E3B5B] dark:from-[#E584A4] dark:via-[#E8C58E] dark:to-[#E584A4]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onQuickFresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles
              className="w-3.5 h-3.5 text-[#E8C58E] dark:text-[#9E3B5B]"
              aria-hidden="true"
            />
            <span>{lang === 'km' ? 'បង្កើតគំនិតថ្មី' : 'New AI Concept'}</span>
          </button>
        </div>
      </div>

      {/* Mobile clean single-row tab bar */}
      <nav
        aria-label="Mobile Navigation"
        className="flex md:hidden items-center justify-between px-4 border-t border-[#E6E2DC]/80 dark:border-[#352B33] overflow-x-auto"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`py-2.5 px-2 text-xs whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isActive
                  ? 'border-[#9E3B5B] dark:border-[#E584A4] text-[#221820] dark:text-[#F5EFF3] font-semibold'
                  : 'border-transparent text-[#6A5E66] dark:text-[#A99AA4]'
              }`}
            >
              {lang === 'km' ? item.labelKm : item.labelEn}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

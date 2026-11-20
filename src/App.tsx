import { useEffect, useState } from 'react';
import { Check, Clock, Moon, Sun } from 'lucide-react';
import { TopBar } from './components/TopBar';
import { PromptStudio } from './components/PromptStudio';
import { TvcDirector } from './components/TvcDirector';
import { ReferenceLibrary } from './components/ReferenceLibrary';
import { FreshIdeasLab } from './components/FreshIdeasLab';
import { SavedVault } from './components/SavedVault';
import { MemoryDrawer } from './components/MemoryDrawer';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  ActiveTab,
  GeneratedConcept,
  GeneratedTvc,
  Language,
  MemoryEntry,
  StudioConfig,
} from './types';
import {
  loadMemoryHistory,
  loadSavedLang,
  loadSavedStudioConfig,
  loadSavedTab,
  loadSavedTvc,
  saveCurrentTvc,
  saveLang,
  saveMemoryHistory,
  saveStudioConfig,
  saveTab,
} from './utils/memoryStorage';

const VAULT_STORAGE_KEY = 'sneh_atelier_saved_vault_v1';
const THEME_STORAGE_KEY = 'sneh_atelier_theme_v1';

type ThemeMode = 'light' | 'dark';

function loadVaultFromStorage(): GeneratedConcept[] {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadThemeFromStorage(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // Ignore storage access errors
  }
  return 'light';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(loadSavedTab);
  const [lang, setLang] = useState<Language>(loadSavedLang);
  const [theme, setTheme] = useState<ThemeMode>(loadThemeFromStorage);
  const [studioConfig, setStudioConfig] = useState<StudioConfig>(loadSavedStudioConfig);
  const [aiOverrideConcept, setAiOverrideConcept] = useState<GeneratedConcept | null>(
    null
  );
  const [freshConcepts, setFreshConcepts] = useState<GeneratedConcept[]>([]);
  const [avoidTitles, setAvoidTitles] = useState<string[]>([]);
  const [currentTvc, setCurrentTvc] = useState<GeneratedTvc | null>(loadSavedTvc);
  const [tvcAvoidTitles, setTvcAvoidTitles] = useState<string[]>([]);
  const [vaultItems, setVaultItems] = useState<GeneratedConcept[]>(loadVaultFromStorage);
  const [memoryHistory, setMemoryHistory] = useState<MemoryEntry[]>(loadMemoryHistory);
  const [showMemoryDrawer, setShowMemoryDrawer] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage quota issues cleanly
    }
  }, [theme]);

  useEffect(() => {
    saveLang(lang);
  }, [lang]);

  useEffect(() => {
    saveTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    saveStudioConfig(studioConfig);
  }, [studioConfig]);

  useEffect(() => {
    saveCurrentTvc(currentTvc);
  }, [currentTvc]);

  useEffect(() => {
    saveMemoryHistory(memoryHistory);
  }, [memoryHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vaultItems));
    } catch {
      // Ignore storage quota issues cleanly
    }
  }, [vaultItems]);

  const recordConceptMemory = (concept: GeneratedConcept) => {
    const entry: MemoryEntry = {
      id: `mem-img-${concept.id}-${Date.now()}`,
      kind: 'image',
      titleKm: concept.titleKm,
      titleEn: concept.titleEn,
      metaLabel: `${concept.aspectRatio}`,
      palette: concept.palette,
      createdAt: new Date().toISOString(),
      concept,
    };
    setMemoryHistory((prev) => {
      const deduped = prev.filter((item) => item.titleEn !== concept.titleEn);
      return [entry, ...deduped].slice(0, 16);
    });
  };

  const handleSetTvc = (tvc: GeneratedTvc) => {
    setCurrentTvc(tvc);
    const entry: MemoryEntry = {
      id: `mem-tvc-${tvc.id}`,
      kind: 'tvc',
      titleKm: tvc.titleKm,
      titleEn: tvc.titleEn,
      metaLabel: `${tvc.aspectRatio} · ${tvc.shots.length}s`,
      palette: tvc.palette,
      createdAt: tvc.createdAt || new Date().toISOString(),
      tvc,
    };
    setMemoryHistory((prev) => {
      const deduped = prev.filter((item) => item.id !== entry.id);
      return [entry, ...deduped].slice(0, 16);
    });
  };

  const handleSetFreshConcepts = (concepts: GeneratedConcept[]) => {
    setFreshConcepts(concepts);
    if (concepts.length > 0) {
      recordConceptMemory(concepts[0]);
    }
  };

  const handleRestoreMemory = (entry: MemoryEntry) => {
    if (entry.kind === 'tvc' && entry.tvc) {
      setCurrentTvc(entry.tvc);
      setActiveTab('tvc');
      setShowMemoryDrawer(false);
      showToast(
        lang === 'km'
          ? 'បានស្តារ Prompt TVC ពីប្រវត្តិចងចាំ'
          : 'Restored TVC Blueprint from Memory'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (entry.kind === 'image' && entry.concept) {
      handleOpenConceptInStudio(entry.concept);
      setShowMemoryDrawer(false);
      showToast(
        lang === 'km'
          ? 'បានស្តារ Prompt រូបភាពពីប្រវត្តិចងចាំ'
          : 'Restored Image Prompt from Memory'
      );
    }
  };

  const handleSaveToVault = (concept: GeneratedConcept) => {
    setVaultItems((prev) => {
      const deduped = prev.filter((item) => item.id !== concept.id);
      return [concept, ...deduped];
    });
    showToast(
      lang === 'km' ? 'បានរក្សាទុកក្នុង Saved Vault រួចរាល់' : 'Saved to Atelier Vault'
    );
  };

  const handleDeleteFromVault = (id: string) => {
    setVaultItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLoadPresetIntoStudio = (patch: Partial<StudioConfig>) => {
    setStudioConfig((prev) => ({ ...prev, ...patch }));
    setAiOverrideConcept(null);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenConceptInStudio = (concept: GeneratedConcept) => {
    setStudioConfig((prev) => ({
      ...prev,
      variantId: concept.variantId,
      engineId: concept.engineId,
      aspectRatio: concept.aspectRatio,
      khmerHeadline: concept.khmerHeadline || prev.khmerHeadline,
      subHeadline: concept.subHeadline || prev.subHeadline,
    }));
    setAiOverrideConcept(concept);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen flex flex-col atelier-canvas text-[#221820] dark:text-[#F5EFF3] transition-colors duration-200">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        vaultCount={vaultItems.length}
        lang={lang}
        onQuickFresh={() => {
          setActiveTab('fresh');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 pt-5 pb-12">
        {/* Global Workspace Preferences & Atelier Memory Bar */}
        <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowMemoryDrawer((prev) => !prev)}
            aria-expanded={showMemoryDrawer}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showMemoryDrawer
                ? 'border-[#2A1926] dark:border-[#E584A4] bg-white dark:bg-[#2F232C] text-[#221820] dark:text-[#F5EFF3]'
                : 'border-[#E6E2DC] dark:border-[#382E36] bg-white/90 dark:bg-[#261F25] text-[#5E525A] dark:text-[#C4B7C0] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
            }`}
          >
            <Clock
              className="w-3.5 h-3.5 text-[#9E3B5B] dark:text-[#E584A4]"
              aria-hidden="true"
            />
            <span className="tabular-nums">
              {lang === 'km'
                ? memoryHistory.length > 0
                  ? `ប្រវត្តិចងចាំ (${memoryHistory.length})`
                  : 'ប្រវត្តិចងចាំ Atelier'
                : memoryHistory.length > 0
                  ? `Atelier Memory (${memoryHistory.length})`
                  : 'Atelier Memory'}
            </span>
          </button>

          <div className="flex items-center gap-2.5 flex-wrap ml-auto">
            <PWAInstallButton
              lang={lang}
              onInstalled={() =>
                showToast(
                  lang === 'km'
                    ? 'បានដំឡើងកម្មវិធី Sneh Atelier រួចរាល់!'
                    : 'Sneh Atelier installed successfully!'
                )
              }
            />

            <div className="inline-flex items-center p-0.5 bg-[#F3F1EE] dark:bg-[#261F25] rounded-lg border border-[#E6E2DC] dark:border-[#382E36]">
              <button
                type="button"
                onClick={() => setLang('km')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  lang === 'km'
                    ? 'bg-white dark:bg-[#3A2F38] text-[#221820] dark:text-[#F5EFF3] shadow-xs'
                    : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
                }`}
              >
                ភាសាខ្មែរ
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white dark:bg-[#3A2F38] text-[#221820] dark:text-[#F5EFF3] shadow-xs'
                    : 'text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3]'
                }`}
              >
                English
              </button>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === 'dark'}
              aria-label={
                theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
              }
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-white/90 dark:bg-[#261F25] border border-[#E6E2DC] dark:border-[#382E36] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#E8C58E]" aria-hidden="true" />
                  <span>{lang === 'km' ? 'ពន្លឺថ្ងៃ (Light)' : 'Light Mode'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#9E3B5B]" aria-hidden="true" />
                  <span>{lang === 'km' ? 'ពន្លឺរាត្រី (Dark)' : 'Dark Mode'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Persistent Atelier Memory Shelf */}
        {showMemoryDrawer && (
          <MemoryDrawer
            entries={memoryHistory}
            lang={lang}
            onRestore={handleRestoreMemory}
            onDelete={(id) =>
              setMemoryHistory((prev) => prev.filter((item) => item.id !== id))
            }
            onClearAll={() => setMemoryHistory([])}
            onClose={() => setShowMemoryDrawer(false)}
          />
        )}

        {activeTab === 'studio' && (
          <PromptStudio
            config={studioConfig}
            onChangeConfig={setStudioConfig}
            aiOverrideConcept={aiOverrideConcept}
            onSetAiOverride={setAiOverrideConcept}
            onSaveToVault={handleSaveToVault}
            onRecordMemory={recordConceptMemory}
            lang={lang}
          />
        )}

        {activeTab === 'tvc' && (
          <TvcDirector
            lang={lang}
            tvc={currentTvc}
            onSetTvc={handleSetTvc}
            avoidTitles={tvcAvoidTitles}
            onAddAvoidTitles={(titles) =>
              setTvcAvoidTitles((prev) => Array.from(new Set([...prev, ...titles])))
            }
            onSaveToVault={handleSaveToVault}
          />
        )}

        {activeTab === 'references' && (
          <ReferenceLibrary
            lang={lang}
            onLoadIntoStudio={handleLoadPresetIntoStudio}
          />
        )}

        {activeTab === 'fresh' && (
          <FreshIdeasLab
            lang={lang}
            concepts={freshConcepts}
            onSetConcepts={handleSetFreshConcepts}
            avoidTitles={avoidTitles}
            onAddAvoidTitles={(titles) =>
              setAvoidTitles((prev) => Array.from(new Set([...prev, ...titles])))
            }
            onSaveToVault={handleSaveToVault}
            onOpenInStudio={handleOpenConceptInStudio}
          />
        )}

        {activeTab === 'vault' && (
          <SavedVault
            items={vaultItems}
            lang={lang}
            onDelete={handleDeleteFromVault}
            onOpenInStudio={handleOpenConceptInStudio}
            onGoToFresh={() => setActiveTab('fresh')}
          />
        )}
      </main>

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator lang={lang} />

      {/* Subtle Toast Confirmation */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="atelier-enter fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-white dark:text-[#1A1519] bg-[#2A1926] dark:bg-[#F2E9EE] rounded-lg shadow-lg"
        >
          <Check
            className="w-3.5 h-3.5 text-[#E8C58E] dark:text-[#9E3B5B]"
            aria-hidden="true"
          />
          <span>{toastMsg}</span>
        </div>
      )}

      <footer className="bg-transparent transition-colors duration-200">
        <div className="h-px atelier-rule w-full" aria-hidden="true" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7D7179] dark:text-[#9E8F99]">
          <span className="font-display text-base font-semibold text-[#221820] dark:text-[#F5EFF3]">
            Sneh{' '}
            <span className="italic font-medium text-[#9E3B5B] dark:text-[#E584A4]">
              Atelier
            </span>
          </span>
          <span>
            {lang === 'km'
              ? 'ឧបករណ៍រចនា Prompt រូបភាព Facebook Ads & TVC សម្រាប់ឡេទឹកអប់ Sស្នេហ៍h Perfume Lotion'
              : 'Luxury Facebook Ads & TVC Prompt Studio for Sneh Perfume Lotion'}
          </span>
        </div>
      </footer>
    </div>
  );
}

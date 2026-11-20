import { DEFAULT_STUDIO_CONFIG } from '../data/presets';
import {
  ActiveTab,
  GeneratedTvc,
  Language,
  MemoryEntry,
  StudioConfig,
} from '../types';

const KEYS = {
  lang: 'sneh_atelier_lang_v1',
  tab: 'sneh_atelier_active_tab_v1',
  studioConfig: 'sneh_atelier_studio_config_v1',
  currentTvc: 'sneh_atelier_current_tvc_v1',
  memoryHistory: 'sneh_atelier_memory_history_v1',
} as const;

const VALID_TABS: ActiveTab[] = ['studio', 'tvc', 'references', 'fresh', 'vault'];

export function loadSavedLang(): Language {
  try {
    const val = localStorage.getItem(KEYS.lang);
    if (val === 'km' || val === 'en') return val;
  } catch {
    // Ignore storage access errors
  }
  return 'km';
}

export function saveLang(lang: Language): void {
  try {
    localStorage.setItem(KEYS.lang, lang);
  } catch {
    // Ignore quota errors
  }
}

export function loadSavedTab(): ActiveTab {
  try {
    const val = localStorage.getItem(KEYS.tab) as ActiveTab | null;
    if (val && VALID_TABS.includes(val)) return val;
  } catch {
    // Ignore storage access errors
  }
  return 'studio';
}

export function saveTab(tab: ActiveTab): void {
  try {
    localStorage.setItem(KEYS.tab, tab);
  } catch {
    // Ignore quota errors
  }
}

export function loadSavedStudioConfig(): StudioConfig {
  try {
    const raw = localStorage.getItem(KEYS.studioConfig);
    if (!raw) return DEFAULT_STUDIO_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        ...DEFAULT_STUDIO_CONFIG,
        ...parsed,
        customImageDataUrl: undefined,
        customImageName: undefined,
      };
    }
  } catch {
    // Ignore malformed data
  }
  return DEFAULT_STUDIO_CONFIG;
}

export function saveStudioConfig(config: StudioConfig): void {
  try {
    // Exclude large base64 data URLs to keep localStorage fast and within quota
    const lightweight: StudioConfig = {
      ...config,
      variantId: config.variantId === 'custom' ? 'duo' : config.variantId,
      customImageDataUrl: undefined,
      customImageName: undefined,
    };
    localStorage.setItem(KEYS.studioConfig, JSON.stringify(lightweight));
  } catch {
    // Ignore quota errors
  }
}

export function loadSavedTvc(): GeneratedTvc | null {
  try {
    const raw = localStorage.getItem(KEYS.currentTvc);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.shots)) {
      return parsed as GeneratedTvc;
    }
  } catch {
    // Ignore malformed data
  }
  return null;
}

export function saveCurrentTvc(tvc: GeneratedTvc | null): void {
  try {
    if (!tvc) {
      localStorage.removeItem(KEYS.currentTvc);
      return;
    }
    localStorage.setItem(KEYS.currentTvc, JSON.stringify(tvc));
  } catch {
    // Ignore quota errors
  }
}

export function loadMemoryHistory(): MemoryEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.memoryHistory);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MemoryEntry[]).slice(0, 16) : [];
  } catch {
    // Ignore malformed data
  }
  return [];
}

export function saveMemoryHistory(entries: MemoryEntry[]): void {
  try {
    localStorage.setItem(KEYS.memoryHistory, JSON.stringify(entries.slice(0, 16)));
  } catch {
    // Ignore quota errors
  }
}

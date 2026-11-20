import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types';

interface OfflineIndicatorProps {
  lang: Language;
}

export function OfflineIndicator({ lang }: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="atelier-enter fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-lg bg-[#2A1926] dark:bg-[#F2E9EE] px-3.5 py-2 text-xs font-medium text-white dark:text-[#1A1519] shadow-lg"
    >
      <WifiOff
        className="w-3.5 h-3.5 text-[#E8C58E] dark:text-[#9E3B5B]"
        aria-hidden="true"
      />
      <span>
        {lang === 'km'
          ? 'គ្មានអ៊ីនធឺណិត · កំពុងប្រើទិន្នន័យដែលបានរក្សាទុក'
          : 'Offline Mode · Using cached studio data'}
      </span>
    </div>
  );
}

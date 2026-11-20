import { useState } from 'react';
import { Check, Copy, Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  lang: Language;
  onInstalled?: () => void;
}

export function PWAInstallButton({ lang, onInstalled }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Automatically suppress once running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        onInstalled?.();
      }
      return;
    }
    setShowGuideModal(true);
  };

  const handleCopyAppUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white dark:text-[#1A1519] bg-[#9E3B5B] hover:bg-[#852E4A] dark:bg-[#E584A4] dark:hover:bg-[#EE9BB6] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" aria-hidden="true" />
        <span>
          {isInstallable
            ? lang === 'km'
              ? 'ដំឡើងកម្មវិធី'
              : 'Install App'
            : isIOS
              ? lang === 'km'
                ? 'ដំឡើងលើ iPhone / iPad'
                : 'Install on iOS'
              : lang === 'km'
                ? 'ដំឡើងកម្មវិធី (App)'
                : 'Install App'}
        </span>
      </button>

      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="atelier-enter w-full max-w-md rounded-2xl bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#EFECE7] dark:border-[#322930] pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="Sneh Atelier App Icon"
                  className="w-11 h-11 rounded-xl border border-[#E6E2DC] dark:border-[#382E36] shrink-0"
                />
                <div>
                  <h3
                    id="pwa-install-title"
                    className="font-display text-xl font-semibold text-[#221820] dark:text-[#F5EFF3]"
                  >
                    {lang === 'km'
                      ? 'ដំឡើង Sneh Atelier លើឧបករណ៍អ្នក'
                      : 'Install Sneh Atelier App'}
                  </h3>
                  <p className="text-xs text-[#6A5E66] dark:text-[#A99AA4]">
                    {lang === 'km'
                      ? 'ប្រើដូច App ពេញអេក្រង់ · បើកលឿនពីអេក្រង់ដើម'
                      : 'Full-screen standalone app · Instant home screen launch'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label={lang === 'km' ? 'បិទ' : 'Close'}
                className="p-1.5 text-[#6A5E66] dark:text-[#A99AA4] hover:text-[#221820] dark:hover:text-[#F5EFF3] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isInIframe && (
              <div className="p-3.5 rounded-xl bg-[#FAF9F7] dark:bg-[#161215] border border-[#E6E2DC] dark:border-[#382E36] space-y-2.5">
                <p className="text-xs text-[#3C3139] dark:text-[#DCD1D8] leading-relaxed">
                  {lang === 'km'
                    ? 'ដើម្បីដំឡើងជាកម្មវិធីលើទូរស័ព្ទ ឬកុំព្យូទ័រ សូមបើកតំណភ្ជាប់ App នេះនៅក្នុង Browser ពេញ (Safari ឬ Chrome) ជាមុនសិន៖'
                    : 'To trigger native installation on your phone or computer, open this app URL directly in a standalone Safari or Chrome tab first:'}
                </p>
                <button
                  type="button"
                  onClick={handleCopyAppUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#221820] dark:text-[#F5EFF3] bg-white dark:bg-[#231C22] border border-[#E6E2DC] dark:border-[#382E36] hover:border-[#9E3B5B] dark:hover:border-[#E584A4] rounded-lg transition-colors cursor-pointer"
                >
                  {copiedUrl ? (
                    <>
                      <Check
                        className="w-3.5 h-3.5 text-[#9E3B5B] dark:text-[#E584A4]"
                        aria-hidden="true"
                      />
                      <span>{lang === 'km' ? 'បានចម្លងតំណភ្ជាប់ App' : 'App URL Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{lang === 'km' ? 'ចម្លងតំណភ្ជាប់ App' : 'Copy App URL'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="space-y-3 text-xs text-[#3C3139] dark:text-[#DCD1D8]">
              <div className="p-3.5 rounded-xl bg-[#FAF9F7] dark:bg-[#161215] border border-[#EFECE7] dark:border-[#322930] space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-[#221820] dark:text-[#F5EFF3]">
                  <Share
                    className="w-3.5 h-3.5 text-[#9E3B5B] dark:text-[#E584A4]"
                    aria-hidden="true"
                  />
                  <span>
                    {lang === 'km'
                      ? 'សម្រាប់ iPhone / iPad (Safari)'
                      : 'On iPhone / iPad (Safari)'}
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[#5E525A] dark:text-[#C4B7C0] leading-relaxed">
                  <li>
                    {lang === 'km'
                      ? 'ចុចប៊ូតុង Share (រូបប្រអប់មានព្រួញឡើងលើ) នៅខាងក្រោម Safari'
                      : 'Tap the Share button in the Safari toolbar.'}
                  </li>
                  <li>
                    {lang === 'km'
                      ? 'អូសចុះក្រោម រួចចុច Add to Home Screen (បន្ថែមទៅអេក្រង់ដើម)'
                      : 'Scroll down and tap Add to Home Screen.'}
                  </li>
                  <li>
                    {lang === 'km'
                      ? 'ចុច Add ដើម្បីដំឡើងរូបតំណាង Sneh Atelier'
                      : 'Tap Add to place Sneh Atelier on your home screen.'}
                  </li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF9F7] dark:bg-[#161215] border border-[#EFECE7] dark:border-[#322930] space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-[#221820] dark:text-[#F5EFF3]">
                  <Smartphone
                    className="w-3.5 h-3.5 text-[#4A5D8F] dark:text-[#9CB0E3]"
                    aria-hidden="true"
                  />
                  <span>
                    {lang === 'km'
                      ? 'សម្រាប់ Android / កុំព្យូទ័រ (Chrome / Edge)'
                      : 'On Android / Desktop (Chrome / Edge)'}
                  </span>
                </div>
                <p className="text-[#5E525A] dark:text-[#C4B7C0] leading-relaxed">
                  {lang === 'km'
                    ? 'បើកក្នុង Chrome ឬ Edge ហើយចុចរូប Install នៅជ្រុងស្តាំនៃរបារអាសយដ្ឋាន ឬចុចម៉ឺនុយ (⋮) → Install app / Add to Home screen។'
                    : 'Open in Chrome or Edge, then click the Install icon in the address bar or open the menu (⋮) → Install app.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 text-xs font-medium text-white dark:text-[#1A1519] bg-[#2A1926] hover:bg-[#3F2439] dark:bg-[#F2E9EE] dark:hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              {lang === 'km' ? 'យល់ព្រម / បិទ' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

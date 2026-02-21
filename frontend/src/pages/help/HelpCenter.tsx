import { useState } from 'react';
import { FileText, ShieldCheck, Bug, Mail, ExternalLink, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFaqs } from '../../hooks/useFaqs';

export function HelpCenter() {
  const { t } = useTranslation();

  const faqs = useFaqs();

  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedSupport, setCopiedSupport] = useState(false);
  const [copiedBugs, setCopiedBugs] = useState(false);

  const copyToClipboard = async (text: string, target: 'support' | 'bugs') => {
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      if (target === 'support') {
        setCopiedSupport(true);
        setTimeout(() => setCopiedSupport(false), 1500);
      } else {
        setCopiedBugs(true);
        setTimeout(() => setCopiedBugs(false), 1500);
      }
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 app-bg-pattern">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {t('helpcenter-title')}
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {t('helpcenter-description')}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <a
                href="/terms"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                {t('global-terms')}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="/policy"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                {t('global-policy')}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <div className="space-y-2 mt-2">
            {faqs.map(item => (
              <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <button
                  onClick={() => setOpenId(prev => (prev === item.id ? null : item.id))}
                  className="w-full text-left px-4 py-3 flex items-start justify-between gap-4"
                  aria-expanded={openId === item.id}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {item.question}
                    </div>
                  </div>

                  <div className="ml-3 text-xs text-zinc-500 dark:text-zinc-400">
                    {openId === item.id ? '-' : '+'}
                  </div>
                </button>

                {openId === item.id && (
                  <div className="px-4 pb-4 pt-0 text-xs text-zinc-600 dark:text-zinc-400">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col">
            <div>
              <a
                href="mailto:support@example.com?subject=Support%20Request"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                {t('helpcenter-mail-support')}
              </a>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="text-sm">support@example.com</span>
              <button
                type="button"
                onClick={() => copyToClipboard('support@example.com', 'support')}
                aria-label="Copy support email"
                className="inline-flex items-center justify-center w-6 h-6 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {copiedSupport ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col justify-between">
            <div>
              <a
                href="mailto:bugs@example.com?subject=Bug%20report"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Bug className="w-4 h-4" />
                {t('helpcenter-mail-report')}
              </a>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="text-sm">bugs@example.com</span>
              <button
                type="button"
                onClick={() => copyToClipboard('bugs@example.com', 'bugs')}
                aria-label="Copy bug report email"
                className="inline-flex items-center justify-center w-6 h-6 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {copiedBugs ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

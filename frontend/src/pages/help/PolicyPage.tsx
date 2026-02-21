import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownArticle } from '../../components/MarkdownArticle';
import enPolicy from '../../locales/en/policy.md?raw';
import ruPolicy from '../../locales/ru/policy.md?raw';

export function PolicyPage() {
  const { i18n } = useTranslation();
  const content = useMemo(() => {
    const lang = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase();
    return lang.startsWith('ru') ? ruPolicy : enPolicy;
  }, [i18n.resolvedLanguage, i18n.language]);

  return (
    <div className="flex-1 h-[100vh] overflow-y-auto p-6 app-bg-pattern">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <MarkdownArticle content={content} />
        </div>
      </div>
    </div>
  );
}

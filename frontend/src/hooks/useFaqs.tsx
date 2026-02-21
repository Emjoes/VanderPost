import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

function isFaqArray(value: unknown): value is FaqItem[] {
  return Array.isArray(value) && value.every(item => (
    item &&
    typeof item === 'object' &&
    typeof (item as FaqItem).id === 'string' &&
    typeof (item as FaqItem).question === 'string' &&
    typeof (item as FaqItem).answer === 'string'
  ));
}

export function useFaqs() {
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    const localized = t('helpcenter-faq', { returnObjects: true });
    if (isFaqArray(localized)) {
      return localized;
    }

    const fallback = i18n.getResource('en', 'translation', 'helpcenter-faq');
    return isFaqArray(fallback) ? fallback : [];
  }, [i18n, t]);
}

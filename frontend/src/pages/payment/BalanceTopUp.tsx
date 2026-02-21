import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubscriptionPlans } from '../../components/SubscriptionPlans';
import type { BillingPeriod } from '../../components/SubscriptionPlans';

interface BalanceTopUpProps {
  onTopUpCoins: (coins: number) => void;
}

export function BalanceTopUp({ onTopUpCoins }: BalanceTopUpProps) {
  const { t } = useTranslation();

  const [period, setPeriod] = useState<BillingPeriod>('monthly');

  const handleSubscribe = (plan: { id: string; title: string; period: 'monthly' | 'yearly'; price: number; coins: number }) => {
    alert(
      t('payment-subscribe-alert', {
        plan: plan.title,
        period: plan.period === 'monthly' ? t('payment-billing-monthly') : t('payment-billing-yearly'),
        price: plan.price,
        coins: plan.coins.toLocaleString(),
      })
    );
  };

  const handleManualTopUp = ({ coins }: { dollars: number; coins: number }) => {
    onTopUpCoins(coins);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 app-bg-pattern">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {t('payment-subscriptions-title')}
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {t('payment-subscriptions-description')}
              </p>
            </div>

            <div className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-1 text-xs">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  period === 'monthly'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {t('payment-billing-monthly')}
              </button>
              <button
                type="button"
                onClick={() => setPeriod('yearly')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  period === 'yearly'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {t('payment-billing-yearly')}
              </button>
            </div>
          </div>
        </div>

        <SubscriptionPlans
          period={period}
          onSubscribe={handleSubscribe}
          showManualTopUp
          onManualTopUp={handleManualTopUp}
        />
      </div>
    </div>
  );
}

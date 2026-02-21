import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ManualTopUpProps {
  conversionRate?: number;
  onTopUp: (topUp: { dollars: number; coins: number }) => void;
  centered?: boolean;
}

export function ManualTopUp({ conversionRate = 100, onTopUp, centered = true }: ManualTopUpProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');

  const dollars = Number(amount);
  const isValidAmount = Number.isFinite(dollars) && dollars >= 1 && dollars <= 10000;

  const coins = useMemo(() => {
    if (!isValidAmount) return 0;
    return Math.floor(dollars * conversionRate);
  }, [conversionRate, dollars, isValidAmount]);

  const handleTopUp = () => {
    if (!isValidAmount || coins <= 0) {
      alert(t('payment-manual-invalid-amount'));
      return;
    }

    alert(t('payment-manual-alert', { dollars: dollars.toFixed(2), coins: coins.toLocaleString() }));
    onTopUp({ dollars, coins });
    setAmount('');
  };

  return (
    <div className={centered ? 'mx-auto w-full max-w-2xl' : 'w-full h-full'}>
      <div className="relative overflow-hidden h-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_45%)]" />

        <div className="relative h-full flex flex-col">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t('payment-manual-title')}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {t('payment-manual-description')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-2">
              <label htmlFor="manual-top-up-amount" className="block text-xs text-zinc-600 dark:text-zinc-400">
                {t('payment-manual-amount-label')}
              </label>

              <div className="w-full flex items-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-transparent">
                <span className="pl-3 text-xs text-zinc-500 dark:text-zinc-400">$</span>
                <input
                  id="manual-top-up-amount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amount}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, '').slice(0, 5);

                    if (!digits) {
                      setAmount('');
                      return;
                    }

                    const numeric = Number(digits);
                    if (numeric < 1) {
                      setAmount('');
                      return;
                    }

                    setAmount(String(Math.min(10000, numeric)));
                  }}
                  placeholder={t('payment-manual-amount-placeholder')}
                  className="w-full px-2.5 py-2 text-xs bg-transparent border-0 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <p className="w-full inline-flex items-center px-2 py-1 rounded-md text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                {t('payment-manual-rate', { rate: conversionRate })}
              </p>
            </div>

            <div className="w-full p-3 rounded-lg border border-amber-200 dark:border-amber-400/40 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10">
              <div className="text-xs text-amber-800/80 dark:text-amber-200/80 mb-1">
                {t('payment-manual-coins-label')}
              </div>
              <div className="text-lg font-semibold text-amber-700 dark:text-amber-300 leading-none">
                {coins.toLocaleString()} VC
              </div>
            </div>
          </div>

          <div className="mt-3 mt-auto">
            <button
              type="button"
              onClick={handleTopUp}
              disabled={!isValidAmount}
              className="w-full px-4 py-2 rounded-md text-xs font-medium bg-blue-600 text-white enabled:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-default transition-colors"
            >
              {t('payment-manual-pay-button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

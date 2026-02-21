import { useTranslation } from 'react-i18next';
import { ManualTopUp } from './ManualTopUp';

export type BillingPeriod = 'monthly' | 'yearly';

type PlanPrice = {
  price: number;
  coins: number;
  discount?: number;
};

type SubscriptionPlan = {
  id: 'mini' | 'pro' | 'premium';
  titleKey: string;
  monthly: PlanPrice;
  yearly: PlanPrice;
  featureKeys: string[];
};

interface SubscribePayload {
  id: string;
  title: string;
  period: BillingPeriod;
  price: number;
  coins: number;
}

interface ManualTopUpPayload {
  dollars: number;
  coins: number;
}

interface SubscriptionPlansProps {
  period: BillingPeriod;
  onSubscribe: (plan: SubscribePayload) => void;
  showManualTopUp?: boolean;
  onManualTopUp?: (topUp: ManualTopUpPayload) => void;
  manualTopUpRate?: number;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'mini',
    titleKey: 'payment-plan-mini-title',
    monthly: {
      price: 9,
      coins: 1000,
    },
    yearly: {
      price: 108,
      discount: 90,
      coins: 12000,
    },
    featureKeys: [
      'payment-plan-mini-feature-1',
      'payment-plan-mini-feature-2',
      'payment-plan-mini-feature-3',
    ],
  },
  {
    id: 'pro',
    titleKey: 'payment-plan-pro-title',
    monthly: {
      price: 49,
      coins: 5500,
    },
    yearly: {
      price: 588,
      discount: 490,
      coins: 66000,
    },
    featureKeys: [
      'payment-plan-pro-feature-1',
      'payment-plan-pro-feature-2',
      'payment-plan-pro-feature-3',
    ],
  },
  {
    id: 'premium',
    titleKey: 'payment-plan-premium-title',
    monthly: {
      price: 99,
      coins: 11000,
    },
    yearly: {
      price: 1188,
      discount: 990,
      coins: 132000,
    },
    featureKeys: [
      'payment-plan-premium-feature-1',
      'payment-plan-premium-feature-2',
      'payment-plan-premium-feature-3',
    ],
  },
];

function PlanCard({
  plan,
  period,
  onSubscribe,
}: {
  plan: SubscriptionPlan;
  period: BillingPeriod;
  onSubscribe: (plan: SubscribePayload) => void;
}) {
  const { t } = useTranslation();
  const planPrice = period === 'monthly' ? plan.monthly : plan.yearly;
  const hasDiscount = typeof planPrice.discount === 'number';
  const finalPrice = hasDiscount ? planPrice.discount! : planPrice.price;
  const planTitle = t(plan.titleKey);

  return (
    <div className="p-4 h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {planTitle}
        </h3>
        {hasDiscount && (
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs">
            {t('payment-discount-label')}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-end gap-2">
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          ${finalPrice}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
          {period === 'monthly' ? t('payment-price-month') : t('payment-price-year')}
        </span>
        {hasDiscount && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through mb-0.5">
            ${planPrice.price}
          </span>
        )}
      </div>

      <div className="mt-1 text-xs text-amber-700 dark:text-amber-300">
        {t('payment-coins-value', { coins: planPrice.coins.toLocaleString() })}
      </div>

      <ul className="mt-3 space-y-1.5 flex-1">
        {plan.featureKeys.map(featureKey => (
          <li key={featureKey} className="text-xs text-zinc-600 dark:text-zinc-400">
            - {t(featureKey)}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSubscribe({
          id: plan.id,
          title: planTitle,
          period,
          price: finalPrice,
          coins: planPrice.coins,
        })}
        className="mt-3 px-3 py-2 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        {t('payment-subscribe-button')}
      </button>
    </div>
  );
}

export function SubscriptionPlans({
  period,
  onSubscribe,
  showManualTopUp = false,
  onManualTopUp,
  manualTopUpRate,
}: SubscriptionPlansProps) {
  const miniPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === 'mini');
  const proPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === 'pro');
  const premiumPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === 'premium');

  if (showManualTopUp && miniPlan && proPlan && premiumPlan && onManualTopUp) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 items-stretch">
          <PlanCard plan={miniPlan} period={period} onSubscribe={onSubscribe} />
          <PlanCard plan={proPlan} period={period} onSubscribe={onSubscribe} />
        </div>

        <div className="grid grid-cols-2 gap-3 items-stretch">
          <PlanCard plan={premiumPlan} period={period} onSubscribe={onSubscribe} />
          <ManualTopUp
            centered={false}
            conversionRate={manualTopUpRate}
            onTopUp={onManualTopUp}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 items-stretch">
      {SUBSCRIPTION_PLANS.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          period={period}
          onSubscribe={onSubscribe}
        />
      ))}
    </div>
  );
}

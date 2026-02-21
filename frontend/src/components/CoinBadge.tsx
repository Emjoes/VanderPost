interface CoinBadgeProps {
  coins: number;
  className?: string;
}

export function CoinBadge({ coins, className = '' }: CoinBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold leading-none whitespace-nowrap bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-400/20 dark:text-amber-200 dark:border-amber-400/40 ${className}`}
    >
      <span className="text-xs">{coins}</span>
      <span className="text-xs">VC</span>
    </div>
  );
}

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharacterCounter({ current, max, className = '' }: CharacterCounterProps) {
  return (
    <span
      className={`pointer-events-none absolute bottom-2 right-2 text-[10px] leading-none text-zinc-500 dark:text-zinc-400 ${className}`}
      aria-hidden="true"
    >
      {current} / {max}
    </span>
  );
}

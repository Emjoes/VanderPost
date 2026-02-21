import { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CharacterCounter } from '../components/CharacterCounter';
import { INPUT_LIMITS } from '../config';

interface TelegramModalProps {
  heading: string;
  channel: string;
  onChannelChange: (value: string) => void;
  onClose: () => void;
}

export function TelegramModal({ heading, channel, onChannelChange, onClose }: TelegramModalProps) {
  const { t } = useTranslation();
  const channelId = useId();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xl transform animate-scaleIn">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {heading}
          </h3>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <label htmlFor={channelId} className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              {t('sociallist-telegram-channel-label')}
            </label>
            <input
              id={channelId}
              type="text"
              value={channel}
              onChange={e => onChannelChange(e.target.value)}
              placeholder="@mychannel"
              maxLength={INPUT_LIMITS.telegramChannel}
              className="w-full px-2.5 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            <CharacterCounter current={channel.length} max={INPUT_LIMITS.telegramChannel} className="bottom-[5px]" />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {t('neurallist-save-button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

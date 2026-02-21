import { useState } from 'react';
import { Youtube, Send, Instagram, Plus, Settings } from 'lucide-react';
import type { SocialConnection, SocialPlatform } from '../../App';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { YoutubeModal } from '../../modals/YoutubeModal';
import { TelegramModal } from '../../modals/TelegramModal';
import { InstagramModal } from '../../modals/InstagramModal';

interface SocialNetworksProps {
  networks: SocialConnection[];
  selectedPlatforms: SocialPlatform[];
  onTogglePlatform: (platformId: SocialPlatform) => void;
}

export function SocialNetworks({ networks, selectedPlatforms, onTogglePlatform }: SocialNetworksProps) {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<SocialPlatform | null>(null);
  const [telegramChannel, setTelegramChannel] = useState('');

  const openSettings = (platformId: SocialPlatform) => {
    setActivePlatform(platformId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActivePlatform(null);
  };
  
  const getIcon = (platformId: SocialPlatform): JSX.Element | null => {
    switch (platformId) {
      case 'youtube':
        return (
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
            <Youtube className="w-4.5 h-4.5 text-white" />
          </div>
        );
      case 'telegram':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </div>
        );
      case 'instagram':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
            <Instagram className="w-4.5 h-4.5 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-56 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          {t("sociallist-title")}
        </h2>
      </div>

      <div className="p-2 space-y-1">
        {networks
          .slice()
          .sort((a, b) => Number(b.connected) - Number(a.connected))
          .map(network => {
            const connected = network.connected;
            const selected = selectedPlatforms.includes(network.id);
            const rowClassName = `w-full group rounded-md border transition-all duration-200 px-2.5 py-2 flex items-center gap-2.5 justify-start ${
              selected && connected
                ? 'bg-green-100 dark:bg-green-950/20 border-green-200 dark:border-green-900 shadow-sm'
                : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800'
            } ${!connected ? 'opacity-90 cursor-default' : 'cursor-pointer'}`;

            const rowContent = (
              <>
                {getIcon(network.id)}

                <div className="flex flex-1 min-w-0 items-center justify-between">
                  <div className={`text-xs font-medium ${connected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {network.name}
                  </div>

                  {connected ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openSettings(network.id);
                      }}
                      className="w-4 h-4 rounded-md flex items-center justify-center text-zinc-400 dark:text-zinc-500 transition-colors"
                      aria-label={`Settings ${network.name}`}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePlatform(network.id);
                      }}
                      aria-label={`Connect ${network.name}`}
                      className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </>
            );

            if (connected) {
              return (
                <div
                  key={network.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onTogglePlatform(network.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onTogglePlatform(network.id);
                    }
                  }}
                  aria-pressed={selected}
                  className={rowClassName}
                >
                  {rowContent}
                </div>
              );
            }

            return (
              <div key={network.id} className={rowClassName}>
                {rowContent}
              </div>
            );
          })}
      </div>

      {isModalOpen && activePlatform === 'youtube' && (
        <YoutubeModal
          heading={networks.find(n => n.id === 'youtube')?.name ?? 'YouTube'}
          onClose={closeModal}
        />
      )}

      {isModalOpen && activePlatform === 'telegram' && (
        <TelegramModal
          heading={networks.find(n => n.id === 'telegram')?.name ?? 'Telegram'}
          channel={telegramChannel}
          onChannelChange={setTelegramChannel}
          onClose={closeModal}
        />
      )}

      {isModalOpen && activePlatform === 'instagram' && (
        <InstagramModal
          heading={networks.find(n => n.id === 'instagram')?.name ?? 'Instagram'}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

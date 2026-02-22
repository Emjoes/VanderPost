import { Mail, User, Shield, Youtube, Send, Instagram, LogOut } from 'lucide-react';
import type { SocialConnection, SocialPlatform, UserInfo } from '../../App';
import { useTranslation } from 'react-i18next';

interface ProfileProps {
  socialNetworks: SocialConnection[];
  userInfo: UserInfo | null;
  onTogglePlatformConnection: (platformId: SocialPlatform) => void;
  onLogout?: () => void;
}

export function Profile({ socialNetworks, userInfo, onTogglePlatformConnection, onLogout }: ProfileProps) {
  const { t } = useTranslation();

  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case 'youtube':
        return (
          <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
            <Youtube className="w-5 h-5 text-white" />
          </div>
        );
      case 'telegram':
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
        );
      case 'instagram':
        return (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
            <Instagram className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
          </div>
        );
    }
  };

  const connectedCount = socialNetworks.filter(n => n.connected).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 app-bg-pattern">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-300 to-purple-700 flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-2 ring-blue-500">
                {userInfo?.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt='Avatar'
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInfo?.name?.[0]?.toUpperCase() || ''
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                  {userInfo?.name || 'null'}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  <Mail className="w-3.5 h-3.5" />
                  {userInfo?.email || 'null'}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  <div className="inline-flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('userprofile-verified')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex flex-col items-end">
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-zinc-100 dark:bg-zinc-800 text-red-500 dark:text-red-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  aria-label={t('userprofile-logout')}
                >
                  <span className="text-xs">{t('userprofile-logout') || 'Logout'}</span>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t('userprofile-connections')}
            </h3>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('userprofile-connected-count', {
                count: connectedCount,
                total: socialNetworks.length,
              })}
            </div>
          </div>

          <div className="space-y-2">
            {socialNetworks.map(platform => (
              <div
                key={platform.id}
                className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getPlatformIcon(platform.id)}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-0.5">
                      {platform.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          platform.connected ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {platform.connected ? t('userprofile-connected') : t('userprofile-not-connected')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onTogglePlatformConnection(platform.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      platform.connected
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {platform.connected ? t('userprofile-disconnect') : t('userprofile-connect')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

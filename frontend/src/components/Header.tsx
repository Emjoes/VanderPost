import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, CheckSquare, Globe, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SidebarView } from '../types.tsx';
import { CoinBadge } from './CoinBadge.tsx';
import useIsMounted from '../hooks/useIsMounted';
import type { UserInfo } from '../App.tsx';

interface Notification {
  id: string;
  title: string;
  text: string;
}

interface WorkspaceHeaderProps {
  view: SidebarView;
  onProfileClick: () => void;
  coinBalance: number;
  userInfo: UserInfo | null;
}

const FlagEN = (props: { className?: string }) => (
  <svg className={props.className} width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect width="20" height="14" rx="1" fill="#012169" />
    <path d="M0 0L20 14M20 0L0 14" stroke="#FFF" strokeWidth="2" />
    <path d="M0 0L20 14M20 0L0 14" stroke="#C8102E" strokeWidth="1" />
    <path d="M8 0H12V14H8V0Z" fill="#FFF" />
    <path d="M0 6H20V8H0V6Z" fill="#FFF" />
    <path d="M9 0H11V14H9V0Z" fill="#C8102E" />
    <path d="M0 6.5H20V7.5H0V6.5Z" fill="#C8102E" />
  </svg>
);

const FlagRU = (props: { className?: string }) => (
  <svg className={props.className} width="20" height="14" viewBox="0 0 20 14" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect width="20" height="14" rx="1" fill="#fff" />
    <rect y="4.666" width="20" height="4.667" fill="#0039A6" />
    <rect y="9.333" width="20" height="4.667" fill="#D52B1E" />
  </svg>
);

export function WorkspaceHeader({ view, onProfileClick, coinBalance, userInfo }: WorkspaceHeaderProps) {
  const { t, i18n } = useTranslation();
  const isMounted = useIsMounted();

  const titles = {
    workspace: t('global-content-workspace'),
    profile: t('global-your-profile'),
    payment: t("global-top-up"),
    help: t('global-help-center'),
  } as const;

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome! #1',
      text: 'Thanks for joining VP. Thanks for joining VP. Thanks for joining VP.',
    },
    {
      id: '2',
      title: 'Welcome! #2',
      text: 'Thanks for joining VP. Thanks for joining VP. Thanks for joining VP.',
    },
    {
      id: '3',
      title: 'Welcome! #3',
      text: 'Thanks for joining VP. Thanks for joining VP. Thanks for joining VP.',
    },
  ]);

  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.length;

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  const languages = [
    { code: 'en', label: 'English', icon: <FlagEN className="block" /> },
    { code: 'ru', label: 'Русский', icon: <FlagRU className="block" /> },
  ];

  const [lang, setLang] = useState<string>(() => {
    try {
      return localStorage.getItem('lang') || i18n.language || 'en';
    } catch {
      return i18n.language || 'en';
    }
  });

  useEffect(() => {
    if (i18n && i18n.language && i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [i18n, lang]);

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch {
      void 0;
    }
  }, [lang]);

  const [langOpen, setLangOpen] = useState(false);
  const langPopoverRef = useRef<HTMLDivElement | null>(null);
  const langButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!langOpen) return;
      const target = e.target as Node | null;
      if (langPopoverRef.current && !langPopoverRef.current.contains(target) && langButtonRef.current && !langButtonRef.current.contains(target)) {
        setLangOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLangOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [langOpen]);

  const changeLanguage = async (code: string) => {
    try {
      await i18n.changeLanguage(code);
      setLang(code);
    } catch {
      setLang(code);
    } finally {
      setLangOpen(false);
      try {
        localStorage.setItem('lang', code);
      } catch {
        void 0;
      }
    }
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = (typeof window !== 'undefined') ? localStorage.getItem('theme') : null;
      if (stored === 'dark' || stored === 'light') return stored as 'dark' | 'light';
    } catch {
      return 'light';
    }
    try {
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      return 'light';
    }
    return 'light';
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      void 0;
    }

    try {
      localStorage.setItem('theme', theme);
    } catch {
      void 0;
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <header className={`h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 relative ${isMounted ? '' : 'not-mounted'}`}>
      <div>
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {titles[view]}
        </h1>
      </div>

      <div className="flex items-center gap-1 relative">
        <CoinBadge coins={coinBalance} className="mr-1" />

        {/* Theme toggle button - placed left of language button */}
        <div className="relative">
          <button
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label="Toggle theme"
            className='w-9 h-9 rounded-lg flex items-center justify-center transition-all relative group text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          >
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="relative">
          <button
            ref={langButtonRef}
            onClick={() => setLangOpen(v => !v)}
            aria-haspopup="menu"
            aria-expanded={langOpen}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all relative group
              ${langOpen
                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            aria-label="Change language"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>

          {langOpen && (
            <div
              ref={langPopoverRef}
              role="menu"
              className="absolute right-0 mt-3 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg z-50 overflow-hidden"
            >
              <div className="py-1">
                {languages.map(l => (
                  <button
                    key={l.code}
                    role="menuitem"
                    onClick={() => changeLanguage(l.code)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                      l.code === lang ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    <span className="flex-shrink-0">
                      <div className="w-[20px] h-[14px]">{l.icon}</div>
                    </span>

                    <span className={`flex-1 text-xs ${
                      l.code === lang ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                      {l.label}
                    </span>

                    {l.code === lang && <span className="text-xs text-blue-600 dark:text-blue-400">
                      <Check className="w-3.5 h-3.5" />
                    </span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationsOpen(prev => !prev)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all relative group
              ${isNotificationsOpen
                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            aria-label="Toggle notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-[3px] text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                {unreadCount < 10 ? unreadCount : '9+'}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50">
              <div className="relative flex items-center justify-between px-2 py-2">
                <button
                  onClick={markAllAsRead}
                  aria-label="Mark all as read"
                  className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <CheckSquare className="w-4 h-4" />
                </button>

                <div className="absolute left-1/2 transform -translate-x-1/2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {t('header-notifications-title')}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                    className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800" />

              <div className="p-2 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-4">
                    {t('header-no-updates')}
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className="group relative p-3 last:mb-0 mb-2 rounded-lg flex flex-col items-start justify-between bg-zinc-50 dark:bg-zinc-950 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition"
                    >
                      <button
                        onClick={() => removeNotification(n.id)}
                        aria-label="Dismiss notification"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                        {n.title}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        {n.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onProfileClick}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-purple-700 flex items-center justify-center text-white text-xs font-bold overflow-hidden ms-2 ring-2 ring-gray-300 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-500 transition"
        >
          {userInfo?.avatar ? (
            <img
              src={userInfo.avatar}
              alt='Avatar'
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            userInfo?.name?.[0]?.toUpperCase() || ''
          )}
        </button>
      </div>
    </header>
  );
}

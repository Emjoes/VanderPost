import { LayoutGrid, HelpCircle, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SidebarView } from '../types.tsx';
import useIsMounted from '../hooks/useIsMounted';

interface SidebarProps {
  currentView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { t } = useTranslation();
  const isMounted = useIsMounted();

  const menuItems = [
    { id: 'workspace' as const, icon: LayoutGrid, label: t('global-content-workspace'), disabled: false },
    { id: 'payment' as const, icon: Wallet, label: t("global-top-up"), disabled: false },
    { id: 'help' as const, icon: HelpCircle, label: t("global-help-center"), disabled: false },
  ];

  return (
    <div className={`w-14 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-3 ${isMounted ? '' : 'not-mounted'}`}>
      <div className="mb-6">
          <img
            src="/assets/imgs/logo.svg"
            alt="VanderPost"
            className="w-8 h-8 brightness-[0.85] dark:brightness-100"
          />
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isDisabled = item.disabled ?? false;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onViewChange(item.id)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all relative group
                ${isActive && !isDisabled
                  ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                  : isDisabled
                  ? 'text-zinc-300 dark:text-zinc-700 cursor-default'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
            >
              <Icon className="w-4.5 h-4.5" />

              {/* Tooltip */}
              <span className={`absolute left-full ml-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50
                ${isDisabled 
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                }`}
              >
                {isDisabled ? `${item.label} (${t('sidebar-coming-soon')})` : item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

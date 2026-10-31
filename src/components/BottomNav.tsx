import React from 'react';
import { ShoppingCart, Store, Package, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const { totalCartItemsCount } = useApp();

  const tabs = [
    {
      route: '/',
      label: 'Caisse',
      icon: ShoppingCart,
      badge: totalCartItemsCount > 0 ? totalCartItemsCount : null,
    },
    {
      route: '/epicerie',
      label: 'Épicerie',
      icon: Store,
    },
    {
      route: '/products',
      label: 'Articles',
      icon: Package,
    },
    {
      route: '/settings',
      label: 'Paramètres',
      icon: Settings,
    },
  ];

  // Hide on checkout or full scanner
  if (currentRoute === '/checkout' || currentRoute === '/scanner') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive =
            tab.route === '/'
              ? currentRoute === '/'
              : currentRoute.startsWith(tab.route);
          const Icon = tab.icon;

          return (
            <button
              key={tab.route}
              onClick={() => onNavigate(tab.route)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'text-[#176B55]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && tab.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-[#176B55]' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

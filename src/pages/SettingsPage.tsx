import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Store,
  QrCode,
  Printer,
  RefreshCw,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Bluetooth,
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { shop, printer, togglePrinterConnection, showToast } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive initials
  const initials = shop.name
    ? shop.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('') || 'EP'
    : 'EP';

  const handleRefreshPrinter = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Recherche de périphériques Bluetooth effectuée', 'info');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] pb-24">
      {/* App Bar */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <button
          onClick={() => onNavigate('/')}
          className="p-1 -ml-1 text-[#176B55] hover:bg-slate-200/60 rounded-lg transition-colors"
          title="Retour"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="font-bold text-slate-900 text-base">Paramètres</h1>
        <div className="w-7" />
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Profile Card Header matching Flutter */}
        <div className="bg-white py-8 px-6 text-center border-b border-slate-200 shadow-xs">
          <div className="w-24 h-24 rounded-full bg-[#176B55] text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-lg shadow-[#176B55]/25 border-4 border-white">
            {initials}
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900 uppercase tracking-tight">
            {shop.name || 'MON COMMERCE'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {shop.phoneNumber || 'Commerce en Tunisie'}
          </p>
        </div>

        {/* Management Section */}
        <div className="px-4 space-y-2">
          <span className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase px-2">
            Gestion
          </span>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {/* Caisse épicerie */}
            <button
              onClick={() => onNavigate('/epicerie')}
              className="w-full p-4 flex items-center gap-3.5 hover:bg-slate-50 text-left transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#176B55]/10 text-[#176B55] flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-slate-900">Caisse épicerie</h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  Ventes, recettes, stock et crédit client (el kridi)
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
            </button>

            {/* Articles */}
            <button
              onClick={() => onNavigate('/products')}
              className="w-full p-4 flex items-center gap-3.5 hover:bg-slate-50 text-left transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#176B55]/10 text-[#176B55] flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-slate-900">Articles</h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  Gérer les stocks et les codes-barres
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
            </button>

            {/* Informations du commerce */}
            <button
              onClick={() => onNavigate('/shop')}
              className="w-full p-4 flex items-center gap-3.5 hover:bg-slate-50 text-left transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#176B55]/10 text-[#176B55] flex items-center justify-center shrink-0">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-slate-900">Informations du commerce</h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  Modifier les coordonnées et l’adresse
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
            </button>
          </div>
        </div>

        {/* Hardware Section */}
        <div className="px-4 space-y-2">
          <span className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase px-2">
            Matériel
          </span>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#176B55]/10 text-[#176B55] flex items-center justify-center shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900">Imprimante</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 truncate">
                      {printer.connected ? printer.name : 'Aucune imprimante connectée'}
                    </span>
                    {printer.connected && (
                      <span className="text-[9px] font-black tracking-wide px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        CONNECTÉE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleRefreshPrinter}
                  disabled={isRefreshing}
                  className="p-2 text-[#176B55] hover:bg-[#176B55]/10 rounded-lg transition-colors"
                  title="Actualiser l'état Bluetooth"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={togglePrinterConnection}
                  className={`p-2 rounded-lg transition-colors ${
                    printer.connected
                      ? 'text-slate-600 hover:bg-slate-100'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                  title={printer.connected ? 'Déconnecter' : 'Connecter'}
                >
                  <Bluetooth className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] italic text-slate-400 px-2 leading-relaxed">
            Pour connecter une imprimante, ouvrez les paramètres Bluetooth du téléphone ou du PC, associez-la, puis revenez et appuyez sur Actualiser.
          </p>
        </div>
      </div>
    </div>
  );
};

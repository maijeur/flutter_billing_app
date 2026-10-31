import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Store, Save } from 'lucide-react';

interface ShopDetailsPageProps {
  onNavigate: (route: string) => void;
}

export const ShopDetailsPage: React.FC<ShopDetailsPageProps> = ({ onNavigate }) => {
  const { shop, updateShop } = useApp();
  const [name, setName] = useState(shop.name);
  const [address1, setAddress1] = useState(shop.addressLine1);
  const [address2, setAddress2] = useState(shop.addressLine2);
  const [phone, setPhone] = useState(shop.phoneNumber);
  const [footer, setFooter] = useState(shop.footerText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShop({
      name: name.trim(),
      addressLine1: address1.trim(),
      addressLine2: address2.trim(),
      phoneNumber: phone.trim(),
      footerText: footer.trim(),
    });
    onNavigate('/settings');
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex flex-col pb-24">
      {/* App Bar */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <button
          onClick={() => onNavigate('/settings')}
          className="p-1 -ml-1 text-[#176B55] hover:bg-slate-200/60 rounded-lg transition-colors"
          title="Retour"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="font-bold text-slate-900 text-base">Informations du commerce</h1>
        <div className="w-7" />
      </div>

      <div className="p-4 max-w-lg mx-auto w-full flex-1">
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="mb-2">
            <span className="block text-[11px] font-bold tracking-wider text-[#176B55] uppercase">
              Informations générales
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Configurez les coordonnées de votre commerce en Tunisie. Ces informations apparaîtront sur vos tickets de caisse (montants en DT / TND).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nom du commerce *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. : Épicerie du Centre"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Adresse (ligne 1) *
            </label>
            <input
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="Rue et numéro"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Adresse complémentaire (facultatif)
            </label>
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Code postal, ville"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Téléphone *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+216 20 000 000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-medium"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Message en bas du ticket
              </label>
              <span className="text-[10px] text-slate-400">Max. 60 caractères</span>
            </div>
            <textarea
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              maxLength={60}
              rows={2}
              placeholder="Merci pour votre visite !"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-medium resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#176B55] hover:bg-[#135947] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les informations</span>
          </button>
        </form>
      </div>
    </div>
  );
};

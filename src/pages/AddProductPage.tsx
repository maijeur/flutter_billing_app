import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, QrCode, PlusCircle } from 'lucide-react';

interface AddProductPageProps {
  onNavigate: (route: string) => void;
  scannedBarcode?: string;
}

export const AddProductPage: React.FC<AddProductPageProps> = ({
  onNavigate,
  scannedBarcode = '',
}) => {
  const { addProduct } = useApp();
  const [barcode, setBarcode] = useState(scannedBarcode);
  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [stockStr, setStockStr] = useState('10');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!barcode.trim()) {
      setError('Veuillez saisir un code-barres');
      return;
    }
    if (!name.trim()) {
      setError('Veuillez saisir un nom');
      return;
    }

    const price = parseFloat(priceStr.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      setError('Veuillez saisir un prix valide');
      return;
    }

    const stock = parseInt(stockStr.trim(), 10) || 0;

    const res = addProduct({
      name: name.trim(),
      barcode: barcode.trim(),
      price,
      stock,
    });

    if (res.success) {
      onNavigate('/products');
    } else if (res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <button
          onClick={() => onNavigate('/products')}
          className="p-1 -ml-1 text-[#176B55] hover:bg-slate-200/60 rounded-lg transition-colors"
          title="Retour"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="font-bold text-slate-900 text-base">Ajouter un article</h1>
        <div className="w-7" />
      </div>

      <div className="p-4 max-w-lg mx-auto w-full flex-1">
        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Barcode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Code-barres
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scanner ou saisir le code-barres"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-mono font-medium"
                required
              />
              <button
                type="button"
                onClick={() => onNavigate('/scanner')}
                className="p-2.5 rounded-xl bg-[#176B55]/10 hover:bg-[#176B55]/20 text-[#176B55] transition-colors shrink-0"
                title="Scanner"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-[#4C669A] mt-1 ml-1">
              Appuyez sur l’icône pour scanner avec la caméra
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nom de l’article
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. : Huile d’olive 1L"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-medium"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Prix (TND)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                TND
              </span>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                placeholder="0,000"
                className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-semibold"
                required
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Stock initial
            </label>
            <input
              type="number"
              min="0"
              value={stockStr}
              onChange={(e) => setStockStr(e.target.value)}
              placeholder="10"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-semibold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#176B55] hover:bg-[#135947] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ajouter l'article</span>
          </button>
        </form>
      </div>
    </div>
  );
};

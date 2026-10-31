import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { ChevronLeft, QrCode, Save } from 'lucide-react';

interface EditProductPageProps {
  product: Product;
  onNavigate: (route: string) => void;
}

export const EditProductPage: React.FC<EditProductPageProps> = ({
  product,
  onNavigate,
}) => {
  const { updateProduct } = useApp();
  const [name, setName] = useState(product.name);
  const [priceStr, setPriceStr] = useState(product.price.toFixed(3));
  const [stockStr, setStockStr] = useState(product.stock.toString());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    updateProduct({
      ...product,
      name: name.trim(),
      price,
      stock,
    });

    onNavigate('/products');
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex flex-col pb-24">
      {/* App Bar */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <button
          onClick={() => onNavigate('/products')}
          className="p-1 -ml-1 text-[#176B55] hover:bg-slate-200/60 rounded-lg transition-colors"
          title="Retour"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="font-bold text-slate-900 text-base">Modifier l’article</h1>
        <div className="w-7" />
      </div>

      <div className="p-4 max-w-lg mx-auto w-full flex-1">
        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Immutable Barcode Box matching Flutter UI */}
          <div className="p-4 rounded-xl bg-[#176B55]/5 border border-[#176B55]/15 flex items-center gap-3">
            <QrCode className="w-6 h-6 text-[#176B55] shrink-0" />
            <div>
              <span className="block text-[10px] font-bold tracking-wider text-[#176B55]/70 uppercase">
                CODE-BARRES
              </span>
              <span className="text-xs font-bold text-slate-900 font-mono">
                {product.barcode}
              </span>
            </div>
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
                className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-semibold"
                required
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Stock disponible
            </label>
            <input
              type="number"
              min="0"
              value={stockStr}
              onChange={(e) => setStockStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-semibold"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#176B55] hover:bg-[#135947] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </form>
      </div>
    </div>
  );
};

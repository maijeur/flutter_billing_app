import React, { useState } from 'react';
import { Product } from '../types';
import { PackagePlus, X } from 'lucide-react';

interface RestockModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: string, quantity: number) => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [qty, setQty] = useState('10');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(qty.trim(), 10);
    if (!isNaN(count) && count > 0) {
      onConfirm(product.id, count);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Réapprovisionner le stock</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">{product.name}</h4>
            <p className="text-xs text-slate-500 mt-1 font-mono">Code : {product.barcode}</p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
              Stock actuel : <span className="font-bold text-slate-900">{product.stock} unités</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Quantité reçue
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:border-transparent text-sm font-semibold"
              placeholder="Ex. : 10"
              autoFocus
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#176B55] hover:bg-[#135947] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
            >
              Ajouter au stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

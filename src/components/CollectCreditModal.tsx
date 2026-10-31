import React, { useState } from 'react';
import { CreditRecord } from '../types';
import { Banknote, X } from 'lucide-react';

interface CollectCreditModalProps {
  credit: CreditRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (creditId: string, amount: number) => void;
}

export const CollectCreditModal: React.FC<CollectCreditModalProps> = ({
  credit,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [amountStr, setAmountStr] = useState('');

  if (!isOpen || !credit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountStr.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      onConfirm(credit.id, val);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm">Paiement de crédit</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">{credit.customer}</h4>
            <p className="text-xs text-slate-500 mt-1">{credit.description}</p>
            <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/60 flex justify-between items-center text-xs">
              <span className="text-amber-800 font-semibold">Solde restant :</span>
              <span className="font-black text-amber-900 text-sm">
                {credit.balance.toFixed(3)} TND
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Montant reçu (DT)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.001"
                max={credit.balance}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] focus:border-transparent text-sm font-semibold pl-14"
                placeholder={credit.balance.toFixed(3)}
                autoFocus
                required
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                TND
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAmountStr(credit.balance.toFixed(3))}
              className="mt-1 text-[11px] text-[#176B55] font-semibold hover:underline"
            >
              Payer la totalité ({credit.balance.toFixed(3)} TND)
            </button>
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
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

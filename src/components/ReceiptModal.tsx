import React from 'react';
import { Shop, CartItem } from '../types';
import { Printer, Download, Check, X } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop;
  items: CartItem[];
  total: number;
  dateStr?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  shop,
  items,
  total,
  dateStr = new Date().toLocaleString('fr-TN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-100 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#176B55]" />
            <h3 className="font-bold text-slate-800 text-sm">Ticket de caisse thermique</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content Area (Styled like 58mm/80mm ESC/POS roll) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex justify-center">
          <div
            id="thermal-receipt-print"
            className="w-full max-w-[290px] bg-white p-5 shadow-sm border border-slate-200 text-slate-900 font-mono text-xs rounded-sm"
          >
            {/* Header: Shop info */}
            <div className="text-center pb-2">
              <h2 className="text-base font-black tracking-tight uppercase">{shop.name || 'COMMERCE'}</h2>
              {shop.addressLine1 && <p className="text-[11px] text-slate-700">{shop.addressLine1}</p>}
              {shop.addressLine2 && <p className="text-[11px] text-slate-700">{shop.addressLine2}</p>}
              {shop.phoneNumber && <p className="text-[11px] text-slate-700 font-semibold">{shop.phoneNumber}</p>}
              <p className="text-[10px] text-slate-500 mt-1">{dateStr}</p>
            </div>

            <div className="border-b border-dashed border-slate-400 my-2" />

            {/* Table Header */}
            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-600 pb-1">
              <div className="col-span-6">ARTICLE</div>
              <div className="col-span-3 text-right">P.U.</div>
              <div className="col-span-3 text-right">TOTAL</div>
            </div>

            <div className="border-b border-dashed border-slate-400 mb-2" />

            {/* Items */}
            <div className="space-y-1.5 py-1">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] leading-snug">
                  <div className="col-span-6 font-medium truncate pr-1">
                    {item.quantity}x {item.product.name}
                  </div>
                  <div className="col-span-3 text-right text-slate-600">
                    {item.product.price.toFixed(3)}
                  </div>
                  <div className="col-span-3 text-right font-bold">
                    {(item.product.price * item.quantity).toFixed(3)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-slate-400 my-2" />

            {/* Total */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-xs uppercase tracking-wider">TOTAL À PAYER</span>
              <span className="font-black text-sm text-slate-950">
                {total.toFixed(3)} TND
              </span>
            </div>

            <div className="border-b border-dashed border-slate-400 my-2" />

            {/* Footer */}
            <div className="text-center pt-2 text-[10px] text-slate-600 italic">
              <p>{shop.footerText || 'Merci pour votre visite !'}</p>
              <p className="text-[9px] text-slate-400 mt-2">Facturation Tunisie POS</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#176B55] hover:bg-[#135947] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            Imprimer le ticket
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

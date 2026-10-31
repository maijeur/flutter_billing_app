import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Printer, ShoppingBag, CheckCircle, AlertTriangle } from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal';

interface CheckoutPageProps {
  onNavigate: (route: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cartItems, totalCartAmount, shop, completeCheckout, clearCart } = useApp();
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snapshotItems, setSnapshotItems] = useState(cartItems);
  const [snapshotTotal, setSnapshotTotal] = useState(totalCartAmount);

  const handleBack = () => {
    // Matches Flutter PopScope behavior
    clearCart();
    onNavigate('/');
  };

  const handlePrintReceipt = () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    // Save snapshot for the receipt modal before clearing cart
    setSnapshotItems([...cartItems]);
    setSnapshotTotal(totalCartAmount);

    setTimeout(() => {
      const res = completeCheckout();
      setIsProcessing(false);
      if (res.success) {
        setIsReceiptOpen(true);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex flex-col pb-36">
      {/* Top App Bar matching Flutter */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <button
          onClick={handleBack}
          className="p-1 -ml-1 text-[#176B55] hover:bg-slate-200/60 rounded-lg transition-colors flex items-center"
          title="Retour et vider le panier"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="font-bold text-slate-900 text-base">Validation du panier</h1>
        <div className="w-7" />
      </div>

      <div className="p-4 max-w-lg mx-auto w-full flex-1">
        {cartItems.length === 0 && !isReceiptOpen ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm mt-8">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-800">Aucun article dans le panier</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Veuillez ajouter des articles depuis la caisse avant de procéder à la validation.
            </p>
            <button
              onClick={() => onNavigate('/')}
              className="py-2.5 px-6 rounded-xl bg-[#176B55] text-white text-xs font-bold"
            >
              Retourner à la caisse
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Card matching Flutter layout */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-3 text-right">Prix unitaire</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {cartItems.map((item) => (
                      <tr key={item.product.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900">
                            {item.quantity} x {item.product.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-500">
                          {item.product.price.toFixed(3)} TND
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {(item.product.price * item.quantity).toFixed(3)} TND
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shop summary info box */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">{shop.name}</span>
                <p className="text-[11px] text-slate-500">{shop.phoneNumber || 'Pas de numéro'}</p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                Paiement : Espèces
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Fixed Action Bar matching Flutter CheckoutPage */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl p-4 z-20">
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex items-baseline justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                TOTAL À PAYER
              </span>
              <span className="text-2xl font-black text-slate-900">
                {totalCartAmount.toFixed(3)} TND
              </span>
            </div>

            <button
              onClick={handlePrintReceipt}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-[#176B55] hover:bg-[#135947] text-white font-bold text-sm shadow-lg shadow-[#176B55]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              <Printer className="w-5 h-5" />
              <span>{isProcessing ? 'Impression en cours...' : 'Imprimer le ticket'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Thermal Receipt Preview Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          onNavigate('/');
        }}
        shop={shop}
        items={snapshotItems}
        total={snapshotTotal}
      />
    </div>
  );
};

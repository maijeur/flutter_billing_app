import React from 'react';
import { useApp } from '../context/AppContext';
import { CameraScanner } from '../components/CameraScanner';
import { ShoppingBasket, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const {
    cartItems,
    totalCartAmount,
    totalCartItemsCount,
    updateQuantity,
    removeFromCart,
    scanBarcode,
  } = useApp();

  return (
    <div className="relative flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#F5F7F4]">
      {/* Top Scanner Section (approx 38-40% height) */}
      <div className="relative shrink-0">
        <CameraScanner
          onScan={(code) => scanBarcode(code)}
          onOpenSettings={() => onNavigate('/settings')}
          heightClass="h-[36vh] sm:h-[40vh] min-h-[250px]"
        />
      </div>

      {/* Bottom Panel (Overlapping top scanner slightly with rounded corners) */}
      <div className="flex-1 -mt-4 bg-[#F5F7F4] rounded-t-3xl shadow-[0_-8px_20px_rgba(0,0,0,0.12)] flex flex-col z-10 overflow-hidden border-t border-slate-200/50">
        {/* Drag handle */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Header Summary */}
        <div className="px-5 py-2 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Articles scannés
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {totalCartItemsCount} article{totalCartItemsCount > 1 ? 's' : ''} au total
            </p>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              TOTAL
            </span>
            <span className="text-lg sm:text-xl font-black text-[#176B55]">
              {totalCartAmount.toFixed(3)} TND
            </span>
          </div>
        </div>

        <div className="h-px bg-slate-200 shrink-0 mx-4 my-1" />

        {/* Cart items list or empty state */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 pb-24">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-200/70 flex items-center justify-center mb-3">
                <ShoppingBasket className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-700">Le panier est vide</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Les articles scannés ou ajoutés apparaîtront ici. Utilisez la caméra ci-dessus ou les boutons de test direct.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-900 text-sm truncate">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-600">
                      {item.product.price.toFixed(3)} TND
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      • {item.product.barcode}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200/60 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 active:scale-95 transition-all"
                    title={item.quantity === 1 ? 'Supprimer' : 'Diminuer'}
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 active:scale-95 transition-all"
                    title="Augmenter"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Checkout Button at bottom */}
      <div className="fixed bottom-16 left-0 right-0 p-4 max-w-lg mx-auto pointer-events-none z-20">
        <button
          onClick={() => onNavigate('/checkout')}
          disabled={cartItems.length === 0}
          className={`pointer-events-auto w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] ${
            cartItems.length > 0
              ? 'bg-[#176B55] hover:bg-[#135947] text-white shadow-[#176B55]/30'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Voir le panier ({cartItems.length})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  Banknote,
  CheckCircle,
  PlusCircle,
  History,
  Users,
} from 'lucide-react';
import { CollectCreditModal } from '../components/CollectCreditModal';
import { CreditRecord } from '../types';

interface EpiceriePageProps {
  onNavigate: (route: string) => void;
}

export const EpiceriePage: React.FC<EpiceriePageProps> = ({ onNavigate }) => {
  const {
    products,
    sales,
    credits,
    registerDirectSale,
    collectCreditPayment,
  } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [quantityStr, setQuantityStr] = useState('1');
  const [paymentType, setPaymentType] = useState<'Espèces' | 'À crédit'>('Espèces');
  const [customerName, setCustomerName] = useState('');
  const [paidNowStr, setPaidNowStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal for credit collection
  const [selectedCredit, setSelectedCredit] = useState<CreditRecord | null>(null);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

  // Calculations for Today's metrics (matching Flutter EpiceriePage)
  const now = new Date();
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const todaySales = sales.filter((s) => isToday(s.date));
  const totalToday = todaySales.reduce((sum, s) => sum + s.total, 0);
  const receivedToday = todaySales.reduce((sum, s) => sum + s.paid, 0);
  const totalBalance = credits.reduce((sum, c) => sum + c.balance, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const openCredits = credits.filter((c) => c.balance > 0);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const qty = parseInt(quantityStr.trim(), 10);
    if (isNaN(qty) || qty <= 0) return;

    setIsSubmitting(true);
    const paidVal =
      paymentType === 'Espèces'
        ? undefined
        : paidNowStr.trim()
        ? parseFloat(paidNowStr.replace(',', '.'))
        : 0;

    const res = registerDirectSale({
      productId: selectedProductId,
      quantity: qty,
      paymentType,
      customerName,
      paidNow: paidVal,
    });

    setIsSubmitting(false);
    if (res.success) {
      setQuantityStr('1');
      setCustomerName('');
      setPaidNowStr('');
      setPaymentType('Espèces');
    }
  };

  const openCollection = (credit: CreditRecord) => {
    setSelectedCredit(credit);
    setIsCollectModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/')}
            className="p-1 -ml-1 text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Retour"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-slate-900 text-base">Gestion épicerie</h1>
        </div>
        <button
          onClick={() => onNavigate('/products')}
          className="p-2 text-[#176B55] hover:bg-[#176B55]/10 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
          title="Articles et stock"
        >
          <Package className="w-5 h-5" />
          <span className="hidden sm:inline">Articles & Stock</span>
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Today's Metrics Grid */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider">
            Aujourd’hui
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Ventes */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#176B55]/10 text-[#176B55] flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Ventes</span>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {totalToday.toFixed(3)} TND
              </p>
            </div>

            {/* Encaissé */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#176B55]/10 text-[#176B55] flex items-center justify-center mb-3">
                <Banknote className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Encaissé</span>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {receivedToday.toFixed(3)} TND
              </p>
            </div>

            {/* Crédit Restant */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Crédit restant</span>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {totalBalance.toFixed(3)} TND
              </p>
            </div>

            {/* Stock Bas */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Stock bas</span>
              <p className="text-base font-black text-slate-900 mt-0.5">
                {lowStockCount} article{lowStockCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Enregistrer une vente Form */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#176B55]" />
            Enregistrer une vente
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500 space-y-3">
              <p>Ajoutez d’abord vos articles et leurs quantités en stock.</p>
              <button
                onClick={() => onNavigate('/products/add')}
                className="px-4 py-2 bg-[#176B55] text-white font-bold rounded-xl text-xs"
              >
                Ajouter un article
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Produit
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-semibold bg-white"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — stock {p.stock} ({p.price.toFixed(3)} DT)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quantité vendue
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.stock || 999}
                    value={quantityStr}
                    onChange={(e) => setQuantityStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mode de paiement
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-semibold bg-white"
                  >
                    <option value="Espèces">Espèces / payé</option>
                    <option value="À crédit">À crédit — el kridi</option>
                  </select>
                </div>
              </div>

              {/* Conditional fields for Credit */}
              {paymentType === 'À crédit' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                      Nom du client *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex. : Si Ali, Mohamed..."
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                      Montant payé maintenant (TND)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={paidNowStr}
                      onChange={(e) => setPaidNowStr(e.target.value)}
                      placeholder="0 si rien"
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {selectedProduct && (
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span>Prix unitaire : {selectedProduct.price.toFixed(3)} TND</span>
                  <span className="font-bold text-[#176B55]">
                    Total :{' '}
                    {(
                      selectedProduct.price *
                      (parseInt(quantityStr, 10) || 1)
                    ).toFixed(3)}{' '}
                    TND
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#176B55] hover:bg-[#135947] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Enregistrement…' : 'Enregistrer la vente'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Crédit Client — El Kridi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              Crédit client — el kridi ({openCredits.length})
            </h2>
          </div>

          {openCredits.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-xl">
              Aucun crédit en cours.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {openCredits.map((credit) => (
                <div
                  key={credit.id}
                  className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {credit.customer}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {credit.description}
                    </p>
                    <p className="text-xs font-bold text-amber-800 mt-1">
                      Reste : {credit.balance.toFixed(3)} TND
                    </p>
                  </div>

                  <button
                    onClick={() => openCollection(credit)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-colors shrink-0"
                    title="Encaisser un paiement"
                  >
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <span>Payer</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dernières Ventes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            Dernières ventes
          </h2>

          {sales.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-xl">
              Les ventes enregistrées apparaîtront ici.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {sales.slice(0, 10).map((s) => (
                <div
                  key={s.id}
                  className="py-3 flex items-center justify-between text-xs first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {s.productName} × {s.quantity}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {s.paymentType} {s.customer ? `· ${s.customer}` : ''}
                    </p>
                  </div>
                  <span className="font-black text-slate-900 shrink-0">
                    {s.total.toFixed(3)} TND
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <CollectCreditModal
        credit={selectedCredit}
        isOpen={isCollectModalOpen}
        onClose={() => {
          setIsCollectModalOpen(false);
          setSelectedCredit(null);
        }}
        onConfirm={(creditId, amount) => {
          collectCreditPayment(creditId, amount);
        }}
      />
    </div>
  );
};

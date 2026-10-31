import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  ChevronLeft,
  Search,
  QrCode,
  Plus,
  Edit2,
  Trash2,
  PackagePlus,
  AlertCircle,
} from 'lucide-react';
import { RestockModal } from '../components/RestockModal';

interface ProductListPageProps {
  onNavigate: (route: string, extra?: any) => void;
}

export const ProductListPage: React.FC<ProductListPageProps> = ({ onNavigate }) => {
  const { products, deleteProduct, restockProduct } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScanInSearch = () => {
    // Navigate to standalone scanner
    onNavigate('/scanner');
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] pb-28">
      {/* App Bar */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200">
        <button
          onClick={() => onNavigate('/')}
          className="p-1 -ml-1 text-[#176B55] hover:bg-slate-200/60 rounded-lg transition-colors"
          title="Retour"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="font-bold text-slate-900 text-base">Gestion des articles</h1>
        <div className="w-7" />
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Search Bar + QR scan trigger */}
        <div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scanner ou saisir le code-barres"
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176B55] text-xs font-medium shadow-xs"
              />
            </div>
            <button
              onClick={handleScanInSearch}
              className="p-2.5 rounded-xl bg-[#176B55]/10 hover:bg-[#176B55]/20 text-[#176B55] transition-colors shrink-0"
              title="Scanner avec la caméra"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[11px] text-[#4C669A] mt-1.5 ml-1">
            Appuyez sur l’icône pour scanner avec la caméra
          </p>
        </div>

        {/* Product List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">
              {products.length === 0
                ? 'Aucun article. Ajoutez-en un !'
                : 'Aucun article ne correspond à la recherche.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= 5;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {product.price.toFixed(3)} TND
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[11px] font-bold ${
                          isLowStock ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        Stock disponible : {product.stock}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({product.barcode})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedProductForRestock(product)}
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                      title="Réapprovisionner le stock"
                    >
                      <PackagePlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onNavigate(`/products/edit/${product.id}`, product)}
                      className="p-2 rounded-lg bg-[#176B55]/10 hover:bg-[#176B55]/20 text-[#176B55] transition-colors"
                      title="Modifier l'article"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Supprimer l'article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button (+) */}
      <button
        onClick={() => onNavigate('/products/add')}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-[#176B55] hover:bg-[#135947] text-white shadow-xl shadow-[#176B55]/40 flex items-center justify-center transition-all active:scale-95 z-20"
        title="Ajouter un article"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Restock Dialog */}
      <RestockModal
        product={selectedProductForRestock}
        isOpen={Boolean(selectedProductForRestock)}
        onClose={() => setSelectedProductForRestock(null)}
        onConfirm={(id, qty) => restockProduct(id, qty)}
      />

      {/* Delete Confirmation Dialog */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-xs w-full p-6 text-center border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-2">Supprimer l’article</h3>
            <p className="text-xs text-slate-500 mb-6">
              Voulez-vous vraiment supprimer <span className="font-bold text-slate-800">{productToDelete.name}</span> ?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

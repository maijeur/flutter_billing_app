import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, CartItem, Shop, SaleRecord, CreditRecord, ToastMessage } from '../types';
import { storageService } from '../services/storage';

interface AppContextType {
  products: Product[];
  cartItems: CartItem[];
  shop: Shop;
  sales: SaleRecord[];
  credits: CreditRecord[];
  toasts: ToastMessage[];
  totalCartAmount: number;
  totalCartItemsCount: number;
  printer: { connected: boolean; mac: string; name: string };
  // Cart Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  scanBarcode: (barcode: string) => { success: boolean; message?: string };
  // Product Actions
  addProduct: (product: Omit<Product, 'id'>) => { success: boolean; error?: string };
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  restockProduct: (productId: string, quantity: number) => void;
  // Shop Actions
  updateShop: (shop: Shop) => void;
  // Sales & Credit Actions
  registerDirectSale: (sale: {
    productId: string;
    quantity: number;
    paymentType: 'Espèces' | 'À crédit';
    customerName?: string;
    paidNow?: number;
  }) => { success: boolean; error?: string };
  collectCreditPayment: (creditId: string, amount: number) => { success: boolean; error?: string };
  completeCheckout: () => { success: boolean; error?: string };
  // Printer Actions
  togglePrinterConnection: () => void;
  // Toast Actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shop, setShop] = useState<Shop>(storageService.getShop());
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [credits, setCredits] = useState<CreditRecord[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [printer, setPrinter] = useState(storageService.getPrinterSettings());

  // Load initial data
  useEffect(() => {
    setProducts(storageService.getProducts());
    setShop(storageService.getShop());
    setSales(storageService.getSales());
    setCredits(storageService.getCredits());
    setPrinter(storageService.getPrinterSettings());
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cart calculations
  const totalCartAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalCartItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Cart handlers
  const addToCart = useCallback((product: Product) => {
    // Check available stock
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id);
      if (existingIndex >= 0) {
        const item = prev[existingIndex];
        if (item.quantity + 1 > product.stock) {
          showToast(`Stock insuffisant pour ${product.name} (${product.stock} dispo)`, 'error');
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...item, quantity: item.quantity + 1 };
        return updated;
      } else {
        if (product.stock < 1) {
          showToast(`Article en rupture de stock : ${product.name}`, 'error');
          return prev;
        }
        return [...prev, { product, quantity: 1 }];
      }
    });
  }, [showToast]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) => {
      const index = prev.findIndex((i) => i.product.id === productId);
      if (index >= 0) {
        const item = prev[index];
        if (quantity > item.product.stock) {
          showToast(`Stock insuffisant : seulement ${item.product.stock} disponible(s)`, 'error');
          return prev;
        }
        const updated = [...prev];
        updated[index] = { ...item, quantity };
        return updated;
      }
      return prev;
    });
  }, [removeFromCart, showToast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const scanBarcode = useCallback((barcode: string) => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return { success: false, message: 'Code-barres vide' };

    const product = storageService.getProducts().find((p) => p.barcode === cleanBarcode);
    if (!product) {
      const message = `Article introuvable : ${cleanBarcode}`;
      showToast(message, 'error');
      return { success: false, message };
    }

    // Calculate from the current cart before scheduling React state updates.
    const existing = cartItems.find((item) => item.product.id === product.id);
    const nextQuantity = (existing?.quantity || 0) + 1;
    if (product.stock < nextQuantity) {
      const message = `Stock insuffisant pour ${product.name} (${product.stock} disponible(s))`;
      showToast(message, 'error');
      return { success: false, message };
    }

    setCartItems((previous) => {
      const index = previous.findIndex((item) => item.product.id === product.id);
      if (index < 0) return [...previous, { product, quantity: 1 }];
      return previous.map((item, itemIndex) => itemIndex === index
        ? { ...item, quantity: item.quantity + 1 }
        : item);
    });
    showToast(`+1 ${product.name}`, 'success');
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(60); } catch {}
    }
    return { success: true };
  }, [cartItems, showToast]);

  // Products
  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    const cleanBarcode = productData.barcode.trim();
    const cleanName = productData.name.trim();

    const currentProducts = storageService.getProducts();
    const existing = currentProducts.find((p) => p.barcode === cleanBarcode);
    if (existing) {
      const err = `Un article avec le code-barres "${cleanBarcode}" existe déjà (${existing.name}) !`;
      showToast(err, 'error');
      return { success: false, error: err };
    }

    const newProd: Product = {
      id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      name: cleanName,
      barcode: cleanBarcode,
      price: productData.price,
      stock: productData.stock || 0,
    };

    const updated = storageService.addProduct(newProd);
    setProducts(updated);
    showToast(`Article "${newProd.name}" ajouté avec succès`, 'success');
    return { success: true };
  }, [showToast]);

  const updateProduct = useCallback((prod: Product) => {
    const updated = storageService.updateProduct(prod);
    setProducts(updated);
    showToast(`Article "${prod.name}" modifié avec succès`, 'success');
  }, [showToast]);

  const deleteProduct = useCallback((productId: string) => {
    const updated = storageService.deleteProduct(productId);
    setProducts(updated);
    removeFromCart(productId);
    showToast('Article supprimé', 'info');
  }, [removeFromCart, showToast]);

  const restockProduct = useCallback((productId: string, quantityToAdd: number) => {
    const updated = storageService.restockProduct(productId, quantityToAdd);
    setProducts(updated);
    const item = updated.find((p) => p.id === productId);
    showToast(`Stock mis à jour pour ${item?.name || 'l\'article'} (+${quantityToAdd})`, 'success');
  }, [showToast]);

  // Shop
  const updateShop = useCallback((newShop: Shop) => {
    const saved = storageService.saveShop(newShop);
    setShop(saved);
    showToast('Informations du commerce enregistrées !', 'success');
  }, [showToast]);

  // Checkout process matching Flutter BillingBloc & CheckoutPage
  const completeCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      showToast('Le panier est vide.', 'error');
      return { success: false, error: 'Panier vide' };
    }

    const currentProds = storageService.getProducts();
    // Validate stock for all items
    for (const item of cartItems) {
      const stored = currentProds.find((p) => p.id === item.product.id);
      if (!stored || stored.stock < item.quantity) {
        const avail = stored ? stored.stock : 0;
        const msg = `Stock insuffisant pour ${item.product.name} : ${avail} disponible(s).`;
        showToast(msg, 'error');
        return { success: false, error: msg };
      }
    }

    // Decrement stock & record sales
    const date = new Date().toISOString();
    const transactionId = Date.now().toString();
    const salesList = storageService.getSales();

    let updatedProducts = [...currentProds];
    for (const item of cartItems) {
      updatedProducts = updatedProducts.map((p) =>
        p.id === item.product.id ? { ...p, stock: p.stock - item.quantity } : p
      );

      salesList.unshift({
        id: `${transactionId}-${item.product.id}`,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
        paid: item.product.price * item.quantity,
        paymentType: 'Espèces',
        customer: '',
        date,
      });
    }

    storageService.saveProducts(updatedProducts);
    storageService.saveSales(salesList);
    setProducts(updatedProducts);
    setSales(salesList);
    clearCart();

    showToast('Vente enregistrée et stock mis à jour. Le ticket est disponible en aperçu.', 'success');
    return { success: true };
  }, [cartItems, clearCart, showToast]);

  // Direct sale from Epicerie page
  const registerDirectSale = useCallback((saleData: {
    productId: string;
    quantity: number;
    paymentType: 'Espèces' | 'À crédit';
    customerName?: string;
    paidNow?: number;
  }) => {
    const currentProds = storageService.getProducts();
    const prod = currentProds.find((p) => p.id === saleData.productId);
    if (!prod) {
      showToast('Article introuvable.', 'error');
      return { success: false, error: 'Article introuvable' };
    }

    if (saleData.quantity > prod.stock) {
      const msg = `Stock insuffisant : ${prod.stock} disponible(s).`;
      showToast(msg, 'error');
      return { success: false, error: msg };
    }

    const total = prod.price * saleData.quantity;
    const received = saleData.paymentType === 'Espèces' ? total : (saleData.paidNow ?? 0);

    if (received < 0 || received > total) {
      showToast('Montant payé invalide.', 'error');
      return { success: false, error: 'Montant invalide' };
    }

    if (saleData.paymentType === 'À crédit' && !saleData.customerName?.trim()) {
      showToast('Le nom du client est obligatoire pour le crédit.', 'error');
      return { success: false, error: 'Nom client obligatoire' };
    }

    const id = Date.now().toString();
    const date = new Date().toISOString();

    // 1. Record Sale
    const currentSales = storageService.getSales();
    const newSale: SaleRecord = {
      id,
      productId: prod.id,
      productName: prod.name,
      quantity: saleData.quantity,
      total,
      paid: received,
      paymentType: saleData.paymentType,
      customer: saleData.customerName?.trim() || '',
      date,
    };
    const updatedSales = [newSale, ...currentSales];
    storageService.saveSales(updatedSales);
    setSales(updatedSales);

    // 2. Record Credit if balance remains
    if (saleData.paymentType === 'À crédit' && received < total) {
      const currentCredits = storageService.getCredits();
      const newCredit: CreditRecord = {
        id,
        customer: saleData.customerName!.trim(),
        description: `${saleData.quantity} x ${prod.name}`,
        total,
        paid: received,
        balance: total - received,
        date,
      };
      const updatedCredits = [newCredit, ...currentCredits];
      storageService.saveCredits(updatedCredits);
      setCredits(updatedCredits);
    }

    // 3. Decrement Stock
    const updatedProds = currentProds.map((p) =>
      p.id === prod.id ? { ...p, stock: p.stock - saleData.quantity } : p
    );
    storageService.saveProducts(updatedProds);
    setProducts(updatedProds);

    showToast('Vente enregistrée, stock mis à jour.', 'success');
    return { success: true };
  }, [showToast]);

  // Credit debt collection
  const collectCreditPayment = useCallback((creditId: string, amount: number) => {
    if (amount <= 0) {
      showToast('Montant invalide', 'error');
      return { success: false, error: 'Montant invalide' };
    }

    const currentCredits = storageService.getCredits();
    const credit = currentCredits.find((c) => c.id === creditId);
    if (!credit) {
      showToast('Dette introuvable', 'error');
      return { success: false, error: 'Dette introuvable' };
    }

    if (amount > credit.balance) {
      showToast('Le paiement dépasse le solde restant.', 'error');
      return { success: false, error: 'Le paiement dépasse le solde restant' };
    }

    const updatedCredits = currentCredits.map((c) => {
      if (c.id === creditId) {
        return {
          ...c,
          paid: c.paid + amount,
          balance: c.balance - amount,
        };
      }
      return c;
    });

    storageService.saveCredits(updatedCredits);
    setCredits(updatedCredits);

    // Update sales record if exists to reflect collection
    const currentSales = storageService.getSales();
    const updatedSales = currentSales.map((s) => {
      if (s.id === creditId) {
        return { ...s, paid: s.paid + amount };
      }
      return s;
    });
    storageService.saveSales(updatedSales);
    setSales(updatedSales);

    showToast('Paiement du crédit enregistré avec succès.', 'success');
    return { success: true };
  }, [showToast]);

  // Printer toggle
  const togglePrinterConnection = useCallback(() => {
    showToast('La connexion Bluetooth et l’impression thermique ne sont pas encore intégrées.', 'info');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        products,
        cartItems,
        shop,
        sales,
        credits,
        toasts,
        totalCartAmount,
        totalCartItemsCount,
        printer,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        scanBarcode,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        updateShop,
        registerDirectSale,
        collectCreditPayment,
        completeCheckout,
        togglePrinterConnection,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

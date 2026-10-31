import { Product, Shop, SaleRecord, CreditRecord } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'products',
  SHOP: 'shop',
  SALES: 'epicerie_sales_v1',
  CREDITS: 'epicerie_credits_v1',
  SETTINGS: 'settings',
  PRINTER_MAC: 'printer_mac',
  PRINTER_NAME: 'printer_name',
};

const DEFAULT_SHOP: Shop = {
  name: 'Épicerie El Hana',
  addressLine1: '14 Rue Habib Bourguiba',
  addressLine2: '1001 Tunis, Tunisie',
  phoneNumber: '+216 71 234 567',
  upiId: '',
  footerText: 'Merci pour votre visite ! Au revoir.',
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Lait Demi-Écrémé Délice 1L',
    barcode: '6194000100012',
    price: 1.350,
    stock: 35,
  },
  {
    id: 'prod-2',
    name: 'Huile Végétale Substantielle 1L',
    barcode: '6194000200029',
    price: 4.800,
    stock: 18,
  },
  {
    id: 'prod-3',
    name: 'Pâtes Spaghettis Randa n°2 500g',
    barcode: '6194000300036',
    price: 0.980,
    stock: 45,
  },
  {
    id: 'prod-4',
    name: 'Tomate Double Concentrée Sicam 800g',
    barcode: '6194000400043',
    price: 4.250,
    stock: 22,
  },
  {
    id: 'prod-5',
    name: 'Eau Minérale Safia 1.5L',
    barcode: '6194000500050',
    price: 0.850,
    stock: 50,
  },
  {
    id: 'prod-6',
    name: 'Harissa Berbère Du Cap Bon 135g',
    barcode: '6194000600067',
    price: 1.100,
    stock: 4, // low stock indicator demo
  },
  {
    id: 'prod-7',
    name: 'Thon Entier à l’Huile Sidi Daoud 160g',
    barcode: '6194000700074',
    price: 3.900,
    stock: 14,
  },
  {
    id: 'prod-8',
    name: 'Fromage Fondu Président 8 portions',
    barcode: '6194000800081',
    price: 2.750,
    stock: 9,
  },
  {
    id: 'prod-9',
    name: 'Café Moulu Bondin Filtre 250g',
    barcode: '6194000900098',
    price: 3.650,
    stock: 3, // low stock demo
  },
  {
    id: 'prod-10',
    name: 'Yaourt Brassé Délice Fraise',
    barcode: '6194001000105',
    price: 0.650,
    stock: 28,
  },
  {
    id: 'prod-11',
    name: 'Baguette de Pain Tunisien',
    barcode: '6194001100112',
    price: 0.200,
    stock: 60,
  },
  {
    id: 'prod-12',
    name: 'Biscuits Major Choc 150g',
    barcode: '6194001200129',
    price: 1.200,
    stock: 16,
  },
];

const DEFAULT_SALES: SaleRecord[] = [
  {
    id: 'sale-101',
    productId: 'prod-1',
    productName: 'Lait Demi-Écrémé Délice 1L',
    quantity: 2,
    total: 2.700,
    paid: 2.700,
    paymentType: 'Espèces',
    customer: '',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'sale-102',
    productId: 'prod-3',
    productName: 'Pâtes Spaghettis Randa n°2 500g',
    quantity: 3,
    total: 2.940,
    paid: 2.940,
    paymentType: 'Espèces',
    customer: '',
    date: new Date(Date.now() - 3600000).toISOString(),
  },
];

const DEFAULT_CREDITS: CreditRecord[] = [
  {
    id: 'credit-201',
    customer: 'Mohamed Trabelsi',
    description: '2 x Lait Délice + 1 x Huile 1L',
    total: 7.500,
    paid: 3.000,
    balance: 4.500,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'credit-202',
    customer: 'Si Mahmoud (Voisin)',
    description: '2 x Tomate Sicam + 4 x Pain',
    total: 9.300,
    paid: 0.000,
    balance: 9.300,
    date: new Date(Date.now() - 43200000).toISOString(),
  },
];

export const storageService = {
  // Products
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  },

  addProduct(product: Product): Product[] {
    const list = this.getProducts();
    const updated = [product, ...list];
    this.saveProducts(updated);
    return updated;
  },

  updateProduct(product: Product): Product[] {
    const list = this.getProducts();
    const updated = list.map((p) => (p.id === product.id ? product : p));
    this.saveProducts(updated);
    return updated;
  },

  deleteProduct(productId: string): Product[] {
    const list = this.getProducts();
    const updated = list.filter((p) => p.id !== productId);
    this.saveProducts(updated);
    return updated;
  },

  restockProduct(productId: string, quantityToAdd: number): Product[] {
    const list = this.getProducts();
    const updated = list.map((p) =>
      p.id === productId ? { ...p, stock: Math.max(0, p.stock + quantityToAdd) } : p
    );
    this.saveProducts(updated);
    return updated;
  },

  // Shop
  getShop(): Shop {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHOP);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(DEFAULT_SHOP));
        return DEFAULT_SHOP;
      }
      return { ...DEFAULT_SHOP, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SHOP;
    }
  },

  saveShop(shop: Shop): Shop {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(shop));
    } catch (e) {
      console.error('Failed to save shop:', e);
    }
    return shop;
  },

  // Sales
  getSales(): SaleRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(DEFAULT_SALES));
        return DEFAULT_SALES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_SALES;
    }
  },

  saveSales(sales: SaleRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) {
      console.error('Failed to save sales:', e);
    }
  },

  // Credits (El Kridi)
  getCredits(): CreditRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CREDITS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(DEFAULT_CREDITS));
        return DEFAULT_CREDITS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CREDITS;
    }
  },

  saveCredits(credits: CreditRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(credits));
    } catch (e) {
      console.error('Failed to save credits:', e);
    }
  },

  // Printer settings
  getPrinterSettings(): { connected: boolean; mac: string; name: string } {
    try {
      const mac = localStorage.getItem(STORAGE_KEYS.PRINTER_MAC) || '00:11:22:33:44:55';
      const name = localStorage.getItem(STORAGE_KEYS.PRINTER_NAME) || 'Imprimante Thermique POS-58';
      const connected = localStorage.getItem('printer_connected') !== 'false';
      return { connected, mac, name };
    } catch {
      return { connected: true, mac: '00:11:22:33:44:55', name: 'Imprimante Thermique POS-58' };
    }
  },

  savePrinterSettings(connected: boolean, mac?: string, name?: string): void {
    try {
      localStorage.setItem('printer_connected', connected ? 'true' : 'false');
      if (mac) localStorage.setItem(STORAGE_KEYS.PRINTER_MAC, mac);
      if (name) localStorage.setItem(STORAGE_KEYS.PRINTER_NAME, name);
    } catch (e) {
      console.error('Failed to save printer settings:', e);
    }
  },
};

export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number; // in TND (Tunisian Dinar)
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Shop {
  name: string;
  addressLine1: string;
  addressLine2: string;
  phoneNumber: string;
  upiId?: string;
  footerText: string;
}

export interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  total: number;
  paid: number;
  paymentType: 'Espèces' | 'À crédit';
  customer?: string;
  date: string;
}

export interface CreditRecord {
  id: string;
  customer: string;
  description: string;
  total: number;
  paid: number;
  balance: number;
  date: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

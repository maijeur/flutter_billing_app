import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { ToastContainer } from './components/ToastContainer';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { EpiceriePage } from './pages/EpiceriePage';
import { ProductListPage } from './pages/ProductListPage';
import { AddProductPage } from './pages/AddProductPage';
import { EditProductPage } from './pages/EditProductPage';
import { ShopDetailsPage } from './pages/ShopDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ScannerPage } from './pages/ScannerPage';
import { Product } from './types';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState('/');
  const [routeExtra, setRouteExtra] = useState<any>(null);
  const { products, scanBarcode, showToast } = useApp();

  const handleNavigate = (route: string, extra?: any) => {
    setCurrentRoute(route);
    setRouteExtra(extra || null);
    window.scrollTo(0, 0);
  };

  const renderCurrentView = () => {
    if (currentRoute === '/') {
      return <HomePage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/checkout') {
      return <CheckoutPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/epicerie') {
      return <EpiceriePage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/products') {
      return <ProductListPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/products/add') {
      return (
        <AddProductPage
          onNavigate={handleNavigate}
          scannedBarcode={typeof routeExtra === 'string' ? routeExtra : ''}
        />
      );
    }

    if (currentRoute.startsWith('/products/edit/')) {
      const prodId = currentRoute.replace('/products/edit/', '');
      const productToEdit =
        routeExtra || products.find((p) => p.id === prodId);

      if (!productToEdit) {
        return <ProductListPage onNavigate={handleNavigate} />;
      }
      return (
        <EditProductPage
          product={productToEdit as Product}
          onNavigate={handleNavigate}
        />
      );
    }

    if (currentRoute === '/shop') {
      return <ShopDetailsPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/settings') {
      return <SettingsPage onNavigate={handleNavigate} />;
    }

    if (currentRoute === '/scanner') {
      return (
        <ScannerPage
          onScanResult={(code) => {
            // If we came to scanner from products, route to add or scan into cart
            const matched = products.find((p) => p.barcode === code);
            if (matched) {
              showToast(`Article détecté : ${matched.name}`, 'success');
              scanBarcode(code);
              handleNavigate('/');
            } else {
              showToast(`Code détecté : ${code} (Nouvel article)`, 'info');
              handleNavigate('/products/add', code);
            }
          }}
          onClose={() => handleNavigate('/')}
        />
      );
    }

    return <HomePage onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex flex-col antialiased">
      <ToastContainer />
      <main className="flex-1 w-full max-w-md md:max-w-xl mx-auto shadow-sm min-h-screen bg-[#F5F7F4] relative">
        {renderCurrentView()}
      </main>
      <BottomNav currentRoute={currentRoute} onNavigate={handleNavigate} />
    </div>
  );
};

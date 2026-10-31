import React, { useState } from 'react';
import { ChevronLeft, Barcode as BarcodeIcon } from 'lucide-react';
import { CameraScanner } from '../components/CameraScanner';

interface ScannerPageProps {
  onScanResult: (barcode: string) => void;
  onClose: () => void;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({ onScanResult, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between text-white">
        <button
          onClick={onClose}
          className="p-1 -ml-1 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h2 className="font-bold text-sm text-white">Scanner un code-barres</h2>
        <div className="w-7" />
      </div>

      {/* Full screen camera */}
      <div className="flex-1 w-full h-full">
        <CameraScanner
          onScan={(code) => {
            onScanResult(code);
            onClose();
          }}
          heightClass="h-full"
          isStandalone
        />
      </div>

      {/* Bottom Hint matching Flutter text */}
      <div className="absolute bottom-8 left-0 right-0 z-30 text-center pointer-events-none">
        <span className="text-xs text-white/90 font-medium bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
          Aligner le code-barres dans le cadre
        </span>
      </div>
    </div>
  );
};

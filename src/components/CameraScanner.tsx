import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Flashlight, FlashlightOff, Settings as SettingsIcon, Barcode as BarcodeIcon, Keyboard, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

interface CameraScannerProps {
  onScan: (barcode: string) => void;
  onOpenSettings?: () => void;
  heightClass?: string;
  isStandalone?: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onScan,
  onOpenSettings,
  heightClass = 'h-[36vh] sm:h-[40vh] min-h-[260px]',
  isStandalone = false,
}) => {
  const { products } = useApp();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScanTimesRef = useRef<Record<string, number>>({});

  const handleDetectedBarcode = useCallback(
    (code: string) => {
      const now = Date.now();
      const lastTime = lastScanTimesRef.current[code] || 0;
      // 2 seconds cooldown per barcode, matching Flutter app
      if (now - lastTime < 2000) return;

      lastScanTimesRef.current[code] = now;
      onScan(code);
    },
    [onScan]
  );

  const startNativeScan = async () => {
    setCameraError(null);
    try {
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) throw new Error('Aucune caméra compatible détectée sur cet appareil.');
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
        setCameraError('Installation du module de lecture Google en cours. Vérifiez votre connexion Internet, puis appuyez à nouveau sur Scanner.');
        return;
      }
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA, BarcodeFormat.UpcE, BarcodeFormat.Code128, BarcodeFormat.Code39],
      });
      const value = barcodes[0]?.rawValue || barcodes[0]?.displayValue;
      if (value) handleDetectedBarcode(value);
    } catch (error: any) {
      setCameraError(error?.message || 'Impossible de démarrer le lecteur. Vérifiez les autorisations de la caméra.');
    }
  };

  // Setup video stream for browser only. Android uses the native ML Kit scanner below.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    let active = true;

    async function startCamera() {
      if (!isCameraOn) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        return;
      }

      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        if (active) {
          setCameraError(err?.message || 'Caméra inaccessible');
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOn]);

  // Barcode Detection via BarcodeDetector API if available in browser
  useEffect(() => {
    if (Capacitor.isNativePlatform() || !isCameraOn || cameraError) return;

    let scanInterval: any = null;
    let detector: any = null;

    if ('BarcodeDetector' in window) {
      try {
        // @ts-ignore
        detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
        });
      } catch (e) {
        console.warn('BarcodeDetector format error', e);
      }
    }

    if (detector) {
      scanInterval = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const detected = barcodes[0].rawValue;
              if (detected) {
                handleDetectedBarcode(detected);
              }
            }
          } catch {}
        }
      }, 300);
    }

    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [isCameraOn, cameraError, handleDetectedBarcode]);

  const toggleTorch = async () => {
    setIsFlashOn((prev) => !prev);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          const capabilities = (track.getCapabilities && track.getCapabilities()) || {};
          // @ts-ignore
          if (capabilities.torch) {
            // @ts-ignore
            await track.applyConstraints({ advanced: [{ torch: !isFlashOn }] });
          }
        } catch {}
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDetectedBarcode(manualCode.trim());
    setManualCode('');
  };

  if (Capacitor.isNativePlatform()) {
    return (
      <div className={`relative flex flex-col items-center justify-center gap-3 bg-slate-950 text-white w-full p-5 ${heightClass}`}>
        <BarcodeIcon className="w-12 h-12 text-emerald-400" />
        <h3 className="font-bold text-base">Lecteur de codes-barres</h3>
        <p className="text-xs text-center text-slate-300">Utilisez la caméra arrière pour lire les codes EAN des produits.</p>
        <button type="button" onClick={startNativeScan} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm active:scale-95">
          <Camera className="inline w-4 h-4 mr-2" />Scanner un code-barres
        </button>
        {cameraError && <p className="text-xs text-amber-200 text-center max-w-sm">{cameraError}</p>}
        <button type="button" onClick={() => setShowManualInput(v => !v)} className="text-xs text-slate-200 underline">Saisir le code manuellement</button>
        {showManualInput && <form onSubmit={handleManualSubmit} className="flex gap-2 w-full max-w-sm">
          <input value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="Code-barres / EAN" className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm text-slate-900" />
          <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold">Ajouter</button>
        </form>}
      </div>
    );
  }

  return (
    <div className={`relative bg-slate-950 w-full overflow-hidden ${heightClass}`}>
      {/* Video stream or camera off state */}
      {isCameraOn && !cameraError ? (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E293B] text-white p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#334155] flex items-center justify-center mb-3">
            <CameraOff className="w-7 h-7 text-white/90" />
          </div>
          <h3 className="font-bold text-base text-white">La caméra est désactivée</h3>
          <p className="text-xs text-white/70 max-w-xs mt-1 mb-4">
            Activez la caméra pour scanner automatiquement les codes-barres ou utilisez la saisie rapide ci-dessous.
          </p>
          <button
            onClick={() => setIsCameraOn(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#176B55] hover:bg-[#135947] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            Activer la caméra
          </button>
        </div>
      )}

      {/* Central Viewfinder Reticle with green corners matching Flutter */}
      {isCameraOn && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-2xl border-2 border-white/20">
            {/* Top-Left */}
            <div className="absolute -top-0.5 -left-0.5 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
            {/* Top-Right */}
            <div className="absolute -top-0.5 -right-0.5 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
            {/* Bottom-Left */}
            <div className="absolute -bottom-0.5 -left-0.5 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
            {/* Bottom-Right */}
            <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

            {/* Subtle animated red/green laser scanner beam */}
            <div className="absolute left-2 right-2 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_#34d399] top-1/2 -translate-y-1/2 animate-pulse" />
          </div>
        </div>
      )}

      {/* Top Right Controls Overlay matching Flutter layout */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2.5 items-center">
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all"
            title="Paramètres"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        )}

        {isCameraOn && (
          <button
            onClick={toggleTorch}
            className={`w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center text-white transition-all ${
              isFlashOn
                ? 'bg-amber-500 border-amber-300 text-slate-950'
                : 'bg-black/50 border-white/20 hover:bg-black/70'
            }`}
            title="Lampe torche"
          >
            {isFlashOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
          </button>
        )}

        <button
          onClick={() => setIsCameraOn(!isCameraOn)}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all"
          title={isCameraOn ? 'Désactiver la caméra' : 'Activer la caméra'}
        >
          {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className={`w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center text-white transition-all ${
            showManualInput
              ? 'bg-[#176B55] border-emerald-300'
              : 'bg-black/50 border-white/20 hover:bg-black/70'
          }`}
          title="Saisie clavier / Code"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      </div>

      {/* Quick scan simulator chips & manual code input at bottom of scanner */}
      <div className="absolute bottom-2 left-0 right-0 z-20 px-3 flex flex-col gap-1.5 items-center">
        {showManualInput && (
          <form
            onSubmit={handleManualSubmit}
            className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-xl max-w-sm w-full animate-in fade-in"
          >
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Code-barres ou EAN..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#176B55] hover:bg-[#135947] text-white rounded-lg text-xs font-semibold shrink-0"
            >
              Ajouter
            </button>
          </form>
        )}

        {/* Quick simulation pills for convenient one-click testing */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 scrollbar-none px-2">
          <span className="text-[10px] text-white/70 font-medium shrink-0 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
            <Zap className="w-3 h-3 text-amber-400" /> Test direct :
          </span>
          {products.slice(0, 5).map((p) => (
            <button
              key={p.id}
              onClick={() => handleDetectedBarcode(p.barcode)}
              className="shrink-0 text-[11px] bg-white/15 hover:bg-white/25 active:bg-emerald-600 text-white font-medium px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-sm transition-all shadow-sm"
              title={`Scanner ${p.name}`}
            >
              + {p.name.split(' ')[0]} ({p.price.toFixed(3)} DT)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

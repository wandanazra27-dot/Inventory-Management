import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, Upload, ScanLine, MapPin, Package, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ScanVisual() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const uploadFile = (file: File) => {
    setIsScanning(true);
    setError('');
    setScanResult(null);

    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:3000/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        setScanResult(res.data.data);
        setIsScanning(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Gagal memindai gambar.');
        setIsScanning(false);
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      setError('Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        uploadFile(file);
        stopCamera();
      }
    }, 'image/jpeg');
  };
  return (
    <div className="space-y-6 p-2">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden mb-2">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Visual Scan</h1>
            <p className="text-slate-500 text-sm mt-1.5">Foto komponen untuk identifikasi otomatis dengan AI</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-125">
        {/* Left Column - Camera Area */}
        <div className="flex flex-col gap-5">
          <div className="flex-1 bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner border border-slate-800 group">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={`w-full h-full object-cover z-20 ${isCameraActive ? 'block' : 'hidden'}`}
            />
            {!isCameraActive && (
              <>
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Viewfinder borders */}
                <div className="absolute w-64 h-64 border border-emerald-500/20 rounded-xl transition-all duration-500 group-hover:scale-105">
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>
                  
                  {/* Animated scan line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse top-1/2 -translate-y-1/2"></div>
                </div>
                
                <div className="flex flex-col items-center gap-4 z-10">
                  <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center backdrop-blur-sm border border-slate-700/80">
                    <Camera className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg">Kamera Siaga</p>
                    <p className="text-slate-400 text-sm mt-1">Arahkan kamera ke komponen</p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex gap-4">
            {isCameraActive ? (
              <button 
                onClick={capturePhoto}
                className="flex-1 py-4 bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
              >
                <Camera className="w-5 h-5" /> Jepret!
              </button>
            ) : (
              <button 
                onClick={startCamera}
                className="flex-1 py-4 bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
              >
                <Camera className="w-5 h-5" /> Aktifkan Kamera
              </button>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload} 
            />
            
            {isCameraActive ? (
              <button 
                onClick={stopCamera}
                className="px-8 py-4 bg-white border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:border-red-500 transition-all active:scale-[0.98] shadow-sm"
              >
                Batal
              </button>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
              >
                <Upload className="w-5 h-5" /> {isScanning ? 'Memproses...' : 'Upload File'}
              </button>
            )}
          </div>
        </div>

        <div className="h-full border-2 border-slate-100 bg-linear-to-b from-slate-50 to-white rounded-2xl flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
          {/* Decorative background elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl"></div>
          
          {isScanning ? (
            <div className="flex flex-col items-center z-10">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-medium">AI Sedang Mengidentifikasi...</p>
            </div>
          ) : scanResult ? (
            <div className="w-full z-10 flex flex-col items-center">
              <div className="w-20 h-20 mb-4 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg border-2 border-emerald-200">
                <Package className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">{scanResult.nama}</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">SKU: {scanResult.sku}</p>
              
              <div className="w-full bg-white rounded-xl border border-slate-100 p-5 shadow-sm text-left mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Lokasi Rak Gudang</p>
                    <p className="font-bold text-slate-800 text-lg">{scanResult.lokasiGudang?.nama || 'Belum Dialokasikan'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Sisa Stok</p>
                    <p className="font-semibold text-slate-700">{scanResult.jumlah} unit</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Kategori</p>
                    <p className="font-semibold text-slate-700">{scanResult.kategori?.nama || '-'}</p>
                  </div>
                </div>
              </div>
              
              <Link 
                to={`/item/${scanResult.id}`}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Lihat Detail Lengkap
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center z-10">
              <div className="w-24 h-24 mb-6 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center relative group-hover:-translate-y-2 transition-transform duration-500">
                <ScanLine className="w-10 h-10 text-emerald-500" />
                <div className="absolute -right-2 -top-2 w-5 h-5 bg-blue-100 rounded-full border-2 border-white"></div>
                <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-emerald-100 rounded-full border-2 border-white"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Hasil Scan AI</h3>
              <p className="text-slate-500 max-w-70 leading-relaxed">
                {error ? (
                  <span className="text-red-500 flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4"/> {error}</span>
                ) : (
                  "Hasil identifikasi komponen beserta letak lokasinya akan otomatis muncul di sini."
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

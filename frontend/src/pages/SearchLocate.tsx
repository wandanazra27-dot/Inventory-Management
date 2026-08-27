import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search as SearchIcon, Camera, Package, MapPin, X, Aperture, Upload } from 'lucide-react';
import WarehouseMap from '../components/WarehouseMap';

export default function SearchLocate() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [historyTeks, setHistoryTeks] = useState<any[]>([]);
  const [historyVisual, setHistoryVisual] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scanInfo, setScanInfo] = useState<{success: boolean, rawOutput: string} | null>(null);
  
  // Camera Modal States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = () => {
    axios.get('http://localhost:3000/dashboard/summary')
      .then(res => {
        if(res.data) {
          if (res.data.riwayatTeks) setHistoryTeks(res.data.riwayatTeks);
          if (res.data.riwayatVisual) setHistoryVisual(res.data.riwayatVisual);
        }
      })
      .catch(err => console.error('Error fetching history:', err));
  };

  useEffect(() => {
    fetchHistory();
    // Cleanup camera stream on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const handleSearch = () => {
    if(!query.trim()) return;
    setIsLoading(true);
    setScanInfo(null);
    axios.get(`http://localhost:3000/search?q=${query}`)
      .then(res => {
        setSearchResults(res.data);
        setIsLoading(false);
        fetchHistory();
      })
      .catch(err => {
        console.error('Error searching:', err);
        setIsLoading(false);
      });
  };

  const uploadFile = (file: File) => {
    setIsLoading(true);
    setScanInfo(null);
    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:3000/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        const data = res.data;
        if (data && data.rawOutput) {
          setScanInfo({ success: data.success, rawOutput: data.rawOutput });
        }
        
        if (data && data.success && data.data) {
          setSearchResults([data.data]);
        } else {
          setSearchResults([]);
        }
        setIsLoading(false);
        fetchHistory();
      })
      .catch(err => {
        console.error('Error scanning:', err);
        alert(err.response?.data?.message || 'Gagal memindai gambar.');
        setSearchResults([]);
        setIsLoading(false);
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset file input
    if (e.target) e.target.value = '';
  };

  // Camera Functions
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Tidak dapat mengakses kamera. Pastikan browser memiliki izin.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob -> File
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
            stopCamera();
            uploadFile(file);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  return (
    <div className="space-y-6 p-2 relative">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden mb-2">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
            <SearchIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Visual Search & Location Tracker</h1>
            <p className="text-slate-500 text-sm mt-1.5">Identifikasi komponen via teks, foto kamera, atau upload file</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Cari nama barang, SKU, atau deskripsi..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-2.5 bg-emerald-100 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Mencari...' : 'Cari'}
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Upload className="w-4 h-4" /> Upload
        </button>
        <button 
          onClick={startCamera}
          disabled={isLoading}
          className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Camera className="w-4 h-4" /> {isLoading ? 'Proses...' : 'Kamera'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileUpload} 
        />
      </div>

      {/* AI Scan Info Box */}
      {scanInfo && (
        <div className={`p-4 rounded-xl border ${scanInfo.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'} flex items-start gap-3 shadow-sm`}>
          <Aperture className={`w-5 h-5 mt-0.5 ${scanInfo.success ? 'text-emerald-600' : 'text-amber-600'}`} />
          <div>
            <h4 className="font-semibold text-sm mb-1">Hasil Penglihatan AI (Gemini 3.6 Flash):</h4>
            <p className="text-sm">"{scanInfo.rawOutput}"</p>
            {!scanInfo.success && (
              <p className="text-xs mt-2 opacity-80">
                AI berhasil melihat objek di atas, namun tidak ada barang di database gudang yang cocok dengan nama tersebut.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Camera Pop-up Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 max-w-2xl w-full">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" /> Ambil Foto Barang
              </h3>
              <button onClick={stopCamera} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {/* Corner crosshairs for aesthetics */}
              <div className="absolute inset-8 border border-white/20 pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500"></div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-900 flex justify-center">
              <button 
                onClick={capturePhoto}
                className="group relative flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full hover:bg-emerald-400 transition-colors cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                <div className="absolute inset-1 rounded-full border-2 border-white/50 group-hover:border-white transition-colors"></div>
                <Aperture className="w-6 h-6 text-white" />
              </button>
            </div>
            
            {/* Hidden canvas for capturing the image */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* Main Content Split */}
      {searchResults !== null ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-100 mb-6">
          <div className="bg-white rounded-xl border border-slate-900 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-900 bg-slate-50 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-slate-800">Hasil Pencarian</h3>
              <span className="text-sm text-slate-500">{searchResults.length} ditemukan</span>
            </div>
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Tidak ada barang yang cocok.</div>
              ) : (
                searchResults.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{item.nama}</p>
                        <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.lokasiGudang?.nama || 'Belum Dialokasikan'}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Stok: {item.jumlah} unit</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="border rounded-xl bg-white overflow-hidden h-full">
            <WarehouseMap highlightedLocation={searchResults.length > 0 ? searchResults[0].lokasiGudang?.nama : null} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-100">
          {/* Upload Box (Strictly for File Uploads) */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-emerald-200 rounded-xl bg-white flex flex-col items-center justify-center p-6 text-center transition-colors cursor-pointer h-full ${isLoading ? 'opacity-50 pointer-events-none' : 'hover:bg-emerald-50/50'}`}
          >
            <div className="w-20 h-20 mb-4 text-emerald-400 relative">
              <div className="absolute inset-0 border-2 border-emerald-400 rounded"></div>
              <div className="absolute inset-2 flex items-center justify-center">
                {isLoading ? <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full"></div> : <Camera className="w-8 h-8" />}
              </div>
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">{isLoading ? 'Menganalisis Foto...' : 'Upload File Gambar Komponen'}</h3>
            <p className="text-slate-500 text-sm mb-4">Drag & drop foto, atau klik untuk memilih file dari komputer</p>
            <p className="text-slate-400 text-xs">Didukung: JPG, PNG, WebP — maks. 10MB</p>
          </div>

          {/* Warehouse Map */}
          <div className="border rounded-xl bg-white overflow-hidden h-full">
            <WarehouseMap />
          </div>
        </div>
      )}

      {/* History Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="border border-slate-900 rounded-xl bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm">Pencarian Visual Terbaru</h3>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-white text-slate-800 font-semibold border-b border-slate-900">
              <tr>
                <th className="px-4 py-2 font-medium">Waktu</th>
                <th className="px-4 py-2 font-medium">Hasil Deteksi</th>
              </tr>
            </thead>
            <tbody>
              {historyVisual.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                    Belum ada riwayat pencarian visual.
                  </td>
                </tr>
              ) : (
                historyVisual.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-slate-100 hover:bg-emerald-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(item.dibuatPada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-700">
                      {item.catatan?.replace('Identifikasi otomatis dengan AI Vision (File: ', '')?.replace(')', '') || 'Objek Terdeteksi'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border border-slate-900 rounded-xl bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-900 flex items-center gap-2">
            <SearchIcon className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm">Riwayat Pencarian Teks</h3>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-white text-slate-800 font-semibold border-b border-slate-900">
              <tr>
                <th className="px-4 py-2 font-medium">Waktu</th>
                <th className="px-4 py-2 font-medium">Kata Kunci</th>
              </tr>
            </thead>
            <tbody>
              {historyTeks.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                    Belum ada riwayat
                  </td>
                </tr>
              ) : (
                historyTeks.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-slate-100 hover:bg-emerald-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setQuery(item.kataKunci);
                      setTimeout(() => {
                        setIsLoading(true);
                        axios.get(`http://localhost:3000/search?q=${item.kataKunci}`)
                          .then(res => {
                            setSearchResults(res.data);
                            setIsLoading(false);
                            fetchHistory();
                          })
                          .catch(err => {
                            console.error('Error searching:', err);
                            setIsLoading(false);
                          });
                      }, 0);
                    }}
                  >
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(item.dibuatPada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-700">{item.kataKunci}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { Camera, Upload, ScanLine } from 'lucide-react';

export default function ScanVisual() {
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
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Viewfinder borders */}
            <div className="absolute w-64 h-64 border border-emerald-500/20 rounded-xl transition-all duration-500 group-hover:scale-105">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl shadow-[0_0_15px_rgba(52,211,153,0.3)]"></div>
              
              {/* Animated scan line */}
              <div className="absolute left-0 right-0 h-[2px] bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse top-1/2 -translate-y-1/2"></div>
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
          </div>
          
          <div className="flex gap-4">
            <button className="flex-1 py-4 bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]">
              <Camera className="w-5 h-5" /> Aktifkan Kamera
            </button>
            <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-[0.98] shadow-sm">
              <Upload className="w-5 h-5" /> Upload File
            </button>
          </div>
        </div>

        {/* Right Column - Results Area */}
        <div className="h-full border-2 border-slate-100 bg-linear-to-b from-slate-50 to-white rounded-2xl flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
          {/* Decorative background elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl"></div>
          
          <div className="w-24 h-24 mb-6 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
            <ScanLine className="w-10 h-10 text-emerald-500" />
            {/* Mini decorative dots */}
            <div className="absolute -right-2 -top-2 w-5 h-5 bg-blue-100 rounded-full border-2 border-white"></div>
            <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-emerald-100 rounded-full border-2 border-white"></div>
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-3 relative z-10">Hasil Scan AI</h3>
          <p className="text-slate-500 max-w-[280px] leading-relaxed relative z-10">
            Hasil identifikasi komponen beserta letak lokasinya akan otomatis muncul di sini.
          </p>
        </div>
      </div>
    </div>
  );
}

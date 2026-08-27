import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart2, Package, MapPin, Camera, Search, TrendingUp } from 'lucide-react';

export default function ReportsLogs() {
  const [summary, setSummary] = useState({
    totalItem: 0,
    totalLokasi: 0,
    totalStok: 0,
    scanHariIni: 0,
    searchHariIni: 0,
    riwayatVisual: [],
    riwayatTeks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/dashboard/summary')
      .then(res => {
        setSummary(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching summary:', err);
        setLoading(false);
      });
  }, []);
  return (
    <div className="space-y-6 p-2">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden mb-2">
        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center shadow-inner">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Reports & Logs</h1>
            <p className="text-slate-500 text-sm mt-1.5">Ringkasan aktivitas dan pencarian harian</p>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-500 p-3 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Item</p>
            <p className="text-2xl font-bold text-slate-800">{loading ? '...' : summary.totalItem}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-sky-50 text-sky-500 p-3 rounded-lg">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Lokasi</p>
            <p className="text-2xl font-bold text-slate-800">{loading ? '...' : summary.totalLokasi}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 text-purple-500 p-3 rounded-lg">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Visual Scan Hari Ini</p>
            <p className="text-2xl font-bold text-slate-800">{loading ? '...' : summary.scanHariIni}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-500 p-3 rounded-lg">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Teks Search Hari Ini</p>
            <p className="text-2xl font-bold text-slate-800">{loading ? '...' : summary.searchHariIni}</p>
          </div>
        </div>
      </div>

      {/* 2 Columns History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm text-slate-700">Riwayat Visual Search</h3>
          </div>
          {summary.riwayatVisual && summary.riwayatVisual.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {summary.riwayatVisual.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {item.catatan?.replace('Identifikasi AI: ', '')?.replace('"', '')?.replace('"', '') || 'Objek Terdeteksi'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(item.dibuatPada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-slate-400">
              Belum ada riwayat.
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm text-slate-700">Riwayat Text Search</h3>
          </div>
          {summary.riwayatTeks && summary.riwayatTeks.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {summary.riwayatTeks.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.kataKunci}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(item.dibuatPada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-slate-400">
              Belum ada riwayat.
            </div>
          )}
        </div>
      </div>

      {/* Full width total stock */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
        <TrendingUp className="w-6 h-6 text-emerald-500" />
        <div>
          <p className="text-xs font-medium text-slate-400">Total Stok Keseluruhan</p>
          <p className="text-2xl font-bold text-slate-800">{loading ? '...' : summary.totalStok} <span className="text-sm font-medium text-slate-400">unit</span></p>
        </div>
      </div>

    </div>
  );
}

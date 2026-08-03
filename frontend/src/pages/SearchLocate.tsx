import { useState } from 'react';
import { Search as SearchIcon, Camera } from 'lucide-react';
import WarehouseMap from '../components/WarehouseMap';

export default function SearchLocate() {
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden mb-2">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
            <SearchIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Visual Search & Location Tracker</h1>
            <p className="text-slate-500 text-sm mt-1.5">Identifikasi komponen via foto atau nama SKU</p>
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
            placeholder="Cari nama barang, SKU, atau deskripsi..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <button className="px-6 py-2.5 bg-emerald-100 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition-colors">
          Cari
        </button>
        <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm">
          <Camera className="w-4 h-4" /> Scan
        </button>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-100">
        {/* Upload Box */}
        <div className="border-2 border-dashed border-emerald-200 rounded-xl bg-white flex flex-col items-center justify-center p-6 text-center hover:bg-emerald-50/50 transition-colors cursor-pointer">
          <div className="w-20 h-20 mb-4 text-emerald-400 relative">
            <div className="absolute inset-0 border-2 border-emerald-400 rounded"></div>
            <div className="absolute inset-2 flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">Identifikasi komponen dengan Visual Search</h3>
          <p className="text-slate-500 text-sm mb-4">Drag & drop foto, atau klik untuk upload</p>
          <p className="text-slate-400 text-xs">Didukung: JPG, PNG, WebP — maks. 10MB</p>
        </div>

        {/* Warehouse Map */}
        <div className="border rounded-xl bg-white overflow-hidden">
          <WarehouseMap />
        </div>
      </div>

      {/* History Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="border border-slate-900 rounded-xl bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm">Pencarian Visual Terbaru</h3>
          </div>
          <div className="p-8 text-center text-sm text-slate-500">
            Belum ada riwayat pencarian visual.
          </div>
        </div>

        <div className="border border-slate-900 rounded-xl bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-900 flex items-center gap-2">
            <SearchIcon className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm">Riwayat Pencarian Teks</h3>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-white text-slate-800 font-semibold border-b border-slate-900">
              <tr>
                <th className="px-4 py-2 font-medium">Pencarian</th>
                <th className="px-4 py-2 font-medium">SKU</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Belum ada riwayat
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

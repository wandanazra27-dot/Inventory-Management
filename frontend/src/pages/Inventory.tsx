import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search as SearchIcon, Plus, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Inventory() {
  const [barangList, setBarangList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBarang = () => {
    setLoading(true);
    axios.get('http://localhost:3000/barang')
      .then(res => {
        setBarangList(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching barang', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  const filteredBarang = barangList.filter(item => 
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.deskripsi && item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.kategori?.nama && item.kategori.nama.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-2">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Inventaris Gudang</h1>
            <p className="text-slate-500 text-sm mt-1.5">{barangList.length} item terdaftar dalam sistem</p>
          </div>
        </div>
        <Link to="/inventory/add" className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-md hover:shadow-emerald-500/20">
          <Plus className="w-5 h-5" /> Tambah Item
        </Link>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama, SKU, deskripsi..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      <div className="rounded-xl border border-slate-900 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-800 font-semibold border-b border-slate-900">
              <tr>
                <th className="px-6 py-4">Nama Item</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Lokasi</th>
                <th className="px-6 py-4 text-center">Stok</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredBarang.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    {searchQuery ? `Tidak ada barang yang cocok dengan pencarian "${searchQuery}".` : 'Tidak ada data barang.'}
                  </td>
                </tr>
              ) : (
                filteredBarang.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                           <span className="text-emerald-500 text-[10px]">📦</span>
                        </div>
                        <span className="font-medium text-slate-700">{item.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.sku}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {item.kategori?.nama || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-medium text-xs">
                          {item.lokasiGudang ? item.lokasiGudang.nama : '-'}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {item.lokasiGudang ? item.lokasiGudang.zona : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-700">
                      {item.jumlah}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.jumlah > 10 ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-200">
                          Normal
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-200 gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Rendah
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/inventory/${item.id}`} className="text-emerald-500 hover:text-emerald-600 text-xs font-semibold">
                        Detail
                      </Link>
                    </td>
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

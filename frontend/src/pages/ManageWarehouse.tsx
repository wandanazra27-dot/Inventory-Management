import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, X } from 'lucide-react';
import WarehouseMap from '../components/WarehouseMap';

export default function ManageWarehouse() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    label: '',
    zone: 'Zone A',
    rak: '',
    baris: '',
    keranjang: '',
    kapasitas: 100
  });

  const fetchLocations = () => {
    setLoading(true);
    axios.get('http://localhost:3000/lokasi-gudang')
      .then(res => {
        setLocations(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = (id: number) => {
    if(confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) {
      axios.delete(`http://localhost:3000/lokasi-gudang/${id}`)
        .then(() => fetchLocations())
        .catch(() => alert('Gagal menghapus lokasi.'));
    }
  };

  const handleSave = () => {
    if(!formData.label) {
      alert('Label wajib diisi!');
      return;
    }
    const payload = {
      nama: formData.label,
      zona: formData.zone,
      kapasitas: Number(formData.kapasitas)
    };
    
    axios.post('http://localhost:3000/lokasi-gudang', payload)
      .then(() => {
        setIsModalOpen(false);
        fetchLocations();
        setFormData({ label: '', zone: 'Zone A', rak: '', baris: '', keranjang: '', kapasitas: 100 });
      })
      .catch(() => alert('Gagal menyimpan lokasi. Pastikan label unik.'));
  };

  // Generate detail string
  const getDetail = (loc: any) => {
    // In real app we might store rak/baris separately, but for now we fallback
    return `Kapasitas: ${loc.kapasitas}`;
  };

  return (
    <div className="space-y-6 p-2 relative">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden mb-2">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Manajemen Gudang</h1>
            <p className="text-slate-500 text-sm mt-1.5">{locations.length} lokasi terdaftar</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-md hover:shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" /> Tambah Lokasi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Warehouse Map & Filter */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="h-112.5">
             <WarehouseMap />
          </div>

          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Filter Zone</h4>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">Semua</button>
              <button className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium rounded-full transition-colors">Zone A (3)</button>
              <button className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium rounded-full transition-colors">Zone B (2)</button>
              <button className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium rounded-full transition-colors">Zone C (1)</button>
            </div>
          </div>
        </div>

        {/* Right Column - Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-900 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-800 font-semibold border-b border-slate-900">
                  <tr>
                    <th className="px-6 py-4">Label</th>
                    <th className="px-6 py-4 text-center">Zone</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4 text-center">Item</th>
                    <th className="px-6 py-4 text-center">Kapasitas</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Memuat data...</td>
                    </tr>
                  ) : locations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        Belum ada lokasi terdaftar.
                      </td>
                    </tr>
                  ) : (
                    locations.map((loc, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700 flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {loc.nama}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {loc.zona === 'Zone A' && <span className="text-sky-600 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">{loc.zona}</span>}
                          {loc.zona === 'Zone B' && <span className="text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">{loc.zona}</span>}
                          {loc.zona === 'Zone C' && <span className="text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">{loc.zona}</span>}
                          {loc.zona === 'Zone D' && <span className="text-slate-600 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">{loc.zona}</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{getDetail(loc)}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">{loc.barang?.length || 0}</td>
                        <td className="px-6 py-4 text-center text-slate-500">{loc.kapasitas}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            onClick={() => handleDelete(loc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah Lokasi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-125 shadow-xl overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Tambah Lokasi Baru</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Label <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                    placeholder="Rak-A1" 
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Zone <span className="text-red-500">*</span></label>
                  <select 
                    value={formData.zone}
                    onChange={(e) => setFormData({...formData, zone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Zone A">Zone A</option>
                    <option value="Zone B">Zone B</option>
                    <option value="Zone C">Zone C</option>
                    <option value="Zone D">Zone D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rak</label>
                  <input type="text" placeholder="A1" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Baris</label>
                  <input type="text" placeholder="1" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keranjang</label>
                  <input type="text" placeholder="01" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kapasitas</label>
                <input 
                  type="number" 
                  value={formData.kapasitas}
                  onChange={(e) => setFormData({...formData, kapasitas: parseInt(e.target.value) || 0})}
                  placeholder="100" 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-emerald-400 text-white rounded-lg text-sm font-bold hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// MapPin helper
const MapPin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

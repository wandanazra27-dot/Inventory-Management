import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, X, Edit3 } from 'lucide-react';
import WarehouseMap from '../components/WarehouseMap';

export default function ManageWarehouse() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    label: '',
    zone: 'Rak 1',
    kapasitas: 100,
    rak: 'Rak 1',
    baris: 1,
    keranjang: '01'
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
      kapasitas: Number(formData.kapasitas),
      rak: formData.rak,
      baris: Number(formData.baris) || 1,
      keranjang: formData.keranjang
    };
    
    if (editId) {
      axios.patch(`http://localhost:3000/lokasi-gudang/${editId}`, payload)
        .then(() => {
          setIsModalOpen(false);
          setEditId(null);
          fetchLocations();
          setFormData({ label: '', zone: 'Rak 1', kapasitas: 100, rak: 'Rak 1', baris: 1, keranjang: '01' });
        })
        .catch(err => alert(err.response?.data?.message || 'Gagal menyimpan perubahan.'));
    } else {
      axios.post('http://localhost:3000/lokasi-gudang', payload)
        .then(() => {
          setIsModalOpen(false);
          fetchLocations();
          setFormData({ label: '', zone: 'Rak 1', kapasitas: 100, rak: 'Rak 1', baris: 1, keranjang: '01' });
        })
        .catch(err => alert(err.response?.data?.message || 'Gagal menambah lokasi.'));
    }
  };

  const openEditModal = (loc: any) => {
    setEditId(loc.id);
    setFormData({ 
      label: loc.nama, 
      zone: loc.zona, 
      kapasitas: loc.kapasitas || 100,
      rak: loc.rak || 'Rak 1',
      baris: loc.baris || 1,
      keranjang: loc.keranjang || '01'
    });
    setIsModalOpen(true);
  };

  // Extract unique zones for the filter
  const zones = Array.from(new Set(locations.map(loc => loc.zona).filter(Boolean)));
  
  // Filter the table based on selected zone
  const filteredLocations = (selectedZone 
    ? locations.filter(loc => loc.zona === selectedZone)
    : [...locations]).sort((a, b) => {
      // 1. Sort by zone
      const zoneCmp = (a.zona || '').localeCompare(b.zona || '');
      if (zoneCmp !== 0) return zoneCmp;
      // 2. Sort by baris
      const barisA = a.baris || 1;
      const barisB = b.baris || 1;
      if (barisA !== barisB) return barisA - barisB;
      // 3. Sort by keranjang (if explicitly set)
      const numA = parseInt(a.keranjang) || 0;
      const numB = parseInt(b.keranjang) || 0;
      if (numA !== numB) return numA - numB;
      // 4. Sort by name naturally
      return a.nama.localeCompare(b.nama, undefined, { numeric: true });
    });

  return (
    <div className="space-y-6 p-2">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden mb-2">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Manajemen Gudang</h1>
            <p className="text-slate-500 text-sm mt-1.5">Atur rak, kapasitas, dan tata letak penyimpanan</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setEditId(null);
            setFormData({ label: '', zone: 'Rak 1', kapasitas: 100, rak: 'Rak 1', baris: 1, keranjang: '01' });
            setIsModalOpen(true);
          }}
          className="relative z-10 bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Lokasi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-162.5 mb-6">
        <div className="lg:col-span-5 flex flex-col h-full min-h-0">
          <div className="h-full min-h-0">
             <WarehouseMap highlightedLocation={hoveredLocation} />
          </div>
        </div>

        {/* Right Column - Table */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-0">
          <div className="bg-white rounded-xl border border-slate-900 shadow-sm overflow-hidden flex flex-col h-full min-h-0">
            {/* Filter Section */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">Filter Rak:</span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setSelectedZone(null)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${selectedZone === null ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Semua
                  </button>
                  {zones.map(zone => (
                    <button 
                      key={zone}
                      onClick={() => setSelectedZone(zone)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${selectedZone === zone ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {zone} ({locations.filter(l => l.zona === zone).length})
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">{filteredLocations.length} lokasi</span>
            </div>

            <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-sm text-left relative">
                <thead className="bg-white text-slate-800 font-semibold border-b border-slate-900 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 w-32">Label</th>
                    <th className="px-4 py-2.5 text-center w-32">Rak</th>
                    <th className="px-4 py-2.5">Barang Tersimpan</th>
                    <th className="px-4 py-2.5 w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-500">Memuat data...</td>
                    </tr>
                  ) : filteredLocations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">
                        Belum ada lokasi penyimpanan yang didaftarkan.
                      </td>
                    </tr>
                  ) : (
                    filteredLocations.map((loc, i) => (
                      <tr 
                        key={i} 
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onMouseEnter={() => setHoveredLocation(loc.nama)}
                        onMouseLeave={() => setHoveredLocation(null)}
                      >
                        <td className="px-4 py-1.5">
                          <div className="font-mono text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{loc.nama}</span>
                          </div>
                        </td>
                        <td className="px-4 py-1.5 text-center">
                          <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">{loc.zona}</span>
                        </td>
                        <td className="px-4 py-1.5">
                          {loc.barang && loc.barang.length > 0 ? (
                            <select className="w-full max-w-70 px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 cursor-pointer focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 shadow-sm appearance-none hover:bg-slate-50 transition-colors">
                              <option value="" disabled selected>📦 {loc.barang.length} Barang Tersimpan</option>
                              {loc.barang.map((b: any, index: number) => (
                                <option key={index} value={b.id}>• {b.nama}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Kosong</span>
                          )}
                        </td>
                        <td className="px-4 py-1.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                              onClick={() => openEditModal(loc)}
                              title="Edit Lokasi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                              onClick={() => handleDelete(loc.id)}
                              title="Hapus Lokasi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Modal Tambah/Edit Lokasi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-125 shadow-xl overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editId ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h2>
              <button 
                onClick={() => { setIsModalOpen(false); setEditId(null); }}
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
                    <option value="Rak 1">Rak 1</option>
                    <option value="Rak 2">Rak 2</option>
                    <option value="Rak 3">Rak 3</option>
                    <option value="Rak 4">Rak 4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Rak</label>
                  <input type="text" value={formData.rak} onChange={(e) => setFormData({...formData, rak: e.target.value})} placeholder="Rak 1" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Baris / Tingkat</label>
                  <input type="number" min="1" value={formData.baris} onChange={(e) => setFormData({...formData, baris: parseInt(e.target.value) || 1})} placeholder="1" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keranjang</label>
                  <input type="text" value={formData.keranjang} onChange={(e) => setFormData({...formData, keranjang: e.target.value})} placeholder="01" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
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
                  onClick={() => { setIsModalOpen(false); setEditId(null); }}
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

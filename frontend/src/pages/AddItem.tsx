import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AddItem() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    sku: '',
    lokasiGudangId: '',
    jumlah: 0,
    stokMinimum: 0,
    deskripsi: ''
  });

  useEffect(() => {
    axios.get('http://localhost:3000/lokasi-gudang')
      .then(res => setLocations(res.data))
      .catch(err => console.error('Failed to load locations', err));
  }, []);

  const handleSave = () => {
    if(!formData.nama || !formData.sku) {
      alert('Nama item dan SKU wajib diisi!');
      return;
    }
    setLoading(true);
    
    // Default kategoriId to 1 for now
    const payload = {
      nama: formData.nama,
      sku: formData.sku,
      deskripsi: formData.deskripsi,
      jumlah: Number(formData.jumlah),
      kategoriId: 1, 
      ...(formData.lokasiGudangId && { lokasiGudangId: Number(formData.lokasiGudangId) })
    };

    axios.post('http://localhost:3000/barang', payload)
      .then(() => {
        setLoading(false);
        navigate('/inventory');
      })
      .catch(err => {
        setLoading(false);
        alert('Gagal menyimpan item. Pastikan SKU unik.');
      });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      <div className="flex items-center gap-4">
        <Link to="/inventory" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Tambah Item Baru</h1>
      </div>

      <div className="bg-white border rounded-xl p-8 shadow-sm">
        <form className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Item <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              placeholder="Nama barang..." 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                placeholder="SKU-001" 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
              <select 
                value={formData.lokasiGudangId}
                onChange={(e) => setFormData({...formData, lokasiGudangId: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">-- Pilih Lokasi --</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nama} ({loc.zona})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stok Awal</label>
              <input 
                type="number" 
                value={formData.jumlah}
                onChange={(e) => setFormData({...formData, jumlah: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stok Minimum</label>
              <input 
                type="number" 
                value={formData.stokMinimum}
                onChange={(e) => setFormData({...formData, stokMinimum: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
            <textarea 
              rows={4}
              value={formData.deskripsi}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              placeholder="Deskripsi barang..." 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            ></textarea>
          </div>

          <div className="flex gap-3 pt-4">
            <Link to="/inventory" className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
              Batal
            </Link>
            <button 
              type="button" 
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-400 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? 'Menyimpan...' : 'Simpan Item'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

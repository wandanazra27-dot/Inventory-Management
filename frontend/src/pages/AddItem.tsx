import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AddItem() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    sku: '',
    lokasiGudangId: '',
    kategoriId: '',
    jumlah: 0,
    stokMinimum: 0,
    deskripsi: ''
  });

  useEffect(() => {
    // Fetch Lokasi
    axios.get('http://localhost:3000/lokasi-gudang')
      .then(res => setLocations(res.data))
      .catch(err => console.error('Failed to load locations', err));
      
    // Fetch Kategori
    axios.get('http://localhost:3000/barang/kategori/all')
      .then(res => setCategories(res.data))
      .catch(() => {
        console.error('Failed to load categories');
      });
  }, []);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if(!formData.nama || !formData.sku || !formData.kategoriId) {
      alert('Nama item, SKU, dan Kategori wajib diisi!');
      return;
    }
    setLoading(true);
    
    try {
      let urlGambar = null;

      if (foto) {
        const formDataFoto = new FormData();
        formDataFoto.append('foto', foto);
        const uploadRes = await axios.post('http://localhost:3000/barang/upload', formDataFoto, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        urlGambar = uploadRes.data.url;
      }

      const payload = {
        nama: formData.nama,
        sku: formData.sku,
        deskripsi: formData.deskripsi,
        jumlah: Number(formData.jumlah),
        kategoriId: Number(formData.kategoriId), 
        ...(formData.lokasiGudangId && { lokasiGudangId: Number(formData.lokasiGudangId) }),
        ...(urlGambar && { urlGambar })
      };

      await axios.post('http://localhost:3000/barang', payload);
      setLoading(false);
      navigate('/inventory');
    } catch (error) {
      setLoading(false);
      alert('Gagal menyimpan item. Pastikan SKU unik atau periksa koneksi server.');
    }
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
                placeholder="Misal: SKU-100" 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori <span className="text-red-500">*</span></label>
              <select 
                value={formData.kategoriId}
                onChange={(e) => setFormData({...formData, kategoriId: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Foto Barang (Opsional)</label>
            <div className="mt-1 flex items-center gap-4">
              {fotoPreview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setFoto(null); setFotoPreview(null); }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <span className="text-xl text-slate-400">+</span>
                  <span className="text-[10px] text-slate-500 mt-1">Upload</span>
                  <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                </label>
              )}
              <div className="text-xs text-slate-500">
                Format: JPG, PNG, WEBP.<br/>
                Maksimal ukuran: 2MB.
              </div>
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

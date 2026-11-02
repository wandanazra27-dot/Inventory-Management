import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Edit3, Trash2, Package, MapPin, BarChart2, Plus, Minus, Info } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [adjustNotes, setAdjustNotes] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    nama: '',
    sku: '',
    kategoriId: '',
    lokasiGudangId: '',
    deskripsi: ''
  });

  const [itemData, setItemData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchItem = () => {
    setLoading(true);
    axios.get(`http://localhost:3000/barang/${id}`)
      .then(res => {
        setItemData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) fetchItem();
  }, [id]);

  const openEditModal = () => {
    // Populate form
    setEditForm({
      nama: itemData?.nama || '',
      sku: itemData?.sku || '',
      kategoriId: itemData?.kategoriId || '',
      lokasiGudangId: itemData?.lokasiGudangId || '',
      deskripsi: itemData?.deskripsi || ''
    });
    setFoto(null);
    setFotoPreview(itemData?.urlGambar ? (itemData.urlGambar.startsWith('http') ? itemData.urlGambar : `http://localhost:3000${itemData.urlGambar}`) : null);
    
    // Fetch options if not fetched yet
    if (locations.length === 0) {
      axios.get('http://localhost:3000/lokasi-gudang').then(res => setLocations(res.data)).catch(console.error);
    }
    if (categories.length === 0) {
      axios.get('http://localhost:3000/kategori').then(res => setCategories(res.data)).catch(console.error);
    }
    
    setIsEditModalOpen(true);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let finalUrlGambar = itemData?.urlGambar || null;

      if (foto) {
        const formDataFoto = new FormData();
        formDataFoto.append('foto', foto);
        const uploadRes = await axios.post('http://localhost:3000/barang/upload', formDataFoto, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalUrlGambar = uploadRes.data.url;
      } else if (!fotoPreview) {
        // If fotoPreview is null but foto is not uploaded, it means user removed the photo
        finalUrlGambar = null;
      }

      const payload = {
        ...editForm,
        kategoriId: editForm.kategoriId ? parseInt(editForm.kategoriId as string) : null,
        lokasiGudangId: editForm.lokasiGudangId ? parseInt(editForm.lokasiGudangId as string) : null,
        urlGambar: finalUrlGambar
      };

      await axios.patch(`http://localhost:3000/barang/${id}`, payload);
      setIsEditModalOpen(false);
      setIsSaving(false);
      fetchItem();
    } catch (err) {
      setIsSaving(false);
      alert('Gagal menyimpan perubahan.');
    }
  };

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      axios.delete(`http://localhost:3000/barang/${id}`)
        .then(() => navigate('/inventory'))
        .catch(() => alert('Gagal menghapus item.'));
    }
  };

  const handleAdjustStock = () => {
    if (adjustAmount <= 0) return;
    axios.post(`http://localhost:3000/barang/${id}/adjust`, { 
      jumlah: adjustAmount,
      jenis: adjustType === 'in' ? 'MASUK' : 'KELUAR',
      catatan: adjustNotes
    })
      .then(() => {
        setIsAdjustModalOpen(false);
        setAdjustAmount(1);
        setAdjustNotes('');
        fetchItem(); // refresh data
      })
      .catch((err) => alert(err.response?.data?.message || 'Gagal menyesuaikan stok.'));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat detail barang...</div>;
  }

  if (!itemData) {
    return <div className="p-8 text-center text-red-500">Barang tidak ditemukan.</div>;
  }

  const { nama, sku, jumlah, lokasiGudang, kategori } = itemData;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/inventory" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">{nama}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={openEditModal}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Edit3 className="w-4 h-4" /> Edit
          </button>
          <button 
            onClick={handleDelete}
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-red-50 transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> Hapus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Stats & Action */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Stock Card */}
          <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col items-center justify-center text-center">
            {itemData.urlGambar ? (
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm border border-slate-200 mb-4 bg-slate-50">
                <img src={itemData.urlGambar.startsWith('http') ? itemData.urlGambar : `http://localhost:3000${itemData.urlGambar}`} alt={nama} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${jumlah > 10 ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                <Package className="w-10 h-10" />
              </div>
            )}
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Stok Tersedia</p>
            <h2 className="text-5xl font-bold text-slate-800 tracking-tight">{jumlah}</h2>
            <div className="mt-6 w-full flex gap-2">
              <button 
                onClick={() => { setAdjustType('in'); setIsAdjustModalOpen(true); }}
                className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Masuk
              </button>
              <button 
                onClick={() => { setAdjustType('out'); setIsAdjustModalOpen(true); }}
                className="flex-1 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors"
              >
                <Minus className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" /> Lokasi Penyimpanan
            </h3>
            {lokasiGudang ? (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Zone</span>
                  <span className="px-2 py-1 bg-white border rounded text-xs font-bold text-emerald-600 shadow-sm">{lokasiGudang.zona}</span>
                </div>
                <p className="font-mono text-sm font-bold text-slate-700 mt-3">{lokasiGudang.nama}</p>
                <p className="text-xs text-slate-500 mt-1">Kapasitas Rak: {lokasiGudang.kapasitas}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Lokasi belum diatur.</p>
            )}
          </div>
        </div>

        {/* Right Col - Details & History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden h-full">
            <div className="flex border-b">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'overview' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Info className="w-4 h-4" /> Informasi Produk
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'history' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BarChart2 className="w-4 h-4" /> Riwayat Aktivitas
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'overview' ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Kategori</h4>
                    <p className="text-slate-800 font-medium">{kategori?.nama || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stok Minimum</h4>
                    <p className="text-slate-800 font-medium">10 unit <span className="text-xs font-normal text-slate-500 ml-2">(Sistem akan memberi peringatan jika stok di bawah batas ini)</span></p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Deskripsi Lengkap</h4>
                    {itemData.deskripsi ? (
                      <div 
                        className="text-slate-600 text-sm leading-relaxed html-desc"
                        dangerouslySetInnerHTML={{ __html: itemData.deskripsi }}
                      />
                    ) : (
                      <p className="text-slate-600 text-sm leading-relaxed">Tidak ada deskripsi.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {itemData?.riwayatScan && itemData.riwayatScan.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {itemData.riwayatScan.map((log: any, idx: number) => (
                        <div key={idx} className="py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.jenis === 'MASUK' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                              {log.jenis === 'MASUK' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {log.jenis === 'MASUK' ? 'Stok Masuk' : 'Stok Keluar'} <span className={log.jenis === 'MASUK' ? 'text-emerald-600' : 'text-orange-600'}>{log.jenis === 'MASUK' ? '+' : '-'}{log.jumlah}</span>
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">{log.catatan || 'Tanpa catatan'}</p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-400 font-medium">
                            {new Date(log.dibuatPada).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                      <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">Belum ada riwayat pergerakan barang.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adjust Stock */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-100 shadow-xl overflow-hidden">
            <div className={`p-6 text-white ${adjustType === 'in' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
              <h2 className="text-lg font-bold">Penyesuaian Stok {adjustType === 'in' ? 'Masuk' : 'Keluar'}</h2>
              <p className="text-sm opacity-90 mt-1">Stok saat ini: {jumlah}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jumlah</label>
                <input 
                  type="number" 
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan (Opsional)</label>
                <textarea 
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Misal: Barang retur, stok opname..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAdjustStock}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-colors ${adjustType === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Edit Barang</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Barang</label>
                  <input required type="text" value={editForm.nama} onChange={e => setEditForm({...editForm, nama: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">SKU (Kode)</label>
                  <input required type="text" value={editForm.sku} onChange={e => setEditForm({...editForm, sku: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori</label>
                  <select value={editForm.kategoriId} onChange={e => setEditForm({...editForm, kategoriId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lokasi Gudang (Rak)</label>
                  <select value={editForm.lokasiGudangId} onChange={e => setEditForm({...editForm, lokasiGudangId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="">-- Kosongkan / Belum Ada --</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.nama} ({l.zona})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Foto Barang</label>
                <div className="flex items-center gap-4">
                  {fotoPreview ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                      <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => { setFoto(null); setFotoPreview(null); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <span className="text-xl text-slate-400">+</span>
                      <span className="text-[10px] text-slate-500 mt-1">Upload</span>
                      <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi</label>
                <textarea rows={3} value={editForm.deskripsi} onChange={e => setEditForm({...editForm, deskripsi: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="flex gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isSaving} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-colors bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50">
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      axios.delete(`http://localhost:3000/barang/${id}`)
        .then(() => navigate('/inventory'))
        .catch(() => alert('Gagal menghapus item.'));
    }
  };

  const handleAdjustStock = () => {
    if (adjustAmount <= 0) return;
    const newStock = adjustType === 'in' ? itemData.jumlah + adjustAmount : itemData.jumlah - adjustAmount;
    
    if (newStock < 0) {
      alert('Stok tidak boleh negatif!');
      return;
    }

    axios.patch(`http://localhost:3000/barang/${id}`, { jumlah: newStock })
      .then(() => {
        setIsAdjustModalOpen(false);
        setAdjustAmount(1);
        setAdjustNotes('');
        fetchItem(); // refresh data
      })
      .catch(() => alert('Gagal menyesuaikan stok.'));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat detail barang...</div>;
  }

  if (!itemData) {
    return <div className="p-8 text-center text-red-500">Barang tidak ditemukan.</div>;
  }

  const { nama, sku, jumlah, lokasiGudang, kategori, deskripsi } = itemData;

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
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
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
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${jumlah > 10 ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
              <Package className="w-10 h-10" />
            </div>
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
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {deskripsi || 'Tidak ada deskripsi.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">Belum ada riwayat pergerakan barang.</p>
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
                  className={`flex-1 py-2.5 text-white rounded-lg text-sm font-bold shadow-sm transition-colors ${adjustType === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

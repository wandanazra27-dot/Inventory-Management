import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Box, MapPin, Search } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalBarang: 0,
    totalLokasi: 0,
    totalPencarianHariIni: 0,
    totalScanAI: 0,
    topPencarian: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/dashboard/metrics')
      .then(res => {
        setMetrics(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching metrics', err);
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: 'Total Barang', value: metrics.totalBarang, icon: <Box className="w-5 h-5 text-blue-500" /> },
    { label: 'Total Lokasi Rak', value: metrics.totalLokasi, icon: <MapPin className="w-5 h-5 text-orange-500" /> },
    { label: 'Pencarian Hari Ini', value: metrics.totalPencarianHariIni, icon: <Search className="w-5 h-5 text-indigo-500" /> },
    { label: 'Total Scan AI', value: metrics.totalScanAI, icon: <Activity className="w-5 h-5 text-emerald-500" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview Dashboard</h1>
        <p className="text-muted-foreground mt-1">Pantau pergerakan inventory dan log aktivitas secara real-time.</p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-slate-900 bg-white shadow-sm p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                    {stat.icon}
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800">{stat.value}</h2>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 rounded-xl border border-slate-900 bg-white shadow-sm p-6 min-h-75 flex flex-col">
              <h3 className="font-semibold mb-4">Aktivitas Inventory Mingguan</h3>
              <div className="flex-1 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 bg-slate-50">
                [ Area Grafik Bar Chart ]
              </div>
            </div>
            
            <div className="col-span-1 rounded-xl border border-slate-900 bg-white shadow-sm p-6">
              <h3 className="font-semibold mb-4 text-slate-800">Pencarian Teratas</h3>
              {metrics.topPencarian && metrics.topPencarian.length > 0 ? (
                <ul className="space-y-4">
                  {metrics.topPencarian.map((item: any, i: number) => (
                    <li key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="font-medium text-sm">{item.kataKunci}</span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {item._count.id}x
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada riwayat pencarian.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

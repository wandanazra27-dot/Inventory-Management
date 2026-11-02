import { useState, useEffect } from 'react';
import axios from 'axios';

interface WarehouseMapProps {
  highlightedLocation?: string | null;
}

const ZONE_COLORS: Record<string, any> = {
  'Rak 1': { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-600', boxBorder: 'border-sky-200' },
  'Rak 2': { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-500', boxBorder: 'border-orange-200' },
  'Rak 3': { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-500', boxBorder: 'border-purple-200' },
  'Rak 4': { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-600', boxBorder: 'border-slate-300' },
};

const DEFAULT_COLOR = { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', boxBorder: 'border-emerald-200' };

export default function WarehouseMap({ highlightedLocation }: WarehouseMapProps) {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/lokasi-gudang')
      .then(res => {
        setLocations(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Helper to determine box classes
  const getBoxClasses = (loc: string, defaultBorder: string) => {
    if (loc === highlightedLocation) {
      return "bg-emerald-500 rounded border-2 border-emerald-400 flex items-center justify-center text-[10px] tracking-tighter font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse scale-110 z-10 relative transition-all duration-300 min-h-8 py-1.5 px-0 whitespace-nowrap overflow-hidden";
    }
    return `bg-white rounded border ${defaultBorder} flex items-center justify-center text-[9px] tracking-tighter font-bold text-slate-700 shadow-sm transition-all duration-300 min-h-8 py-1.5 px-0 hover:bg-slate-50 whitespace-nowrap overflow-hidden`;
  };

  // Group locations by zona
  const groupedLocations = locations.reduce((acc, loc) => {
    const zone = loc.zona || 'Unassigned';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(loc);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort locations inside each zone logically by baris (ascending) and keranjang (ascending)
  Object.keys(groupedLocations).forEach(zone => {
    groupedLocations[zone].sort((a: any, b: any) => {
      const barisA = a.baris || 1;
      const barisB = b.baris || 1;
      if (barisA !== barisB) {
        return barisA - barisB; // Ascending: baris 1 (top left)
      }
      const numA = parseInt(a.keranjang) || 0;
      const numB = parseInt(b.keranjang) || 0;
      if (numA !== numB) {
        return numA - numB; // Ascending: left to right (1, 2, 3...)
      }
      return a.nama.localeCompare(b.nama, undefined, { numeric: true });
    });
  });

  if (loading) {
    return (
      <div className="w-full h-full bg-white rounded-xl border p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-xl border p-6 flex flex-col overflow-hidden shadow-sm">
      <h3 className="font-semibold text-sm mb-4 text-slate-800 shrink-0">Peta Gudang (Live)</h3>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          {Object.keys(groupedLocations).length === 0 ? (
            <div className="col-span-2 text-center py-10 text-slate-400 text-sm">
              Belum ada data rak di database.
            </div>
          ) : (
            Object.keys(groupedLocations).map((zone) => {
              const color = ZONE_COLORS[zone] || DEFAULT_COLOR;
              
              return (
                <div key={zone} className={`${color.bg} rounded-xl p-4 border-2 ${color.border} flex flex-col transition-colors h-full`}>
                  <h4 className={`text-center font-semibold ${color.text} mb-3 flex items-center justify-center gap-2`}>
                    {zone}
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border opacity-70">
                      {groupedLocations[zone].length} Slot
                    </span>
                  </h4>
                  
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {groupedLocations[zone].length === 0 && (
                      <div className="col-span-4 text-[10px] text-slate-400 italic text-center py-4">Kosong</div>
                    )}
                    {groupedLocations[zone].map((loc: any) => (
                      <div 
                        key={loc.id} 
                        className={getBoxClasses(loc.nama, color.boxBorder)} 
                        title={`Rak: ${loc.rak || '-'}, Baris: ${loc.baris || '-'}, Keranjang: ${loc.keranjang || '-'}`}
                      >
                        {loc.nama}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Sinkronisasi DB
        </span>
        <span>Gudang</span>
      </div>
    </div>
  );
}

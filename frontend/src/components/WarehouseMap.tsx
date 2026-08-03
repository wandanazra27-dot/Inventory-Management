export default function WarehouseMap() {
  return (
    <div className="w-full h-full bg-white rounded-xl border p-6 flex flex-col">
      <h3 className="font-semibold text-sm mb-6 text-slate-800">Peta Gudang</h3>
      
      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Zone A - Blue */}
        <div className="bg-sky-50 rounded-xl p-4 border-2 border-sky-100 flex flex-col">
          <h4 className="text-center font-semibold text-sky-600 mb-3">Zone A</h4>
          <div className="flex-1 grid grid-cols-2 gap-2">
            {['A1', 'A2', 'A3', 'A4'].map(loc => (
              <div key={loc} className="bg-white rounded border border-sky-200 flex items-center justify-center text-sm font-medium text-slate-600 shadow-sm">
                {loc}
              </div>
            ))}
          </div>
        </div>

        {/* Zone B - Orange */}
        <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-100 flex flex-col">
          <h4 className="text-center font-semibold text-orange-500 mb-3">Zone B</h4>
          <div className="flex-1 grid grid-cols-2 gap-2">
            {['B1', 'B2', 'B3', 'B4'].map(loc => (
              <div key={loc} className="bg-white rounded border border-orange-200 flex items-center justify-center text-sm font-medium text-slate-600 shadow-sm">
                {loc}
              </div>
            ))}
          </div>
        </div>

        {/* Zone C - Purple */}
        <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100 flex flex-col">
          <h4 className="text-center font-semibold text-purple-500 mb-3">Zone C</h4>
          <div className="flex-1 grid grid-cols-2 gap-2">
            {['C1', 'C2', 'C3', 'C4'].map(loc => (
              <div key={loc} className="bg-white rounded border border-purple-200 flex items-center justify-center text-sm font-medium text-slate-600 shadow-sm">
                {loc}
              </div>
            ))}
          </div>
        </div>

        {/* Zone D - Gray */}
        <div className="bg-slate-100 rounded-xl p-4 border-2 border-slate-200 flex flex-col">
          <h4 className="text-center font-semibold text-slate-600 mb-3">Zone D</h4>
          <div className="flex-1 grid grid-cols-2 gap-2">
            {['D1', 'D2', 'D3', 'D4'].map(loc => (
              <div key={loc} className="bg-white rounded border border-slate-300 flex items-center justify-center text-sm font-medium text-slate-600 shadow-sm">
                {loc}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
        <span>Warehouse Floor Plan</span>
        <span>KaryaGudang</span>
      </div>
    </div>
  );
}

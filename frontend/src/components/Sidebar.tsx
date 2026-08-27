import { Link, useLocation } from 'react-router-dom';
import { Package, Search, Hexagon, BarChart2, Map } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart2 className="w-4.5 h-4.5" /> },
    { name: 'Search & Locate', path: '/search-locate', icon: <Search className="w-4.5 h-4.5" /> },
    { name: 'Inventory', path: '/inventory', icon: <Package className="w-4.5 h-4.5" /> },
    { name: 'Manage Warehouse', path: '/manage-warehouse', icon: <Map className="w-4.5 h-4.5" /> },
    { name: 'Reports & Logs', path: '/reports', icon: <BarChart2 className="w-4.5 h-4.5" /> },
  ];

  return (
    <aside className="w-65 bg-slate-950 flex flex-col h-screen sticky top-0 shrink-0 text-slate-300 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3.5 relative overflow-hidden shrink-0">
        {/* Subtle glow effect behind logo */}
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-emerald-500/10 to-transparent pointer-events-none"></div>

        <div className="bg-linear-to-br from-emerald-400 to-emerald-600 p-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center relative z-10 border border-emerald-400/30">
          <Hexagon className="w-6 h-6 text-white fill-white/20" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-slate-300 tracking-tight leading-none mb-1">
            MIS
          </h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            Management Inventory System
          </p>
        </div>
      </div>

      <nav className="px-4 py-2 flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-2">
          Menu Utama
        </div>
        
        {menuItems.map((item) => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.includes(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                group flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative
                ${isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }
              `}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              )}
              
              <div className={`transition-transform duration-300 ${!isActive && 'group-hover:scale-110 group-hover:text-emerald-400'}`}>
                {item.icon}
              </div>
              <span className="tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
    </aside>
  );
}

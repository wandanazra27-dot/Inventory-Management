import { Link, useLocation } from 'react-router-dom';
import { Package, Search, Hexagon, BarChart2, Map } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: 'Search & Locate', path: '/search-locate', icon: <Search className="w-5 h-5" /> },
    { name: 'Inventory', path: '/inventory', icon: <Package className="w-5 h-5" /> },
    { name: 'Manage Warehouse', path: '/manage-warehouse', icon: <Map className="w-5 h-5" /> },
    { name: 'Scan Visual', path: '/scan-visual', icon: <Hexagon className="w-5 h-5" /> },
    { name: 'Reports & Logs', path: '/reports', icon: <BarChart2 className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-screen sticky top-0 shrink-0 text-slate-300">
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3.5 relative overflow-hidden">
        {/* Subtle glow effect behind logo */}
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-emerald-500/10 to-transparent pointer-events-none"></div>

        <div className="bg-linear-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/50 flex items-center justify-center relative z-10 border border-emerald-400/20">
          <Hexagon className="w-6 h-6 text-white fill-white/20" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-white to-slate-300 tracking-tight leading-none mb-1">
            MIS
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            Management Inventory System
          </p>
        </div>
      </div>

      <nav className="p-3 flex-1 flex flex-col gap-1 overflow-y-auto mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

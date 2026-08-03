import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Layout — Responsive page wrapper with mobile hamburger navbar
 * and main content container with zero layout overlap.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import ChatbotWidget from './ChatbotWidget';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Mobile Header Bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            <Ticket className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-slate-100">PrismBerry Desk</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Sidebar Navigation */}
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-72 transition-all">
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Chatbot Widget for Clients */}
      <ChatbotWidget />
    </div>
  );
}

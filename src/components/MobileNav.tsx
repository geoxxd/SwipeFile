import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FolderArchive,
  Settings,
  Plus,
  Zap
} from 'lucide-react';

interface MobileNavProps {
  appName: string;
  currentView: 'dashboard' | 'library' | 'collections' | 'settings' | 'offer-detail' | 'offer-form';
  onNavigate: (view: 'dashboard' | 'library' | 'collections' | 'settings') => void;
  onOpenQuickAdd: () => void;
  onOpenFullAdd: () => void;
}

export function MobileNav({
  appName,
  currentView,
  onNavigate,
  onOpenQuickAdd,
  onOpenFullAdd
}: MobileNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'library', label: 'Ofertas', icon: Layers },
    { id: 'collections', label: 'Coleções', icon: FolderArchive },
    { id: 'settings', label: 'Ajustes', icon: Settings }
  ] as const;

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#111411]/95 backdrop-blur-md border-b border-[#1F2A1F]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22C55E] to-[#15803D] flex items-center justify-center text-black font-black text-sm">
            S
          </div>
          <span className="font-bold text-base text-white tracking-wide">
            {appName || 'SWIPE'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickAdd}
            className="p-2 text-[#22C55E] bg-[#182018] rounded-lg border border-[#22C55E]/30"
            title="Cadastro Rápido"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Action Button (FAB) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
        <button
          onClick={onOpenFullAdd}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#22C55E] text-black font-bold text-sm shadow-2xl shadow-green-950/80 green-glow active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Nova Oferta</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#111411]/95 backdrop-blur-md border-t border-[#1F2A1F] flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-[#22C55E]' : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

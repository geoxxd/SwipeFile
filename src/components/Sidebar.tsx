import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FolderArchive,
  Settings,
  Plus,
  Zap
} from 'lucide-react';

interface SidebarProps {
  appName: string;
  currentView: 'dashboard' | 'library' | 'collections' | 'settings' | 'offer-detail' | 'offer-form';
  onNavigate: (view: 'dashboard' | 'library' | 'collections' | 'settings') => void;
  onOpenQuickAdd: () => void;
  onOpenFullAdd: () => void;
}

export function Sidebar({
  appName,
  currentView,
  onNavigate,
  onOpenQuickAdd,
  onOpenFullAdd
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Biblioteca', icon: Layers },
    { id: 'collections', label: 'Coleções', icon: FolderArchive },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ] as const;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#000000] border-r border-[#191C19] h-screen sticky top-0 p-4 shrink-0 z-20">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 mb-6 pt-1">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00A63E] to-[#007A2E] flex items-center justify-center text-black font-black text-lg tracking-wider shadow-lg shadow-[#00A63E]/20 group-hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              {appName || 'SWIPE'}
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#0D1A0D] text-[#00A63E] border border-[#00A63E]/40 font-semibold">
                PRO
              </span>
            </span>
            <span className="text-[11px] text-[#9CA3AF] block leading-none mt-0.5">
              Swipe File de Ofertas
            </span>
          </div>
        </button>
      </div>

      {/* Action Buttons: Quick Add & Full Add */}
      <div className="flex flex-col gap-2 mb-6">
        <button
          onClick={onOpenFullAdd}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#00A63E] hover:bg-[#00C84B] text-black font-bold text-sm transition-all shadow-lg shadow-[#00A63E]/25 green-glow-sm hover:translate-y-[-1px]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Oferta</span>
        </button>
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-[#071207] hover:bg-[#0C1F0C] text-[#00A63E] border border-[#00A63E]/30 text-xs font-semibold transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-[#00A63E]" />
          <span>Cadastro Rápido (3 campos)</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-[#091F0E] text-[#00A63E] font-semibold border border-[#00A63E]/40 shadow-sm'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#0E100E]'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-[#00A63E]' : 'text-[#9CA3AF]'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="pt-4 border-t border-[#191C19] flex flex-col gap-2">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#070807] border border-[#191C19]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00A63E] animate-pulse shrink-0" />
          <div className="truncate">
            <p className="text-xs font-medium text-[#F3F4F6] truncate">Workspace Ativo</p>
            <p className="text-[10px] text-[#6B7280] font-mono truncate">Acesso Livre & Direto</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

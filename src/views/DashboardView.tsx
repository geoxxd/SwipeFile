import React from 'react';
import {
  TrendingUp,
  Layers,
  Sparkles,
  Users,
  FolderArchive,
  Star,
  ArrowRight,
  ExternalLink,
  Flame,
  Clock,
  Play
} from 'lucide-react';
import { Offer } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { CreativeMediaPreview } from '../components/CreativeMediaPreview.tsx';

interface DashboardViewProps {
  offers: Offer[];
  stats: {
    totalOffers: number;
    statusCounts: Record<string, number>;
    totalCreatives: number;
    totalCompetitors: number;
    totalCollections: number;
  } | null;
  onSelectOffer: (offerId: string) => void;
  onNavigateToLibrary: (filter?: Record<string, any>) => void;
  isOwner: boolean;
}

export function DashboardView({
  offers,
  stats,
  onSelectOffer,
  onNavigateToLibrary,
  isOwner
}: DashboardViewProps) {
  // Top active ads offers
  const topActiveAds = [...offers]
    .filter((o) => (o.activeAdsCurrent || 0) > 0)
    .sort((a, b) => (b.activeAdsCurrent || 0) - (a.activeAdsCurrent || 0))
    .slice(0, 4);

  // Favorites
  const favorites = offers.filter((o) => o.isFavorite).slice(0, 4);

  // Recent
  const recentOffers = [...offers].slice(0, 6);

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#111411] via-[#141A14] to-[#111411] border border-[#1F2A1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Visão Geral do Swipe File</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 font-mono">
              PRO
            </span>
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1 max-w-xl leading-relaxed">
            Painel de inteligência de ofertas validadas, ganchos de alta conversão, funis e criativos de marketing digital.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Offers */}
        <div
          onClick={() => onNavigateToLibrary()}
          className="cursor-pointer p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] hover:border-[#22C55E]/40 transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Ofertas</span>
            <Layers className="w-4 h-4 text-[#22C55E] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white font-mono-num mb-2">
            {stats?.totalOffers ?? offers.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <span className="text-[#22C55E] font-medium font-mono-num">
              {stats?.statusCounts?.escalando ?? 0}
            </span>{' '}
            escalando agora
          </div>
        </div>

        {/* Validated / Scaling */}
        <div
          onClick={() => onNavigateToLibrary({ status: 'validada' })}
          className="cursor-pointer p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] hover:border-[#22C55E]/40 transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Validadas & Escalando</span>
            <Flame className="w-4 h-4 text-[#84CC16] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white font-mono-num mb-2">
            {(stats?.statusCounts?.validada || 0) + (stats?.statusCounts?.escalando || 0)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <span className="text-[#EAB308] font-medium font-mono-num">
              {stats?.statusCounts?.em_teste ?? 0}
            </span>{' '}
            em fase de teste
          </div>
        </div>

        {/* Total Creatives */}
        <div
          onClick={() => onNavigateToLibrary()}
          className="cursor-pointer p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] hover:border-[#22C55E]/40 transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Criativos Salvos</span>
            <Sparkles className="w-4 h-4 text-[#3B82F6] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white font-mono-num mb-2">
            {stats?.totalCreatives ?? 0}
          </div>
          <div className="text-xs text-[#9CA3AF]">Vídeos, UGCs e prints gravados</div>
        </div>

        {/* Competitors Mapped */}
        <div
          onClick={() => onNavigateToLibrary()}
          className="cursor-pointer p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] hover:border-[#22C55E]/40 transition-all hover:translate-y-[-2px] group"
        >
          <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Concorrentes</span>
            <Users className="w-4 h-4 text-[#A855F7] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white font-mono-num mb-2">
            {stats?.totalCompetitors ?? 0}
          </div>
          <div className="text-xs text-[#9CA3AF]">Modeladores sob monitoramento</div>
        </div>
      </div>

      {/* Status Breakdown Bar */}
      <div className="p-4 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
          Distribuição por Status:
        </span>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            onClick={() => onNavigateToLibrary({ status: 'escalando' })}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#84CC16]/10 text-[#84CC16] border border-[#84CC16]/20 text-xs font-medium hover:bg-[#84CC16]/20 transition-colors"
          >
            <span>Escalando:</span>
            <span className="font-mono-num font-bold">{stats?.statusCounts?.escalando || 0}</span>
          </button>
          <button
            onClick={() => onNavigateToLibrary({ status: 'validada' })}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-xs font-medium hover:bg-[#22C55E]/20 transition-colors"
          >
            <span>Validadas:</span>
            <span className="font-mono-num font-bold">{stats?.statusCounts?.validada || 0}</span>
          </button>
          <button
            onClick={() => onNavigateToLibrary({ status: 'em_teste' })}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20 text-xs font-medium hover:bg-[#EAB308]/20 transition-colors"
          >
            <span>Em teste:</span>
            <span className="font-mono-num font-bold">{stats?.statusCounts?.em_teste || 0}</span>
          </button>
          <button
            onClick={() => onNavigateToLibrary({ status: 'pausada' })}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#374151]/30 text-[#9CA3AF] border border-[#4B5563]/20 text-xs font-medium hover:bg-[#374151]/50 transition-colors"
          >
            <span>Pausadas:</span>
            <span className="font-mono-num font-bold">{stats?.statusCounts?.pausada || 0}</span>
          </button>
          <button
            onClick={() => onNavigateToLibrary({ status: 'morta' })}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 text-xs font-medium hover:bg-[#EF4444]/20 transition-colors"
          >
            <span>Mortas:</span>
            <span className="font-mono-num font-bold">{stats?.statusCounts?.morta || 0}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Top Scaling + Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Scaling (Mais anúncios ativos) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#22C55E]" />
              <span>Ofertas com Mais Anúncios Ativos</span>
            </h2>
            <button
              onClick={() => onNavigateToLibrary({ sortBy: 'active_ads' })}
              className="text-xs text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1 font-medium transition-colors"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {topActiveAds.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#111411] border border-[#1F2A1F] text-center text-sm text-[#6B7280]">
                Nenhuma oferta com registro de validação ativa.
              </div>
            ) : (
              topActiveAds.map((offer) => {
                return (
                  <div
                    key={offer.id}
                    onClick={() => onSelectOffer(offer.id)}
                    className="cursor-pointer p-4 rounded-2xl bg-[#111411] border border-[#1F2A1F] hover:border-[#22C55E]/40 transition-all hover:translate-x-1 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] overflow-hidden shrink-0 flex items-center justify-center relative">
                        <CreativeMediaPreview creative={offer.creatives?.[0]} showPlayBadge={false} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={offer.status} size="sm" />
                          <span className="text-xs text-[#9CA3AF] truncate">{offer.niche}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-[#22C55E] transition-colors truncate">
                          {offer.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[#9CA3AF] mt-1">
                          <span className="flex items-center gap-1 font-mono-num text-[#22C55E] font-semibold">
                            <Flame className="w-3.5 h-3.5 fill-[#22C55E]" />
                            {offer.activeAdsCurrent || 0} anúncios ativos
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono-num text-[#9CA3AF]">
                            <Clock className="w-3.5 h-3.5" />
                            {offer.daysRunning || 0} dias ativa
                          </span>
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#22C55E] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Favorites */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-[#EAB308] fill-[#EAB308]" />
              <span>Ofertas Favoritas</span>
            </h2>
            <button
              onClick={() => onNavigateToLibrary({ isFavorite: true })}
              className="text-xs text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1 font-medium transition-colors"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {favorites.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#111411] border border-[#1F2A1F] text-center text-sm text-[#6B7280]">
                Nenhuma oferta favoritada ainda. Clique na estrela nas ofertas para fixar aqui.
              </div>
            ) : (
              favorites.map((offer) => (
                <div
                  key={offer.id}
                  onClick={() => onSelectOffer(offer.id)}
                  className="cursor-pointer p-4 rounded-2xl bg-[#111411] border border-[#1F2A1F] hover:border-[#22C55E]/40 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={offer.status} size="sm" />
                      <span className="text-[11px] text-[#9CA3AF] truncate">{offer.niche}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-[#22C55E] transition-colors truncate">
                      {offer.name}
                    </h4>
                    {offer.headline && (
                      <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-1 italic">
                        "{offer.headline}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 text-[#EAB308]">
                    {Array.from({ length: offer.potentialRating || 3 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#EAB308]" />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Recent Additions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#22C55E]" />
            <span>Adicionadas Recentemente</span>
          </h2>
          <button
            onClick={() => onNavigateToLibrary()}
            className="text-xs text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1 font-medium transition-colors"
          >
            Abrir Biblioteca Completa <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentOffers.map((offer) => {
            const cover = offer.creatives?.[0]?.fileUrl;
            return (
              <div
                key={offer.id}
                onClick={() => onSelectOffer(offer.id)}
                className="cursor-pointer p-4 rounded-2xl bg-[#111411] border border-[#1F2A1F] hover:border-[#22C55E]/40 transition-all hover:translate-y-[-2px] flex flex-col justify-between group"
              >
                <div>
                  <div className="w-full h-36 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] overflow-hidden mb-3 relative flex items-center justify-center">
                    <CreativeMediaPreview creative={offer.creatives?.[0]} />
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <StatusBadge status={offer.status} size="sm" />
                    </div>
                    {offer.isFavorite && (
                      <div className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/60 backdrop-blur-sm z-10">
                        <Star className="w-3.5 h-3.5 text-[#EAB308] fill-[#EAB308]" />
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] text-[#22C55E] font-medium tracking-wide block mb-1">
                    {offer.niche}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#22C55E] transition-colors line-clamp-1 mb-1">
                    {offer.name}
                  </h3>
                  {offer.hook && (
                    <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed mb-3">
                      "{offer.hook}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1F2A1F] flex items-center justify-between text-xs text-[#9CA3AF]">
                  <span className="font-mono-num text-[#22C55E] font-medium">
                    {offer.activeAdsCurrent || 0} anúncios
                  </span>
                  <span className="font-mono-num">
                    {new Date(offer.addedDate || offer.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

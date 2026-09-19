import React, { useState, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  X,
  Star,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Clock,
  Layers,
  Play,
  Share2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Offer, AppSettings, TrafficChannel, OfferStatus, OfferType, FunnelType } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { CreativeMediaPreview } from '../components/CreativeMediaPreview.tsx';
import { useToast } from '../components/Toast.tsx';

interface LibraryViewProps {
  offers: Offer[];
  settings: AppSettings;
  onSelectOffer: (offerId: string) => void;
  onToggleFavorite: (offerId: string) => void;
  initialFilters?: Record<string, any>;
  isOwner: boolean;
  onCopyShareLink: (offerId: string) => void;
}

export function LibraryView({
  offers,
  settings,
  onSelectOffer,
  onToggleFavorite,
  initialFilters,
  isOwner,
  onCopyShareLink
}: LibraryViewProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>(initialFilters?.niche || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilters?.status || 'all');
  const [selectedOfferType, setSelectedOfferType] = useState<string>('all');
  const [selectedFunnelType, setSelectedFunnelType] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(!!initialFilters?.isFavorite);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'active_ads' | 'name'>(
    initialFilters?.sortBy || 'recent'
  );
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Channels helper
  const channelLabels: Record<TrafficChannel, string> = {
    facebook_instagram: 'Meta Ads',
    tiktok: 'TikTok Ads',
    youtube: 'YouTube Ads',
    google: 'Google Ads',
    native: 'Native / Taboola',
    outros: 'Outros'
  };

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onCopyShareLink(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFavoriteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isOwner) return;
    onToggleFavorite(id);
  };

  // Filter & Sort
  const filteredOffers = useMemo(() => {
    return offers
      .filter((o) => {
        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = o.name?.toLowerCase().includes(q);
          const matchHook = o.hook?.toLowerCase().includes(q);
          const matchHeadline = o.headline?.toLowerCase().includes(q);
          const matchNiche = o.niche?.toLowerCase().includes(q);
          const matchTags = o.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchHook && !matchHeadline && !matchNiche && !matchTags) {
            return false;
          }
        }

        // Dropdowns
        if (selectedNiche !== 'all' && o.niche !== selectedNiche) return false;
        if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
        if (selectedOfferType !== 'all' && o.offerType !== selectedOfferType) return false;
        if (selectedFunnelType !== 'all' && o.funnelType !== selectedFunnelType) return false;
        if (selectedChannel !== 'all' && !o.trafficChannels?.includes(selectedChannel as any)) return false;
        if (selectedTag !== 'all' && !o.tags?.includes(selectedTag)) return false;
        if (onlyFavorites && !o.isFavorite) return false;
        if (minRating > 0 && (o.potentialRating || 0) < minRating) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return (b.potentialRating || 0) - (a.potentialRating || 0);
        }
        if (sortBy === 'active_ads') {
          return (b.activeAdsCurrent || 0) - (a.activeAdsCurrent || 0);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        // recent
        return new Date(b.addedDate || b.createdAt).getTime() - new Date(a.addedDate || a.createdAt).getTime();
      });
  }, [
    offers,
    search,
    selectedNiche,
    selectedStatus,
    selectedOfferType,
    selectedFunnelType,
    selectedChannel,
    selectedTag,
    onlyFavorites,
    minRating,
    sortBy
  ]);

  const hasActiveFilters =
    search !== '' ||
    selectedNiche !== 'all' ||
    selectedStatus !== 'all' ||
    selectedOfferType !== 'all' ||
    selectedFunnelType !== 'all' ||
    selectedChannel !== 'all' ||
    selectedTag !== 'all' ||
    onlyFavorites ||
    minRating > 0;

  const resetFilters = () => {
    setSearch('');
    setSelectedNiche('all');
    setSelectedStatus('all');
    setSelectedOfferType('all');
    setSelectedFunnelType('all');
    setSelectedChannel('all');
    setSelectedTag('all');
    setOnlyFavorites(false);
    setMinRating(0);
  };

  // Collect all available tags across offers
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    offers.forEach((o) => o.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [offers]);

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Biblioteca de Ofertas</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1F2A1F] text-[#22C55E] font-mono-num font-semibold">
                {filteredOffers.length} {filteredOffers.length === 1 ? 'oferta' : 'ofertas'}
              </span>
            </h1>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Explore o swipe file pessoal de marketing digital com filtros combinados.
            </p>
          </div>

          {/* View Toggle & Sort */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none px-3 py-2 pr-8 text-xs font-medium rounded-xl bg-[#111411] border border-[#1F2A1F] text-[#E5E7EB] hover:border-[#22C55E]/40 focus:outline-none cursor-pointer"
              >
                <option value="recent">Mais Recentes</option>
                <option value="active_ads">Mais Anúncios Ativos</option>
                <option value="rating">Maior Nota (Potencial)</option>
                <option value="name">Nome (A - Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Grid / Table switch */}
            <div className="flex items-center bg-[#111411] border border-[#1F2A1F] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#1F2A1F] text-[#22C55E]'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[#1F2A1F] text-[#22C55E]'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
                title="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className={`md:hidden flex items-center gap-1 px-3 py-2 rounded-xl text-xs border ${
                hasActiveFilters
                  ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                  : 'bg-[#111411] text-[#9CA3AF] border-[#1F2A1F]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Search input with icons */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por nome, nicho, gancho, headline, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#111411] border border-[#1F2A1F] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-1 text-[#9CA3AF] hover:text-white absolute right-3 top-2.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Bar (Desktop & Responsive Mobile) */}
        <div
          className={`${
            showFiltersMobile ? 'flex' : 'hidden md:flex'
          } flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-[#111411] border border-[#1F2A1F] text-xs`}
        >
          {/* Nicho */}
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] text-[#D1D5DB] focus:border-[#22C55E] focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Nichos</option>
            {settings.niches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] text-[#D1D5DB] focus:border-[#22C55E] focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="validada">Validada</option>
            <option value="escalando">Escalando</option>
            <option value="em_teste">Em teste</option>
            <option value="pausada">Pausada</option>
            <option value="morta">Morta</option>
          </select>

          {/* Tipo de Oferta */}
          <select
            value={selectedOfferType}
            onChange={(e) => setSelectedOfferType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] text-[#D1D5DB] focus:border-[#22C55E] focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Tipos de Oferta</option>
            {settings.offerTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Tipo de Funil */}
          <select
            value={selectedFunnelType}
            onChange={(e) => setSelectedFunnelType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] text-[#D1D5DB] focus:border-[#22C55E] focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Funis</option>
            {settings.funnelTypes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Canal de Tráfego */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] text-[#D1D5DB] focus:border-[#22C55E] focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Canais</option>
            {settings.trafficChannels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Tags */}
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] text-[#D1D5DB] focus:border-[#22C55E] focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          )}

          {/* Favoritas Toggle */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${
              onlyFavorites
                ? 'bg-[#EAB308]/15 border-[#EAB308]/40 text-[#EAB308] font-medium'
                : 'bg-[#0A0D0A] border-[#1F2A1F] text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-[#EAB308]' : ''}`} />
            <span>Favoritas</span>
          </button>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto flex items-center gap-1 text-xs text-[#EF4444] hover:underline transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Results Container: Grid vs Table */}
      {filteredOffers.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111411] border border-[#1F2A1F] text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1A221A] text-[#22C55E] flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Nenhuma oferta encontrada</h3>
          <p className="text-xs text-[#9CA3AF] max-w-sm">
            Nenhuma oferta corresponde aos termos ou filtros selecionados. Tente ajustar os parâmetros.
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#22C55E] text-black hover:bg-[#4ADE80] transition-colors"
            >
              Redefinir Filtros
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => {
            const firstCreative = offer.creatives?.[0];

            return (
              <div
                key={offer.id}
                onClick={() => onSelectOffer(offer.id)}
                className="cursor-pointer rounded-2xl bg-[#111411] border border-[#1F2A1F] hover:border-[#22C55E]/40 hover:shadow-xl hover:shadow-green-950/20 transition-all hover:translate-y-[-2px] flex flex-col overflow-hidden group relative"
              >
                {/* Media Thumbnail */}
                <div className="w-full h-44 bg-[#080A08] relative overflow-hidden flex items-center justify-center border-b border-[#1F2A1F]">
                  <CreativeMediaPreview creative={firstCreative} />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={offer.status} size="sm" />
                  </div>

                  {/* Top Right Actions: Favorite & Share */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleCopyLink(e, offer.id)}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-black text-[#9CA3AF] hover:text-[#22C55E] backdrop-blur-sm transition-colors"
                      title="Copiar Link Somente Leitura"
                    >
                      {copiedId === offer.id ? (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {isOwner && (
                      <button
                        onClick={(e) => handleFavoriteClick(e, offer.id)}
                        className={`p-1.5 rounded-full bg-black/60 hover:bg-black backdrop-blur-sm transition-colors ${
                          offer.isFavorite ? 'text-[#EAB308]' : 'text-[#9CA3AF] hover:text-[#EAB308]'
                        }`}
                        title="Favoritar"
                      >
                        <Star className={`w-3.5 h-3.5 ${offer.isFavorite ? 'fill-[#EAB308]' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Bottom Image Overlay: Active Ads count */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 text-[#22C55E] text-[11px] font-mono-num font-semibold border border-[#22C55E]/30 flex items-center gap-1 backdrop-blur-sm">
                      <Flame className="w-3 h-3 fill-[#22C55E]" />
                      {offer.activeAdsCurrent || 0} ads ativos
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/80 text-[#E5E7EB] text-[10px] font-mono-num border border-white/10 backdrop-blur-sm">
                      {offer.daysRunning || 0} dias ativa
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Niche & Country */}
                    <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] mb-1">
                      <span className="text-[#22C55E] font-medium">{offer.niche}</span>
                      <span className="text-[#6B7280]">{offer.country}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white group-hover:text-[#22C55E] transition-colors line-clamp-1 mb-1.5">
                      {offer.name}
                    </h3>

                    {/* Headline or Hook */}
                    {offer.headline ? (
                      <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed mb-3 italic">
                        "{offer.headline}"
                      </p>
                    ) : offer.hook ? (
                      <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed mb-3">
                        {offer.hook}
                      </p>
                    ) : (
                      <div className="h-4 mb-3" />
                    )}

                    {/* Funnel & Ticket */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#182018] text-[#A3E635] border border-[#A3E635]/20 uppercase font-medium">
                        Funil: {offer.funnelType}
                      </span>
                      {offer.ticketPrice && (
                        <span className="px-2 py-0.5 text-[10px] rounded bg-[#1A221A] text-[#E5E7EB] border border-[#1F2A1F] font-mono-num">
                          {offer.ticketPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Channels & Potential Rating */}
                  <div className="pt-3 border-t border-[#1F2A1F] flex items-center justify-between text-xs">
                    {/* Channels icons / list */}
                    <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF] truncate max-w-[170px]">
                      {offer.trafficChannels?.slice(0, 2).map((ch) => (
                        <span
                          key={ch}
                          className="px-1.5 py-0.5 rounded bg-[#182018] text-[#9CA3AF] text-[10px]"
                        >
                          {channelLabels[ch] || ch}
                        </span>
                      ))}
                      {(offer.trafficChannels?.length || 0) > 2 && (
                        <span className="text-[10px] text-[#6B7280]">
                          +{(offer.trafficChannels?.length || 0) - 2}
                        </span>
                      )}
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-0.5 text-[#EAB308]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (offer.potentialRating || 3)
                              ? 'fill-[#EAB308] text-[#EAB308]'
                              : 'text-[#374151]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-[#111411] border border-[#1F2A1F] overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs text-[#E5E7EB] border-collapse">
            <thead>
              <tr className="border-b border-[#1F2A1F] bg-[#0E110E] text-[#9CA3AF] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Oferta</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Nicho</th>
                <th className="py-3 px-3">Tipo / Funil</th>
                <th className="py-3 px-3">Canais</th>
                <th className="py-3 px-3 text-right">Ads Ativos</th>
                <th className="py-3 px-3 text-right">Dias</th>
                <th className="py-3 px-3 text-center">Nota</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2A1F]">
              {filteredOffers.map((offer) => {
                const cover = offer.creatives?.[0]?.fileUrl;
                return (
                  <tr
                    key={offer.id}
                    onClick={() => onSelectOffer(offer.id)}
                    className="hover:bg-[#161B16] cursor-pointer transition-colors group"
                  >
                    {/* Oferta Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] overflow-hidden shrink-0 flex items-center justify-center">
                          <CreativeMediaPreview creative={offer.creatives?.[0]} showPlayBadge={false} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white group-hover:text-[#22C55E] transition-colors block truncate max-w-xs">
                            {offer.name}
                          </span>
                          <span className="text-[11px] text-[#6B7280] font-mono-num block">
                            {new Date(offer.addedDate || offer.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={offer.status} size="sm" />
                    </td>

                    {/* Nicho */}
                    <td className="py-3 px-3 text-[#9CA3AF] whitespace-nowrap">
                      {offer.niche}
                    </td>

                    {/* Tipo / Funil */}
                    <td className="py-3 px-3 text-[#9CA3AF] whitespace-nowrap">
                      <span className="capitalize">{offer.offerType}</span>
                      <span className="text-[#6B7280]"> / {offer.funnelType}</span>
                    </td>

                    {/* Canais */}
                    <td className="py-3 px-3 text-[#9CA3AF] max-w-[140px] truncate">
                      {offer.trafficChannels?.map((ch) => channelLabels[ch] || ch).join(', ')}
                    </td>

                    {/* Active Ads */}
                    <td className="py-3 px-3 text-right font-mono-num font-semibold text-[#22C55E]">
                      {offer.activeAdsCurrent || 0}
                    </td>

                    {/* Dias Ativa */}
                    <td className="py-3 px-3 text-right font-mono-num text-[#9CA3AF]">
                      {offer.daysRunning || 0}d
                    </td>

                    {/* Nota */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-0.5 text-[#EAB308]">
                        <Star className="w-3 h-3 fill-[#EAB308]" />
                        <span className="font-mono-num font-bold text-xs">
                          {offer.potentialRating || 3}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => handleCopyLink(e, offer.id)}
                          className="p-1.5 text-[#9CA3AF] hover:text-[#22C55E] hover:bg-[#1A221A] rounded-lg transition-colors"
                          title="Copiar Link"
                        >
                          {copiedId === offer.id ? (
                            <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {isOwner && (
                          <button
                            onClick={(e) => handleFavoriteClick(e, offer.id)}
                            className={`p-1.5 rounded-lg hover:bg-[#1A221A] transition-colors ${
                              offer.isFavorite ? 'text-[#EAB308]' : 'text-[#6B7280] hover:text-[#EAB308]'
                            }`}
                            title="Favorito"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${offer.isFavorite ? 'fill-[#EAB308]' : ''}`}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

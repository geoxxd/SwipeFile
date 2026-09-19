import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Share2,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
  Flame,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Upload,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  Check,
  AlertCircle,
  FileText,
  HelpCircle,
  Layers,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  Loader2
} from 'lucide-react';
import { Offer, FunnelStep, ValidationLog, Competitor, Creative, AppSettings } from '../types/index.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { ValidationChart } from '../components/ValidationChart.tsx';
import { MediaPlayerModal } from '../components/MediaPlayerModal.tsx';
import { CreativeMediaPreview } from '../components/CreativeMediaPreview.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';
import { api } from '../services/api.ts';
import { useToast } from '../components/Toast.tsx';
import { captureVideoFirstFrame, getExternalVideoThumbnail } from '../utils/videoThumbnail.ts';

interface OfferDetailViewProps {
  offer: Offer;
  settings: AppSettings;
  isOwner: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onUpdateOffer: (updated: Offer) => void;
  onCopyShareLink: (offerId: string) => void;
}

export function OfferDetailView({
  offer,
  settings,
  isOwner,
  onBack,
  onEdit,
  onDelete,
  onUpdateOffer,
  onCopyShareLink
}: OfferDetailViewProps) {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<
    'visao_geral' | 'analise' | 'funil' | 'criativos' | 'concorrentes' | 'validacao' | 'anotacoes'
  >('visao_geral');

  // Media Player Modal
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);

  // Modals for additions
  const [showAddFunnel, setShowAddFunnel] = useState(false);
  const [showAddValidation, setShowAddValidation] = useState(false);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [showAddCreative, setShowAddCreative] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Link copy state
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    onCopyShareLink(offer.id);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleFavorite = async () => {
    if (!isOwner) return;
    try {
      const res = await api.toggleFavorite(offer.id);
      onUpdateOffer({ ...offer, isFavorite: res.isFavorite });
      success(res.isFavorite ? 'Oferta adicionada aos favoritos!' : 'Removida dos favoritos.');
    } catch (err: any) {
      error(err.message || 'Erro ao favoritar.');
    }
  };

  // Checklist toggle
  const handleToggleChecklist = async (key: keyof Offer['checklist']) => {
    if (!isOwner) return;
    const newChecklist = { ...offer.checklist, [key]: !offer.checklist[key] };
    try {
      const updated = await api.updateOffer(offer.id, { checklist: newChecklist });
      if (updated) onUpdateOffer(updated);
    } catch (err: any) {
      error('Falha ao atualizar checklist.');
    }
  };

  // Notes update
  const [notesDraft, setNotesDraft] = useState(offer.freeNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    if (!isOwner) return;
    setIsSavingNotes(true);
    try {
      const updated = await api.updateOffer(offer.id, { freeNotes: notesDraft });
      if (updated) onUpdateOffer(updated);
      success('Anotações salvas com sucesso!');
    } catch {
      error('Erro ao salvar anotações.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-[#9CA3AF] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para a biblioteca</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#182018] hover:bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-xs font-medium transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Público'}</span>
          </button>

          {/* Favorite */}
          {isOwner && (
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl border border-[#1F2A1F] transition-colors ${
                offer.isFavorite
                  ? 'bg-[#EAB308]/15 text-[#EAB308] border-[#EAB308]/40'
                  : 'bg-[#111411] text-[#9CA3AF] hover:text-[#EAB308]'
              }`}
              title="Favoritar"
            >
              <Star className={`w-4 h-4 ${offer.isFavorite ? 'fill-[#EAB308]' : ''}`} />
            </button>
          )}

          {/* Edit & Delete for Owner */}
          {isOwner && (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A221A] hover:bg-[#232F23] text-[#E5E7EB] border border-[#1F2A1F] text-xs font-medium transition-colors"
              >
                <Edit className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-xl bg-[#1A1111] hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 transition-colors"
                title="Excluir Oferta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <StatusBadge status={offer.status} size="md" />
              <span className="px-2.5 py-0.5 rounded-md bg-[#091F0E] text-[#00A63E] text-xs font-medium border border-[#00A63E]/30">
                {offer.niche}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#141814] text-[#00C84B] text-xs font-medium border border-[#00A63E]/20 uppercase">
                {offer.offerType} • {offer.funnelType}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#141814] text-[#9CA3AF] text-xs font-medium border border-[#191C19]">
                {offer.country} ({offer.language})
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              {offer.name}
            </h1>

            {/* Headline / Hook quote */}
            {offer.headline && (
              <p className="text-sm text-[#9CA3AF] mt-2 italic font-serif leading-relaxed max-w-3xl">
                "{offer.headline}"
              </p>
            )}
          </div>

          {/* Key Metrics Quick Box */}
          <div className="flex items-center gap-4 bg-[#000000] p-3.5 rounded-xl border border-[#191C19] shrink-0 self-start">
            <div className="flex flex-col items-center px-3 border-r border-[#191C19]">
              <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-medium">
                Ads Ativos
              </span>
              <span className="text-xl font-extrabold text-[#00A63E] font-mono-num flex items-center gap-1 mt-0.5">
                <Flame className="w-4 h-4 fill-[#00A63E]" />
                {offer.activeAdsCurrent || 0}
              </span>
            </div>
            <div className="flex flex-col items-center px-3 border-r border-[#191C19]">
              <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-medium">
                Dias Ativa
              </span>
              <span className="text-xl font-extrabold text-white font-mono-num flex items-center gap-1 mt-0.5">
                <Clock className="w-4 h-4 text-[#9CA3AF]" />
                {offer.daysRunning || 0}d
              </span>
            </div>
            <div className="flex flex-col items-center px-3">
              <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-medium">
                Potencial
              </span>
              <div className="flex items-center gap-0.5 text-[#EAB308] mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < (offer.potentialRating || 3) ? 'fill-[#EAB308]' : 'text-[#374151]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tags bar */}
        {offer.tags && offer.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#191C19]">
            {offer.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs rounded-lg bg-[#071207] text-[#9CA3AF] border border-[#191C19]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#191C19] pb-px">
        {[
          { id: 'visao_geral', label: 'Visão Geral' },
          { id: 'analise', label: 'Análise & Copy' },
          { id: 'funil', label: `Funil (${offer.funnelSteps?.length || 0})` },
          { id: 'criativos', label: `Criativos (${offer.creatives?.length || 0})` },
          { id: 'concorrentes', label: `Concorrentes (${offer.competitors?.length || 0})` },
          { id: 'validacao', label: 'Validação & Escala' },
          { id: 'anotacoes', label: 'Anotações' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-[#00A63E] text-[#00A63E] bg-[#0C0D0C]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#0C0D0C]/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: VISÃO GERAL */}
      {activeTab === 'visao_geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quick Info & External Links */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Basic Info Card */}
            <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Dados Comerciais & Estrutura
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-[#6B7280] block">Preço / Ticket</span>
                  <span className="text-sm font-semibold text-white font-mono-num">
                    {offer.ticketPrice || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">Checkout</span>
                  <span className="text-sm font-semibold text-white">
                    {offer.checkoutPlatform || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">Data de Adição</span>
                  <span className="text-sm font-semibold text-white font-mono-num">
                    {new Date(offer.addedDate || offer.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Traffic Channels */}
              <div className="pt-3 border-t border-[#1F2A1F]">
                <span className="text-xs text-[#6B7280] block mb-2">Canais de Tráfego Identificados</span>
                <div className="flex flex-wrap gap-2">
                  {offer.trafficChannels?.map((ch) => (
                    <span
                      key={ch}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[#182018] text-[#22C55E] border border-[#22C55E]/30 font-medium"
                    >
                      {ch.replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Links Section */}
            <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Links Importantes da Oferta
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {offer.salesPageUrl && (
                  <a
                    href={offer.salesPageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] hover:border-[#22C55E]/40 text-xs text-[#E5E7EB] hover:text-[#22C55E] transition-all group"
                  >
                    <span className="font-semibold">Página de Vendas (TSL / VSL)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#22C55E]" />
                  </a>
                )}

                {offer.adLibraryUrl && (
                  <a
                    href={offer.adLibraryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] hover:border-[#22C55E]/40 text-xs text-[#E5E7EB] hover:text-[#22C55E] transition-all group"
                  >
                    <span className="font-semibold">Biblioteca de Anúncios (Meta)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#22C55E]" />
                  </a>
                )}

                {offer.checkoutUrl && (
                  <a
                    href={offer.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] hover:border-[#22C55E]/40 text-xs text-[#E5E7EB] hover:text-[#22C55E] transition-all group"
                  >
                    <span className="font-semibold">Link Direto do Checkout</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#22C55E]" />
                  </a>
                )}

                {offer.advertiserProfileUrl && (
                  <a
                    href={offer.advertiserProfileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] hover:border-[#22C55E]/40 text-xs text-[#E5E7EB] hover:text-[#22C55E] transition-all group"
                  >
                    <span className="font-semibold">Perfil / Página do Anunciante</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#22C55E]" />
                  </a>
                )}

                {offer.extraLinks?.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] hover:border-[#22C55E]/40 text-xs text-[#E5E7EB] hover:text-[#22C55E] transition-all group"
                  >
                    <span className="font-semibold">{l.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#22C55E]" />
                  </a>
                ))}
              </div>
            </div>

            {/* Validation Quick Chart */}
            <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                  <span>Histórico de Anúncios Ativos</span>
                </h3>
                <button
                  onClick={() => setActiveTab('validacao')}
                  className="text-xs text-[#22C55E] hover:underline"
                >
                  Ver aba completa
                </button>
              </div>
              <ValidationChart logs={offer.validationLogs || []} height={190} />
            </div>
          </div>

          {/* Right Column: Model Checklist & Top Creative */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Checklist "Pronta para Modelar" */}
            <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <span>Pronta para Modelar</span>
                </h3>
                <span className="text-xs text-[#9CA3AF] font-mono-num">
                  {Object.values(offer.checklist || {}).filter(Boolean).length}/6 concluídos
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mb-2 leading-relaxed">
                Checklist dos itens necessários antes de subir uma campanha modelada.
              </p>

              <div className="flex flex-col gap-2">
                {[
                  { key: 'copyAnalyzed', label: 'Copy & Mecanismo Único analisados' },
                  { key: 'creativeSaved', label: 'Criativo vencedor baixado no swipe' },
                  { key: 'funnelMapped', label: 'Funil e esteira mapeados (Front + Bumps)' },
                  { key: 'competitorsListed', label: 'Concorrentes e modeladores mapeados' },
                  { key: 'checkoutTested', label: 'Checkout e taxas testados' },
                  { key: 'offerSwiped', label: 'Oferta arquivada em coleção do projeto' }
                ].map((item) => {
                  const isChecked = offer.checklist?.[item.key as keyof Offer['checklist']];
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleToggleChecklist(item.key as any)}
                      disabled={!isOwner}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all ${
                        isChecked
                          ? 'bg-[#182018] border-[#22C55E]/40 text-[#E5E7EB]'
                          : 'bg-[#0A0D0A] border-[#1F2A1F] text-[#9CA3AF] hover:border-[#374151]'
                      } ${isOwner ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#4B5563] shrink-0" />
                      )}
                      <span className={isChecked ? 'line-through text-[#6B7280]' : 'font-medium'}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Creative Card Preview */}
            <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Criativo Principal
                </h3>
                <button
                  onClick={() => setActiveTab('criativos')}
                  className="text-xs text-[#22C55E] hover:underline"
                >
                  Ver todos ({offer.creatives?.length || 0})
                </button>
              </div>

              {offer.creatives && offer.creatives.length > 0 ? (
                <div
                  onClick={() => setSelectedCreative(offer.creatives![0])}
                  className="cursor-pointer group rounded-xl overflow-hidden bg-[#0A0D0A] border border-[#1F2A1F] hover:border-[#22C55E]/40 transition-all"
                >
                  <div className="w-full h-44 bg-black relative flex items-center justify-center overflow-hidden">
                    <CreativeMediaPreview creative={offer.creatives[0]} />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-white truncate">
                      {offer.creatives[0].title}
                    </p>
                    {offer.creatives[0].hook3s && (
                      <p className="text-[11px] text-[#9CA3AF] line-clamp-2 mt-1 italic">
                        "{offer.creatives[0].hook3s}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-[#1F2A1F] text-center text-xs text-[#6B7280]">
                  Nenhum criativo anexado ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ANÁLISE & COPY */}
      {activeTab === 'analise' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gancho / Hook */}
          <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Gancho / Hook Principal
            </span>
            <p className="text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-wrap font-medium">
              {offer.hook || 'Nenhum gancho registrado.'}
            </p>
          </div>

          {/* Headline */}
          <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider">
              Headline da Página
            </span>
            <p className="text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-wrap">
              {offer.headline || 'Nenhuma headline registrada.'}
            </p>
          </div>

          {/* Promessa Principal */}
          <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wider">
              Promessa Principal (Big Promise)
            </span>
            <p className="text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-wrap">
              {offer.mainPromise || 'Não informada.'}
            </p>
          </div>

          {/* Mecanismo Único */}
          <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#A855F7] uppercase tracking-wider">
              Mecanismo Único (Unique Mechanism)
            </span>
            <p className="text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-wrap">
              {offer.uniqueMechanism || 'Não informado.'}
            </p>
          </div>

          {/* Público-alvo */}
          <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
              Público-Alvo & Dores Mapeadas
            </span>
            <p className="text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-wrap">
              {offer.targetAudience || 'Não informado.'}
            </p>
          </div>

          {/* Provas Usadas */}
          <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
              Provas & Elementos de Credibilidade
            </span>
            <p className="text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-wrap">
              {offer.proofsUsed || 'Não informadas.'}
            </p>
          </div>

          {/* Bônus */}
          <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
              Bônus Ofertados
            </span>
            <p className="text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-wrap">
              {offer.bonuses || 'Nenhum bônus listado.'}
            </p>
          </div>

          {/* Garantia & CTA */}
          <div className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
              Garantia & Chamada para Ação (CTA)
            </span>
            <div className="flex flex-col gap-2 text-sm text-[#E5E7EB]">
              <div>
                <span className="text-xs text-[#6B7280] block">Garantia:</span>
                {offer.guarantee || 'Padrão 7 dias.'}
              </div>
              <div className="pt-2 border-t border-[#1F2A1F]">
                <span className="text-xs text-[#6B7280] block">CTA Final:</span>
                <span className="text-[#22C55E] font-medium">{offer.cta || 'Não informado.'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FUNIL & ESTEIRA */}
      {activeTab === 'funil' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Etapas da Esteira de Produtos</h3>
              <p className="text-xs text-[#9CA3AF]">
                Mapeamento do Front-end, Order Bumps, Upsells e Downsells.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddFunnel(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#22C55E] hover:bg-[#4ADE80] text-black font-semibold text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Etapa</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {(!offer.funnelSteps || offer.funnelSteps.length === 0) ? (
              <div className="p-12 rounded-2xl bg-[#111411] border border-[#1F2A1F] text-center text-xs text-[#6B7280]">
                Nenhuma etapa cadastrada no funil ainda.
              </div>
            ) : (
              offer.funnelSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-4 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#182018] text-[#22C55E] border border-[#22C55E]/30 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-[#1F2A1F] text-[#9CA3AF]">
                          {step.type.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-white">{step.name}</h4>
                      </div>
                      {step.notes && (
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">{step.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:self-center">
                    {step.price && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] text-xs font-mono font-bold text-[#22C55E]">
                        {step.price}
                      </span>
                    )}
                    {step.url && (
                      <a
                        href={step.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-[#9CA3AF] hover:text-[#22C55E] rounded-lg"
                        title="Abrir link da etapa"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {isOwner && (
                      <button
                        onClick={async () => {
                          try {
                            await api.deleteFunnelStep(step.id);
                            onUpdateOffer({
                              ...offer,
                              funnelSteps: offer.funnelSteps?.filter((s) => s.id !== step.id)
                            });
                            success('Etapa removida.');
                          } catch {
                            error('Erro ao excluir etapa.');
                          }
                        }}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: CRIATIVOS */}
      {activeTab === 'criativos' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Criativos Salvos</h3>
              <p className="text-xs text-[#9CA3AF]">
                Galeria de anúncios em vídeo, imagens, UGCs e prints gravados no storage.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddCreative(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#22C55E] hover:bg-[#4ADE80] text-black font-semibold text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Criativo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(!offer.creatives || offer.creatives.length === 0) ? (
              <div className="col-span-full p-12 rounded-2xl bg-[#111411] border border-[#1F2A1F] text-center text-xs text-[#6B7280]">
                Nenhum criativo salvo para esta oferta.
              </div>
            ) : (
              offer.creatives.map((cr) => {
                const isVideo = cr.fileType === 'video' || cr.fileType === 'external_video';
                return (
                  <div
                    key={cr.id}
                    onClick={() => setSelectedCreative(cr)}
                    className="cursor-pointer rounded-2xl bg-[#111411] border border-[#1F2A1F] hover:border-[#22C55E]/40 overflow-hidden group flex flex-col justify-between transition-all"
                  >
                    <div>
                      {/* Media container */}
                      <div className="w-full h-44 bg-[#0A0D0A] relative flex items-center justify-center overflow-hidden border-b border-[#1F2A1F]">
                        <CreativeMediaPreview creative={cr} />
                        <div className="absolute top-2 left-2 z-10">
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-black/80 text-[#22C55E] uppercase border border-[#22C55E]/30">
                            {cr.creativeType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#22C55E] transition-colors line-clamp-1 mb-1">
                          {cr.title}
                        </h4>
                        {cr.hook3s && (
                          <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed mb-2 italic">
                            "{cr.hook3s}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between text-xs text-[#6B7280]">
                      <span className="font-mono-num">
                        {new Date(cr.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {isOwner && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await api.deleteCreative(cr.id);
                              onUpdateOffer({
                                ...offer,
                                creatives: offer.creatives?.filter((c) => c.id !== cr.id)
                              });
                              success('Criativo excluído.');
                            } catch {
                              error('Erro ao excluir criativo.');
                            }
                          }}
                          className="p-1 text-[#6B7280] hover:text-[#EF4444] rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: CONCORRENTES & MODELADORES */}
      {activeTab === 'concorrentes' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Concorrentes e Modeladores</h3>
              <p className="text-xs text-[#9CA3AF]">
                Pessoas e operações que estão modelando ou copiando a oferta.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddCompetitor(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#22C55E] hover:bg-[#4ADE80] text-black font-semibold text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Concorrente</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {(!offer.competitors || offer.competitors.length === 0) ? (
              <div className="p-12 rounded-2xl bg-[#111411] border border-[#1F2A1F] text-center text-xs text-[#6B7280]">
                Nenhum concorrente mapeado ainda.
              </div>
            ) : (
              offer.competitors.map((comp) => (
                <div
                  key={comp.id}
                  className="p-5 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-bold text-white">{comp.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-[#1F2A1F] text-[#22C55E] border border-[#22C55E]/30">
                        {comp.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                      {comp.activeAdsCount !== undefined && (
                        <span className="flex items-center gap-1 font-mono-num font-bold text-[#22C55E]">
                          <Flame className="w-3.5 h-3.5 fill-[#22C55E]" />
                          {comp.activeAdsCount} ads ativos
                        </span>
                      )}
                      {isOwner && (
                        <button
                          onClick={async () => {
                            try {
                              await api.deleteCompetitor(comp.id);
                              onUpdateOffer({
                                ...offer,
                                competitors: offer.competitors?.filter((c) => c.id !== comp.id)
                              });
                              success('Concorrente removido.');
                            } catch {
                              error('Erro ao remover concorrente.');
                            }
                          }}
                          className="p-1 text-[#6B7280] hover:text-[#EF4444] rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Differences / Analysis */}
                  {comp.differencesNotes && (
                    <div className="p-3.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-[#D1D5DB] leading-relaxed">
                      <span className="text-[#22C55E] font-semibold block mb-1">
                        O que mudou em relação ao original:
                      </span>
                      {comp.differencesNotes}
                    </div>
                  )}

                  {/* Competitor Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1F2A1F]">
                    {comp.salesPageUrl && (
                      <a
                        href={comp.salesPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] hover:border-[#22C55E]/40 text-[#E5E7EB]"
                      >
                        <span>Página de Vendas</span>
                        <ExternalLink className="w-3 h-3 text-[#9CA3AF]" />
                      </a>
                    )}
                    {comp.adLibraryUrl && (
                      <a
                        href={comp.adLibraryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] hover:border-[#22C55E]/40 text-[#E5E7EB]"
                      >
                        <span>Ad Library</span>
                        <ExternalLink className="w-3 h-3 text-[#9CA3AF]" />
                      </a>
                    )}
                    {comp.profileUrl && (
                      <a
                        href={comp.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-[#0A0D0A] border border-[#1F2A1F] hover:border-[#22C55E]/40 text-[#E5E7EB]"
                      >
                        <span>Perfil / Canal</span>
                        <ExternalLink className="w-3 h-3 text-[#9CA3AF]" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: VALIDAÇÃO & ESCALA */}
      {activeTab === 'validacao' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Histórico de Validação da Oferta</h3>
              <p className="text-xs text-[#9CA3AF]">
                Registre a contagem de anúncios ativos ao longo do tempo para comprovar a curva de escala.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddValidation(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#22C55E] hover:bg-[#4ADE80] text-black font-semibold text-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nova Medição</span>
              </button>
            )}
          </div>

          {/* Large Chart Card */}
          <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#6B7280] uppercase tracking-wider block">
                  Tempo em Anúncio
                </span>
                <span className="text-2xl font-black text-white font-mono-num">
                  {offer.daysRunning || 0} dias rodando
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#6B7280] uppercase tracking-wider block">
                  Anúncios Atuais
                </span>
                <span className="text-2xl font-black text-[#22C55E] font-mono-num">
                  {offer.activeAdsCurrent || 0} ads
                </span>
              </div>
            </div>

            <ValidationChart logs={offer.validationLogs || []} height={260} />
          </div>

          {/* Validation Logs Table */}
          <div className="rounded-2xl bg-[#111411] border border-[#1F2A1F] overflow-hidden">
            <table className="w-full text-left text-xs text-[#E5E7EB]">
              <thead>
                <tr className="border-b border-[#1F2A1F] bg-[#0E110E] text-[#9CA3AF] uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Anúncios Ativos</th>
                  <th className="py-3 px-4">Observações</th>
                  {isOwner && <th className="py-3 px-4 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2A1F]">
                {(!offer.validationLogs || offer.validationLogs.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#6B7280]">
                      Nenhum registro ainda.
                    </td>
                  </tr>
                ) : (
                  [...offer.validationLogs]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-[#161B16] transition-colors">
                        <td className="py-3 px-4 font-mono-num font-medium">
                          {new Date(log.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 font-mono-num font-bold text-[#22C55E]">
                          {log.activeAdsCount}
                        </td>
                        <td className="py-3 px-4 text-[#9CA3AF] max-w-md">
                          {log.notes || '—'}
                        </td>
                        {isOwner && (
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={async () => {
                                try {
                                  await api.deleteValidationLog(log.id);
                                  const updatedLogs = offer.validationLogs?.filter((l) => l.id !== log.id);
                                  onUpdateOffer({
                                    ...offer,
                                    validationLogs: updatedLogs,
                                    activeAdsCurrent: updatedLogs?.length ? updatedLogs[updatedLogs.length - 1].activeAdsCount : 0
                                  });
                                  success('Registro removido.');
                                } catch {
                                  error('Erro ao remover registro.');
                                }
                              }}
                              className="p-1 text-[#6B7280] hover:text-[#EF4444] rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: ANOTAÇÕES */}
      {activeTab === 'anotacoes' && (
        <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Anotações Pessoais & Insights</h3>
            <p className="text-xs text-[#9CA3AF]">
              Espaço livre para reflexões, ideias de adaptação para seu nicho e planos de teste.
            </p>
          </div>

          <textarea
            rows={10}
            disabled={!isOwner}
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder="Digite aqui suas observações sobre esta oferta..."
            className="w-full p-4 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none transition-colors leading-relaxed"
          />

          {isOwner && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#4ADE80] text-black font-bold text-xs transition-colors shadow-lg shadow-emerald-950/40"
              >
                {isSavingNotes ? 'Salvando...' : 'Salvar Anotações'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Media Player Modal */}
      <MediaPlayerModal
        creative={selectedCreative}
        onClose={() => setSelectedCreative(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Excluir Oferta Permanentemente?"
        message={`Tem certeza que deseja excluir "${offer.name}"? Todos os criativos, etapas de funil, concorrentes e validações vinculados serão excluídos do banco.`}
        confirmLabel="Sim, Excluir"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete(offer.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Add Funnel Step Modal */}
      {showAddFunnel && (
        <AddFunnelModal
          offerId={offer.id}
          nextOrder={(offer.funnelSteps?.length || 0) + 1}
          onClose={() => setShowAddFunnel(false)}
          onAdded={(step) => {
            onUpdateOffer({
              ...offer,
              funnelSteps: [...(offer.funnelSteps || []), step]
            });
            setShowAddFunnel(false);
          }}
        />
      )}

      {/* Add Validation Log Modal */}
      {showAddValidation && (
        <AddValidationModal
          offerId={offer.id}
          onClose={() => setShowAddValidation(false)}
          onAdded={(log) => {
            const newLogs = [...(offer.validationLogs || []), log];
            onUpdateOffer({
              ...offer,
              validationLogs: newLogs,
              activeAdsCurrent: log.activeAdsCount
            });
            setShowAddValidation(false);
          }}
        />
      )}

      {/* Add Competitor Modal */}
      {showAddCompetitor && (
        <AddCompetitorModal
          offerId={offer.id}
          onClose={() => setShowAddCompetitor(false)}
          onAdded={(comp) => {
            onUpdateOffer({
              ...offer,
              competitors: [...(offer.competitors || []), comp]
            });
            setShowAddCompetitor(false);
          }}
        />
      )}

      {/* Add Creative Modal */}
      {showAddCreative && (
        <AddCreativeModal
          offerId={offer.id}
          onClose={() => setShowAddCreative(false)}
          onAdded={(cr) => {
            onUpdateOffer({
              ...offer,
              creatives: [...(offer.creatives || []), cr]
            });
            setShowAddCreative(false);
          }}
        />
      )}
    </div>
  );
}

// ----------------- SUB-MODALS -----------------

function AddFunnelModal({
  offerId,
  nextOrder,
  onClose,
  onAdded
}: {
  offerId: string;
  nextOrder: number;
  onClose: () => void;
  onAdded: (step: FunnelStep) => void;
}) {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState<FunnelStep['type']>('front');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const step = await api.addFunnelStep(offerId, {
        order: nextOrder,
        name: name.trim(),
        type,
        price: price.trim() || undefined,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined
      });
      success('Etapa adicionada ao funil!');
      onAdded(step);
    } catch (err: any) {
      error(err.message || 'Falha ao adicionar etapa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111411] border border-[#1F2A1F] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-white mb-4">Adicionar Etapa ao Funil</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Nome da Etapa *</label>
            <input
              type="text"
              required
              placeholder="Ex.: Front-end Kit 3 Frascos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#D1D5DB] font-semibold mb-1">Tipo de Etapa</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
              >
                <option value="front">Front-end</option>
                <option value="order_bump">Order Bump</option>
                <option value="upsell_1">Upsell 1</option>
                <option value="upsell_2">Upsell 2</option>
                <option value="downsell">Downsell</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-[#D1D5DB] font-semibold mb-1">Preço / Ticket</label>
              <input
                type="text"
                placeholder="R$ 197,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Link da Etapa</label>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Anotações / Conversão</label>
            <textarea
              rows={2}
              placeholder="Ex.: Conversão média de 25% pós-checkout"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[#1F2A1F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9CA3AF] hover:text-white bg-[#1A221A] rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-black bg-[#22C55E] hover:bg-[#4ADE80] rounded-xl"
            >
              {loading ? 'Salvando...' : 'Salvar Etapa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddValidationModal({
  offerId,
  onClose,
  onAdded
}: {
  offerId: string;
  onClose: () => void;
  onAdded: (log: ValidationLog) => void;
}) {
  const { success, error } = useToast();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [activeAdsCount, setActiveAdsCount] = useState<number>(10);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const log = await api.addValidationLog(offerId, {
        date,
        activeAdsCount: Number(activeAdsCount) || 0,
        notes: notes.trim() || undefined
      });
      success('Medição de validação registrada!');
      onAdded(log);
    } catch (err: any) {
      error(err.message || 'Falha ao registrar medição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111411] border border-[#1F2A1F] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-white mb-4">Registrar Medição de Anúncios</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Data da Medição</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Nº de Anúncios Ativos *</label>
            <input
              type="number"
              required
              min={0}
              value={activeAdsCount}
              onChange={(e) => setActiveAdsCount(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-[#22C55E] font-bold focus:border-[#22C55E] focus:outline-none font-mono-num"
            />
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Observações</label>
            <textarea
              rows={2}
              placeholder="Ex.: Duplicou conjuntos, novos criativos de depoimento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[#1F2A1F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9CA3AF] hover:text-white bg-[#1A221A] rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-black bg-[#22C55E] hover:bg-[#4ADE80] rounded-xl"
            >
              {loading ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddCompetitorModal({
  offerId,
  onClose,
  onAdded
}: {
  offerId: string;
  onClose: () => void;
  onAdded: (comp: Competitor) => void;
}) {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [salesPageUrl, setSalesPageUrl] = useState('');
  const [adLibraryUrl, setAdLibraryUrl] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [activeAdsCount, setActiveAdsCount] = useState<string>('');
  const [status, setStatus] = useState<'ativo' | 'pausado' | 'abandonado'>('ativo');
  const [differencesNotes, setDifferencesNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const comp = await api.addCompetitor(offerId, {
        name: name.trim(),
        salesPageUrl: salesPageUrl.trim() || undefined,
        adLibraryUrl: adLibraryUrl.trim() || undefined,
        profileUrl: profileUrl.trim() || undefined,
        activeAdsCount: activeAdsCount ? Number(activeAdsCount) : undefined,
        status,
        differencesNotes: differencesNotes.trim() || undefined
      });
      success('Concorrente cadastrado com sucesso!');
      onAdded(comp);
    } catch (err: any) {
      error(err.message || 'Falha ao cadastrar concorrente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111411] border border-[#1F2A1F] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-white mb-4">Mapear Concorrente / Modelador</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Nome do Concorrente *</label>
            <input
              type="text"
              required
              placeholder="Ex.: Método Seca Rápido Clone"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#D1D5DB] font-semibold mb-1">Nº de Ads Ativos</label>
              <input
                type="number"
                placeholder="Ex.: 32"
                value={activeAdsCount}
                onChange={(e) => setActiveAdsCount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none font-mono-num"
              />
            </div>
            <div>
              <label className="block text-[#D1D5DB] font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
              >
                <option value="ativo">Ativo</option>
                <option value="pausado">Pausado</option>
                <option value="abandonado">Abandonado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Link da Página de Vendas</label>
            <input
              type="url"
              placeholder="https://..."
              value={salesPageUrl}
              onChange={(e) => setSalesPageUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Link da Biblioteca de Anúncios</label>
            <input
              type="url"
              placeholder="https://facebook.com/ads/library/..."
              value={adLibraryUrl}
              onChange={(e) => setAdLibraryUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">
              O que ele mudou em relação ao original? (Copy, Preço, Criativo, Funil)
            </label>
            <textarea
              rows={3}
              placeholder="Ex.: Preço mais barato no front, gancho com avatar masculino..."
              value={differencesNotes}
              onChange={(e) => setDifferencesNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[#1F2A1F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9CA3AF] hover:text-white bg-[#1A221A] rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-black bg-[#22C55E] hover:bg-[#4ADE80] rounded-xl"
            >
              {loading ? 'Salvando...' : 'Salvar Concorrente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddCreativeModal({
  offerId,
  onClose,
  onAdded
}: {
  offerId: string;
  onClose: () => void;
  onAdded: (cr: Creative) => void;
}) {
  const { success, error } = useToast();
  const [title, setTitle] = useState('');
  const [mode, setCreativeMode] = useState<'upload' | 'link'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [autoThumbData, setAutoThumbData] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [isExtractingThumb, setIsExtractingThumb] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [creativeType, setCreativeType] = useState<Creative['creativeType']>('vsl');
  const [hook3s, setHook3s] = useState('');
  const [cta, setCta] = useState('');
  const [script, setScript] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setAutoThumbData(null);

      if (file.type.startsWith('video/')) {
        setCreativeType('vsl');
        setIsExtractingThumb(true);
        try {
          const frame = await captureVideoFirstFrame(file);
          setAutoThumbData(frame);
        } catch (err) {
          console.warn('Erro ao extrair frame do vídeo:', err);
        } finally {
          setIsExtractingThumb(false);
        }
      } else if (file.type.startsWith('image/')) {
        setCreativeType('imagem_estatica');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Informe um título para o criativo.');
      return;
    }

    if (mode === 'upload' && !selectedFile) {
      error('Selecione um arquivo de imagem ou vídeo.');
      return;
    }
    if (mode === 'link' && !externalUrl.trim()) {
      error('Informe a URL do vídeo.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      let fileUrl = '';
      let thumbnailUrl: string | undefined = undefined;
      let fileType: Creative['fileType'] = 'image';
      let mimeType = 'image/jpeg';
      let sizeBytes = 0;

      if (mode === 'upload' && selectedFile) {
        const upRes = await api.uploadFile(selectedFile, (p) => setUploadProgress(p));
        fileUrl = upRes.fileUrl;
        fileType = upRes.fileType;
        mimeType = upRes.mimeType;
        sizeBytes = upRes.sizeBytes;

        // If it is a video, upload the extracted first frame as the thumbnail
        if (fileType === 'video') {
          let thumbBlob = autoThumbData?.blob;
          if (!thumbBlob) {
            try {
              const frame = await captureVideoFirstFrame(selectedFile);
              thumbBlob = frame.blob;
            } catch (err) {
              console.warn('Erro ao capturar primeiro frame:', err);
            }
          }
          if (thumbBlob) {
            try {
              const thumbRes = await api.uploadFile(thumbBlob, undefined, `capa-${Date.now()}.jpg`);
              thumbnailUrl = thumbRes.fileUrl;
            } catch (err) {
              console.warn('Erro ao subir arquivo da capa:', err);
            }
          }
        }
      } else {
        fileUrl = externalUrl.trim();
        fileType = 'external_video';
        const ytThumb = getExternalVideoThumbnail(fileUrl);
        if (ytThumb) {
          thumbnailUrl = ytThumb;
        }
      }

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await api.addCreative(offerId, {
        title: title.trim(),
        fileUrl,
        thumbnailUrl,
        fileType,
        mimeType,
        creativeType,
        hook3s: hook3s.trim() || undefined,
        cta: cta.trim() || undefined,
        script: script.trim() || undefined,
        notes: notes.trim() || undefined,
        sourceType: 'propria_oferta',
        tags,
        fileSizeBytes: sizeBytes || undefined
      });

      success('Criativo salvo com sucesso!');
      onAdded(created);
    } catch (err: any) {
      error(err.message || 'Erro ao adicionar criativo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111411] border border-[#1F2A1F] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-white mb-4">Adicionar Novo Criativo</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Título do Criativo *</label>
            <input
              type="text"
              required
              placeholder="Ex.: Criativo VSL - Gancho das 7 Gotas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          {/* Media Choice */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[#D1D5DB] font-semibold">Mídia do Criativo *</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCreativeMode('upload')}
                  className={`px-2 py-0.5 rounded text-xs ${
                    mode === 'upload' ? 'bg-[#1F2A1F] text-[#22C55E] font-medium' : 'text-[#9CA3AF]'
                  }`}
                >
                  Upload de Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setCreativeMode('link')}
                  className={`px-2 py-0.5 rounded text-xs ${
                    mode === 'link' ? 'bg-[#1F2A1F] text-[#22C55E] font-medium' : 'text-[#9CA3AF]'
                  }`}
                >
                  Link Externo (YouTube / Drive)
                </button>
              </div>
            </div>

            {mode === 'upload' ? (
              <div className="border border-dashed border-[#1F2A1F] hover:border-[#22C55E]/50 rounded-xl p-4 text-center bg-[#0A0D0A] relative cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  {isExtractingThumb ? (
                    <div className="flex flex-col items-center gap-1 text-[#22C55E] py-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-xs font-medium">Extraindo primeiro frame para a capa do vídeo...</span>
                    </div>
                  ) : autoThumbData ? (
                    <div className="flex items-center gap-3 w-full bg-[#111611] p-2 rounded-xl border border-[#22C55E]/30 text-left">
                      <div className="w-16 h-12 rounded-lg bg-black overflow-hidden relative shrink-0 border border-[#22C55E]/40">
                        <img src={autoThumbData.dataUrl} alt="Capa" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-[#22C55E] fill-[#22C55E]" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[#22C55E] text-xs font-bold">
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span>Capa do vídeo capturada (1º frame)</span>
                        </div>
                        <p className="text-[11px] text-[#E5E7EB] font-medium truncate mt-0.5">
                          {selectedFile?.name}
                        </p>
                        <p className="text-[10px] text-[#9CA3AF]">
                          {((selectedFile?.size || 0) / 1024 / 1024).toFixed(1)} MB • Clique para trocar
                        </p>
                      </div>
                    </div>
                  ) : selectedFile ? (
                    <span className="text-xs font-semibold text-[#22C55E]">{selectedFile.name}</span>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-[#9CA3AF]" />
                      <span className="text-xs text-[#E5E7EB] font-medium">
                        Clique ou arraste vídeo ou imagem
                      </span>
                      <span className="text-[10px] text-[#6B7280]">
                        MP4, MOV, WEBM, JPG, PNG, WEBP
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <input
                type="url"
                placeholder="Ex.: https://youtube.com/watch?v=... ou Vimeo / Drive"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#D1D5DB] font-semibold mb-1">Tipo de Criativo</label>
              <select
                value={creativeType}
                onChange={(e) => setCreativeType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
              >
                <option value="vsl">VSL (Vídeo de Vendas)</option>
                <option value="ugc">UGC (Depoimento Real)</option>
                <option value="depoimento">Depoimento em Vídeo</option>
                <option value="imagem_estatica">Imagem Estática</option>
                <option value="carrossel">Carrossel</option>
                <option value="print_anuncio">Print de Anúncio</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-[#D1D5DB] font-semibold mb-1">Tags (separadas por vírgula)</label>
              <input
                type="text"
                placeholder="Viral, TikTok, Autoridade"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">
              Gancho dos Primeiros 3 Segundos
            </label>
            <input
              type="text"
              placeholder="O que é dito ou mostrado logo de cara"
              value={hook3s}
              onChange={(e) => setHook3s(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Chamada para Ação (CTA)</label>
            <input
              type="text"
              placeholder="Ex.: Toque em Saiba Mais e garanta o desconto"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Roteiro / Transcrição</label>
            <textarea
              rows={4}
              placeholder="Cole aqui a transcrição completa do áudio ou estrutura cena a cena..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white font-mono focus:border-[#22C55E] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Progress bar */}
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span>Fazendo upload...</span>
                <span className="font-mono-num text-[#22C55E]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#1F2A1F] rounded-full overflow-hidden">
                <div className="h-full bg-[#22C55E]" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[#1F2A1F]">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9CA3AF] hover:text-white bg-[#1A221A] rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-black bg-[#22C55E] hover:bg-[#4ADE80] rounded-xl flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Salvando...' : 'Salvar Criativo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

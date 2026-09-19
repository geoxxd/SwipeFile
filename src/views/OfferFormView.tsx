import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  DollarSign,
  HelpCircle,
  Tag,
  Layers,
  Star
} from 'lucide-react';
import { Offer, AppSettings, TrafficChannel, OfferStatus, OfferType, FunnelType } from '../types/index.ts';
import { useToast } from '../components/Toast.tsx';

interface OfferFormViewProps {
  initialOffer?: Offer | null;
  settings: AppSettings;
  onSave: (offerData: Partial<Offer>) => Promise<void>;
  onCancel: () => void;
}

export function OfferFormView({ initialOffer, settings, onSave, onCancel }: OfferFormViewProps) {
  const { error } = useToast();
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(initialOffer?.name || '');
  const [status, setStatus] = useState<OfferStatus>(initialOffer?.status || 'em_teste');
  const [niche, setNiche] = useState(initialOffer?.niche || settings.niches[0] || 'Marketing Digital');
  const [customNiche, setCustomNiche] = useState('');
  const [offerType, setOfferType] = useState<OfferType>(initialOffer?.offerType || 'infoproduto');
  const [funnelType, setFunnelType] = useState<FunnelType>(initialOffer?.funnelType || 'vsl');
  const [trafficChannels, setTrafficChannels] = useState<TrafficChannel[]>(
    initialOffer?.trafficChannels || ['facebook_instagram']
  );
  const [potentialRating, setPotentialRating] = useState<number>(initialOffer?.potentialRating || 3);
  const [country, setCountry] = useState(initialOffer?.country || 'Brasil');
  const [language, setLanguage] = useState(initialOffer?.language || 'Português (BR)');
  const [ticketPrice, setTicketPrice] = useState(initialOffer?.ticketPrice || '');
  const [checkoutPlatform, setCheckoutPlatform] = useState(initialOffer?.checkoutPlatform || '');

  // URLs
  const [salesPageUrl, setSalesPageUrl] = useState(initialOffer?.salesPageUrl || '');
  const [adLibraryUrl, setAdLibraryUrl] = useState(initialOffer?.adLibraryUrl || '');
  const [checkoutUrl, setCheckoutUrl] = useState(initialOffer?.checkoutUrl || '');
  const [advertiserProfileUrl, setAdvertiserProfileUrl] = useState(
    initialOffer?.advertiserProfileUrl || ''
  );

  // Copy & Strategy
  const [hook, setHook] = useState(initialOffer?.hook || '');
  const [headline, setHeadline] = useState(initialOffer?.headline || '');
  const [mainPromise, setMainPromise] = useState(initialOffer?.mainPromise || '');
  const [uniqueMechanism, setUniqueMechanism] = useState(initialOffer?.uniqueMechanism || '');
  const [targetAudience, setTargetAudience] = useState(initialOffer?.targetAudience || '');
  const [proofsUsed, setProofsUsed] = useState(initialOffer?.proofsUsed || '');
  const [bonuses, setBonuses] = useState(initialOffer?.bonuses || '');
  const [guarantee, setGuarantee] = useState(initialOffer?.guarantee || '7 dias');
  const [cta, setCta] = useState(initialOffer?.cta || '');
  const [tagsInput, setTagsInput] = useState(initialOffer?.tags?.join(', ') || '');
  const [freeNotes, setFreeNotes] = useState(initialOffer?.freeNotes || '');

  const toggleChannel = (channel: TrafficChannel) => {
    if (trafficChannels.includes(channel)) {
      if (trafficChannels.length > 1) {
        setTrafficChannels(trafficChannels.filter((c) => c !== channel));
      }
    } else {
      setTrafficChannels([...trafficChannels, channel]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Por favor, informe o nome da oferta.');
      return;
    }

    setLoading(true);
    try {
      const finalNiche = niche === '__custom__' && customNiche.trim() ? customNiche.trim() : niche;
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await onSave({
        name: name.trim(),
        status,
        niche: finalNiche,
        offerType,
        funnelType,
        trafficChannels,
        potentialRating,
        country: country.trim() || 'Brasil',
        language: language.trim() || 'Português (BR)',
        ticketPrice: ticketPrice.trim() || undefined,
        checkoutPlatform: checkoutPlatform.trim() || undefined,
        salesPageUrl: salesPageUrl.trim() || undefined,
        adLibraryUrl: adLibraryUrl.trim() || undefined,
        checkoutUrl: checkoutUrl.trim() || undefined,
        advertiserProfileUrl: advertiserProfileUrl.trim() || undefined,
        hook: hook.trim() || undefined,
        headline: headline.trim() || undefined,
        mainPromise: mainPromise.trim() || undefined,
        uniqueMechanism: uniqueMechanism.trim() || undefined,
        targetAudience: targetAudience.trim() || undefined,
        proofsUsed: proofsUsed.trim() || undefined,
        bonuses: bonuses.trim() || undefined,
        guarantee: guarantee.trim() || undefined,
        cta: cta.trim() || undefined,
        tags,
        freeNotes: freeNotes.trim() || undefined
      });
    } catch (err: any) {
      error(err.message || 'Erro ao salvar oferta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-medium text-[#9CA3AF] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancelar e voltar</span>
        </button>

        <h1 className="text-xl font-bold text-white">
          {initialOffer ? 'Editar Oferta' : 'Cadastrar Nova Oferta'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* SECTION 1: INFORMAÇÕES BÁSICAS */}
        <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>1. Informações Básicas da Oferta</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome da oferta */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Nome da Oferta <span className="text-[#22C55E]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: Código Emagrecimento Definitivo 2.0"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Status Atual da Oferta
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OfferStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none cursor-pointer"
              >
                <option value="em_teste">Em teste</option>
                <option value="validada">Validada</option>
                <option value="escalando">Escalando</option>
                <option value="pausada">Pausada</option>
                <option value="morta">Morta</option>
              </select>
            </div>

            {/* Nicho */}
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Nicho</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none cursor-pointer"
              >
                {settings.niches.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                <option value="__custom__">+ Outro Nicho Personalizado</option>
              </select>
              {niche === '__custom__' && (
                <input
                  type="text"
                  placeholder="Digite o nicho..."
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#22C55E]/50 text-xs text-white"
                />
              )}
            </div>

            {/* Tipo de Oferta */}
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Tipo de Oferta
              </label>
              <select
                value={offerType}
                onChange={(e) => setOfferType(e.target.value as OfferType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none cursor-pointer"
              >
                {settings.offerTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Funil */}
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Tipo de Funil
              </label>
              <select
                value={funnelType}
                onChange={(e) => setFunnelType(e.target.value as FunnelType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none cursor-pointer"
              >
                {settings.funnelTypes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preço / Ticket */}
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Preço / Ticket Inicial
              </label>
              <input
                type="text"
                placeholder="Ex.: R$ 97,00 ou $47 USD"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none font-mono-num"
              />
            </div>

            {/* Plataforma de Checkout */}
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Plataforma de Checkout
              </label>
              <input
                type="text"
                placeholder="Ex.: Kiwify, Hotmart, Braip, ClickBank..."
                value={checkoutPlatform}
                onChange={(e) => setCheckoutPlatform(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
              />
            </div>

            {/* País e Idioma */}
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">País</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Idioma</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
              />
            </div>

            {/* Avaliação de Potencial (1 a 5 estrelas) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Nota de Potencial da Oferta (1 a 5 Estrelas)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setPotentialRating(star)}
                    className="p-1 text-2xl hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= potentialRating
                          ? 'fill-[#EAB308] text-[#EAB308]'
                          : 'text-[#374151]'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-[#9CA3AF] ml-2">
                  {potentialRating} de 5 estrelas
                </span>
              </div>
            </div>

            {/* Canais de Tráfego */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Canais de Tráfego Identificados
              </label>
              <div className="flex flex-wrap gap-2">
                {settings.trafficChannels.map((c) => {
                  const isSelected = trafficChannels.includes(c.id as TrafficChannel);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleChannel(c.id as TrafficChannel)}
                      className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#182018] text-[#22C55E] border-[#22C55E]/50 font-semibold'
                          : 'bg-[#0A0D0A] text-[#9CA3AF] border-[#1F2A1F]'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: LINKS DA OFERTA */}
        <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            <span>2. Links e Fontes de Tráfego</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Página de Vendas / TSL / VSL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={salesPageUrl}
                onChange={(e) => setSalesPageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Biblioteca de Anúncios (Meta Ad Library)
              </label>
              <input
                type="url"
                placeholder="https://www.facebook.com/ads/library/..."
                value={adLibraryUrl}
                onChange={(e) => setAdLibraryUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Link do Checkout
              </label>
              <input
                type="url"
                placeholder="https://pay.kiwify.com.br/..."
                value={checkoutUrl}
                onChange={(e) => setCheckoutUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Perfil do Anunciante (Instagram/Facebook/TikTok)
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/..."
                value={advertiserProfileUrl}
                onChange={(e) => setAdvertiserProfileUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ANÁLISE DE COPY & ESTRATÉGIA */}
        <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>3. Análise de Copy & Mecanismo</span>
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Gancho / Hook Principal
              </label>
              <textarea
                rows={2}
                placeholder="O que quebra o padrão e chama a atenção no anúncio ou primeiros segundos..."
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Headline da Página
              </label>
              <input
                type="text"
                placeholder="Título principal da página de vendas"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                  Promessa Principal (Big Promise)
                </label>
                <textarea
                  rows={2}
                  placeholder="O que a oferta promete entregar de forma clara e mensurável..."
                  value={mainPromise}
                  onChange={(e) => setMainPromise(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                  Mecanismo Único (Unique Mechanism)
                </label>
                <textarea
                  rows={2}
                  placeholder="Por que funciona quando tudo mais falhou? (Ex.: 'Ritual matinal das 3 ervas')..."
                  value={uniqueMechanism}
                  onChange={(e) => setUniqueMechanism(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                  Público-Alvo & Dores Mapeadas
                </label>
                <textarea
                  rows={2}
                  placeholder="Homens 35+, mulheres pós-parto, iniciantes em marketing..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                  Provas Usadas (Depoimentos / Estudos)
                </label>
                <textarea
                  rows={2}
                  placeholder="Prints de WhatsApp, antes e depois, referências científicas..."
                  value={proofsUsed}
                  onChange={(e) => setProofsUsed(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Bônus</label>
                <input
                  type="text"
                  placeholder="E-book receitas, Comunidade VIP"
                  value={bonuses}
                  onChange={(e) => setBonuses(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">Garantia</label>
                <input
                  type="text"
                  placeholder="30 dias incondicional"
                  value={guarantee}
                  onChange={(e) => setGuarantee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">CTA Final</label>
                <input
                  type="text"
                  placeholder="Quero Meu Acesso com 50% OFF"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Escalando, VSL Longa, Criativo UGC, Alta Conversão"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                Anotações Pessoais
              </label>
              <textarea
                rows={3}
                placeholder="Insights para modelar, ideias de testes no produto..."
                value={freeNotes}
                onChange={(e) => setFreeNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 sticky bottom-4 z-20 bg-[#111411]/90 backdrop-blur-md p-4 rounded-2xl border border-[#1F2A1F] shadow-2xl">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-medium text-[#9CA3AF] hover:text-white bg-[#1A221A] rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-black bg-[#22C55E] hover:bg-[#4ADE80] rounded-xl transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50 green-glow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gravando no Banco...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Oferta</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

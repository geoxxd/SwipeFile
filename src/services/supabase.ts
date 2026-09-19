import { createClient } from '@supabase/supabase-js';
import { Offer, Collection, AppSettings, FunnelStep, ValidationLog, Competitor, Creative } from '../types/index.ts';

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    envUrl &&
    typeof envUrl === 'string' &&
    envUrl.startsWith('http') &&
    envKey &&
    typeof envKey === 'string' &&
    envKey.length > 10
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(envUrl, envKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

// Helpers to map camelCase <-> snake_case for Supabase
function mapOfferFromDb(row: any, nested?: {
  creatives?: any[];
  competitors?: any[];
  funnelSteps?: any[];
  validationLogs?: any[];
}): Offer {
  return {
    id: row.id,
    name: row.name,
    niche: row.niche,
    country: row.country || 'Brasil',
    language: row.language || 'Português',
    offerType: row.offer_type,
    funnelType: row.funnel_type,
    trafficChannels: row.traffic_channels || [],
    status: row.status,
    ticketPrice: row.ticket_price || '',
    checkoutPlatform: row.checkout_platform || '',
    addedDate: row.added_date,
    salesPageUrl: row.sales_page_url || '',
    checkoutUrl: row.checkout_url || '',
    adLibraryUrl: row.ad_library_url || '',
    advertiserProfileUrl: row.advertiser_profile_url || '',
    extraLinks: row.extra_links || [],
    hook: row.hook || '',
    mainPromise: row.main_promise || '',
    uniqueMechanism: row.unique_mechanism || '',
    targetAudience: row.target_audience || '',
    proofsUsed: row.proofs_used || '',
    bonuses: row.bonuses || '',
    guarantee: row.guarantee || '',
    cta: row.cta || '',
    headline: row.headline || '',
    potentialRating: Number(row.potential_rating) || 3,
    tags: row.tags || [],
    isFavorite: Boolean(row.is_favorite),
    freeNotes: row.free_notes || '',
    checklist: row.checklist || {
      copyAnalyzed: false,
      creativeSaved: false,
      funnelMapped: false,
      competitorsListed: false,
      checkoutTested: false,
      offerSwiped: false
    },
    collectionIds: row.collection_ids || [],
    activeAdsCurrent: Number(row.active_ads_current) || 0,
    daysRunning: Number(row.days_running) || 0,
    isDemo: Boolean(row.is_demo),
    creatives: nested?.creatives || row.creatives?.map(mapCreativeFromDb) || [],
    competitors: nested?.competitors || row.competitors?.map(mapCompetitorFromDb) || [],
    funnelSteps: nested?.funnelSteps || row.funnel_steps?.map(mapFunnelStepFromDb) || [],
    validationLogs: nested?.validationLogs || row.validation_logs?.map(mapValidationLogFromDb) || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOfferToDb(data: Partial<Offer>): any {
  const row: any = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.name !== undefined) row.name = data.name;
  if (data.niche !== undefined) row.niche = data.niche;
  if (data.country !== undefined) row.country = data.country;
  if (data.language !== undefined) row.language = data.language;
  if (data.offerType !== undefined) row.offer_type = data.offerType;
  if (data.funnelType !== undefined) row.funnel_type = data.funnelType;
  if (data.trafficChannels !== undefined) row.traffic_channels = data.trafficChannels;
  if (data.status !== undefined) row.status = data.status;
  if (data.ticketPrice !== undefined) row.ticket_price = data.ticketPrice;
  if (data.checkoutPlatform !== undefined) row.checkout_platform = data.checkoutPlatform;
  if (data.addedDate !== undefined) row.added_date = data.addedDate;
  if (data.salesPageUrl !== undefined) row.sales_page_url = data.salesPageUrl;
  if (data.checkoutUrl !== undefined) row.checkout_url = data.checkoutUrl;
  if (data.adLibraryUrl !== undefined) row.ad_library_url = data.adLibraryUrl;
  if (data.advertiserProfileUrl !== undefined) row.advertiser_profile_url = data.advertiserProfileUrl;
  if (data.extraLinks !== undefined) row.extra_links = data.extraLinks;
  if (data.hook !== undefined) row.hook = data.hook;
  if (data.mainPromise !== undefined) row.main_promise = data.mainPromise;
  if (data.uniqueMechanism !== undefined) row.unique_mechanism = data.uniqueMechanism;
  if (data.targetAudience !== undefined) row.target_audience = data.targetAudience;
  if (data.proofsUsed !== undefined) row.proofs_used = data.proofsUsed;
  if (data.bonuses !== undefined) row.bonuses = data.bonuses;
  if (data.guarantee !== undefined) row.guarantee = data.guarantee;
  if (data.cta !== undefined) row.cta = data.cta;
  if (data.headline !== undefined) row.headline = data.headline;
  if (data.potentialRating !== undefined) row.potential_rating = data.potentialRating;
  if (data.tags !== undefined) row.tags = data.tags;
  if (data.isFavorite !== undefined) row.is_favorite = data.isFavorite;
  if (data.freeNotes !== undefined) row.free_notes = data.freeNotes;
  if (data.checklist !== undefined) row.checklist = data.checklist;
  if (data.collectionIds !== undefined) row.collection_ids = data.collectionIds;
  if (data.activeAdsCurrent !== undefined) row.active_ads_current = data.activeAdsCurrent;
  if (data.daysRunning !== undefined) row.days_running = data.daysRunning;
  if (data.isDemo !== undefined) row.is_demo = data.isDemo;
  row.updated_at = new Date().toISOString();
  return row;
}

function mapCreativeFromDb(row: any): Creative {
  return {
    id: row.id,
    offerId: row.offer_id,
    competitorId: row.competitor_id || null,
    title: row.title,
    fileUrl: row.file_url,
    thumbnailUrl: row.thumbnail_url || undefined,
    fileType: row.file_type,
    mimeType: row.mime_type,
    externalProvider: row.external_provider || null,
    creativeType: row.creative_type,
    hook3s: row.hook_3s || '',
    cta: row.cta || '',
    script: row.script || '',
    notes: row.notes || '',
    sourceType: row.source_type || 'propria_oferta',
    tags: row.tags || [],
    fileSizeBytes: row.file_size_bytes ? Number(row.file_size_bytes) : undefined,
    createdAt: row.created_at
  };
}

function mapCreativeToDb(c: Partial<Creative>): any {
  const row: any = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.offerId !== undefined) row.offer_id = c.offerId;
  if (c.competitorId !== undefined) row.competitor_id = c.competitorId;
  if (c.title !== undefined) row.title = c.title;
  if (c.fileUrl !== undefined) row.file_url = c.fileUrl;
  if (c.thumbnailUrl !== undefined) row.thumbnail_url = c.thumbnailUrl;
  if (c.fileType !== undefined) row.file_type = c.fileType;
  if (c.mimeType !== undefined) row.mime_type = c.mimeType;
  if (c.externalProvider !== undefined) row.external_provider = c.externalProvider;
  if (c.creativeType !== undefined) row.creative_type = c.creativeType;
  if (c.hook3s !== undefined) row.hook_3s = c.hook3s;
  if (c.cta !== undefined) row.cta = c.cta;
  if (c.script !== undefined) row.script = c.script;
  if (c.notes !== undefined) row.notes = c.notes;
  if (c.sourceType !== undefined) row.source_type = c.sourceType;
  if (c.tags !== undefined) row.tags = c.tags;
  if (c.fileSizeBytes !== undefined) row.file_size_bytes = c.fileSizeBytes;
  return row;
}

function mapCompetitorFromDb(row: any): Competitor {
  return {
    id: row.id,
    offerId: row.offer_id,
    name: row.name,
    salesPageUrl: row.sales_page_url || '',
    adLibraryUrl: row.ad_library_url || '',
    profileUrl: row.profile_url || '',
    activeAdsCount: Number(row.active_ads_count) || 0,
    dateIdentified: row.date_identified || '',
    status: row.status || 'ativo',
    differencesNotes: row.differences_notes || '',
    creatives: [],
    createdAt: row.created_at
  };
}

function mapCompetitorToDb(c: Partial<Competitor>): any {
  const row: any = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.offerId !== undefined) row.offer_id = c.offerId;
  if (c.name !== undefined) row.name = c.name;
  if (c.salesPageUrl !== undefined) row.sales_page_url = c.salesPageUrl;
  if (c.adLibraryUrl !== undefined) row.ad_library_url = c.adLibraryUrl;
  if (c.profileUrl !== undefined) row.profile_url = c.profileUrl;
  if (c.activeAdsCount !== undefined) row.active_ads_count = c.activeAdsCount;
  if (c.dateIdentified !== undefined) row.date_identified = c.dateIdentified;
  if (c.status !== undefined) row.status = c.status;
  if (c.differencesNotes !== undefined) row.differences_notes = c.differencesNotes;
  return row;
}

function mapFunnelStepFromDb(row: any): FunnelStep {
  return {
    id: row.id,
    offerId: row.offer_id,
    order: Number(row.order_num) || 1,
    type: row.type,
    name: row.name,
    price: row.price || '',
    url: row.url || '',
    notes: row.notes || ''
  };
}

function mapValidationLogFromDb(row: any): ValidationLog {
  return {
    id: row.id,
    offerId: row.offer_id,
    date: row.date,
    activeAdsCount: Number(row.active_ads_count) || 0,
    notes: row.notes || '',
    createdAt: row.created_at
  };
}

function mapCollectionFromDb(row: any): Collection {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    color: row.color || '#22C55E',
    offerIds: row.offer_ids || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// -----------------------------------------------------------------------------
// SUPABASE OPERATIONS
// -----------------------------------------------------------------------------

export const supabaseService = {
  // Offers
  async getOffers(params?: Record<string, any>): Promise<Offer[]> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    let query = supabase
      .from('offers')
      .select('*, creatives(*), competitors(*), funnel_steps(*), validation_logs(*)')
      .order('created_at', { ascending: false });

    if (params?.status && params.status !== 'todos') {
      query = query.eq('status', params.status);
    }
    if (params?.niche && params.niche !== 'todos') {
      query = query.eq('niche', params.niche);
    }
    if (params?.isFavorite === true || params?.isFavorite === 'true') {
      query = query.eq('is_favorite', true);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let offers = (data || []).map((row) => mapOfferFromDb(row));

    if (params?.search) {
      const s = String(params.search).toLowerCase();
      offers = offers.filter(
        (o) =>
          o.name.toLowerCase().includes(s) ||
          o.niche.toLowerCase().includes(s) ||
          o.tags.some((t) => t.toLowerCase().includes(s))
      );
    }

    return offers;
  },

  async getOfferById(id: string): Promise<Offer> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { data, error } = await supabase
      .from('offers')
      .select('*, creatives(*), competitors(*), funnel_steps(*), validation_logs(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return mapOfferFromDb(data);
  },

  async createOffer(offerData: Partial<Offer>): Promise<Offer> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const id = offerData.id || `off_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const fullData: Partial<Offer> = {
      ...offerData,
      id,
      addedDate: offerData.addedDate || new Date().toISOString().split('T')[0],
      checklist: offerData.checklist || {
        copyAnalyzed: false,
        creativeSaved: false,
        funnelMapped: false,
        competitorsListed: false,
        checkoutTested: false,
        offerSwiped: false
      },
      tags: offerData.tags || [],
      collectionIds: offerData.collectionIds || []
    };

    const row = mapOfferToDb(fullData);
    row.id = id;
    row.created_at = new Date().toISOString();

    const { data, error } = await supabase.from('offers').insert(row).select().single();
    if (error) throw new Error(error.message);

    return mapOfferFromDb(data);
  },

  async updateOffer(id: string, updates: Partial<Offer>): Promise<Offer> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const row = mapOfferToDb(updates);
    const { data, error } = await supabase.from('offers').update(row).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return this.getOfferById(id);
  },

  async deleteOffer(id: string): Promise<{ success: boolean; message: string }> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, message: 'Oferta excluída com sucesso.' };
  },

  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    const offer = await this.getOfferById(id);
    const updated = !offer.isFavorite;
    await this.updateOffer(id, { isFavorite: updated });
    return { isFavorite: updated };
  },

  // Creatives
  async addCreative(offerId: string, creative: Partial<Creative>): Promise<Creative> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const id = creative.id || `cr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const row = mapCreativeToDb({
      ...creative,
      id,
      offerId,
      createdAt: new Date().toISOString()
    });

    const { data, error } = await supabase.from('creatives').insert(row).select().single();
    if (error) throw new Error(error.message);

    return mapCreativeFromDb(data);
  },

  async updateCreative(creativeId: string, updates: Partial<Creative>): Promise<Creative> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const row = mapCreativeToDb(updates);
    const { data, error } = await supabase.from('creatives').update(row).eq('id', creativeId).select().single();
    if (error) throw new Error(error.message);
    return mapCreativeFromDb(data);
  },

  async deleteCreative(creativeId: string): Promise<{ success: boolean }> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { error } = await supabase.from('creatives').delete().eq('id', creativeId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // Competitors
  async addCompetitor(offerId: string, comp: Partial<Competitor>): Promise<Competitor> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const id = comp.id || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const row = mapCompetitorToDb({
      ...comp,
      id,
      offerId,
      createdAt: new Date().toISOString()
    });

    const { data, error } = await supabase.from('competitors').insert(row).select().single();
    if (error) throw new Error(error.message);
    return mapCompetitorFromDb(data);
  },

  async updateCompetitor(compId: string, updates: Partial<Competitor>): Promise<Competitor> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const row = mapCompetitorToDb(updates);
    const { data, error } = await supabase.from('competitors').update(row).eq('id', compId).select().single();
    if (error) throw new Error(error.message);
    return mapCompetitorFromDb(data);
  },

  async deleteCompetitor(compId: string): Promise<{ success: boolean }> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { error } = await supabase.from('competitors').delete().eq('id', compId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // Funnel
  async addFunnelStep(offerId: string, step: Omit<FunnelStep, 'id' | 'offerId'>): Promise<FunnelStep> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const id = `step_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const { data, error } = await supabase
      .from('funnel_steps')
      .insert({
        id,
        offer_id: offerId,
        order_num: step.order || 1,
        type: step.type,
        name: step.name,
        price: step.price || '',
        url: step.url || '',
        notes: step.notes || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapFunnelStepFromDb(data);
  },

  async updateFunnelStep(stepId: string, updates: Partial<FunnelStep>): Promise<FunnelStep> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.order !== undefined) payload.order_num = updates.order;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.url !== undefined) payload.url = updates.url;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { data, error } = await supabase.from('funnel_steps').update(payload).eq('id', stepId).select().single();
    if (error) throw new Error(error.message);
    return mapFunnelStepFromDb(data);
  },

  async deleteFunnelStep(stepId: string): Promise<{ success: boolean }> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { error } = await supabase.from('funnel_steps').delete().eq('id', stepId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // Validation Logs
  async addValidationLog(offerId: string, log: { date: string; activeAdsCount: number; notes?: string }): Promise<ValidationLog> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const id = `val_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const { data, error } = await supabase
      .from('validation_logs')
      .insert({
        id,
        offer_id: offerId,
        date: log.date,
        active_ads_count: log.activeAdsCount,
        notes: log.notes || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update offer's active_ads_current
    await supabase.from('offers').update({ active_ads_current: log.activeAdsCount }).eq('id', offerId);

    return mapValidationLogFromDb(data);
  },

  async deleteValidationLog(logId: string): Promise<{ success: boolean }> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { error } = await supabase.from('validation_logs').delete().eq('id', logId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // Collections
  async getCollections(): Promise<Collection[]> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { data, error } = await supabase.from('collections').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(mapCollectionFromDb);
  },

  async getCollectionById(id: string): Promise<Collection> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { data, error } = await supabase.from('collections').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return mapCollectionFromDb(data);
  },

  async createCollection(col: Partial<Collection>): Promise<Collection> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const id = col.id || `col_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const { data, error } = await supabase
      .from('collections')
      .insert({
        id,
        name: col.name,
        description: col.description || '',
        color: col.color || '#22C55E',
        offer_ids: col.offerIds || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapCollectionFromDb(data);
  },

  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.offerIds !== undefined) payload.offer_ids = updates.offerIds;

    const { data, error } = await supabase.from('collections').update(payload).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapCollectionFromDb(data);
  },

  async deleteCollection(id: string): Promise<{ success: boolean }> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async toggleOfferInCollection(collectionId: string, offerId: string): Promise<{ success: boolean }> {
    const col = await this.getCollectionById(collectionId);
    let newOfferIds: string[];
    if (col.offerIds.includes(offerId)) {
      newOfferIds = col.offerIds.filter((id) => id !== offerId);
    } else {
      newOfferIds = [...col.offerIds, offerId];
    }
    await this.updateCollection(collectionId, { offerIds: newOfferIds });
    return { success: true };
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const defaultChannels: { id: any; label: string }[] = [
      { id: 'facebook_instagram', label: 'Facebook / Instagram Ads' },
      { id: 'tiktok', label: 'TikTok Ads' },
      { id: 'youtube', label: 'YouTube Ads' },
      { id: 'google', label: 'Google Search / Display' },
      { id: 'native', label: 'Taboola / Outbrain (Native)' },
      { id: 'outros', label: 'Kwai / Pinterest / Outros' }
    ];

    const defaultOfferTypes: { id: any; label: string }[] = [
      { id: 'infoproduto', label: 'Infoproduto (Curso/Ebook)' },
      { id: 'infoapp', label: 'Infoapp / Web App' },
      { id: 'suplemento', label: 'Suplemento / Físico' },
      { id: 'low_ticket', label: 'Low Ticket / Front-end' },
      { id: 'quiz', label: 'Funil de Quiz' },
      { id: 'webinar', label: 'Webinar / High Ticket' },
      { id: 'outro', label: 'Outro Modelo' }
    ];

    const defaultFunnelTypes: { id: any; label: string }[] = [
      { id: 'vsl', label: 'VSL (Vídeo de Vendas)' },
      { id: 'quiz', label: 'Quiz Interativo' },
      { id: 'pagina_direta', label: 'Página Direta (TSL)' },
      { id: 'advertorial', label: 'Advertorial + Oferta' },
      { id: 'webinar', label: 'Webinar Gravado / Ao Vivo' },
      { id: 'carta_vendas', label: 'Carta de Vendas Longa' },
      { id: 'outro', label: 'Outro Funil' }
    ];

    if (!supabase) throw new Error('Supabase client não inicializado.');
    const { data, error } = await supabase.from('settings').select('*').eq('id', 'default').single();
    if (error || !data) {
      return {
        appName: 'SWIPE',
        shareMode: 'public',
        accessCode: '1234',
        uploadSizeLimitMB: 500,
        niches: ['Saúde & Emagrecimento', 'Renda Extra & Finanças', 'Relacionamentos', 'Desenvolvimento Pessoal', 'Negócios & Vendas', 'Estética & Beleza', 'Tecnologia & IA', 'Outros'],
        trafficChannels: defaultChannels,
        offerTypes: defaultOfferTypes,
        funnelTypes: defaultFunnelTypes
      };
    }
    return {
      appName: data.app_name || 'SWIPE',
      shareMode: data.share_mode || 'public',
      accessCode: data.access_code || '1234',
      uploadSizeLimitMB: data.upload_size_limit_mb || 500,
      niches: data.niches || ['Saúde & Emagrecimento', 'Renda Extra & Finanças', 'Relacionamentos', 'Desenvolvimento Pessoal', 'Negócios & Vendas', 'Estética & Beleza', 'Tecnologia & IA', 'Outros'],
      trafficChannels: defaultChannels,
      offerTypes: defaultOfferTypes,
      funnelTypes: defaultFunnelTypes
    };
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const payload: any = { updated_at: new Date().toISOString() };
    if (settings.appName !== undefined) payload.app_name = settings.appName;
    if (settings.shareMode !== undefined) payload.share_mode = settings.shareMode;
    if (settings.accessCode !== undefined) payload.access_code = settings.accessCode;
    if (settings.uploadSizeLimitMB !== undefined) payload.upload_size_limit_mb = settings.uploadSizeLimitMB;
    if (settings.niches !== undefined) payload.niches = settings.niches;

    const { error } = await supabase.from('settings').upsert({ id: 'default', ...payload });
    if (error) throw new Error(error.message);
    return this.getSettings();
  },

  // Stats
  async getStats(): Promise<{
    totalOffers: number;
    statusCounts: Record<string, number>;
    totalCreatives: number;
    totalCompetitors: number;
    totalCollections: number;
  }> {
    if (!supabase) throw new Error('Supabase client não inicializado.');
    const [offersRes, creativesRes, competitorsRes, collectionsRes] = await Promise.all([
      supabase.from('offers').select('status'),
      supabase.from('creatives').select('id', { count: 'exact', head: true }),
      supabase.from('competitors').select('id', { count: 'exact', head: true }),
      supabase.from('collections').select('id', { count: 'exact', head: true })
    ]);

    const offers = offersRes.data || [];
    const statusCounts: Record<string, number> = {
      validada: 0,
      em_teste: 0,
      escalando: 0,
      pausada: 0,
      morta: 0
    };
    offers.forEach((o) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    return {
      totalOffers: offers.length,
      statusCounts,
      totalCreatives: creativesRes.count || 0,
      totalCompetitors: competitorsRes.count || 0,
      totalCollections: collectionsRes.count || 0
    };
  },

  // Storage Upload: directly to bucket 'creatives'
  async uploadFile(
    file: File | Blob,
    onProgress?: (percent: number) => void,
    customFilename?: string
  ): Promise<{
    fileUrl: string;
    filename: string;
    fileType: 'image' | 'video';
    mimeType: string;
    sizeBytes: number;
  }> {
    if (!supabase) throw new Error('Supabase client não inicializado.');

    const origName = customFilename || (file instanceof File ? file.name : 'thumbnail.jpg');
    const cleanBase = origName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const filePath = `uploads/${timestamp}-${cleanBase}`;

    let mimeType = file.type || 'image/jpeg';
    if (!mimeType && origName.endsWith('.mp4')) mimeType = 'video/mp4';
    if (!mimeType && (origName.endsWith('.jpg') || origName.endsWith('.jpeg'))) mimeType = 'image/jpeg';
    if (!mimeType && origName.endsWith('.png')) mimeType = 'image/png';
    if (!mimeType && origName.endsWith('.webp')) mimeType = 'image/webp';

    const isVideo = mimeType.startsWith('video/') || origName.endsWith('.mp4') || origName.endsWith('.mov') || origName.endsWith('.webm');
    const fileType = isVideo ? 'video' : 'image';

    if (onProgress) onProgress(20);

    const { error } = await supabase.storage.from('creatives').upload(filePath, file, {
      contentType: mimeType,
      upsert: true
    });

    if (error) {
      throw new Error(`Erro ao enviar arquivo para o Supabase Storage: ${error.message}`);
    }

    if (onProgress) onProgress(90);

    const { data: publicUrlData } = supabase.storage.from('creatives').getPublicUrl(filePath);

    if (onProgress) onProgress(100);

    return {
      fileUrl: publicUrlData.publicUrl,
      filename: origName,
      fileType,
      mimeType,
      sizeBytes: file.size || 0
    };
  }
};

import { Offer, Collection, AppSettings, FunnelStep, ValidationLog, Competitor, Creative } from '../types/index.ts';
import { initialOffers, initialCollections, initialSettings } from '../../server/seed.ts';

const OFFERS_KEY = 'swipe_client_offers';
const COLLECTIONS_KEY = 'swipe_client_collections';
const SETTINGS_KEY = 'swipe_client_settings';

export const clientStorage = {
  getSettings(): AppSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialSettings;
  },

  updateSettings(updates: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  getOffers(params?: Record<string, any>): Offer[] {
    try {
      const saved = localStorage.getItem(OFFERS_KEY);
      let list: Offer[] = saved ? JSON.parse(saved) : null;
      if (!list || !Array.isArray(list) || list.length === 0) {
        list = initialOffers;
        localStorage.setItem(OFFERS_KEY, JSON.stringify(list));
      }

      if (params?.status && params.status !== 'todos' && params.status !== 'all') {
        list = list.filter((o) => o.status === params.status);
      }
      if (params?.niche && params.niche !== 'todos' && params.niche !== 'all') {
        list = list.filter((o) => o.niche === params.niche);
      }
      if (params?.search) {
        const q = String(params.search).toLowerCase();
        list = list.filter(
          (o) =>
            o.name.toLowerCase().includes(q) ||
            (o.headline && o.headline.toLowerCase().includes(q)) ||
            (o.hook && o.hook.toLowerCase().includes(q)) ||
            o.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      return list;
    } catch {
      return initialOffers;
    }
  },

  getOfferById(id: string): Offer | null {
    const list = this.getOffers();
    return list.find((o) => o.id === id) || null;
  },

  createOffer(data: Partial<Offer>): Offer {
    const offers = this.getOffers();
    const id = data.id || `off_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const newOffer: Offer = {
      id,
      name: data.name || 'Nova Oferta',
      niche: data.niche || 'Marketing Digital & Tráfego',
      country: data.country || 'Brasil',
      language: data.language || 'Português (BR)',
      offerType: data.offerType || 'infoproduto',
      funnelType: data.funnelType || 'vsl',
      trafficChannels: data.trafficChannels || ['facebook_instagram'],
      status: data.status || 'em_teste',
      ticketPrice: data.ticketPrice || '',
      checkoutPlatform: data.checkoutPlatform || '',
      addedDate: data.addedDate || today,
      salesPageUrl: data.salesPageUrl || '',
      checkoutUrl: data.checkoutUrl || '',
      adLibraryUrl: data.adLibraryUrl || '',
      advertiserProfileUrl: data.advertiserProfileUrl || '',
      extraLinks: data.extraLinks || [],
      hook: data.hook || '',
      mainPromise: data.mainPromise || '',
      uniqueMechanism: data.uniqueMechanism || '',
      targetAudience: data.targetAudience || '',
      proofsUsed: data.proofsUsed || '',
      bonuses: data.bonuses || '',
      guarantee: data.guarantee || '',
      cta: data.cta || '',
      headline: data.headline || '',
      potentialRating: data.potentialRating ?? 3,
      tags: data.tags || [],
      isFavorite: !!data.isFavorite,
      freeNotes: data.freeNotes || '',
      checklist: data.checklist || {
        copyAnalyzed: false,
        creativeSaved: false,
        funnelMapped: false,
        competitorsListed: false,
        checkoutTested: false,
        offerSwiped: false
      },
      collectionIds: data.collectionIds || [],
      isDemo: false,
      creatives: data.creatives || [],
      competitors: data.competitors || [],
      funnelSteps: data.funnelSteps || [],
      validationLogs: data.validationLogs || [],
      createdAt: now,
      updatedAt: now
    };

    const nextList = [newOffer, ...offers];
    try {
      localStorage.setItem(OFFERS_KEY, JSON.stringify(nextList));
    } catch {}
    return newOffer;
  },

  updateOffer(id: string, updates: Partial<Offer>): Offer {
    const offers = this.getOffers();
    const index = offers.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Oferta não encontrada.');

    const updated: Offer = {
      ...offers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    offers[index] = updated;
    try {
      localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
    } catch {}
    return updated;
  },

  deleteOffer(id: string): { success: boolean; message: string } {
    const offers = this.getOffers().filter((o) => o.id !== id);
    try {
      localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
    } catch {}
    return { success: true, message: 'Oferta excluída com sucesso.' };
  },

  toggleFavorite(id: string): { isFavorite: boolean } {
    const offer = this.getOfferById(id);
    if (!offer) throw new Error('Oferta não encontrada.');
    const updated = !offer.isFavorite;
    this.updateOffer(id, { isFavorite: updated });
    return { isFavorite: updated };
  },

  // Funnel
  addFunnelStep(offerId: string, step: Omit<FunnelStep, 'id' | 'offerId'>): FunnelStep {
    const offer = this.getOfferById(offerId);
    if (!offer) throw new Error('Oferta não encontrada.');
    const newStep: FunnelStep = {
      ...step,
      id: `fs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      offerId
    };
    const newSteps = [...(offer.funnelSteps || []), newStep];
    this.updateOffer(offerId, { funnelSteps: newSteps });
    return newStep;
  },

  updateFunnelStep(stepId: string, updates: Partial<FunnelStep>): FunnelStep {
    const offers = this.getOffers();
    for (const o of offers) {
      if (o.funnelSteps) {
        const idx = o.funnelSteps.findIndex((s) => s.id === stepId);
        if (idx !== -1) {
          o.funnelSteps[idx] = { ...o.funnelSteps[idx], ...updates };
          try {
            localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
          } catch {}
          return o.funnelSteps[idx];
        }
      }
    }
    throw new Error('Etapa de funil não encontrada.');
  },

  deleteFunnelStep(stepId: string): { success: boolean } {
    const offers = this.getOffers();
    for (const o of offers) {
      if (o.funnelSteps) {
        o.funnelSteps = o.funnelSteps.filter((s) => s.id !== stepId);
      }
    }
    try {
      localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
    } catch {}
    return { success: true };
  },

  // Creatives
  addCreative(offerId: string, creative: Partial<Creative>): Creative {
    const offer = this.getOfferById(offerId);
    if (!offer) throw new Error('Oferta não encontrada.');
    const newCr: Creative = {
      id: `cr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      offerId,
      competitorId: creative.competitorId || null,
      title: creative.title || 'Criativo sem título',
      fileUrl: creative.fileUrl || '',
      thumbnailUrl: creative.thumbnailUrl,
      fileType: creative.fileType || 'image',
      mimeType: creative.mimeType || 'image/jpeg',
      externalProvider: creative.externalProvider || null,
      creativeType: creative.creativeType || 'imagem_estatica',
      hook3s: creative.hook3s || '',
      cta: creative.cta || '',
      script: creative.script || '',
      notes: creative.notes || '',
      sourceType: creative.sourceType || 'propria_oferta',
      tags: creative.tags || [],
      fileSizeBytes: creative.fileSizeBytes,
      createdAt: new Date().toISOString()
    };

    const newCreatives = [newCr, ...(offer.creatives || [])];
    this.updateOffer(offerId, { creatives: newCreatives });
    return newCr;
  },

  updateCreative(creativeId: string, updates: Partial<Creative>): Creative {
    const offers = this.getOffers();
    for (const o of offers) {
      if (o.creatives) {
        const idx = o.creatives.findIndex((c) => c.id === creativeId);
        if (idx !== -1) {
          o.creatives[idx] = { ...o.creatives[idx], ...updates };
          try {
            localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
          } catch {}
          return o.creatives[idx];
        }
      }
    }
    throw new Error('Criativo não encontrado.');
  },

  deleteCreative(creativeId: string): { success: boolean } {
    const offers = this.getOffers();
    for (const o of offers) {
      if (o.creatives) {
        o.creatives = o.creatives.filter((c) => c.id !== creativeId);
      }
    }
    try {
      localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
    } catch {}
    return { success: true };
  },

  // Competitors
  addCompetitor(offerId: string, comp: Partial<Competitor>): Competitor {
    const offer = this.getOfferById(offerId);
    if (!offer) throw new Error('Oferta não encontrada.');
    const newComp: Competitor = {
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      offerId,
      name: comp.name || 'Concorrente',
      salesPageUrl: comp.salesPageUrl || '',
      adLibraryUrl: comp.adLibraryUrl || '',
      profileUrl: comp.profileUrl || '',
      activeAdsCount: comp.activeAdsCount || 0,
      dateIdentified: comp.dateIdentified || new Date().toISOString().slice(0, 10),
      status: comp.status || 'ativo',
      differencesNotes: comp.differencesNotes || '',
      creatives: [],
      createdAt: new Date().toISOString()
    };
    const newComps = [...(offer.competitors || []), newComp];
    this.updateOffer(offerId, { competitors: newComps });
    return newComp;
  },

  updateCompetitor(compId: string, updates: Partial<Competitor>): Competitor {
    const offers = this.getOffers();
    for (const o of offers) {
      if (o.competitors) {
        const idx = o.competitors.findIndex((c) => c.id === compId);
        if (idx !== -1) {
          o.competitors[idx] = { ...o.competitors[idx], ...updates };
          try {
            localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
          } catch {}
          return o.competitors[idx];
        }
      }
    }
    throw new Error('Concorrente não encontrado.');
  },

  deleteCompetitor(compId: string): { success: boolean } {
    const offers = this.getOffers();
    for (const o of offers) {
      if (o.competitors) {
        o.competitors = o.competitors.filter((c) => c.id !== compId);
      }
    }
    try {
      localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
    } catch {}
    return { success: true };
  },

  // Validation
  addValidationLog(offerId: string, log: { date: string; activeAdsCount: number; notes?: string }): ValidationLog {
    const offer = this.getOfferById(offerId);
    if (!offer) throw new Error('Oferta não encontrada.');
    const newLog: ValidationLog = {
      id: `val_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      offerId,
      date: log.date,
      activeAdsCount: log.activeAdsCount,
      notes: log.notes || '',
      createdAt: new Date().toISOString()
    };
    const newLogs = [...(offer.validationLogs || []), newLog];
    this.updateOffer(offerId, {
      validationLogs: newLogs,
      activeAdsCurrent: log.activeAdsCount
    });
    return newLog;
  },

  deleteValidationLog(logId: string): { success: boolean } {
    const offers = this.getOffers();
    for (const o of offers) {
      if (o.validationLogs) {
        o.validationLogs = o.validationLogs.filter((v) => v.id !== logId);
      }
    }
    try {
      localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
    } catch {}
    return { success: true };
  },

  // Collections
  getCollections(): Collection[] {
    try {
      const saved = localStorage.getItem(COLLECTIONS_KEY);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(initialCollections));
      return initialCollections;
    } catch {
      return initialCollections;
    }
  },

  getCollectionById(id: string): Collection | null {
    const list = this.getCollections();
    return list.find((c) => c.id === id) || null;
  },

  createCollection(col: Partial<Collection>): Collection {
    const list = this.getCollections();
    const newCol: Collection = {
      id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: col.name || 'Nova Coleção',
      description: col.description || '',
      color: col.color || '#22C55E',
      offerIds: col.offerIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const next = [newCol, ...list];
    try {
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
    } catch {}
    return newCol;
  },

  updateCollection(id: string, updates: Partial<Collection>): Collection {
    const list = this.getCollections();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Coleção não encontrada.');
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    try {
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(list));
    } catch {}
    return list[idx];
  },

  deleteCollection(id: string): { success: boolean } {
    const list = this.getCollections().filter((c) => c.id !== id);
    try {
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(list));
    } catch {}
    return { success: true };
  },

  toggleOfferInCollection(collectionId: string, offerId: string): { success: boolean } {
    const col = this.getCollectionById(collectionId);
    if (!col) return { success: false };
    const has = col.offerIds.includes(offerId);
    const newOfferIds = has ? col.offerIds.filter((id) => id !== offerId) : [...col.offerIds, offerId];
    this.updateCollection(collectionId, { offerIds: newOfferIds });
    return { success: true };
  },

  // Stats
  getStats() {
    const offers = this.getOffers();
    const statusCounts: Record<string, number> = {
      validada: 0,
      em_teste: 0,
      escalando: 0,
      pausada: 0,
      morta: 0
    };

    let totalCreatives = 0;
    let totalCompetitors = 0;

    for (const o of offers) {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
      totalCreatives += o.creatives?.length || 0;
      totalCompetitors += o.competitors?.length || 0;
    }

    return {
      totalOffers: offers.length,
      statusCounts,
      totalCreatives,
      totalCompetitors,
      totalCollections: this.getCollections().length
    };
  },

  // Upload fallback: file to dataURL or blob URL
  async uploadFile(file: File | Blob, onProgress?: (p: number) => void): Promise<{
    fileUrl: string;
    filename: string;
    fileType: 'image' | 'video';
    mimeType: string;
    sizeBytes: number;
  }> {
    if (onProgress) onProgress(30);
    return new Promise((resolve, reject) => {
      const isVideo = file.type.startsWith('video/');
      const filename = file instanceof File ? file.name : `file-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`;

      // For larger files (like videos), URL.createObjectURL is much faster and doesn't explode localStorage
      if (file.size > 2 * 1024 * 1024 || isVideo) {
        const objectUrl = URL.createObjectURL(file);
        if (onProgress) onProgress(100);
        resolve({
          fileUrl: objectUrl,
          filename,
          fileType: isVideo ? 'video' : 'image',
          mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          sizeBytes: file.size
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve({
          fileUrl: reader.result as string,
          filename,
          fileType: isVideo ? 'video' : 'image',
          mimeType: file.type || 'image/jpeg',
          sizeBytes: file.size
        });
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo no navegador.'));
      reader.readAsDataURL(file);
    });
  }
};

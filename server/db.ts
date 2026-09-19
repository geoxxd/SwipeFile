import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Offer, Collection, AppSettings, FunnelStep, ValidationLog, Competitor, Creative } from '../src/types/index.ts';
import { initialOffers, initialCollections, initialSettings } from './seed.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

export interface DatabaseSchema {
  settings: AppSettings;
  offers: Offer[];
  funnelSteps: FunnelStep[];
  validationLogs: ValidationLog[];
  competitors: Competitor[];
  creatives: Creative[];
  collections: Collection[];
  ownerUser: {
    email: string;
    passwordHash: string; // simple hash or plain for demo owner
  };
}

class DatabaseManager {
  private db: DatabaseSchema | null = null;

  constructor() {
    this.ensureDirs();
    this.load();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
      } else {
        this.seedInitial();
      }
    } catch (err) {
      console.error('Error reading database file, re-seeding:', err);
      this.seedInitial();
    }
  }

  public seedInitial() {
    // Extract normalized relational tables from seed
    const allFunnelSteps: FunnelStep[] = [];
    const allValidationLogs: ValidationLog[] = [];
    const allCompetitors: Competitor[] = [];
    const allCreatives: Creative[] = [];
    const cleanedOffers: Offer[] = [];

    for (const off of initialOffers) {
      if (off.funnelSteps) allFunnelSteps.push(...off.funnelSteps);
      if (off.validationLogs) allValidationLogs.push(...off.validationLogs);
      if (off.competitors) {
        for (const comp of off.competitors) {
          if (comp.creatives) allCreatives.push(...comp.creatives);
          const { creatives: _, ...compData } = comp;
          allCompetitors.push(compData);
        }
      }
      if (off.creatives) allCreatives.push(...off.creatives);

      const { funnelSteps: _1, validationLogs: _2, competitors: _3, creatives: _4, ...baseOffer } = off;
      cleanedOffers.push(baseOffer as Offer);
    }

    this.db = {
      settings: initialSettings,
      offers: cleanedOffers,
      funnelSteps: allFunnelSteps,
      validationLogs: allValidationLogs,
      competitors: allCompetitors,
      creatives: allCreatives,
      collections: initialCollections,
      ownerUser: {
        email: 'dono@swipe.com',
        passwordHash: 'admin123'
      }
    };
    this.persist();
  }

  private persist() {
    if (!this.db) return;
    this.ensureDirs();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(this.db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // --- SETTINGS & AUTH ---
  public getSettings(): AppSettings {
    return this.db!.settings;
  }

  public updateSettings(updates: Partial<AppSettings>): AppSettings {
    this.db!.settings = { ...this.db!.settings, ...updates };
    this.persist();
    return this.db!.settings;
  }

  public getOwner() {
    return this.db!.ownerUser;
  }

  public updateOwnerPassword(newPassword: string) {
    this.db!.ownerUser.passwordHash = newPassword;
    this.persist();
  }

  // --- OFFERS ---
  private hydrateOffer(base: Offer): Offer {
    const funnelSteps = this.db!.funnelSteps
      .filter((s) => s.offerId === base.id)
      .sort((a, b) => a.order - b.order);

    const validationLogs = this.db!.validationLogs
      .filter((v) => v.offerId === base.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const competitors = this.db!.competitors
      .filter((c) => c.offerId === base.id)
      .map((comp) => ({
        ...comp,
        creatives: this.db!.creatives.filter((cr) => cr.competitorId === comp.id)
      }));

    const creatives = this.db!.creatives.filter((cr) => cr.offerId === base.id);

    // Calculate days running and active ads current
    let daysRunning = 0;
    let activeAdsCurrent = 0;

    if (validationLogs.length > 0) {
      const firstDate = new Date(validationLogs[0].date).getTime();
      const now = Date.now();
      daysRunning = Math.max(0, Math.floor((now - firstDate) / (1000 * 60 * 60 * 24)));
      activeAdsCurrent = validationLogs[validationLogs.length - 1].activeAdsCount;
    } else if (base.addedDate) {
      const firstDate = new Date(base.addedDate).getTime();
      const now = Date.now();
      daysRunning = Math.max(0, Math.floor((now - firstDate) / (1000 * 60 * 60 * 24)));
    }

    return {
      ...base,
      funnelSteps,
      validationLogs,
      competitors,
      creatives,
      daysRunning,
      activeAdsCurrent
    };
  }

  public getOffers(filters?: {
    search?: string;
    niche?: string;
    offerType?: string;
    funnelType?: string;
    trafficChannel?: string;
    status?: string;
    country?: string;
    tag?: string;
    isFavorite?: boolean;
    minRating?: number;
    collectionId?: string;
    sortBy?: 'recent' | 'rating' | 'active_ads' | 'name';
  }): Offer[] {
    let list = this.db!.offers.map((o) => this.hydrateOffer(o));

    if (!filters) return list;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.headline && o.headline.toLowerCase().includes(q)) ||
          (o.hook && o.hook.toLowerCase().includes(q)) ||
          (o.uniqueMechanism && o.uniqueMechanism.toLowerCase().includes(q)) ||
          (o.niche && o.niche.toLowerCase().includes(q)) ||
          o.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.niche && filters.niche !== 'all') {
      list = list.filter((o) => o.niche === filters.niche);
    }
    if (filters.offerType && filters.offerType !== 'all') {
      list = list.filter((o) => o.offerType === filters.offerType);
    }
    if (filters.funnelType && filters.funnelType !== 'all') {
      list = list.filter((o) => o.funnelType === filters.funnelType);
    }
    if (filters.trafficChannel && filters.trafficChannel !== 'all') {
      list = list.filter((o) => o.trafficChannels.includes(filters.trafficChannel as any));
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter((o) => o.status === filters.status);
    }
    if (filters.country && filters.country !== 'all') {
      list = list.filter((o) => o.country.toLowerCase().includes(filters.country!.toLowerCase()));
    }
    if (filters.tag && filters.tag !== 'all') {
      list = list.filter((o) => o.tags.includes(filters.tag!));
    }
    if (filters.isFavorite !== undefined) {
      list = list.filter((o) => o.isFavorite === filters.isFavorite);
    }
    if (filters.minRating) {
      list = list.filter((o) => (o.potentialRating || 0) >= filters.minRating!);
    }
    if (filters.collectionId && filters.collectionId !== 'all') {
      const col = this.db!.collections.find((c) => c.id === filters.collectionId);
      if (col) {
        list = list.filter((o) => col.offerIds.includes(o.id));
      }
    }

    // Sort
    if (filters.sortBy === 'rating') {
      list.sort((a, b) => (b.potentialRating || 0) - (a.potentialRating || 0));
    } else if (filters.sortBy === 'active_ads') {
      list.sort((a, b) => (b.activeAdsCurrent || 0) - (a.activeAdsCurrent || 0));
    } else if (filters.sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // 'recent' by default
      list.sort((a, b) => new Date(b.addedDate || b.createdAt).getTime() - new Date(a.addedDate || a.createdAt).getTime());
    }

    return list;
  }

  public getOfferById(id: string): Offer | null {
    const found = this.db!.offers.find((o) => o.id === id);
    if (!found) return null;
    return this.hydrateOffer(found);
  }

  public createOffer(data: Partial<Offer>): Offer {
    const id = `offer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    const newOffer: Offer = {
      id,
      name: data.name || 'Nova Oferta Sem Título',
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
      createdAt: now,
      updatedAt: now
    };

    this.db!.offers.unshift(newOffer);

    // If initial validation log or creative provided in data
    if (data.validationLogs && Array.isArray(data.validationLogs)) {
      for (const log of data.validationLogs) {
        this.db!.validationLogs.push({
          ...log,
          id: log.id || `vl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          offerId: id,
          createdAt: log.createdAt || now
        });
      }
    }

    if (data.funnelSteps && Array.isArray(data.funnelSteps)) {
      for (const step of data.funnelSteps) {
        this.db!.funnelSteps.push({
          ...step,
          id: step.id || `fs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          offerId: id
        });
      }
    }

    if (data.creatives && Array.isArray(data.creatives)) {
      for (const cr of data.creatives) {
        this.db!.creatives.push({
          ...cr,
          id: cr.id || `cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          offerId: id,
          createdAt: cr.createdAt || now
        });
      }
    }

    // Sync collections
    if (data.collectionIds && Array.isArray(data.collectionIds)) {
      for (const colId of data.collectionIds) {
        const c = this.db!.collections.find((col) => col.id === colId);
        if (c && !c.offerIds.includes(id)) {
          c.offerIds.push(id);
        }
      }
    }

    this.persist();
    return this.hydrateOffer(newOffer);
  }

  public updateOffer(id: string, updates: Partial<Offer>): Offer | null {
    const index = this.db!.offers.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const current = this.db!.offers[index];
    const { funnelSteps: _1, validationLogs: _2, competitors: _3, creatives: _4, ...cleanUpdates } = updates;

    this.db!.offers[index] = {
      ...current,
      ...cleanUpdates,
      updatedAt: new Date().toISOString()
    };

    // Update collections if collectionIds changed
    if (updates.collectionIds) {
      for (const col of this.db!.collections) {
        const shouldBeIn = updates.collectionIds.includes(col.id);
        const isIn = col.offerIds.includes(id);
        if (shouldBeIn && !isIn) {
          col.offerIds.push(id);
        } else if (!shouldBeIn && isIn) {
          col.offerIds = col.offerIds.filter((oid) => oid !== id);
        }
      }
    }

    this.persist();
    return this.hydrateOffer(this.db!.offers[index]);
  }

  public deleteOffer(id: string): boolean {
    const initialLen = this.db!.offers.length;
    this.db!.offers = this.db!.offers.filter((o) => o.id !== id);
    if (this.db!.offers.length === initialLen) return false;

    // Cascade delete children
    this.db!.funnelSteps = this.db!.funnelSteps.filter((s) => s.offerId !== id);
    this.db!.validationLogs = this.db!.validationLogs.filter((v) => v.offerId !== id);
    this.db!.competitors = this.db!.competitors.filter((c) => c.offerId !== id);
    this.db!.creatives = this.db!.creatives.filter((cr) => cr.offerId !== id);

    // Remove from collections
    for (const col of this.db!.collections) {
      col.offerIds = col.offerIds.filter((oid) => oid !== id);
    }

    this.persist();
    return true;
  }

  public toggleFavorite(id: string): boolean | null {
    const offer = this.db!.offers.find((o) => o.id === id);
    if (!offer) return null;
    offer.isFavorite = !offer.isFavorite;
    offer.updatedAt = new Date().toISOString();
    this.persist();
    return offer.isFavorite;
  }

  // --- FUNNEL STEPS ---
  public addFunnelStep(step: Omit<FunnelStep, 'id'>): FunnelStep {
    const newStep: FunnelStep = {
      ...step,
      id: `fs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    };
    this.db!.funnelSteps.push(newStep);
    this.persist();
    return newStep;
  }

  public updateFunnelStep(id: string, updates: Partial<FunnelStep>): FunnelStep | null {
    const index = this.db!.funnelSteps.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.db!.funnelSteps[index] = { ...this.db!.funnelSteps[index], ...updates };
    this.persist();
    return this.db!.funnelSteps[index];
  }

  public deleteFunnelStep(id: string): boolean {
    const len = this.db!.funnelSteps.length;
    this.db!.funnelSteps = this.db!.funnelSteps.filter((s) => s.id !== id);
    this.persist();
    return this.db!.funnelSteps.length < len;
  }

  // --- VALIDATION LOGS ---
  public addValidationLog(log: Omit<ValidationLog, 'id' | 'createdAt'>): ValidationLog {
    const newLog: ValidationLog = {
      ...log,
      id: `vl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.db!.validationLogs.push(newLog);
    this.persist();
    return newLog;
  }

  public deleteValidationLog(id: string): boolean {
    const len = this.db!.validationLogs.length;
    this.db!.validationLogs = this.db!.validationLogs.filter((v) => v.id !== id);
    this.persist();
    return this.db!.validationLogs.length < len;
  }

  // --- COMPETITORS ---
  public addCompetitor(comp: Omit<Competitor, 'id' | 'createdAt'>): Competitor {
    const newComp: Competitor = {
      ...comp,
      id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.db!.competitors.push(newComp);
    this.persist();
    return newComp;
  }

  public updateCompetitor(id: string, updates: Partial<Competitor>): Competitor | null {
    const index = this.db!.competitors.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.db!.competitors[index] = { ...this.db!.competitors[index], ...updates };
    this.persist();
    return this.db!.competitors[index];
  }

  public deleteCompetitor(id: string): boolean {
    const len = this.db!.competitors.length;
    this.db!.competitors = this.db!.competitors.filter((c) => c.id !== id);
    // clean competitor creatives
    this.db!.creatives = this.db!.creatives.filter((cr) => cr.competitorId !== id);
    this.persist();
    return this.db!.competitors.length < len;
  }

  // --- CREATIVES ---
  public addCreative(creative: Omit<Creative, 'id' | 'createdAt'>): Creative {
    const newCreative: Creative = {
      ...creative,
      id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.db!.creatives.push(newCreative);
    this.persist();
    return newCreative;
  }

  public updateCreative(id: string, updates: Partial<Creative>): Creative | null {
    const index = this.db!.creatives.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.db!.creatives[index] = { ...this.db!.creatives[index], ...updates };
    this.persist();
    return this.db!.creatives[index];
  }

  public deleteCreative(id: string): boolean {
    const len = this.db!.creatives.length;
    this.db!.creatives = this.db!.creatives.filter((c) => c.id !== id);
    this.persist();
    return this.db!.creatives.length < len;
  }

  // --- COLLECTIONS ---
  public getCollections(): Collection[] {
    return this.db!.collections;
  }

  public getCollectionById(id: string): Collection | null {
    return this.db!.collections.find((c) => c.id === id) || null;
  }

  public createCollection(data: Partial<Collection>): Collection {
    const now = new Date().toISOString();
    const newCol: Collection = {
      id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: data.name || 'Nova Coleção',
      description: data.description || '',
      color: data.color || '#22C55E',
      offerIds: data.offerIds || [],
      createdAt: now,
      updatedAt: now
    };
    this.db!.collections.push(newCol);
    this.persist();
    return newCol;
  }

  public updateCollection(id: string, updates: Partial<Collection>): Collection | null {
    const index = this.db!.collections.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.db!.collections[index] = {
      ...this.db!.collections[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.db!.collections[index];
  }

  public deleteCollection(id: string): boolean {
    const len = this.db!.collections.length;
    this.db!.collections = this.db!.collections.filter((c) => c.id !== id);
    this.persist();
    return this.db!.collections.length < len;
  }

  public toggleOfferInCollection(collectionId: string, offerId: string): boolean {
    const col = this.db!.collections.find((c) => c.id === collectionId);
    if (!col) return false;
    if (col.offerIds.includes(offerId)) {
      col.offerIds = col.offerIds.filter((id) => id !== offerId);
    } else {
      col.offerIds.push(offerId);
    }
    col.updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  // --- STATS ---
  public getStats() {
    const offers = this.db!.offers;
    const statusCounts: Record<string, number> = {
      validada: 0,
      em_teste: 0,
      escalando: 0,
      pausada: 0,
      morta: 0
    };
    for (const o of offers) {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    }

    return {
      totalOffers: offers.length,
      statusCounts,
      totalCreatives: this.db!.creatives.length,
      totalCompetitors: this.db!.competitors.length,
      totalCollections: this.db!.collections.length
    };
  }

  // --- CSV EXPORT & IMPORT ---
  public exportOffersCSV(): string {
    const offers = this.getOffers();
    const headers = [
      'ID',
      'Nome',
      'Nicho',
      'Status',
      'Tipo de Oferta',
      'Tipo de Funil',
      'Canais de Tráfego',
      'Ticket/Preço',
      'Checkout',
      'Página de Vendas',
      'Anúncios Ativos',
      'Dias Ativa',
      'Nota (1-5)',
      'Favorita',
      'Tags',
      'Hook Principal',
      'Headline'
    ];

    const rows = offers.map((o) => [
      `"${o.id}"`,
      `"${(o.name || '').replace(/"/g, '""')}"`,
      `"${(o.niche || '').replace(/"/g, '""')}"`,
      `"${o.status}"`,
      `"${o.offerType}"`,
      `"${o.funnelType}"`,
      `"${(o.trafficChannels || []).join(';')}"`,
      `"${(o.ticketPrice || '').replace(/"/g, '""')}"`,
      `"${(o.checkoutPlatform || '').replace(/"/g, '""')}"`,
      `"${(o.salesPageUrl || '').replace(/"/g, '""')}"`,
      o.activeAdsCurrent || 0,
      o.daysRunning || 0,
      o.potentialRating || 0,
      o.isFavorite ? 'Sim' : 'Não',
      `"${(o.tags || []).join(';')}"`,
      `"${(o.hook || '').replace(/"/g, '""')}"`,
      `"${(o.headline || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public importOffersCSV(csvContent: string): { importedCount: number; errors: string[] } {
    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return { importedCount: 0, errors: ['Arquivo CSV vazio ou sem linhas de dados.'] };
    }

    let count = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];
        // Parse CSV line taking quotes into account
        const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        const matches: string[] = [];
        let match;
        while ((match = regex.exec(line)) !== null && matches.length < 17) {
          let val = match[1] || '';
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1).replace(/""/g, '"');
          }
          matches.push(val);
        }

        const name = matches[1];
        if (!name) continue;

        const niche = matches[2] || 'Marketing Digital';
        const status = (matches[3] as any) || 'em_teste';
        const offerType = (matches[4] as any) || 'infoproduto';
        const funnelType = (matches[5] as any) || 'vsl';
        const trafficChannels = matches[6] ? (matches[6].split(';') as any) : ['facebook_instagram'];
        const ticketPrice = matches[7] || '';
        const checkoutPlatform = matches[8] || '';
        const salesPageUrl = matches[9] || '';
        const potentialRating = parseInt(matches[12] || '3', 10) || 3;
        const isFavorite = matches[13] === 'Sim' || matches[13] === 'true';
        const tags = matches[14] ? matches[14].split(';').filter(Boolean) : [];
        const hook = matches[15] || '';
        const headline = matches[16] || '';

        this.createOffer({
          name,
          niche,
          status,
          offerType,
          funnelType,
          trafficChannels,
          ticketPrice,
          checkoutPlatform,
          salesPageUrl,
          potentialRating,
          isFavorite,
          tags,
          hook,
          headline
        });
        count++;
      } catch (err: any) {
        errors.push(`Linha ${i + 1}: ${err.message}`);
      }
    }

    return { importedCount: count, errors };
  }

  public exportFullBackup(): DatabaseSchema {
    return this.db!;
  }

  public importFullBackup(backup: any): boolean {
    if (!backup || !Array.isArray(backup.offers)) {
      throw new Error('Formato de backup inválido.');
    }
    this.db = {
      offers: backup.offers || [],
      funnelSteps: backup.funnelSteps || [],
      validationLogs: backup.validationLogs || [],
      competitors: backup.competitors || [],
      creatives: backup.creatives || [],
      collections: backup.collections || [],
      settings: backup.settings || this.db?.settings,
      ownerUser: backup.ownerUser || this.db?.ownerUser || {
        email: 'dono@swipe.com',
        passwordHash: 'admin123'
      }
    };
    this.persist();
    return true;
  }
}

export const dbManager = new DatabaseManager();

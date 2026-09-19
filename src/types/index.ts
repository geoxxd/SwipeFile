export type OfferStatus = 'validada' | 'em_teste' | 'escalando' | 'pausada' | 'morta';

export type OfferType = 'infoproduto' | 'infoapp' | 'suplemento' | 'low_ticket' | 'quiz' | 'webinar' | 'outro';

export type FunnelType = 'vsl' | 'quiz' | 'pagina_direta' | 'advertorial' | 'webinar' | 'carta_vendas' | 'outro';

export type TrafficChannel = 'facebook_instagram' | 'tiktok' | 'youtube' | 'google' | 'native' | 'outros';

export type CreativeType = 'vsl' | 'ugc' | 'depoimento' | 'imagem_estatica' | 'carrossel' | 'print_anuncio' | 'outro';

export interface ExtraLink {
  id: string;
  label: string;
  url: string;
}

export interface FunnelStep {
  id: string;
  offerId: string;
  order: number;
  type: 'front' | 'upsell_1' | 'upsell_2' | 'downsell' | 'order_bump' | 'outro';
  name: string;
  price?: string;
  url?: string;
  notes?: string;
}

export interface ValidationLog {
  id: string;
  offerId: string;
  date: string; // YYYY-MM-DD
  activeAdsCount: number;
  notes?: string;
  createdAt: string;
}

export interface Competitor {
  id: string;
  offerId: string;
  name: string;
  salesPageUrl?: string;
  adLibraryUrl?: string;
  profileUrl?: string;
  activeAdsCount?: number;
  dateIdentified?: string;
  status: 'ativo' | 'pausado' | 'abandonado';
  differencesNotes?: string; // what they changed in copy, price, creative, funnel
  creatives?: Creative[];
  createdAt: string;
}

export interface Creative {
  id: string;
  offerId: string;
  competitorId?: string | null;
  title: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileType: 'image' | 'video' | 'external_video';
  mimeType?: string;
  externalProvider?: 'youtube' | 'vimeo' | 'drive' | 'direct' | null;
  creativeType: CreativeType;
  hook3s?: string;
  cta?: string;
  script?: string;
  notes?: string;
  sourceType: 'propria_oferta' | 'concorrente';
  tags: string[];
  createdAt: string;
  fileSizeBytes?: number;
}

export interface ModelChecklist {
  copyAnalyzed: boolean;
  creativeSaved: boolean;
  funnelMapped: boolean;
  competitorsListed: boolean;
  checkoutTested: boolean;
  offerSwiped: boolean;
}

export interface Offer {
  id: string;
  name: string;
  niche: string;
  country: string;
  language: string;
  offerType: OfferType;
  funnelType: FunnelType;
  trafficChannels: TrafficChannel[];
  status: OfferStatus;
  ticketPrice?: string;
  checkoutPlatform?: string;
  addedDate: string; // YYYY-MM-DD
  
  // Links
  salesPageUrl?: string;
  checkoutUrl?: string;
  adLibraryUrl?: string;
  advertiserProfileUrl?: string;
  extraLinks?: ExtraLink[];

  // Analysis
  hook?: string;
  mainPromise?: string;
  uniqueMechanism?: string;
  targetAudience?: string;
  proofsUsed?: string;
  bonuses?: string;
  guarantee?: string;
  cta?: string;
  headline?: string;

  // Rating & Meta
  potentialRating: number; // 1 to 5
  tags: string[];
  isFavorite: boolean;
  freeNotes?: string;
  checklist: ModelChecklist;

  // Nested / Relations
  funnelSteps?: FunnelStep[];
  validationLogs?: ValidationLog[];
  competitors?: Competitor[];
  creatives?: Creative[];
  collectionIds?: string[];

  // Calculated fields
  activeAdsCurrent?: number;
  daysRunning?: number;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  offerIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  appName: string;
  shareMode: 'public' | 'access_code';
  accessCode: string;
  uploadSizeLimitMB?: number;
  niches: string[];
  trafficChannels: { id: TrafficChannel; label: string }[];
  offerTypes: { id: OfferType; label: string }[];
  funnelTypes: { id: FunnelType; label: string }[];
  tags?: string[];
  ownerPassword?: string;
  supabaseConfig?: {
    enabled: boolean;
    url?: string;
    anonKey?: string;
  };
}

export interface UserSession {
  isOwner: boolean;
  email?: string;
  readOnly?: boolean;
  authenticatedWithCode?: boolean;
}

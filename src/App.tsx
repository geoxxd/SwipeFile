import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './components/Toast.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { LibraryView } from './views/LibraryView.tsx';
import { OfferDetailView } from './views/OfferDetailView.tsx';
import { OfferFormView } from './views/OfferFormView.tsx';
import { CollectionsView } from './views/CollectionsView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { QuickAddModal } from './components/QuickAddModal.tsx';
import { api } from './services/api.ts';
import { Offer, Collection, AppSettings } from './types/index.ts';
import { Loader2 } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'SWIPE',
  shareMode: 'public',
  accessCode: '1234',
  uploadSizeLimitMB: 100,
  tags: ['Validadas', 'Escala', 'UGC', 'VSL'],
  niches: [
    'Emagrecimento & Saúde',
    'Finanças & Renda Extra',
    'Relacionamento & Conquista',
    'Marketing Digital & Tráfego',
    'Desenvolvimento Pessoal & Produtividade',
    'Beleza & Estética',
    'Educação & Concursos',
    'Idiomas'
  ],
  offerTypes: [
    { id: 'infoproduto', label: 'Infoproduto' },
    { id: 'infoapp', label: 'Infoapp / App' },
    { id: 'suplemento', label: 'Suplemento / Físico' },
    { id: 'low_ticket', label: 'Low Ticket' },
    { id: 'quiz', label: 'Quiz Funil' },
    { id: 'webinar', label: 'Webinar' },
    { id: 'outro', label: 'Outro' }
  ],
  funnelTypes: [
    { id: 'vsl', label: 'VSL (Video Sales Letter)' },
    { id: 'quiz', label: 'Quiz Interativo' },
    { id: 'pagina_direta', label: 'Página Direta (TSL)' },
    { id: 'advertorial', label: 'Advertorial' },
    { id: 'webinar', label: 'Webinar / Masterclass' },
    { id: 'carta_vendas', label: 'Carta de Vendas Longa' },
    { id: 'outro', label: 'Outro' }
  ],
  trafficChannels: [
    { id: 'facebook_instagram', label: 'Meta Ads (Facebook / Instagram)' },
    { id: 'tiktok', label: 'TikTok Ads' },
    { id: 'youtube', label: 'YouTube Ads' },
    { id: 'google', label: 'Google Search / GDN' },
    { id: 'native', label: 'Native Ads (Taboola / Outbrain)' },
    { id: 'outros', label: 'Outros Canais' }
  ]
};

function MainApp() {
  const { success, error } = useToast();

  // Navigation State
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'library' | 'collections' | 'settings' | 'offer-detail' | 'offer-form'
  >('dashboard');

  // Selected Offer State
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // App Data State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [offers, setOffers] = useState<Offer[]>(() => {
    try {
      const cached = localStorage.getItem('swipe_cached_offers');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [collections, setCollections] = useState<Collection[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isOwner, setIsOwner] = useState<boolean>(true); // Default true for owner experience
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Filters passed from Dashboard to Library
  const [libraryFilters, setLibraryFilters] = useState<Record<string, any>>({});

  // Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [settingsRes, offersRes, collectionsRes, statsRes] = await Promise.all([
        api.getSettings().catch(() => DEFAULT_SETTINGS),
        api.getOffers().catch((err) => {
          console.error('Falha ao sincronizar ofertas do Supabase:', err);
          return null;
        }),
        api.getCollections().catch(() => []),
        api.getStats().catch(() => null)
      ]);

      if (settingsRes) setSettings(settingsRes);
      
      if (offersRes !== null) {
        setOffers(offersRes);
        try {
          localStorage.setItem('swipe_cached_offers', JSON.stringify(offersRes));
        } catch {}
      }

      if (collectionsRes) setCollections(collectionsRes);
      if (statsRes) setStats(statsRes);

      // Check URL parameters for direct offer link
      const urlParams = new URLSearchParams(window.location.search);
      const urlOfferId = urlParams.get('offer');
      if (urlOfferId && offersRes && offersRes.some((o: Offer) => o.id === urlOfferId)) {
        setSelectedOfferId(urlOfferId);
        setCurrentView('offer-detail');
      }
    } catch (err: any) {
      console.error('Error initializing app:', err);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Share link copy helper
  const handleCopyShareLink = (offerId?: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = offerId ? `${baseUrl}?offer=${offerId}` : baseUrl;
    navigator.clipboard.writeText(shareUrl);
    success('Link somente leitura copiado para a área de transferência!');
  };

  // Offer detail selection
  const handleSelectOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
    setCurrentView('offer-detail');
    window.history.replaceState(null, '', `?offer=${offerId}`);
  };

  // Back from offer detail
  const handleBackToLibrary = () => {
    setSelectedOfferId(null);
    setCurrentView('library');
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Open Full Add Offer
  const handleOpenFullAdd = () => {
    setEditingOffer(null);
    setCurrentView('offer-form');
  };

  // Open Edit Offer
  const handleOpenEdit = () => {
    const current = offers.find((o) => o.id === selectedOfferId);
    if (current) {
      setEditingOffer(current);
      setCurrentView('offer-form');
    }
  };

  // Save Offer (Create or Edit)
  const handleSaveOffer = async (data: Partial<Offer>) => {
    try {
      if (editingOffer) {
        const updated = await api.updateOffer(editingOffer.id, data);
        if (updated) {
          setOffers((prev) => {
            const next = prev.map((o) => (o.id === updated.id ? updated : o));
            try { localStorage.setItem('swipe_cached_offers', JSON.stringify(next)); } catch {}
            return next;
          });
          success('Oferta atualizada com sucesso!');
          setSelectedOfferId(updated.id);
          setCurrentView('offer-detail');
        }
      } else {
        const created = await api.createOffer(data);
        setOffers((prev) => {
          const next = [created, ...prev];
          try { localStorage.setItem('swipe_cached_offers', JSON.stringify(next)); } catch {}
          return next;
        });
        success('Nova oferta cadastrada com sucesso!');
        setSelectedOfferId(created.id);
        setCurrentView('offer-detail');
      }
      // Refresh stats
      api.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err: any) {
      error(err.message || 'Erro ao salvar oferta.');
      throw err;
    }
  };

  // Delete Offer
  const handleDeleteOffer = async (id: string) => {
    try {
      await api.deleteOffer(id);
      setOffers((prev) => {
        const next = prev.filter((o) => o.id !== id);
        try { localStorage.setItem('swipe_cached_offers', JSON.stringify(next)); } catch {}
        return next;
      });
      success('Oferta excluída com sucesso.');
      handleBackToLibrary();
      api.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err: any) {
      error(err.message || 'Erro ao excluir oferta.');
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await api.toggleFavorite(id);
      setOffers((prev) => {
        const next = prev.map((o) => (o.id === id ? { ...o, isFavorite: res.isFavorite } : o));
        try { localStorage.setItem('swipe_cached_offers', JSON.stringify(next)); } catch {}
        return next;
      });
    } catch (err: any) {
      error(err.message || 'Erro ao alternar favorito.');
    }
  };

  // Update offer in memory
  const handleUpdateOfferInMemory = (updated: Offer) => {
    setOffers((prev) => {
      const next = prev.map((o) => (o.id === updated.id ? updated : o));
      try { localStorage.setItem('swipe_cached_offers', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Selected Offer reference
  const selectedOffer = offers.find((o) => o.id === selectedOfferId);

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#15803D] flex items-center justify-center text-black font-black text-xl animate-pulse">
          S
        </div>
        <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
          <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
          <span>Carregando Swipe File...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-[#E5E7EB] font-sans antialiased selection:bg-[#22C55E] selection:text-black">
      {/* Desktop Sidebar */}
      <Sidebar
        appName={settings.appName}
        currentView={currentView}
        onNavigate={(view) => {
          setSelectedOfferId(null);
          setCurrentView(view);
          window.history.replaceState(null, '', window.location.pathname);
        }}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenFullAdd={handleOpenFullAdd}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header & Bottom Navigation */}
        <MobileNav
          appName={settings.appName}
          currentView={currentView}
          onNavigate={(view) => {
            setSelectedOfferId(null);
            setCurrentView(view);
            window.history.replaceState(null, '', window.location.pathname);
          }}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenFullAdd={handleOpenFullAdd}
        />

        {/* Dynamic View Display */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              offers={offers}
              stats={stats}
              onSelectOffer={handleSelectOffer}
              onNavigateToLibrary={(filters) => {
                if (filters) setLibraryFilters(filters);
                setCurrentView('library');
              }}
              isOwner={isOwner}
            />
          )}

          {currentView === 'library' && (
            <LibraryView
              offers={offers}
              settings={settings}
              onSelectOffer={handleSelectOffer}
              onToggleFavorite={handleToggleFavorite}
              initialFilters={libraryFilters}
              isOwner={isOwner}
              onCopyShareLink={handleCopyShareLink}
            />
          )}

          {currentView === 'offer-detail' && selectedOffer && (
            <OfferDetailView
              offer={selectedOffer}
              settings={settings}
              isOwner={isOwner}
              onBack={handleBackToLibrary}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteOffer}
              onUpdateOffer={handleUpdateOfferInMemory}
              onCopyShareLink={handleCopyShareLink}
            />
          )}

          {currentView === 'offer-detail' && !selectedOffer && (
            <div className="p-12 text-center text-[#9CA3AF]">
              Oferta não encontrada ou foi removida.{' '}
              <button onClick={handleBackToLibrary} className="text-[#22C55E] underline">
                Voltar à biblioteca
              </button>
            </div>
          )}

          {currentView === 'offer-form' && (
            <OfferFormView
              initialOffer={editingOffer}
              settings={settings}
              onSave={handleSaveOffer}
              onCancel={() => {
                if (selectedOfferId) {
                  setCurrentView('offer-detail');
                } else {
                  setCurrentView('library');
                }
              }}
            />
          )}

          {currentView === 'collections' && (
            <CollectionsView
              collections={collections}
              offers={offers}
              isOwner={isOwner}
              onSelectOffer={handleSelectOffer}
              onRefreshData={loadData}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              isOwner={isOwner}
              onUpdateSettings={(newSet) => setSettings(newSet)}
              onRefreshAllData={loadData}
            />
          )}
        </main>
      </div>

      {/* QUICK ADD MODAL */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onCreated={(newOffer) => {
          setOffers((prev) => {
            const next = [newOffer, ...prev];
            try { localStorage.setItem('swipe_cached_offers', JSON.stringify(next)); } catch {}
            return next;
          });
          setSelectedOfferId(newOffer.id);
          setCurrentView('offer-detail');
          api.getStats().then((s) => setStats(s)).catch(() => {});
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

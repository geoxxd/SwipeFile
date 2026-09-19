-- ==============================================================================
-- SWIPE FILE - SUPABASE DATABASE & STORAGE SCHEMA
-- Execute este script completo no SQL Editor do seu projeto Supabase.
-- ==============================================================================

-- 1. TABELA DE CONFIGURAÇÕES (settings)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    app_name TEXT DEFAULT 'SWIPE',
    niches TEXT[] DEFAULT ARRAY['Saúde & Emagrecimento', 'Renda Extra & Finanças', 'Relacionamentos', 'Desenvolvimento Pessoal', 'Negócios & Vendas', 'Estética & Beleza', 'Tecnologia & IA', 'Outros'],
    share_mode TEXT DEFAULT 'public',
    access_code TEXT DEFAULT '1234',
    upload_size_limit_mb INTEGER DEFAULT 500,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir configuração padrão caso não exista
INSERT INTO public.settings (id, app_name, share_mode, access_code)
VALUES ('default', 'SWIPE', 'public', '1234')
ON CONFLICT (id) DO NOTHING;

-- 2. TABELA DE OFERTAS (offers)
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    niche TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Brasil',
    language TEXT NOT NULL DEFAULT 'Português',
    offer_type TEXT NOT NULL DEFAULT 'infoproduto',
    funnel_type TEXT NOT NULL DEFAULT 'vsl',
    traffic_channels TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT NOT NULL DEFAULT 'em_teste',
    ticket_price TEXT,
    checkout_platform TEXT,
    added_date TEXT NOT NULL,
    sales_page_url TEXT,
    checkout_url TEXT,
    ad_library_url TEXT,
    advertiser_profile_url TEXT,
    extra_links JSONB DEFAULT '[]'::JSONB,
    hook TEXT,
    main_promise TEXT,
    unique_mechanism TEXT,
    target_audience TEXT,
    proofs_used TEXT,
    bonuses TEXT,
    guarantee TEXT,
    cta TEXT,
    headline TEXT,
    potential_rating NUMERIC DEFAULT 3,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    free_notes TEXT,
    checklist JSONB DEFAULT '{"copyAnalyzed":false,"creativeSaved":false,"funnelMapped":false,"competitorsListed":false,"checkoutTested":false,"offerSwiped":false}'::JSONB,
    collection_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    active_ads_current INTEGER DEFAULT 0,
    days_running INTEGER DEFAULT 0,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABELA DE CRIATIVOS (creatives)
CREATE TABLE IF NOT EXISTS public.creatives (
    id TEXT PRIMARY KEY,
    offer_id TEXT NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    competitor_id TEXT,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_type TEXT NOT NULL DEFAULT 'image',
    mime_type TEXT,
    external_provider TEXT,
    creative_type TEXT NOT NULL DEFAULT 'vsl',
    hook_3s TEXT,
    cta TEXT,
    script TEXT,
    notes TEXT,
    source_type TEXT NOT NULL DEFAULT 'propria_oferta',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABELA DE COLEÇÕES (collections)
CREATE TABLE IF NOT EXISTS public.collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#22C55E',
    offer_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABELA DE CONCORRENTES (competitors)
CREATE TABLE IF NOT EXISTS public.competitors (
    id TEXT PRIMARY KEY,
    offer_id TEXT NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sales_page_url TEXT,
    ad_library_url TEXT,
    profile_url TEXT,
    active_ads_count INTEGER DEFAULT 0,
    date_identified TEXT,
    status TEXT NOT NULL DEFAULT 'ativo',
    differences_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABELA DE ETAPAS DO FUNIL (funnel_steps)
CREATE TABLE IF NOT EXISTS public.funnel_steps (
    id TEXT PRIMARY KEY,
    offer_id TEXT NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    order_num INTEGER NOT NULL DEFAULT 1,
    type TEXT NOT NULL DEFAULT 'front',
    name TEXT NOT NULL,
    price TEXT,
    url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABELA DE HISTÓRICO DE VALIDAÇÃO (validation_logs)
CREATE TABLE IF NOT EXISTS public.validation_logs (
    id TEXT PRIMARY KEY,
    offer_id TEXT NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    active_ads_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- ÍNDICES PARA ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_niche ON public.offers(niche);
CREATE INDEX IF NOT EXISTS idx_offers_favorite ON public.offers(is_favorite);
CREATE INDEX IF NOT EXISTS idx_creatives_offer_id ON public.creatives(offer_id);
CREATE INDEX IF NOT EXISTS idx_competitors_offer_id ON public.competitors(offer_id);
CREATE INDEX IF NOT EXISTS idx_funnel_steps_offer_id ON public.funnel_steps(offer_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_offer_id ON public.validation_logs(offer_id);

-- ==============================================================================
-- STORAGE: BUCKET 'creatives' (VÍDEOS, IMAGENS E CAPAS)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('creatives', 'creatives', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- Permite leitura e escrita públicas/anon para que o app funcione diretamente no Netlify
-- ==============================================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para Settings
CREATE POLICY "Permitir leitura anon settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Permitir update anon settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- Políticas para Offers
CREATE POLICY "Permitir leitura anon offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Permitir insert anon offers" ON public.offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update anon offers" ON public.offers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete anon offers" ON public.offers FOR DELETE USING (true);

-- Políticas para Creatives
CREATE POLICY "Permitir leitura anon creatives" ON public.creatives FOR SELECT USING (true);
CREATE POLICY "Permitir insert anon creatives" ON public.creatives FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update anon creatives" ON public.creatives FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete anon creatives" ON public.creatives FOR DELETE USING (true);

-- Políticas para Collections
CREATE POLICY "Permitir leitura anon collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Permitir insert anon collections" ON public.collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update anon collections" ON public.collections FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete anon collections" ON public.collections FOR DELETE USING (true);

-- Políticas para Competitors
CREATE POLICY "Permitir leitura anon competitors" ON public.competitors FOR SELECT USING (true);
CREATE POLICY "Permitir insert anon competitors" ON public.competitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update anon competitors" ON public.competitors FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete anon competitors" ON public.competitors FOR DELETE USING (true);

-- Políticas para Funnel Steps
CREATE POLICY "Permitir leitura anon funnel_steps" ON public.funnel_steps FOR SELECT USING (true);
CREATE POLICY "Permitir insert anon funnel_steps" ON public.funnel_steps FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update anon funnel_steps" ON public.funnel_steps FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete anon funnel_steps" ON public.funnel_steps FOR DELETE USING (true);

-- Políticas para Validation Logs
CREATE POLICY "Permitir leitura anon validation_logs" ON public.validation_logs FOR SELECT USING (true);
CREATE POLICY "Permitir insert anon validation_logs" ON public.validation_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update anon validation_logs" ON public.validation_logs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir delete anon validation_logs" ON public.validation_logs FOR DELETE USING (true);

-- Políticas para Storage Bucket 'creatives'
CREATE POLICY "Permitir leitura publica de midias" ON storage.objects
FOR SELECT USING (bucket_id = 'creatives');

CREATE POLICY "Permitir upload anon de midias" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'creatives');

CREATE POLICY "Permitir update anon de midias" ON storage.objects
FOR UPDATE USING (bucket_id = 'creatives') WITH CHECK (bucket_id = 'creatives');

CREATE POLICY "Permitir delete anon de midias" ON storage.objects
FOR DELETE USING (bucket_id = 'creatives');

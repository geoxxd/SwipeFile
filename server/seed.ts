import { Offer, Collection, AppSettings } from '../src/types/index.ts';

export const initialSettings: AppSettings = {
  appName: 'SWIPE',
  shareMode: 'public',
  accessCode: '1234',
  uploadSizeLimitMB: 50,
  niches: [
    'Emagrecimento & Saúde',
    'Finanças & Renda Extra',
    'Relacionamento & Conquista',
    'Desenvolvimento Pessoal',
    'Beleza & Estética',
    'Marketing Digital & Tráfego',
    'Espiritualidade & Astrologia',
    'Concursos & Idiomas'
  ],
  trafficChannels: [
    { id: 'facebook_instagram', label: 'Facebook / Instagram Ads' },
    { id: 'tiktok', label: 'TikTok Ads' },
    { id: 'youtube', label: 'YouTube Ads' },
    { id: 'google', label: 'Google Search / Display' },
    { id: 'native', label: 'Taboola / Outbrain (Native)' },
    { id: 'outros', label: 'Kwai / Pinterest / Outros' }
  ],
  offerTypes: [
    { id: 'infoproduto', label: 'Infoproduto (Curso/Ebook)' },
    { id: 'infoapp', label: 'Infoapp / Web App' },
    { id: 'suplemento', label: 'Suplemento / Físico' },
    { id: 'low_ticket', label: 'Low Ticket / Front-end' },
    { id: 'quiz', label: 'Funil de Quiz' },
    { id: 'webinar', label: 'Webinar / High Ticket' },
    { id: 'outro', label: 'Outro Modelo' }
  ],
  funnelTypes: [
    { id: 'vsl', label: 'VSL (Vídeo de Vendas)' },
    { id: 'quiz', label: 'Quiz Interativo' },
    { id: 'pagina_direta', label: 'Página Direta (TSL)' },
    { id: 'advertorial', label: 'Advertorial + Oferta' },
    { id: 'webinar', label: 'Webinar Gravado / Ao Vivo' },
    { id: 'carta_vendas', label: 'Carta de Vendas Longa' },
    { id: 'outro', label: 'Outro Funil' }
  ],
  tags: ['Escalando Forte', 'Criativo UGC', 'VSL Curta', 'Quiz Viciante', 'Order Bump 60%', 'Back-end Pesado', 'TikTok Viral'],
  supabaseConfig: {
    enabled: false,
    url: '',
    anonKey: ''
  }
};

export const initialCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'Top Ofertas de Alta Escala 2026',
    description: 'Ofertas com mais de 50 anúncios ativos rodando há mais de 60 dias no Meta e TikTok.',
    color: '#22C55E',
    offerIds: ['offer-1', 'offer-2', 'offer-3'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'col-2',
    name: 'Modelagens para Infoapps & Quiz',
    description: 'Aplicações de retenção, diagnóstico gamificado e monetização com micro-assinaturas.',
    color: '#3B82F6',
    offerIds: ['offer-2'],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'col-3',
    name: 'Funis de Suplementos & Nutra',
    description: 'Estruturas de advertorial, ganchos biológicos e kits múltiplos com alto AOV.',
    color: '#EAB308',
    offerIds: ['offer-1'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialOffers: Offer[] = [
  {
    id: 'offer-1',
    name: 'Gota Bariátrica Natural (Nutra)',
    niche: 'Emagrecimento & Saúde',
    country: 'Brasil',
    language: 'Português (BR)',
    offerType: 'suplemento',
    funnelType: 'advertorial',
    trafficChannels: ['facebook_instagram', 'native', 'tiktok'],
    status: 'escalando',
    ticketPrice: 'R$ 197,00 a R$ 497,00',
    checkoutPlatform: 'Kiwify / CartPanda',
    addedDate: '2026-06-15',
    salesPageUrl: 'https://exemplo-oferta-nutra.com/descubra-o-segredo',
    checkoutUrl: 'https://pay.exemplo-checkout.com/bariatrica-gotas',
    adLibraryUrl: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=gota%20bariatrica',
    advertiserProfileUrl: 'https://instagram.com/laboratorio.biofit.br',
    extraLinks: [
      { id: 'el-1', label: 'Advertorial de Pré-Venda', url: 'https://portal-saude-hoje.online/artigo-metabolismo' },
      { id: 'el-2', label: 'Página de Rastreio / Reclame Aqui', url: 'https://exemplo.com/reputacao' }
    ],
    headline: 'O "Ritual de 7 Gotas" que está esvaziando as clínicas de cirurgia bariátrica no interior de SP',
    hook: 'Médico aposentado de 68 anos revela o ingrediente que dissolve gordura visceral enquanto você dorme, sem academia.',
    mainPromise: 'Eliminar até 8kg de gordura pura nos primeiros 28 dias ativando o tecido adiposo marrom com gotas sublinguais.',
    uniqueMechanism: 'Ativação enzimática via absorção sublingual direta do fitocomplexo Amazônico, contornando a acidez gástrica.',
    targetAudience: 'Mulheres de 35 a 65 anos que já tentaram dietas restritivas, têm efeito sanfona e medo de cirurgias.',
    proofsUsed: 'Depoimentos em vídeo caseiro estilo UGC, laudos laboratoriais, reportagem fictícia em estilo de portal de notícias.',
    bonuses: 'Ebook Receitas Detox Noturnas + Acesso ao grupo VIP do WhatsApp com nutricionista.',
    guarantee: 'Garantia incondicional blindada de 90 dias: se não perder peso, devolvemos 100% do dinheiro.',
    cta: 'Selecione o seu kit com até 60% de desconto e frete grátis para todo o Brasil.',
    potentialRating: 5,
    tags: ['Escalando Forte', 'Back-end Pesado', 'Nutra Gotas', 'Advertorial de Alta Conversão'],
    isFavorite: true,
    freeNotes: 'Oferta com conversão absurda no tráfego nativo (Taboola) e TikTok Ads. O segredo é o kit com 5 potes que representa 45% das vendas, dobrando o LTV da operação.',
    checklist: {
      copyAnalyzed: true,
      creativeSaved: true,
      funnelMapped: true,
      competitorsListed: true,
      checkoutTested: true,
      offerSwiped: true
    },
    funnelSteps: [
      { id: 'fs-1', offerId: 'offer-1', order: 1, type: 'front', name: 'Front-end: Kit 3 Potes (Tratamento 90 dias)', price: 'R$ 297,00', url: 'https://exemplo.com/oferta', notes: 'Mais vendido na página' },
      { id: 'fs-2', offerId: 'offer-1', order: 2, type: 'order_bump', name: 'Order Bump 1: Chá Noturno Seca Barriga', price: 'R$ 37,00', notes: 'Take rate de 42%' },
      { id: 'fs-3', offerId: 'offer-1', order: 3, type: 'upsell_1', name: 'Upsell 1: Mais 3 Frascos com 70% OFF', price: 'R$ 147,00', notes: 'Conversão de 21% pós-checkout' },
      { id: 'fs-4', offerId: 'offer-1', order: 4, type: 'downsell', name: 'Downsell 1: +1 Frasco Único', price: 'R$ 67,00', notes: 'Recupera quem recusou upsell' }
    ],
    validationLogs: [
      { id: 'vl-1', offerId: 'offer-1', date: '2026-06-15', activeAdsCount: 14, notes: 'Descoberta inicial na Biblioteca de Anúncios. Começando a rodar criativos de depoimento.', createdAt: '2026-06-15T10:00:00Z' },
      { id: 'vl-2', offerId: 'offer-1', date: '2026-07-01', activeAdsCount: 38, notes: 'Entrou com novos criativos nativos e subiu orçamento.', createdAt: '2026-07-01T10:00:00Z' },
      { id: 'vl-3', offerId: 'offer-1', date: '2026-08-10', activeAdsCount: 75, notes: 'Escala pesada no Meta e Taboola. Mais de 70 anúncios ativos simultaneamente.', createdAt: '2026-08-10T10:00:00Z' },
      { id: 'vl-4', offerId: 'offer-1', date: '2026-09-05', activeAdsCount: 94, notes: 'Pico de escala. 94 anúncios ativos, diversificando para TikTok Ads.', createdAt: '2026-09-05T10:00:00Z' }
    ],
    competitors: [
      {
        id: 'comp-1',
        offerId: 'offer-1',
        name: 'Gotas Lipolíticas Turbo',
        salesPageUrl: 'https://concorrente-lipolise.com',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?q=gotas%20lipoliticas',
        profileUrl: 'https://instagram.com/gotas.lipoliticas',
        activeAdsCount: 42,
        dateIdentified: '2026-07-20',
        status: 'ativo',
        differencesNotes: 'Copiaram o gancho das 7 gotas mas mudaram o avatar para homens de meia-idade e colocaram preço de entrada mais agressivo (R$ 147 no pote único).',
        createdAt: '2026-07-20T12:00:00Z'
      }
    ],
    creatives: [
      {
        id: 'cr-1',
        offerId: 'offer-1',
        title: 'Criativo Campeão 01 - Médico + Pinga Gotas no Copo',
        fileUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
        fileType: 'image',
        mimeType: 'image/jpeg',
        creativeType: 'print_anuncio',
        hook3s: 'Se você tem mais de 40 anos e não consegue perder barriga, pare de tomar remédios caros e veja isso.',
        cta: 'Toque em Saiba Mais e assista ao vídeo explicativo antes que o conselho derrube.',
        script: '[Cena 1: Médico segurando frasco com conta-gotas e pingando em água turva]\n"Por anos a indústria farmacêutica escondeu este ritual simples de 7 gotas..."\n[Cena 2: Ilustração 3D da gordura visceral se desfazendo]\n"Acontece que quando você acorda, seu fígado precisa deste estímulo..."',
        notes: 'Anúncio que está rodando ininterruptamente há 90 dias com maior gasto acumulado no Meta.',
        sourceType: 'propria_oferta',
        tags: ['Vencedor Meta', 'Gancho de Autoridade', 'Imagem Estática'],
        createdAt: '2026-06-15T14:00:00Z',
        fileSizeBytes: 420000
      },
      {
        id: 'cr-2',
        offerId: 'offer-1',
        title: 'Depoimento UGC - Mulher Real na Cozinha',
        fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        creativeType: 'ugc',
        hook3s: 'Gente, eu juro que achei que era golpe, mas olha as minhas calças de 2 meses atrás...',
        cta: 'O link tá aqui embaixo, aproveitem enquanto ainda tá com frete grátis!',
        script: 'Oi meninas! Vim gravar esse vídeo bem rapidinho na minha cozinha antes de ir buscar as crianças. Comprei esse frasquinho mês passado...',
        notes: 'Excelente CTR no TikTok Ads (3.4%) com CPA 40% menor que a média.',
        sourceType: 'propria_oferta',
        tags: ['UGC Real', 'Vídeo TikTok', 'Prova Social'],
        createdAt: '2026-07-02T16:00:00Z',
        fileSizeBytes: 2400000
      }
    ],
    collectionIds: ['col-1', 'col-3'],
    isDemo: true,
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-09-05T10:00:00Z'
  },
  {
    id: 'offer-2',
    name: 'AstroMatch - App de Sinastria Amorosa & Mapa Astral',
    niche: 'Espiritualidade & Astrologia',
    country: 'Brasil / Portugal',
    language: 'Português (BR)',
    offerType: 'infoapp',
    funnelType: 'quiz',
    trafficChannels: ['tiktok', 'facebook_instagram', 'youtube'],
    status: 'validada',
    ticketPrice: 'R$ 29,90 / mês ou R$ 89,90 vitalício',
    checkoutPlatform: 'Stripe / App Store / Web Funnel',
    addedDate: '2026-07-10',
    salesPageUrl: 'https://astromatch-quiz.app/iniciar-teste',
    checkoutUrl: 'https://pay.astromatch.app/checkout-sinastria',
    adLibraryUrl: 'https://www.facebook.com/ads/library/?q=astromatch',
    advertiserProfileUrl: 'https://tiktok.com/@astromatch_oficial',
    headline: 'Descubra em 60 segundos por que seu signo e o dele estão destinados a dar certo (ou explodir)',
    hook: 'Digite sua data de nascimento e a da pessoa que não sai da sua cabeça. O resultado do mapa cármico vai te arrepiar.',
    mainPromise: 'Revelar o relatório secreto de compatibilidade astral, previsões para os próximos 3 meses e conselhos práticos de reconquista.',
    uniqueMechanism: 'Algoritmo de Sinastria Védica cruzada com inteligência artificial para leitura astrológica personalizada em tempo real.',
    targetAudience: 'Jovens de 18 a 32 anos interessadas em signos, relacionamentos e curiosidade emocional.',
    proofsUsed: 'Prints de conversas no WhatsApp com reconciliações após ler as previsões, avaliações com 4.9 estrelas na web.',
    bonuses: 'Guia dos Pontos Fracos do Signo Dele + Calendário Lunar de Dias Favoráveis para Conversas Decisivas.',
    guarantee: 'Garantia de 7 dias com devolução sem perguntas.',
    cta: 'Começar o Quiz Gratuito e Desbloquear o Mapa Completo.',
    potentialRating: 4,
    tags: ['Quiz Viciante', 'Micro-Assinatura', 'Infoapp', 'Viral TikTok'],
    isFavorite: true,
    freeNotes: 'Estrutura clássica de infoapp gamificado: 12 perguntas rápidas no quiz, barra de progresso com animação "calculando mapa natal...", tela de revelação com 80% borrado e paywall de R$ 29,90.',
    checklist: {
      copyAnalyzed: true,
      creativeSaved: true,
      funnelMapped: true,
      competitorsListed: true,
      checkoutTested: true,
      offerSwiped: false
    },
    funnelSteps: [
      { id: 'fs-21', offerId: 'offer-2', order: 1, type: 'front', name: 'Quiz Gratuito -> Paywall Relatório Completo', price: 'R$ 37,00', url: 'https://astromatch.app/quiz' },
      { id: 'fs-22', offerId: 'offer-2', order: 2, type: 'order_bump', name: 'Order Bump: Áudio de Frequência Binaural do Amor', price: 'R$ 19,90', notes: 'Custo zero de entrega' },
      { id: 'fs-23', offerId: 'offer-2', order: 3, type: 'upsell_1', name: 'Upsell 1: Consulta Virtual com Astróloga IA (1 ano)', price: 'R$ 67,00' }
    ],
    validationLogs: [
      { id: 'vl-21', offerId: 'offer-2', date: '2026-07-10', activeAdsCount: 8, notes: 'Primeiros testes de criativos no TikTok com tela dividida.', createdAt: '2026-07-10T10:00:00Z' },
      { id: 'vl-22', offerId: 'offer-2', date: '2026-08-01', activeAdsCount: 26, notes: 'Criativo viralizou organicamente e tráfego pago escalou.', createdAt: '2026-08-01T10:00:00Z' },
      { id: 'vl-23', offerId: 'offer-2', date: '2026-09-01', activeAdsCount: 45, notes: '45 anúncios ativos rodando com retorno sobre investimento consistente.', createdAt: '2026-09-01T10:00:00Z' }
    ],
    competitors: [
      {
        id: 'comp-21',
        offerId: 'offer-2',
        name: 'Nebula / Co-Star Clone BR',
        salesPageUrl: 'https://concorrente-signos.com',
        adLibraryUrl: 'https://www.facebook.com/ads/library/?q=nebula',
        activeAdsCount: 65,
        dateIdentified: '2026-08-05',
        status: 'ativo',
        differencesNotes: 'Foco maior em previsão de dinheiro e carreira, enquanto o AstroMatch foca 100% em amor e ciúmes.',
        createdAt: '2026-08-05T12:00:00Z'
      }
    ],
    creatives: [
      {
        id: 'cr-21',
        offerId: 'offer-2',
        title: 'Vídeo Tela Dividida - Reação no TikTok',
        fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        creativeType: 'vsl',
        hook3s: 'Se ele for de Escorpião ou Capricórnio, não faça esse teste a menos que queira perder o sono.',
        cta: 'Clica aqui no link da bio pra ver seu resultado grátis!',
        script: 'Gente do céu, eu botei a data do meu ex aqui só de zoeira e apareceu literalmente a data que a gente começou a brigar...',
        notes: 'Formato split-screen clássico com game no fundo e menina reagindo no topo.',
        sourceType: 'propria_oferta',
        tags: ['TikTok Viral', 'Split Screen', 'Gancho Curiosidade'],
        createdAt: '2026-07-15T15:00:00Z',
        fileSizeBytes: 1800000
      }
    ],
    collectionIds: ['col-1', 'col-2'],
    isDemo: true,
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'offer-3',
    name: 'Mestres do Tráfego Direto (Infoproduto Black/White)',
    niche: 'Marketing Digital & Tráfego',
    country: 'Brasil',
    language: 'Português (BR)',
    offerType: 'infoproduto',
    funnelType: 'vsl',
    trafficChannels: ['youtube', 'facebook_instagram', 'google'],
    status: 'em_teste',
    ticketPrice: 'R$ 97,00 (Front) -> R$ 997,00 (Upsell)',
    checkoutPlatform: 'Hotmart',
    addedDate: '2026-08-25',
    salesPageUrl: 'https://mestresdotrafego.com.br/vsl-estrategia',
    checkoutUrl: 'https://pay.hotmart.com/mestres-trafego-front',
    adLibraryUrl: 'https://www.facebook.com/ads/library/?q=mestres%20do%20trafego',
    headline: 'O método passo a passo para faturar R$ 10.000/mês como gestor de tráfego para infoprodutos sem precisar aparecer',
    hook: 'Você não precisa de seguidores nem de gravar dancinhas. O tráfego direto é o modelo mais enxuto da internet.',
    mainPromise: 'Aprender a subir campanhas validadas no Meta e Google do absoluto zero e fechar os primeiros 3 clientes em 30 dias.',
    uniqueMechanism: 'Sistema "Esteira 3D": Estrutura de contingência, mineração de ofertas validadas e teste rápido com R$ 20/dia.',
    targetAudience: 'Iniciantes na transição de carreira, estudantes e profissionais insatisfeitos com a CLT.',
    proofsUsed: 'Prints de painel de anúncios com ROAS 4.8x, notificações de vendas na tela do celular.',
    bonuses: 'Pack de Criativos Editáveis no Canva + Planilha de Cálculo de ROI + Comunidade de Suporte.',
    guarantee: 'Garantia de 15 dias: se não gostar das aulas, reembolso total em 1 clique.',
    cta: 'Acesse o treinamento completo por menos de R$ 3 por dia.',
    potentialRating: 3,
    tags: ['VSL Curta', 'Low Ticket Front', 'Hotmart'],
    isFavorite: false,
    freeNotes: 'Oferta recém-lançada pelo produtor. Está testando 3 ganchos diferentes de VSL (um focado em demissão da CLT, outro em liberdade geográfica e outro em modelo automático).',
    checklist: {
      copyAnalyzed: true,
      creativeSaved: true,
      funnelMapped: false,
      competitorsListed: false,
      checkoutTested: true,
      offerSwiped: false
    },
    funnelSteps: [
      { id: 'fs-31', offerId: 'offer-3', order: 1, type: 'front', name: 'Front-end: Curso Prático Gestor Express', price: 'R$ 97,00' },
      { id: 'fs-32', offerId: 'offer-3', order: 2, type: 'order_bump', name: 'Order Bump: Modelos de Contratos Jurídicos', price: 'R$ 27,00' },
      { id: 'fs-33', offerId: 'offer-3', order: 3, type: 'upsell_1', name: 'Upsell: Mentoria Semanal em Grupo (6 meses)', price: 'R$ 997,00' }
    ],
    validationLogs: [
      { id: 'vl-31', offerId: 'offer-3', date: '2026-08-25', activeAdsCount: 6, notes: 'Subiu os primeiros testes de criativo no YouTube e Meta.', createdAt: '2026-08-25T10:00:00Z' },
      { id: 'vl-32', offerId: 'offer-3', date: '2026-09-12', activeAdsCount: 18, notes: 'Encontrou o criativo vencedor e começou a duplicar conjuntos.', createdAt: '2026-09-12T10:00:00Z' }
    ],
    competitors: [],
    creatives: [
      {
        id: 'cr-31',
        offerId: 'offer-3',
        title: 'Print de Notificações de Venda + Gráfico de Lucro',
        fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        fileType: 'image',
        mimeType: 'image/jpeg',
        creativeType: 'imagem_estatica',
        hook3s: 'Esse não é mais um print fake da internet. Deixa eu te mostrar o extrato real da conta.',
        cta: 'Toque no link e assista à aula de 15 minutos sem enrolação.',
        notes: 'Anúncio estático de alta conversão para público frio no feed do Instagram.',
        sourceType: 'propria_oferta',
        tags: ['Estático Feed', 'Alta Conversão'],
        createdAt: '2026-08-26T11:00:00Z',
        fileSizeBytes: 310000
      }
    ],
    collectionIds: ['col-1'],
    isDemo: true,
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z'
  }
];

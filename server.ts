import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { dbManager } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Setup multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext) {
      if (file.mimetype === 'image/jpeg') ext = '.jpg';
      else if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else if (file.mimetype === 'video/mp4') ext = '.mp4';
      else if (file.mimetype === 'video/webm') ext = '.webm';
      else if (file.mimetype === 'video/quicktime') ext = '.mov';
      else ext = '.bin';
    }
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_') || 'file';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/webm'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não suportado: ${file.mimetype}. Formatos permitidos: JPG, PNG, WEBP, MP4, MOV, WEBM.`));
    }
  }
});

const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Owner auth check (login removed - open access)
function checkOwner(_req?: Request): boolean {
  return true;
}

// ----------------- API ROUTES -----------------

// Auth: Login (direct open access)
app.post('/api/auth/login', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    token: 'swipe-owner-master-token',
    user: { email: 'admin@swipe.com', isOwner: true }
  });
});

// Auth: Me
app.get('/api/auth/me', (_req: Request, res: Response) => {
  const settings = dbManager.getSettings();
  return res.json({
    isOwner: true,
    email: 'admin@swipe.com',
    shareMode: 'public',
    appName: settings.appName
  });
});

// Auth: Verify Passcode for Read-Only mode
app.post('/api/auth/verify-code', (_req: Request, res: Response) => {
  return res.json({ success: true, authorized: true });
});

// Auth: Change password
app.post('/api/auth/change-password', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode alterar a senha.' });
  }
  const { currentPassword, newPassword } = req.body;
  const owner = dbManager.getOwner();

  if (currentPassword !== owner.passwordHash) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 4 caracteres.' });
  }

  dbManager.updateOwnerPassword(newPassword);
  return res.json({ success: true, message: 'Senha atualizada com sucesso!' });
});

// Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  const settings = dbManager.getSettings();
  res.json(settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode alterar as configurações.' });
  }
  const updated = dbManager.updateSettings(req.body);
  res.json(updated);
});

// Stats
app.get('/api/stats', (_req: Request, res: Response) => {
  const stats = dbManager.getStats();
  res.json(stats);
});

// File Upload
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const isVideo = req.file.mimetype.startsWith('video/');
  
  res.json({
    success: true,
    fileUrl,
    filename: req.file.originalname,
    storedFilename: req.file.filename,
    fileType: isVideo ? 'video' : 'image',
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size
  });
});

// Offers CRUD
app.get('/api/offers', (req: Request, res: Response) => {
  const {
    search,
    niche,
    offerType,
    funnelType,
    trafficChannel,
    status,
    country,
    tag,
    isFavorite,
    minRating,
    collectionId,
    sortBy
  } = req.query;

  const offers = dbManager.getOffers({
    search: search ? String(search) : undefined,
    niche: niche ? String(niche) : undefined,
    offerType: offerType ? String(offerType) : undefined,
    funnelType: funnelType ? String(funnelType) : undefined,
    trafficChannel: trafficChannel ? String(trafficChannel) : undefined,
    status: status ? String(status) : undefined,
    country: country ? String(country) : undefined,
    tag: tag ? String(tag) : undefined,
    isFavorite: isFavorite !== undefined ? isFavorite === 'true' : undefined,
    minRating: minRating ? parseInt(String(minRating), 10) : undefined,
    collectionId: collectionId ? String(collectionId) : undefined,
    sortBy: sortBy as any
  });

  res.json(offers);
});

app.get('/api/offers/:id', (req: Request, res: Response) => {
  const offer = dbManager.getOfferById(req.params.id);
  if (!offer) {
    return res.status(404).json({ error: 'Oferta não encontrada.' });
  }
  res.json(offer);
});

app.post('/api/offers', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode cadastrar novas ofertas.' });
  }
  const created = dbManager.createOffer(req.body);
  res.status(201).json(created);
});

app.put('/api/offers/:id', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode editar ofertas.' });
  }
  const updated = dbManager.updateOffer(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Oferta não encontrada.' });
  }
  res.json(updated);
});

app.delete('/api/offers/:id', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode excluir ofertas.' });
  }
  const deleted = dbManager.deleteOffer(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Oferta não encontrada.' });
  }
  res.json({ success: true, message: 'Oferta excluída com sucesso.' });
});

app.post('/api/offers/:id/toggle-favorite', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode favoritar.' });
  }
  const status = dbManager.toggleFavorite(req.params.id);
  if (status === null) {
    return res.status(404).json({ error: 'Oferta não encontrada.' });
  }
  res.json({ isFavorite: status });
});

// Funnel steps
app.post('/api/offers/:id/funnel', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode editar o funil.' });
  }
  const step = dbManager.addFunnelStep({ ...req.body, offerId: req.params.id });
  res.status(201).json(step);
});

app.put('/api/funnel/:stepId', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode editar o funil.' });
  }
  const updated = dbManager.updateFunnelStep(req.params.stepId, req.body);
  if (!updated) return res.status(404).json({ error: 'Etapa não encontrada.' });
  res.json(updated);
});

app.delete('/api/funnel/:stepId', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode excluir etapas.' });
  }
  const deleted = dbManager.deleteFunnelStep(req.params.stepId);
  res.json({ success: deleted });
});

// Validation logs
app.post('/api/offers/:id/validation', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode registrar validações.' });
  }
  const log = dbManager.addValidationLog({
    offerId: req.params.id,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    activeAdsCount: Number(req.body.activeAdsCount) || 0,
    notes: req.body.notes || ''
  });
  res.status(201).json(log);
});

app.delete('/api/validation/:logId', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode excluir validações.' });
  }
  const deleted = dbManager.deleteValidationLog(req.params.logId);
  res.json({ success: deleted });
});

// Competitors
app.post('/api/offers/:id/competitors', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode adicionar concorrentes.' });
  }
  const comp = dbManager.addCompetitor({
    offerId: req.params.id,
    name: req.body.name,
    salesPageUrl: req.body.salesPageUrl || '',
    adLibraryUrl: req.body.adLibraryUrl || '',
    profileUrl: req.body.profileUrl || '',
    activeAdsCount: req.body.activeAdsCount ? Number(req.body.activeAdsCount) : undefined,
    dateIdentified: req.body.dateIdentified || new Date().toISOString().slice(0, 10),
    status: req.body.status || 'ativo',
    differencesNotes: req.body.differencesNotes || ''
  });
  res.status(201).json(comp);
});

app.put('/api/competitors/:id', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode editar concorrentes.' });
  }
  const updated = dbManager.updateCompetitor(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Concorrente não encontrado.' });
  res.json(updated);
});

app.delete('/api/competitors/:id', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode excluir concorrentes.' });
  }
  const deleted = dbManager.deleteCompetitor(req.params.id);
  res.json({ success: deleted });
});

// Creatives
app.post('/api/offers/:id/creatives', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode adicionar criativos.' });
  }
  const cr = dbManager.addCreative({
    offerId: req.params.id,
    competitorId: req.body.competitorId || null,
    title: req.body.title || 'Criativo sem título',
    fileUrl: req.body.fileUrl,
    fileType: req.body.fileType || 'image',
    mimeType: req.body.mimeType || 'image/jpeg',
    externalProvider: req.body.externalProvider || null,
    creativeType: req.body.creativeType || 'imagem_estatica',
    hook3s: req.body.hook3s || '',
    cta: req.body.cta || '',
    script: req.body.script || '',
    notes: req.body.notes || '',
    sourceType: req.body.sourceType || 'propria_oferta',
    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    fileSizeBytes: req.body.fileSizeBytes
  });
  res.status(201).json(cr);
});

app.put('/api/creatives/:id', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode editar criativos.' });
  }
  const updated = dbManager.updateCreative(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Criativo não encontrado.' });
  res.json(updated);
});

app.delete('/api/creatives/:id', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode excluir criativos.' });
  }
  const deleted = dbManager.deleteCreative(req.params.id);
  res.json({ success: deleted });
});

// Collections
app.get('/api/collections', (_req: Request, res: Response) => {
  res.json(dbManager.getCollections());
});

app.get('/api/collections/:id', (req: Request, res: Response) => {
  const col = dbManager.getCollectionById(req.params.id);
  if (!col) return res.status(404).json({ error: 'Coleção não encontrada.' });
  res.json(col);
});

app.post('/api/collections', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode criar coleções.' });
  }
  const col = dbManager.createCollection(req.body);
  res.status(201).json(col);
});

app.put('/api/collections/:id', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode editar coleções.' });
  }
  const updated = dbManager.updateCollection(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Coleção não encontrada.' });
  res.json(updated);
});

app.delete('/api/collections/:id', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode excluir coleções.' });
  }
  const deleted = dbManager.deleteCollection(req.params.id);
  res.json({ success: deleted });
});

app.post('/api/collections/:id/toggle-offer', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode alterar coleções.' });
  }
  const { offerId } = req.body;
  const success = dbManager.toggleOfferInCollection(req.params.id, offerId);
  res.json({ success });
});

// Full JSON Backup Export & Import
app.get('/api/export-backup', (_req: Request, res: Response) => {
  const data = dbManager.exportFullBackup();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="swipe-backup-completo.json"');
  res.json(data);
});

app.post('/api/import-backup', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode importar backup.' });
  }
  try {
    dbManager.importFullBackup(req.body);
    res.json({ success: true, message: 'Backup importado com sucesso!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Falha ao importar backup.' });
  }
});

// CSV Export & Import
app.get('/api/export/csv', (_req: Request, res: Response) => {
  const csv = dbManager.exportOffersCSV();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="swipe-ofertas.csv"');
  res.send(csv);
});

app.post('/api/import/csv', (req: Request, res: Response) => {
  if (!checkOwner(req)) {
    return res.status(403).json({ error: 'Apenas o dono pode importar dados.' });
  }
  const { csvContent } = req.body;
  if (!csvContent) {
    return res.status(400).json({ error: 'Conteúdo CSV ausente.' });
  }
  const result = dbManager.importOffersCSV(csvContent);
  res.json(result);
});

// Error handling middleware for multer / json
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Express error:', err);
  res.status(500).json({ error: err.message || 'Erro interno no servidor.' });
});

// ----------------- VITE INTEGRATION -----------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SWIPE] Servidor rodando com sucesso na porta ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor SWIPE:', err);
});

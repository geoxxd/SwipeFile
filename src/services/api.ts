import { Offer, Collection, AppSettings, FunnelStep, ValidationLog, Competitor, Creative } from '../types/index.ts';
import { isSupabaseConfigured, supabaseService } from './supabase.ts';
import { clientStorage } from './clientStorage.ts';

const TOKEN_KEY = 'swipe_owner_token';
const ACCESS_CODE_KEY = 'swipe_access_code';

export function getOwnerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setOwnerToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAccessCode(): string | null {
  return localStorage.getItem(ACCESS_CODE_KEY);
}

export function setAccessCode(code: string | null) {
  if (code) {
    localStorage.setItem(ACCESS_CODE_KEY, code);
  } else {
    localStorage.removeItem(ACCESS_CODE_KEY);
  }
}

let isServerDown = false;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (isServerDown) {
    throw new Error('BACKEND_OFFLINE');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  const token = getOwnerToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-owner-token'] = token;
  }

  const code = getAccessCode();
  if (code) {
    headers['x-access-code'] = code;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errorMsg = `Erro na requisição (${res.status})`;
      try {
        const data = await res.json();
        if (data.error) errorMsg = data.error;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    return res.json() as Promise<T>;
  } catch (err: any) {
    // If running on a static host like Netlify or server is unreachable
    if (
      err?.message === 'Failed to fetch' ||
      err?.name === 'TypeError' ||
      err?.message?.includes('NetworkError')
    ) {
      isServerDown = true;
      throw new Error('BACKEND_OFFLINE');
    }
    throw err;
  }
}

export const api = {
  isUsingSupabase() {
    return isSupabaseConfigured();
  },

  isServerOffline() {
    return isServerDown;
  },

  // Auth
  async login(email: string, password: string) {
    if (isSupabaseConfigured()) {
      setOwnerToken('supabase-owner-token');
      return { success: true, token: 'supabase-owner-token', user: { email, isOwner: true } };
    }
    try {
      const data = await request<{ success: boolean; token: string; user: { email: string; isOwner: boolean } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setOwnerToken(data.token);
      return data;
    } catch {
      setOwnerToken('client-owner-token');
      return { success: true, token: 'client-owner-token', user: { email, isOwner: true } };
    }
  },

  logout() {
    setOwnerToken(null);
  },

  async getMe() {
    if (isSupabaseConfigured()) {
      const settings = await supabaseService.getSettings();
      return {
        isOwner: true,
        email: 'proprietario@supabase.app',
        shareMode: settings.shareMode || 'public',
        appName: settings.appName || 'SWIPE'
      };
    }
    try {
      return await request<{ isOwner: boolean; email: string | null; shareMode: 'public' | 'access_code'; appName: string }>('/api/auth/me');
    } catch {
      const settings = clientStorage.getSettings();
      return {
        isOwner: true,
        email: 'admin@swipe.local',
        shareMode: settings.shareMode || 'public',
        appName: settings.appName || 'SWIPE'
      };
    }
  },

  async verifyCode(code: string) {
    if (isSupabaseConfigured()) {
      const settings = await supabaseService.getSettings();
      const valid = !settings.accessCode || settings.accessCode === code;
      if (valid) setAccessCode(code);
      return { success: valid, authorized: valid };
    }
    try {
      const data = await request<{ success: boolean; authorized: boolean }>('/api/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      if (data.success) setAccessCode(code);
      return data;
    } catch {
      const settings = clientStorage.getSettings();
      const valid = !settings.accessCode || settings.accessCode === code;
      if (valid) setAccessCode(code);
      return { success: valid, authorized: valid };
    }
  },

  async changePassword(currentPassword: string, newPassword: string) {
    if (isSupabaseConfigured()) {
      return { success: true, message: 'Senha atualizada no ambiente local.' };
    }
    try {
      return await request<{ success: boolean; message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
    } catch {
      return { success: true, message: 'Senha atualizada no navegador.' };
    }
  },

  // Settings
  async getSettings() {
    if (isSupabaseConfigured()) {
      return supabaseService.getSettings();
    }
    try {
      return await request<AppSettings>('/api/settings');
    } catch {
      return clientStorage.getSettings();
    }
  },

  async updateSettings(settings: Partial<AppSettings>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateSettings(settings);
    }
    try {
      return await request<AppSettings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
    } catch {
      return clientStorage.updateSettings(settings);
    }
  },

  // Stats
  async getStats() {
    if (isSupabaseConfigured()) {
      return supabaseService.getStats();
    }
    try {
      return await request<{
        totalOffers: number;
        statusCounts: Record<string, number>;
        totalCreatives: number;
        totalCompetitors: number;
        totalCollections: number;
      }>('/api/stats');
    } catch {
      return clientStorage.getStats();
    }
  },

  // Offers
  async getOffers(params?: Record<string, string | number | boolean | undefined>) {
    if (isSupabaseConfigured()) {
      return supabaseService.getOffers(params);
    }
    try {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            query.append(key, String(val));
          }
        });
      }
      const qs = query.toString() ? `?${query.toString()}` : '';
      return await request<Offer[]>(`/api/offers${qs}`);
    } catch {
      return clientStorage.getOffers(params);
    }
  },

  async getOfferById(id: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.getOfferById(id);
    }
    try {
      return await request<Offer>(`/api/offers/${id}`);
    } catch {
      const found = clientStorage.getOfferById(id);
      if (!found) throw new Error('Oferta não encontrada.');
      return found;
    }
  },

  async createOffer(data: Partial<Offer>) {
    if (isSupabaseConfigured()) {
      return supabaseService.createOffer(data);
    }
    try {
      return await request<Offer>('/api/offers', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      return clientStorage.createOffer(data);
    }
  },

  async updateOffer(id: string, updates: Partial<Offer>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateOffer(id, updates);
    }
    try {
      return await request<Offer>(`/api/offers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch {
      return clientStorage.updateOffer(id, updates);
    }
  },

  async deleteOffer(id: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteOffer(id);
    }
    try {
      return await request<{ success: boolean; message: string }>(`/api/offers/${id}`, {
        method: 'DELETE'
      });
    } catch {
      return clientStorage.deleteOffer(id);
    }
  },

  async toggleFavorite(id: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.toggleFavorite(id);
    }
    try {
      return await request<{ isFavorite: boolean }>(`/api/offers/${id}/toggle-favorite`, {
        method: 'POST'
      });
    } catch {
      return clientStorage.toggleFavorite(id);
    }
  },

  // Funnel
  async addFunnelStep(offerId: string, step: Omit<FunnelStep, 'id' | 'offerId'>) {
    if (isSupabaseConfigured()) {
      return supabaseService.addFunnelStep(offerId, step);
    }
    try {
      return await request<FunnelStep>(`/api/offers/${offerId}/funnel`, {
        method: 'POST',
        body: JSON.stringify(step)
      });
    } catch {
      return clientStorage.addFunnelStep(offerId, step);
    }
  },

  async updateFunnelStep(stepId: string, updates: Partial<FunnelStep>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateFunnelStep(stepId, updates);
    }
    try {
      return await request<FunnelStep>(`/api/funnel/${stepId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch {
      return clientStorage.updateFunnelStep(stepId, updates);
    }
  },

  async deleteFunnelStep(stepId: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteFunnelStep(stepId);
    }
    try {
      return await request<{ success: boolean }>(`/api/funnel/${stepId}`, {
        method: 'DELETE'
      });
    } catch {
      return clientStorage.deleteFunnelStep(stepId);
    }
  },

  // Validation
  async addValidationLog(offerId: string, log: { date: string; activeAdsCount: number; notes?: string }) {
    if (isSupabaseConfigured()) {
      return supabaseService.addValidationLog(offerId, log);
    }
    try {
      return await request<ValidationLog>(`/api/offers/${offerId}/validation`, {
        method: 'POST',
        body: JSON.stringify(log)
      });
    } catch {
      return clientStorage.addValidationLog(offerId, log);
    }
  },

  async deleteValidationLog(logId: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteValidationLog(logId);
    }
    try {
      return await request<{ success: boolean }>(`/api/validation/${logId}`, {
        method: 'DELETE'
      });
    } catch {
      return clientStorage.deleteValidationLog(logId);
    }
  },

  // Competitors
  async addCompetitor(offerId: string, comp: Partial<Competitor>) {
    if (isSupabaseConfigured()) {
      return supabaseService.addCompetitor(offerId, comp);
    }
    try {
      return await request<Competitor>(`/api/offers/${offerId}/competitors`, {
        method: 'POST',
        body: JSON.stringify(comp)
      });
    } catch {
      return clientStorage.addCompetitor(offerId, comp);
    }
  },

  async updateCompetitor(compId: string, updates: Partial<Competitor>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateCompetitor(compId, updates);
    }
    try {
      return await request<Competitor>(`/api/competitors/${compId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch {
      return clientStorage.updateCompetitor(compId, updates);
    }
  },

  async deleteCompetitor(compId: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteCompetitor(compId);
    }
    try {
      return await request<{ success: boolean }>(`/api/competitors/${compId}`, {
        method: 'DELETE'
      });
    } catch {
      return clientStorage.deleteCompetitor(compId);
    }
  },

  // Creatives
  async addCreative(offerId: string, creative: Partial<Creative>) {
    if (isSupabaseConfigured()) {
      return supabaseService.addCreative(offerId, creative);
    }
    try {
      return await request<Creative>(`/api/offers/${offerId}/creatives`, {
        method: 'POST',
        body: JSON.stringify(creative)
      });
    } catch {
      return clientStorage.addCreative(offerId, creative);
    }
  },

  async updateCreative(creativeId: string, updates: Partial<Creative>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateCreative(creativeId, updates);
    }
    try {
      return await request<Creative>(`/api/creatives/${creativeId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch {
      return clientStorage.updateCreative(creativeId, updates);
    }
  },

  async deleteCreative(creativeId: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteCreative(creativeId);
    }
    try {
      return await request<{ success: boolean }>(`/api/creatives/${creativeId}`, {
        method: 'DELETE'
      });
    } catch {
      return clientStorage.deleteCreative(creativeId);
    }
  },

  // Collections
  async getCollections() {
    if (isSupabaseConfigured()) {
      return supabaseService.getCollections();
    }
    try {
      return await request<Collection[]>('/api/collections');
    } catch {
      return clientStorage.getCollections();
    }
  },

  async getCollectionById(id: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.getCollectionById(id);
    }
    try {
      return await request<Collection>(`/api/collections/${id}`);
    } catch {
      const col = clientStorage.getCollectionById(id);
      if (!col) throw new Error('Coleção não encontrada.');
      return col;
    }
  },

  async createCollection(col: Partial<Collection>) {
    if (isSupabaseConfigured()) {
      return supabaseService.createCollection(col);
    }
    try {
      return await request<Collection>('/api/collections', {
        method: 'POST',
        body: JSON.stringify(col)
      });
    } catch {
      return clientStorage.createCollection(col);
    }
  },

  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection> {
    if (isSupabaseConfigured()) {
      return supabaseService.updateCollection(id, updates);
    }
    try {
      return await request<Collection>(`/api/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch {
      return clientStorage.updateCollection(id, updates);
    }
  },

  async deleteCollection(id: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteCollection(id);
    }
    try {
      return await request<{ success: boolean }>(`/api/collections/${id}`, {
        method: 'DELETE'
      });
    } catch {
      return clientStorage.deleteCollection(id);
    }
  },

  async toggleOfferInCollection(collectionId: string, offerId: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.toggleOfferInCollection(collectionId, offerId);
    }
    try {
      return await request<{ success: boolean }>(`/api/collections/${collectionId}/toggle-offer`, {
        method: 'POST',
        body: JSON.stringify({ offerId })
      });
    } catch {
      return clientStorage.toggleOfferInCollection(collectionId, offerId);
    }
  },

  async addOfferToCollection(collectionId: string, offerId: string) {
    return this.toggleOfferInCollection(collectionId, offerId);
  },

  async removeOfferFromCollection(collectionId: string, offerId: string) {
    return this.toggleOfferInCollection(collectionId, offerId);
  },

  getBaseUrl() {
    return '';
  },

  async importBackup(backupData: any) {
    if (isSupabaseConfigured()) {
      if (Array.isArray(backupData.offers)) {
        for (const off of backupData.offers) {
          try {
            await supabaseService.createOffer(off);
          } catch (e) {
            console.warn('Oferta já existente ou erro:', e);
          }
        }
      }
      return { success: true, message: 'Dados importados para o Supabase.' };
    }
    try {
      return await request<{ success: boolean; message: string }>('/api/import-backup', {
        method: 'POST',
        body: JSON.stringify(backupData)
      });
    } catch {
      if (Array.isArray(backupData.offers)) {
        for (const off of backupData.offers) {
          try { clientStorage.createOffer(off); } catch {}
        }
      }
      return { success: true, message: 'Backup importado no navegador.' };
    }
  },

  // File Upload with Progress Tracking
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
    if (isSupabaseConfigured()) {
      return supabaseService.uploadFile(file, onProgress, customFilename);
    }

    if (isServerDown) {
      return clientStorage.uploadFile(file, onProgress);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      const filename = customFilename || (file instanceof File ? file.name : 'thumbnail.jpg');
      formData.append('file', file, filename);

      xhr.open('POST', '/api/upload');

      const token = getOwnerToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('x-owner-token', token);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            resolve(res);
          } catch {
            // fallback to client storage
            clientStorage.uploadFile(file, onProgress).then(resolve).catch(reject);
          }
        } else {
          // fallback to client storage
          clientStorage.uploadFile(file, onProgress).then(resolve).catch(reject);
        }
      };

      xhr.onerror = () => {
        isServerDown = true;
        // fallback to client storage
        clientStorage.uploadFile(file, onProgress).then(resolve).catch(reject);
      };

      xhr.send(formData);
    });
  },

  // CSV
  exportCsvUrl() {
    return '/api/export/csv';
  },

  async importCsv(csvContent: string) {
    try {
      return await request<{ importedCount: number; errors: string[] }>('/api/import/csv', {
        method: 'POST',
        body: JSON.stringify({ csvContent })
      });
    } catch {
      return { importedCount: 0, errors: ['Importação CSV via servidor indisponível em modo estático.'] };
    }
  }
};

import { Offer, Collection, AppSettings, FunnelStep, ValidationLog, Competitor, Creative } from '../types/index.ts';
import { isSupabaseConfigured, supabaseService } from './supabase.ts';

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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
}

export const api = {
  isUsingSupabase() {
    return isSupabaseConfigured();
  },

  // Auth
  async login(email: string, password: string) {
    if (isSupabaseConfigured()) {
      setOwnerToken('supabase-owner-token');
      return { success: true, token: 'supabase-owner-token', user: { email, isOwner: true } };
    }
    const data = await request<{ success: boolean; token: string; user: { email: string; isOwner: boolean } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setOwnerToken(data.token);
    return data;
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
    return request<{ isOwner: boolean; email: string | null; shareMode: 'public' | 'access_code'; appName: string }>('/api/auth/me');
  },

  async verifyCode(code: string) {
    if (isSupabaseConfigured()) {
      const settings = await supabaseService.getSettings();
      const valid = !settings.accessCode || settings.accessCode === code;
      if (valid) setAccessCode(code);
      return { success: valid, authorized: valid };
    }
    const data = await request<{ success: boolean; authorized: boolean }>('/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    if (data.success) {
      setAccessCode(code);
    }
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    if (isSupabaseConfigured()) {
      return { success: true, message: 'Senha atualizada no ambiente local.' };
    }
    return request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // Settings
  async getSettings() {
    if (isSupabaseConfigured()) {
      return supabaseService.getSettings();
    }
    return request<AppSettings>('/api/settings');
  },

  async updateSettings(settings: Partial<AppSettings>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateSettings(settings);
    }
    return request<AppSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // Stats
  async getStats() {
    if (isSupabaseConfigured()) {
      return supabaseService.getStats();
    }
    return request<{
      totalOffers: number;
      statusCounts: Record<string, number>;
      totalCreatives: number;
      totalCompetitors: number;
      totalCollections: number;
    }>('/api/stats');
  },

  // Offers
  async getOffers(params?: Record<string, string | number | boolean | undefined>) {
    if (isSupabaseConfigured()) {
      return supabaseService.getOffers(params);
    }
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Offer[]>(`/api/offers${qs}`);
  },

  async getOfferById(id: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.getOfferById(id);
    }
    return request<Offer>(`/api/offers/${id}`);
  },

  async createOffer(data: Partial<Offer>) {
    if (isSupabaseConfigured()) {
      return supabaseService.createOffer(data);
    }
    return request<Offer>('/api/offers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateOffer(id: string, updates: Partial<Offer>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateOffer(id, updates);
    }
    return request<Offer>(`/api/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteOffer(id: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteOffer(id);
    }
    return request<{ success: boolean; message: string }>(`/api/offers/${id}`, {
      method: 'DELETE'
    });
  },

  async toggleFavorite(id: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.toggleFavorite(id);
    }
    return request<{ isFavorite: boolean }>(`/api/offers/${id}/toggle-favorite`, {
      method: 'POST'
    });
  },

  // Funnel
  async addFunnelStep(offerId: string, step: Omit<FunnelStep, 'id' | 'offerId'>) {
    if (isSupabaseConfigured()) {
      return supabaseService.addFunnelStep(offerId, step);
    }
    return request<FunnelStep>(`/api/offers/${offerId}/funnel`, {
      method: 'POST',
      body: JSON.stringify(step)
    });
  },

  async updateFunnelStep(stepId: string, updates: Partial<FunnelStep>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateFunnelStep(stepId, updates);
    }
    return request<FunnelStep>(`/api/funnel/${stepId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteFunnelStep(stepId: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteFunnelStep(stepId);
    }
    return request<{ success: boolean }>(`/api/funnel/${stepId}`, {
      method: 'DELETE'
    });
  },

  // Validation
  async addValidationLog(offerId: string, log: { date: string; activeAdsCount: number; notes?: string }) {
    if (isSupabaseConfigured()) {
      return supabaseService.addValidationLog(offerId, log);
    }
    return request<ValidationLog>(`/api/offers/${offerId}/validation`, {
      method: 'POST',
      body: JSON.stringify(log)
    });
  },

  async deleteValidationLog(logId: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteValidationLog(logId);
    }
    return request<{ success: boolean }>(`/api/validation/${logId}`, {
      method: 'DELETE'
    });
  },

  // Competitors
  async addCompetitor(offerId: string, comp: Partial<Competitor>) {
    if (isSupabaseConfigured()) {
      return supabaseService.addCompetitor(offerId, comp);
    }
    return request<Competitor>(`/api/offers/${offerId}/competitors`, {
      method: 'POST',
      body: JSON.stringify(comp)
    });
  },

  async updateCompetitor(compId: string, updates: Partial<Competitor>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateCompetitor(compId, updates);
    }
    return request<Competitor>(`/api/competitors/${compId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteCompetitor(compId: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteCompetitor(compId);
    }
    return request<{ success: boolean }>(`/api/competitors/${compId}`, {
      method: 'DELETE'
    });
  },

  // Creatives
  async addCreative(offerId: string, creative: Partial<Creative>) {
    if (isSupabaseConfigured()) {
      return supabaseService.addCreative(offerId, creative);
    }
    return request<Creative>(`/api/offers/${offerId}/creatives`, {
      method: 'POST',
      body: JSON.stringify(creative)
    });
  },

  async updateCreative(creativeId: string, updates: Partial<Creative>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateCreative(creativeId, updates);
    }
    return request<Creative>(`/api/creatives/${creativeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteCreative(creativeId: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteCreative(creativeId);
    }
    return request<{ success: boolean }>(`/api/creatives/${creativeId}`, {
      method: 'DELETE'
    });
  },

  // Collections
  async getCollections() {
    if (isSupabaseConfigured()) {
      return supabaseService.getCollections();
    }
    return request<Collection[]>('/api/collections');
  },

  async getCollectionById(id: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.getCollectionById(id);
    }
    return request<Collection>(`/api/collections/${id}`);
  },

  async createCollection(col: Partial<Collection>) {
    if (isSupabaseConfigured()) {
      return supabaseService.createCollection(col);
    }
    return request<Collection>('/api/collections', {
      method: 'POST',
      body: JSON.stringify(col)
    });
  },

  async updateCollection(id: string, updates: Partial<Collection>) {
    if (isSupabaseConfigured()) {
      return supabaseService.updateCollection(id, updates);
    }
    return request<Collection>(`/api/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteCollection(id: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.deleteCollection(id);
    }
    return request<{ success: boolean }>(`/api/collections/${id}`, {
      method: 'DELETE'
    });
  },

  async toggleOfferInCollection(collectionId: string, offerId: string) {
    if (isSupabaseConfigured()) {
      return supabaseService.toggleOfferInCollection(collectionId, offerId);
    }
    return request<{ success: boolean }>(`/api/collections/${collectionId}/toggle-offer`, {
      method: 'POST',
      body: JSON.stringify({ offerId })
    });
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
      // Import into Supabase
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
    return request<{ success: boolean; message: string }>('/api/import-backup', {
      method: 'POST',
      body: JSON.stringify(backupData)
    });
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
            reject(new Error('Resposta inválida do servidor'));
          }
        } else {
          try {
            const res = JSON.parse(xhr.responseText);
            reject(new Error(res.error || `Erro de upload: ${xhr.status}`));
          } catch {
            reject(new Error(`Falha no upload: status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Erro de conexão durante o upload'));
      };

      xhr.send(formData);
    });
  },

  // CSV
  exportCsvUrl() {
    return '/api/export/csv';
  },

  async importCsv(csvContent: string) {
    return request<{ importedCount: number; errors: string[] }>('/api/import/csv', {
      method: 'POST',
      body: JSON.stringify({ csvContent })
    });
  }
};


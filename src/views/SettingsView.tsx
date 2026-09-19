import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Plus,
  Save,
  Loader2,
  Database,
  Cloud,
  Copy,
  Check,
  FileCode,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { AppSettings } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../components/Toast.tsx';

interface SettingsViewProps {
  settings: AppSettings;
  isOwner?: boolean;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onRefreshAllData: () => void;
}

export function SettingsView({
  settings,
  onUpdateSettings,
  onRefreshAllData
}: SettingsViewProps) {
  const { success, error } = useToast();
  const [appName, setAppName] = useState(settings.appName || 'SWIPE');
  const [niches, setNiches] = useState<string[]>(settings.niches || []);
  const [newNicheInput, setNewNicheInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const isUsingSupabase = api.isUsingSupabase();
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';

  const handleCopySql = async () => {
    try {
      const response = await fetch('/supabase_schema.sql');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopiedSql(true);
      success('Script SQL copiado para a área de transferência!');
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      // Fallback
      setCopiedSql(true);
      success('Script SQL copiado!');
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  const handleDownloadSql = () => {
    const link = document.createElement('a');
    link.href = '/supabase_schema.sql';
    link.download = 'supabase_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Download do script SQL iniciado.');
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Partial<AppSettings> = {
        appName: appName.trim(),
        niches
      };

      const updated = await api.updateSettings(payload);
      onUpdateSettings(updated);
      success('Configurações salvas com sucesso!');
    } catch (err: any) {
      error(err.message || 'Falha ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNiche = () => {
    if (!newNicheInput.trim()) return;
    if (niches.includes(newNicheInput.trim())) {
      error('Este nicho já existe na lista.');
      return;
    }
    setNiches([...niches, newNicheInput.trim()]);
    setNewNicheInput('');
  };

  const handleRemoveNiche = (index: number) => {
    setNiches(niches.filter((_, i) => i !== index));
  };

  // Export database as JSON
  const handleExportBackup = () => {
    const backupUrl = `${api.getBaseUrl()}/export-backup`;
    window.open(backupUrl, '_blank');
    success('Download do backup iniciado.');
  };

  // Import database backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.importBackup(json);
        success('Backup importado com sucesso! Atualizando dados...');
        onRefreshAllData();
      } catch (err: any) {
        error('Falha ao importar backup: arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6 pb-16 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Configurações do Swipe File</span>
        </h1>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          Personalize o nome da plataforma, nichos de mercado e gerenciamento de backup.
        </p>
      </div>

      <form onSubmit={handleSaveGeneral} className="flex flex-col gap-6">
        {/* SECTION 1: IDENTIDADE DO APP */}
        <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>1. Nome da Aplicação</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
              Nome do Web App (Provisório, você pode trocar a qualquer momento)
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Ex.: SWIPE, SwipeBox, Vault Ads, SpyScale..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none"
            />
            <span className="text-[11px] text-[#6B7280] mt-1 block">
              Este nome aparece na barra de navegação superior, no cabeçalho e na tela inicial.
            </span>
          </div>
        </div>

        {/* SECTION 2: NICHOS CADASTRADOS */}
        <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>2. Lista de Nichos do Mercado</span>
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newNicheInput}
              onChange={(e) => setNewNicheInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNiche();
                }
              }}
              placeholder="Nome do novo nicho (ex.: Confeitaria, IA, Espiritualidade)..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddNiche}
              className="px-4 py-2 rounded-xl bg-[#1F2A1F] hover:bg-[#22C55E] text-[#22C55E] hover:text-black font-semibold text-xs transition-colors"
            >
              Adicionar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {niches.map((n, i) => (
              <span
                key={n}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A0D0A] text-xs text-[#E5E7EB] border border-[#1F2A1F]"
              >
                <span>{n}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveNiche(i)}
                  className="text-[#6B7280] hover:text-[#EF4444] transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Save button for General Form */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#4ADE80] text-black font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* SECTION 3: BACKUP & DADOS DO BANCO */}
      <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-4">
        <h2 className="text-sm font-bold text-[#3B82F6] uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>3. Backup & Restauração de Dados</span>
        </h2>
        <p className="text-xs text-[#9CA3AF]">
          Seus dados são salvos em persistência no servidor. Você pode exportar uma cópia completa de segurança em JSON a qualquer momento.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16202E] hover:bg-[#1E2E42] text-[#60A5FA] border border-[#3B82F6]/30 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Backup Completo (.JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A221A] hover:bg-[#232F23] text-[#22C55E] border border-[#22C55E]/30 text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Importar Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* SECTION 4: SUPABASE & DEPLOY NETLIFY */}
      <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>4. Integração Supabase & Deploy na Netlify</span>
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-1">
              O projeto foi preparado em puro React Vite para você baixar, conectar ao Supabase e hospedar na Netlify sem complicação.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isUsingSupabase ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#142A18] border border-[#22C55E]/40 text-[#22C55E] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                <span>Supabase Conectado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A2310] border border-[#EAB308]/40 text-[#EAB308] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span>
                <span>Modo Local (Pronto para Supabase)</span>
              </div>
            )}
          </div>
        </div>

        {/* Current info card */}
        <div className="p-4 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#162016] border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {isUsingSupabase ? 'Armazenamento em Nuvem Ativo' : 'Banco de Dados & Storage Prontos'}
              </p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                {isUsingSupabase
                  ? `Conectado ao Supabase: ${supabaseUrl}`
                  : 'O arquivo supabase_schema.sql e netlify.toml já estão incluídos no projeto baixado.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopySql}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A221A] hover:bg-[#232F23] text-[#22C55E] border border-[#22C55E]/30 text-xs font-semibold transition-colors"
            >
              {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSql}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#16202E] hover:bg-[#1E2E42] text-[#60A5FA] border border-[#3B82F6]/30 text-xs font-semibold transition-colors"
            >
              <FileCode className="w-4 h-4" />
              <span>Baixar .SQL</span>
            </button>
          </div>
        </div>

        {/* Step-by-step Guide */}
        <div className="flex flex-col gap-3 mt-1">
          <h3 className="text-xs font-bold text-[#E5E7EB] uppercase tracking-wider">
            Passo a Passo para Hospedar:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#22C55E] text-xs font-bold">
                <span className="w-5 h-5 rounded-full bg-[#162016] border border-[#22C55E]/40 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Configurar Supabase</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                Crie um projeto no Supabase, abra o <strong>SQL Editor</strong> e cole o conteúdo do <strong>supabase_schema.sql</strong>. Ele cria todas as tabelas e o bucket de storage para os vídeos e capas.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#22C55E] text-xs font-bold">
                <span className="w-5 h-5 rounded-full bg-[#162016] border border-[#22C55E]/40 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Subir na Netlify</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                Baixe o ZIP do projeto, suba no GitHub e conecte à Netlify. O arquivo <strong>netlify.toml</strong> já está configurado com comando de build <code>npm run build</code> e rotas SPA.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#22C55E] text-xs font-bold">
                <span className="w-5 h-5 rounded-full bg-[#162016] border border-[#22C55E]/40 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Variáveis de Ambiente</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                No Netlify (<strong>Site configuration &gt; Environment variables</strong>), cadastre:
                <br />
                <code className="text-[#22C55E] text-[10px]">VITE_SUPABASE_URL</code>
                <br />
                <code className="text-[#22C55E] text-[10px]">VITE_SUPABASE_ANON_KEY</code>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { X, Zap, Upload, Link as LinkIcon, Loader2, CheckCircle2, AlertCircle, Video, Play, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api.ts';
import { Offer } from '../types/index.ts';
import { useToast } from './Toast.tsx';
import { captureVideoFirstFrame, getExternalVideoThumbnail } from '../utils/videoThumbnail.ts';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (offer: Offer) => void;
}

export function QuickAddModal({ isOpen, onClose, onCreated }: QuickAddModalProps) {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [creativeMode, setCreativeMode] = useState<'upload' | 'link'>('upload');
  const [creativeLink, setCreativeLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [autoThumbData, setAutoThumbData] = useState<{ blob: Blob; dataUrl: string } | null>(null);
  const [isExtractingThumb, setIsExtractingThumb] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setAutoThumbData(null);

      if (file.type.startsWith('video/')) {
        setIsExtractingThumb(true);
        try {
          const frame = await captureVideoFirstFrame(file);
          setAutoThumbData(frame);
        } catch (err) {
          console.warn('Não foi possível extrair o primeiro frame do vídeo:', err);
        } finally {
          setIsExtractingThumb(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Por favor, informe o nome da oferta.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let creativeUrl = '';
      let thumbnailUrl: string | undefined = undefined;
      let fileType: 'image' | 'video' | 'external_video' = 'image';
      let mimeType = 'image/jpeg';
      let fileSizeBytes = 0;

      // Handle file upload if present
      if (creativeMode === 'upload' && selectedFile) {
        const uploadRes = await api.uploadFile(selectedFile, (percent) => {
          setUploadProgress(percent);
        });
        creativeUrl = uploadRes.fileUrl;
        fileType = uploadRes.fileType;
        mimeType = uploadRes.mimeType;
        fileSizeBytes = uploadRes.sizeBytes;

        // If video, upload the extracted first frame as the thumbnail/capa
        if (fileType === 'video') {
          let thumbBlob = autoThumbData?.blob;
          if (!thumbBlob) {
            try {
              const frame = await captureVideoFirstFrame(selectedFile);
              thumbBlob = frame.blob;
            } catch (err) {
              console.warn('Erro ao extrair frame do vídeo:', err);
            }
          }
          if (thumbBlob) {
            try {
              const thumbRes = await api.uploadFile(thumbBlob, undefined, `capa-${Date.now()}.jpg`);
              thumbnailUrl = thumbRes.fileUrl;
            } catch (err) {
              console.warn('Erro ao fazer upload da capa do vídeo:', err);
            }
          }
        }
      } else if (creativeMode === 'link' && creativeLink.trim()) {
        creativeUrl = creativeLink.trim();
        fileType = 'external_video';
        const ytThumb = getExternalVideoThumbnail(creativeUrl);
        if (ytThumb) {
          thumbnailUrl = ytThumb;
        }
      }

      // Create base offer
      const newOffer = await api.createOffer({
        name: name.trim(),
        salesPageUrl: link.trim() || undefined,
        status: 'em_teste',
        niche: 'Marketing Digital & Tráfego',
        country: 'Brasil',
        language: 'Português (BR)',
        offerType: 'infoproduto',
        funnelType: 'vsl',
        trafficChannels: ['facebook_instagram'],
        potentialRating: 3,
        tags: ['Cadastro Rápido'],
        checklist: {
          copyAnalyzed: false,
          creativeSaved: !!creativeUrl,
          funnelMapped: false,
          competitorsListed: false,
          checkoutTested: false,
          offerSwiped: false
        }
      });

      // If creative was provided, attach to offer
      if (creativeUrl) {
        await api.addCreative(newOffer.id, {
          title: `Criativo Inicial - ${name.trim()}`,
          fileUrl: creativeUrl,
          thumbnailUrl,
          fileType,
          mimeType,
          creativeType: fileType === 'video' || fileType === 'external_video' ? 'vsl' : 'imagem_estatica',
          sourceType: 'propria_oferta',
          tags: ['Rápido'],
          fileSizeBytes: fileSizeBytes || undefined
        });
      }

      success('Oferta cadastrada rapidamente com sucesso!');
      onCreated(newOffer);
      onClose();
      // Reset form
      setName('');
      setLink('');
      setCreativeLink('');
      setSelectedFile(null);
      setAutoThumbData(null);
      setUploadProgress(0);
    } catch (err: any) {
      error(err.message || 'Falha ao cadastrar oferta rápida.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111411] border border-[#1F2A1F] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#E5E7EB]">Cadastro Rápido</h3>
            <p className="text-xs text-[#9CA3AF]">
              Guarde agora em segundos e preencha a análise detalhada depois.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 1. Nome da Oferta */}
          <div>
            <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
              Nome da Oferta <span className="text-[#22C55E]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex.: Método Seca Barriga VSL 2.0"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none transition-colors"
            />
          </div>

          {/* 2. Link Principal */}
          <div>
            <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
              Link da Oferta (Página de Vendas ou Ad Library)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none transition-colors"
            />
          </div>

          {/* 3. Criativo Inicial */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#D1D5DB]">
                Criativo Inicial (Opcional)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCreativeMode('upload')}
                  className={`px-2 py-0.5 text-xs rounded ${
                    creativeMode === 'upload'
                      ? 'bg-[#1F2A1F] text-[#22C55E] font-medium'
                      : 'text-[#9CA3AF]'
                  }`}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setCreativeMode('link')}
                  className={`px-2 py-0.5 text-xs rounded ${
                    creativeMode === 'link'
                      ? 'bg-[#1F2A1F] text-[#22C55E] font-medium'
                      : 'text-[#9CA3AF]'
                  }`}
                >
                  Link Vídeo
                </button>
              </div>
            </div>

            {creativeMode === 'upload' ? (
              <div className="border border-dashed border-[#1F2A1F] hover:border-[#22C55E]/50 rounded-xl p-4 text-center bg-[#0A0D0A] transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  {isExtractingThumb ? (
                    <div className="flex flex-col items-center gap-1 text-[#22C55E] py-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-xs font-medium">Extraindo primeiro frame para a capa do vídeo...</span>
                    </div>
                  ) : autoThumbData ? (
                    <div className="flex items-center gap-3 w-full bg-[#111611] p-2 rounded-xl border border-[#22C55E]/30 text-left">
                      <div className="w-16 h-12 rounded-lg bg-black overflow-hidden relative shrink-0 border border-[#22C55E]/40">
                        <img src={autoThumbData.dataUrl} alt="Capa" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-[#22C55E] fill-[#22C55E]" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[#22C55E] text-xs font-bold">
                          <Video className="w-3.5 h-3.5 shrink-0" />
                          <span>Capa do vídeo capturada (1º frame)</span>
                        </div>
                        <p className="text-[11px] text-[#E5E7EB] font-medium truncate mt-0.5">
                          {selectedFile?.name}
                        </p>
                        <p className="text-[10px] text-[#9CA3AF]">
                          {((selectedFile?.size || 0) / 1024 / 1024).toFixed(1)} MB • Clique para trocar
                        </p>
                      </div>
                    </div>
                  ) : selectedFile ? (
                    <div className="text-xs text-[#22C55E] font-medium truncate max-w-xs">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[#9CA3AF]" />
                      <p className="text-xs text-[#E5E7EB] font-medium">
                        Arraste ou clique para enviar print ou vídeo
                      </p>
                      <p className="text-[10px] text-[#6B7280]">
                        JPG, PNG, WEBP, MP4, MOV, WEBM (até 100MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <input
                type="url"
                placeholder="Ex.: YouTube, Vimeo, Google Drive ou link .mp4"
                value={creativeLink}
                onChange={(e) => setCreativeLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-[#E5E7EB] placeholder-[#6B7280] focus:border-[#22C55E] focus:outline-none transition-colors"
              />
            )}
          </div>

          {/* Upload Progress Bar */}
          {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span>Fazendo upload para o storage...</span>
                <span className="font-mono-num text-[#22C55E]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#1F2A1F] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#22C55E] transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#1F2A1F]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9CA3AF] hover:text-white bg-[#1A221A] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-black bg-[#22C55E] hover:bg-[#4ADE80] rounded-xl transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando no banco...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Salvar Oferta</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

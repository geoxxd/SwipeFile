import React, { useState } from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, Play, Copy, Check, Edit, FileText } from 'lucide-react';
import { Creative } from '../types/index.ts';

interface MediaPlayerModalProps {
  creative: Creative | null;
  onClose: () => void;
  onEdit?: (creative: Creative) => void;
  isOwner?: boolean;
}

export function MediaPlayerModal({ creative, onClose, onEdit, isOwner }: MediaPlayerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!creative) return null;

  const getEmbedUrl = (url: string) => {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // Google Drive
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(creative.fileUrl);
  const isVideo = creative.fileType === 'video' || creative.fileType === 'external_video' || !!embedUrl;

  const handleCopyScript = () => {
    if (!creative.script) return;
    navigator.clipboard.writeText(creative.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0A0D0A] border border-[#1F2A1F] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)] relative">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1F2A1F] bg-[#070A07]">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 uppercase">
              {creative.creativeType.replace('_', ' ')}
            </span>
            <h3 className="text-base font-semibold text-white truncate">{creative.title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isOwner && onEdit && (
              <button
                onClick={() => onEdit(creative)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black bg-[#22C55E] hover:bg-[#4ADE80] rounded-xl transition-colors shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                title="Editar Análise, Copy e Detalhes"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar Criativo</span>
              </button>
            )}
            <a
              href={creative.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-[#22C55E]/70 hover:text-[#22C55E] hover:bg-[#152215] rounded-xl transition-colors"
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={creative.fileUrl}
              download
              className="p-2 text-[#22C55E]/70 hover:text-[#22C55E] hover:bg-[#152215] rounded-xl transition-colors"
              title="Baixar arquivo"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-[#22C55E]/70 hover:text-white hover:bg-[#152215] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Media & Details */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Media Player Container */}
          <div className="lg:col-span-7 bg-[#000000] flex items-center justify-center p-4 min-h-[320px] relative border-b lg:border-b-0 lg:border-r border-[#1F2A1F]">
            {embedUrl ? (
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
                <iframe
                  src={embedUrl}
                  title={creative.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : isVideo ? (
              <div className="w-full max-h-[70vh] flex items-center justify-center">
                <video
                  src={creative.fileUrl}
                  poster={creative.thumbnailUrl}
                  controls
                  autoPlay
                  className="max-h-[65vh] w-full rounded-lg bg-black shadow-lg object-contain"
                >
                  Seu navegador não suporta a reprodução deste vídeo.
                </video>
              </div>
            ) : (
              <div className="w-full max-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#050805]/90 backdrop-blur-sm p-1 rounded-lg border border-[#1F2A1F] z-10">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                    className="p-1 text-[#22C55E]/70 hover:text-white hover:bg-[#152215] rounded"
                    title="Diminuir zoom"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-[#22C55E] px-1 font-mono-num">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                    className="p-1 text-[#22C55E]/70 hover:text-white hover:bg-[#152215] rounded"
                    title="Aumentar zoom"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <img
                  src={creative.fileUrl}
                  alt={creative.title}
                  style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease-out' }}
                  className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-5 p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh] lg:max-h-full bg-[#080C08]">
            {/* Hook 3s */}
            <div className="p-3.5 rounded-xl bg-[#0D120D] border border-[#1F2A1F] relative group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-[#22C55E] text-xs font-semibold uppercase tracking-wider">
                  <Play className="w-3.5 h-3.5 fill-[#22C55E]" />
                  Gancho dos Primeiros 3 Segundos
                </div>
                {isOwner && onEdit && (
                  <button
                    onClick={() => onEdit(creative)}
                    className="text-[11px] text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
              {creative.hook3s ? (
                <p className="text-sm text-white leading-relaxed italic">"{creative.hook3s}"</p>
              ) : (
                <p className="text-xs text-[#22C55E]/50 italic">
                  Nenhum gancho registrado. {isOwner && onEdit ? 'Clique em "Editar" para preencher.' : ''}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="p-3.5 rounded-xl bg-[#0D120D] border border-[#1F2A1F] relative group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#22C55E] text-xs font-semibold uppercase tracking-wider block">
                  Chamada para Ação (CTA)
                </span>
                {isOwner && onEdit && (
                  <button
                    onClick={() => onEdit(creative)}
                    className="text-[11px] text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
              {creative.cta ? (
                <p className="text-sm font-medium text-[#4ADE80]">{creative.cta}</p>
              ) : (
                <p className="text-xs text-[#22C55E]/50 italic">
                  Nenhuma CTA registrada. {isOwner && onEdit ? 'Clique em "Editar" para preencher.' : ''}
                </p>
              )}
            </div>

            {/* Script / Transcription */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Roteiro / Transcrição da Copy
                </span>
                <div className="flex items-center gap-2">
                  {creative.script && (
                    <button
                      onClick={handleCopyScript}
                      className="flex items-center gap-1 text-xs text-[#22C55E] hover:text-[#4ADE80] transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  )}
                  {isOwner && onEdit && (
                    <button
                      onClick={() => onEdit(creative)}
                      className="flex items-center gap-1 text-xs text-[#22C55E] hover:text-[#4ADE80] transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              </div>
              {creative.script ? (
                <div className="p-3.5 rounded-xl bg-[#040604] border border-[#1F2A1F] text-xs text-[#E5E7EB] font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {creative.script}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#040604] border border-dashed border-[#1F2A1F] text-center text-xs text-[#22C55E]/50">
                  Nenhum roteiro ou transcrição adicionado.
                  {isOwner && onEdit && (
                    <button
                      onClick={() => onEdit(creative)}
                      className="block mx-auto mt-1.5 text-xs text-[#22C55E] hover:underline font-semibold"
                    >
                      + Preencher Roteiro Agora
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Video Cover / Thumbnail if present */}
            {creative.thumbnailUrl && (
              <div className="p-3 rounded-xl bg-[#0D120D] border border-[#1F2A1F] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-12 h-9 rounded-lg overflow-hidden bg-black shrink-0 border border-[#1F2A1F]">
                    <img src={creative.thumbnailUrl} alt="Capa" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-[#22C55E] block">
                      Capa do Vídeo
                    </span>
                    <span className="text-[10px] text-[#22C55E]/70 block truncate">
                      Primeiro frame automático
                    </span>
                  </div>
                </div>
                <a
                  href={creative.thumbnailUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-[10px] font-semibold text-[#22C55E] bg-[#142014] border border-[#22C55E]/30 rounded-lg hover:bg-[#22C55E]/20 transition-colors shrink-0"
                >
                  Ver Capa
                </a>
              </div>
            )}

            {/* Notes */}
            <div className="p-3.5 rounded-xl bg-[#0D120D] border border-[#1F2A1F] relative group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#22C55E] text-xs font-semibold uppercase tracking-wider block">
                  Observações de Modelagem
                </span>
                {isOwner && onEdit && (
                  <button
                    onClick={() => onEdit(creative)}
                    className="text-[11px] text-[#22C55E] hover:text-[#4ADE80] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
              {creative.notes ? (
                <p className="text-sm text-white leading-relaxed">{creative.notes}</p>
              ) : (
                <p className="text-xs text-[#22C55E]/50 italic">
                  Nenhuma observação registrada.
                </p>
              )}
            </div>

            {/* Tags & Meta */}
            <div className="mt-auto pt-3 border-t border-[#1F2A1F] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {creative.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded-md bg-[#162416] text-[#4ADE80] border border-[#22C55E]/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-[#22C55E]/60 font-mono-num">
                {new Date(creative.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

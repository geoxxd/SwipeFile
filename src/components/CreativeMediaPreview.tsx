import React, { useState } from 'react';
import { Play, Video, Image as ImageIcon } from 'lucide-react';
import { Creative } from '../types/index.ts';
import { getExternalVideoThumbnail } from '../utils/videoThumbnail.ts';

interface CreativeMediaPreviewProps {
  creative?: Partial<Creative> | null;
  className?: string;
  showPlayBadge?: boolean;
  alt?: string;
}

export function CreativeMediaPreview({
  creative,
  className = 'w-full h-full object-cover',
  showPlayBadge = true,
  alt = ''
}: CreativeMediaPreviewProps) {
  const [hasImgError, setHasImgError] = useState(false);

  if (!creative || (!creative.fileUrl && !creative.thumbnailUrl)) {
    return (
      <div className="w-full h-full bg-[#0A0D0A] flex flex-col items-center justify-center text-[#2A382A]">
        <ImageIcon className="w-7 h-7 stroke-[1.5]" />
      </div>
    );
  }

  const isVideo =
    creative.fileType === 'video' ||
    creative.fileType === 'external_video' ||
    creative.creativeType === 'vsl' ||
    creative.creativeType === 'ugc' ||
    creative.creativeType === 'depoimento';

  // Determine best thumbnail source
  const externalThumb = creative.fileType === 'external_video'
    ? getExternalVideoThumbnail(creative.fileUrl || '')
    : null;

  const coverUrl = creative.thumbnailUrl || externalThumb || (creative.fileType === 'image' ? creative.fileUrl : null);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0A0D0A] flex items-center justify-center">
      {coverUrl && !hasImgError ? (
        <img
          src={coverUrl}
          alt={alt || creative.title || 'Capa do criativo'}
          onError={() => setHasImgError(true)}
          className={className}
        />
      ) : isVideo && creative.fileUrl && !creative.fileUrl.startsWith('http://') && !creative.fileUrl.includes('youtube') && !creative.fileUrl.includes('drive.google') ? (
        <video
          src={creative.fileUrl}
          preload="metadata"
          muted
          playsInline
          className={`${className} pointer-events-none`}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#121912] to-[#0A0D0A] flex flex-col items-center justify-center text-[#22C55E]/60 p-2">
          {isVideo ? (
            <Video className="w-8 h-8 stroke-[1.5] text-[#22C55E]/40" />
          ) : (
            <ImageIcon className="w-8 h-8 stroke-[1.5] text-[#22C55E]/40" />
          )}
        </div>
      )}

      {/* Play Icon Badge */}
      {isVideo && showPlayBadge && (
        <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 flex items-center justify-center transition-colors pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-[#22C55E] flex items-center justify-center shadow-lg shadow-black/50 group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}

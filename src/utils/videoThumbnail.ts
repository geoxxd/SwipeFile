/**
 * Utility to extract the first frame (capa/thumbnail) from video files or video URLs
 * and retrieve thumbnails from video providers like YouTube.
 */

export function getExternalVideoThumbnail(url: string): string | null {
  if (!url) return null;
  // YouTube standard and short URLs
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  return null;
}

/**
 * Extracts the first frame of a video file or video URL as a high quality JPEG Blob and DataURL.
 */
export async function captureVideoFirstFrame(
  source: File | Blob | string,
  seekTime = 0.1
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    let objectUrl = '';
    if (typeof source === 'string') {
      video.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      video.src = objectUrl;
    }

    let hasFinished = false;

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
    };

    const timeout = setTimeout(() => {
      if (!hasFinished) {
        hasFinished = true;
        cleanup();
        reject(new Error('Tempo limite excedido ao capturar a capa do vídeo.'));
      }
    }, 12000);

    video.onloadedmetadata = () => {
      // Seek to the first frame (0.1s or 10% of duration)
      const targetTime = Math.min(seekTime, video.duration > 0 ? Math.max(0.05, video.duration * 0.05) : 0.1);
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      if (hasFinished) return;
      try {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 360;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Não foi possível obter o contexto 2D do canvas.');
        }

        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
              hasFinished = true;
              clearTimeout(timeout);
              cleanup();
              resolve({ blob, dataUrl });
            } else {
              hasFinished = true;
              clearTimeout(timeout);
              cleanup();
              reject(new Error('Falha ao exportar o quadro do vídeo em imagem.'));
            }
          },
          'image/jpeg',
          0.88
        );
      } catch (err) {
        if (!hasFinished) {
          hasFinished = true;
          clearTimeout(timeout);
          cleanup();
          reject(err);
        }
      }
    };

    video.onerror = () => {
      if (!hasFinished) {
        hasFinished = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error('Não foi possível carregar o vídeo para capturar a capa.'));
      }
    };
  });
}

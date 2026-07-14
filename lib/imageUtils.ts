export const processImageWithWorker = (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ originalUrl: string; processedUrl: string }> => {
  return new Promise((resolve, reject) => {
    const originalUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = originalUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not found'));

      // Scale down image if it's too large to prevent memory issues and slow processing
      // Max dimension 2048px
      const MAX_DIMENSION = 2048;
      let width = img.width;
      let height = img.height;

      if (width > height && width > MAX_DIMENSION) {
        height *= MAX_DIMENSION / width;
        width = MAX_DIMENSION;
      } else if (height > MAX_DIMENSION) {
        width *= MAX_DIMENSION / height;
        height = MAX_DIMENSION;
      }

      width = Math.floor(width);
      height = Math.floor(height);

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);

      const worker = new Worker('/imageWorker.js');
      
      worker.onmessage = (e) => {
        if (e.data.resultImageData) {
          ctx.putImageData(e.data.resultImageData, 0, 0);
          
          // Note: Watermark is NOT added to the preview to keep the comparison clean.
          // It will be added during the download step.
          
          const processedUrl = canvas.toDataURL('image/jpeg', 0.9);
          worker.terminate();
          resolve({ originalUrl, processedUrl });
        }
      };

      worker.onerror = (err) => {
        worker.terminate();
        reject(err);
      };

      worker.postMessage({ imageData, action: 'process' });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

export const downloadImageWithWatermark = (
  originalUrl: string, 
  processedUrl: string, 
  filename: string,
  strength: number = 100,
  addWatermark: boolean = true
) => {
  const originalImg = new Image();
  const processedImg = new Image();
  
  originalImg.crossOrigin = 'anonymous';
  processedImg.crossOrigin = 'anonymous';

  let loadedImages = 0;
  const onImageLoad = () => {
    loadedImages++;
    if (loadedImages === 2) {
      const canvas = document.createElement('canvas');
      canvas.width = originalImg.width;
      canvas.height = originalImg.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Draw original image as base
      ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
      
      // Draw processed image on top with opacity based on strength
      // Must specify canvas dimensions to stretch processedImg to full size,
      // since it may have been downscaled (max 2048px) during processing.
      ctx.globalAlpha = strength / 100;
      ctx.drawImage(processedImg, 0, 0, canvas.width, canvas.height);
      
      // Reset alpha for watermark
      ctx.globalAlpha = 1.0;
      
      // Add Watermark if enabled
      if (addWatermark) {
        ctx.globalAlpha = 0.5; // 50% opacity
        ctx.fillStyle = '#ffffff'; // White text
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        // Font size based on image height (e.g. 3% of height)
        const fontSize = Math.max(16, Math.floor(canvas.height * 0.03));
        ctx.font = `bold ${fontSize}px sans-serif`;
        
        // Add text shadow for better visibility on bright backgrounds
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Position at bottom right with some padding
        const padding = fontSize;
        ctx.fillText('Powered by ECODIVERS JEJU', canvas.width - padding, canvas.height - padding);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      // Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95);
    }
  };

  originalImg.onload = onImageLoad;
  processedImg.onload = onImageLoad;

  originalImg.src = originalUrl;
  processedImg.src = processedUrl;
};

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

export const downloadImageWithWatermark = (imageUrl: string, filename: string) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imageUrl;
  
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Draw original processed image
    ctx.drawImage(img, 0, 0);
    
    // Add Watermark
    ctx.globalAlpha = 0.3; // 30% opacity
    ctx.fillStyle = '#ffffff'; // White text
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    // Font size based on image height (e.g. 3% of height)
    const fontSize = Math.max(16, Math.floor(canvas.height * 0.03));
    ctx.font = `bold ${fontSize}px sans-serif`;
    
    // Position at bottom right with some padding
    const padding = fontSize;
    ctx.fillText('Powered by ECODIVERS JEJU', canvas.width - padding, canvas.height - padding);
    
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
  };
};

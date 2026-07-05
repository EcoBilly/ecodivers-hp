self.onmessage = function (e) {
  const { imageData, action } = e.data;

  if (action === 'process') {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const numPixels = width * height;

    // --- 1. Histogram Percentile Stretching (Color Balance & Contrast) ---
    // Create histograms for R, G, B
    const histR = new Uint32Array(256);
    const histG = new Uint32Array(256);
    const histB = new Uint32Array(256);

    for (let i = 0; i < data.length; i += 4) {
      histR[data[i]]++;
      histG[data[i + 1]]++;
      histB[data[i + 2]]++;
    }

    // Find 1st and 99th percentiles
    const lowerBound = numPixels * 0.01;
    const upperBound = numPixels * 0.99;

    function getPercentiles(hist) {
      let min = 0, max = 255;
      let count = 0;
      for (let i = 0; i < 256; i++) {
        count += hist[i];
        if (count > lowerBound) { min = i; break; }
      }
      count = 0;
      for (let i = 255; i >= 0; i--) {
        count += hist[i];
        if (count > numPixels - upperBound) { max = i; break; }
      }
      return { min, max: Math.max(min + 1, max) };
    }

    const limitsR = getPercentiles(histR);
    const limitsG = getPercentiles(histG);
    const limitsB = getPercentiles(histB);

    // Apply Stretching & Saturation Boost
    const saturationBoost = 1.25; // Boost saturation by 25%
    const tempBuffer = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
      // Stretch to full 0-255 range
      let r = (data[i] - limitsR.min) * 255 / (limitsR.max - limitsR.min);
      let g = (data[i + 1] - limitsG.min) * 255 / (limitsG.max - limitsG.min);
      let b = (data[i + 2] - limitsB.min) * 255 / (limitsB.max - limitsB.min);

      // Clamp
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      // Saturation
      const avg = (r + g + b) / 3;
      r = avg + (r - avg) * saturationBoost;
      g = avg + (g - avg) * saturationBoost;
      b = avg + (b - avg) * saturationBoost;

      tempBuffer[i] = r;
      tempBuffer[i + 1] = g;
      tempBuffer[i + 2] = b;
      tempBuffer[i + 3] = data[i + 3];
    }

    // --- 2. Denoising (3x3 Median Filter for Backscatter) ---
    const medianBuffer = new Uint8ClampedArray(data.length);
    const getIdx = (x, y) => (y * width + x) * 4;

    const rVals = new Int32Array(9);
    const gVals = new Int32Array(9);
    const bVals = new Int32Array(9);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = getIdx(x, y);
        
        let idx = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const pIdx = getIdx(x + dx, y + dy);
            rVals[idx] = tempBuffer[pIdx];
            gVals[idx] = tempBuffer[pIdx+1];
            bVals[idx] = tempBuffer[pIdx+2];
            idx++;
          }
        }
        
        rVals.sort();
        gVals.sort();
        bVals.sort();
        
        medianBuffer[i] = rVals[4];
        medianBuffer[i+1] = gVals[4];
        medianBuffer[i+2] = bVals[4];
        medianBuffer[i+3] = tempBuffer[i+3];
      }
    }

    // Copy edges for median buffer
    for (let x = 0; x < width; x++) {
      const topIdx = getIdx(x, 0);
      const bottomIdx = getIdx(x, height - 1);
      for(let j=0; j<4; j++) {
        medianBuffer[topIdx+j] = tempBuffer[topIdx+j];
        medianBuffer[bottomIdx+j] = tempBuffer[bottomIdx+j];
      }
    }
    for (let y = 0; y < height; y++) {
      const leftIdx = getIdx(0, y);
      const rightIdx = getIdx(width - 1, y);
      for(let j=0; j<4; j++) {
        medianBuffer[leftIdx+j] = tempBuffer[leftIdx+j];
        medianBuffer[rightIdx+j] = tempBuffer[rightIdx+j];
      }
    }

    // --- 3. Sharpening (Unsharp Mask via 3x3 Convolution) ---
    // Kernel:
    //  0 -1  0
    // -1  5 -1
    //  0 -1  0
    const sharpenAmount = 0.6; // Adjust sharpening intensity
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = getIdx(x, y);
        
        for (let c = 0; c < 3; c++) {
           const top = medianBuffer[getIdx(x, y-1) + c];
           const bottom = medianBuffer[getIdx(x, y+1) + c];
           const left = medianBuffer[getIdx(x-1, y) + c];
           const right = medianBuffer[getIdx(x+1, y) + c];
           const center = medianBuffer[i + c];
           
           let sharpened = center * 5 - (top + bottom + left + right);
           let finalVal = center + (sharpened - center) * sharpenAmount;
           
           data[i + c] = Math.max(0, Math.min(255, finalVal));
        }
        data[i + 3] = medianBuffer[i + 3]; // Preserve alpha
      }
    }

    // Copy edges for final data
    for (let x = 0; x < width; x++) {
      const topIdx = getIdx(x, 0);
      const bottomIdx = getIdx(x, height - 1);
      for(let j=0; j<4; j++) {
        data[topIdx+j] = medianBuffer[topIdx+j];
        data[bottomIdx+j] = medianBuffer[bottomIdx+j];
      }
    }
    for (let y = 0; y < height; y++) {
      const leftIdx = getIdx(0, y);
      const rightIdx = getIdx(width - 1, y);
      for(let j=0; j<4; j++) {
        data[leftIdx+j] = medianBuffer[leftIdx+j];
        data[rightIdx+j] = medianBuffer[rightIdx+j];
      }
    }

    self.postMessage({ resultImageData: imageData });
  }
};

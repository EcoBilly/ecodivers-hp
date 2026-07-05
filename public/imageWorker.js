self.onmessage = function (e) {
  const { imageData, action } = e.data;

  if (action === 'process') {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // 1. Calculate Average Colors for Gray World White Balance
    let totalR = 0, totalG = 0, totalB = 0;
    const numPixels = width * height;

    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
    }

    const avgR = totalR / numPixels;
    const avgG = totalG / numPixels;
    const avgB = totalB / numPixels;

    // Target average
    const avgGray = (avgR + avgG + avgB) / 3;

    // Scale factors to balance the colors
    const maxScale = 3.5;
    const scaleR = Math.min(maxScale, avgGray / Math.max(1, avgR));
    const scaleG = Math.min(2.0, avgGray / Math.max(1, avgG));
    const scaleB = Math.min(2.0, avgGray / Math.max(1, avgB));

    const correctedData = new Uint8ClampedArray(data.length);

    // Apply Color Correction and Contrast
    const contrast = 1.2; 
    const intercept = 128 * (1 - contrast);

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] * scaleR;
      let g = data[i + 1] * scaleG;
      let b = data[i + 2] * scaleB;

      // Red Compensation
      if (r < g) {
        r = r + (g - r) * 0.3; 
      }

      // Apply Contrast
      r = r * contrast + intercept;
      g = g * contrast + intercept;
      b = b * contrast + intercept;

      correctedData[i] = Math.min(255, Math.max(0, r));
      correctedData[i + 1] = Math.min(255, Math.max(0, g));
      correctedData[i + 2] = Math.min(255, Math.max(0, b));
      correctedData[i + 3] = data[i + 3]; // Alpha
    }

    // 2. Fast Pseudo-Median Filter for Denoising (Backscatter)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        
        const idx = [
          i - width * 4,     // Top
          i + width * 4,     // Bottom
          i - 4,             // Left
          i + 4,             // Right
          i                  // Center
        ];

        const rVals = [correctedData[idx[0]], correctedData[idx[1]], correctedData[idx[2]], correctedData[idx[3]], correctedData[idx[4]]];
        const gVals = [correctedData[idx[0]+1], correctedData[idx[1]+1], correctedData[idx[2]+1], correctedData[idx[3]+1], correctedData[idx[4]+1]];
        const bVals = [correctedData[idx[0]+2], correctedData[idx[1]+2], correctedData[idx[2]+2], correctedData[idx[3]+2], correctedData[idx[4]+2]];

        rVals.sort((a, b) => a - b);
        gVals.sort((a, b) => a - b);
        bVals.sort((a, b) => a - b);

        data[i] = rVals[2];
        data[i + 1] = gVals[2];
        data[i + 2] = bVals[2];
        data[i + 3] = correctedData[i + 3];
      }
    }

    // Handle borders (copy corrected data directly)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
           const i = (y * width + x) * 4;
           data[i] = correctedData[i];
           data[i+1] = correctedData[i+1];
           data[i+2] = correctedData[i+2];
           data[i+3] = correctedData[i+3];
        }
      }
    }

    self.postMessage({ resultImageData: imageData });
  }
};

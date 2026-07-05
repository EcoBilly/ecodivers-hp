'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Loader2, RefreshCcw, SlidersHorizontal, Image as ImageIcon, Check } from 'lucide-react';
import { processImageWithWorker, downloadImageWithWatermark } from '@/lib/imageUtils';
import CompareSlider from '@/components/CompareSlider';

export default function UnderwaterEnhancer() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('ecodivers-enhanced.jpg');
  
  // New features state
  const [strength, setStrength] = useState(100);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isWatermarkEnabled, setIsWatermarkEnabled] = useState(true);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create a filename based on the original
    const nameParts = file.name.split('.');
    nameParts.pop(); // remove extension
    setFilename(`${nameParts.join('.')}-enhanced.jpg`);

    setError(null);
    setIsProcessing(true);

    try {
      const { originalUrl, processedUrl } = await processImageWithWorker(file);
      setOriginalImage(originalUrl);
      setProcessedImage(processedUrl);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Please try another one.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleDownload = () => {
    if (processedImage && originalImage) {
      downloadImageWithWatermark(originalImage, processedImage, filename, strength, isWatermarkEnabled);
    }
  };

  const reset = () => {
    if (originalImage) URL.revokeObjectURL(originalImage);
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    setStrength(100);
    setShowOriginal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-4xl w-full text-center mb-10 space-y-4">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm font-medium mb-4 backdrop-blur-sm">
          ✨ Powered by Client-Side AI
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          Underwater Photo Enhancer
        </h1>
        <p className="text-lg text-blue-100/80 max-w-2xl mx-auto">
          Instantly restore natural colors and reduce backscatter from your underwater photos. 
          100% private - everything runs locally in your browser.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl w-full">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center backdrop-blur-md">
            {error}
          </div>
        )}

        {!originalImage && !isProcessing && (
          <div 
            {...getRootProps()} 
            className={`
              w-full p-12 border-2 border-dashed rounded-3xl backdrop-blur-md transition-all duration-300 cursor-pointer
              flex flex-col items-center justify-center text-center group
              ${isDragActive 
                ? 'border-blue-400 bg-blue-500/20 scale-[1.02]' 
                : 'border-blue-300/30 bg-white/5 hover:bg-white/10 hover:border-blue-300/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Drag & Drop your photo here</h3>
            <p className="text-blue-200/60 mb-6">or click to browse from your device</p>
            <p className="text-sm text-blue-200/40">Supports JPG, PNG (Max dimensions: 2048px)</p>
          </div>
        )}

        {isProcessing && (
          <div className="w-full p-16 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-6" />
            <h3 className="text-xl font-medium animate-pulse text-blue-100">Analyzing depths...</h3>
            <p className="text-blue-300/60 mt-2">Restoring colors and reducing backscatter</p>
          </div>
        )}

        {originalImage && processedImage && !isProcessing && (
          <div className="w-full rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <CompareSlider 
                originalImage={originalImage} 
                processedImage={processedImage} 
                strength={strength}
                showOriginal={showOriginal}
              />
              
              {/* View Original Button */}
              <button
                className="absolute bottom-4 right-4 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl text-white transition-all active:scale-95 shadow-lg border border-white/20 z-30"
                onPointerDown={() => setShowOriginal(true)}
                onPointerUp={() => setShowOriginal(false)}
                onPointerLeave={() => setShowOriginal(false)}
                title="Hold to view original"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  <span className="sr-only">View Original</span>
                </div>
              </button>
            </div>
            
            {/* Controls Section */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6">
              
              {/* Color Correction Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-medium text-blue-100">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                    Color Correction
                  </div>
                  <span className="text-blue-300 font-mono">{strength}%</span>
                </div>
                <div className="relative flex items-center h-6">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={strength}
                    onChange={(e) => setStrength(Number(e.target.value))}
                    className="w-full h-1.5 bg-blue-900/50 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full"
                  />
                  {/* Slider Progress Fill */}
                  <div 
                    className="absolute left-0 h-1.5 bg-blue-500 rounded-full pointer-events-none"
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>

              {/* Toggles and Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                
                {/* Watermark Toggle */}
                <button
                  onClick={() => setIsWatermarkEnabled(!isWatermarkEnabled)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    isWatermarkEnabled 
                      ? 'bg-blue-500/20 border-blue-400/50 text-blue-200' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    isWatermarkEnabled ? 'bg-blue-500 border-blue-400' : 'border-white/30'
                  }`}>
                    {isWatermarkEnabled && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="font-medium text-sm">Add Watermark</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={reset}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Try Another</span>
                  </button>
                  
                  <button 
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-blue-200/40">
              {isWatermarkEnabled ? "A subtle ECODIVERS JEJU watermark will be added to the downloaded image." : "Image will be downloaded without a watermark."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

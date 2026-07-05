'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Download, Loader2, RefreshCcw } from 'lucide-react';
import { processImageWithWorker, downloadImageWithWatermark } from '@/lib/imageUtils';
import CompareSlider from '@/components/CompareSlider';

export default function UnderwaterEnhancer() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('ecodivers-enhanced.jpg');

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
    if (processedImage) {
      downloadImageWithWatermark(processedImage, filename);
    }
  };

  const reset = () => {
    if (originalImage) URL.revokeObjectURL(originalImage);
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
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
            <CompareSlider originalImage={originalImage} processedImage={processedImage} />
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
              <button 
                onClick={reset}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Another Photo
              </button>
              
              <button 
                onClick={handleDownload}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                Download Enhanced Image
              </button>
            </div>
            <p className="text-center text-xs text-blue-200/40">
              A subtle ECODIVERS JEJU watermark will be added to the downloaded image.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

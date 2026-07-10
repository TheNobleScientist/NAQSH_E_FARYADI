import React, { useEffect, useRef, useState } from "react";
import { 
  Upload, 
  Download, 
  RefreshCw, 
  Sliders, 
  Eye, 
  FileImage, 
  Grid, 
  Settings, 
  Image as ImageIcon 
} from "lucide-react";
import { motion } from "motion/react";

interface DotMatrixRasterizerProps {
  isUrdu: boolean;
}

export const DotMatrixRasterizer: React.FC<DotMatrixRasterizerProps> = ({ isUrdu }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Controls
  const [dotSize, setDotSize] = useState<number>(10); // spacing / grid resolution
  const [contrast, setContrast] = useState<number>(1.2); // contrast multiplier
  const [brightness, setBrightness] = useState<number>(1.0); // brightness modifier
  const [colorMode, setColorMode] = useState<"tri-color" | "monochromatic" | "cyan-glow" | "amber-screen" | "original">("tri-color");
  const [selectedTemplate, setSelectedTemplate] = useState<"bird" | "blueprint" | "karachi">("bird");
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Drawing the default procedural Ghalib bird template on a hidden canvas for dither sampling
  const drawProceduralTemplate = (ctx: CanvasRenderingContext2D, width: number, height: number, type: "bird" | "blueprint" | "karachi") => {
    ctx.clearRect(0, 0, width, height);

    if (type === "bird") {
      // Background gradient (faint blue vignette)
      const grad = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, width/2);
      grad.addColorStop(0, "rgba(94, 231, 255, 0.45)");
      grad.addColorStop(1, "rgba(10, 16, 153, 0.0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw stylized bird shape modeled precisely after the uploaded Red Cardinal/Bullfinch
      ctx.save();
      ctx.translate(width / 2 - 20, height / 2);

      // Tail feather dither guide (Dark Slate/Black)
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(-120, 80);
      ctx.lineTo(-40, 40);
      ctx.lineTo(-80, 110);
      ctx.closePath();
      ctx.fill();

      // Bird body (Rich Red / Coral - #ff4b4b / #ef4444)
      ctx.fillStyle = "#ff4b4b";
      ctx.beginPath();
      ctx.arc(0, 0, 95, 0, Math.PI * 2); // Body core
      ctx.fill();

      // Bird Head / Crown (Slanted up red)
      ctx.beginPath();
      ctx.moveTo(30, -80);
      ctx.lineTo(100, -140);
      ctx.lineTo(80, -40);
      ctx.closePath();
      ctx.fill();

      // Bird chest & throat (Bright Scarlet Red)
      ctx.fillStyle = "#ff3b30";
      ctx.beginPath();
      ctx.ellipse(50, -30, 70, 90, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Wing shape (High-contrast Black and dark blue dither target)
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(-50, 10, 50, 80, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Blue wing highlights
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.ellipse(-45, -5, 25, 55, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Mask / Black Face patch (Eye area)
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.arc(65, -85, 25, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlight (White)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(60, -90, 5, 0, Math.PI * 2);
      ctx.fill();

      // Beak (Strong sharp Gold/Orange - facing right)
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.moveTo(85, -95);
      ctx.lineTo(140, -80);
      ctx.lineTo(85, -65);
      ctx.closePath();
      ctx.fill();

      // Abstract branch/perch below (Charcoal)
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-160, 120);
      ctx.lineTo(160, 150);
      ctx.stroke();

      ctx.restore();
    } else if (type === "blueprint") {
      // Architectural parametric blueprints style
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#5EE7FF";
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 50, width - 100, height - 100);

      // Room subdivisions
      ctx.lineWidth = 2;
      // Sahan / Courtyard center circle
      ctx.beginPath();
      ctx.arc(width/2, height/2, 90, 0, Math.PI * 2);
      ctx.stroke();

      // Grid axis lines
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(width/2, 20); ctx.lineTo(width/2, height - 20);
      ctx.moveTo(20, height/2); ctx.lineTo(width - 20, height/2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Room labels written in bold vectors
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px serif";
      ctx.fillText("S A H A N", width/2 - 75, height/2 + 10);
      ctx.fillText("BAITHAK", 80, 120);
      ctx.fillText("DEHLEEZ", width - 230, height - 100);

      // Dimension arcs
      ctx.strokeStyle = "#C2A679";
      ctx.beginPath();
      ctx.arc(100, 100, 40, 0, Math.PI / 2);
      ctx.stroke();
    } else {
      // Karachi Metropolitan computational outline (Faint harbor skyline)
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      // Sun / Moon disk
      ctx.fillStyle = "#ff4b4b";
      ctx.beginPath();
      ctx.arc(width - 120, 140, 60, 0, Math.PI * 2);
      ctx.fill();

      // Abstract high rise block silhouettes
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(40, 220, 90, 280);
      ctx.fillRect(150, 180, 110, 320);
      ctx.fillRect(280, 260, 80, 240);
      ctx.fillRect(380, 160, 130, 340);

      // Windows dither dots
      ctx.fillStyle = "#eab308";
      ctx.fillRect(170, 220, 15, 20);
      ctx.fillRect(210, 220, 15, 20);
      ctx.fillRect(170, 270, 15, 20);
      ctx.fillRect(210, 270, 15, 20);
      ctx.fillRect(410, 190, 15, 30);
      ctx.fillRect(460, 190, 15, 30);
    }
  };

  // Perform Halftone Dot Matrix Rasterization
  const processRasterization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsProcessing(true);

    // Setup working buffers
    const width = 600;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offCtx = offscreenCanvas.getContext("2d");
    if (!offCtx) {
      setIsProcessing(false);
      return;
    }

    // Determine Source
    if (uploadedImageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Draw image scaled to fit working size with letterboxing/cover logic
        const scale = Math.max(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;
        offCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
        applyHalftoneFilter(offCtx, ctx, width, height);
      };
      img.onerror = (e) => {
        console.error("Failed to load uploaded image for dot matrix", e);
        // Fallback to procedural
        drawProceduralTemplate(offCtx, width, height, selectedTemplate);
        applyHalftoneFilter(offCtx, ctx, width, height);
      };
      img.src = uploadedImageSrc;
    } else {
      drawProceduralTemplate(offCtx, width, height, selectedTemplate);
      applyHalftoneFilter(offCtx, ctx, width, height);
    }
  };

  const applyHalftoneFilter = (
    srcCtx: CanvasRenderingContext2D, 
    destCtx: CanvasRenderingContext2D, 
    w: number, 
    h: number
  ) => {
    const imgData = srcCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Clear main display with deep retro-indigo background
    destCtx.fillStyle = "#04061F";
    destCtx.fillRect(0, 0, w, h);

    // Grid spacing matches user's Dot Size pitch
    const pitch = Math.max(4, dotSize);
    
    // Halftone sampling
    for (let y = pitch / 2; y < h; y += pitch) {
      for (let x = pitch / 2; x < w; x += pitch) {
        
        // Sample core pixel coordinates in the source buffer
        const pixelIdx = (Math.floor(y) * w + Math.floor(x)) * 4;
        if (pixelIdx >= data.length) continue;

        const r = data[pixelIdx];
        const g = data[pixelIdx + 1];
        const b = data[pixelIdx + 2];
        const a = data[pixelIdx + 3];

        if (a < 30) continue; // Skip empty transparent regions

        // Calculate brightness/luminance
        let brightnessVal = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Adjust with user parameters
        brightnessVal = brightnessVal * brightness;
        brightnessVal = Math.pow(brightnessVal, contrast); // Apply contrast power
        brightnessVal = Math.max(0, Math.min(1, brightnessVal));

        // Skip completely dark dots in Monochromatic/Tri-color modes
        if (brightnessVal < 0.05) continue;

        // Determine Dot Radius based on luminance
        // Larger dots represent brighter areas in glowing styles, or darker in print.
        // For screen/glowing terminal style, high brightness -> larger dot.
        const maxRadius = pitch * 0.72; // Limit overlap
        const radius = brightnessVal * maxRadius;

        destCtx.save();

        if (colorMode === "tri-color") {
          // Authentic Trichromatic halftone print offset (Red, Cyan, Yellow/Blue dots)
          // Slightly offset dot positions depending on channel density to simulate CMYK screen angles
          const redVal = (r / 255) * brightness;
          const greenVal = (g / 255) * brightness;
          const blueVal = (b / 255) * brightness;

          // Red Dot Channel
          if (redVal > 0.1) {
            destCtx.fillStyle = "rgba(255, 75, 75, 0.9)";
            destCtx.beginPath();
            destCtx.arc(x - pitch * 0.12, y - pitch * 0.12, redVal * maxRadius * 0.65, 0, Math.PI * 2);
            destCtx.fill();
          }

          // Cyan/Green Dot Channel
          if (greenVal > 0.1) {
            destCtx.fillStyle = "rgba(94, 231, 255, 0.85)";
            destCtx.beginPath();
            destCtx.arc(x + pitch * 0.12, y - pitch * 0.08, greenVal * maxRadius * 0.62, 0, Math.PI * 2);
            destCtx.fill();
          }

          // Dark Slate / Shadow base channel
          if (blueVal > 0.1) {
            destCtx.fillStyle = "rgba(10, 16, 153, 0.4)";
            destCtx.beginPath();
            destCtx.arc(x, y + pitch * 0.15, blueVal * maxRadius * 0.55, 0, Math.PI * 2);
            destCtx.fill();
          }

          // Final Composite blend dot
          destCtx.fillStyle = "rgba(255, 255, 255, 0.95)";
          destCtx.beginPath();
          destCtx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
          destCtx.fill();

        } else if (colorMode === "cyan-glow") {
          // Neon cyan matrix look
          destCtx.fillStyle = `rgba(94, 231, 255, ${0.4 + brightnessVal * 0.6})`;
          destCtx.shadowColor = "rgba(94, 231, 255, 0.5)";
          destCtx.shadowBlur = radius * 0.5;
          destCtx.beginPath();
          destCtx.arc(x, y, radius, 0, Math.PI * 2);
          destCtx.fill();

        } else if (colorMode === "amber-screen") {
          // Classic 1980s phosphor screen
          destCtx.fillStyle = `rgba(245, 158, 11, ${0.45 + brightnessVal * 0.55})`;
          destCtx.shadowColor = "rgba(245, 158, 11, 0.6)";
          destCtx.shadowBlur = radius * 0.4;
          destCtx.beginPath();
          destCtx.arc(x, y, radius, 0, Math.PI * 2);
          destCtx.fill();

        } else if (colorMode === "monochromatic") {
          // Monochromatic High Contrast Slate-Silver dots
          destCtx.fillStyle = `rgba(242, 244, 255, ${0.3 + brightnessVal * 0.7})`;
          destCtx.beginPath();
          destCtx.arc(x, y, radius, 0, Math.PI * 2);
          destCtx.fill();

        } else {
          // Original sampled pixel colors rendered as custom circular pointillist dots
          destCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
          destCtx.beginPath();
          destCtx.arc(x, y, radius, 0, Math.PI * 2);
          destCtx.fill();
        }

        destCtx.restore();
      }
    }

    setIsProcessing(false);
  };

  // Re-run whenever sliders or color modes change
  useEffect(() => {
    processRasterization();
  }, [dotSize, contrast, brightness, colorMode, selectedTemplate, uploadedImageSrc]);

  // Handle local file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedImageSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setUploadedImageSrc(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file dialog
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Download artwork
  const downloadArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `naqsh-dot-matrix-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  // Clear upload and reset to template
  const resetToTemplate = () => {
    setUploadedImageSrc(null);
    setSelectedTemplate("bird");
  };

  return (
    <div id="dot-matrix-studio" className="p-6 border-2 border-retro-cyan bg-retro-blue-deep/95 rounded relative shadow-[0_0_25px_rgba(94,231,255,0.15)] max-w-7xl mx-auto my-12">
      {/* Header OS-style info line */}
      <div className="absolute top-2 left-3 font-mono text-[8px] text-retro-cyan/60 flex items-center gap-1.5 uppercase">
        <span>DEVICE: RASTER_MATRIX_EMU_V1.1</span>
        <span className="text-retro-cyan/20">•</span>
        <span>RESOLUTION: DYNAMIC_DITHER</span>
      </div>

      <div className="h-6" />

      {/* Main Title section */}
      <div className="border-b-2 border-dashed border-retro-cyan/20 pb-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-retro-cyan tracking-wide font-medium flex items-center gap-2">
            <Grid className="text-retro-cyan animate-pulse" size={24} />
            {isUrdu ? "نقش ہاف ٹون ڈاٹ میٹرکس اسٹوڈیو" : "Naqsh Halftone Dot Matrix Studio"}
          </h2>
          <p className="text-[10px] font-mono text-slate uppercase tracking-wider mt-1">
            Inspired by the iconic Ghalib printed paper bird — Convert architectural blueprints or custom graphics into vintage dithered pointillist matrices.
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            onClick={resetToTemplate}
            className="px-3 py-1.5 border border-retro-cyan/30 hover:border-retro-cyan text-[8px] font-pixel text-retro-cyan flex items-center gap-1.5 uppercase transition-all bg-retro-blue-dark/50"
          >
            <RefreshCw size={11} />
            {isUrdu ? "ری سیٹ کریں" : "Reset Core"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: LIVE CANVAS VIEWPORT (7/12) */}
        <div className="lg:col-span-7 space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative aspect-square w-full max-w-[580px] mx-auto border-2 border-retro-cyan bg-[#020412] flex items-center justify-center overflow-hidden transition-all duration-300 ${
              isDragging ? "border-solid border-emerald-400 bg-emerald-500/5 shadow-[0_0_30px_rgba(52,211,153,0.2)]" : "border-solid shadow-md"
            }`}
          >
            {/* Authentic pixel grid pattern */}
            <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#5EE7FF_1px,transparent_1px),linear-gradient(to_bottom,#5EE7FF_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

            {/* Display Canvas */}
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-contain block image-render-pixelated z-10 transition-opacity duration-300"
              style={{ opacity: isProcessing ? 0.35 : 1 }}
            />

            {/* Drag and Drop Prompt */}
            {isDragging && (
              <div className="absolute inset-0 z-20 bg-retro-ink/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                <Upload className="text-emerald-400 animate-bounce mb-3" size={36} />
                <h4 className="font-serif text-lg text-white">Drop to Load Image</h4>
                <p className="text-[10px] font-mono text-emerald-400 uppercase mt-1">Ready to rasterize into halftone dots...</p>
              </div>
            )}

            {/* Loading Indicator */}
            {isProcessing && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-retro-ink/40">
                <div className="w-10 h-10 border-2 border-retro-cyan/10 border-t-2 border-t-retro-cyan rounded-full animate-spin mb-3" />
                <span className="text-[9px] font-mono text-retro-cyan animate-pulse uppercase tracking-wider">Rasterizing Pixels...</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-2 text-[9px] font-mono text-slate">
            <span>Viewport: 600px × 600px Matrix Buffer</span>
            <span>Est. Dots: {Math.round((600 / dotSize) * (600 / dotSize))} active matrices</span>
          </div>
        </div>

        {/* RIGHT COLUMN: PROFESSIONAL CMS CMS RASTER CONTROLS (5/12) */}
        <div className="lg:col-span-5 p-6 border border-retro-cyan/20 bg-retro-blue-dark/50 rounded space-y-6">
          
          <div className="flex items-center gap-2 border-b border-retro-cyan/20 pb-2 text-retro-cyan">
            <Sliders size={16} />
            <span className="font-serif text-sm font-medium uppercase tracking-wider">{isUrdu ? "میٹرکس پیرامیٹرز" : "Matrix Modulation Panel"}</span>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate uppercase block">{isUrdu ? "تصویری ماخذ" : "Select Input Source template"}</label>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setUploadedImageSrc(null);
                  setSelectedTemplate("bird");
                }}
                className={`py-2 px-2 border rounded text-center text-[9px] font-mono uppercase transition-all ${
                  selectedTemplate === "bird" && !uploadedImageSrc
                    ? "border-retro-cyan bg-retro-cyan/15 text-white"
                    : "border-retro-cyan/20 bg-retro-blue-deep/40 text-slate hover:border-retro-cyan/50"
                }`}
              >
                🕊️ {isUrdu ? "غالب پرندہ" : "Naqsh Bird"}
              </button>
              <button
                onClick={() => {
                  setUploadedImageSrc(null);
                  setSelectedTemplate("blueprint");
                }}
                className={`py-2 px-2 border rounded text-center text-[9px] font-mono uppercase transition-all ${
                  selectedTemplate === "blueprint" && !uploadedImageSrc
                    ? "border-retro-cyan bg-retro-cyan/15 text-white"
                    : "border-retro-cyan/20 bg-retro-blue-deep/40 text-slate hover:border-retro-cyan/50"
                }`}
              >
                📐 {isUrdu ? "بلیو پرنٹ" : "BIM Layout"}
              </button>
              <button
                onClick={() => {
                  setUploadedImageSrc(null);
                  setSelectedTemplate("karachi");
                }}
                className={`py-2 px-2 border rounded text-center text-[9px] font-mono uppercase transition-all ${
                  selectedTemplate === "karachi" && !uploadedImageSrc
                    ? "border-retro-cyan bg-retro-cyan/15 text-white"
                    : "border-retro-cyan/20 bg-retro-blue-deep/40 text-slate hover:border-retro-cyan/50"
                }`}
              >
                🌆 {isUrdu ? "کراچی" : "KHI Harbor"}
              </button>
            </div>
          </div>

          {/* Upload custom design */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-slate uppercase block">{isUrdu ? "اپنی تصویر اپ لوڈ کریں" : "Or Rasterize Custom Graphic File"}</label>
            
            <div 
              onClick={triggerFileSelect}
              className={`p-4 border border-dashed rounded-sm text-center cursor-pointer hover:border-retro-cyan/60 hover:bg-retro-cyan/5 transition-all flex flex-col items-center justify-center gap-1.5 ${
                uploadedImageSrc ? "border-retro-cyan/50 bg-retro-cyan/5" : "border-retro-cyan/20 bg-retro-blue-deep/10"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden" 
              />
              <Upload size={18} className="text-retro-cyan animate-pulse" />
              <span className="text-[9px] font-mono text-retro-white">
                {uploadedImageSrc ? "✓ Custom Graphic Loaded successfully" : "Drag & Drop or Click to Upload Image"}
              </span>
              <span className="text-[7px] text-slate font-mono uppercase">Supports PNG, JPG, WebP</span>
            </div>
          </div>

          {/* Color Matrix Modulation */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono text-slate uppercase block">{isUrdu ? "رنگ سکیم" : "Color Matrix Channels"}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setColorMode("tri-color")}
                className={`py-1.5 px-2 border rounded text-[9px] font-mono uppercase transition-all ${
                  colorMode === "tri-color" ? "border-retro-cyan bg-retro-cyan/15 text-white" : "border-retro-cyan/20 bg-retro-blue-deep/30 text-slate hover:border-retro-cyan/50"
                }`}
              >
                🔴🔵 Tri-Color Halftone
              </button>
              <button
                onClick={() => setColorMode("cyan-glow")}
                className={`py-1.5 px-2 border rounded text-[9px] font-mono uppercase transition-all ${
                  colorMode === "cyan-glow" ? "border-retro-cyan bg-retro-cyan/15 text-white" : "border-retro-cyan/20 bg-retro-blue-deep/30 text-slate hover:border-retro-cyan/50"
                }`}
              >
                🌐 Cyan Terminal
              </button>
              <button
                onClick={() => setColorMode("amber-screen")}
                className={`py-1.5 px-2 border rounded text-[9px] font-mono uppercase transition-all ${
                  colorMode === "amber-screen" ? "border-retro-cyan bg-retro-cyan/15 text-white" : "border-retro-cyan/20 bg-retro-blue-deep/30 text-slate hover:border-retro-cyan/50"
                }`}
              >
                🔥 Amber Phosphor
              </button>
              <button
                onClick={() => setColorMode("monochromatic")}
                className={`py-1.5 px-2 border rounded text-[9px] font-mono uppercase transition-all ${
                  colorMode === "monochromatic" ? "border-retro-cyan bg-retro-cyan/15 text-white" : "border-retro-cyan/20 bg-retro-blue-deep/30 text-slate hover:border-retro-cyan/50"
                }`}
              >
                ⚪ Slate Monochromatic
              </button>
              <button
                onClick={() => setColorMode("original")}
                className={`py-1.5 px-2 border rounded text-[9px] font-mono uppercase transition-all ${
                  colorMode === "original" ? "border-retro-cyan bg-retro-cyan/15 text-white" : "border-retro-cyan/20 bg-retro-blue-deep/30 text-slate hover:border-retro-cyan/50"
                }`}
              >
                🎨 Pointillist Color
              </button>
            </div>
          </div>

          <span className="block border-t border-retro-cyan/10 my-4" />

          {/* Sliders Block */}
          <div className="space-y-4">
            
            {/* Dot Size slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center font-mono text-[9px]">
                <span className="text-slate uppercase">Dot Matrix Spacing (Pitch)</span>
                <span className="text-retro-cyan">{dotSize} px</span>
              </div>
              <input 
                type="range" 
                min={4} 
                max={24} 
                step={1}
                value={dotSize}
                onChange={(e) => setDotSize(Number(e.target.value))}
                className="w-full accent-retro-cyan bg-retro-blue-dark border-none cursor-pointer"
              />
              <div className="flex justify-between text-[7px] text-slate font-mono uppercase">
                <span>Fine (Laser Mesh)</span>
                <span>Coarse (Newspaper Halftone)</span>
              </div>
            </div>

            {/* Contrast slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center font-mono text-[9px]">
                <span className="text-slate uppercase">Luminance Contrast</span>
                <span className="text-retro-cyan">{contrast.toFixed(1)}x</span>
              </div>
              <input 
                type="range" 
                min={0.5} 
                max={2.5} 
                step={0.1}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-retro-cyan bg-retro-blue-dark border-none cursor-pointer"
              />
            </div>

            {/* Brightness slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center font-mono text-[9px]">
                <span className="text-slate uppercase">Luminance Offset (Brightness)</span>
                <span className="text-retro-cyan">{brightness.toFixed(1)}x</span>
              </div>
              <input 
                type="range" 
                min={0.4} 
                max={2.0} 
                step={0.1}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-retro-cyan bg-retro-blue-dark border-none cursor-pointer"
              />
            </div>

          </div>

          <span className="block border-t border-retro-cyan/10 my-4" />

          {/* Action Trigger */}
          <button
            onClick={downloadArtwork}
            className="w-full py-3 bg-retro-cyan text-retro-ink hover:bg-retro-white transition-all font-pixel text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={14} />
            <span>{isUrdu ? "میٹرکس آرٹ ڈاؤن لوڈ کریں" : "Export Dot-Matrix Artwork"}</span>
          </button>

        </div>

      </div>

    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { 
  Grid, Layers, Cpu, BookOpen, Users, CheckCircle, 
  AlertTriangle, Compass, ZoomIn, ZoomOut, Move, Copy, 
  RotateCcw, FileText, Check, ExternalLink, Mail, Send,
  ArrowRight, ShieldCheck, HelpCircle, LayoutGrid, Info, X
} from "lucide-react";

interface Room {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface Door {
  x: number;
  y: number;
  isVertical: boolean;
  targetRoom: string;
}

interface Window {
  x: number;
  y: number;
  isVertical: boolean;
}

interface Furniture {
  type: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
}

interface Critique {
  circulation: string;
  scale: string;
  lighting: string;
  suggestions: string[];
}

interface Violation {
  rule: string;
  element: string;
  description: string;
  severity: "warning" | "error";
}

interface Compliance {
  rulesChecked: string[];
  violations: Violation[];
}

interface SpatialLayout {
  rooms: Room[];
  doors: Door[];
  windows: Window[];
  furniture: Furniture[];
  dimensionX: number;
  dimensionY: number;
  critique: Critique;
  compliance: Compliance;
  ifcCode: string;
  apiGenerated?: boolean;
  apiUnavailable?: boolean;
  apiError?: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"cad" | "critique" | "compliance" | "ifc">("cad");
  const [selectedPreset, setSelectedPreset] = useState<"studio" | "courtyard">("studio");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [layout, setLayout] = useState<SpatialLayout | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const [hoveredFurniture, setHoveredFurniture] = useState<Furniture | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [copied, setCopied] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "", sent: false });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [legalModal, setLegalModal] = useState<"disclaimer" | "terms" | "privacy" | null>(null);
  
  // Loading message rotation during AI generation
  const [loadingMsg, setLoadingMsg] = useState("Invoking Brain One (The Reasoning Model)...");
  const loadingMessages = [
    "Invoking Brain One (The Reasoning Model)...",
    "Analyzing spatial boundaries and program logic...",
    "Drafting point, line, and plane geometric boundaries...",
    "Brain Two constructing parametric IFC BIM objects...",
    "Evaluating anthropometric clearances and circulation flows...",
    "Checking regional code compliance bounds...",
    "Assembling structural specifications and final critique..."
  ];

  // Fetch initial preset layout on mount
  useEffect(() => {
    fetchPreset(selectedPreset);
  }, []);

  useEffect(() => {
    if (!isGenerating) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const fetchPreset = async (presetName: "studio" | "courtyard") => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-spatial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset: presetName })
      });
      const data = await response.json();
      setLayout(data);
      setSelectedPreset(presetName);
      setSelectedViolation(null);
      // Reset zoom & pan
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    setSelectedViolation(null);
    try {
      const response = await fetch("/api/generate-spatial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customPrompt })
      });
      const data = await response.json();
      setLayout(data);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactForm(prev => ({ ...prev, sent: true }));
    setTimeout(() => {
      setContactForm({ name: "", email: "", message: "", sent: false });
    }, 4000);
  };

  // Canvas zoom/pan handlers
  const handleZoom = (factor: number) => {
    setZoom(prev => Math.min(Math.max(prev * factor, 0.7), 3));
  };

  const handleResetCanvas = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedViolation(null);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Maps preset color keywords to hex border/fill styles
  const getColorClasses = (colorName: string) => {
    const defaultColor = {
      fill: "rgba(138, 155, 176, 0.1)",
      border: "rgba(138, 155, 176, 0.4)",
      badge: "bg-slate-500/15 text-slate-300"
    };

    switch (colorName) {
      case "emerald":
        return {
          fill: "rgba(16, 185, 129, 0.1)",
          border: "rgba(16, 185, 129, 0.5)",
          badge: "bg-emerald-500/15 text-emerald-400"
        };
      case "blue":
        return {
          fill: "rgba(59, 130, 246, 0.1)",
          border: "rgba(59, 130, 246, 0.5)",
          badge: "bg-blue-500/15 text-blue-400"
        };
      case "amber":
        return {
          fill: "rgba(245, 158, 11, 0.1)",
          border: "rgba(245, 158, 11, 0.5)",
          badge: "bg-amber-500/15 text-amber-400"
        };
      case "rose":
        return {
          fill: "rgba(244, 63, 94, 0.1)",
          border: "rgba(244, 63, 94, 0.5)",
          badge: "bg-rose-500/15 text-rose-400"
        };
      case "indigo":
        return {
          fill: "rgba(99, 102, 241, 0.1)",
          border: "rgba(99, 102, 241, 0.5)",
          badge: "bg-indigo-500/15 text-indigo-400"
        };
      case "teal":
        return {
          fill: "rgba(20, 184, 166, 0.1)",
          border: "rgba(20, 184, 166, 0.5)",
          badge: "bg-teal-500/15 text-teal-400"
        };
      case "orange":
        return {
          fill: "rgba(249, 115, 22, 0.1)",
          border: "rgba(249, 115, 22, 0.5)",
          badge: "bg-orange-500/15 text-orange-400"
        };
      default:
        return defaultColor;
    }
  };

  return (
    <div className="min-h-screen bg-navy text-cream flex flex-col font-sans selection:bg-gold/30 selection:text-white overflow-x-hidden">
      
      {/* ── BACKGROUND ISLAMIC GEOMETRY PATTERN ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.08]">
        <div 
          className="absolute inset-0 animate-drift"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23C4932A' stroke-width='0.8' stroke-opacity='0.3'%3E%3Cpath d='M60,0 L77.57,42.43 L120,60 L77.57,77.57 L60,120 L42.43,77.57 L0,60 L42.43,42.43 Z'/%3E%3Cpath d='M60,20 L88.28,60 L60,100 L31.72,60 Z'/%3E%3Crect x='31.72' y='31.72' width='56.56' height='56.56' transform='rotate%2845 60 60%29'/%3E%3Crect x='42.43' y='42.43' width='35.14' height='35.14'/%3E%3Cpath d='M0,0 L15,15 L0,30 M120,0 L105,15 L120,30 M0,120 L15,105 L0,90 M120,120 L105,105 L120,90'/%3E%3Ccircle cx='60' cy='60' r='15'/%3E%3Ccircle cx='60' cy='60' r='35'/%3E%3Ccircle cx='0' cy='0' r='15'/%3E%3Ccircle cx='120' cy='0' r='15'/%3E%3Ccircle cx='0' cy='120' r='15'/%3E%3Ccircle cx='120' cy='120' r='15'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "120px 120px"
          }}
        />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-gold/5 via-transparent to-transparent" />
      </div>

      {/* ── STICKY TOP NAVIGATION ── */}
      <header className="sticky top-0 z-50 bg-navy/90 backdrop-blur-md border-b border-gold/15 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3">
            <span className="font-serif text-2xl font-semibold tracking-wider text-gold">
              Naqsh <span className="text-cream font-light text-xl">e Faryadi</span>
            </span>
          </a>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest text-slate uppercase">
            <a href="#product" className="hover:text-gold transition-colors">Product</a>
            <a href="#how" className="hover:text-gold transition-colors">How</a>
            <a href="#playground" className="hover:text-gold transition-colors px-3 py-1.5 border border-gold/30 rounded-sm bg-gold/5 text-gold">Playground</a>
            <a href="#technology" className="hover:text-gold transition-colors">Technology</a>
            <a href="#team" className="hover:text-gold transition-colors">Team</a>
            <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
          </nav>

          <a href="#playground" className="text-xs font-semibold tracking-widest uppercase border border-gold px-4 py-2 hover:bg-gold hover:text-navy transition-all duration-300">
            Try Engine
          </a>
        </div>
      </header>

      <main className="flex-grow z-10">

        {/* ── HERO SECTION ── */}
        <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 py-16 overflow-hidden border-b border-gold/10">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            
            <div className="mb-6 flex items-center gap-2 px-3 py-1 border border-gold/20 rounded-full bg-gold/5 text-[11px] font-medium tracking-widest text-gold uppercase animate-fade-in">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              Karachi, Pakistan · Est. 2026
            </div>

            <h1 className="font-serif text-5xl md:text-8xl font-light tracking-tight leading-none text-white mb-6">
              Architecture,<br />
              <span className="italic text-gold">understood</span><br />
              by machines.
            </h1>

            <p className="font-serif italic text-lg md:text-2xl text-slate tracking-wide mb-8">
              نقش فریادی — The Engraved Plea
            </p>

            <p className="max-w-2xl text-cream2 text-base md:text-lg font-light leading-relaxed mb-12">
              We build AI systems that generate, evaluate, and iterate architectural designs — from a single line of text to a valid, fully coordinated parametric BIM model. Trained the way architects learn: point, line, plane, space, human.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#playground" className="px-8 py-4 bg-gold text-navy font-semibold text-xs tracking-widest uppercase rounded-sm hover:bg-gold-lt transition-all duration-300 shadow-lg shadow-gold/10 hover:translate-y-[-2px]">
                Enter Live Playground
              </a>
              <a href="#product" className="px-8 py-4 border border-gold/40 text-gold font-semibold text-xs tracking-widest uppercase rounded-sm hover:border-gold hover:text-gold-lt transition-all duration-300 hover:translate-y-[-2px]">
                Explore Product Architecture
              </a>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </section>


        {/* ── WHAT WE BUILD (PRODUCT SPECS) ── */}
        <section id="product" className="py-24 px-6 bg-navy2 border-b border-gold/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              
              <div className="lg:col-span-5">
                <span className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3">What We Build</span>
                <h2 className="font-serif text-4xl md:text-5xl font-light text-white leading-tight mb-6">
                  Text to <span className="italic text-gold">building</span>,<br />not just image.
                </h2>
                <p className="text-cream2 text-base font-light leading-relaxed mb-8">
                  Most AI tools generate a picture of a floor plan. We generate the floor plan itself — valid parametric BIM objects with walls that join, doors that cut, columns that load — queryable, editable, and code-compliant.
                </p>
                <div className="border-l-2 border-gold/40 pl-6 py-2 italic text-slate text-sm">
                  "Traditional draftsmanship meets advanced spatial geometry representation. Built for immediate export into IFC formats."
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                
                <div className="p-8 border border-gold/15 rounded bg-navy hover:border-gold/40 transition-all duration-300">
                  <div className="w-12 h-12 flex items-center justify-center border border-gold/30 bg-gold/5 text-gold text-lg font-serif mb-6 rounded-sm">
                    ⬡
                  </div>
                  <h3 className="font-serif text-xl text-white mb-2">Text-to-BIM Generation</h3>
                  <p className="text-sm text-slate leading-relaxed">
                    Describe a space in natural language. Receive walls, columns, floor plates, and openings as valid IFC geometry — ready to open in Revit, ArchiCAD, or any BIM platform.
                  </p>
                </div>

                <div className="p-8 border border-gold/15 rounded bg-navy hover:border-gold/40 transition-all duration-300">
                  <div className="w-12 h-12 flex items-center justify-center border border-gold/30 bg-gold/5 text-gold text-lg font-serif mb-6 rounded-sm">
                    ◎
                  </div>
                  <h3 className="font-serif text-xl text-white mb-2">Design Critique Engine</h3>
                  <p className="text-sm text-slate leading-relaxed">
                    An AI trained on architectural literature and human movement evaluates circulation, scale, and anthropometrics — and proposes specific modifications with reasoning.
                  </p>
                </div>

                <div className="p-8 border border-gold/15 rounded bg-navy hover:border-gold/40 transition-all duration-300">
                  <div className="w-12 h-12 flex items-center justify-center border border-gold/30 bg-gold/5 text-gold text-lg font-serif mb-6 rounded-sm">
                    ◈
                  </div>
                  <h3 className="font-serif text-xl text-white mb-2">Code Compliance Layer</h3>
                  <p className="text-sm text-slate leading-relaxed">
                    Upload your jurisdiction's building code. The system parses rules into structured constraints, generates vector diagrams of violations, and iterates the design to comply.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </section>


        {/* ── INTERACTIVE PLAYGROUND (CRITICAL FEATURE) ── */}
        <section id="playground" className="py-24 px-6 border-b border-gold/10 relative">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3">Live Experience</span>
              <h2 className="font-serif text-4xl md:text-6xl font-light text-white mb-4">
                Interactive <span className="italic text-gold">Spatial AI</span> Engine
              </h2>
              <p className="max-w-2xl mx-auto text-slate text-sm font-light leading-relaxed mb-4">
                Test our model's two brains in real-time. Choose a regional preset or type a custom layout prompt. Review the architectural blueprints, compliance errors, and export valid IFC code.
              </p>
              <p className="max-w-2xl mx-auto text-xs text-gold/80 italic font-mono bg-gold/5 border border-gold/15 py-2 px-4 rounded inline-block">
                Notice: This playground is a simulation and has no connection to our research and products.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* LEFT COLUMN: INTERACTIVE INPUTS / PRESETS */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                <div className="p-6 border border-gold/15 rounded bg-navy2 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-gold font-semibold tracking-wider text-xs uppercase mb-6">
                    <LayoutGrid size={16} />
                    <span>Select Architectural Preset</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <button 
                      onClick={() => fetchPreset("studio")}
                      className={`p-4 text-left border rounded transition-all duration-300 flex flex-col justify-between h-28 ${
                        selectedPreset === "studio" && !customPrompt
                          ? "border-gold bg-gold/5 text-white" 
                          : "border-gold/15 bg-navy hover:border-gold/40 text-slate"
                      }`}
                    >
                      <span className="text-xs font-serif uppercase tracking-wider text-gold">01</span>
                      <div>
                        <h4 className="font-serif font-semibold text-white text-sm">Studio Flat</h4>
                        <p className="text-[10px] text-slate font-light mt-1">Efficient single level flat</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => fetchPreset("courtyard")}
                      className={`p-4 text-left border rounded transition-all duration-300 flex flex-col justify-between h-28 ${
                        selectedPreset === "courtyard" && !customPrompt
                          ? "border-gold bg-gold/5 text-white" 
                          : "border-gold/15 bg-navy hover:border-gold/40 text-slate"
                      }`}
                    >
                      <span className="text-xs font-serif uppercase tracking-wider text-gold">02</span>
                      <div>
                        <h4 className="font-serif font-semibold text-white text-sm">Aangan House</h4>
                        <p className="text-[10px] text-slate font-light mt-1">Courtyard luxury layout</p>
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-gold/10 pt-6 flex-grow flex flex-col">
                    <div className="flex items-center justify-between text-gold font-semibold tracking-wider text-xs uppercase mb-4">
                      <span>Custom Design prompt</span>
                      {layout?.apiGenerated && (
                        <span className="text-[10px] px-2 py-0.5 bg-gold/10 border border-gold/20 text-gold rounded-full font-mono normal-case">
                          Live Gemini API Active
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleCustomGeneration} className="flex flex-col gap-3 flex-grow justify-between">
                      <div className="relative flex-grow">
                        <textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="e.g. A small 2-bedroom traditional apartment with a shared dining area, master bedroom, kid's room, and wide windows..."
                          className="w-full h-40 p-4 bg-navy border border-gold/15 rounded text-sm text-cream placeholder-slate focus:outline-none focus:border-gold/60 resize-none font-light leading-relaxed"
                        />
                        {customPrompt && (
                          <button 
                            type="button"
                            onClick={() => setCustomPrompt("")}
                            className="absolute bottom-3 right-3 text-[10px] text-slate hover:text-white underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isGenerating || !customPrompt.trim()}
                        className={`w-full py-4 rounded-sm font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
                          isGenerating 
                            ? "bg-gold/40 text-navy cursor-not-allowed" 
                            : !customPrompt.trim()
                            ? "bg-slate/10 border border-slate/20 text-slate/55 cursor-not-allowed"
                            : "bg-gold text-navy hover:bg-gold-lt hover:translate-y-[-1px] shadow-lg shadow-gold/5"
                        }`}
                      >
                        {isGenerating ? "Analyzing Space..." : "Generate Spatial Layout"}
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  </div>

                </div>

              </div>

              {/* CENTER COLUMN: INTERACTIVE SVG BLUEPRINT CANVAS */}
              <div className="lg:col-span-5 flex flex-col gap-4 relative">
                
                <div className="p-4 border border-gold/15 rounded bg-navy2 flex items-center justify-between text-xs text-slate font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>2D PARAMETRIC GENERATION V1.0</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>1 Unit = 1m</span>
                    <span>BOUNDS: 12m x 10m</span>
                  </div>
                </div>

                <div className="relative border border-gold/15 rounded bg-[#070b14] overflow-hidden aspect-square md:aspect-auto md:h-[500px] flex items-center justify-center group cursor-grab active:cursor-grabbing">
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                  {/* LOADING OVERLAY */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-navy/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-8 text-center transition-all duration-300">
                      <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                        <div className="absolute inset-0 border-2 border-gold/10 rounded-full" />
                        <div className="absolute inset-0 border-t-2 border-r-2 border-gold rounded-full animate-spin" />
                        <Compass className="text-gold animate-pulse" size={28} />
                      </div>
                      <h4 className="font-serif text-xl text-white mb-2 tracking-wide">Spatial Reasoning Engine Active</h4>
                      <p className="text-sm text-gold font-mono max-w-xs animate-pulse">{loadingMsg}</p>
                    </div>
                  )}

                  {/* SVG FLOOR PLAN DRAWING */}
                  {layout && (
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="-50 -50 1300 1100"
                      className="transition-transform duration-100 ease-out select-none"
                      style={{
                        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {/* Boundary lines */}
                      <rect x="0" y="0" width="1200" height="1000" fill="none" stroke="rgba(196,147,42,0.15)" strokeWidth="4" strokeDasharray="10 10" />

                      {/* Rooms */}
                      {layout.rooms?.map((room, i) => {
                        const style = getColorClasses(room.color);
                        const rx = room.x * 100;
                        const ry = room.y * 100;
                        const rw = room.width * 100;
                        const rh = room.height * 100;
                        
                        const isSelectedViolationRoom = selectedViolation && selectedViolation.element.toLowerCase().includes(room.name.toLowerCase());

                        return (
                          <g 
                            key={`room-${i}`} 
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredRoom(room)}
                            onMouseLeave={() => setHoveredRoom(null)}
                          >
                            <rect
                              x={rx}
                              y={ry}
                              width={rw}
                              height={rh}
                              fill={style.fill}
                              stroke={isSelectedViolationRoom ? "#f43f5e" : style.border}
                              strokeWidth={isSelectedViolationRoom ? "4" : "2"}
                              className="transition-all duration-300 hover:fill-opacity-40"
                              style={{
                                fillOpacity: hoveredRoom?.name === room.name ? 0.35 : 0.15,
                                strokeDasharray: isSelectedViolationRoom ? "5 5" : "none"
                              }}
                            />
                            
                            {/* Room labels */}
                            <text
                              x={rx + rw / 2}
                              y={ry + rh / 2 - 10}
                              textAnchor="middle"
                              fill="#ffffff"
                              className="text-sm font-semibold tracking-wider pointer-events-none drop-shadow-md"
                              fontSize="24"
                            >
                              {room.name}
                            </text>

                            <text
                              x={rx + rw / 2}
                              y={ry + rh / 2 + 20}
                              textAnchor="middle"
                              fill="rgba(196,147,42,0.85)"
                              className="text-xs font-mono pointer-events-none"
                              fontSize="18"
                            >
                              {room.width.toFixed(1)}m × {room.height.toFixed(1)}m
                            </text>

                            <text
                              x={rx + rw / 2}
                              y={ry + rh / 2 + 45}
                              textAnchor="middle"
                              fill="rgba(138, 155, 176, 0.7)"
                              className="text-[10px] font-mono pointer-events-none"
                              fontSize="14"
                            >
                              {(room.width * room.height).toFixed(1)} sqm
                            </text>
                          </g>
                        );
                      })}

                      {/* Windows */}
                      {layout.windows?.map((window, i) => {
                        const wx = window.x * 100;
                        const wy = window.y * 100;
                        return (
                          <g key={`window-${i}`}>
                            {window.isVertical ? (
                              <g>
                                <line x1={wx} y1={wy - 30} x2={wx} y2={wy + 30} stroke="rgba(253,250,245,0.9)" strokeWidth="6" />
                                <line x1={wx - 4} y1={wy - 30} x2={wx - 4} y2={wy + 30} stroke="#070b14" strokeWidth="2" />
                                <line x1={wx + 4} y1={wy - 30} x2={wx + 4} y2={wy + 30} stroke="#070b14" strokeWidth="2" />
                              </g>
                            ) : (
                              <g>
                                <line x1={wx - 30} y1={wy} x2={wx + 30} y2={wy} stroke="rgba(253,250,245,0.9)" strokeWidth="6" />
                                <line x1={wx - 30} y1={wy - 4} x2={wx + 30} y2={wy - 4} stroke="#070b14" strokeWidth="2" />
                                <line x1={wx - 30} y1={wy + 4} x2={wx + 30} y2={wy + 4} stroke="#070b14" strokeWidth="2" />
                              </g>
                            )}
                          </g>
                        );
                      })}

                      {/* Doors (With visual door swing arcs!) */}
                      {layout.doors?.map((door, i) => {
                        const dx = door.x * 100;
                        const dy = door.y * 100;
                        const isSelectedViolationDoor = selectedViolation && selectedViolation.element.toLowerCase().includes("door");

                        return (
                          <g key={`door-${i}`}>
                            {door.isVertical ? (
                              <g>
                                {/* Door open leaf */}
                                <line x1={dx} y1={dy} x2={dx - 45} y2={dy - 45} stroke={isSelectedViolationDoor ? "#f43f5e" : "#C4932A"} strokeWidth="4" />
                                {/* Door arc swing */}
                                <path d={`M ${dx} ${dy - 60} A 60 60 0 0 1 ${dx - 45} ${dy - 45}`} fill="none" stroke="rgba(196,147,42,0.4)" strokeWidth="2" strokeDasharray="3 3" />
                                {/* Wall break */}
                                <circle cx={dx} cy={dy} r="6" fill="#070b14" stroke="#C4932A" strokeWidth="2" />
                              </g>
                            ) : (
                              <g>
                                {/* Door open leaf */}
                                <line x1={dx} y1={dy} x2={dx + 45} y2={dy - 45} stroke={isSelectedViolationDoor ? "#f43f5e" : "#C4932A"} strokeWidth="4" />
                                {/* Door arc swing */}
                                <path d={`M ${dx + 60} ${dy} A 60 60 0 0 0 ${dx + 45} ${dy - 45}`} fill="none" stroke="rgba(196,147,42,0.4)" strokeWidth="2" strokeDasharray="3 3" />
                                {/* Wall break */}
                                <circle cx={dx} cy={dy} r="6" fill="#070b14" stroke="#C4932A" strokeWidth="2" />
                              </g>
                            )}
                          </g>
                        );
                      })}

                      {/* Furniture */}
                      {layout.furniture?.map((item, i) => {
                        const fx = item.x * 100;
                        const fy = item.y * 100;
                        const fw = item.sizeX * 100;
                        const fh = item.sizeY * 100;
                        return (
                          <g 
                            key={`furniture-${i}`}
                            onMouseEnter={() => setHoveredFurniture(item)}
                            onMouseLeave={() => setHoveredFurniture(null)}
                            className="cursor-pointer"
                          >
                            <rect
                              x={fx - fw / 2}
                              y={fy - fh / 2}
                              width={fw}
                              height={fh}
                              fill="rgba(196, 147, 42, 0.04)"
                              stroke="rgba(196, 147, 42, 0.45)"
                              strokeWidth="1.5"
                              rx="4"
                              className="transition-all duration-300 hover:fill-gold/15"
                            />
                            <text
                              x={fx}
                              y={fy + 4}
                              textAnchor="middle"
                              fill="rgba(253,250,245,0.7)"
                              fontSize="14"
                              className="pointer-events-none font-mono"
                            >
                              {item.type}
                            </text>
                          </g>
                        );
                      })}

                      {/* Warning focus highlighting for Selected Violations */}
                      {selectedViolation && (
                        <circle
                          cx="600"
                          cy="500"
                          r="480"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="2"
                          strokeDasharray="4 8"
                          opacity="0.2"
                          className="animate-pulse"
                        />
                      )}
                    </svg>
                  )}

                  {/* Canvas Controls Box */}
                  <div className="absolute bottom-4 left-4 p-2 bg-navy/90 backdrop-blur border border-gold/15 rounded flex items-center gap-2 z-20">
                    <button 
                      onClick={() => handleZoom(1.2)} 
                      title="Zoom In"
                      className="p-1.5 hover:bg-gold/10 hover:text-gold rounded transition-colors cursor-pointer"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      onClick={() => handleZoom(0.8)} 
                      title="Zoom Out"
                      className="p-1.5 hover:bg-gold/10 hover:text-gold rounded transition-colors cursor-pointer"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <button 
                      onClick={handleResetCanvas} 
                      title="Reset View"
                      className="p-1.5 hover:bg-gold/10 hover:text-gold rounded transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <span className="w-px h-4 bg-gold/10" />
                    <span className="text-[10px] text-slate font-mono px-1">
                      Zoom: {Math.round(zoom * 100)}%
                    </span>
                  </div>

                  {/* Tooltip Overlay */}
                  {(hoveredRoom || hoveredFurniture) && (
                    <div className="absolute top-4 right-4 p-4 bg-navy/95 backdrop-blur border border-gold/30 rounded shadow-lg z-20 max-w-xs animate-fade-in pointer-events-none">
                      {hoveredRoom ? (
                        <div>
                          <h5 className="font-serif text-white font-semibold text-sm mb-1">{hoveredRoom.name}</h5>
                          <div className="text-[11px] font-mono text-gold space-y-0.5">
                            <p>Width: {hoveredRoom.width.toFixed(2)}m</p>
                            <p>Height: {hoveredRoom.height.toFixed(2)}m</p>
                            <p className="border-t border-gold/10 mt-1.5 pt-1">Total Space: {(hoveredRoom.width * hoveredRoom.height).toFixed(2)} sqm</p>
                          </div>
                        </div>
                      ) : hoveredFurniture ? (
                        <div>
                          <h5 className="font-serif text-white font-semibold text-sm mb-1">{hoveredFurniture.type}</h5>
                          <div className="text-[11px] font-mono text-slate space-y-0.5">
                            <p>Footprint: {hoveredFurniture.sizeX.toFixed(2)}m × {hoveredFurniture.sizeY.toFixed(2)}m</p>
                            <p>Area: {(hoveredFurniture.sizeX * hoveredFurniture.sizeY).toFixed(2)} sqm</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Simulation Message Indicator */}
                  {layout?.apiUnavailable && (
                    <div className="absolute top-4 left-4 right-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded text-xs leading-relaxed z-20 flex items-start gap-2 backdrop-blur-sm">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <div>
                        <strong>Simulation Mode Active:</strong> A real Gemini API Key is missing. Insert a valid key in <strong>Settings &gt; Secrets</strong> to query model brains.
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* RIGHT COLUMN: CRITIQUE / TABS / CODE COMPLIANCE */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                
                {/* Custom Tab Bar */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-navy2 border border-gold/15 rounded text-xs">
                  <button
                    onClick={() => setActiveTab("cad")}
                    className={`py-2 text-center rounded font-medium transition-colors cursor-pointer ${
                      activeTab === "cad" ? "bg-gold text-navy font-semibold" : "text-slate hover:text-white"
                    }`}
                  >
                    Blueprint
                  </button>
                  <button
                    onClick={() => setActiveTab("critique")}
                    className={`py-2 text-center rounded font-medium transition-colors cursor-pointer ${
                      activeTab === "critique" ? "bg-gold text-navy font-semibold" : "text-slate hover:text-white"
                    }`}
                  >
                    Critique
                  </button>
                  <button
                    onClick={() => setActiveTab("compliance")}
                    className={`py-2 text-center rounded font-medium transition-colors cursor-pointer ${
                      activeTab === "compliance" ? "bg-gold text-navy font-semibold" : "text-slate hover:text-white"
                    }`}
                  >
                    Code
                  </button>
                  <button
                    onClick={() => setActiveTab("ifc")}
                    className={`py-2 text-center rounded font-medium transition-colors cursor-pointer ${
                      activeTab === "ifc" ? "bg-gold text-navy font-semibold" : "text-slate hover:text-white"
                    }`}
                  >
                    IFC
                  </button>
                </div>

                {/* Tab Contents Frame */}
                <div className="p-6 border border-gold/15 rounded bg-navy2 flex-grow flex flex-col justify-between overflow-y-auto max-h-[500px]">
                  
                  {activeTab === "cad" && (
                    <div className="space-y-6 flex flex-col justify-between h-full">
                      <div>
                        <h4 className="font-serif text-lg text-white mb-2">Architectural Blueprint</h4>
                        <p className="text-xs text-slate leading-relaxed mb-4">
                          Computed coordinate geometry output generated by Brain Two. Highly accurate structural metadata mapping.
                        </p>
                        
                        <div className="space-y-3">
                          <div className="p-3 bg-navy border border-gold/10 rounded flex justify-between items-center text-xs">
                            <span className="text-slate">Total Rooms:</span>
                            <span className="font-mono text-gold font-semibold">{layout?.rooms?.length || 0} zones</span>
                          </div>
                          <div className="p-3 bg-navy border border-gold/10 rounded flex justify-between items-center text-xs">
                            <span className="text-slate">Physical Doors:</span>
                            <span className="font-mono text-gold font-semibold">{layout?.doors?.length || 0} openings</span>
                          </div>
                          <div className="p-3 bg-navy border border-gold/10 rounded flex justify-between items-center text-xs">
                            <span className="text-slate">Active Windows:</span>
                            <span className="font-mono text-gold font-semibold">{layout?.windows?.length || 0} apertures</span>
                          </div>
                          <div className="p-3 bg-navy border border-gold/10 rounded flex justify-between items-center text-xs">
                            <span className="text-slate">Target Land Use:</span>
                            <span className="font-mono text-gold font-semibold">Residential</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gold/10">
                        <div className="flex items-start gap-2.5 text-[11px] text-slate leading-relaxed bg-navy/50 p-3.5 border border-gold/5 rounded">
                          <Info size={14} className="text-gold shrink-0 mt-0.5" />
                          <span>Hover over elements on the central canvas to inspect calculated areas and coordinate parameters in real time.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "critique" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-gold font-semibold tracking-wider text-xs uppercase">
                        <Compass size={14} />
                        <span>Principal Critique Agent</span>
                      </div>

                      {layout?.critique ? (
                        <div className="space-y-4 text-xs leading-relaxed">
                          <div>
                            <h5 className="text-white font-semibold mb-1">Circulation & Flow</h5>
                            <p className="text-slate">{layout.critique.circulation}</p>
                          </div>
                          <div>
                            <h5 className="text-white font-semibold mb-1">Anthropometric Scale</h5>
                            <p className="text-slate">{layout.critique.scale}</p>
                          </div>
                          <div>
                            <h5 className="text-white font-semibold mb-1">Lighting & Air</h5>
                            <p className="text-slate">{layout.critique.lighting}</p>
                          </div>
                          
                          <div className="border-t border-gold/10 pt-4">
                            <h5 className="text-gold font-semibold mb-2 uppercase tracking-wider text-[10px]">Actionable Steps</h5>
                            <ul className="space-y-1.5 list-disc list-inside text-slate">
                              {layout.critique.suggestions.map((s, idx) => (
                                <li key={idx} className="hover:text-cream transition-colors">{s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate">No critiques loaded.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "compliance" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-gold font-semibold tracking-wider text-xs uppercase">
                        <ShieldCheck size={14} />
                        <span>Code Compliance Layer</span>
                      </div>

                      <div className="space-y-4">
                        <h5 className="text-white font-semibold text-xs uppercase tracking-wider">Checked Constraints</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {layout?.compliance?.rulesChecked?.map((rule, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] rounded font-mono">
                              ✓ {rule}
                            </span>
                          ))}
                        </div>

                        <div className="border-t border-gold/10 pt-4 space-y-3">
                          <h5 className="text-white font-semibold text-xs uppercase tracking-wider">Identified Violations</h5>
                          
                          {layout?.compliance?.violations && layout.compliance.violations.length > 0 ? (
                            <div className="space-y-2">
                              {layout.compliance.violations.map((v, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => setSelectedViolation(v === selectedViolation ? null : v)}
                                  className={`p-3 border rounded text-xs transition-all duration-300 cursor-pointer ${
                                    selectedViolation === v 
                                      ? "border-rose-500 bg-rose-500/10" 
                                      : "border-gold/10 bg-navy hover:border-gold/30"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-white">{v.rule}</span>
                                    <span className={`px-1.5 py-0.5 text-[8px] font-semibold uppercase rounded ${
                                      v.severity === "error" ? "bg-rose-500/25 text-rose-400" : "bg-amber-500/25 text-amber-400"
                                    }`}>
                                      {v.severity}
                                    </span>
                                  </div>
                                  <p className="text-slate text-[11px] leading-relaxed mb-1.5">{v.description}</p>
                                  <div className="flex items-center gap-1 text-[9px] text-gold font-mono">
                                    <AlertTriangle size={10} />
                                    <span>Element: {v.element} (Click to locate)</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded text-center text-xs">
                              <p className="text-emerald-400 font-semibold mb-1">✓ 100% Code Compliant</p>
                              <p className="text-slate text-[10px]">No design violations detected within specified standard parameters.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "ifc" && (
                    <div className="space-y-4 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gold font-semibold tracking-wider text-xs uppercase">
                          <FileText size={14} />
                          <span>Parametric IFC Code Block</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(layout?.ifcCode || "")}
                          className="flex items-center gap-1 text-[10px] text-gold border border-gold/20 px-2 py-1 bg-gold/5 rounded hover:bg-gold hover:text-navy transition-all duration-300 cursor-pointer"
                        >
                          {copied ? <Check size={10} /> : <Copy size={10} />}
                          <span>{copied ? "Copied" : "Copy IFC"}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate leading-relaxed">
                        Industry Foundation Classes (IFC) data is the global standard for open BIM sharing. Feed this coordinates stream directly to Revit or Rhino.
                      </p>

                      <div className="bg-navy p-3 border border-gold/10 rounded text-[9px] font-mono text-slate leading-normal overflow-x-auto h-48 select-text">
                        <pre>{layout?.ifcCode || "// No code available"}</pre>
                      </div>

                      <p className="text-[10px] text-slate/70 italic text-center">
                        Coordinates matched sequentially against first-principles geometry.
                      </p>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        </section>


        {/* ── HOW IT WORKS SECTION ── */}
        <section id="how" className="py-24 px-6 bg-navy border-b border-gold/10">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3">Core Methodology</span>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-white mb-4">
                Trained like an <span className="italic text-gold">architect</span> learns.
              </h2>
              <p className="max-w-xl mx-auto text-slate text-sm font-light">
                Our model doesn't shortcut straight to a raw bitmap. It builds spatial intelligence sequentially using traditional physical constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="p-8 border-t border-gold/25 relative">
                <div className="font-serif text-5xl font-light text-gold/15 mb-4 leading-none">01</div>
                <h3 className="font-serif text-xl text-gold mb-3">Point · Line · Plane</h3>
                <p className="text-sm text-slate leading-relaxed">
                  The model begins from first principles — geometric primitives — then learns to manipulate them into enclosed, inhabitable space. No shortcuts to the final output.
                </p>
              </div>

              <div className="p-8 border-t border-gold/25 relative">
                <div className="font-serif text-5xl font-light text-gold/15 mb-4 leading-none">02</div>
                <h3 className="font-serif text-xl text-gold mb-3">Human Scale</h3>
                <p className="text-sm text-slate leading-relaxed">
                  Anthropometric data, accessibility standards, and proxemics are internalized as constraints — not as a checklist applied after generation, but as the conditions of generation itself.
                </p>
              </div>

              <div className="p-8 border-t border-gold/25 relative">
                <div className="font-serif text-5xl font-light text-gold/15 mb-4 leading-none">03</div>
                <h3 className="font-serif text-xl text-gold mb-3">Self-Critique</h3>
                <p className="text-sm text-slate leading-relaxed">
                  A second reasoning model simulates human movement through each generated design and critiques it — identifying failures in circulation, light, and spatial sequence before you see it.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ── TECHNOLOGY: TWO BRAINS ── */}
        <section id="technology" className="py-24 px-6 bg-navy2 border-b border-gold/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              
              <div className="lg:col-span-4">
                <span className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3">Technology Stack</span>
                <h2 className="font-serif text-4xl font-light text-white mb-4 leading-tight">
                  Two brains.<br /><span className="italic text-gold">One</span> thinks. One builds.
                </h2>
                <p className="text-slate text-sm font-light leading-relaxed">
                  The system separates spatial reasoning from execution. One model carries architectural judgment and literature; the other operates design drafting software. They converse seamlessly.
                </p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="p-8 border border-gold/15 rounded bg-navy relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent" />
                  <span className="inline-block text-[10px] font-mono tracking-widest text-gold border border-gold/30 px-2.5 py-1 rounded mb-4 uppercase">
                    Brain One
                  </span>
                  <h3 className="font-serif text-xl text-white mb-4">The Reasoning Model</h3>
                  <p className="text-xs text-slate leading-relaxed mb-6">
                    Trained on a corpus of architectural literature, design critiques, spatial theory, and expert feedback. It judges, proposes, and critiques — it never touches the drafting canvas directly.
                  </p>
                  <ul className="text-xs text-cream2 space-y-2 font-mono">
                    <li className="flex items-center gap-2">
                      <span className="text-gold">—</span> Program analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold">—</span> Anthropometric check
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold">—</span> Design critique engine
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold">—</span> Code rules parser
                    </li>
                  </ul>
                </div>

                <div className="p-8 border border-gold/15 rounded bg-navy relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent" />
                  <span className="inline-block text-[10px] font-mono tracking-widest text-gold border border-gold/30 px-2.5 py-1 rounded mb-4 uppercase">
                    Brain Two
                  </span>
                  <h3 className="font-serif text-xl text-white mb-4">The Execution Model</h3>
                  <p className="text-xs text-slate leading-relaxed mb-6">
                    Receives structured spatial intent from Brain One and translates it into valid geometry without hallucinating invalid physics.
                  </p>
                  <ul className="text-xs text-cream2 space-y-2 font-mono">
                    <li className="flex items-center gap-2">
                      <span className="text-gold">—</span> Text-to-IFC compiler
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold">—</span> Parametric construction
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold">—</span> API software tooling
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gold">—</span> Layout constraint model
                    </li>
                  </ul>
                </div>

              </div>

            </div>
          </div>
        </section>


        {/* ── PAKISTAN OPPORTUNITY ── */}
        <section id="opportunity" className="py-24 px-6 bg-navy border-b border-gold/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              <div className="lg:col-span-6">
                <span className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3">The Opportunity</span>
                <h2 className="font-serif text-4xl md:text-5xl font-light text-white mb-6 leading-tight">
                  Built in Pakistan,<br />for the <span className="italic text-gold">world's</span> builders.
                </h2>
                <p className="text-cream2 text-sm font-light leading-relaxed mb-6">
                  Pakistan has one of the largest concentrations of engineering and architecture graduates in South Asia. We are building the AI layer that connects that premium spatial design talent directly to the global AEC industry — proving it works from Karachi first.
                </p>
                <p className="text-slate text-sm font-light">
                  Our computational logic blends traditional Islamic geometric symmetries with highly standardized parametric models.
                </p>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                
                <div className="p-6">
                  <div className="font-serif text-5xl md:text-6xl text-gold font-light mb-2">$1.4T</div>
                  <div className="text-[10px] text-slate font-semibold tracking-widest uppercase">Global AEC Software Market by 2030</div>
                </div>

                <div className="p-6">
                  <div className="font-serif text-5xl md:text-6xl text-gold font-light mb-2">&lt;1%</div>
                  <div className="text-[10px] text-slate font-semibold tracking-widest uppercase">AEC Workflows AI-Augmented Currently</div>
                </div>

                <div className="p-6">
                  <div className="font-serif text-5xl md:text-6xl text-gold font-light mb-2">2</div>
                  <div className="text-[10px] text-slate font-semibold tracking-widest uppercase">Co-Founders. Architecture + Systems</div>
                </div>

              </div>

            </div>
          </div>
        </section>


        {/* ── FOUNDERS ── */}
        <section id="team" className="py-24 px-6 bg-navy2 border-b border-gold/10">
          <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3">Founders</span>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-white mb-4">
                The <span className="italic text-gold">people</span> behind it.
              </h2>
              <p className="max-w-xl mx-auto text-slate text-sm font-light">
                Grounded in architectural practice, systems engineering, and computational logic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              <div className="p-8 border border-gold/15 rounded bg-navy hover:border-gold/40 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-[#8B6914] flex items-center justify-center font-serif text-xl font-bold text-navy mb-6 shadow-md">
                  Z
                </div>
                <h3 className="font-serif text-xl text-white mb-1">Muhammad Zain Bashir</h3>
                <div className="text-[10px] font-mono tracking-wider text-gold uppercase mb-4">Co-Founder & CEO</div>
                <p className="text-xs text-slate leading-relaxed">
                  Architecture student and software developer. Builds spatial AI tools and BIM automation systems. Deeply grounded in Islamic geometric pattern construction and computational design.
                </p>
              </div>

              <div className="p-8 border border-gold/15 rounded bg-navy hover:border-gold/40 transition-all duration-300">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-[#8B6914] flex items-center justify-center font-serif text-xl font-bold text-navy mb-6 shadow-md">
                  B
                </div>
                <h3 className="font-serif text-xl text-white mb-1">Bashir Ahmed</h3>
                <div className="text-[10px] font-mono tracking-wider text-gold uppercase mb-4">Co-Founder</div>
                <p className="text-xs text-slate leading-relaxed">
                  Brings operational experience and business development to Pakistan's growing technology sector. Focused on bridging international builders with regional engineering talent.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ── CONTACT ── */}
        <section id="contact" className="py-24 px-6 relative overflow-hidden">
          
          {/* Large geometric decorative SVG centered at bottom */}
          <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] opacity-[0.03] pointer-events-none">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="200,20 240,140 360,140 265,215 300,340 200,265 100,340 135,215 40,140 160,140" fill="#C4932A" />
              <polygon points="200,60 228,148 320,148 248,200 273,290 200,238 127,290 152,200 80,148 172,148" fill="none" stroke="#C4932A" strokeWidth="1" />
            </svg>
          </div>

          <div className="max-w-xl mx-auto text-center relative z-10">
            <span className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3">Get in Touch</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-white mb-6">
              Build the future of architecture <span className="italic text-gold">with us.</span>
            </h2>
            <p className="text-slate text-sm font-light leading-relaxed mb-10">
              We are seeking partnerships, pilot projects with architecture firms, and conversations with investors who believe AI and the built environment belong together.
            </p>

            {contactForm.sent ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-sm animate-fade-in">
                <CheckCircle size={24} className="mx-auto mb-3" />
                <p className="font-semibold">Message Sent Successfully</p>
                <p className="text-xs text-slate mt-1">Thank you. The Naqsh e Faryadi team will reach out shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full p-4 bg-navy2 border border-gold/15 rounded text-sm focus:outline-none focus:border-gold"
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full p-4 bg-navy2 border border-gold/15 rounded text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <textarea 
                  placeholder="Tell us about your project or firm..." 
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full p-4 h-32 bg-navy2 border border-gold/15 rounded text-sm focus:outline-none focus:border-gold resize-none"
                />
                <button 
                  type="submit" 
                  className="w-full py-4 bg-gold text-navy font-semibold text-xs tracking-widest uppercase rounded-sm hover:bg-gold-lt transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/10"
                >
                  <Send size={12} />
                  <span>Start a Conversation</span>
                </button>
              </form>
            )}

            <div className="mt-8 text-xs text-slate">
              Or email directly at: <a href="mailto:hello@naqshefaryadi.com" className="text-gold underline hover:text-gold-lt transition-colors">hello@naqshefaryadi.com</a>
            </div>

          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#070b14] border-t border-gold/10 py-10 px-6 z-10 text-xs text-slate">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p>© 2026 Naqsh e Faryadi (Private) Limited · Karachi, Pakistan</p>
            <p className="text-[10px] text-slate/50 mt-1">
              Registered with SECP (Securities and Exchange Commission of Pakistan) · SECP Reg: Private Limited
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[11px] font-mono tracking-wider uppercase text-slate/75">
            <a href="#product" className="hover:text-gold transition-colors">Product</a>
            <a href="#playground" className="hover:text-gold transition-colors">Playground</a>
            <a href="#team" className="hover:text-gold transition-colors">Team</a>
            <span className="text-gold/20">|</span>
            <button 
              onClick={() => setLegalModal("disclaimer")} 
              className="hover:text-gold transition-colors cursor-pointer focus:outline-none uppercase"
            >
              Disclaimer
            </button>
            <button 
              onClick={() => setLegalModal("terms")} 
              className="hover:text-gold transition-colors cursor-pointer focus:outline-none uppercase"
            >
              Terms of Use
            </button>
            <button 
              onClick={() => setLegalModal("privacy")} 
              className="hover:text-gold transition-colors cursor-pointer focus:outline-none uppercase"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      {/* ── LEGAL MODAL ── */}
      {legalModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-navy2 border border-gold/30 rounded shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="p-6 border-b border-gold/15 flex items-center justify-between bg-navy/40">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-gold" size={20} />
                <h3 className="font-serif text-xl font-semibold text-white tracking-wide">
                  {legalModal === "disclaimer" && "Legal Notice & Disclaimers"}
                  {legalModal === "terms" && "Terms of Use"}
                  {legalModal === "privacy" && "Privacy & Data Protection Policy"}
                </h3>
              </div>
              <button 
                onClick={() => setLegalModal(null)}
                className="p-1.5 hover:bg-gold/10 hover:text-gold rounded text-slate transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto text-xs text-slate space-y-6 leading-relaxed">
              
              {legalModal === "disclaimer" && (
                <>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">Corporate Information</h4>
                    <p>
                      Naqsh e Faryadi (Private) Limited is a registered corporate entity incorporated in Karachi, Pakistan, under the regulatory authority of the Securities and Exchange Commission of Pakistan (SECP).
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">Interactive AI Simulation Notice</h4>
                    <p>
                      The spatial layout configurations, 2D floor plan rendering coordinates, critique indicators, code compliance markers, and IFC (Industry Foundation Classes) specifications generated in our Interactive Spatial AI Playground are for <strong>experimental, educational, and design visualization simulation purposes only</strong>.
                    </p>
                    <p className="mt-2">
                      This playground has no connection to our core proprietary production research pipelines or industrial architecture tools. All outputs generated herein are mathematical models and do not represent certified engineering, structural, or official architectural blueprint drafts.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">No Professional Advice</h4>
                    <p>
                      The spatial designs or analytical calculations provided by the engine must not be used as a substitute for licensed human architectural services, structural safety calculations, soil tests, or regional municipal planning assessments. Naqsh e Faryadi does not assume any liability for physical construction attempts, material loads, or structural integrity modeled after these geometric coordinates.
                    </p>
                  </div>
                  <div className="p-3 bg-gold/5 border border-gold/15 text-[11px] rounded italic">
                    By querying the spatial reasoning model, you acknowledge that all generated architectural blueprints and IFC configurations should be audited, validated, and signed off by a certified professional architect before any physical site utilization.
                  </div>
                </>
              )}

              {legalModal === "terms" && (
                <>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">1. Acceptance of Terms</h4>
                    <p>
                      By accessing or interacting with the Naqsh e Faryadi spatial simulation playground, you agree to comply with these terms of use. If you do not agree, you are advised to discontinue usage of the spatial modeling interface.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">2. Grant of Simulation License</h4>
                    <p>
                      We grant you a limited, non-transferable, revocable license to query the spatial reasoning generator and view parametric coordinates, IFC geometry mockups, and layout critiques solely for your individual testing, evaluation, and learning.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">3. Acceptable Use</h4>
                    <p>
                      You agree not to use the engine to submit offensive or harmful prompts, nor attempt to bypass structural constraints, extract underlying prompt parameters, or run automated scraping scripts on our backend APIs.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">4. Limitation of Liability</h4>
                    <p>
                      Naqsh e Faryadi (Private) Limited, its co-founders, and developers will not be held liable for any direct or indirect damages arising out of the performance, calculations, safety clearances, or structural compliance of any geometry produced in this simulation environment. All outputs are delivered "as-is" and "as available".
                    </p>
                  </div>
                </>
              )}

              {legalModal === "privacy" && (
                <>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">1. Data Minimization & Secure Processing</h4>
                    <p>
                      Naqsh e Faryadi values user privacy. We do not permanently store or compile logs of custom spatial layout prompts submitted through our playground. Prompts are processed in memory and directed via secure, encrypted TLS APIs to our reasoning servers.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">2. No Personal Identifiable Information (PII) Required</h4>
                    <p>
                      You do not need to register an account or provide personal coordinates to test the playground. If you decide to contact us via the consultation form, the name, email, and messages you submit are securely handled and will only be used to respond to your partnership inquiries.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">3. Cookies & Local Configuration Storage</h4>
                    <p>
                      We may use lightweight browser cookies or standard client-side state storage to remember your zoom factors, preset selections, and interface view preferences for optimal rendering on subsequent visits. No tracking pixels are active.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-serif text-sm font-semibold mb-2 uppercase tracking-wider text-gold">4. Direct API Integrations</h4>
                    <p>
                      Where a user integrates their private API secrets directly via their development environment, these calls are routed entirely client-to-server with high security standards, ensuring complete control remains in your hands.
                    </p>
                  </div>
                </>
              )}

            </div>

            <div className="p-6 border-t border-gold/15 bg-navy/40 flex justify-end gap-3">
              <button 
                onClick={() => setLegalModal(null)}
                className="px-5 py-2.5 bg-gold text-navy font-semibold text-xs tracking-widest uppercase rounded-sm hover:bg-gold-lt transition-colors cursor-pointer"
              >
                Close & Accept
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

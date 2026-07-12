import React, { useState, useEffect, useRef } from "react";
import { 
  Grid, Layers, Cpu, BookOpen, Users, CheckCircle, 
  AlertTriangle, Compass, ZoomIn, ZoomOut, Move, Copy, 
  RotateCcw, FileText, Check, ExternalLink, Mail, Send,
  ArrowRight, ShieldCheck, HelpCircle, LayoutGrid, Info, X,
  Menu, Globe, Award, Plus, Trash2, LogOut, Lock, Settings,
  ListTodo, CheckSquare, RefreshCw, ChevronRight, HelpCircle as HelpIcon
} from "lucide-react";

import { auth, googleProvider } from "./firebase";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  User 
} from "firebase/auth";

import { 
  seedInitialContentBlocks, 
  seedInitialCeoTasks, 
  fetchAllContentBlocks, 
  saveContentBlock, 
  deleteContentBlock, 
  fetchCeoTasks, 
  saveCeoTask, 
  deleteCeoTask, 
  ContentBlock, 
  CeoTask,
  SiteSettings,
  CustomPage,
  fetchSiteSettings,
  DEFAULT_SITE_SETTINGS
} from "./services/dbService";

import { RightNowStrip } from "./components/RightNowStrip";
import { FundingTracker } from "./components/FundingTracker";
import { ResearchSnapshot } from "./components/ResearchSnapshot";
import { BuildLogPage } from "./components/BuildLogPage";
import { ResearchLibraryPage } from "./components/ResearchLibraryPage";
import { AdminPage } from "./components/AdminPage";
import { FloatingWindows } from "./components/FloatingWindows";
import { ThreeCanvas } from "./components/ThreeCanvas";
import { DotMatrixRasterizer } from "./components/DotMatrixRasterizer";
import { motion, AnimatePresence } from "motion/react";

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
  
  // New States for website enhancements and critique resolution
  const [currentView, setCurrentView] = useState<"home" | "blog" | "build-log" | "research" | "admin">(() => {
    const path = window.location.pathname;
    if (path === "/build-log") return "build-log";
    if (path === "/research") return "research";
    if (path === "/admin") return "admin";
    if (path === "/blog") return "blog";
    return "home";
  });
  const [isUrdu, setIsUrdu] = useState(false);
  const [dotMatrixOverlay, setDotMatrixOverlay] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waitlistForm, setWaitlistForm] = useState({ name: "", email: "", role: "Student", institution: "", sent: false });

  // Custom retro desktop states
  const [settled, setSettled] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorHovered, setCursorHovered] = useState(false);
  const [windowsState, setWindowsState] = useState({
    w1: true,
    w2: true,
    w3: true,
    w4: true
  });

  const [viewMode, setViewMode] = useState<"orbit" | "grid">("orbit");
  const [coords, setCoords] = useState({ lat: "24.8608", lng: "67.0104" });

  useEffect(() => {
    const interval = setInterval(() => {
      const latJitter = (24.8608 + (Math.random() - 0.5) * 0.002).toFixed(4);
      const lngJitter = (67.0104 + (Math.random() - 0.5) * 0.002).toFixed(4);
      setCoords({ lat: latJitter, lng: lngJitter });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  // Custom Routing Helper
  const navigateTo = (view: string) => {
    setCurrentView(view);
    const path = view === "home" ? "/" : `/${view}`;
    window.history.pushState({}, "", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/build-log") setCurrentView("build-log");
      else if (path === "/research") setCurrentView("research");
      else if (path === "/admin") setCurrentView("admin");
      else if (path === "/blog") setCurrentView("blog");
      else if (path === "/") setCurrentView("home");
      else {
        const slug = path.substring(1);
        setCurrentView(slug);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Auth and DB States
  const [user, setUser] = useState<User | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [ceoTasks, setCeoTasks] = useState<CeoTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  // Admin Auth Form States
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Admin CRUD state
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [newBlockType, setNewBlockType] = useState("research");
  const [customBlockType, setCustomBlockType] = useState("");
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [newBlockBody, setNewBlockBody] = useState("");
  const [newBlockDisplayLocations, setNewBlockDisplayLocations] = useState<string[]>(["homepage"]);
  
  // Type-specific field states
  const [trackerRaised, setTrackerRaised] = useState("0");
  const [trackerGoal, setTrackerGoal] = useState("50000");
  const [trackerCurrency, setTrackerCurrency] = useState("USD");
  const [resAuthors, setResAuthors] = useState("");
  const [resYear, setResYear] = useState(new Date().getFullYear().toString());
  const [resUrl, setResUrl] = useState("");
  const [resTag, setResTag] = useState("Text-to-BIM");
  const [resStatus, setResStatus] = useState<"reading" | "implemented" | "reference only">("reading");
  const [partnerName, setPartnerName] = useState("");
  const [partnerSupport, setPartnerSupport] = useState("");
  const [partnerLogo, setPartnerLogo] = useState("microsoft");

  // CEO Tasks States
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");

  // Dynamic Site Settings CMS state
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // DB Sync functions
  const loadContentBlocks = async () => {
    setIsLoadingBlocks(true);
    await seedInitialContentBlocks();
    const blocks = await fetchAllContentBlocks();
    setContentBlocks(blocks);
    setIsLoadingBlocks(false);
  };

  const loadCeoTasks = async () => {
    setIsLoadingTasks(true);
    await seedInitialCeoTasks();
    const tasks = await fetchCeoTasks();
    setCeoTasks(tasks);
    setIsLoadingTasks(false);
  };

  const loadSiteSettings = async () => {
    try {
      const settings = await fetchSiteSettings();
      setSiteSettings(settings);
    } catch (err) {
      console.error("Error loading dynamic settings:", err);
    }
  };

  useEffect(() => {
    loadContentBlocks();
    loadSiteSettings();
  }, []);

  useEffect(() => {
    // Auth observer
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (usr && usr.email === "muhammadzainb@gmail.com") {
        loadCeoTasks();
        loadContentBlocks();
      }
    });
    return () => unsubscribe();
  }, []);
  
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

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistForm(prev => ({ ...prev, sent: true }));
    setTimeout(() => {
      setWaitlistForm({ name: "", email: "", role: "Student", institution: "", sent: false });
    }, 4000);
  };

  const renderBlog = () => {
    return (
      <article className="max-w-4xl mx-auto px-6 py-20 text-cream selection:bg-gold/30 selection:text-white animate-fade-in">
        <div className="mb-12">
          <button 
            onClick={() => { setCurrentView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="group flex items-center gap-2 text-xs font-semibold tracking-widest text-gold uppercase mb-8 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1 border border-gold/20 rounded-full w-max bg-gold/5 text-[10px] font-semibold tracking-widest text-gold uppercase mb-6">
            <BookOpen size={11} />
            <span>Research & Analysis</span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl text-white font-light tracking-tight leading-tight mb-6">
            Why Pakistani floor plans don't exist in any AI training dataset — <span className="italic text-gold">and what we're doing to solve it.</span>
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate font-mono border-y border-gold/15 py-4 my-8">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span>By Muhammad Zain Bashir</span>
            </div>
            <span className="text-gold/20">•</span>
            <span>Co-Founder, Naqsh e Faryadi</span>
            <span className="text-gold/20">•</span>
            <span>July 2026</span>
            <span className="text-gold/20">•</span>
            <span>12 Min Read</span>
          </div>
        </div>

        <div className="space-y-8 text-sm md:text-base text-cream/90 font-sans leading-relaxed tracking-wide">
          
          <p className="font-serif italic text-lg text-gold leading-relaxed border-l-2 border-gold/40 pl-6 my-8">
            "The architecture of a region is born of its climate and its culture. When we train machine learning models entirely on the suburban gridlocks of North America or the high-density blocks of Central Europe, we do not build universal intelligence. We build an algorithmic monoculture that is blind to the heritage of the Global South."
          </p>

          <p>
            Standard deep learning models for floor plan and spatial layout generation (e.g., those built on standard datasets like CubiASA, Matterport3D, Gibson, or 3D-FRONT) are fundamentally monocultural. They contain hundreds of thousands of layouts depicting North American single-family suburban tract houses or European apartments. 
          </p>
          
          <p>
            When these generic AI models are queried to generate layouts, they fail catastrophically in South Asian urban centers like Karachi, Lahore, or Islamabad. They do not understand how deep brick masonry walls, structural concrete columns, and traditional spatial configurations interact with intense sub-continental solar angles and cultural privacy guidelines.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl text-white font-normal mt-12 mb-4 text-gold border-b border-gold/15 pb-2">
            The Bioclimatic Blindspot: Sahan, Aangan, and Jaali
          </h2>
          
          <p>
            In Pakistan, architecture has historically been an act of survival against extreme subtropical heat. Traditional plans integrate microclimatic regulators:
          </p>

          <ul className="space-y-4 my-6 pl-4 border-l border-gold/20">
            <li>
              <strong className="text-white block font-serif text-base mb-1">— Central Courtyards (Aangan / Sahan)</strong>
              The Aangan acts as a thermal buffer. During hot days, low-level openings allow cool air to enter, while the open-to-sky courtyard acts as a chimney, pulling rising hot air out of the surrounding rooms via convective currents.
            </li>
            <li>
              <strong className="text-white block font-serif text-base mb-1">— Deep Verandahs & Shade Projections</strong>
              Projections protect thick loadbearing walls from direct solar thermal loading, preventing the concrete or masonry from acting as a massive thermal radiator during the sweltering night hours.
            </li>
            <li>
              <strong className="text-white block font-serif text-base mb-1">— Latticework (Jaali Screen)</strong>
              Jaali works on the Venturi effect. By forcing breeze through tiny, decorative geometric apertures, it accelerates air velocity, cooling the draft before it sweeps across interior spaces.
            </li>
          </ul>

          <p>
            A generic spatial model lacks the semantic labels, geometric primitives, and topological constraints to model these thermal buffer spaces. When asked to construct a layout, it places direct, massive unshaded glass surfaces on West-facing walls, turning a Pakistani home into a literal solar oven.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl text-white font-normal mt-12 mb-4 text-gold border-b border-gold/15 pb-2">
            The Cultural Blindspot: Baithak and Spatial Privacy
          </h2>

          <p>
            In addition to weather considerations, spatial arrangement in Pakistan reflects native social codes and structural privacy guidelines. Subcontinental homes have a distinct zoning hierarchy:
          </p>
          
          <p>
            The <strong className="text-gold font-normal">Baithak (Front Tea Room/Guest Reception)</strong> is placed near the primary egress, completely isolated from the private family quarters (the Zanana zone). This separation allows hosts to practice hospitality without compromising the security, daily routines, or privacy of the household members.
          </p>
          
          <p>
            Western datasets assume an open-concept model where the main entrance opens directly into a living room, which connects directly to bedrooms without hallways. Applying this open layout directly to Pakistan creates massive cultural discomfort, violating local customs and safety layouts.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl text-white font-normal mt-12 mb-4 text-gold border-b border-gold/15 pb-2">
            What We Are Doing at Naqsh e Faryadi
          </h2>

          <p>
            We are solving this dataset starvation directly from Karachi. We have structured a three-pronged approach to digitize and democratize Pakistani architectural intelligence:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
            <div className="p-6 border border-gold/15 bg-navy2 rounded">
              <span className="font-serif text-xl text-gold block mb-2">10,000+ Blueprints</span>
              <p className="text-xs text-slate leading-relaxed">
                Compiling and scanning structural municipal plans across Pakistan to build the first comprehensive South Asian BIM layout database.
              </p>
            </div>
            <div className="p-6 border border-gold/15 bg-navy2 rounded">
              <span className="font-serif text-xl text-gold block mb-2">Urdu Semantic Labels</span>
              <p className="text-xs text-slate leading-relaxed">
                Annotating plans with contextual terms (Baithak, Sahan, Aangan) to train neural pathways on regional spatial grammar.
              </p>
            </div>
            <div className="p-6 border border-gold/15 bg-navy2 rounded">
              <span className="font-serif text-xl text-gold block mb-2">Two-Brain Engine</span>
              <p className="text-xs text-slate leading-relaxed">
                Combining reasoning LLMs with strict regulatory guidelines (such as SBCA or LDA rules) to enforce perfect local structural compliance.
              </p>
            </div>
          </div>

          <p>
            Our interactive playground is our first demonstration. By separating spatial planning (Brain One) from technical drafting drafting (Brain Two), we can encode regional rules directly as reasoning parameters. When you ask the engine to draft a "Courtyard house," it doesn't just mimic a Western house with a void; it places a real, microclimatically calculated Aangan with traditional Baithak spatial hierarchies.
          </p>

          <div className="h-px bg-gold/15 my-12" />

          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-navy2 border border-gold/20 rounded">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-serif text-2xl text-gold">
              N
            </div>
            <div className="flex-grow text-center sm:text-left">
              <h4 className="text-white font-serif text-base mb-1">Join the Computational Architecture Movement</h4>
              <p className="text-xs text-slate leading-relaxed max-w-xl">
                We are building a community of passionate student annotators, professional architects, and regional research partners. Sign up for our waitlist below or get in touch for pilot programs.
              </p>
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4">
                <button 
                  onClick={() => { setCurrentView("home"); setTimeout(() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" }), 100); }}
                  className="text-[10px] font-semibold tracking-widest text-navy bg-gold px-4 py-2 uppercase hover:bg-gold-lt transition-colors cursor-pointer"
                >
                  Join the Waitlist
                </button>
                <button 
                  onClick={() => { setCurrentView("home"); setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}
                  className="text-[10px] font-semibold tracking-widest text-gold border border-gold/30 px-4 py-2 uppercase hover:bg-gold/10 transition-colors cursor-pointer"
                >
                  Contact Founders
                </button>
              </div>
            </div>
          </div>

        </div>
      </article>
    );
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

  // Render Dynamic Custom Page
  const renderCustomPage = (slug: string) => {
    const page = siteSettings?.pages?.find(p => p.slug === slug);
    if (!page) return null;

    const title = isUrdu ? page.titleUr : page.titleEn;
    const bodyContent = isUrdu ? page.contentUr : page.contentEn;

    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-retro-white animate-fade-in space-y-8 min-h-[60vh] relative z-10">
        
        {/* Floating background window box style */}
        <div className="p-8 border-2 border-retro-cyan bg-[#0A1099]/90 rounded relative shadow-[0_0_25px_rgba(94,231,255,0.15)]">
          {/* Header OS-style info line */}
          <div className="absolute top-2 left-3 font-mono text-[8px] text-retro-cyan/50 flex items-center gap-1.5 uppercase">
            <span>SYS_VIEW: /{page.slug}</span>
            <span className="text-retro-cyan/20">•</span>
            <span>STATUS: RESOLVED_LIVE</span>
          </div>
          
          <button 
            onClick={() => navigateTo("home")}
            className="absolute top-2 right-3 font-pixel text-[8px] text-retro-cyan hover:text-retro-white transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none"
          >
            <span>[ ESC_HOME ]</span>
          </button>

          <div className="h-4" />

          {/* Heading */}
          <div className="border-b-2 border-dashed border-retro-cyan/20 pb-4 mb-6">
            <h1 className="font-serif text-3xl md:text-4xl text-retro-cyan tracking-wide font-medium">
              {title}
            </h1>
            <p className="text-[10px] font-mono text-slate uppercase tracking-wider mt-1">
              File directory: C:\naqshefaryadi\systems\pages\{page.slug}.sys
            </p>
          </div>

          {/* Content body with custom layout formatting */}
          <div 
            className="font-space text-xs md:text-sm leading-relaxed text-retro-white/90 whitespace-pre-wrap space-y-4"
            dangerouslySetInnerHTML={{ __html: bodyContent }}
          />

          <div className="mt-12 pt-6 border-t border-retro-cyan/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate">
            <span>Core network nodes synced: Active</span>
            <button 
              onClick={() => navigateTo("home")}
              className="px-4 py-2 border border-retro-cyan/40 bg-[#0A1099] hover:bg-retro-cyan hover:text-retro-ink text-retro-cyan font-pixel text-[8px] uppercase tracking-wider transition-all"
            >
              ← Return Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-[#04061F] text-retro-white flex flex-col font-sans selection:bg-retro-cyan/30 selection:text-white overflow-x-hidden relative ${dotMatrixOverlay ? "dot-matrix-active" : ""}`}>
      
      {/* ── HIGH-FIDELITY HALFTONE OVERLAY ── */}
      {dotMatrixOverlay && <div className="dot-matrix-overlay" />}

      {/* ── THREE.JS BACKGROUND SCENE ── */}
      <ThreeCanvas viewMode={viewMode} />

      {/* ── CUSTOM MOUSE VIEWPORT CURSOR ── */}
      <div 
        id="cur" 
        className={cursorHovered ? "big" : ""} 
        style={{ 
          left: `${cursorPos.x}px`, 
          top: `${cursorPos.y}px` 
        }} 
      >
        <svg viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="7" fill="none" stroke="#5EE7FF" strokeWidth="1"/>
          <line x1="11" y1="0" x2="11" y2="5" stroke="#5EE7FF" strokeWidth="1"/>
          <line x1="11" y1="17" x2="11" y2="22" stroke="#5EE7FF" strokeWidth="1"/>
          <line x1="0" y1="11" x2="5" y2="11" stroke="#5EE7FF" strokeWidth="1"/>
          <line x1="17" y1="11" x2="22" y2="11" stroke="#5EE7FF" strokeWidth="1"/>
        </svg>
      </div>

      {/* ── HUD OVERLAY (viewfinder brackets, coordinates, crosshair) ── */}
      <div className="hud">
        <div className="hud-corner tl" />
        <div className="hud-corner tr" />
        <div className="hud-corner bl" />
        <div className="hud-corner br" />
        <div className="hud-label top">SIGNAL: NAQSH_e_FARYADI // LIVE</div>
        <div className="hud-label bottom">TARGET: TEXT-TO-BIM // PHASE 1</div>
        <div className="hud-coords">
          LAT {coords.lat}° N<br />
          LNG {coords.lng}° E<br />
          KARACHI, PK
        </div>
      </div>

      {/* ── RETRO SCANLINES OVERLAY ── */}
      <div className="scanlines" />

      {/* ── FLOATING OPERATING SYSTEM WINDOWS ── */}
      <FloatingWindows
        windowsState={windowsState}
        setWindowsState={setWindowsState}
        contentBlocks={contentBlocks}
        isUrdu={isUrdu}
        onNavigate={navigateTo}
        settled={settled}
      />

      {/* ── BACKGROUND ISLAMIC GEOMETRY PATTERN ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.09]">
        <div 
          className="absolute inset-0 animate-drift"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23C2A679' stroke-width='0.8' stroke-opacity='0.45'%3E%3Cpath d='M60,0 L77.57,42.43 L120,60 L77.57,77.57 L60,120 L42.43,77.57 L0,60 L42.43,42.43 Z'/%3E%3Cpath d='M60,20 L88.28,60 L60,100 L31.72,60 Z'/%3E%3Crect x='31.72' y='31.72' width='56.56' height='56.56' transform='rotate%2845 60 60%29'/%3E%3Crect x='42.43' y='42.43' width='35.14' height='35.14'/%3E%3Cpath d='M0,0 L15,15 L0,30 M120,0 L105,15 L120,30 M0,120 L15,105 L0,90 M120,120 L105,105 L120,90'/%3E%3Ccircle cx='60' cy='60' r='15'/%3E%3Ccircle cx='60' cy='60' r='35'/%3E%3Ccircle cx='0' cy='0' r='15'/%3E%3Ccircle cx='120' cy='0' r='15'/%3E%3Ccircle cx='0' cy='120' r='15'/%3E%3Ccircle cx='120' cy='120' r='15'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "120px 120px"
          }}
        />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-retro-cyan/5 via-transparent to-transparent" />
      </div>

      {/* ── STICKY TOP RETRO NAVIGATION ── */}
      <header className="sticky top-0 z-50 bg-[#0A1099] border-b-2 border-retro-cyan transition-all">
        {siteSettings?.showTopBanner && (
          <div className="bg-amber-400 text-retro-ink py-1 px-6 border-b border-retro-cyan font-pixel text-[7px] md:text-[8px] uppercase tracking-widest text-center flex items-center justify-center gap-2 relative z-[60] overflow-hidden">
            <span className="w-1.5 h-1.5 bg-[#ff4b4b] rounded-full animate-ping shrink-0" />
            <span className="animate-pulse">
              {isUrdu ? siteSettings?.topBannerUr : siteSettings?.topBannerEn}
            </span>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          
          {/* Left brand */}
          <a 
            href="/" 
            onClick={(e) => {
              e.preventDefault();
              navigateTo("home");
            }}
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}
            className="flex items-center gap-2.5"
          >
            <div className="w-3 h-3 rounded-full bg-retro-cyan/40 border border-retro-cyan animate-pulse flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-retro-cyan rounded-full" />
            </div>
            <span className="font-pixel text-[9px] tracking-widest text-retro-white">
              {isUrdu ? "نقشِ فریادی" : "NAQSH e FARYADI"}
            </span>
          </a>
          
          {/* Mid taskbar shortcuts (Desktop only) */}
          <nav className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => {
                if (currentView !== "home") navigateTo("home");
                setTimeout(() => document.getElementById("log")?.scrollIntoView({ behavior: "smooth" }), 100);
              }}
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="px-3 py-1 bg-retro-blue-deep border border-retro-cyan/40 text-retro-cyan hover:border-retro-cyan hover:text-retro-white transition-all text-[8px] font-pixel"
            >
              Build_Log.exe
            </button>
            <button 
              onClick={() => {
                if (currentView !== "home") navigateTo("home");
                setTimeout(() => document.getElementById("research")?.scrollIntoView({ behavior: "smooth" }), 100);
              }}
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="px-3 py-1 bg-retro-blue-deep border border-retro-cyan/40 text-retro-cyan hover:border-retro-cyan hover:text-retro-white transition-all text-[8px] font-pixel"
            >
              Research.zip
            </button>
            
            {/* Dynamic CMS Pages in Desktop Nav */}
            {siteSettings?.pages?.map((page) => (
              <button
                key={page.slug}
                onClick={() => navigateTo(page.slug)}
                onMouseEnter={() => setCursorHovered(true)}
                onMouseLeave={() => setCursorHovered(false)}
                className={`px-3 py-1 border transition-all text-[8px] font-pixel uppercase ${
                  currentView === page.slug
                    ? "bg-retro-cyan text-retro-ink border-retro-cyan font-bold"
                    : "bg-retro-blue-deep border-retro-cyan/40 text-retro-cyan hover:border-retro-cyan hover:text-retro-white"
                }`}
              >
                {page.slug}.sys
              </button>
            ))}

            <button 
              onClick={() => {
                if (currentView !== "home") navigateTo("home");
                setTimeout(() => document.getElementById("support")?.scrollIntoView({ behavior: "smooth" }), 100);
              }}
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="px-3 py-1 bg-retro-blue-deep border border-retro-cyan/40 text-retro-cyan hover:border-retro-cyan hover:text-retro-white transition-all text-[8px] font-pixel"
            >
              Support.ini
            </button>
            <button 
              onClick={() => {
                if (currentView !== "home") navigateTo("home");
                setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100);
              }}
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="px-3 py-1 bg-retro-blue-deep border border-retro-cyan/40 text-retro-cyan hover:border-retro-cyan hover:text-retro-white transition-all text-[8px] font-pixel"
            >
              Contact.sys
            </button>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUrdu(!isUrdu)}
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="px-2 py-1 border border-retro-cyan/30 bg-retro-blue-deep text-[8px] font-pixel text-retro-cyan hover:border-retro-cyan transition-colors cursor-pointer"
            >
              {isUrdu ? "English" : "اردو"}
            </button>

            <button
              onClick={() => setDotMatrixOverlay(!dotMatrixOverlay)}
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className={`px-2 py-1 border text-[8px] font-pixel transition-colors cursor-pointer ${
                dotMatrixOverlay 
                  ? "bg-retro-cyan text-retro-ink border-retro-cyan animate-pulse" 
                  : "border-retro-cyan/30 bg-retro-blue-deep text-retro-cyan hover:border-retro-cyan"
              }`}
              title="Toggle Tri-Color Halftone Screen Overlay"
            >
              {isUrdu ? "ڈاٹ میٹرکس" : "DOT_MATRIX"}
            </button>

            {/* Operating System Window Actions */}
            <div className="hidden sm:flex items-center gap-1 bg-[#060A5C]/40 border border-retro-cyan/30 p-0.5 rounded">
              <button 
                onClick={() => setWindowsState({ w1: false, w2: false, w3: false, w4: false })}
                className="w-4 h-4 bg-retro-cyan/10 hover:bg-retro-cyan/30 text-retro-cyan text-[7px] font-pixel flex items-center justify-center transition-colors"
                title="Minimize Windows"
              >
                _
              </button>
              <button 
                onClick={() => setWindowsState({ w1: true, w2: true, w3: true, w4: true })}
                className="w-4 h-4 bg-retro-cyan/10 hover:bg-retro-cyan/30 text-retro-cyan text-[7px] font-pixel flex items-center justify-center transition-colors"
                title="Restore Windows"
              >
                □
              </button>
              <button 
                onClick={() => navigateTo("home")}
                className="w-4 h-4 bg-[#ff4b4b]/20 hover:bg-[#ff4b4b]/40 text-retro-cyan text-[7px] font-pixel flex items-center justify-center transition-colors"
                title="Go Home"
              >
                X
              </button>
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-retro-cyan hover:text-retro-white transition-colors cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU OVERLAY ── */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 w-full bg-[#0A1099] border-b-2 border-retro-cyan shadow-2xl flex flex-col p-4 space-y-2 z-50 animate-fade-in font-pixel text-[9px]">
            <button 
              onClick={() => {
                if (currentView !== "home") navigateTo("home");
                setTimeout(() => document.getElementById("log")?.scrollIntoView({ behavior: "smooth" }), 100);
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 border-b border-retro-cyan/20 text-retro-cyan hover:text-retro-white"
            >
              Build_Log.exe
            </button>
            <button 
              onClick={() => {
                if (currentView !== "home") navigateTo("home");
                setTimeout(() => document.getElementById("research")?.scrollIntoView({ behavior: "smooth" }), 100);
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 border-b border-retro-cyan/20 text-retro-cyan hover:text-retro-white"
            >
              Research.zip
            </button>

            {/* Dynamic CMS Custom Subpages inside Mobile Nav */}
            {siteSettings?.pages?.map((page) => (
              <button 
                key={page.slug}
                onClick={() => {
                  navigateTo(page.slug);
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2.5 border-b border-retro-cyan/20 uppercase ${
                  currentView === page.slug ? "text-retro-white font-bold" : "text-retro-cyan hover:text-retro-white"
                }`}
              >
                {page.slug}.sys
              </button>
            ))}

            <button 
              onClick={() => {
                if (currentView !== "home") navigateTo("home");
                setTimeout(() => document.getElementById("support")?.scrollIntoView({ behavior: "smooth" }), 100);
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 border-b border-retro-cyan/20 text-retro-cyan hover:text-retro-white"
            >
              Support.ini
            </button>
            <button 
              onClick={() => {
                if (currentView !== "home") navigateTo("home");
                setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100);
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 border-b border-retro-cyan/20 text-retro-cyan hover:text-retro-white"
            >
              Contact.sys
            </button>
          </div>
        )}
      </header>

      <main className="flex-grow z-10">
        {currentView === "home" ? (
          <>
            {/* ── HERO SECTION ── */}
            <section id="hero" className="relative min-h-[92vh] flex flex-col justify-center items-center text-center px-6 pt-20 pb-28 overflow-hidden border-b-2 border-retro-cyan/20">
              {/* Retro background dot patterns */}
              <div className="dots-bg" />
              
              <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
                
                <div className="mb-6 flex items-center gap-2 px-3 py-1.5 border border-retro-cyan/30 rounded bg-retro-blue-dark/50 text-[9px] font-pixel text-retro-cyan uppercase animate-blobpulse">
                  <span className="w-1.5 h-1.5 bg-[#ff4b4b] rounded-full animate-blink" />
                  {isUrdu ? "کراچی، پاکستان · قائم شدہ ۲۰۲۶" : "Karachi, Pakistan · Est. 2026 · SYSTEM_ACTIVE"}
                </div>

                {isUrdu ? (
                  <h1 className="font-archivo text-5xl md:text-8xl text-retro-cyan leading-none tracking-tight mb-6 hover:skew-x-2 transition-transform duration-300" dir="rtl">
                    {siteSettings?.heroTitleUr || "فنِ تعمیر، مشینوں کی فہم میں۔"}
                  </h1>
                ) : (
                  <h1 className="font-archivo text-5xl md:text-8xl text-retro-cyan uppercase leading-none tracking-tight mb-6 hover:skew-x-2 transition-transform duration-300">
                    {siteSettings?.heroTitleEn ? (
                      siteSettings.heroTitleEn.split("<br />").map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < siteSettings.heroTitleEn.split("<br />").length - 1 && <br />}
                        </React.Fragment>
                      ))
                    ) : (
                      <>you type it<br />it builds</>
                    )}
                  </h1>
                )}

                <p className="max-w-2xl text-retro-white text-xs md:text-sm font-space leading-relaxed mb-8 opacity-90">
                  {isUrdu ? (
                    siteSettings?.heroSubtitleUr || "ہم ایسے مصنوعی ذہانت کے سسٹمز بناتے ہیں جو فنِ تعمیر کے ڈیزائن تخلیق اور ان کا جائزہ لیتے ہیں — ایک سادہ جملے سے لے کر ایک مکمل باضابطہ بیم ماڈل تک۔ عمارتی اصولوں کے عین مطابق۔"
                  ) : (
                    siteSettings?.heroSubtitleEn || "We build AI systems that generate, evaluate, and iterate architectural designs — from a single line of text to a valid, fully coordinated parametric BIM model. Trained the way architects learn: point, line, plane, space, human."
                  )}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <a href="#playground" className="px-6 py-3.5 bg-retro-cyan text-retro-ink font-pixel text-[9px] uppercase tracking-wider hover:bg-retro-white transition-all duration-300">
                    {isUrdu ? "لائیو پلے گراؤنڈ میں داخل ہوں" : "Enter Live Playground →"}
                  </a>
                  <a href="#product" className="px-6 py-3.5 border-2 border-retro-cyan text-retro-cyan font-pixel text-[9px] uppercase tracking-wider hover:bg-retro-cyan/10 transition-all duration-300">
                    {isUrdu ? "پروڈکٹ کا معائنہ کریں" : "Explore Product Architecture"}
                  </a>
                </div>
              </div>

              {/* Ticker Track Marquee */}
              <div className="absolute bottom-0 left-0 right-0 bg-retro-blue-dark border-t-2 border-b-2 border-retro-cyan py-2 overflow-hidden select-none">
                <div className="flex w-[200%] gap-4 animate-tick whitespace-nowrap font-pixel text-[8px] text-retro-cyan uppercase tracking-widest">
                  <div className="flex-1 text-center">
                    {siteSettings?.tickerEn || "NAQSH_E_FARYADI // TEXT_TO_BIM_SYSTEM // CORE_ENGINE_V1.2_ACTIVE // EST_2026 // KARACHI_PAKISTAN // SEED_LOGS_COMPILED //"}
                  </div>
                  <div className="flex-1 text-center">
                    {siteSettings?.tickerEn || "NAQSH_E_FARYADI // TEXT_TO_BIM_SYSTEM // CORE_ENGINE_V1.2_ACTIVE // EST_2026 // KARACHI_PAKISTAN // SEED_LOGS_COMPILED //"}
                  </div>
                </div>
              </div>
            </section>

            {/* ── AS SEEN IN / RECOGNITION STRIP ── */}
            <section className="py-8 bg-navy border-b border-gold/5">
              <div className="max-w-7xl mx-auto px-6 text-center">
                <span className="text-[9px] font-mono tracking-widest text-slate/50 uppercase block mb-4">RECOGNIZED & FEATURED IN</span>
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-40 grayscale hover:opacity-75 transition-opacity duration-300 text-xs font-serif tracking-widest text-slate">
                  <span className="font-semibold uppercase tracking-widest">AEC Magazine</span>
                  <span className="italic">NED University Tech Review</span>
                  <span className="font-light uppercase">ArchDesign Digest Pakistan</span>
                  <span className="font-mono text-[10px]">NUST Computational Lab Blog</span>
                </div>
              </div>
            </section>

            {/* ── "RIGHT NOW" LIVE TRANSPARENCY STRIP ── */}
            <RightNowStrip 
              contentBlocks={contentBlocks} 
              onNavigate={navigateTo} 
              isUrdu={isUrdu} 
            />

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

        {/* ── FUNDING & SUPPORT TRACKER ── */}
        <FundingTracker contentBlocks={contentBlocks} isUrdu={isUrdu} />


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

                <div className="relative border border-gold/15 rounded bg-[#0A111B] overflow-hidden aspect-square md:aspect-auto md:h-[500px] flex items-center justify-center group cursor-grab active:cursor-grabbing">
                  
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
                      <rect x="0" y="0" width="1200" height="1000" fill="none" stroke="rgba(188,162,112,0.15)" strokeWidth="4" strokeDasharray="10 10" />

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
                              fill="var(--color-white)"
                              className="text-sm font-semibold tracking-wider pointer-events-none drop-shadow-md"
                              fontSize="24"
                            >
                              {room.name}
                            </text>

                            <text
                              x={rx + rw / 2}
                              y={ry + rh / 2 + 20}
                              textAnchor="middle"
                              fill="rgba(188,162,112,0.85)"
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
                                <line x1={wx} y1={wy - 30} x2={wx} y2={wy + 30} stroke="rgba(233,229,219,0.9)" strokeWidth="6" />
                                <line x1={wx - 4} y1={wy - 30} x2={wx - 4} y2={wy + 30} stroke="#0A111B" strokeWidth="2" />
                                <line x1={wx + 4} y1={wy - 30} x2={wx + 4} y2={wy + 30} stroke="#0A111B" strokeWidth="2" />
                              </g>
                            ) : (
                              <g>
                                <line x1={wx - 30} y1={wy} x2={wx + 30} y2={wy} stroke="rgba(233,229,219,0.9)" strokeWidth="6" />
                                <line x1={wx - 30} y1={wy - 4} x2={wx + 30} y2={wy - 4} stroke="#0A111B" strokeWidth="2" />
                                <line x1={wx - 30} y1={wy + 4} x2={wx + 30} y2={wy + 4} stroke="#0A111B" strokeWidth="2" />
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
                                <line x1={dx} y1={dy} x2={dx - 45} y2={dy - 45} stroke={isSelectedViolationDoor ? "#f43f5e" : "#BCA270"} strokeWidth="4" />
                                {/* Door arc swing */}
                                <path d={`M ${dx} ${dy - 60} A 60 60 0 0 1 ${dx - 45} ${dy - 45}`} fill="none" stroke="rgba(188,162,112,0.4)" strokeWidth="2" strokeDasharray="3 3" />
                                {/* Wall break */}
                                <circle cx={dx} cy={dy} r="6" fill="#0A111B" stroke="#BCA270" strokeWidth="2" />
                              </g>
                            ) : (
                              <g>
                                {/* Door open leaf */}
                                <line x1={dx} y1={dy} x2={dx + 45} y2={dy - 45} stroke={isSelectedViolationDoor ? "#f43f5e" : "#BCA270"} strokeWidth="4" />
                                {/* Door arc swing */}
                                <path d={`M ${dx + 60} ${dy} A 60 60 0 0 0 ${dx + 45} ${dy - 45}`} fill="none" stroke="rgba(188,162,112,0.4)" strokeWidth="2" strokeDasharray="3 3" />
                                {/* Wall break */}
                                <circle cx={dx} cy={dy} r="6" fill="#0A111B" stroke="#BCA270" strokeWidth="2" />
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

        {/* ── DOT MATRIX HALFTONE ART STUDIO ── */}
        <DotMatrixRasterizer isUrdu={isUrdu} />

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

        {/* ── RESEARCH SNAPSHOT MODULE ── */}
        <ResearchSnapshot 
          contentBlocks={contentBlocks} 
          onNavigate={navigateTo} 
          isUrdu={isUrdu} 
        />


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
                
                <div className="p-6 relative group">
                  <div className="font-serif text-5xl md:text-6xl text-gold font-light mb-2">$1.4T<sup className="text-xs text-slate/50 font-sans ml-0.5">1</sup></div>
                  <div className="text-[10px] text-slate font-semibold tracking-widest uppercase">Global AEC Software Market by 2030</div>
                </div>

                <div className="p-6 relative group">
                  <div className="font-serif text-5xl md:text-6xl text-gold font-light mb-2">&lt;1%<sup className="text-xs text-slate/50 font-sans ml-0.5">2</sup></div>
                  <div className="text-[10px] text-slate font-semibold tracking-widest uppercase">AEC Workflows AI-Augmented Currently</div>
                </div>

                <div className="p-6">
                  <div className="font-serif text-5xl md:text-6xl text-gold font-light mb-2">2</div>
                  <div className="text-[10px] text-slate font-semibold tracking-widest uppercase">Co-Founders. Architecture + Systems</div>
                </div>

              </div>

            </div>

            {/* Footnote citations */}
            <div className="mt-12 pt-6 border-t border-gold/10 text-[10px] text-slate/50 font-mono flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-gold mr-1">[1]</span> Grand View Research, "AEC Software & BIM Market Size, Share & Analysis Report", 2024.
              </div>
              <div>
                <span className="text-gold mr-1">[2]</span> McKinsey & Company, "The digital future of construction: How AI is transforming spatial BIM and operations", 2023.
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
              {contentBlocks && contentBlocks.filter(b => b.blockType === "team_member").length > 0 ? (
                contentBlocks
                  .filter(b => b.blockType === "team_member" && b.displayLocations.includes("homepage"))
                  .sort((a, b) => a.order - b.order)
                  .map((member) => {
                    const isZain = member.title.toLowerCase().includes("zain");
                    const initials = member.title.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                    const memberRole = member.data?.role || "Team Member";
                    const hasImage = !!member.data?.imageUrl;

                    return (
                      <div key={member.id || member.title} className="p-8 border border-gold/15 rounded bg-navy hover:border-gold/40 transition-all duration-300 flex flex-col justify-between">
                        <div>
                          {/* Image frame */}
                          <div className="relative w-32 h-40 border border-gold/30 p-1 mb-6 bg-navy2 overflow-hidden group rounded-sm shadow-lg flex items-center justify-center shrink-0">
                            {hasImage ? (
                              <img
                                src={member.data.imageUrl}
                                alt={`${member.title} — ${memberRole}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            
                            <div className={`avatar-fallback w-full h-full bg-[#070b18] flex items-center justify-center relative ${hasImage ? 'hidden' : ''}`}>
                              {/* If it's Zain and no custom image, show his high-fidelity vector profile */}
                              {isZain ? (
                                <svg viewBox="0 0 100 120" className="w-full h-full text-gold/80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <radialGradient id="glow" cx="50%" cy="40%" r="50%">
                                    <stop offset="0%" stopColor="#C2A679" stopOpacity="0.25"/>
                                    <stop offset="100%" stopColor="#04061F" stopOpacity="0"/>
                                  </radialGradient>
                                  <rect width="100%" height="100%" fill="url(#glow)"/>
                                  
                                  <line x1="15" y1="0" x2="15" y2="120" stroke="rgba(194, 166, 121, 0.1)" strokeWidth="0.5"/>
                                  <line x1="50" y1="0" x2="50" y2="120" stroke="rgba(194, 166, 121, 0.15)" strokeWidth="0.5"/>
                                  <line x1="85" y1="0" x2="85" y2="120" stroke="rgba(194, 166, 121, 0.1)" strokeWidth="0.5"/>
                                  <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(194, 166, 121, 0.1)" strokeWidth="0.5"/>
                                  <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(194, 166, 121, 0.1)" strokeWidth="0.5"/>
                                  
                                  <g stroke="#C2A679" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
                                    <path d="M 32,45 C 32,32 40,22 55,22 C 65,22 72,28 72,38 C 72,40 70,45 68,48" strokeWidth="1.5" />
                                    <path d="M 35,32 C 38,26 44,24 50,24 C 58,24 64,28 66,34" />
                                    <path d="M 40,28 C 42,22 48,20 54,20 C 60,20 66,23 68,28" strokeWidth="1.5" />
                                    <path d="M 30,42 C 28,38 31,30 36,30" />
                                    <path d="M 68,36 C 74,38 76,46 73,50" />
                                    
                                    <path d="M 32,45 C 31,52 32,58 35,64 C 38,72 45,82 56,82 C 60,82 64,78 66,74" strokeWidth="1.5" />
                                    
                                    <path d="M 32,48 C 30,48 29,52 31,55 C 32,57 34,57 34,55" />
                                    
                                    <path d="M 42,48 C 45,46 49,47 51,50" strokeWidth="1.2" />
                                    <path d="M 58,47 C 62,45 66,46 68,49" strokeWidth="1.2" />
                                    <path d="M 45,51 C 46,54 48,54 49,52" />
                                    <path d="M 60,51 C 61,53 63,53 64,51" />
                                    
                                    <path d="M 51,50 L 53,62 L 50,65" strokeWidth="1.2" />
                                    
                                    <path d="M 45,69 C 48,67 52,67 55,68" strokeWidth="1.8" />
                                    <path d="M 47,72 C 50,71 53,71 55,72" />
                                    <path d="M 49,75 C 51,76 53,76 54,75" />
                                    
                                    <path d="M 36,75 C 38,82 40,88 43,96" />
                                    <path d="M 61,77 C 62,84 63,90 64,98" />
                                    
                                    <path d="M 25,100 L 40,94 L 50,98 L 60,94 L 75,100" strokeWidth="1.2" />
                                    <path d="M 50,98 L 50,118" strokeWidth="1.5" />
                                    <path d="M 45,102 L 40,118" strokeWidth="0.8" />
                                    <path d="M 55,102 L 60,118" strokeWidth="0.8" />
                                  </g>
                                  <text x="50" y="112" textAnchor="middle" fill="#C2A679" fontSize="6" fontFamily="monospace" letterSpacing="1" opacity="0.8">ZAIN BASHIR</text>
                                </svg>
                              ) : (
                                <div className="text-center font-serif text-3xl font-light text-gold uppercase bg-gold/5 border border-gold/15 w-16 h-16 rounded-full flex items-center justify-center">
                                  {initials}
                                </div>
                              )}
                            </div>
                          </div>

                          <h3 className="font-serif text-xl text-white mb-1">{member.title}</h3>
                          <div className="text-[10px] font-mono tracking-wider text-gold uppercase mb-4">{memberRole}</div>
                          <p className="text-xs text-slate leading-relaxed mb-4">
                            {member.body}
                          </p>
                        </div>
                        {member.data?.githubUrl && (
                          <div className="mt-auto pt-2">
                            <a
                              href={member.data.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-gold hover:text-white transition-colors"
                            >
                              <span>VIEW PORTFOLIO</span>
                              <span>→</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="col-span-2 text-center py-12 border border-gold/10 bg-navy">
                  <p className="text-xs text-slate font-mono">No team members loaded from database.</p>
                </div>
              )}
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

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-gold uppercase block mb-3">Get in Touch & Join waitlist</span>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-white mb-6">
                Build the future of architecture <span className="italic text-gold">with us.</span>
              </h2>
              <p className="max-w-2xl mx-auto text-slate text-sm font-light leading-relaxed">
                Whether you are a global investor looking for AEC partnerships, or a Pakistani architecture student wanting to work on the frontier of AI datasets, choose your path below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start text-left">
              
              {/* ── CARD 1: GENERAL & CORPORATE INQUIRIES ── */}
              <div className="p-8 border border-gold/15 bg-navy2/50 rounded-md shadow-xl flex flex-col h-full">
                <div className="mb-6">
                  <span className="inline-block text-[10px] font-mono tracking-widest text-gold border border-gold/30 px-2.5 py-1 rounded mb-3 uppercase">
                    Partner / Investor / Firm
                  </span>
                  <h3 className="font-serif text-xl text-white mb-2">Corporate & Pilot Projects</h3>
                  <p className="text-xs text-slate leading-relaxed">
                    We are seeking pilot projects with architecture firms and conversations with investors who believe AI and the built environment belong together.
                  </p>
                </div>

                {contactForm.sent ? (
                  <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-sm flex-grow flex flex-col justify-center items-center text-center animate-fade-in">
                    <CheckCircle size={24} className="mb-3 animate-pulse" />
                    <p className="font-semibold">Inquiry Logged</p>
                    <p className="text-xs text-slate mt-1">Thank you. The Naqsh e Faryadi team will reach out shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full p-4 bg-navy border border-gold/15 rounded text-xs text-cream focus:outline-none focus:border-gold"
                      />
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full p-4 bg-navy border border-gold/15 rounded text-xs text-cream focus:outline-none focus:border-gold"
                      />
                    </div>
                    <textarea 
                      placeholder="Tell us about your project or firm..." 
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full p-4 h-32 bg-navy border border-gold/15 rounded text-xs text-cream focus:outline-none focus:border-gold resize-none"
                    />
                    <button 
                      type="submit" 
                      className="w-full py-4 bg-gold text-navy font-semibold text-xs tracking-widest uppercase rounded-sm hover:bg-gold-lt transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/10"
                    >
                      <Send size={12} />
                      <span>Submit Inquiry</span>
                    </button>
                  </form>
                )}
                
                <div className="mt-6 text-[11px] text-slate/70 text-center">
                  Direct email: <a href="mailto:hello@naqshefaryadi.com" className="text-gold underline hover:text-gold-lt transition-colors">hello@naqshefaryadi.com</a>
                </div>
              </div>

              {/* ── CARD 2: STUDENT & ARCHITECT WAITLIST ── */}
              <div id="waitlist" className="p-8 border border-gold/15 bg-navy2/50 rounded-md shadow-xl flex flex-col h-full">
                <div className="mb-6">
                  <span className="inline-block text-[10px] font-mono tracking-widest text-gold border border-gold/30 px-2.5 py-1 rounded mb-3 uppercase">
                    Architects / Students / Beta Waitlist
                  </span>
                  <h3 className="font-serif text-xl text-white mb-2">Join as Beta & Dataset Annotator</h3>
                  <p className="text-xs text-slate leading-relaxed">
                    Are you an architecture student or professional in Pakistan? Join our dataset compilation crew, test early releases, and gain certification.
                  </p>
                </div>

                {waitlistForm.sent ? (
                  <div className="p-6 bg-gold/10 border border-gold/30 text-gold rounded text-sm flex-grow flex flex-col justify-center items-center text-center animate-fade-in">
                    <Award size={28} className="mb-3 animate-bounce" />
                    <p className="font-semibold text-white">Waitlist Registration Successful!</p>
                    <p className="text-xs text-slate mt-1.5 leading-relaxed">
                      Your position in the Naqsh e Faryadi early-access queue is confirmed. We will reach out to verify your affiliation.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        required
                        value={waitlistForm.name}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, name: e.target.value })}
                        className="w-full p-4 bg-navy border border-gold/15 rounded text-xs text-cream focus:outline-none focus:border-gold"
                      />
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        required
                        value={waitlistForm.email}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                        className="w-full p-4 bg-navy border border-gold/15 rounded text-xs text-cream focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select 
                        required
                        value={waitlistForm.role}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, role: e.target.value })}
                        className="w-full p-4 bg-navy border border-gold/15 rounded text-xs text-cream focus:outline-none focus:border-gold appearance-none"
                      >
                        <option value="Student">Architecture Student</option>
                        <option value="Architect">Professional Architect</option>
                        <option value="Engineer">Civil Engineer</option>
                        <option value="Researcher">Academic Researcher</option>
                        <option value="Other">General Tech Enthusiast</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Institution / Firm" 
                        required
                        value={waitlistForm.institution}
                        onChange={(e) => setWaitlistForm({ ...waitlistForm, institution: e.target.value })}
                        className="w-full p-4 bg-navy border border-gold/15 rounded text-xs text-cream focus:outline-none focus:border-gold"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-4 bg-gold text-navy font-semibold text-xs tracking-widest uppercase rounded-sm hover:bg-gold-lt transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/10"
                    >
                      <CheckCircle size={12} />
                      <span>Join waitlist queue</span>
                    </button>
                  </form>
                )}

                <div className="mt-6 text-[11px] text-slate/50 text-center italic">
                  *Affiliation verified prior to granting layout dataset access.
                </div>
              </div>

            </div>
          </div>
        </section>
          </>
        ) : currentView === "blog" ? (
          renderBlog()
        ) : currentView === "build-log" ? (
          <BuildLogPage 
            contentBlocks={contentBlocks} 
            onNavigate={navigateTo} 
            isUrdu={isUrdu} 
          />
        ) : currentView === "research" ? (
          <ResearchLibraryPage 
            contentBlocks={contentBlocks} 
            onNavigate={navigateTo} 
            isUrdu={isUrdu} 
          />
        ) : currentView === "admin" ? (
          <AdminPage 
            onNavigate={navigateTo} 
            isUrdu={isUrdu} 
            onRefreshGlobalData={async () => {
              await loadContentBlocks();
              await loadSiteSettings();
            }} 
          />
        ) : siteSettings?.pages?.some(p => p.slug === currentView) ? (
          renderCustomPage(currentView)
        ) : null}
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-navy border-t border-gold/15 py-10 px-6 z-10 text-xs text-slate">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p>© 2026 Naqsh e Faryadi (Private) Limited · Karachi, Pakistan</p>
            <p className="text-[10px] text-slate/50 mt-1">
              Registered with SECP (Securities and Exchange Commission of Pakistan) · SECP Reg: Private Limited
            </p>
            <div className="mt-3 flex justify-center md:justify-start gap-4 text-[10px] text-slate/70">
              <a href="https://linkedin.com/company/naqshefaryadi" target="_blank" rel="noreferrer" className="hover:text-gold flex items-center gap-1 transition-colors">
                <span>LinkedIn</span>
                <ExternalLink size={10} />
              </a>
              <span className="text-slate/30">•</span>
              <a href="https://github.com/naqshefaryadi" target="_blank" rel="noreferrer" className="hover:text-gold flex items-center gap-1 transition-colors">
                <span>GitHub</span>
                <ExternalLink size={10} />
              </a>
            </div>
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
            <span className="text-gold/20">|</span>
            <button 
              onClick={() => navigateTo("admin")} 
              className="hover:text-gold text-gold/90 hover:text-gold font-semibold transition-colors cursor-pointer focus:outline-none uppercase"
            >
              Control Panel
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

      {/* ── DESKTOP VIEW TOGGLE OVERLAY ── */}
      {settled && currentView === "home" && (
        <div className="view-toggle">
          <span className="label">VIEW:</span>
          <button 
            className={viewMode === "orbit" ? "active" : ""} 
            onClick={() => setViewMode("orbit")}
          >
            ORBIT
          </button>
          <button 
            className={viewMode === "grid" ? "active" : ""} 
            onClick={() => setViewMode("grid")}
          >
            GRID
          </button>
        </div>
      )}

    </div>
  );
}

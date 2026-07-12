import React, { useState, useEffect } from "react";
import { 
  User, signInWithPopup, signOut, onAuthStateChanged, 
  signInWithEmailAndPassword, getAuth
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { 
  ContentBlock, CeoTask, fetchAllContentBlocks, 
  saveContentBlock, deleteContentBlock, fetchCeoTasks, 
  saveCeoTask, deleteCeoTask,
  SiteSettings, CustomPage, fetchSiteSettings, saveSiteSettings
} from "../services/dbService";
import { 
  Lock, LogOut, CheckSquare, ListTodo, Plus, Trash2, 
  Save, RefreshCw, Layers, Compass, ArrowLeft, Eye, 
  AlertTriangle, ShieldCheck, ChevronRight, FileText, Settings, Radio
} from "lucide-react";

interface AdminPageProps {
  onNavigate: (view: "home" | "blog" | "build-log" | "research" | "admin") => void;
  isUrdu: boolean;
  onRefreshGlobalData: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onNavigate,
  isUrdu,
  onRefreshGlobalData,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Email/password form fallback for iframe compatibility
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // CMS Form States
  const [cmsBlockType, setCmsBlockType] = useState("milestone");
  const [customBlockType, setCustomBlockType] = useState("");
  const [cmsTitle, setCmsTitle] = useState("");
  const [cmsBody, setCmsBody] = useState("");
  const [displayHome, setDisplayHome] = useState(true);
  const [displayLog, setDisplayLog] = useState(true);
  const [displayResearch, setDisplayResearch] = useState(false);
  const [cmsOrder, setCmsOrder] = useState(1);

  // Dynamic Type-Specific Data Form Fields
  // 1. Funding Tracker data
  const [raised, setRaised] = useState("28500");
  const [goal, setGoal] = useState("50000");
  const [currency, setCurrency] = useState("USD");
  // 2. Research Paper data
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("2026");
  const [paperUrl, setPaperUrl] = useState("");
  const [paperTag, setPaperTag] = useState("Text-to-BIM");
  const [paperStatus, setPaperStatus] = useState("reading");
  // 3. Partner Thanks data
  const [partnerName, setPartnerName] = useState("");
  const [supportType, setSupportType] = useState("");
  const [partnerLogo, setPartnerLogo] = useState("");

  // 4. Team Member data
  const [teamRole, setTeamRole] = useState("");
  const [teamImageUrl, setTeamImageUrl] = useState("");
  const [teamIsFounder, setTeamIsFounder] = useState(false);
  const [teamGithubUrl, setTeamGithubUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Edit Mode state
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // Global Site Settings States
  const [heroTitleEn, setHeroTitleEn] = useState("");
  const [heroTitleUr, setHeroTitleUr] = useState("");
  const [heroSubtitleEn, setHeroSubtitleEn] = useState("");
  const [heroSubtitleUr, setHeroSubtitleUr] = useState("");
  const [tickerEn, setTickerEn] = useState("");
  const [topBannerEn, setTopBannerEn] = useState("");
  const [topBannerUr, setTopBannerUr] = useState("");
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);

  // New Custom Page Form States
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageTitleEn, setNewPageTitleEn] = useState("");
  const [newPageTitleUr, setNewPageTitleUr] = useState("");
  const [newPageContentEn, setNewPageContentEn] = useState("");
  const [newPageContentUr, setNewPageContentUr] = useState("");

  // Lists from Database
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [tasks, setTasks] = useState<CeoTask[]>([]);

  // Task Form States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
      if (currentUser && currentUser.email === "muhammadzainb@gmail.com") {
        loadData();
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch lists from db
  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedBlocks = await fetchAllContentBlocks();
      const fetchedTasks = await fetchCeoTasks();
      const fetchedSettings = await fetchSiteSettings();

      setBlocks(fetchedBlocks);
      setTasks(fetchedTasks);
      
      // Populate Global Settings
      setHeroTitleEn(fetchedSettings.heroTitleEn || "");
      setHeroTitleUr(fetchedSettings.heroTitleUr || "");
      setHeroSubtitleEn(fetchedSettings.heroSubtitleEn || "");
      setHeroSubtitleUr(fetchedSettings.heroSubtitleUr || "");
      setTickerEn(fetchedSettings.tickerEn || "");
      setTopBannerEn(fetchedSettings.topBannerEn || "");
      setTopBannerUr(fetchedSettings.topBannerUr || "");
      setShowTopBanner(fetchedSettings.showTopBanner);
      setCustomPages(fetchedSettings.pages || []);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign In with Google popup
  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google popup blocked or failed. Trying redirection fallback.", err);
      setAuthError("Google Login Popup Failed. Please ensure popups are allowed or try Email login below.");
    }
  };

  // Sign In with Email Credentials (fallback if popups are fully blocked inside sandboxed iframe)
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Email sign-in failed", err);
      setAuthError(err.message || "Email authentication failed.");
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setBlocks([]);
      setTasks([]);
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  // Save Content Block CMS Form
  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.email !== "muhammadzainb@gmail.com") return;

    const blockTypeToSave = cmsBlockType === "custom" ? customBlockType : cmsBlockType;
    if (!blockTypeToSave || !cmsTitle || !cmsBody) {
      alert("Please fill in all core block fields (Type, Title, Body).");
      return;
    }

    // Assemble displays locations array
    const displayLocations: string[] = [];
    if (displayHome) displayLocations.push("homepage");
    if (displayLog) displayLocations.push("build-log");
    if (displayResearch) displayLocations.push("research");

    // Construct blockType-specific structured JSON data
    let blockData: any = null;
    if (blockTypeToSave === "funding_tracker") {
      blockData = {
        raised: parseFloat(raised) || 0,
        goal: parseFloat(goal) || 0,
        currency: currency || "USD",
      };
    } else if (blockTypeToSave === "research") {
      blockData = {
        authors: authors || "Unknown",
        year: parseInt(year) || 2026,
        url: paperUrl || "",
        tag: paperTag || "Text-to-BIM",
        status: paperStatus || "reading",
      };
    } else if (blockTypeToSave === "partner_thanks") {
      blockData = {
        partnerName: partnerName || "",
        supportType: supportType || "",
        logoUrl: partnerLogo || "general",
      };
    } else if (blockTypeToSave === "team_member") {
      blockData = {
        role: teamRole || "",
        imageUrl: teamImageUrl || "",
        isFounder: teamIsFounder,
        githubUrl: teamGithubUrl || "",
      };
    }

    const newBlock: Omit<ContentBlock, "id"> = {
      blockType: blockTypeToSave,
      title: cmsTitle,
      body: cmsBody,
      displayLocations,
      order: cmsOrder,
      createdAt: new Date().toISOString(),
      ...(blockData && { data: blockData }),
    };

    try {
      await saveContentBlock(newBlock, editingBlockId || undefined);
      // Clear core forms
      setCmsTitle("");
      setCmsBody("");
      setCustomBlockType("");
      setEditingBlockId(null);
      
      // Clear team forms
      setTeamRole("");
      setTeamImageUrl("");
      setTeamIsFounder(false);
      setTeamGithubUrl("");
      
      // Refresh
      await loadData();
      onRefreshGlobalData();
      alert(editingBlockId ? "Content Block updated successfully!" : "Content Block saved successfully and updated live!");
    } catch (err) {
      console.error("Save content block failed", err);
      alert("Error saving block. Review security rules.");
    }
  };

  const handleEditBlock = (block: ContentBlock) => {
    setEditingBlockId(block.id || null);
    setCmsBlockType(block.blockType);
    setCmsTitle(block.title);
    setCmsBody(block.body);
    setCmsOrder(block.order);
    setDisplayHome(block.displayLocations.includes("homepage"));
    setDisplayLog(block.displayLocations.includes("build-log"));
    setDisplayResearch(block.displayLocations.includes("research"));

    // Reset sub-states to defaults
    setRaised("28500");
    setGoal("50000");
    setCurrency("USD");
    setAuthors("");
    setYear("2026");
    setPaperUrl("");
    setPaperTag("Text-to-BIM");
    setPaperStatus("reading");
    setPartnerName("");
    setSupportType("");
    setPartnerLogo("");
    setTeamRole("");
    setTeamImageUrl("");
    setTeamIsFounder(false);
    setTeamGithubUrl("");

    if (block.blockType === "funding_tracker") {
      setRaised(block.data?.raised?.toString() || "");
      setGoal(block.data?.goal?.toString() || "");
      setCurrency(block.data?.currency || "USD");
    } else if (block.blockType === "research") {
      setAuthors(block.data?.authors || "");
      setYear(block.data?.year?.toString() || "2026");
      setPaperUrl(block.data?.url || "");
      setPaperTag(block.data?.tag || "Text-to-BIM");
      setPaperStatus(block.data?.status || "reading");
    } else if (block.blockType === "partner_thanks") {
      setPartnerName(block.data?.partnerName || "");
      setSupportType(block.data?.supportType || "");
      setPartnerLogo(block.data?.logoUrl || "");
    } else if (block.blockType === "team_member") {
      setTeamRole(block.data?.role || "");
      setTeamImageUrl(block.data?.imageUrl || "");
      setTeamIsFounder(!!block.data?.isFounder);
      setTeamGithubUrl(block.data?.githubUrl || "");
    }
    
    // Scroll up to the editor for convenience
    const editorElem = document.querySelector("form");
    if (editorElem) {
      editorElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Delete Content Block
  const handleDeleteBlock = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this content block?")) return;
    try {
      await deleteContentBlock(id);
      await loadData();
      onRefreshGlobalData();
    } catch (err) {
      console.error("Delete block failed", err);
    }
  };

  // Save Site-Wide Settings Form
  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.email !== "muhammadzainb@gmail.com") return;

    const updatedSettings: SiteSettings = {
      heroTitleEn,
      heroTitleUr,
      heroSubtitleEn,
      heroSubtitleUr,
      tickerEn,
      topBannerEn,
      topBannerUr,
      showTopBanner,
      pages: customPages
    };

    try {
      setIsLoading(true);
      await saveSiteSettings(updatedSettings);
      alert("Global Site Settings updated and published live!");
      onRefreshGlobalData();
    } catch (err) {
      console.error("Failed to save global settings", err);
      alert("Error saving settings. Verify firestore.rules.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add Custom Page Form
  const handleAddCustomPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageSlug || !newPageTitleEn || !newPageContentEn) {
      alert("Please fill in the Page URL Slug, English Title, and English Content.");
      return;
    }

    const cleanSlug = newPageSlug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "");
    if (customPages.some(p => p.slug === cleanSlug)) {
      alert(`A custom page with slug "${cleanSlug}" already exists!`);
      return;
    }

    const newPage: CustomPage = {
      slug: cleanSlug,
      titleEn: newPageTitleEn,
      titleUr: newPageTitleUr || newPageTitleEn,
      contentEn: newPageContentEn,
      contentUr: newPageContentUr || newPageContentEn
    };

    const updatedPages = [...customPages, newPage];
    setCustomPages(updatedPages);

    const updatedSettings: SiteSettings = {
      heroTitleEn,
      heroTitleUr,
      heroSubtitleEn,
      heroSubtitleUr,
      tickerEn,
      topBannerEn,
      topBannerUr,
      showTopBanner,
      pages: updatedPages
    };

    try {
      setIsLoading(true);
      await saveSiteSettings(updatedSettings);
      setNewPageSlug("");
      setNewPageTitleEn("");
      setNewPageTitleUr("");
      setNewPageContentEn("");
      setNewPageContentUr("");
      alert(`Successfully added page "${newPageTitleEn}"!`);
      onRefreshGlobalData();
    } catch (err) {
      console.error("Failed to add custom page", err);
      alert("Error adding page.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Custom Page
  const handleDeleteCustomPage = async (slugToDel: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete custom page "${slugToDel}"?`)) return;

    const updatedPages = customPages.filter(p => p.slug !== slugToDel);
    setCustomPages(updatedPages);

    const updatedSettings: SiteSettings = {
      heroTitleEn,
      heroTitleUr,
      heroSubtitleEn,
      heroSubtitleUr,
      tickerEn,
      topBannerEn,
      topBannerUr,
      showTopBanner,
      pages: updatedPages
    };

    try {
      setIsLoading(true);
      await saveSiteSettings(updatedSettings);
      alert("Custom page deleted successfully.");
      onRefreshGlobalData();
    } catch (err) {
      console.error("Failed to delete custom page", err);
      alert("Error deleting page.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save CEO Task Form
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.email !== "muhammadzainb@gmail.com") return;
    if (!taskTitle) return;

    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order), 0);

    const newTask: Omit<CeoTask, "id"> = {
      title: taskTitle,
      notes: taskNotes,
      status: "To Do",
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveCeoTask(newTask);
      setTaskTitle("");
      setTaskNotes("");
      await loadData();
    } catch (err) {
      console.error("Save task failed", err);
    }
  };

  // Move Task Status (To Do -> In Progress -> Done)
  const handleMoveTaskStatus = async (task: CeoTask, newStatus: "To Do" | "In Progress" | "Done") => {
    const updated: Omit<CeoTask, "id"> = {
      title: task.title,
      notes: task.notes,
      status: newStatus,
      order: task.order,
      createdAt: task.createdAt,
    };
    try {
      await saveCeoTask(updated, task.id);
      await loadData();
    } catch (err) {
      console.error("Move task status failed", err);
    }
  };

  // Delete CEO Task
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteCeoTask(id);
      await loadData();
    } catch (err) {
      console.error("Delete task failed", err);
    }
  };

  // Loading indicator for background operations
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy text-gold">
        <div className="text-center font-mono space-y-3">
          <RefreshCw className="animate-spin mx-auto text-gold" size={24} />
          <p className="text-xs uppercase tracking-widest">Verifying Authority...</p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-cream">
        <div className="p-8 border border-gold/15 bg-navy2/50 rounded shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 border border-gold/30 bg-gold/5 text-gold flex items-center justify-center rounded-sm mx-auto">
            <Lock size={20} />
          </div>
          
          <div>
            <h1 className="font-serif text-2xl text-white tracking-wide">CEO Secure Gateway</h1>
            <p className="text-xs text-slate mt-1.5 leading-relaxed">
              This is a private unlisted administrative control board. Access is restricted exclusively to authorized accounts.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded text-left flex gap-2">
              <AlertTriangle className="shrink-0" size={14} />
              <span>{authError}</span>
            </div>
          )}

          <button 
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 bg-gold hover:bg-gold-lt text-navy font-semibold text-xs tracking-widest uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/5"
          >
            <span>Sign In with Google</span>
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-gold/10" />
            <span className="relative px-3 bg-navy text-[10px] font-mono text-slate/50">OR SECURE LOGIN</span>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate uppercase block">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="muhammadzainb@gmail.com"
                className="w-full p-3 bg-navy border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate uppercase block">Secret Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-navy border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 border border-gold/30 hover:border-gold bg-gold/5 hover:bg-gold/10 text-gold text-xs font-semibold tracking-widest uppercase rounded transition-all cursor-pointer"
            >
              Authenticate credentials
            </button>
          </form>

          <button 
            onClick={() => onNavigate("home")}
            className="text-xs text-slate hover:text-gold transition-colors flex items-center gap-1.5 justify-center mx-auto cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Return to public portal</span>
          </button>
        </div>
      </div>
    );
  }

  // UNAUTHORIZED USER FILTER
  if (user.email !== "muhammadzainb@gmail.com") {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-cream">
        <div className="p-8 border border-rose-500/20 bg-rose-500/5 rounded shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 border border-rose-500/30 bg-rose-500/5 text-rose-400 flex items-center justify-center rounded-sm mx-auto">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-white font-semibold">Access Restricted</h1>
            <p className="text-xs text-rose-400 mt-2 leading-relaxed">
              Authenticated successfully as <strong className="text-white">{user.email}</strong>, but you do not hold administrative privileges. Writes and views are gated strictly to the CEO.
            </p>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full py-3 bg-rose-500 text-white font-semibold text-xs tracking-widest uppercase rounded hover:bg-rose-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={12} />
            <span>Disconnect Account</span>
          </button>
        </div>
      </div>
    );
  }

  // MAIN SECURE ADMIN PANEL
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-cream space-y-12">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gold/15">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gold font-mono uppercase">
            <ShieldCheck size={14} />
            <span>AUTHORIZED SESSION STATE: ACTIVE</span>
          </div>
          <h1 className="font-serif text-3xl text-white font-light mt-1">CEO Command Dashboard</h1>
          <p className="text-xs text-slate font-mono mt-0.5">Admin Account: muhammadzainb@gmail.com</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate("home")}
            className="px-4 py-2 bg-navy border border-gold/15 hover:border-gold hover:bg-gold/5 text-gold text-xs font-semibold tracking-wider uppercase rounded-sm transition-all cursor-pointer"
          >
            View Public Site
          </button>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold tracking-wider uppercase rounded-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={12} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Grid: CMS Manager (Left) and CEO Checklist (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EXTENSIBLE CMS SYSTEM (Col span 7) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section title */}
          <div className="flex items-center gap-2 text-gold font-serif text-lg border-b border-gold/10 pb-2">
            <Layers size={18} />
            <span>Extensible CMS Publisher</span>
          </div>

          {/* New block post form */}
          <form onSubmit={handleSaveBlock} className="p-6 border border-gold/15 bg-navy2/40 rounded-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Block Type Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate uppercase block">Block Schema Type</label>
                <select
                  value={cmsBlockType}
                  onChange={(e) => setCmsBlockType(e.target.value)}
                  className="w-full p-3 bg-navy border border-gold/15 rounded text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="milestone">Milestone update</option>
                  <option value="research">Research study citation</option>
                  <option value="team">Hiring / Team search</option>
                  <option value="team_member">Team Member Profile</option>
                  <option value="funding_tracker">Support funding tracker</option>
                  <option value="partner_thanks">Partner Logo support</option>
                  <option value="custom">Add custom type...</option>
                </select>
              </div>

              {/* Order index */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate uppercase block">Sorting priority order weight</label>
                <input 
                  type="number"
                  value={cmsOrder}
                  onChange={(e) => setCmsOrder(parseInt(e.target.value) || 1)}
                  className="w-full p-3 bg-navy border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

            </div>

            {/* Custom Type Input if selected */}
            {cmsBlockType === "custom" && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gold uppercase block">Type unique slug name</label>
                <input 
                  type="text" 
                  required
                  value={customBlockType}
                  onChange={(e) => setCustomBlockType(e.target.value)}
                  placeholder="e.g. video_demo"
                  className="w-full p-3 bg-navy border border-gold/20 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate uppercase block">Title</label>
              <input 
                type="text"
                required
                value={cmsTitle}
                onChange={(e) => setCmsTitle(e.target.value)}
                placeholder="e.g. Text-to-BIM Parser Operational"
                className="w-full p-3 bg-navy border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            {/* Body */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate uppercase block">Detailed takeaway body content</label>
              <textarea 
                required
                rows={4}
                value={cmsBody}
                onChange={(e) => setCmsBody(e.target.value)}
                placeholder="Type the paragraphs detailing the update or milestone..."
                className="w-full p-3 bg-navy border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold resize-none"
              />
            </div>

            {/* DYNAMIC FIELD MODULES */}
            {/* 1. FUNDING TRACKER DATA */}
            {(cmsBlockType === "funding_tracker" || customBlockType === "funding_tracker") && (
              <div className="p-4 bg-navy border border-gold/10 rounded-sm space-y-3">
                <span className="text-[10px] font-mono text-gold uppercase block border-b border-gold/5 pb-1">FUNDING LEDGER DATA</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Raised</label>
                    <input 
                      type="number"
                      value={raised}
                      onChange={(e) => setRaised(e.target.value)}
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Goal Target</label>
                    <input 
                      type="number"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Currency</label>
                    <input 
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. RESEARCH DATA */}
            {(cmsBlockType === "research" || customBlockType === "research") && (
              <div className="p-4 bg-navy border border-gold/10 rounded-sm space-y-3">
                <span className="text-[10px] font-mono text-gold uppercase block border-b border-gold/5 pb-1">ACADEMIC CITATION DATA</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Author list</label>
                    <input 
                      type="text"
                      value={authors}
                      onChange={(e) => setAuthors(e.target.value)}
                      placeholder="e.g. A. Kalervo, et al."
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Publication Year</label>
                    <input 
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] font-mono text-slate block mb-1">ArXiv / DOI Link</label>
                    <input 
                      type="text"
                      value={paperUrl}
                      onChange={(e) => setPaperUrl(e.target.value)}
                      placeholder="https://arxiv.org/abs/..."
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Subject Tag</label>
                    <input 
                      type="text"
                      value={paperTag}
                      onChange={(e) => setPaperTag(e.target.value)}
                      placeholder="Text-to-BIM"
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Status Badge</label>
                    <select
                      value={paperStatus}
                      onChange={(e) => setPaperStatus(e.target.value)}
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-cream focus:outline-none"
                    >
                      <option value="reading">reading</option>
                      <option value="implemented">implemented</option>
                      <option value="reference only">reference only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PARTNER THANKS DATA */}
            {(cmsBlockType === "partner_thanks" || customBlockType === "partner_thanks") && (
              <div className="p-4 bg-navy border border-gold/10 rounded-sm space-y-3">
                <span className="text-[10px] font-mono text-gold uppercase block border-b border-gold/5 pb-1">PARTNER SUPPORT DATA</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Partner Name</label>
                    <input 
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="NVIDIA"
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Support Type</label>
                    <input 
                      type="text"
                      value={supportType}
                      onChange={(e) => setSupportType(e.target.value)}
                      placeholder="Inception Compute Grant"
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Logo Tag</label>
                    <input 
                      type="text"
                      value={partnerLogo}
                      onChange={(e) => setPartnerLogo(e.target.value)}
                      placeholder="nvidia"
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. TEAM MEMBER PROFILE DATA */}
            {(cmsBlockType === "team_member" || customBlockType === "team_member") && (
              <div className="p-4 bg-navy border border-gold/10 rounded-sm space-y-4">
                <span className="text-[10px] font-mono text-gold uppercase block border-b border-gold/5 pb-1">TEAM MEMBER INFORMATION</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Role / Job Title</label>
                    <input 
                      type="text"
                      value={teamRole}
                      onChange={(e) => setTeamRole(e.target.value)}
                      placeholder="e.g. Co-Founder, Lead Computational Architect"
                      className="w-full p-2.5 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">GitHub / Portfolio URL (Optional)</label>
                    <input 
                      type="text"
                      value={teamGithubUrl}
                      onChange={(e) => setTeamGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full p-2.5 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono select-none">
                    <input 
                      type="checkbox" 
                      checked={teamIsFounder}
                      onChange={(e) => setTeamIsFounder(e.target.checked)}
                      className="accent-gold h-4 w-4 cursor-pointer"
                    />
                    <span>Mark as Founder / Principal Leader</span>
                  </label>
                </div>

                {/* Profile Picture Uploader & Field */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate uppercase block mb-1">Profile Picture (Upload or Paste URL)</span>
                  
                  {/* Drag-and-drop area */}
                  <div
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === "string") setTeamImageUrl(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={`border-2 border-dashed rounded p-4 text-center transition-all ${
                      dragActive ? "border-gold bg-gold/10" : "border-gold/20 bg-navy2/40"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {teamImageUrl ? (
                        <div className="relative w-20 h-24 border border-gold/30 p-0.5 bg-navy rounded overflow-hidden">
                          <img src={teamImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setTeamImageUrl("")}
                            className="absolute top-0 right-0 p-1 bg-rose-600 text-white hover:bg-rose-700 transition rounded-bl cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-slate text-xs py-2">
                          <p className="font-sans font-light">Drag & drop profile photo here, or</p>
                          <label className="inline-block mt-2 px-3 py-1.5 bg-gold/15 hover:bg-gold/30 text-gold border border-gold/30 rounded text-xs font-semibold cursor-pointer select-none transition-colors">
                            <span>Browse File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === "string") setTeamImageUrl(reader.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual URL input fallback */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate block">Or, paste absolute profile photo URL</label>
                    <input 
                      type="text"
                      value={teamImageUrl}
                      onChange={(e) => setTeamImageUrl(e.target.value)}
                      placeholder="/muhammad_zain_cto.jpg or external url"
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Display locations selectors */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate uppercase block mb-1">Target View Port Locations</span>
              <div className="flex flex-wrap gap-4 text-xs font-mono">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={displayHome}
                    onChange={(e) => setDisplayHome(e.target.checked)}
                    className="accent-gold"
                  />
                  <span>Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={displayLog}
                    onChange={(e) => setDisplayLog(e.target.checked)}
                    className="accent-gold"
                  />
                  <span>Build Log feed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={displayResearch}
                    onChange={(e) => setDisplayResearch(e.target.checked)}
                    className="accent-gold"
                  />
                  <span>Research index</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              {editingBlockId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBlockId(null);
                    setCmsTitle("");
                    setCmsBody("");
                    setCmsBlockType("milestone");
                    setCustomBlockType("");
                    // Clear team states
                    setTeamRole("");
                    setTeamImageUrl("");
                    setTeamIsFounder(false);
                    setTeamGithubUrl("");
                  }}
                  className="flex-1 py-3 bg-navy border border-rose-500/30 hover:border-rose-500 text-rose-400 font-gold font-bold text-xs tracking-widest uppercase rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                className="flex-[2] py-3 bg-gold hover:bg-gold-lt text-navy font-bold text-xs tracking-widest uppercase rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save size={14} />
                <span>{editingBlockId ? "Update Content Block" : "Publish Content Block"}</span>
              </button>
            </div>
          </form>

          {/* List of existing content blocks for easy deletion/audit */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-slate uppercase block">ACTIVE DATABASE CONTENT BLOCKS</span>
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
              {blocks.length > 0 ? (
                blocks.map((block) => (
                  <div key={block.id} className="p-3 bg-navy2/50 border border-gold/10 text-xs flex justify-between items-start gap-4 hover:bg-navy2/80 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gold font-semibold uppercase text-[9px] tracking-wide bg-gold/5 border border-gold/20 px-1.5 py-0.5 rounded">
                          {block.blockType}
                        </span>
                        <span className="text-slate text-[9px]">({block.displayLocations.join(", ")})</span>
                      </div>
                      <h4 className="text-white font-serif font-semibold">{block.title}</h4>
                      <p className="text-slate text-[10px] line-clamp-1 mt-0.5">{block.body}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditBlock(block)}
                        className="p-1.5 text-slate/50 hover:text-gold hover:bg-gold/10 rounded cursor-pointer transition-colors"
                        title="Edit Content Block"
                      >
                        <Settings size={13} />
                      </button>
                      <button
                        onClick={() => block.id && handleDeleteBlock(block.id)}
                        className="p-1.5 text-slate/50 hover:text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer transition-colors"
                        title="Delete Content Block"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate font-mono p-4 border border-gold/5 text-center">No content blocks loaded.</p>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PRIVATE CEO TASKS BOARD (Col span 5) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Section title */}
          <div className="flex items-center gap-2 text-gold font-serif text-lg border-b border-gold/10 pb-2">
            <ListTodo size={18} />
            <span>CEO Task Board (Private)</span>
          </div>

          {/* New Task Entry Card */}
          <form onSubmit={handleSaveTask} className="p-5 border border-gold/15 bg-navy2/40 rounded-sm space-y-3">
            <span className="text-[10px] font-mono text-gold uppercase block">Add Private Roadmap Target</span>
            
            <div className="space-y-1">
              <input 
                type="text" 
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Integrate SBCA local building laws"
                className="w-full p-2.5 bg-navy border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <textarea 
                rows={2}
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Optional task specifications / resources..."
                className="w-full p-2.5 bg-navy border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gold/10 hover:bg-gold text-gold hover:text-navy border border-gold/30 text-xs font-semibold tracking-wider uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus size={13} />
              <span>Register Target</span>
            </button>
          </form>

          {/* Kanban / Task Columns */}
          <div className="space-y-6">
            
            {/* 1. TO DO COLUMN */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate tracking-wider uppercase border-b border-gold/15 pb-1">
                <span>To Do</span>
                <span className="bg-navy border border-gold/15 px-1.5 rounded">{tasks.filter(t => t.status === "To Do").length}</span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {tasks.filter(t => t.status === "To Do").map(task => (
                  <div key={task.id} className="p-3 bg-navy border border-gold/10 rounded flex flex-col justify-between gap-2.5">
                    <div>
                      <h4 className="text-xs text-white font-medium">{task.title}</h4>
                      {task.notes && <p className="text-[10px] text-slate mt-1">{task.notes}</p>}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gold/5">
                      <button
                        onClick={() => task.id && handleDeleteTask(task.id)}
                        className="text-slate/40 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        onClick={() => handleMoveTaskStatus(task, "In Progress")}
                        className="text-[9px] font-mono text-gold hover:text-white flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Start</span>
                        <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. IN PROGRESS COLUMN */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 tracking-wider uppercase border-b border-amber-500/15 pb-1">
                <span>In Progress</span>
                <span className="bg-navy border border-amber-500/15 px-1.5 rounded">{tasks.filter(t => t.status === "In Progress").length}</span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {tasks.filter(t => t.status === "In Progress").map(task => (
                  <div key={task.id} className="p-3 bg-navy border border-amber-500/10 rounded flex flex-col justify-between gap-2.5">
                    <div>
                      <h4 className="text-xs text-white font-medium">{task.title}</h4>
                      {task.notes && <p className="text-[10px] text-slate mt-1">{task.notes}</p>}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gold/5">
                      <button
                        onClick={() => task.id && handleDeleteTask(task.id)}
                        className="text-slate/40 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        onClick={() => handleMoveTaskStatus(task, "Done")}
                        className="text-[9px] font-mono text-emerald-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Complete</span>
                        <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. DONE COLUMN */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 tracking-wider uppercase border-b border-emerald-500/15 pb-1">
                <span>Done</span>
                <span className="bg-navy border border-emerald-500/15 px-1.5 rounded">{tasks.filter(t => t.status === "Done").length}</span>
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {tasks.filter(t => t.status === "Done").map(task => (
                  <div key={task.id} className="p-3 bg-navy border border-emerald-500/10 rounded flex flex-col justify-between gap-2.5 opacity-60">
                    <div>
                      <h4 className="text-xs text-slate-400 line-through font-medium">{task.title}</h4>
                      {task.notes && <p className="text-[10px] text-slate/50 mt-1">{task.notes}</p>}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gold/5">
                      <button
                        onClick={() => task.id && handleDeleteTask(task.id)}
                        className="text-slate/40 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        onClick={() => handleMoveTaskStatus(task, "In Progress")}
                        className="text-[9px] font-mono text-slate hover:text-gold flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Reopen</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── FULL-WIDTH SITE IDENTITY & DYNAMIC PAGES CONFIGURATION CONSOLE ── */}
      <div className="border-t-2 border-dashed border-gold/15 pt-12 space-y-10">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-gold/15">
          <Settings className="text-gold" size={22} />
          <div>
            <h2 className="font-serif text-xl text-white font-medium">Core Website CMS Console</h2>
            <p className="text-[10px] font-mono text-slate uppercase">Dynamic Layouts, Hero Identity, Live Banners & Custom Subpages</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Site Configuration (Col span 6) */}
          <div className="lg:col-span-6 p-6 border border-gold/15 bg-navy2/40 rounded-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-gold/10 pb-2 text-gold">
              <Radio size={16} />
              <span className="font-serif font-medium">Identity & Global Elements</span>
            </div>

            <form onSubmit={handleSaveGlobalSettings} className="space-y-4">
              
              {/* English Hero Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate uppercase block">Hero Title (English)</label>
                <input 
                  type="text"
                  required
                  value={heroTitleEn}
                  onChange={(e) => setHeroTitleEn(e.target.value)}
                  className="w-full p-2.5 bg-navy border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              {/* Urdu Hero Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate uppercase block">Hero Title (Urdu)</label>
                <input 
                  type="text"
                  required
                  value={heroTitleUr}
                  onChange={(e) => setHeroTitleUr(e.target.value)}
                  className="w-full p-2.5 bg-navy border border-gold/15 rounded text-xs text-white text-right font-serif focus:outline-none focus:border-gold"
                  dir="rtl"
                />
              </div>

              {/* English Hero Subtitle */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate uppercase block">Hero Description (English)</label>
                <textarea 
                  rows={3}
                  required
                  value={heroSubtitleEn}
                  onChange={(e) => setHeroSubtitleEn(e.target.value)}
                  className="w-full p-2.5 bg-navy border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold resize-none"
                />
              </div>

              {/* Urdu Hero Subtitle */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate uppercase block">Hero Description (Urdu)</label>
                <textarea 
                  rows={3}
                  required
                  value={heroSubtitleUr}
                  onChange={(e) => setHeroSubtitleUr(e.target.value)}
                  className="w-full p-2.5 bg-navy border border-gold/15 rounded text-xs text-white text-right font-serif focus:outline-none focus:border-gold resize-none"
                  dir="rtl"
                />
              </div>

              {/* Moving Marquee Ticker */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate uppercase block">Moving Marquee Ticker words</label>
                <input 
                  type="text"
                  required
                  value={tickerEn}
                  onChange={(e) => setTickerEn(e.target.value)}
                  className="w-full p-2.5 bg-navy border border-gold/15 rounded text-xs font-mono text-gold focus:outline-none focus:border-gold"
                />
              </div>

              {/* Top Announcement Banner Toggle & Text */}
              <div className="p-4 bg-navy border border-gold/10 rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gold uppercase block">ALERT BANNER CONSOLE</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                    <input 
                      type="checkbox" 
                      checked={showTopBanner}
                      onChange={(e) => setShowTopBanner(e.target.checked)}
                      className="accent-gold"
                    />
                    <span>{showTopBanner ? "VISIBLE (ACTIVE)" : "MUTED (HIDDEN)"}</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Banner Alert Text (English)</label>
                    <input 
                      type="text"
                      value={topBannerEn}
                      onChange={(e) => setTopBannerEn(e.target.value)}
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate block mb-1">Banner Alert Text (Urdu)</label>
                    <input 
                      type="text"
                      value={topBannerUr}
                      onChange={(e) => setTopBannerUr(e.target.value)}
                      className="w-full p-2 bg-navy2 border border-gold/10 text-xs text-white text-right font-serif focus:outline-none"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold hover:bg-gold-lt text-navy font-bold text-xs tracking-widest uppercase rounded flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/5"
              >
                <Save size={14} />
                <span>Publish Global Settings</span>
              </button>

            </form>
          </div>

          {/* RIGHT: Dynamic Pages Creator (Col span 6) */}
          <div className="lg:col-span-6 p-6 border border-gold/15 bg-navy2/40 rounded-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-gold/10 pb-2 text-gold">
              <FileText size={16} />
              <span className="font-serif font-medium">Dynamic Custom Pages Constructor</span>
            </div>

            {/* List of existing pages */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate uppercase block">ACTIVE SUBPAGES (DASHBOARD RECOGNIZED)</span>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {customPages.length > 0 ? (
                  customPages.map((page) => (
                    <div key={page.slug} className="p-3 bg-navy border border-gold/10 rounded flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-medium text-xs font-serif">{page.titleEn}</span>
                          <span className="text-slate text-[9px] font-mono uppercase bg-gold/5 border border-gold/20 px-1 py-0.5 rounded">/{page.slug}</span>
                        </div>
                        <p className="text-slate text-[10px] mt-0.5 font-serif text-right" dir="rtl">{page.titleUr}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCustomPage(page.slug)}
                        className="p-1.5 text-slate/40 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0"
                        title="Delete Subpage"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate font-mono p-4 border border-gold/5 rounded text-center">No custom subpages registered. Create one below!</p>
                )}
              </div>
            </div>

            {/* Add custom page form */}
            <form onSubmit={handleAddCustomPage} className="p-4 bg-navy border border-gold/10 rounded-sm space-y-3">
              <span className="text-[10px] font-mono text-gold uppercase block border-b border-gold/5 pb-1">CONSTRUCT NEW SUBPAGE</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate uppercase block">Unique URL Slug</label>
                  <input 
                    type="text"
                    required
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    placeholder="e.g. model-docs"
                    className="w-full p-2.5 bg-navy2 border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold font-mono"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate uppercase block">Title (English)</label>
                  <input 
                    type="text"
                    required
                    value={newPageTitleEn}
                    onChange={(e) => setNewPageTitleEn(e.target.value)}
                    placeholder="e.g. Model Specifications"
                    className="w-full p-2.5 bg-navy2 border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate uppercase block">Title (Urdu - optional)</label>
                <input 
                  type="text"
                  value={newPageTitleUr}
                  onChange={(e) => setNewPageTitleUr(e.target.value)}
                  placeholder="مثال: ماڈل کی تفصیلات"
                  className="w-full p-2.5 bg-navy2 border border-gold/15 rounded text-xs text-white text-right font-serif focus:outline-none focus:border-gold"
                  dir="rtl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate uppercase block">Page Content Body (English)</label>
                <textarea 
                  rows={4}
                  required
                  value={newPageContentEn}
                  onChange={(e) => setNewPageContentEn(e.target.value)}
                  placeholder="English text or full HTML specifications for this subpage..."
                  className="w-full p-2.5 bg-navy2 border border-gold/15 rounded text-xs text-white focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate uppercase block">Page Content Body (Urdu - optional)</label>
                <textarea 
                  rows={4}
                  value={newPageContentUr}
                  onChange={(e) => setNewPageContentUr(e.target.value)}
                  placeholder="اردو متن یا تفصیلی وضاحت برائے صفحہ..."
                  className="w-full p-2.5 bg-navy2 border border-gold/15 rounded text-xs text-white text-right font-serif focus:outline-none focus:border-gold resize-none"
                  dir="rtl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gold text-navy font-bold text-xs tracking-widest uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:bg-gold-lt transition-colors"
              >
                <Plus size={13} />
                <span>Build and Register Page</span>
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
};

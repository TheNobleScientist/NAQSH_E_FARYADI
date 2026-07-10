import React, { useState } from "react";
import { ContentBlock } from "../services/dbService";
import { 
  ArrowLeft, Search, Filter, ExternalLink, GraduationCap, 
  Layers, Compass, CheckSquare, Bookmark, BookOpen
} from "lucide-react";

interface ResearchLibraryPageProps {
  contentBlocks: ContentBlock[];
  onNavigate: (view: "home" | "blog" | "build-log" | "research" | "admin") => void;
  isUrdu: boolean;
}

export const ResearchLibraryPage: React.FC<ResearchLibraryPageProps> = ({
  contentBlocks,
  onNavigate,
  isUrdu,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Filter out research blocks only
  const researchBlocks = contentBlocks.filter((b) => b.blockType === "research");

  // Get unique tags and statuses in the system
  const allTags = ["all", ...Array.from(new Set(researchBlocks.map((b) => b.data?.tag).filter(Boolean)))];
  const allStatuses = ["all", "reading", "implemented", "reference only"];

  // Filter logic
  const filteredItems = researchBlocks.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.data?.authors ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.body.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = selectedTag === "all" || item.data?.tag === selectedTag;
    const matchesStatus = selectedStatus === "all" || item.data?.status === selectedStatus;

    return matchesSearch && matchesTag && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-cream relative animate-fade-in">
      
      {/* Background architectural blueprint watermark details */}
      <div className="absolute top-12 left-10 w-44 h-44 opacity-[0.01] pointer-events-none hidden md:block border border-gold/40 rounded-full flex items-center justify-center">
        <div className="w-36 h-36 border border-dashed border-gold/30 rounded-full" />
      </div>

      {/* Back to Home Navigation */}
      <div className="mb-12">
        <button 
          onClick={() => { onNavigate("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="group flex items-center gap-2 text-xs font-semibold tracking-widest text-gold uppercase mb-8 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>{isUrdu ? "ہوم پیج پر واپس جائیں" : "Back to Home"}</span>
        </button>

        <span className="text-[10px] font-mono tracking-widest text-gold/60 uppercase block mb-2">
          {isUrdu ? "ریسرچ انڈیکس" : "ARCHIVAL SCHOLARSHIP"}
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-white leading-tight mb-4">
          {isUrdu ? "تحقیقی دستاویزات کتب خانہ" : "The Citation Library"}
        </h1>
        <p className="max-w-2xl text-slate text-sm font-light leading-relaxed">
          {isUrdu 
            ? "ہمارے عمارتی اور ٹیکنیکل سسٹمز کی بنیاد بننے والی علمی تحقیق اور اوپن سورس پیکجز کا ایک باضابطہ، باضابطہ اشاریہ۔"
            : "A dense, structured register of all academic publications, computational geometry libraries, and open-source BIM tools referenced in our development pipeline."}
        </p>
      </div>

      {/* Filter and Search Drawer Grid */}
      <div className="p-6 border border-gold/15 bg-navy2/50 rounded-sm mb-12 flex flex-col md:flex-row gap-6 items-stretch md:items-center">
        {/* Search Input */}
        <div className="flex-grow relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isUrdu ? "دستاویز تلاش کریں..." : "Query title, author, or takeaway..."}
            className="w-full pl-10 pr-4 py-3 bg-navy border border-gold/15 text-xs text-cream focus:outline-none focus:border-gold rounded-sm placeholder-slate font-light"
          />
        </div>

        {/* Filter Selection Cards */}
        <div className="flex flex-wrap gap-4 items-center shrink-0">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-mono tracking-wider text-slate uppercase">Research Tag</span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 bg-navy border border-gold/15 rounded-sm text-xs text-cream focus:outline-none focus:border-gold appearance-none pr-8 relative cursor-pointer font-mono"
            >
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag === "all" ? "All Tags" : tag}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-mono tracking-wider text-slate uppercase">Development Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-navy border border-gold/15 rounded-sm text-xs text-cream focus:outline-none focus:border-gold appearance-none pr-8 relative cursor-pointer font-mono"
            >
              {allStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All Statuses" : status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Library Citation Ledger list */}
      <div className="space-y-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => {
            const authors = item.data?.authors ?? "Authors unknown";
            const year = item.data?.year ?? 2026;
            const tag = item.data?.tag ?? "Text-to-BIM";
            const status = item.data?.status ?? "reading";
            const url = item.data?.url ?? "#";

            return (
              <div 
                key={item.id}
                className="p-6 md:p-8 border border-gold/10 bg-navy/30 hover:border-gold/30 hover:bg-navy2/35 rounded-sm transition-all duration-300 relative group flex flex-col md:flex-row gap-6 justify-between items-start"
              >
                {/* Structural citation lines and numbers */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-transparent group-hover:bg-gold transition-all" />

                {/* Left: Dense citation metadata */}
                <div className="flex-grow space-y-4 max-w-4xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="p-1.5 bg-gold/5 border border-gold/25 text-gold rounded font-mono text-[9px] font-bold tracking-widest uppercase">
                      REF-{idx + 101}
                    </span>
                    <span className="text-slate font-mono text-xs">/</span>
                    <span className="text-xs font-mono text-slate tracking-wide uppercase">{tag}</span>
                    <span className="text-slate font-mono text-xs">/</span>
                    <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded ${
                      status === "implemented" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                        : status === "reading"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                        : "bg-slate/15 text-slate border border-slate/20"
                    }`}>
                      {status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl text-white font-medium mb-1.5 leading-snug group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="font-serif text-xs italic text-slate/90">
                      {authors} · Publication Year: {year}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-gold/60 uppercase block mb-1">
                      OUR TAKEAWAY & RESEARCH UTILITY
                    </span>
                    <p className="text-cream2/90 text-xs md:text-sm font-light leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="shrink-0 flex md:flex-col justify-end items-end h-full gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gold/10">
                  <a 
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-gold/5 hover:bg-gold text-gold hover:text-navy border border-gold/25 hover:border-gold text-xs font-mono tracking-widest uppercase rounded-sm transition-all cursor-pointer w-full md:w-auto text-center justify-center"
                  >
                    <span>Inspect Paper</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-16 border border-gold/15 bg-navy2/10 rounded-sm text-center">
            <GraduationCap className="mx-auto text-gold/30 mb-4 animate-pulse" size={40} />
            <h3 className="font-serif text-lg text-white mb-1">No research assets catalogued</h3>
            <p className="text-slate text-xs max-w-md mx-auto">No papers or packages match your active query filters. Reset search parameter to display entire library corpus.</p>
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useState } from "react";
import { ContentBlock } from "../services/dbService";
import { 
  ArrowLeft, Terminal, Filter, Calendar, ExternalLink, 
  BookOpen, Trophy, Users, Landmark, Heart, Eye
} from "lucide-react";

interface BuildLogPageProps {
  contentBlocks: ContentBlock[];
  onNavigate: (view: "home" | "blog" | "build-log" | "research" | "admin") => void;
  isUrdu: boolean;
}

export const BuildLogPage: React.FC<BuildLogPageProps> = ({
  contentBlocks,
  onNavigate,
  isUrdu,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Get all blocks shown in the build log (displayLocations contains "build-log")
  // Sort reverse-chronologically (newest first)
  const rawLogs = contentBlocks
    .filter((b) => b.displayLocations.includes("build-log"))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter logs by selected blockType tag
  const filteredLogs = selectedTag === "all" 
    ? rawLogs 
    : rawLogs.filter((log) => log.blockType === selectedTag);

  // Available filters based on the types found in the logs
  const tags = [
    { value: "all", label: isUrdu ? "تمام لاگز" : "All Entries" },
    { value: "milestone", label: isUrdu ? "سنگِ میل" : "Milestones" },
    { value: "research", label: isUrdu ? "ریسرچ" : "Research Studies" },
    { value: "team", label: isUrdu ? "ٹیم" : "Team & Hiring" },
    { value: "funding_tracker", label: isUrdu ? "فنڈنگ" : "Grants & Tracker" },
    { value: "partner_thanks", label: isUrdu ? "پارٹنر" : "Supporters" },
  ];

  // Helper to get matching icon and background color for the timeline nodes
  const getTypeStyle = (type: string) => {
    switch (type) {
      case "milestone":
        return {
          icon: <Trophy size={14} />,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          text: isUrdu ? "سنگِ میل" : "MILESTONE",
        };
      case "research":
        return {
          icon: <BookOpen size={14} />,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
          text: isUrdu ? "تحقیق" : "RESEARCH",
        };
      case "team":
        return {
          icon: <Users size={14} />,
          color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
          text: isUrdu ? "ٹیم اپ ڈیٹ" : "TEAM UPDATE",
        };
      case "funding_tracker":
        return {
          icon: <Landmark size={14} />,
          color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
          text: isUrdu ? "فنڈنگ ٹریکر" : "FUNDING STATE",
        };
      case "partner_thanks":
        return {
          icon: <Heart size={14} />,
          color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
          text: isUrdu ? "تعاون" : "SUPPORTER THANKS",
        };
      default:
        return {
          icon: <Terminal size={14} />,
          color: "text-gold bg-gold/10 border-gold/30",
          text: isUrdu ? "لاگ انٹری" : "BUILD LOG",
        };
    }
  };

  // Human friendly date helper
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 text-cream relative animate-fade-in">
      
      {/* Early Web / Dial-up Terminal Vintage Background Element */}
      <div className="absolute top-10 right-10 w-64 border border-gold/10 bg-black/40 rounded p-3 select-none pointer-events-none opacity-20 hidden md:block font-mono text-[8px] text-emerald-400 leading-normal">
        <div className="flex items-center gap-1 border-b border-gold/10 pb-1.5 mb-1.5">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          <span className="text-[7px] text-slate/50 ml-1">TTY_KARACHI_09_NODE</span>
        </div>
        <p className="animate-pulse">&gt; CONNECTING 103.121.22.88...</p>
        <p>&gt; PROTOCOL: SERIAL_PPP_DIALUP</p>
        <p>&gt; COMPILING SHADER LAYERS... OK</p>
        <p>&gt; RETRIEVING ARCHIVAL TRANSACTIONS... OK</p>
        <p>&gt; TRANSPARENCY STATE: ABSOLUTE</p>
      </div>

      {/* Back button */}
      <div className="mb-12">
        <button 
          onClick={() => { onNavigate("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="group flex items-center gap-2 text-xs font-semibold tracking-widest text-gold uppercase mb-8 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>{isUrdu ? "ہوم پیج پر واپس جائیں" : "Back to Home"}</span>
        </button>

        {/* Curatorial Header */}
        <span className="text-[10px] font-mono tracking-widest text-gold/60 uppercase block mb-2">
          {isUrdu ? "روزنامچہ ترقّی" : "THE CHRONOLOGY LOG"}
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-white font-light tracking-tight leading-tight mb-4">
          {isUrdu ? "نقشِ فریادی کا بلڈ لاگ" : "Sovereign Build Log"}
        </h1>
        <p className="max-w-2xl text-slate text-sm font-light leading-relaxed">
          {isUrdu 
            ? "ہمارے کام کا ایک شفاف اور ایماندرانہ ریکارڈ — بغیر کسی بناوٹ کے۔ ہم کیا پڑھ رہے ہیں، کیا کوڈ کر رہے ہیں، اور کمپنی کس مرحلے پر ہے۔"
            : "An uncompromised, honest ledger of exactly where we are standing — our daily technical victories, research failures, hiring states, and cloud compute grants."}
        </p>
      </div>

      {/* Filter and Ticker Controls */}
      <div className="border-y border-gold/15 py-6 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono text-slate flex items-center gap-1.5 mr-2">
            <Filter size={12} />
            <span>Filter Archive:</span>
          </span>
          {tags.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedTag(t.value)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono tracking-wide transition-all cursor-pointer ${
                selectedTag === t.value 
                  ? "bg-gold text-navy font-bold shadow-md shadow-gold/5" 
                  : "border border-gold/15 hover:border-gold/30 hover:bg-gold/5 text-slate hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-mono text-slate/55 flex items-center gap-1.5 md:text-right">
          <Eye size={12} className="text-gold" />
          <span>{rawLogs.length} Records Ledgered · {filteredLogs.length} Displayed</span>
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="relative pl-6 md:pl-10 space-y-12 pb-16">
        {/* Timeline main vertical ruler thread */}
        <div className="absolute top-4 bottom-4 left-[31px] md:left-[47px] w-px bg-gradient-to-b from-gold/50 via-gold/15 to-transparent" />

        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const { icon, color, text } = getTypeStyle(log.blockType);
            
            return (
              <div 
                key={log.id} 
                className="relative group transition-all duration-300 hover:translate-x-1"
              >
                {/* Timeline node icon */}
                <div className={`absolute -left-[31px] md:-left-[47px] top-1 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 shadow-lg ${color}`}>
                  {icon}
                </div>

                {/* Log card container */}
                <div className="p-6 md:p-8 border border-gold/15 bg-navy2/30 rounded-sm hover:border-gold/35 hover:bg-navy2/50 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Subtle technical corner line decoration */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold/10 group-hover:border-gold/30 transition-colors pointer-events-none" />

                  {/* Date & Type Tag */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-gold" />
                      <span>{formatDate(log.createdAt)}</span>
                    </span>
                    <span className="text-slate/30">•</span>
                    <span className="font-semibold text-gold tracking-widest uppercase">{text}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-lg md:text-xl text-white font-medium mb-3 group-hover:text-gold transition-colors">
                    {log.title}
                  </h3>

                  {/* Description / Content Body */}
                  <p className="text-cream2/90 text-xs md:text-sm font-light leading-relaxed mb-4 max-w-3xl">
                    {log.body}
                  </p>

                  {/* Flexible custom JSON data representations */}
                  {log.blockType === "funding_tracker" && log.data && (
                    <div className="my-4 p-4 bg-navy border border-gold/10 rounded max-w-sm flex items-center justify-between font-mono text-xs">
                      <div>
                        <span className="text-slate uppercase block text-[9px]">AGGREGATED</span>
                        <span className="text-gold font-semibold text-base">${log.data.raised}</span>
                      </div>
                      <div>
                        <span className="text-slate uppercase block text-[9px]">TARGET</span>
                        <span className="text-cream font-semibold text-base">${log.data.goal}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate uppercase block text-[9px]">PERCENTAGE</span>
                        <span className="text-emerald-400 font-bold text-base">
                          {Math.min(Math.round((log.data.raised / log.data.goal) * 100), 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {log.blockType === "research" && log.data && (
                    <div className="my-4 p-4 bg-navy border border-gold/10 rounded max-w-md text-xs space-y-1.5 font-mono text-slate">
                      <div className="flex justify-between">
                        <span>Authors:</span>
                        <span className="text-white font-serif">{log.data.authors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reference Year:</span>
                        <span className="text-white">{log.data.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subject Focus:</span>
                        <span className="text-gold uppercase">{log.data.tag}</span>
                      </div>
                    </div>
                  )}

                  {log.blockType === "partner_thanks" && log.data && (
                    <div className="my-4 p-4 bg-navy border border-gold/10 rounded max-w-sm text-xs font-mono flex items-center justify-between text-slate">
                      <div>
                        <span className="text-[9px] uppercase block">ORGANIZATION</span>
                        <span className="text-white font-serif font-semibold">{log.data.partnerName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase block">SUPPORT VALUE</span>
                        <span className="text-gold">{log.data.supportType}</span>
                      </div>
                    </div>
                  )}

                  {/* External links */}
                  {log.data?.url && (
                    <div className="pt-4 border-t border-gold/10 flex justify-end">
                      <a
                        href={log.data.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 font-mono text-[10px] text-gold hover:text-white transition-colors underline cursor-pointer"
                      >
                        <span>Inspect external document</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 border border-gold/15 bg-navy2/10 rounded-sm text-center">
            <p className="text-slate text-sm font-mono">No entries found matching the filter constraint.</p>
          </div>
        )}

      </div>
    </div>
  );
};

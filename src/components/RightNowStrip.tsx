import React from "react";
import { ContentBlock } from "../services/dbService";
import { Terminal, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

interface RightNowStripProps {
  contentBlocks: ContentBlock[];
  onNavigate: (view: "home" | "blog" | "build-log" | "research" | "admin") => void;
  isUrdu: boolean;
}

export const RightNowStrip: React.FC<RightNowStripProps> = ({
  contentBlocks,
  onNavigate,
  isUrdu,
}) => {
  // Find current build log entries (displayLocations: "build-log") or milestone
  const latestLogs = contentBlocks
    .filter((b) => b.blockType === "build-log" || b.blockType === "milestone")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3); // top 3 for the home page feed

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).toUpperCase();
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "milestone":
        return "text-[#ffb85e]";
      case "research":
        return "text-retro-cyan";
      default:
        return "text-retro-cyan";
    }
  };

  return (
    <section id="log" className="py-20 px-6 border-b border-retro-cyan/15 max-w-7xl mx-auto relative pointer-events-auto">
      {/* Vintage terminal scanline effect overlay */}
      <div className="absolute inset-0 bg-scanlines opacity-[0.02] pointer-events-none" />

      {/* Log Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <h2 className="font-archivo text-2xl md:text-3xl text-retro-white uppercase tracking-wider">
          {isUrdu ? "موجودہ صورتحال" : "Right now"}
        </h2>
        <div className="bg-retro-cyan/10 border border-retro-cyan px-3 py-1.5 font-pixel text-[8px] text-retro-cyan flex items-center gap-2 animate-blobpulse">
          <span className="w-1.5 h-1.5 bg-[#ff4b4b] rounded-full animate-blink" />
          <span>{isUrdu ? "بانی کی براہ راست معلومات" : "POSTED BY THE FOUNDER — NO PR TEAM"}</span>
        </div>
      </div>

      {/* Pill Feed */}
      <div className="flex flex-col gap-4">
        {latestLogs.length > 0 ? (
          latestLogs.map((log, idx) => (
            <motion.div
              key={log.id || idx}
              whileHover={{ scale: 1.008, borderColor: "rgba(94, 231, 255, 0.6)" }}
              transition={{ duration: 0.2 }}
              className="bg-retro-blue-deep border border-retro-cyan/30 p-6 flex flex-col md:flex-row gap-4 md:gap-8 relative overflow-hidden group shadow-lg"
            >
              <div className="font-pixel text-[9px] text-retro-cyan min-w-[140px] shrink-0 pt-1">
                {formatDate(log.createdAt)}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`font-plex font-semibold text-xs uppercase ${getCategoryColor(log.blockType)}`}>
                    {log.blockType}
                  </span>
                  <span className="text-[10px] text-retro-cyan/40 font-mono">ID: #NF-{idx + 1}</span>
                </div>
                <h4 className="font-space text-lg font-bold text-retro-white mb-2 group-hover:text-retro-cyan transition-colors">
                  {log.title}
                </h4>
                <p className="text-retro-white/85 text-xs md:text-sm leading-relaxed font-light">
                  {log.body}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 border border-dashed border-retro-cyan/20 text-center text-retro-cyan/60 font-mono text-xs">
            No live logs posted in the transparency log currently.
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onNavigate("build-log")}
          className="group font-mono text-xs text-retro-cyan hover:text-retro-white uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer underline decoration-retro-cyan/30 hover:decoration-retro-white"
        >
          <span>{isUrdu ? "مکمل ہسٹری دیکھیں" : "View Full Build Log"}</span>
          <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
};

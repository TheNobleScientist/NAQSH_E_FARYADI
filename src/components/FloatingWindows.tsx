import React from "react";
import { motion } from "motion/react";
import { X, Activity, Users, Award, ShieldAlert } from "lucide-react";
import { ContentBlock } from "../services/dbService";

interface FloatingWindowsProps {
  windowsState: {
    w1: boolean;
    w2: boolean;
    w3: boolean;
    w4: boolean;
  };
  setWindowsState: React.Dispatch<React.SetStateAction<{
    w1: boolean;
    w2: boolean;
    w3: boolean;
    w4: boolean;
  }>>;
  contentBlocks: ContentBlock[];
  isUrdu: boolean;
  onNavigate: (view: "home" | "blog" | "build-log" | "research" | "admin") => void;
  settled: boolean;
}

export const FloatingWindows: React.FC<FloatingWindowsProps> = ({
  windowsState,
  setWindowsState,
  contentBlocks,
  isUrdu,
  onNavigate,
  settled,
}) => {
  const closeWin = (win: "w1" | "w2" | "w3" | "w4") => {
    setWindowsState((prev) => ({ ...prev, [win]: false }));
  };

  // 1. Current Milestone Update
  const currentMilestone = contentBlocks
    .filter((b) => b.blockType === "milestone")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // 2. Hiring Status
  const hiringStatus = contentBlocks
    .filter((b) => b.blockType === "team")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  // 3. Grants Support
  const trackerBlock = contentBlocks.find((b) => b.blockType === "funding_tracker");
  const raised = trackerBlock?.data?.raised ?? 28500;
  const goal = trackerBlock?.data?.goal ?? 50000;
  const percent = Math.min(Math.round((raised / goal) * 100), 100);

  // Common styles for the retro window
  const windowClass = `fixed z-40 bg-retro-ink/90 backdrop-blur-md border-2 border-retro-cyan rounded shadow-[0_0_15px_rgba(94,231,255,0.25)] flex flex-col pointer-events-auto`;

  return (
    <>
      {/* WINDOW 1: MILESTONE.EXE */}
      {windowsState.w1 && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ x: "6%", y: "15vh" }}
          animate={settled ? {} : { y: ["15vh", "15.8vh", "15vh"] }}
          transition={settled ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`${windowClass} w-72 h-44`}
          id="w1"
          style={{ cursor: "grab" }}
          whileDrag={{ cursor: "grabbing", scale: 1.02 }}
        >
          {/* Header Bar */}
          <div className="bg-retro-blue-dark border-b-2 border-retro-cyan px-2.5 py-1.5 flex justify-between items-center select-none">
            <span className="font-pixel text-[9px] text-retro-cyan flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              MILESTONE.EXE
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => closeWin("w1")}
                className="w-4 h-4 bg-retro-cyan text-retro-ink font-bold text-[10px] flex items-center justify-center hover:bg-white active:bg-retro-cyan/70 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="p-3.5 flex-grow flex flex-col justify-between font-space text-xs">
            <div>
              <div className="text-[10px] font-pixel text-retro-cyan mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Activity size={10} />
                <span>Active Beacon</span>
              </div>
              <p className="text-retro-white font-medium line-clamp-2">
                {currentMilestone ? currentMilestone.title : (isUrdu ? "عمارتی لاجک متحرک ہے" : "Text-to-BIM Engine v1.2 Live")}
              </p>
            </div>
            <div className="border-t border-retro-cyan/20 pt-2 flex items-center justify-between text-[10px] text-retro-cyan/85">
              <span>Core-01 Node: Karachi</span>
              <button 
                onClick={() => onNavigate("build-log")} 
                className="hover:underline text-retro-cyan uppercase font-bold"
              >
                Logs →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* WINDOW 2: HIRING.SYS */}
      {windowsState.w2 && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ x: "72%", y: "18vh" }}
          animate={settled ? {} : { y: ["18vh", "17.2vh", "18vh"] }}
          transition={settled ? {} : { duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          className={`${windowClass} w-72 h-44`}
          id="w2"
          style={{ cursor: "grab" }}
          whileDrag={{ cursor: "grabbing", scale: 1.02 }}
        >
          {/* Header Bar */}
          <div className="bg-retro-blue-dark border-b-2 border-retro-cyan px-2.5 py-1.5 flex justify-between items-center select-none">
            <span className="font-pixel text-[9px] text-retro-cyan flex items-center gap-1.5">
              <Users size={11} className="text-retro-cyan" />
              HIRING.SYS
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => closeWin("w2")}
                className="w-4 h-4 bg-retro-cyan text-retro-ink font-bold text-[10px] flex items-center justify-center hover:bg-white active:bg-retro-cyan/70 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="p-3.5 flex-grow flex flex-col justify-between font-space text-xs">
            <div>
              <div className="text-[10px] font-pixel text-retro-cyan mb-1.5 uppercase tracking-wide">
                Human Capital
              </div>
              <p className="text-retro-white font-medium line-clamp-2">
                {hiringStatus ? hiringStatus.title : (isUrdu ? "ٹیکنیکل شریک بانی درکار ہے" : "Looking for Technical Co-Founder")}
              </p>
            </div>
            <div className="border-t border-retro-cyan/20 pt-2 flex items-center justify-between text-[10px] text-retro-cyan/85">
              <span>Karachi / Hybrid</span>
              <button 
                onClick={() => {
                  onNavigate("home");
                  setTimeout(() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" }), 150);
                }} 
                className="hover:underline text-retro-cyan uppercase font-bold"
              >
                Apply →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* WINDOW 3: GRANTS.DLL */}
      {windowsState.w3 && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ x: "8%", y: "55vh" }}
          animate={settled ? {} : { y: ["55vh", "54.2vh", "55vh"] }}
          transition={settled ? {} : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className={`${windowClass} w-72 h-44`}
          id="w3"
          style={{ cursor: "grab" }}
          whileDrag={{ cursor: "grabbing", scale: 1.02 }}
        >
          {/* Header Bar */}
          <div className="bg-retro-blue-dark border-b-2 border-retro-cyan px-2.5 py-1.5 flex justify-between items-center select-none">
            <span className="font-pixel text-[9px] text-retro-cyan flex items-center gap-1.5">
              <Award size={11} className="text-retro-cyan" />
              GRANTS.DLL
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => closeWin("w3")}
                className="w-4 h-4 bg-retro-cyan text-retro-ink font-bold text-[10px] flex items-center justify-center hover:bg-white active:bg-retro-cyan/70 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="p-3.5 flex-grow flex flex-col justify-between font-space text-xs">
            <div>
              <div className="text-[10px] font-pixel text-retro-cyan mb-1.5 uppercase tracking-wide">
                Financials
              </div>
              <div className="text-retro-white font-medium flex justify-between items-end mb-1">
                <span>Raised: ${raised.toLocaleString()}</span>
                <span className="text-[10px] text-retro-cyan">{percent}%</span>
              </div>
              {/* Progress Bar */}
              <div className="h-2 w-full bg-retro-blue-dark border border-retro-cyan/45 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-retro-cyan animate-shimmer" 
                  style={{ 
                    width: `${percent}%`,
                    backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)"
                  }}
                />
              </div>
            </div>
            <div className="border-t border-retro-cyan/20 pt-2 flex items-center justify-between text-[10px] text-retro-cyan/85">
              <span>Goal: ${goal.toLocaleString()}</span>
              <button 
                onClick={() => {
                  onNavigate("home");
                  setTimeout(() => document.getElementById("support")?.scrollIntoView({ behavior: "smooth" }), 150);
                }} 
                className="hover:underline text-retro-cyan uppercase font-bold"
              >
                Tracker →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* WINDOW 4: GHALIB.TXT */}
      {windowsState.w4 && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ x: "70%", y: "52vh" }}
          animate={settled ? {} : { y: ["52vh", "52.8vh", "52vh"] }}
          transition={settled ? {} : { duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          className={`${windowClass} w-72 h-44`}
          id="w4"
          style={{ cursor: "grab" }}
          whileDrag={{ cursor: "grabbing", scale: 1.02 }}
        >
          {/* Header Bar */}
          <div className="bg-retro-blue-dark border-b-2 border-retro-cyan px-2.5 py-1.5 flex justify-between items-center select-none">
            <span className="font-pixel text-[9px] text-retro-cyan flex items-center gap-1.5">
              <ShieldAlert size={11} className="text-retro-cyan" />
              GHALIB.TXT
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => closeWin("w4")}
                className="w-4 h-4 bg-retro-cyan text-retro-ink font-bold text-[10px] flex items-center justify-center hover:bg-white active:bg-retro-cyan/70 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="p-3 flex-grow flex items-center gap-3 font-space text-xs select-none">
            {/* Beautiful SVG Etch Bust */}
            <div className="shrink-0">
              <svg className="w-14 h-16 text-retro-cyan opacity-85 hover:opacity-100 transition-opacity" viewBox="0 0 64 74">
                <defs><clipPath id="bustclip"><ellipse cx="32" cy="26" rx="17" ry="20"/></clipPath></defs>
                <ellipse cx="32" cy="26" rx="17" ry="20" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                <g clipPath="url(#bustclip)" stroke="currentColor" strokeWidth="0.5" opacity="0.8">
                  <line x1="16" y1="10" x2="16" y2="42"/><line x1="19" y1="8" x2="19" y2="44"/><line x1="22" y1="7" x2="22" y2="45"/>
                  <line x1="25" y1="6" x2="25" y2="46"/><line x1="28" y1="6" x2="28" y2="46"/><line x1="31" y1="7" x2="31" y2="45"/>
                  <line x1="34" y1="8" x2="34" y2="44"/><line x1="37" y1="10" x2="37" y2="42"/><line x1="40" y1="14" x2="40" y2="38"/>
                  <line x1="43" y1="18" x2="43" y2="34"/><line x1="46" y1="22" x2="46" y2="30"/>
                </g>
                <path d="M18 12 Q32 4 46 12" fill="none" stroke="currentColor" strokeWidth="1"/>
                <path d="M15 40 Q32 58 49 40 L49 62 Q32 70 15 62 Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                <circle cx="26" cy="27" r="1" fill="currentColor"/><circle cx="38" cy="27" r="1" fill="currentColor"/>
                <path d="M28 33 Q32 36 36 33" fill="none" stroke="currentColor" strokeWidth="0.7"/>
              </svg>
            </div>
            <div className="flex-grow flex flex-col justify-center text-right">
              <p className="font-serif italic text-retro-cyan text-[11px] leading-relaxed mb-1" dir="rtl">
                نقش فریادی ہے کس کی شوخیِ تحریر کا<br />
                کاغذی ہے پیرہن ہر پیکرِ تصویر کا
              </p>
              <p className="text-[8px] text-retro-cyan/60 font-mono tracking-wider">
                — DIVAN-E-GHALIB, GHALIB-01
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

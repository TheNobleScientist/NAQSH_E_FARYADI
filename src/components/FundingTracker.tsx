import React from "react";
import { ContentBlock } from "../services/dbService";
import { Award, ShieldCheck, Heart } from "lucide-react";
import { motion } from "motion/react";

interface FundingTrackerProps {
  contentBlocks: ContentBlock[];
  isUrdu: boolean;
}

export const FundingTracker: React.FC<FundingTrackerProps> = ({ contentBlocks, isUrdu }) => {
  // Find primary funding tracker block
  const trackerBlock = contentBlocks.find((b) => b.blockType === "funding_tracker");
  
  // Find partner thanks blocks
  const partners = contentBlocks.filter((b) => b.blockType === "partner_thanks");

  // Fallback values
  const raised = trackerBlock?.data?.raised ?? 28500;
  const goal = trackerBlock?.data?.goal ?? 50000;
  const currency = trackerBlock?.data?.currency ?? "USD";
  const percentage = Math.min(Math.round((raised / goal) * 100), 100);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section id="support" className="py-20 px-6 border-b border-retro-cyan/15 max-w-7xl mx-auto relative pointer-events-auto">
      {/* Background blueprint grid decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="support-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#5EE7FF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#support-grid)" />
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
        
        {/* Left Column: Progress Meter */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-[10px] font-pixel text-retro-cyan/60 uppercase block mb-2 tracking-widest">
              {isUrdu ? "شفاف مالیات" : "Financial Transparency"}
            </span>
            <h2 className="font-archivo text-2xl md:text-3xl text-retro-white uppercase tracking-wider mb-4">
              {isUrdu ? "ترقیاتی فنڈنگ ٹریکر" : "Funded in the open"}
            </h2>
            <p className="text-retro-white/75 text-xs md:text-sm font-light leading-relaxed">
              {trackerBlock?.body || (isUrdu 
                ? "پاکستان کا پہلا اور سب سے بڑا عمارتی ماڈلنگ لاجک ٹول تیار کرنے کے لیے مالی معاونت۔ ہم غیر منصفانہ اور مصلحتی سرمایہ کاری قبول نہیں کرتے۔" 
                : "No institutional venture capital. No board seat control. We aggregate public compute grants, sovereign research awards, and developer support to build the future of South Asian computational spatial intelligence on our own terms.")}
            </p>
          </div>

          {/* Retro styled Progress Box */}
          <div className="p-6 border-2 border-retro-cyan bg-retro-ink/80 rounded relative overflow-hidden shadow-[0_0_15px_rgba(94,231,255,0.15)]">
            <div className="absolute top-2 right-2 p-1 text-[8px] font-pixel text-retro-cyan/40">
              LEDGER_ID: #NF-F1
            </div>

            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <div>
                <span className="text-[9px] font-pixel text-retro-cyan/60 block mb-1">SUPPORT RECEIVED</span>
                <span className="font-space text-2xl md:text-3xl font-bold text-retro-white">{formatCurrency(raised)}</span>
                <span className="text-xs text-retro-cyan font-mono ml-1">/{currency}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-[9px] font-pixel text-retro-cyan/60 block mb-1">PHASE 1 TARGET</span>
                <span className="font-space text-base md:text-lg text-retro-white font-bold">{formatCurrency(goal)}</span>
              </div>
            </div>

            {/* Retro progress bar with texture */}
            <div className="relative mb-2">
              <div className="h-6 w-full bg-retro-blue-dark border border-retro-cyan/40 rounded overflow-hidden flex items-center relative">
                <div 
                  className="h-full bg-retro-cyan animate-shimmer"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)"
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-pixel text-[8px] font-bold text-retro-ink z-10">
                  {percentage}% FUNDED
                </span>
              </div>

              {/* Ticks */}
              <div className="flex justify-between text-[8px] font-mono text-retro-cyan/60 mt-1.5 px-0.5">
                <span>0.0K</span>
                <span>12.5K</span>
                <span>25.0K</span>
                <span>37.5K</span>
                <span>50.0K (GOAL)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-retro-cyan/15 flex items-start gap-2.5 mt-4">
              <ShieldCheck className="text-retro-cyan shrink-0 mt-0.5" size={15} />
              <p className="text-[10px] text-retro-white/60 leading-relaxed font-mono">
                <strong>Sovereignty Clause:</strong> Resources consist entirely of cloud grants, compute credits, and research awards. No equity in Naqsh e Faryadi has been bartered or sold.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Partners Logo / Tags Grid */}
        <div className="lg:col-span-6 space-y-6 lg:pl-6">
          <div>
            <span className="text-[10px] font-pixel text-retro-cyan/6 block mb-2 tracking-widest">
              {isUrdu ? "تعاون کنندگان" : "Academic & Compute backing"}
            </span>
            <h3 className="font-space text-lg font-bold text-retro-white">
              {isUrdu ? "تیکنیکی تعاون کرنے والے" : "Applied Credits & Infrastructure"}
            </h3>
            <p className="text-retro-white/70 text-xs md:text-sm font-light mt-2 leading-relaxed">
              We owe our computational cycles to programs that provide pure, high-performance compute grants to skip over the heavy costs of hardware.
            </p>
          </div>

          {/* Grid of Custom Tag Pills */}
          <div className="flex flex-wrap gap-2.5">
            {partners.length > 0 ? (
              partners.map((partner, idx) => (
                <div 
                  key={partner.id || idx} 
                  className="bg-retro-blue-deep/50 border border-retro-cyan/30 px-3.5 py-2 flex flex-col gap-1 hover:border-retro-cyan transition-all text-left shadow-md shrink-0 w-[48%]"
                >
                  <span className="font-pixel text-[8px] text-retro-cyan uppercase">{partner.data?.partnerName || partner.title}</span>
                  <span className="text-[9px] text-retro-white/70 font-mono line-clamp-1">{partner.body}</span>
                </div>
              ))
            ) : (
              <>
                <div className="bg-retro-blue-deep/50 border border-retro-cyan/30 p-3 flex flex-col gap-1 hover:border-retro-cyan transition-all text-left shadow-md w-[48%]">
                  <span className="font-pixel text-[7.5px] text-retro-cyan uppercase">MICROSOFT AZURE</span>
                  <span className="text-[9px] text-retro-white/70 font-mono">$150,000 FOUNDER CREDITS</span>
                </div>
                <div className="bg-retro-blue-deep/50 border border-retro-cyan/30 p-3 flex flex-col gap-1 hover:border-retro-cyan transition-all text-left shadow-md w-[48%]">
                  <span className="font-pixel text-[7.5px] text-retro-cyan uppercase">NVIDIA INCEPTION</span>
                  <span className="text-[9px] text-retro-white/70 font-mono">GPU ARCHITECTURE COMPUTE</span>
                </div>
                <div className="bg-retro-blue-deep/50 border border-retro-cyan/30 p-3 flex flex-col gap-1 hover:border-retro-cyan transition-all text-left shadow-md w-[48%]">
                  <span className="font-pixel text-[7.5px] text-retro-cyan uppercase">CLOUDRIFT SOVEREIGN</span>
                  <span className="text-[9px] text-retro-white/70 font-mono">2x H100 GPU DEPLOYMENT</span>
                </div>
                <div className="bg-retro-blue-deep/50 border border-retro-cyan/30 p-3 flex flex-col gap-1 hover:border-retro-cyan transition-all text-left shadow-md w-[48%]">
                  <span className="font-pixel text-[7.5px] text-retro-cyan uppercase">PM CLOUD FUND</span>
                  <span className="text-[9px] text-retro-white/70 font-mono">RESEARCH FELLOW FELLOWSHIP</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-retro-white/50 font-mono bg-retro-cyan/5 border border-retro-cyan/10 py-3 px-4 rounded">
            <Heart size={11} className="text-retro-cyan shrink-0 animate-pulse fill-retro-cyan/10" />
            <span>We operate entirely off-grid from traditional VC metrics, ensuring absolute devotion to raw design accuracy and topological truth.</span>
          </div>
        </div>

      </div>
    </section>
  );
};

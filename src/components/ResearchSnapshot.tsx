import React from "react";
import { ContentBlock } from "../services/dbService";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { motion } from "motion/react";

interface ResearchSnapshotProps {
  contentBlocks: ContentBlock[];
  onNavigate: (view: "home" | "blog" | "build-log" | "research" | "admin") => void;
  isUrdu: boolean;
}

export const ResearchSnapshot: React.FC<ResearchSnapshotProps> = ({
  contentBlocks,
  onNavigate,
  isUrdu,
}) => {
  // Query 3 research blocks
  const researchItems = contentBlocks
    .filter((b) => b.blockType === "research")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 3); // top 3 for clean snapshot display

  const getStatusColor = (status: string) => {
    switch (status) {
      case "implemented":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "reading":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      default:
        return "bg-retro-cyan/10 text-retro-cyan border-retro-cyan/30";
    }
  };

  return (
    <section id="research" className="py-20 px-6 border-b border-retro-cyan/15 max-w-7xl mx-auto relative pointer-events-auto">
      {/* Background Engraving watermark */}
      <div className="absolute right-6 bottom-6 w-72 h-72 opacity-[0.025] pointer-events-none select-none text-retro-cyan">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
          <circle cx="50" cy="50" r="45" />
          <polygon points="50,5 95,50 50,95 5,50" />
          <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 border-b border-retro-cyan/15 pb-6">
        <div>
          <span className="text-[10px] font-pixel text-retro-cyan/60 tracking-widest block mb-2 uppercase">
            {isUrdu ? "تعلیمی کتب خانہ" : "Research & treatises"}
          </span>
          <h2 className="font-archivo text-2xl md:text-3xl text-retro-white uppercase">
            {isUrdu ? "تحقیقاتی ریکارڈ" : "Built on the record"}
          </h2>
          <p className="max-w-xl text-retro-white/70 text-xs md:text-sm mt-3 font-light leading-relaxed">
            {isUrdu 
              ? "ہمارا پورا عمارتی انجن تعلیمی اور سائنسی مقالات کی بنیاد پر تخلیق کیا گیا ہے۔"
              : "Every core topological path we compile is mapped directly to academic precedent. Here is what we are reading."}
          </p>
        </div>

        <button
          onClick={() => {
            onNavigate("research");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="group text-[10px] font-pixel text-retro-cyan hover:text-retro-white uppercase tracking-widest bg-retro-cyan/5 border border-retro-cyan/20 hover:border-retro-cyan px-4 py-2.5 transition-all cursor-pointer shrink-0"
        >
          <span>{isUrdu ? "مکمل ریسرچ لائبریری" : "View full library →"}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {researchItems.length > 0 ? (
          researchItems.map((item, idx) => {
            const authors = item.data?.authors ?? "Authors unknown";
            const year = item.data?.year ?? 2026;
            const tag = item.data?.tag ?? "Text-to-BIM";
            const status = item.data?.status ?? "reading";
            const url = item.data?.url ?? "#";

            return (
              <motion.div 
                key={item.id || idx} 
                whileHover={{ y: -4, borderColor: "rgba(94,231,255,0.55)" }}
                transition={{ duration: 0.2 }}
                className="p-6 border border-retro-cyan/20 bg-retro-blue-deep/60 flex flex-col justify-between h-[310px] relative group shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-pixel text-retro-cyan tracking-widest uppercase border border-retro-cyan/25 px-1.5 py-0.5 bg-retro-cyan/5">
                      {tag}
                    </span>
                    <span className={`text-[8px] font-pixel tracking-wider uppercase px-2 py-0.5 border ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>

                  <h3 className="font-space text-base text-retro-white font-bold line-clamp-2 leading-snug group-hover:text-retro-cyan transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-[10px] font-mono text-retro-cyan/80 mt-1.5 font-semibold">
                    {authors} · {year}
                  </p>

                  <p className="text-retro-white/75 text-xs font-light leading-relaxed mt-3 line-clamp-4">
                    {item.body}
                  </p>
                </div>

                <div className="pt-3 border-t border-retro-cyan/15 mt-3 flex justify-between items-center text-[10px] font-mono">
                  <span className="text-retro-cyan/40">REF_SPEC: #{idx + 1}0{year % 100}</span>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-retro-cyan hover:text-retro-white flex items-center gap-1 transition-colors underline cursor-pointer font-bold"
                  >
                    <span>Read paper</span>
                    <ArrowUpRight size={10} />
                  </a>
                </div>
              </motion.div>
            );
          })
        ) : (
          <>
            {/* Backups if empty */}
            <div className="p-6 border border-retro-cyan/20 bg-retro-blue-deep/60 flex flex-col justify-between h-[310px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-pixel text-retro-cyan border border-retro-cyan/25 px-1.5 py-0.5 bg-retro-cyan/5">TEXT-TO-BIM</span>
                  <span className="text-[8px] font-pixel text-emerald-400 border border-emerald-500/30 px-2 py-0.5 bg-emerald-500/5">IMPLEMENTED</span>
                </div>
                <h3 className="font-space text-base text-retro-white font-bold">CubiASA: Floor Plan Parsing</h3>
                <p className="text-[10px] font-mono text-retro-cyan/80 mt-1.5">A. Kalervo, et al. · 2019</p>
                <p className="text-retro-white/75 text-xs mt-3 leading-relaxed">Analyzing deep floor plan parsing structures to map traditional subcontinental space labels.</p>
              </div>
              <div className="text-[10px] text-retro-cyan/40 font-mono">REF_SPEC: #01</div>
            </div>
            <div className="p-6 border border-retro-cyan/20 bg-retro-blue-deep/60 flex flex-col justify-between h-[310px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-pixel text-retro-cyan border border-retro-cyan/25 px-1.5 py-0.5 bg-retro-cyan/5">AGENT LAYOUTS</span>
                  <span className="text-[8px] font-pixel text-emerald-400 border border-emerald-500/30 px-2 py-0.5 bg-emerald-500/5">IMPLEMENTED</span>
                </div>
                <h3 className="font-space text-base text-retro-white font-bold">House-GAN: Relational Layouts</h3>
                <p className="text-[10px] font-mono text-retro-cyan/80 mt-1.5">N. Nauata, et al. · 2020</p>
                <p className="text-retro-white/75 text-xs mt-3 leading-relaxed">GCN modeling informing how we secure the cultural Zanana versus public Baithak privacy lines.</p>
              </div>
              <div className="text-[10px] text-retro-cyan/40 font-mono">REF_SPEC: #02</div>
            </div>
            <div className="p-6 border border-retro-cyan/20 bg-retro-blue-deep/60 flex flex-col justify-between h-[310px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-pixel text-retro-cyan border border-retro-cyan/25 px-1.5 py-0.5 bg-retro-cyan/5">IFC TOOLING</span>
                  <span className="text-[8px] font-pixel text-amber-300 border border-amber-500/30 px-2 py-0.5 bg-amber-500/5">READING</span>
                </div>
                <h3 className="font-space text-base text-retro-white font-bold">3D-FRONT: Indoor Scene Dataset</h3>
                <p className="text-[10px] font-mono text-retro-cyan/80 mt-1.5">H. Fu, et al. · 2021</p>
                <p className="text-retro-white/75 text-xs mt-3 leading-relaxed">Crucial corridor geometries helping us calculate real-world subcontinental clearance pathways.</p>
              </div>
              <div className="text-[10px] text-retro-cyan/40 font-mono">REF_SPEC: #03</div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

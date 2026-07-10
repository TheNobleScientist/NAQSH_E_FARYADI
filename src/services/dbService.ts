import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp 
} from "firebase/firestore";
import { db, auth } from "../firebase";

export interface ContentBlock {
  id?: string;
  blockType: string; // e.g., "research", "funding_tracker", "partner_thanks", "milestone", "team", "general"
  title: string;
  body: string;
  data?: {
    raised?: number;
    goal?: number;
    currency?: string;
    authors?: string;
    year?: number;
    url?: string;
    tag?: string;
    status?: "reading" | "implemented" | "reference only";
    partnerName?: string;
    supportType?: string;
    logoUrl?: string;
  };
  displayLocations: string[]; // e.g., ["homepage", "build-log", "research"]
  order: number;
  createdAt: string; // ISO string
}

export interface CeoTask {
  id?: string;
  title: string;
  notes?: string;
  status: "To Do" | "In Progress" | "Done";
  order: number;
  createdAt: string; // ISO string
}

const BLOCKS_COLL = "contentBlocks";
const TASKS_COLL = "ceoTasks";

// Seed initial content blocks if database is empty
export async function seedInitialContentBlocks() {
  try {
    const colRef = collection(db, BLOCKS_COLL);
    const snap = await getDocs(query(colRef, limit(1)));
    if (!snap.empty) {
      console.log("Database already has content blocks. Skipping seeding.");
      return;
    }

    if (auth.currentUser?.email !== "muhammadzainb@gmail.com") {
      console.log("Not admin. Skipping seeding writes.");
      return;
    }

    console.log("Seeding initial professional content blocks...");

    const initialBlocks: Omit<ContentBlock, "id">[] = [
      {
        blockType: "funding_tracker",
        title: "Phase 1 Support Tracker: Regional AI Core",
        body: "Funding and credit aggregation dedicated to compiling Pakistan's first massive structural municipal floor plan dataset and training our subcontinental spatial zoning models.",
        data: {
          raised: 28500,
          goal: 50000,
          currency: "USD"
        },
        displayLocations: ["homepage", "build-log"],
        order: 1,
        createdAt: "2026-07-01T10:00:00.000Z"
      },
      {
        blockType: "milestone",
        title: "Dual-Brain Architecture Engine Operational",
        body: "We successfully separated topological graph planning (Brain One, our custom LLM-based reasoning block) from coordinate-precise drafting (Brain Two, our procedural parametric BIM modeler). Both brains operate seamlessly in under 3-second latency constraints.",
        displayLocations: ["homepage", "build-log"],
        order: 2,
        createdAt: "2026-07-08T09:30:00.000Z"
      },
      {
        blockType: "research",
        title: "CubiASA: Automatic Room Layout Reconstruction from Floor Plans",
        body: "Our team utilizes CubiASA's advanced layout parsing annotations as a training reference. We are actively mapping local Pakistani layout terminologies (Baithak, Sahan, Aangan) to expand this dataset into South Asia.",
        data: {
          authors: "A. Kalervo, et al.",
          year: 2019,
          url: "https://arxiv.org/abs/1904.02022",
          tag: "Text-to-BIM",
          status: "implemented"
        },
        displayLocations: ["homepage", "research"],
        order: 3,
        createdAt: "2026-07-03T14:20:00.000Z"
      },
      {
        blockType: "research",
        title: "House-GAN: Relational Layout Generation via Graph Convolutional Networks",
        body: "GCN-based layouts enable structural relationship modeling. This directly informs how our dual-brain model manages subcontinental privacy boundaries (the Zanana family zone versus the outer public Baithak).",
        data: {
          authors: "N. Nauata, et al.",
          year: 2020,
          url: "https://arxiv.org/abs/2003.06988",
          tag: "Agent Architecture",
          status: "implemented"
        },
        displayLocations: ["research"],
        order: 4,
        createdAt: "2026-07-04T11:00:00.000Z"
      },
      {
        blockType: "research",
        title: "3D-FRONT: 3D Indoor Scene Dataset",
        body: "Provides crucial indoor layouts for procedural architectural modeling. We are analyzing standard furniture clearances and corridor pathways to map realistic local spaces.",
        data: {
          authors: "H. Fu, et al.",
          year: 2021,
          url: "https://arxiv.org/abs/2011.09127",
          tag: "IFC Tooling",
          status: "reading"
        },
        displayLocations: ["research"],
        order: 5,
        createdAt: "2026-07-05T08:15:00.000Z"
      },
      {
        blockType: "partner_thanks",
        title: "NVIDIA Inception Support",
        body: "Naqsh e Faryadi has been welcomed into the NVIDIA Inception program. This supplies critical GPU compute credits for deep-learning training on spatial layout graph convolutional networks.",
        data: {
          partnerName: "NVIDIA",
          supportType: "Compute / Inception Program",
          logoUrl: "nvidia"
        },
        displayLocations: ["homepage"],
        order: 6,
        createdAt: "2026-07-06T12:00:00.000Z"
      },
      {
        blockType: "partner_thanks",
        title: "Microsoft Founders Hub",
        body: "Recipient of Azure server grants, empowering our live reasoning APIs and backend parametric IFC compiling processes.",
        data: {
          partnerName: "Microsoft",
          supportType: "Cloud Infrastructure Grant",
          logoUrl: "microsoft"
        },
        displayLocations: ["homepage"],
        order: 7,
        createdAt: "2026-07-02T10:00:00.000Z"
      },
      {
        blockType: "team",
        title: "Seeking Co-Founder / Lead Computational Architect",
        body: "We are actively recruiting a technical co-founder based in Pakistan with strong expertise in computational geometry, IFC schemas, and GNNs, eager to revolutionize the AEC industry from Lahore, Karachi, or Islamabad.",
        displayLocations: ["homepage", "build-log"],
        order: 8,
        createdAt: "2026-07-09T14:00:00.000Z"
      }
    ];

    for (const block of initialBlocks) {
      await addDoc(colRef, block);
    }
    console.log("Seeding content blocks complete!");
  } catch (err) {
    console.error("Error seeding content blocks:", err);
  }
}

// Seed initial CEO tasks if database is empty
export async function seedInitialCeoTasks() {
  try {
    const colRef = collection(db, TASKS_COLL);
    const snap = await getDocs(query(colRef, limit(1)));
    if (!snap.empty) return;

    if (auth.currentUser?.email !== "muhammadzainb@gmail.com") {
      console.log("Not admin. Skipping seeding private tasks.");
      return;
    }

    console.log("Seeding initial private CEO tasks...");
    const initialTasks: Omit<CeoTask, "id">[] = [
      {
        title: "Incorporate Private Limited in SECP (Complete filings)",
        notes: "Submit final digital articles of association and corporate registry forms to SECP.",
        status: "In Progress",
        order: 1,
        createdAt: "2026-07-01T10:00:00.000Z"
      },
      {
        title: "Validate SBCA structural clearance rule algorithm",
        notes: "Integrate Sindh Building Control Authority set-back rules into the compliance checker.",
        status: "In Progress",
        order: 2,
        createdAt: "2026-07-03T11:00:00.000Z"
      },
      {
        title: "Initiate pilot talks with top 3 Karachi architecture firms",
        notes: "Schedule demo sessions showcasing dual-brain parametric text-to-BIM capability.",
        status: "To Do",
        order: 3,
        createdAt: "2026-07-05T09:00:00.000Z"
      },
      {
        title: "Setup Google OAuth and Firestore configuration",
        notes: "Connect dev and production databases to persistent cloud storage.",
        status: "Done",
        order: 4,
        createdAt: "2026-07-09T14:00:00.000Z"
      }
    ];

    for (const task of initialTasks) {
      await addDoc(colRef, task);
    }
    console.log("Seeding CEO tasks complete!");
  } catch (err) {
    console.error("Error seeding CEO tasks:", err);
  }
}

// Fetch all Content Blocks
export async function fetchAllContentBlocks(): Promise<ContentBlock[]> {
  try {
    const colRef = collection(db, BLOCKS_COLL);
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ContentBlock[];
  } catch (err) {
    console.error("Error fetching content blocks:", err);
    return [];
  }
}

// Save or Update Content Block
export async function saveContentBlock(block: Omit<ContentBlock, "id">, id?: string): Promise<string> {
  const colRef = collection(db, BLOCKS_COLL);
  if (id) {
    const docRef = doc(db, BLOCKS_COLL, id);
    await updateDoc(docRef, { ...block });
    return id;
  } else {
    const docRef = await addDoc(colRef, block);
    return docRef.id;
  }
}

// Delete Content Block
export async function deleteContentBlock(id: string): Promise<void> {
  const docRef = doc(db, BLOCKS_COLL, id);
  await deleteDoc(docRef);
}

// Fetch CEO Tasks
export async function fetchCeoTasks(): Promise<CeoTask[]> {
  try {
    const colRef = collection(db, TASKS_COLL);
    const q = query(colRef, orderBy("order", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CeoTask[];
  } catch (err) {
    console.error("Error fetching CEO tasks:", err);
    return [];
  }
}

// Save or Update CEO Task
export async function saveCeoTask(task: Omit<CeoTask, "id">, id?: string): Promise<string> {
  const colRef = collection(db, TASKS_COLL);
  if (id) {
    const docRef = doc(db, TASKS_COLL, id);
    await updateDoc(docRef, { ...task });
    return id;
  } else {
    const docRef = await addDoc(colRef, task);
    return docRef.id;
  }
}

// Delete CEO Task
export async function deleteCeoTask(id: string): Promise<void> {
  const docRef = doc(db, TASKS_COLL, id);
  await deleteDoc(docRef);
}

// ── EXTENSIVE CMS SETTINGS AND PAGES DATA MODEL ──

export interface CustomPage {
  slug: string;
  titleEn: string;
  titleUr: string;
  contentEn: string;
  contentUr: string;
}

export interface SiteSettings {
  id?: string;
  heroTitleEn: string;
  heroTitleUr: string;
  heroSubtitleEn: string;
  heroSubtitleUr: string;
  tickerEn: string;
  topBannerEn: string;
  topBannerUr: string;
  showTopBanner: boolean;
  pages: CustomPage[];
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroTitleEn: "you type it it builds",
  heroTitleUr: "فنِ تعمیر، مشینوں کی فہم میں۔",
  heroSubtitleEn: "We build AI systems that generate, evaluate, and iterate architectural designs — from a single line of text to a valid, fully coordinated parametric BIM model. Trained the way architects learn: point, line, plane, space, human.",
  heroSubtitleUr: "ہم ایسے مصنوعی ذہانت کے سسٹمز بناتے ہیں جو فنِ تعمیر کے ڈیزائن تخلیق اور ان کا جائزہ لیتے ہیں — ایک سادہ جملے سے لے کر ایک مکمل باضابطہ بیم ماڈل تک۔ عمارتی اصولوں کے عین مطابق۔",
  tickerEn: "NAQSH_E_FARYADI // TEXT_TO_BIM_SYSTEM // CORE_ENGINE_V1.2_ACTIVE // EST_2026 // KARACHI_PAKISTAN // SEED_LOGS_COMPILED //",
  topBannerEn: "ALERT: Phase 2 subcontinental zoning models are now in closed beta testing.",
  topBannerUr: "اطلاع: فیز ۲ برصغیر زوننگ ماڈلز اب بند بیٹا ٹیسٹنگ میں ہیں۔",
  showTopBanner: true,
  pages: []
};

import { getDoc, setDoc } from "firebase/firestore";

const SETTINGS_COLL = "siteSettings";
const SETTINGS_DOC_ID = "global_v1";

// Fetch Site Settings
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLL, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return { 
        id: snap.id, 
        heroTitleEn: data.heroTitleEn || DEFAULT_SITE_SETTINGS.heroTitleEn,
        heroTitleUr: data.heroTitleUr || DEFAULT_SITE_SETTINGS.heroTitleUr,
        heroSubtitleEn: data.heroSubtitleEn || DEFAULT_SITE_SETTINGS.heroSubtitleEn,
        heroSubtitleUr: data.heroSubtitleUr || DEFAULT_SITE_SETTINGS.heroSubtitleUr,
        tickerEn: data.tickerEn || DEFAULT_SITE_SETTINGS.tickerEn,
        topBannerEn: data.topBannerEn || DEFAULT_SITE_SETTINGS.topBannerEn,
        topBannerUr: data.topBannerUr || DEFAULT_SITE_SETTINGS.topBannerUr,
        showTopBanner: typeof data.showTopBanner === "boolean" ? data.showTopBanner : DEFAULT_SITE_SETTINGS.showTopBanner,
        pages: data.pages || []
      } as SiteSettings;
    } else {
      return DEFAULT_SITE_SETTINGS;
    }
  } catch (err) {
    console.error("Error fetching site settings, falling back to defaults:", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

// Save Site Settings
export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const docRef = doc(db, SETTINGS_COLL, SETTINGS_DOC_ID);
  const { id, ...dataToSave } = settings;
  await setDoc(docRef, dataToSave);
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with lazy check to avoid crashing if API Key is missing
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Preset designs for architecture engine
const presets = {
  studio: {
    rooms: [
      { name: "Living & Sleeping Area", x: 0.5, y: 0.5, width: 7.0, height: 6.0, color: "indigo" },
      { name: "Kitchenette", x: 8.0, y: 0.5, width: 3.5, height: 3.5, color: "emerald" },
      { name: "Bathroom", x: 8.0, y: 4.5, width: 3.5, height: 3.0, color: "blue" },
      { name: "Balcony", x: 0.5, y: 7.0, width: 7.0, height: 2.0, color: "teal" }
    ],
    doors: [
      { x: 8.0, y: 1.5, isVertical: true, targetRoom: "Kitchenette" },
      { x: 8.0, y: 5.5, isVertical: true, targetRoom: "Bathroom" },
      { x: 3.5, y: 6.5, isVertical: false, targetRoom: "Balcony" }
    ],
    windows: [
      { x: 0.5, y: 3.0, isVertical: true },
      { x: 10.0, y: 8.0, isVertical: false }
    ],
    furniture: [
      { type: "Bed", x: 2.0, y: 2.0, sizeX: 2.0, sizeY: 1.8 },
      { type: "Sofa", x: 5.0, y: 4.5, sizeX: 1.8, sizeY: 0.9 },
      { type: "Dining Table", x: 9.0, y: 2.0, sizeX: 1.2, sizeY: 1.2 },
      { type: "Desk", x: 1.5, y: 5.0, sizeX: 1.4, sizeY: 0.7 }
    ],
    dimensionX: 12,
    dimensionY: 10,
    critique: {
      circulation: "Excellent clear paths from entryway to main room. Balcony access is straightforward. Clear separation of plumbing lines between kitchen and bathroom.",
      scale: "The living zone is perfectly proportioned for single occupancy. Desk placement respects the standard 90cm clearances.",
      lighting: "Excellent natural light exposure from the West-facing balcony and primary windows, reducing artificial load during daylight.",
      suggestions: [
        "Incorporate a sliding screen between bed and sofa for acoustic isolation.",
        "Add an active extraction fan in the bathroom due to the lack of direct external window openings."
      ]
    },
    compliance: {
      rulesChecked: ["Standard Fire Egress Distance (<15m)", "Minimum Habitable Room Size (>=9.3 sqm)", "Bathroom Ventilation Code Ratio", "Door Swing Clearance"],
      violations: []
    },
    ifcCode: `#10= IFCORGANIZATION('N_F','Naqsh e Faryadi','AI Architecture Engine',$,$);\n#11= IFCPROJECT('0Y8qg$','Architectural Project','Studio Apartment',$,$,$,$,(#20),#15);\n#21= IFCSITE('2MkWX$','Karachi Site','Plot-26',$,$,$,$,$,.ELEMENT.,$,$,$,$,$);\n#22= IFCBUILDING('3t$p_f','Main Structure',$,$,$,#21,$,$,.ELEMENT.,$,$,$);\n#23= IFCBUILDINGSTOREY('1p_gB1','Ground Floor',$,$,$,#22,$,$,.ELEMENT.,0.0);\n#30= IFCWALLSTANDARDCASE('3F6$y7',$,'Exterior Wall','Load Bearing',$,#35,#40,$);\n#31= IFCSLAB('0tX$Y1',$,'Floor Plate',$,$,#45,#50,$,.FLOOR.);`
  },
  courtyard: {
    rooms: [
      { name: "Central Courtyard (Aangan)", x: 4.0, y: 3.0, width: 4.0, height: 4.0, color: "emerald" },
      { name: "Traditional Tea Room (Baithak)", x: 0.5, y: 0.5, width: 4.5, height: 4.5, color: "amber" },
      { name: "Dining Hall", x: 6.0, y: 0.5, width: 5.5, height: 4.5, color: "indigo" },
      { name: "Serenity Study", x: 0.5, y: 5.5, width: 3.0, height: 4.0, color: "teal" },
      { name: "Master Suite", x: 8.5, y: 5.5, width: 3.0, height: 4.0, color: "rose" }
    ],
    doors: [
      { x: 3.5, y: 2.0, isVertical: true, targetRoom: "Central Courtyard (Aangan)" },
      { x: 7.0, y: 4.0, isVertical: true, targetRoom: "Central Courtyard (Aangan)" },
      { x: 1.5, y: 5.0, isVertical: false, targetRoom: "Serenity Study" },
      { x: 9.5, y: 5.0, isVertical: false, targetRoom: "Master Suite" }
    ],
    windows: [
      { x: 0.5, y: 2.0, isVertical: true },
      { x: 11.5, y: 2.0, isVertical: true },
      { x: 0.5, y: 7.5, isVertical: true }
    ],
    furniture: [
      { type: "Traditional Low Seating", x: 2.5, y: 2.5, sizeX: 2.2, sizeY: 2.2 },
      { type: "Central Fountain", x: 6.0, y: 5.0, sizeX: 1.2, sizeY: 1.2 },
      { type: "Grand Dining Table", x: 9.0, y: 2.5, sizeX: 2.5, sizeY: 1.2 },
      { type: "Bed", x: 10.0, y: 7.5, sizeX: 2.0, sizeY: 1.8 }
    ],
    dimensionX: 12,
    dimensionY: 10,
    critique: {
      circulation: "Masterful introverted design based on traditional Subcontinental and Islamic layouts. The central courtyard serves as a thermal buffer and primary light source.",
      scale: "Generous spacing. The Tea Room creates a sense of spatial hierarchy and welcoming hospitality.",
      lighting: "Excellent daylighting across all rooms as they face inward to the open-air courtyard.",
      suggestions: [
        "Position high-level horizontal wind catchers on South-facing walls for microclimate cooling.",
        "Add deep brick latticework (Jaali) on external windows to temper intense Pakistan summer sun."
      ]
    },
    compliance: {
      rulesChecked: ["Standard Fire Egress Distance (<15m)", "Courtyard Ventilation Ratio (Min 10%)", "Minimum Ceiling Height (2.75m)", "Emergency Openings Clearance"],
      violations: [
        { rule: "Emergency Openings Clearance", element: "Serenity Study Window", description: "Window opening is slightly below 0.6 sqm standard emergency escape opening.", severity: "warning" }
      ]
    },
    ifcCode: `#10= IFCORGANIZATION('N_F','Naqsh e Faryadi','AI Architecture Engine',$,$);\n#11= IFCPROJECT('0Y8qg$','Traditional Courtyard','Baithak Plan',$,$,$,$,(#20),#15);\n#21= IFCSITE('2MkWX$','Karachi Site','Plot-40',$,$,$,$,$,.ELEMENT.,$,$,$,$,$);\n#22= IFCBUILDING('3t$p_f','Main Mansion',$,$,$,#21,$,$,.ELEMENT.,$,$,$);\n#23= IFCBUILDINGSTOREY('1p_gB1','Courtyard Level',$,$,$,#22,$,$,.ELEMENT.,0.0);\n#30= IFCWALLSTANDARDCASE('3F6$y7',$,'Loadbearing Brick','Interior/Exterior',$,#35,#40,$);\n#31= IFCOPENINGELEMENT('5YmG$',$,'Courtyard Aperture',$,$,#55,#60,$);\n#32= IFCSLAB('0tX$Y1',$,'Courtyard Floor',$,$,#45,#50,$,.FLOOR.);`
  }
};

// Spatial AI prompt generation API endpoint
app.post("/api/generate-spatial", async (req, res) => {
  const { prompt, preset } = req.body;

  // If a preset is chosen and no custom prompt, or fallback if Gemini API is inactive
  const hasValidApiKey = getGeminiClient() !== null;

  if (preset && !prompt) {
    const selectedPreset = presets[preset] || presets.studio;
    return res.json({ ...selectedPreset, apiGenerated: false });
  }

  if (!hasValidApiKey) {
    // Gracefully use preset or adapt preset based on prompt keywords to simulate AI
    let selectedPreset = JSON.parse(JSON.stringify(presets.studio));
    
    if (prompt && (prompt.toLowerCase().includes("courtyard") || prompt.toLowerCase().includes("traditional") || prompt.toLowerCase().includes("pakistan") || prompt.toLowerCase().includes("house"))) {
      selectedPreset = JSON.parse(JSON.stringify(presets.courtyard));
    }

    if (prompt) {
      // Modify mock data slightly to match prompt and feel interactive
      selectedPreset.critique.circulation = `[AI Simulation Mode] Real Gemini API Key not set in Secrets. Showing simulation for: "${prompt}".\n\n${selectedPreset.critique.circulation}`;
    }

    return res.json({ ...selectedPreset, apiGenerated: false, apiUnavailable: true });
  }

  try {
    const ai = getGeminiClient();
    if (!ai) throw new Error("API Key not set");

    const systemPrompt = `You are Brain One (The Reasoning Model) of Naqsh e Faryadi, an elite architectural AI.
Your task is to generate a valid, realistic 2D architectural layout and spatial BIM representation based on the user's request: "${prompt}".

The coordinate system is bounds 12 (width) by 10 (height) in meters.
Generate structural JSON that matches the requested schema EXACTLY.
Make sure the rooms are neatly arranged, they fit together within the 12x10 limit, do not overlap significantly, and have shared or adjacent walls.
Place doors precisely on the junctions between rooms or outer walls.
Place windows on exterior walls of the boundaries.
Place standard furniture coordinate items inside matching rooms.

Provide:
1. 'rooms': array of { name, x, y, width, height, color ('emerald', 'blue', 'amber', 'rose', 'indigo', 'teal', 'orange') }
2. 'doors': array of { x, y, isVertical, targetRoom }
3. 'windows': array of { x, y, isVertical }
4. 'furniture': array of { type, x, y, sizeX, sizeY }
5. 'critique': { circulation, scale, lighting, suggestions: string[] }
6. 'compliance': { rulesChecked: string[], violations: Array<{ rule, element, description, severity ('warning'|'error') }> }
7. 'ifcCode': string of standard textual pseudo-BIM coordinate instructions.

Ensure the return is strictly valid JSON matching the schema. Do not wrap in extra Markdown blocks except raw json.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rooms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  width: { type: Type.NUMBER },
                  height: { type: Type.NUMBER },
                  color: { type: Type.STRING }
                },
                required: ["name", "x", "y", "width", "height", "color"]
              }
            },
            doors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  isVertical: { type: Type.BOOLEAN },
                  targetRoom: { type: Type.STRING }
                },
                required: ["x", "y", "isVertical", "targetRoom"]
              }
            },
            windows: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  isVertical: { type: Type.BOOLEAN }
                },
                required: ["x", "y", "isVertical"]
              }
            },
            furniture: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  sizeX: { type: Type.NUMBER },
                  sizeY: { type: Type.NUMBER }
                },
                required: ["type", "x", "y", "sizeX", "sizeY"]
              }
            },
            dimensionX: { type: Type.NUMBER },
            dimensionY: { type: Type.NUMBER },
            critique: {
              type: Type.OBJECT,
              properties: {
                circulation: { type: Type.STRING },
                scale: { type: Type.STRING },
                lighting: { type: Type.STRING },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["circulation", "scale", "lighting", "suggestions"]
            },
            compliance: {
              type: Type.OBJECT,
              properties: {
                rulesChecked: { type: Type.ARRAY, items: { type: Type.STRING } },
                violations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      rule: { type: Type.STRING },
                      element: { type: Type.STRING },
                      description: { type: Type.STRING },
                      severity: { type: Type.STRING }
                    },
                    required: ["rule", "element", "description", "severity"]
                  }
                }
              },
              required: ["rulesChecked", "violations"]
            },
            ifcCode: { type: Type.STRING }
          },
          required: ["rooms", "doors", "windows", "furniture", "dimensionX", "dimensionY", "critique", "compliance", "ifcCode"]
        }
      }
    });

    const output = JSON.parse(response.text || "{}");
    return res.json({ ...output, apiGenerated: true });
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Graceful fallback on API errors so user doesn't get a blank screen
    return res.json({
      ...presets.studio,
      apiGenerated: false,
      apiError: true,
      errorMsg: error instanceof Error ? error.message : "Generation failed"
    });
  }
});

// Explicit robots.txt and sitemap.xml route handling
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /admin

User-agent: GPTBot
Disallow: /api/
Disallow: /admin/
Disallow: /admin
Allow: /

User-agent: Claude-Web
Disallow: /api/
Disallow: /admin/
Disallow: /admin
Allow: /

User-agent: Google-Extended
Disallow: /api/
Disallow: /admin/
Disallow: /admin
Allow: /

Sitemap: https://naqshefaryadi.com/sitemap.xml
Content-Signal: ai-train=no, search=yes, ai-input=no`);
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://naqshefaryadi.com/</loc>
    <lastmod>2026-07-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://naqshefaryadi.com/blog</loc>
    <lastmod>2026-07-03</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
});

// Configure Vite or Static Asset Handling
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Naqsh e Faryadi Server running on http://localhost:${PORT}`);
  });
};

startServer();

import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    if (req.hostname === "127.0.0.1") {
      return res.redirect(302, `http://localhost:${PORT}${req.originalUrl}`);
    }

    next();
  });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

  // Expanded IP Database (Indian Pharmacopoeia)
  const ipDatabase = [
    { 
      name: "Paracetamol", 
      category: "Analgesic/Antipyretic", 
      description: "Used to treat pain and fever.", 
      standard: "IP 2022",
      dosageForms: ["Tablet", "Syrup", "Injection", "Suppository"],
      storage: "Store protected from light and moisture at a temperature not exceeding 30°C.",
      identification: "Chemical test: Heat 0.1g with 2ml of sulfuric acid; a violet color is produced.",
      assay: "Not less than 99.0% and not more than 101.0% of C8H9NO2.",
      impurities: "4-Aminophenol (not more than 0.005%), 4-Chloroacetanilide (not more than 0.001%).",
      labelClaim: "Each tablet contains Paracetamol IP 500mg.",
      container: "Well-closed, light-resistant container.",
      stability: "Stable for 3 years if stored correctly.",
      referenceYear: "2022"
    },
    { 
      name: "Amoxicillin", 
      category: "Antibiotic", 
      description: "Used for bacterial infections.", 
      standard: "IP 2022",
      dosageForms: ["Capsule", "Tablet", "Oral Suspension"],
      storage: "Store in a cool, dry place. Reconstituted suspension should be stored in a refrigerator (2°C to 8°C) and used within 7 days.",
      identification: "Infrared absorption spectrophotometry.",
      assay: "Not less than 92.0% and not more than 100.5% of C16H19N3O5S.",
      impurities: "Amoxicillin diketopiperazine (not more than 1.0%).",
      labelClaim: "Each capsule contains Amoxicillin Trihydrate IP equivalent to Amoxicillin 250mg.",
      container: "Airtight container.",
      stability: "2 years.",
      referenceYear: "2022"
    },
    { 
      name: "Metformin", 
      category: "Antidiabetic", 
      description: "Used for Type 2 Diabetes.", 
      standard: "IP 2022",
      dosageForms: ["Tablet", "Extended Release Tablet"],
      storage: "Store protected from moisture at a temperature not exceeding 30°C.",
      identification: "Melting point: 222°C to 226°C.",
      assay: "Not less than 98.5% and not more than 101.0% of C4H11N5,HCl.",
      impurities: "Dicyandiamide (not more than 0.02%).",
      labelClaim: "Each tablet contains Metformin Hydrochloride IP 500mg.",
      container: "Well-closed container.",
      stability: "3 years.",
      referenceYear: "2022"
    },
    { 
      name: "Atorvastatin", 
      category: "Antihyperlipidemic", 
      description: "Used to lower cholesterol.", 
      standard: "IP 2022",
      dosageForms: ["Tablet"],
      storage: "Store protected from light and moisture.",
      identification: "HPLC retention time matching standard.",
      assay: "98.0% to 102.0% of C33H35FN2O5.",
      impurities: "Atorvastatin epoxy pyrrolo oxazin (not more than 0.1%).",
      labelClaim: "Each tablet contains Atorvastatin Calcium IP equivalent to Atorvastatin 10mg.",
      container: "Well-closed, light-resistant container.",
      stability: "2 years.",
      referenceYear: "2022"
    },
    { 
      name: "Amlodipine", 
      category: "Antihypertensive", 
      description: "Used for high blood pressure.", 
      standard: "IP 2022",
      dosageForms: ["Tablet"],
      storage: "Store protected from light.",
      identification: "UV absorption spectrophotometry.",
      assay: "97.0% to 102.0% of C20H25ClN2O5.",
      impurities: "Amlodipine impurity A (not more than 0.1%).",
      labelClaim: "Each tablet contains Amlodipine Besilate IP equivalent to Amlodipine 5mg.",
      container: "Well-closed, light-resistant container.",
      stability: "3 years.",
      referenceYear: "2022"
    },
    { 
      name: "Ibuprofen", 
      category: "NSAID", 
      description: "Used for pain and inflammation.", 
      standard: "IP 2022",
      dosageForms: ["Tablet", "Capsule", "Oral Suspension"],
      storage: "Store in a well-closed container.",
      identification: "Infrared absorption spectrophotometry.",
      assay: "98.5% to 101.0% of C13H18O2.",
      impurities: "4-Isobutylacetophenone (not more than 0.1%).",
      labelClaim: "Each tablet contains Ibuprofen IP 400mg.",
      container: "Well-closed container.",
      stability: "3 years.",
      referenceYear: "2022"
    },
    { 
      name: "Omeprazole", 
      category: "Proton Pump Inhibitor", 
      description: "Used for acid reflux.", 
      standard: "IP 2022",
      dosageForms: ["Delayed-release Capsule", "Injection"],
      storage: "Store protected from light and moisture.",
      identification: "HPLC.",
      assay: "98.0% to 102.0% of C17H19N3O3S.",
      impurities: "Omeprazole sulfone (not more than 0.5%).",
      labelClaim: "Each capsule contains Omeprazole IP 20mg.",
      container: "Airtight, light-resistant container.",
      stability: "2 years.",
      referenceYear: "2022"
    },
    { 
      name: "Lisinopril", 
      category: "ACE Inhibitor", 
      description: "Used for hypertension.", 
      standard: "IP 2022",
      dosageForms: ["Tablet"],
      storage: "Store at room temperature.",
      identification: "Specific optical rotation.",
      assay: "98.0% to 102.0% of C21H31N3O5.",
      impurities: "Lisinopril diketopiperazine (not more than 0.5%).",
      labelClaim: "Each tablet contains Lisinopril IP 5mg.",
      container: "Well-closed container.",
      stability: "3 years.",
      referenceYear: "2022"
    },
    { 
      name: "Azithromycin", 
      category: "Antibiotic", 
      description: "Used for respiratory infections.", 
      standard: "IP 2022",
      dosageForms: ["Tablet", "Capsule", "Oral Suspension", "Injection"],
      storage: "Store in a well-closed container.",
      identification: "HPLC.",
      assay: "940 µg to 1020 µg of C38H72N2O12 per mg.",
      impurities: "Desosaminylazithromycin (not more than 0.5%).",
      labelClaim: "Each tablet contains Azithromycin Dihydrate IP equivalent to Azithromycin 500mg.",
      container: "Airtight container.",
      stability: "2 years.",
      referenceYear: "2022"
    },
  ];

  // API Routes
  app.get("/api/ip-database", (req, res) => {
    const query = req.query.q?.toString().toLowerCase();
    if (query) {
      const results = ipDatabase.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
      );
      return res.json(results);
    }
    res.json(ipDatabase);
  });

  app.get("/api/sync-ip-drugs", (req, res) => {
    res.json(ipDatabase);
  });

  app.post("/api/ip-database/explain", async (req, res) => {
    try {
      const { drugName, monograph } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const prompt = `Explain the following Indian Pharmacopoeia (IP) monograph for ${drugName} in very simple, easy-to-understand language for a non-medical person. Focus on what it is, how to store it, and what the tests mean in simple terms.
      
      Monograph Data:
      ${JSON.stringify(monograph, null, 2)}`;
      
      const result = await model.generateContent(prompt);
      const explanation = result.response.text();
      res.json({ explanation });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate AI explanation" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const result = await model.generateContent(message);
      const reply = result.response.text();
      res.json({ reply });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Gemini API Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import { useState, useMemo } from 'react';
import { FlaskConical, Search, ChevronRight, ExternalLink, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useTheme } from 'next-themes';
import { motion } from 'motion/react';

interface LabTest {
  name: string;
  abbreviation: string;
  category: string;
  unit: string;
  normalMale: string;
  normalFemale: string;
  normalChild?: string;
  lowMeaning: string;
  highMeaning: string;
  clinicalNote: string;
  source: string;
  sourceOrg: string;
}

const labTests: LabTest[] = [
  { name: "Hemoglobin", abbreviation: "Hb", category: "Complete Blood Count", unit: "g/dL", normalMale: "13.0–17.0", normalFemale: "12.0–15.5", normalChild: "11.0–16.0", lowMeaning: "Anemia, blood loss, nutritional deficiency, chronic disease", highMeaning: "Polycythemia, dehydration, high altitude adaptation, COPD", clinicalNote: "Values vary slightly by altitude and laboratory method. Indian population reference: ICMR recommends Hb <11 g/dL as anemia cut-off for pregnancy.", source: "ICMR / WHO 2011", sourceOrg: "ICMR" },
  { name: "Red Blood Cell Count", abbreviation: "RBC", category: "Complete Blood Count", unit: "million/µL", normalMale: "4.5–5.9", normalFemale: "4.0–5.2", normalChild: "3.8–5.0", lowMeaning: "Anemia, bone marrow suppression, hemorrhage, hemolysis", highMeaning: "Polycythemia vera, secondary erythrocytosis, dehydration", clinicalNote: "Should be interpreted alongside Hb and hematocrit for complete assessment.", source: "WHO / AACC 2023", sourceOrg: "WHO" },
  { name: "White Blood Cell Count", abbreviation: "WBC", category: "Complete Blood Count", unit: "×10³/µL", normalMale: "4.0–11.0", normalFemale: "4.0–11.0", normalChild: "5.0–13.0", lowMeaning: "Leukopenia, viral infection, bone marrow suppression, autoimmune disease", highMeaning: "Leukocytosis, bacterial infection, inflammation, leukemia, corticosteroid use", clinicalNote: "Differential count (neutrophils, lymphocytes) provides more specific diagnostic information.", source: "AACC Reference Intervals 2023", sourceOrg: "AACC" },
  { name: "Platelet Count", abbreviation: "PLT", category: "Complete Blood Count", unit: "×10³/µL", normalMale: "150–400", normalFemale: "150–400", normalChild: "150–450", lowMeaning: "Thrombocytopenia, dengue, ITP, bone marrow failure, liver disease", highMeaning: "Thrombocytosis, iron deficiency, infection, post-splenectomy, inflammatory states", clinicalNote: "Platelet count <50,000/µL increases bleeding risk significantly. <20,000/µL — risk of spontaneous bleeding.", source: "WHO / AACC 2023", sourceOrg: "WHO" },
  { name: "Mean Corpuscular Volume", abbreviation: "MCV", category: "Complete Blood Count", unit: "fL", normalMale: "80–100", normalFemale: "80–100", clinicalNote: "Key parameter for anemia classification: Microcytic (<80 fL) suggests iron/thalassemia; Normocytic (80–100) suggests chronic disease; Macrocytic (>100) suggests B12/folate deficiency.", lowMeaning: "Microcytic anemia — iron deficiency, thalassemia, chronic disease", highMeaning: "Macrocytic anemia — B12/folate deficiency, liver disease, hypothyroidism, alcohol use", source: "AACC Reference Intervals 2023", sourceOrg: "AACC" },
  { name: "Fasting Blood Glucose", abbreviation: "FBG", category: "Blood Sugar Tests", unit: "mg/dL", normalMale: "70–99", normalFemale: "70–99", normalChild: "70–99", lowMeaning: "Hypoglycemia — excess insulin, missed meals, adrenal insufficiency, liver disease", highMeaning: "Diabetes mellitus (≥126), impaired fasting glucose (100–125), stress hyperglycemia", clinicalNote: "Diagnostic criteria: Normal <100 mg/dL; Pre-diabetes 100–125 mg/dL; Diabetes ≥126 mg/dL (confirmed on 2 separate occasions). ADA 2024 guidelines.", source: "ADA Standards of Care 2024 / ICMR", sourceOrg: "ADA / ICMR" },
  { name: "HbA1c (Glycated Hemoglobin)", abbreviation: "HbA1c", category: "Blood Sugar Tests", unit: "%", normalMale: "<5.7", normalFemale: "<5.7", lowMeaning: "Rarely clinically significant unless extremely low; suggests hypoglycemia or hemolytic anemia", highMeaning: "Pre-diabetes 5.7–6.4%; Diabetes ≥6.5%; Target for diabetics <7.0% (ADA) or <7.5% (ICMR individualized)", clinicalNote: "Reflects average blood glucose over 2–3 months. Not accurate in hemoglobinopathies (sickle cell, thalassemia). ICMR target for Indian diabetics: <7.0%.", source: "ADA 2024 / ICMR 2023", sourceOrg: "ADA / ICMR" },
  { name: "Total Cholesterol", abbreviation: "TC", category: "Lipid Profile", unit: "mg/dL", normalMale: "<200 (desirable)", normalFemale: "<200 (desirable)", lowMeaning: "Hypocholesterolemia — malnutrition, liver disease, malabsorption, hyperthyroidism", highMeaning: "Hypercholesterolemia — cardiovascular risk; Borderline: 200–239; High: ≥240 mg/dL", clinicalNote: "Must be interpreted with LDL, HDL, and triglycerides. NCEP ATP III guidelines. Indian Heart Association recommends LDL <100 for high-risk patients.", source: "NCEP ATP III / AHA 2023", sourceOrg: "AHA" },
  { name: "LDL Cholesterol", abbreviation: "LDL-C", category: "Lipid Profile", unit: "mg/dL", normalMale: "<100 (optimal)", normalFemale: "<100 (optimal)", lowMeaning: "Rarely problematic; hyperthyroidism, malabsorption, very low-fat diet", highMeaning: "Major cardiovascular risk factor. Near optimal: 100–129; Borderline high: 130–159; High: 160–189; Very high: ≥190", clinicalNote: "Target varies by cardiovascular risk: <70 mg/dL for very high-risk (post-MI, diabetes + CKD). CSI guidelines for Indians.", source: "ACC/AHA 2023 / CSI India", sourceOrg: "ACC/AHA" },
  { name: "HDL Cholesterol", abbreviation: "HDL-C", category: "Lipid Profile", unit: "mg/dL", normalMale: "≥40 (low risk)", normalFemale: "≥50 (low risk)", lowMeaning: "Low HDL (<40 M / <50 F) — major cardiovascular risk factor; associated with metabolic syndrome, smoking, physical inactivity", highMeaning: "High HDL (>60) — cardioprotective. Extremely high (>100) — rare genetic conditions, may paradoxically increase risk", clinicalNote: "HDL >60 mg/dL is considered a negative (protective) cardiovascular risk factor per NCEP ATP III.", source: "NCEP ATP III / AHA 2023", sourceOrg: "AHA" },
  { name: "Triglycerides", abbreviation: "TG", category: "Lipid Profile", unit: "mg/dL", normalMale: "<150 (normal)", normalFemale: "<150 (normal)", lowMeaning: "Hypotriglyceridemia — malnutrition, malabsorption, hyperthyroidism, abetalipoproteinemia", highMeaning: "Borderline high: 150–199; High: 200–499; Very high: ≥500 (pancreatitis risk)", clinicalNote: "Non-fasting sample may be 20–30 mg/dL higher. Very high TG (≥500 mg/dL) — acute pancreatitis risk. Common in Indian population due to dietary patterns.", source: "AHA / Endocrine Society 2023", sourceOrg: "AHA" },
  { name: "Serum Creatinine", abbreviation: "SCr", category: "Kidney Function Tests", unit: "mg/dL", normalMale: "0.7–1.2", normalFemale: "0.5–1.0", normalChild: "0.3–0.7", lowMeaning: "Low muscle mass, malnutrition, pregnancy (dilution), advanced liver disease", highMeaning: "Acute kidney injury (AKI), chronic kidney disease (CKD), rhabdomyolysis, dehydration, nephrotoxic drugs", clinicalNote: "Creatinine is a late marker of kidney injury — eGFR (estimated GFR) is preferred for CKD staging per KDIGO 2022.", source: "KDIGO 2022 / ICMR", sourceOrg: "KDIGO" },
  { name: "Blood Urea Nitrogen", abbreviation: "BUN", category: "Kidney Function Tests", unit: "mg/dL", normalMale: "7–20", normalFemale: "7–20", normalChild: "5–18", lowMeaning: "Overhydration, liver failure, malnutrition, SIADH", highMeaning: "Pre-renal: dehydration, heart failure, GI bleeding; Renal: AKI, CKD; Post-renal: obstruction", clinicalNote: "BUN:Creatinine ratio >20:1 suggests pre-renal cause. <10:1 suggests liver disease or malnutrition.", source: "KDIGO / AACC 2023", sourceOrg: "KDIGO" },
  { name: "eGFR", abbreviation: "eGFR", category: "Kidney Function Tests", unit: "mL/min/1.73m²", normalMale: "≥90 (G1)", normalFemale: "≥90 (G1)", clinicalNote: "KDIGO CKD Staging: G1 ≥90; G2 60–89; G3a 45–59; G3b 30–44; G4 15–29; G5 <15 (kidney failure). Calculated using CKD-EPI 2021 equation.", lowMeaning: "Reduced kidney function — stages G3 to G5 indicate progressive CKD", highMeaning: "Not clinically significant when >90; hyperfiltration (>120) may occur in early diabetes", source: "KDIGO CKD Guidelines 2022", sourceOrg: "KDIGO" },
  { name: "Serum Bilirubin (Total)", abbreviation: "T.Bili", category: "Liver Function Tests", unit: "mg/dL", normalMale: "0.2–1.2", normalFemale: "0.2–1.2", lowMeaning: "No significant clinical concern at very low levels", highMeaning: "Jaundice visible when >2.5 mg/dL. Elevated in hepatitis, cirrhosis, hemolysis, bile duct obstruction, Gilbert syndrome", clinicalNote: "Fractionation into direct (conjugated) and indirect (unconjugated) bilirubin helps identify cause.", source: "EASL Clinical Practice Guidelines 2023", sourceOrg: "EASL" },
  { name: "ALT (Alanine Aminotransferase)", abbreviation: "ALT/SGPT", category: "Liver Function Tests", unit: "U/L", normalMale: "7–55", normalFemale: "7–45", lowMeaning: "Low levels not clinically significant", highMeaning: "Liver cell injury — viral hepatitis (ALT >10x ULN), NAFLD, alcohol, drug-induced liver injury, heart failure", clinicalNote: "ALT is more liver-specific than AST. ALT:AST ratio >2 suggests alcoholic liver disease. AASLD 2023 guidelines.", source: "AASLD / EASL 2023", sourceOrg: "AASLD" },
  { name: "AST (Aspartate Aminotransferase)", abbreviation: "AST/SGOT", category: "Liver Function Tests", unit: "U/L", normalMale: "10–40", normalFemale: "10–35", lowMeaning: "Low levels not clinically significant", highMeaning: "Liver injury, myocardial infarction (cardiac AST), skeletal muscle disease, hemolysis", clinicalNote: "Less liver-specific than ALT — also elevated in MI and muscle disease. AST:ALT >2:1 → alcoholic hepatitis.", source: "AASLD / EASL 2023", sourceOrg: "AASLD" },
  { name: "Serum Albumin", abbreviation: "Alb", category: "Liver Function Tests", unit: "g/dL", normalMale: "3.5–5.0", normalFemale: "3.5–5.0", lowMeaning: "Hypoalbuminemia — liver disease, malnutrition, nephrotic syndrome, chronic inflammation, protein-losing enteropathy", highMeaning: "Hyperalbuminemia — dehydration (relative elevation)", clinicalNote: "Albumin half-life ~20 days, so it reflects chronic nutritional/liver status. Used in Child-Pugh score for cirrhosis severity.", source: "EASL / AACC 2023", sourceOrg: "EASL" },
  { name: "TSH (Thyroid Stimulating Hormone)", abbreviation: "TSH", category: "Thyroid Function Tests", unit: "mIU/L", normalMale: "0.4–4.0", normalFemale: "0.4–4.0", lowMeaning: "Primary hyperthyroidism, TSH-secreting pituitary adenoma suppression, subclinical hyperthyroidism", highMeaning: "Primary hypothyroidism, subclinical hypothyroidism (TSH 4–10), iodine deficiency", clinicalNote: "TSH is the best initial screening test for thyroid disorders. In India, iodine deficiency and Hashimoto's thyroiditis are leading causes of hypothyroidism (IAEA/ICMR).", source: "ATA Guidelines 2023 / ICMR", sourceOrg: "ATA / ICMR" },
  { name: "Free T4 (Thyroxine)", abbreviation: "FT4", category: "Thyroid Function Tests", unit: "ng/dL", normalMale: "0.8–1.8", normalFemale: "0.8–1.8", lowMeaning: "Hypothyroidism when TSH is elevated; central hypothyroidism if TSH is also low", highMeaning: "Hyperthyroidism, thyroiditis, excess thyroid hormone replacement", clinicalNote: "Order in combination with TSH for complete thyroid assessment. FT4 is preferred over total T4.", source: "ATA Guidelines 2023", sourceOrg: "ATA" },
  { name: "Serum Sodium", abbreviation: "Na⁺", category: "Electrolytes", unit: "mEq/L", normalMale: "136–145", normalFemale: "136–145", lowMeaning: "Hyponatremia (<136): SIADH, heart failure, cirrhosis, adrenal insufficiency, diuretics, vomiting/diarrhea", highMeaning: "Hypernatremia (>145): dehydration, diabetes insipidus, excessive sodium intake", clinicalNote: "Severe hyponatremia (<120 mEq/L) — risk of cerebral edema. Rapid correction risk: osmotic demyelination syndrome.", source: "ERA-EDTA / AACC 2023", sourceOrg: "ERA-EDTA" },
  { name: "Serum Potassium", abbreviation: "K⁺", category: "Electrolytes", unit: "mEq/L", normalMale: "3.5–5.0", normalFemale: "3.5–5.0", lowMeaning: "Hypokalemia (<3.5): diuretics, diarrhea, vomiting, hyperaldosteronism — risk of cardiac arrhythmias", highMeaning: "Hyperkalemia (>5.0): AKI/CKD, ACE inhibitors, K-sparing diuretics, Addison's disease — cardiac emergency if >6.5", clinicalNote: "Critical values: K⁺ <2.5 or >6.5 mEq/L require immediate intervention. ECG changes occur with significant derangements.", source: "KDIGO / AACC 2023", sourceOrg: "KDIGO" },
  { name: "Serum Calcium (Total)", abbreviation: "Ca²⁺", category: "Electrolytes", unit: "mg/dL", normalMale: "8.5–10.5", normalFemale: "8.5–10.5", lowMeaning: "Hypocalcemia: hypoparathyroidism, vitamin D deficiency, CKD, magnesium deficiency, pancreatitis", highMeaning: "Hypercalcemia: hyperparathyroidism, malignancy (PTHrP), vitamin D toxicity, sarcoidosis, immobilization", clinicalNote: "Correct for albumin: Corrected Ca = Measured Ca + 0.8 × (4.0 − Albumin). Vitamin D deficiency is highly prevalent in India (ICMR).", source: "Endocrine Society / ICMR 2023", sourceOrg: "Endocrine Society" },
  { name: "Vitamin D (25-OH)", abbreviation: "25(OH)D", category: "Vitamins & Minerals", unit: "ng/mL", normalMale: "30–100", normalFemale: "30–100", lowMeaning: "Deficiency (<20): rickets/osteomalacia, increased fracture risk, immune dysfunction; Insufficiency 20–29 ng/mL", highMeaning: "Toxicity (>150): hypercalcemia, kidney stones, soft tissue calcification", clinicalNote: "Vitamin D deficiency highly prevalent in India (70–90% in some studies) despite abundant sunlight — dietary sources + supplementation often needed. ICMR/NIN 2020 guidelines.", source: "ICMR / NIN India 2020", sourceOrg: "ICMR / NIN" },
  { name: "Vitamin B12 (Cobalamin)", abbreviation: "B12", category: "Vitamins & Minerals", unit: "pg/mL", normalMale: "200–900", normalFemale: "200–900", lowMeaning: "Deficiency (<200): pernicious anemia, macrocytic anemia, peripheral neuropathy, cognitive decline; vegetarian diet, metformin use", highMeaning: "Very high levels (>1000): liver disease, myeloproliferative disorders, solid tumors", clinicalNote: "B12 deficiency highly prevalent in India due to vegetarian/vegan diets (ICMR). Metformin reduces B12 absorption — annual monitoring recommended in diabetics.", source: "ICMR / NIN India 2020", sourceOrg: "ICMR / NIN" },
  { name: "Serum Iron", abbreviation: "Fe", category: "Iron Studies", unit: "µg/dL", normalMale: "60–170", normalFemale: "50–150", lowMeaning: "Iron deficiency anemia, chronic blood loss, inadequate dietary intake, malabsorption", highMeaning: "Hemochromatosis, iron overload, hemolytic anemia, aplastic anemia, repeated transfusions", clinicalNote: "Iron alone is insufficient — must interpret with TIBC, ferritin, and transferrin saturation for complete iron status.", source: "AACC / BSH Guidelines 2023", sourceOrg: "AACC" },
  { name: "Serum Ferritin", abbreviation: "Ferritin", category: "Iron Studies", unit: "ng/mL", normalMale: "24–336", normalFemale: "11–307", lowMeaning: "Iron deficiency (most specific test) — <12 ng/mL confirms iron deficiency even without anemia", highMeaning: "Iron overload, hemochromatosis; acute phase reactant (elevated in infection, inflammation, malignancy, liver disease)", clinicalNote: "Ferritin is the most sensitive marker of iron deficiency. However, it is an acute-phase reactant and can be falsely normal/elevated in inflammatory states.", source: "BSH / AACC 2023", sourceOrg: "BSH" },
  { name: "CRP (C-Reactive Protein)", abbreviation: "CRP", category: "Inflammatory Markers", unit: "mg/L", normalMale: "<5.0", normalFemale: "<5.0", lowMeaning: "Normal inflammatory state", highMeaning: "Bacterial infection (often >100 mg/L), inflammatory disease (10–100), cardiovascular risk (high-sensitivity CRP 1–3 mg/L)", clinicalNote: "High-sensitivity CRP (hsCRP): <1.0 = low CV risk; 1–3 = intermediate; >3 = high CV risk per AHA. Standard CRP monitors acute infection/inflammation.", source: "AHA / ESCIM 2023", sourceOrg: "AHA" },
  { name: "PSA (Prostate-Specific Antigen)", abbreviation: "PSA", category: "Cancer Markers", unit: "ng/mL", normalMale: "<4.0 (age-dependent)", normalFemale: "N/A (males only)", lowMeaning: "Very low PSA after prostatectomy indicates treatment success", highMeaning: "Elevated PSA: prostate cancer, BPH, prostatitis, urological procedures. Age-adjusted: <50y: <2.5; 50–59: <3.5; 60–69: <4.5; 70+: <6.5 ng/mL", clinicalNote: "PSA alone is not diagnostic. Prostate biopsy required for definitive diagnosis. Shared decision-making recommended for screening (ACS/AUA 2023).", source: "ACS / AUA Guidelines 2023", sourceOrg: "ACS / AUA" },
];

const categories = ["All", "Complete Blood Count", "Blood Sugar Tests", "Lipid Profile", "Kidney Function Tests", "Liver Function Tests", "Thyroid Function Tests", "Electrolytes", "Vitamins & Minerals", "Iron Studies", "Inflammatory Markers", "Cancer Markers"];

const sourceColors: Record<string, string> = {
  "ICMR": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "WHO": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "AACC": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "ADA / ICMR": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "AHA": "bg-red-500/10 text-red-400 border-red-500/20",
  "KDIGO": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "ATA / ICMR": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "ICMR / NIN": "bg-green-500/10 text-green-400 border-green-500/20",
  "AASLD": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "EASL": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "BSH": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "ACS / AUA": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "ERA-EDTA": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Endocrine Society": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "ACC/AHA": "bg-red-500/10 text-red-400 border-red-500/20",
  "ATA": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "ADA": "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function LabReference() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<LabTest | null>(null);

  const filtered = useMemo(() => {
    let result = labTests;
    if (category !== 'All') result = result.filter(t => t.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q) || t.abbreviation.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    return result;
  }, [search, category]);

  const grouped = useMemo(() => {
    const map: Record<string, LabTest[]> = {};
    filtered.forEach(t => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return map;
  }, [filtered]);

  const srcColor = (org: string) => sourceColors[org] || "bg-teal-500/10 text-teal-400 border-teal-500/20";

  const card = isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-gray-200';
  const badge = isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-gray-100 text-gray-600 border-gray-200';
  const muted = isDark ? 'text-slate-400' : 'text-gray-500';
  const head = isDark ? 'text-slate-500' : 'text-gray-400';
  const rowHover = isDark ? 'hover:bg-slate-800/60' : 'hover:bg-gray-50';
  const divider = isDark ? 'border-slate-800/60' : 'border-gray-100';
  const infoBox = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-gray-50 border-gray-200';
  const noteBox = isDark ? 'bg-teal-500/8 border-teal-500/20 text-teal-300' : 'bg-teal-50 border-teal-200 text-teal-700';

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        icon={FlaskConical}
        title="Laboratory Reference"
        description="Evidence-based reference ranges for 28 common laboratory tests — cited from WHO, ICMR, AACC, and international clinical guidelines."
        badge="REFERENCE"
        color="indigo"
      />

      <div className={`rounded-2xl border p-4 ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>Data Sources</p>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-indigo-400/80' : 'text-indigo-600'}`}>
              Reference ranges compiled from: <strong>WHO</strong>, <strong>ICMR</strong> (Indian Council of Medical Research), <strong>NIN India</strong> (National Institute of Nutrition), <strong>AACC</strong> (American Association for Clinical Chemistry), <strong>ADA</strong>, <strong>AHA</strong>, <strong>KDIGO</strong>, and specialty society guidelines (2022–2024). All values are for adults unless noted. Consult your physician for interpretation of individual results.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white border-gray-200'}`}>
          <Search className={`w-4 h-4 flex-shrink-0 ${muted}`} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search test name, abbreviation, or category..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className={`rounded-xl px-3 py-2.5 border text-sm font-medium outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-700'}`}
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(grouped).map(([cat, tests]) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border overflow-hidden ${card}`}
            >
              <div className={`px-5 py-3 border-b ${divider}`}>
                <h3 className={`text-xs font-bold uppercase tracking-widest ${head}`}>{cat}</h3>
              </div>
              <div>
                {tests.map((test, idx) => (
                  <button
                    key={test.abbreviation}
                    onClick={() => setSelected(test)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all ${rowHover} ${selected?.abbreviation === test.abbreviation ? (isDark ? 'bg-teal-500/8' : 'bg-teal-50') : ''} ${idx > 0 ? `border-t ${divider}` : ''}`}
                  >
                    <div className={`w-12 flex-shrink-0 text-center px-2 py-1 rounded-lg text-xs font-bold border ${badge}`}>
                      {test.abbreviation}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{test.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className={`text-xs ${muted}`}>♂ {test.normalMale}</span>
                        <span className={`text-xs ${muted}`}>♀ {test.normalFemale}</span>
                        <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{test.unit}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${srcColor(test.sourceOrg)}`}>
                      {test.sourceOrg.split(' / ')[0]}
                    </span>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${muted}`} />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className={`rounded-2xl border p-12 text-center ${card}`}>
              <FlaskConical className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
              <p className={`text-sm font-medium ${muted}`}>No tests match your search.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {selected ? (
            <motion.div
              key={selected.abbreviation}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl border p-5 sticky top-4 ${card}`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`px-3 py-1.5 rounded-xl text-sm font-bold border ${badge}`}>{selected.abbreviation}</div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selected.name}</h3>
                  <p className={`text-xs ${muted}`}>{selected.category}</p>
                </div>
              </div>

              <div className={`rounded-xl border p-4 mb-4 ${infoBox}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${head}`}>Reference Ranges</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className={`text-xs ${muted}`}>Adult Male ♂</span>
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{selected.normalMale} {selected.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs ${muted}`}>Adult Female ♀</span>
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{selected.normalFemale} {selected.unit}</span>
                  </div>
                  {selected.normalChild && (
                    <div className="flex justify-between">
                      <span className={`text-xs ${muted}`}>Child</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{selected.normalChild} {selected.unit}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className={`rounded-xl border p-3 ${isDark ? 'bg-blue-500/8 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wide">Low Values Mean</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-blue-300/80' : 'text-blue-700'}`}>{selected.lowMeaning}</p>
                </div>
                <div className={`rounded-xl border p-3 ${isDark ? 'bg-amber-500/8 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wide">High Values Mean</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>{selected.highMeaning}</p>
                </div>
              </div>

              <div className={`rounded-xl border p-3 mb-4 ${noteBox}`}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1 opacity-70">Clinical Note</p>
                <p className="text-xs leading-relaxed">{selected.clinicalNote}</p>
              </div>

              <div className={`flex items-center gap-2 p-3 rounded-xl border ${infoBox}`}>
                <ExternalLink className={`w-3.5 h-3.5 flex-shrink-0 ${muted}`} />
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wide ${head}`}>Source</p>
                  <p className={`text-xs font-medium truncate ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{selected.source}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className={`rounded-2xl border p-8 text-center ${card}`}>
              <FlaskConical className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Select a test to see reference ranges and clinical notes</p>
            </div>
          )}

          <div className={`rounded-2xl border p-4 ${card}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${head}`}>Trusted Data Sources</p>
            <div className="space-y-2">
              {[
                { name: 'ICMR India', url: 'https://icmr.gov.in', desc: 'Indian clinical guidelines' },
                { name: 'NIN India', url: 'https://nin.res.in', desc: 'Nutritional reference values' },
                { name: 'WHO', url: 'https://www.who.int', desc: 'Global health standards' },
                { name: 'AACC', url: 'https://www.aacc.org', desc: 'Lab medicine standards' },
                { name: 'KDIGO', url: 'https://kdigo.org', desc: 'Kidney disease guidelines' },
              ].map(src => (
                <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}>
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{src.name}</p>
                    <p className={`text-[10px] ${muted}`}>{src.desc}</p>
                  </div>
                  <ExternalLink className={`w-3 h-3 ${muted}`} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

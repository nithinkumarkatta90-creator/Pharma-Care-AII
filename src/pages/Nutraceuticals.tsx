import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Leaf, X, Heart, Brain, Shield, Activity,
  ArrowLeft, Flame, AlertTriangle, ChevronRight, Droplets,
  Star, BookOpen, Zap, Apple,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from 'next-themes';
import { ScrollArea } from '../components/ui/scroll-area';

interface Food {
  id: number;
  name: string;
  hindi: string;
  emoji: string;
  category: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitamins: string[];
  minerals: string[];
  antioxidants: string[];
  glycemicIndex: number;
  omega3: number;
  healthBenefits: string[];
  diseaseSupport: string[];
  organSupport: string[];
  ayurvedic: string;
  dailyIntake: string;
  precautions: string;
  drugInteractions: string[];
  immunity: string;
  tags: string[];
}

const FOOD_DB: Food[] = [
  { id: 1, name: 'Turmeric', hindi: 'Haldi', emoji: '🌿', category: 'Herbs & Spices',
    description: 'Sacred Ayurvedic spice containing curcumin — one of the most studied bioactive compounds with potent anti-inflammatory and antioxidant effects.',
    calories: 354, protein: 7.8, carbs: 64.9, fat: 9.9, fiber: 21.1,
    vitamins: ['Vitamin C', 'Vitamin B6', 'Vitamin E', 'Vitamin K'],
    minerals: ['Iron', 'Magnesium', 'Potassium', 'Manganese'],
    antioxidants: ['Curcumin', 'Bisdemethoxycurcumin', 'Ar-turmerone'],
    glycemicIndex: 35, omega3: 0.1,
    healthBenefits: ['Anti-inflammatory', 'Antioxidant powerhouse', 'Brain neuroprotection', 'Joint pain relief', 'Cancer prevention'],
    diseaseSupport: ['Arthritis', "Alzheimer's", 'Type 2 Diabetes', 'Heart Disease', 'Metabolic Syndrome'],
    organSupport: ['Liver', 'Brain', 'Joints', 'Skin'],
    ayurvedic: 'Tridoshic — balances Vata, Pitta & Kapha; pacifies Kapha most effectively',
    dailyIntake: '1–3g curcumin supplement with black pepper; liberal use in cooking',
    precautions: 'May increase bleeding risk with blood thinners; avoid megadoses in pregnancy',
    drugInteractions: ['Warfarin', 'Aspirin', 'Chemotherapy agents', 'Metformin'],
    immunity: 'Activates NK cells and T-lymphocytes; powerful anti-pathogen and anti-inflammatory compound',
    tags: ['Anti-inflammatory', 'Immunity', 'Liver', 'Brain', 'Ayurveda'] },

  { id: 2, name: 'Ashwagandha', hindi: 'Ashwagandha', emoji: '🌱', category: 'Herbs & Spices',
    description: 'Revered adaptogenic herb in Ayurveda. Withania somnifera reduces cortisol, builds stamina and supports adrenal function.',
    calories: 245, protein: 3.9, carbs: 49.9, fat: 0.3, fiber: 32.3,
    vitamins: ['Vitamin C', 'Vitamin A', 'Vitamin D'],
    minerals: ['Iron', 'Calcium', 'Magnesium', 'Phosphorus'],
    antioxidants: ['Withanolides', 'Withaferin A', 'Sitoindosides'],
    glycemicIndex: 30, omega3: 0,
    healthBenefits: ['Stress reduction', 'Testosterone support', 'Muscle mass gain', 'Sleep quality', 'Thyroid support'],
    diseaseSupport: ['Hypothyroidism', 'Anxiety', 'Depression', 'Chronic Fatigue', 'Infertility'],
    organSupport: ['Adrenals', 'Brain', 'Thyroid', 'Reproductive organs'],
    ayurvedic: 'Rasayana (rejuvenator) — balances Vata & Kapha; warming herb',
    dailyIntake: '300–600mg standardized extract daily; or 1–2 tsp powder in warm milk',
    precautions: 'Avoid in autoimmune diseases, pregnancy; may cause GI upset',
    drugInteractions: ['Thyroid medications', 'Immunosuppressants', 'Sedatives'],
    immunity: 'Modulates innate immunity; increases white blood cell activity; reduces inflammation',
    tags: ['Adaptogen', 'Stress', 'Testosterone', 'Brain', 'Ayurveda'] },

  { id: 3, name: 'Amla', hindi: 'Amla', emoji: '🫒', category: 'Herbs & Spices',
    description: 'Indian Gooseberry — one of the richest natural sources of Vitamin C with exceptional antioxidant and immunomodulatory properties.',
    calories: 44, protein: 0.9, carbs: 10.2, fat: 0.6, fiber: 3.4,
    vitamins: ['Vitamin C (largest natural source)', 'Vitamin A', 'Vitamin B1', 'Vitamin B2'],
    minerals: ['Iron', 'Calcium', 'Phosphorus', 'Chromium'],
    antioxidants: ['Ellagic acid', 'Gallic acid', 'Emblicanin A&B', 'Quercetin'],
    glycemicIndex: 25, omega3: 0,
    healthBenefits: ['Highest natural Vitamin C source', 'Hair growth', 'Liver detox', 'Blood sugar regulation', 'Eye health'],
    diseaseSupport: ['Diabetes', 'Liver disorders', 'Eye diseases', 'Hair loss', 'Anaemia'],
    organSupport: ['Liver', 'Eyes', 'Hair', 'Skin', 'Pancreas'],
    ayurvedic: 'Tridoshic Rasayana; one of the 3 fruits in Triphala; cooling in nature',
    dailyIntake: '1–2 fresh amla daily; 20ml fresh juice; 500mg–1g dried powder',
    precautions: 'High Vitamin C may cause acidic urine; caution with kidney stones',
    drugInteractions: ['Warfarin', 'Antidiabetic drugs', 'Antihypertensives'],
    immunity: 'Extremely high Vitamin C; stimulates production of white blood cells and antibodies',
    tags: ['Vitamin C', 'Immunity', 'Liver', 'Hair', 'Ayurveda'] },

  { id: 4, name: 'Moringa', hindi: 'Sahjan / Drumstick', emoji: '🌿', category: 'Herbs & Spices',
    description: '"Miracle tree" — exceptionally nutrient-dense with complete amino acids, rare vitamins and powerful anti-inflammatory isothiocyanates.',
    calories: 64, protein: 9.4, carbs: 8.3, fat: 1.4, fiber: 2,
    vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin B6', 'Folate', 'Vitamin K'],
    minerals: ['Iron', 'Calcium', 'Magnesium', 'Potassium', 'Zinc'],
    antioxidants: ['Quercetin', 'Chlorogenic acid', 'Isothiocyanates', 'Zeatin'],
    glycemicIndex: 20, omega3: 0.3,
    healthBenefits: ['Nutrient density champion', 'Blood sugar control', 'Cholesterol reduction', 'Anti-inflammatory', 'Milk production support'],
    diseaseSupport: ['Diabetes', 'Malnutrition', 'Inflammation', 'Hyperlipidaemia', 'Anaemia'],
    organSupport: ['Liver', 'Kidneys', 'Heart', 'Brain'],
    ayurvedic: 'Tikta (bitter) and Katu (pungent) — pacifies Kapha and Vata',
    dailyIntake: '1–2 tsp moringa powder daily; 10g leaves; drumstick pods in cooking',
    precautions: 'Root bark may be toxic in large doses; avoid in pregnancy',
    drugInteractions: ['Antidiabetic drugs', 'Antihypertensives', 'Thyroid medications'],
    immunity: 'Rich in zinc and Vitamin C; isothiocyanates activate immune genes',
    tags: ['Superfood', 'Iron', 'Immunity', 'Diabetes', 'Ayurveda'] },

  { id: 5, name: 'Tulsi', hindi: 'Tulsi / Holy Basil', emoji: '🌿', category: 'Herbs & Spices',
    description: 'Sacred adaptogenic herb worshipped in Indian culture. Ocimum sanctum offers exceptional anti-microbial, anti-viral and stress-relieving properties.',
    calories: 22, protein: 3.2, carbs: 2.7, fat: 0.6, fiber: 1.6,
    vitamins: ['Vitamin K', 'Vitamin A', 'Vitamin C', 'Vitamin B6'],
    minerals: ['Manganese', 'Calcium', 'Iron', 'Magnesium'],
    antioxidants: ['Eugenol', 'Rosmarinic acid', 'Ursolic acid', 'Orientin'],
    glycemicIndex: 15, omega3: 0.05,
    healthBenefits: ['Adaptogenic stress relief', 'Anti-microbial', 'Respiratory health', 'Blood sugar balance', 'Wound healing'],
    diseaseSupport: ['Respiratory infections', 'Diabetes', 'Anxiety', 'Skin infections', 'Fever'],
    organSupport: ['Lungs', 'Adrenals', 'Skin', 'Liver'],
    ayurvedic: 'Sattvic herb — sacred Rasayana; pacifies Vata and Kapha; slightly heating',
    dailyIntake: '2–3 fresh leaves daily; 1 tsp dried powder; tulsi tea (1–2 cups/day)',
    precautions: 'Mild blood thinner; avoid before surgery; not recommended long-term in pregnancy',
    drugInteractions: ['Warfarin', 'Antidiabetic drugs', 'Pentobarbital'],
    immunity: 'Stimulates T-helper and NK cell activity; anti-viral against common respiratory viruses',
    tags: ['Adaptogen', 'Respiratory', 'Immunity', 'Stress', 'Ayurveda'] },

  { id: 6, name: 'Pomegranate', hindi: 'Anar', emoji: '🍎', category: 'Fruits',
    description: 'Ancient medicinal fruit rich in punicalagins — antioxidants found almost exclusively in pomegranate with 3x the antioxidant power of green tea.',
    calories: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4,
    vitamins: ['Vitamin C', 'Vitamin K', 'Folate', 'Vitamin B6'],
    minerals: ['Potassium', 'Copper', 'Manganese', 'Phosphorus'],
    antioxidants: ['Punicalagins', 'Ellagic acid', 'Anthocyanins', 'Punicic acid'],
    glycemicIndex: 35, omega3: 0,
    healthBenefits: ['Superior antioxidant activity', 'Blood pressure reduction', 'Memory improvement', 'Anti-cancer properties', 'Joint inflammation'],
    diseaseSupport: ['Hypertension', 'Prostate cancer', 'Arthritis', 'Heart disease', "Alzheimer's"],
    organSupport: ['Heart', 'Brain', 'Joints', 'Prostate'],
    ayurvedic: 'Tridoshic fruit; sweet variety pacifies all three doshas; cooling nature',
    dailyIntake: '1 medium pomegranate daily; 150–200ml fresh juice',
    precautions: 'High in natural sugars; may interact with statins; monitor blood pressure closely',
    drugInteractions: ['Statins', 'Warfarin', 'Antihypertensives', 'ACE inhibitors'],
    immunity: 'Punicalagins are potent anti-viral; significantly boosts antioxidant enzyme activity',
    tags: ['Antioxidant', 'Heart', 'Brain', 'Anti-cancer', 'Immunity'] },

  { id: 7, name: 'Banana', hindi: 'Kela', emoji: '🍌', category: 'Fruits',
    description: 'Energy-rich tropical fruit with natural sugars, potassium and prebiotic fiber supporting heart health and digestive wellness.',
    calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6,
    vitamins: ['Vitamin B6', 'Vitamin C', 'Folate', 'Riboflavin'],
    minerals: ['Potassium', 'Magnesium', 'Manganese', 'Copper'],
    antioxidants: ['Dopamine', 'Catechins', 'Epicatechin'],
    glycemicIndex: 51, omega3: 0.03,
    healthBenefits: ['Instant energy', 'Heart health via potassium', 'Digestive health', 'Mood enhancement', 'Post-workout recovery'],
    diseaseSupport: ['Hypertension', 'Depression', 'Constipation', 'Muscle cramps', 'Anaemia'],
    organSupport: ['Heart', 'Kidneys', 'Digestive system', 'Brain'],
    ayurvedic: 'Sweet (Madhura) and cooling; pacifies Vata and Pitta; increases Kapha',
    dailyIntake: '1–2 medium bananas daily; limit for diabetics to 1 small ripe banana',
    precautions: 'High glycemic in ripe state; limit for Type 2 diabetes; avoid in migraine trigger-sensitive',
    drugInteractions: ['ACE inhibitors', 'Potassium-sparing diuretics'],
    immunity: 'Vitamin B6 supports antibody production; Vitamin C maintains immune function',
    tags: ['Energy', 'Heart', 'Potassium', 'Digestion', 'Recovery'] },

  { id: 8, name: 'Papaya', hindi: 'Papita', emoji: '🍑', category: 'Fruits',
    description: 'Tropical enzyme powerhouse containing papain — a proteolytic enzyme that aids digestion, reduces inflammation and accelerates wound healing.',
    calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3, fiber: 1.7,
    vitamins: ['Vitamin C', 'Vitamin A', 'Folate', 'Vitamin B1', 'Vitamin B3'],
    minerals: ['Potassium', 'Magnesium', 'Calcium', 'Phosphorus'],
    antioxidants: ['Lycopene', 'Cryptoxanthin', 'Zeaxanthin', 'Lutein'],
    glycemicIndex: 60, omega3: 0.02,
    healthBenefits: ['Digestive enzyme support', 'Anti-inflammatory', 'Skin health', 'Eye health', 'Immune boost'],
    diseaseSupport: ['Digestive disorders', 'Dengue fever', 'Macular degeneration', 'Skin conditions', 'Obesity'],
    organSupport: ['Digestive system', 'Eyes', 'Skin', 'Liver'],
    ayurvedic: 'Tikshna (sharp/penetrating); scraping action on Kapha and Ama; heating',
    dailyIntake: '1 cup (150g) ripe papaya daily; or 1 tbsp papaya leaf extract',
    precautions: 'Unripe papaya unsafe in pregnancy; papain may cause allergic reaction in latex-sensitive',
    drugInteractions: ['Warfarin', 'Antidiabetic drugs'],
    immunity: 'Extremely high Vitamin C (61mg per 100g); lycopene modulates immune signaling',
    tags: ['Digestion', 'Enzymes', 'Immunity', 'Skin', 'Eye health'] },

  { id: 9, name: 'Blueberry', hindi: 'Neel Badam', emoji: '🫐', category: 'Fruits',
    description: 'Cognitive superfruit with the highest antioxidant capacity of all fruits. Anthocyanins cross the blood-brain barrier to protect neural function.',
    calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4,
    vitamins: ['Vitamin C', 'Vitamin K', 'Vitamin B6', 'Folate'],
    minerals: ['Manganese', 'Copper', 'Magnesium'],
    antioxidants: ['Anthocyanins', 'Quercetin', 'Myricetin', 'Resveratrol'],
    glycemicIndex: 40, omega3: 0.06,
    healthBenefits: ['Brain function & memory', 'Highest ORAC antioxidant score', 'Blood pressure reduction', 'Insulin sensitivity', 'UTI prevention'],
    diseaseSupport: ["Alzheimer's", 'Dementia', 'Hypertension', 'Type 2 Diabetes', 'Cardiovascular disease'],
    organSupport: ['Brain', 'Heart', 'Eyes', 'Kidneys'],
    ayurvedic: 'Astringent and sweet; cooling; particularly suited to Pitta disorders',
    dailyIntake: '½–1 cup (70–150g) daily; freeze-dried options equally effective',
    precautions: 'Blood-thinning effects; caution with anticoagulants',
    drugInteractions: ['Warfarin', 'Aspirin', 'Clopidogrel'],
    immunity: 'Anthocyanins activate NK cells; potent anti-viral activity demonstrated in studies',
    tags: ['Brain', 'Antioxidant', 'Memory', 'Heart', 'Anti-aging'] },

  { id: 10, name: 'Spinach', hindi: 'Palak', emoji: '🥬', category: 'Vegetables',
    description: 'Nutritional powerhouse leafy green rich in iron, magnesium and nitrates that improve blood oxygenation, eye health and muscle recovery.',
    calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2,
    vitamins: ['Vitamin K', 'Vitamin A', 'Folate', 'Vitamin C', 'Vitamin B2', 'Vitamin E'],
    minerals: ['Iron', 'Magnesium', 'Potassium', 'Calcium', 'Manganese', 'Zinc'],
    antioxidants: ['Lutein', 'Zeaxanthin', 'Quercetin', 'Kaempferol'],
    glycemicIndex: 15, omega3: 0.14,
    healthBenefits: ['Iron for anaemia', 'Eye health via lutein', 'Bone strength via Vitamin K', 'Blood pressure via nitrates', 'Anti-cancer properties'],
    diseaseSupport: ['Anaemia', 'Macular degeneration', 'Osteoporosis', 'Hypertension', 'Cancer prevention'],
    organSupport: ['Eyes', 'Bones', 'Heart', 'Blood', 'Brain'],
    ayurvedic: 'Cold in potency; pacifies Pitta; increases Kapha; heavy to digest',
    dailyIntake: '1–2 cups raw (30–60g) or ½ cup cooked daily',
    precautions: 'High oxalates — soak before cooking; caution in kidney stones; may affect thyroid (cook to reduce goitrogens)',
    drugInteractions: ['Warfarin (Vitamin K)', 'Iron supplements'],
    immunity: 'High zinc and folate essential for lymphocyte production and immune gene expression',
    tags: ['Iron', 'Eye health', 'Bones', 'Folate', 'Immunity'] },

  { id: 11, name: 'Beetroot', hindi: 'Chukandar', emoji: '🫀', category: 'Vegetables',
    description: 'Powerful nitrate-rich root vegetable that increases nitric oxide production — dilating blood vessels, improving oxygen delivery and athletic performance.',
    calories: 43, protein: 1.6, carbs: 9.6, fat: 0.2, fiber: 2.8,
    vitamins: ['Folate', 'Vitamin C', 'Vitamin B6', 'Riboflavin'],
    minerals: ['Manganese', 'Potassium', 'Iron', 'Magnesium', 'Copper'],
    antioxidants: ['Betalains', 'Betanin', 'Indiaxanthin', 'Isobetanin'],
    glycemicIndex: 61, omega3: 0.01,
    healthBenefits: ['Nitric oxide boost', 'Athletic endurance', 'Blood pressure control', 'Liver detoxification', 'Anti-inflammatory'],
    diseaseSupport: ['Hypertension', 'Heart disease', 'Liver disease', 'Anaemia', 'Inflammation'],
    organSupport: ['Heart', 'Liver', 'Blood vessels', 'Brain'],
    ayurvedic: 'Sweet (Madhura); increases Pitta and Kapha; beneficial for Vata',
    dailyIntake: '1 medium beetroot daily; 200–250ml fresh beet juice',
    precautions: 'Can cause beeturia (red urine/stools — harmless); caution in kidney stones (high oxalate); blood pressure — monitor closely with medications',
    drugInteractions: ['Antihypertensives', 'Nitrates (erectile dysfunction meds)'],
    immunity: 'Betalains are potent anti-inflammatory; vitamin C and zinc support immune response',
    tags: ['Heart', 'Blood pressure', 'Liver', 'Endurance', 'Nitric oxide'] },

  { id: 12, name: 'Broccoli', hindi: 'Hari Phool Gobhi', emoji: '🥦', category: 'Vegetables',
    description: 'Cruciferous anti-cancer superfood containing sulforaphane — one of the most potent natural NRF2 activators and phase-II detoxification inducers.',
    calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6,
    vitamins: ['Vitamin K', 'Vitamin C', 'Folate', 'Vitamin A', 'Vitamin B6', 'Vitamin E'],
    minerals: ['Potassium', 'Magnesium', 'Phosphorus', 'Calcium', 'Manganese'],
    antioxidants: ['Sulforaphane', 'Glucoraphanin', 'Indole-3-carbinol', 'Lutein'],
    glycemicIndex: 15, omega3: 0.11,
    healthBenefits: ['Anti-cancer sulforaphane', 'Detoxification support', 'Bone health', 'Blood sugar control', 'Cardiovascular protection'],
    diseaseSupport: ['Cancer prevention', 'Osteoporosis', 'Diabetes', 'Heart disease', 'Autoimmune conditions'],
    organSupport: ['Liver', 'Bones', 'Heart', 'Digestive system'],
    ayurvedic: 'Light, dry; slightly bitter; reduces Kapha; can aggravate Vata if eaten raw',
    dailyIntake: '1 cup (90g) cooked or 2 cups raw; slightly steam to preserve sulforaphane',
    precautions: 'Raw broccoli may cause bloating; goitrogenic in excess — cook for thyroid conditions',
    drugInteractions: ['Warfarin (Vitamin K)', 'Blood-thinning drugs'],
    immunity: 'Sulforaphane activates NRF2 pathway; indoles support thymus function and T-cell production',
    tags: ['Anti-cancer', 'Detox', 'Liver', 'Bones', 'Immunity'] },

  { id: 13, name: 'Garlic', hindi: 'Lehsun', emoji: '🧄', category: 'Vegetables',
    description: "Nature's antibiotic — allicin in garlic has demonstrated anti-bacterial, anti-viral, anti-fungal and cardioprotective effects in hundreds of studies.",
    calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1,
    vitamins: ['Vitamin B6', 'Vitamin C', 'Vitamin B1', 'Folate'],
    minerals: ['Manganese', 'Calcium', 'Copper', 'Phosphorus', 'Selenium'],
    antioxidants: ['Allicin', 'Alliin', 'Diallyl disulfide', 'S-allyl cysteine', 'Quercetin'],
    glycemicIndex: 30, omega3: 0.02,
    healthBenefits: ["Nature's antibiotic", 'Cholesterol reduction', 'Blood pressure control', 'Anti-thrombotic', 'Anti-cancer'],
    diseaseSupport: ['Hypertension', 'Cardiovascular disease', 'Fungal infections', 'Common cold', 'Cancer prevention'],
    organSupport: ['Heart', 'Blood vessels', 'Immune system', 'Liver'],
    ayurvedic: 'Pungent and heating; pacifies Vata and Kapha; should be avoided by Pitta types in excess',
    dailyIntake: '1–2 raw cloves daily; or 600–900mg aged garlic extract',
    precautions: 'May cause GI upset; strong breath; blood-thinning effects — stop 2 weeks before surgery',
    drugInteractions: ['Warfarin', 'HIV protease inhibitors', 'Cyclosporine', 'Antiplatelet drugs'],
    immunity: 'Allicin directly kills pathogens; stimulates macrophages and lymphocytes; anti-viral proven in vitro',
    tags: ['Antibiotic', 'Heart', 'Immunity', 'Anti-fungal', 'Cholesterol'] },

  { id: 14, name: 'Sweet Potato', hindi: 'Shakarkand', emoji: '🍠', category: 'Vegetables',
    description: 'Beta-carotene-rich root vegetable with remarkable anti-inflammatory anthocyanins, exceptional gut-feeding prebiotic fiber and low glycemic load.',
    calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3,
    vitamins: ['Vitamin A (beta-carotene)', 'Vitamin C', 'Vitamin B6', 'Vitamin B5', 'Vitamin B1'],
    minerals: ['Potassium', 'Manganese', 'Copper', 'Magnesium'],
    antioxidants: ['Beta-carotene', 'Chlorogenic acid', 'Anthocyanins (purple variety)', 'Sporamin'],
    glycemicIndex: 63, omega3: 0.01,
    healthBenefits: ['Vitamin A for vision', 'Gut microbiome nourishment', 'Blood sugar stabilization', 'Inflammation reduction', 'Skin health'],
    diseaseSupport: ['Vision disorders', 'Diabetes (purple variety)', 'Gut dysbiosis', 'Inflammatory conditions', 'Obesity'],
    organSupport: ['Eyes', 'Gut', 'Skin', 'Immune system'],
    ayurvedic: 'Sweet (Madhura); cooling; nourishing; pacifies Vata; increases Kapha',
    dailyIntake: '1 medium sweet potato (150g) daily; boiled is preferred over baked',
    precautions: 'High in oxalate — caution in kidney stones; high potassium — caution in kidney disease',
    drugInteractions: ['Beta-blockers (potassium)', 'Vitamin A supplements'],
    immunity: 'Vitamin A critical for mucosal immunity; beta-carotene enhances T-cell response',
    tags: ['Vitamin A', 'Gut health', 'Eye health', 'Skin', 'Diabetes'] },

  { id: 15, name: 'Ragi', hindi: 'Ragi / Nachni', emoji: '🌾', category: 'Millets & Grains',
    description: 'Finger millet — the calcium king of millets. Gluten-free ancient grain with exceptional mineral density, complete amino acids and low glycemic index.',
    calories: 336, protein: 7.3, carbs: 72.6, fat: 1.3, fiber: 3.6,
    vitamins: ['Vitamin B1', 'Vitamin B2', 'Vitamin B3', 'Folate', 'Vitamin E'],
    minerals: ['Calcium (highest among grains)', 'Iron', 'Phosphorus', 'Magnesium', 'Zinc'],
    antioxidants: ['Tannins', 'Phenolic compounds', 'Catechins', 'Epicatechin'],
    glycemicIndex: 54, omega3: 0.04,
    healthBenefits: ['Highest calcium in grains — bone density', 'Gluten-free', 'Blood sugar control', 'Anaemia prevention', 'Weight management'],
    diseaseSupport: ['Osteoporosis', 'Diabetes', 'Anaemia', 'Celiac disease', 'Obesity'],
    organSupport: ['Bones', 'Blood', 'Pancreas', 'Digestive system'],
    ayurvedic: 'Laghu (light) and Grahi (absorbent); reduces Pitta and Kapha',
    dailyIntake: '50–100g daily as ragi roti, porridge (kanji) or dosa; sprouted form enhances iron absorption',
    precautions: 'Contain tannins — soak and sprout to improve mineral bioavailability; high oxalate',
    drugInteractions: ['Iron supplements (separate timing)', 'Calcium supplements'],
    immunity: 'Iron and zinc are essential cofactors for immune enzyme systems',
    tags: ['Calcium', 'Gluten-free', 'Diabetes', 'Bones', 'Millets'] },

  { id: 16, name: 'Bajra', hindi: 'Bajra', emoji: '🌾', category: 'Millets & Grains',
    description: 'Pearl millet — drought-resistant ancient grain rich in magnesium, iron and slow-release energy. Traditional staple of Rajasthan and Gujarat.',
    calories: 361, protein: 11.6, carbs: 67.5, fat: 5, fiber: 1.2,
    vitamins: ['Vitamin B3', 'Vitamin B1', 'Folate', 'Vitamin B6'],
    minerals: ['Iron', 'Magnesium', 'Phosphorus', 'Zinc', 'Copper'],
    antioxidants: ['Phenolic acids', 'Flavonoids', 'Tannins'],
    glycemicIndex: 55, omega3: 0.1,
    healthBenefits: ['High iron for anaemia', 'Sustained energy release', 'Cholesterol reduction', 'Blood pressure management', 'Bone support'],
    diseaseSupport: ['Anaemia', 'Cardiovascular disease', 'Hypertension', 'Constipation', 'Obesity'],
    organSupport: ['Blood', 'Heart', 'Digestive system', 'Bones'],
    ayurvedic: 'Laghu and Ruksha; reduces Kapha; increases Vata and Pitta; warming in nature',
    dailyIntake: '50–80g daily as bajra roti, khichdi or porridge; combine with dairy for complete protein',
    precautions: 'Contains goitrogens — limit raw consumption for thyroid conditions; cook thoroughly',
    drugInteractions: ['Thyroid medications (separate by 2 hours)'],
    immunity: 'Zinc and iron critical for NK cell function and T-lymphocyte proliferation',
    tags: ['Iron', 'Magnesium', 'Heart', 'Millets', 'Anaemia'] },

  { id: 17, name: 'Oats', hindi: 'Jai / Oats', emoji: '🌾', category: 'Millets & Grains',
    description: "Beta-glucan champion — oats' unique soluble fiber forms a viscous gel in the intestine that dramatically reduces LDL cholesterol absorption.",
    calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6,
    vitamins: ['Vitamin B1', 'Vitamin B5', 'Folate', 'Vitamin B6', 'Vitamin B3'],
    minerals: ['Manganese', 'Phosphorus', 'Magnesium', 'Copper', 'Iron', 'Zinc'],
    antioxidants: ['Avenanthramides (unique to oats)', 'Ferulic acid', 'Phytic acid'],
    glycemicIndex: 55, omega3: 0.11,
    healthBenefits: ['Cholesterol reduction via beta-glucan', 'Blood sugar stability', 'Gut microbiome health', 'Weight satiety', 'Cardiovascular protection'],
    diseaseSupport: ['Hyperlipidaemia', 'Type 2 Diabetes', 'Constipation', 'Heart disease', 'Obesity'],
    organSupport: ['Heart', 'Digestive system', 'Pancreas', 'Gut microbiome'],
    ayurvedic: 'Sweet and cold; pacifies Pitta and Vata; slightly increases Kapha',
    dailyIntake: '50–80g rolled oats daily; opt for steel-cut or rolled oats over instant for lower GI',
    precautions: 'Certified gluten-free oats required for celiac; may cause bloating initially',
    drugInteractions: ['Warfarin (Vitamin K)', 'Oral medications (beta-glucan slows absorption — separate 1 hr)'],
    immunity: 'Beta-glucan activates macrophages; avenanthramides have anti-inflammatory effects',
    tags: ['Cholesterol', 'Fiber', 'Heart', 'Diabetes', 'Gut health'] },

  { id: 18, name: 'Quinoa', hindi: 'Quinoa', emoji: '🌾', category: 'Millets & Grains',
    description: 'Complete protein grain with all 9 essential amino acids — rare in plant foods. Ancient Andean crop now recognized as a global superfood.',
    calories: 368, protein: 14.1, carbs: 64.2, fat: 6.1, fiber: 7,
    vitamins: ['Folate', 'Vitamin B1', 'Vitamin B2', 'Vitamin B6', 'Vitamin E', 'Vitamin B3'],
    minerals: ['Manganese', 'Phosphorus', 'Magnesium', 'Copper', 'Iron', 'Zinc'],
    antioxidants: ['Quercetin', 'Kaempferol', 'Hydroxybenzoic acid', 'Vanillic acid'],
    glycemicIndex: 53, omega3: 0.26,
    healthBenefits: ['Complete plant protein', 'Gluten-free', 'Blood sugar control', 'Weight management', 'Anti-inflammatory'],
    diseaseSupport: ['Celiac disease', 'Diabetes', 'Metabolic syndrome', 'Inflammatory conditions', 'Heart disease'],
    organSupport: ['Muscles', 'Heart', 'Digestive system', 'Brain'],
    ayurvedic: 'Light and dry; pacifies Kapha; neutral for Vata and Pitta; sattvic grain',
    dailyIntake: '1 cup cooked (185g) daily; rinse thoroughly to remove saponins',
    precautions: 'Saponins cause bitterness and GI irritation — always rinse; moderate oxalate',
    drugInteractions: ['Minimal interactions — generally safe'],
    immunity: 'Complete amino acid profile supports antibody synthesis; quercetin modulates inflammatory cytokines',
    tags: ['Complete protein', 'Gluten-free', 'Heart', 'Diabetes', 'Superfood'] },

  { id: 19, name: 'Almonds', hindi: 'Badam', emoji: '🥜', category: 'Nuts & Seeds',
    description: "Most nutrient-dense tree nut. India's most beloved health nut — exceptional Vitamin E content, healthy monounsaturated fats and brain-nourishing riboflavin.",
    calories: 579, protein: 21.2, carbs: 21.7, fat: 49.9, fiber: 12.5,
    vitamins: ['Vitamin E (highest among nuts)', 'Vitamin B2', 'Vitamin B3', 'Folate', 'Vitamin B6'],
    minerals: ['Magnesium', 'Calcium', 'Iron', 'Zinc', 'Phosphorus', 'Manganese'],
    antioxidants: ['Vitamin E', 'Catechins', 'Quercetin', 'Kaempferol'],
    glycemicIndex: 0, omega3: 0.06,
    healthBenefits: ['Brain health via Vitamin E', 'LDL cholesterol reduction', 'Blood sugar control', 'Bone strength', 'Skin nourishment'],
    diseaseSupport: ['Cardiovascular disease', 'Diabetes', 'Cognitive decline', 'Osteoporosis', 'Skin disorders'],
    organSupport: ['Brain', 'Heart', 'Bones', 'Skin', 'Eyes'],
    ayurvedic: 'Guru (heavy), Snigdha (oily); Ojas builder; pacifies Vata; may increase Pitta in excess',
    dailyIntake: '20–25 almonds (28g) daily; soaked overnight for best bioavailability',
    precautions: 'High calorie density; nut allergy risk; excess Vitamin E (>1000 IU/day) may be harmful',
    drugInteractions: ['Warfarin (Vitamin E at high doses)', 'Anticoagulants'],
    immunity: "Vitamin E is a critical antioxidant protecting immune cell membranes; zinc supports T-cell function",
    tags: ['Brain', 'Vitamin E', 'Heart', 'Skin', 'Bones'] },

  { id: 20, name: 'Walnuts', hindi: 'Akhrot', emoji: '🥜', category: 'Nuts & Seeds',
    description: 'The brain-shaped nut with the highest plant-based omega-3 content. Alpha-linolenic acid supports neurological health, reduces inflammation and cardiovascular risk.',
    calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7,
    vitamins: ['Vitamin E', 'Vitamin B6', 'Folate', 'Vitamin B1', 'Vitamin B5'],
    minerals: ['Magnesium', 'Phosphorus', 'Manganese', 'Copper', 'Iron', 'Zinc'],
    antioxidants: ['Ellagic acid', 'Catechins', 'Melatonin', 'Juglone'],
    glycemicIndex: 15, omega3: 9.08,
    healthBenefits: ['Highest plant omega-3 ALA', 'Brain function and memory', 'Heart protection', 'Gut microbiome diversity', 'Anti-cancer properties'],
    diseaseSupport: ["Alzheimer's", 'Depression', 'Cardiovascular disease', 'Colorectal cancer', 'Type 2 Diabetes'],
    organSupport: ['Brain', 'Heart', 'Gut microbiome', 'Endothelium'],
    ayurvedic: 'Heavy, oily; Ojas building; pacifies Vata; taken with milk in Ayurvedic tradition',
    dailyIntake: '5–7 walnuts (28g) daily; can be eaten raw or soaked',
    precautions: 'Very high in calories; juglandaceae allergy possible; juglone may irritate skin on contact',
    drugInteractions: ['Warfarin (Vitamin E)', 'Antihypertensives'],
    immunity: 'Melatonin acts as antioxidant; polyphenols increase beneficial gut bacteria that train immunity',
    tags: ['Omega-3', 'Brain', 'Heart', 'Anti-cancer', 'Gut health'] },

  { id: 21, name: 'Chia Seeds', hindi: 'Chia Beej', emoji: '🫘', category: 'Nuts & Seeds',
    description: 'Ancient Aztec superfood — extraordinary fiber content forms a gel absorbing 10x its weight in water. Exceptional omega-3 density and bone-building minerals.',
    calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4,
    vitamins: ['Vitamin B1', 'Vitamin B2', 'Vitamin B3', 'Vitamin B9', 'Vitamin A'],
    minerals: ['Calcium', 'Magnesium', 'Phosphorus', 'Iron', 'Zinc', 'Manganese'],
    antioxidants: ['Caffeic acid', 'Chlorogenic acid', 'Quercetin', 'Kaempferol'],
    glycemicIndex: 1, omega3: 17.83,
    healthBenefits: ['Highest plant omega-3 source by weight', 'Extreme fiber for satiety', 'Bone density via calcium', 'Blood sugar blunting', 'Cardiovascular protection'],
    diseaseSupport: ['Obesity', 'Cardiovascular disease', 'Diabetes', 'Constipation', 'Osteoporosis'],
    organSupport: ['Heart', 'Bones', 'Digestive system', 'Pancreas'],
    ayurvedic: 'Cooling; pacifies Pitta; very hydrating; Ayurveda-adjacent (not classical)',
    dailyIntake: '1–2 tablespoons (15–30g) daily; always consume with adequate water to prevent choking',
    precautions: 'Must be consumed with water; can cause choking if dry; blood thinning at high doses',
    drugInteractions: ['Warfarin (omega-3)', 'Antidiabetic drugs', 'Antihypertensives'],
    immunity: 'Omega-3 ALA converted to EPA/DHA modulates inflammatory cytokines; zinc supports immune signaling',
    tags: ['Omega-3', 'Fiber', 'Bones', 'Heart', 'Diabetes'] },

  { id: 22, name: 'Flaxseeds', hindi: 'Alsi', emoji: '🫘', category: 'Nuts & Seeds',
    description: 'Lignans champion — flaxseeds contain 800x more lignans than any other plant food. These phytoestrogens support hormonal balance and reduce breast/prostate cancer risk.',
    calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3,
    vitamins: ['Vitamin B1', 'Vitamin B6', 'Folate', 'Vitamin E'],
    minerals: ['Magnesium', 'Phosphorus', 'Copper', 'Selenium', 'Iron', 'Zinc'],
    antioxidants: ['Lignans (800x more than other plants)', 'Alpha-linolenic acid', 'Phenolic acids'],
    glycemicIndex: 35, omega3: 22.8,
    healthBenefits: ['Lignan phytoestrogen balance', 'Omega-3 ALA richest source', 'Cholesterol reduction', 'Blood pressure control', 'Digestive health'],
    diseaseSupport: ['Breast cancer prevention', 'Prostate health', 'Cardiovascular disease', 'Hypertension', 'Menopausal symptoms'],
    organSupport: ['Heart', 'Hormonal system', 'Digestive system', 'Prostate/Breast'],
    ayurvedic: 'Guru (heavy), Snigdha; Vata-pacifying; warming; promotes bowel movement',
    dailyIntake: '1–2 tablespoons ground flaxseeds daily; grind before eating for bioavailability',
    precautions: 'Must be ground — whole seeds pass undigested; large doses may cause GI upset; avoid raw in excess',
    drugInteractions: ['Warfarin', 'Hormone therapies', 'Estrogen medications'],
    immunity: 'Lignans modulate immune cell activity; omega-3 reduces pro-inflammatory cytokine production',
    tags: ['Omega-3', 'Hormones', 'Heart', 'Anti-cancer', 'Cholesterol'] },

  { id: 23, name: 'Dates', hindi: 'Khajoor', emoji: '🌴', category: 'Nuts & Seeds',
    description: 'Nature\'s energy bar — dates are naturally sun-dried fruit packed with quick-release natural sugars, fiber, potassium and labor-supporting oxytocin-like compounds.',
    calories: 277, protein: 1.8, carbs: 74.9, fat: 0.2, fiber: 6.7,
    vitamins: ['Vitamin B6', 'Vitamin B3', 'Folate', 'Vitamin K', 'Vitamin A'],
    minerals: ['Potassium', 'Magnesium', 'Copper', 'Manganese', 'Iron', 'Calcium'],
    antioxidants: ['Flavonoids', 'Carotenoids', 'Phenolic acid', 'Tannins'],
    glycemicIndex: 42, omega3: 0,
    healthBenefits: ['Natural energy source', 'Digestive regularity', 'Bone strength', 'Labor facilitation in pregnancy', 'Brain antioxidant protection'],
    diseaseSupport: ['Constipation', 'Anaemia', 'Bone weakness', 'Inflammation', 'Cardiovascular disease'],
    organSupport: ['Brain', 'Bones', 'Digestive system', 'Heart'],
    ayurvedic: 'Guru, Snigdha, Madhura; classic Ojas builder; Vata-pacifying; eaten with milk in Chyawanprash',
    dailyIntake: '3–5 dates daily; excellent pre-workout or iftar food; caution in diabetes — 2 maximum',
    precautions: 'Very high in natural sugars and calories; monitor blood sugar in diabetes; high potassium — caution in renal disease',
    drugInteractions: ['Antidiabetic drugs (natural sugar content)', 'Potassium-sparing diuretics'],
    immunity: 'Flavonoids have anti-inflammatory effects; iron and folate support immune cell production',
    tags: ['Energy', 'Iron', 'Bones', 'Digestion', 'Pregnancy'] },

  { id: 24, name: 'Ginger', hindi: 'Adrak', emoji: '🫚', category: 'Herbs & Spices',
    description: 'Zingiberaceae rhizome with potent gingerol compounds that rival anti-inflammatory drugs in efficacy for nausea, joint pain and metabolic health.',
    calories: 80, protein: 1.8, carbs: 17.8, fat: 0.8, fiber: 2,
    vitamins: ['Vitamin C', 'Vitamin B6', 'Vitamin B3', 'Folate'],
    minerals: ['Magnesium', 'Manganese', 'Potassium', 'Copper'],
    antioxidants: ['Gingerols', 'Shogaols', 'Paradol', 'Zingerone'],
    glycemicIndex: 15, omega3: 0.1,
    healthBenefits: ['Powerful anti-nausea', 'Anti-inflammatory comparable to NSAIDs', 'Digestive enzyme stimulation', 'Blood sugar reduction', 'Cholesterol lowering'],
    diseaseSupport: ['Nausea/vomiting', 'Arthritis', 'Type 2 Diabetes', 'Indigestion', 'Dysmenorrhoea'],
    organSupport: ['Digestive system', 'Joints', 'Heart', 'Pancreas'],
    ayurvedic: 'Vishwabheshaj (universal medicine); heating; pacifies Vata and Kapha strongly',
    dailyIntake: '1–3g fresh ginger or 0.5–1g dried ginger daily; 1–2 cups ginger tea',
    precautions: 'Blood-thinning effects; avoid before surgery; heartburn in sensitive individuals',
    drugInteractions: ['Warfarin', 'Aspirin', 'Antidiabetic drugs', 'Antihypertensives'],
    immunity: 'Gingerols inhibit prostaglandin synthesis; anti-viral activity demonstrated against respiratory viruses',
    tags: ['Anti-nausea', 'Anti-inflammatory', 'Digestion', 'Ayurveda', 'Diabetes'] },

  { id: 25, name: 'Brown Rice', hindi: 'Bhura Chawal', emoji: '🍚', category: 'Millets & Grains',
    description: 'Whole grain rice with bran and germ intact — significantly superior to white rice in fiber, B vitamins, minerals and phytochemicals including gamma-oryzanol.',
    calories: 370, protein: 7.9, carbs: 77.2, fat: 2.9, fiber: 3.5,
    vitamins: ['Vitamin B1', 'Vitamin B3', 'Vitamin B6', 'Folate', 'Vitamin E'],
    minerals: ['Manganese', 'Magnesium', 'Phosphorus', 'Selenium', 'Iron'],
    antioxidants: ['Gamma-oryzanol', 'Phytic acid', 'Ferulic acid', 'Tocotrienols'],
    glycemicIndex: 55, omega3: 0.02,
    healthBenefits: ['Sustained energy release', 'Better blood sugar than white rice', 'Digestive fiber', 'Cholesterol reduction via gamma-oryzanol', 'Nerve health via B vitamins'],
    diseaseSupport: ['Type 2 Diabetes (vs white rice)', 'Cardiovascular disease', 'Constipation', 'Metabolic syndrome', 'Neurological conditions'],
    organSupport: ['Brain', 'Heart', 'Digestive system', 'Nervous system'],
    ayurvedic: 'Sattvic; Laghu (lighter than white rice in some schools); good for daily consumption',
    dailyIntake: '1/2–1 cup cooked (90–185g); rinse well; cook with extra water for digestibility',
    precautions: 'Higher arsenic than white rice — vary grains; phytic acid reduces mineral absorption — soak overnight',
    drugInteractions: ['Minimal — generally very safe'],
    immunity: 'Selenium supports glutathione peroxidase — key antioxidant enzyme for immune cells',
    tags: ['Fiber', 'Diabetes', 'Heart', 'Energy', 'B vitamins'] },
];

const CATEGORIES = ['All', 'Herbs & Spices', 'Fruits', 'Vegetables', 'Millets & Grains', 'Nuts & Seeds'];

const HEALTH_QUERIES = [
  { label: 'Boost Immunity', tag: 'Immunity', icon: Shield, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
  { label: 'Liver Support', tag: 'Liver', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { label: 'Brain Health', tag: 'Brain', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { label: 'Heart Health', tag: 'Heart', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  { label: 'Diabetes Support', tag: 'Diabetes', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { label: 'Anti-Inflammatory', tag: 'Anti-inflammatory', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { label: 'Bones & Joints', tag: 'Bones', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  { label: 'Ayurvedic Foods', tag: 'Ayurveda', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
];

const CAT_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  'Herbs & Spices': { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'Fruits': { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'Vegetables': { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  'Millets & Grains': { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  'Nuts & Seeds': { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs">
        <p className="text-slate-300 font-semibold">{label}</p>
        <p className="text-teal-400">{payload[0]?.value}g</p>
      </div>
    );
  }
  return null;
};

export default function Nutraceuticals() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Food | null>(null);
  const [analyzerTag, setAnalyzerTag] = useState('');
  const [activeTab, setActiveTab] = useState('explorer');

  const filtered = useMemo(() => FOOD_DB.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      f.name.toLowerCase().includes(q) ||
      f.hindi.toLowerCase().includes(q) ||
      f.healthBenefits.some(b => b.toLowerCase().includes(q)) ||
      f.diseaseSupport.some(d => d.toLowerCase().includes(q)) ||
      f.vitamins.some(v => v.toLowerCase().includes(q)) ||
      f.minerals.some(m => m.toLowerCase().includes(q)) ||
      f.tags.some(t => t.toLowerCase().includes(q));
    const matchCat = category === 'All' || f.category === category;
    return matchSearch && matchCat;
  }), [search, category]);

  const analyzerResults = useMemo(() => {
    if (!analyzerTag) return [];
    return FOOD_DB.filter(f =>
      f.tags.some(t => t.toLowerCase().includes(analyzerTag.toLowerCase())) ||
      f.healthBenefits.some(b => b.toLowerCase().includes(analyzerTag.toLowerCase())) ||
      f.diseaseSupport.some(d => d.toLowerCase().includes(analyzerTag.toLowerCase())) ||
      f.organSupport.some(o => o.toLowerCase().includes(analyzerTag.toLowerCase()))
    );
  }, [analyzerTag]);

  const macroData = selected ? [
    { name: 'Protein', value: selected.protein, fill: '#818cf8' },
    { name: 'Carbs', value: selected.carbs, fill: '#34d399' },
    { name: 'Fat', value: selected.fat, fill: '#fbbf24' },
    { name: 'Fiber', value: selected.fiber, fill: '#f87171' },
  ] : [];

  const cc = selected ? (CAT_COLORS[selected.category] || CAT_COLORS['Herbs & Spices']) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <PageHeader
        icon={Leaf}
        title="Food Intelligence"
        description="Medical-grade nutraceutical analysis — nutrients, benefits, interactions and Ayurvedic wisdom."
        color="emerald"
        badge="Nutraceuticals"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Foods Catalogued', value: FOOD_DB.length, color: 'text-emerald-400' },
          { label: 'Food Categories', value: CATEGORIES.length - 1, color: 'text-teal-400' },
          { label: 'Nutrients Tracked', value: '50+', color: 'text-amber-400' },
          { label: 'Health Conditions', value: '30+', color: 'text-rose-400' },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02, y: -1 }} className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm">
            <p className="text-[11px] font-medium text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/80 border border-slate-800/60 p-1 rounded-2xl h-auto">
          <TabsTrigger value="explorer" className="rounded-xl data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 text-slate-400 text-sm px-4 py-2">
            <Apple className="w-4 h-4 mr-2" /> Food Explorer
          </TabsTrigger>
          <TabsTrigger value="analyzer" className="rounded-xl data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 text-slate-400 text-sm px-4 py-2">
            <Shield className="w-4 h-4 mr-2" /> Health Analyzer
          </TabsTrigger>
          <TabsTrigger value="nutrients" className="rounded-xl data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400 text-slate-400 text-sm px-4 py-2">
            <Zap className="w-4 h-4 mr-2" /> Nutrient Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="mt-6">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Food Explorer
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-5">
                    <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <span className="text-5xl">{selected.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-bold text-white">{selected.name}</h2>
                            <span className="text-slate-400 text-sm">({selected.hindi})</span>
                            {cc && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cc.text} ${cc.bg} ${cc.border}`}>{selected.category}</span>}
                          </div>
                          <p className="text-slate-400 text-sm mt-2 leading-relaxed">{selected.description}</p>
                          <div className="flex items-center gap-4 mt-3 flex-wrap">
                            <span className="flex items-center gap-1.5 text-sm text-orange-400 font-semibold"><Flame className="w-4 h-4" /> {selected.calories} kcal/100g</span>
                            <span className="text-sm text-slate-500">GI: {selected.glycemicIndex}</span>
                            <span className="text-sm text-blue-400 font-medium">Ω-3: {selected.omega3}g</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Macronutrient Breakdown (per 100g)</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={macroData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {macroData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Vitamins</h4>
                        <div className="flex flex-wrap gap-2">
                          {selected.vitamins.map(v => <span key={v} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{v}</span>)}
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Minerals</h4>
                        <div className="flex flex-wrap gap-2">
                          {selected.minerals.map(m => <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{m}</span>)}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Antioxidants</h4>
                      <div className="flex flex-wrap gap-2">
                        {selected.antioxidants.map(a => <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{a}</span>)}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Ayurvedic Classification</h4>
                      <p className="text-sm text-slate-300">{selected.ayurvedic}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Health Benefits</h4>
                      <ul className="space-y-1.5">
                        {selected.healthBenefits.map(b => (
                          <li key={b} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span> {b}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Organ Support</h4>
                      <div className="flex flex-wrap gap-2">
                        {selected.organSupport.map(o => <span key={o} className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">{o}</span>)}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Recommended Intake</h4>
                      <p className="text-sm text-slate-300">{selected.dailyIntake}</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Immunity Benefits</h4>
                      <p className="text-sm text-slate-300">{selected.immunity}</p>
                    </div>

                    {selected.drugInteractions.length > 0 && (
                      <div className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/5">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Drug Interactions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selected.drugInteractions.map(d => <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{d}</span>)}
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">Precautions</h4>
                      <p className="text-xs text-slate-400">{selected.precautions}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search food, nutrient, or health condition..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-500 hover:text-slate-300" /></button>}
                  </div>
                </div>

                <ScrollArea className="w-full pb-2">
                  <div className="flex gap-2 flex-nowrap">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          category === c
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600 hover:text-slate-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Leaf className="w-12 h-12 text-slate-700 mb-4" />
                    <p className="text-slate-400 font-medium">No foods found</p>
                    <p className="text-slate-600 text-sm mt-1">Try searching by nutrient, condition, or category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((food) => {
                      const colors = CAT_COLORS[food.category] || CAT_COLORS['Herbs & Spices'];
                      return (
                        <motion.button
                          key={food.id}
                          onClick={() => setSelected(food)}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="text-left p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm hover:border-slate-700 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-3xl">{food.emoji}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.text} ${colors.bg} ${colors.border}`}>
                              {food.category.split(' ')[0]}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-200 group-hover:text-white">{food.name}</h3>
                          <p className="text-[11px] text-slate-500 mb-2">{food.hindi}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] text-orange-400 font-medium flex items-center gap-1"><Flame className="w-3 h-3" />{food.calories} kcal</span>
                            <span className="text-[10px] text-slate-600">•</span>
                            <span className="text-[10px] text-indigo-400 font-medium">GI {food.glycemicIndex}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {food.healthBenefits.slice(0, 2).map(b => (
                              <span key={b} className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">{b}</span>
                            ))}
                          </div>
                          <div className="flex items-center justify-end mt-3">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="analyzer" className="mt-6 space-y-6">
          <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <h3 className="text-base font-bold text-white mb-1">Health Goal Analyzer</h3>
            <p className="text-sm text-slate-400 mb-4">Select a health goal to discover the best foods for your condition or deficiency.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {HEALTH_QUERIES.map(q => (
                <button
                  key={q.tag}
                  onClick={() => setAnalyzerTag(analyzerTag === q.tag ? '' : q.tag)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${
                    analyzerTag === q.tag ? `${q.bg} border-current ${q.color}` : 'border-slate-700/60 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <q.icon className={`w-5 h-5 ${analyzerTag === q.tag ? q.color : 'text-slate-500'}`} />
                  <span className="text-[11px] font-semibold">{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          {analyzerTag && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">
                Top Foods for <span className="text-emerald-400">{analyzerTag}</span> ({analyzerResults.length} found)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyzerResults.map(food => {
                  const colors = CAT_COLORS[food.category] || CAT_COLORS['Herbs & Spices'];
                  return (
                    <motion.button
                      key={food.id}
                      onClick={() => { setSelected(food); setActiveTab('explorer'); }}
                      whileHover={{ scale: 1.02 }}
                      className="text-left flex items-center gap-4 p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 hover:border-slate-700 transition-all group"
                    >
                      <span className="text-3xl flex-shrink-0">{food.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-200">{food.name}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors.text} ${colors.bg}`}>{food.category.split(' ')[0]}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{food.immunity}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 flex-shrink-0 transition-colors" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="nutrients" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { label: 'Vitamin C', foods: ['Amla', 'Papaya', 'Broccoli', 'Tulsi'], color: 'amber', note: 'Critical for immune defense and collagen synthesis' },
              { label: 'Iron', foods: ['Moringa', 'Spinach', 'Bajra', 'Dates'], color: 'rose', note: 'Essential for oxygen transport and immune function' },
              { label: 'Calcium', foods: ['Ragi', 'Almonds', 'Broccoli', 'Chia Seeds'], color: 'blue', note: 'Bone density, nerve transmission, muscle contraction' },
              { label: 'Omega-3 (ALA)', foods: ['Flaxseeds', 'Chia Seeds', 'Walnuts', 'Moringa'], color: 'teal', note: 'Anti-inflammatory, cardiovascular and brain health' },
              { label: 'Antioxidants', foods: ['Blueberry', 'Pomegranate', 'Turmeric', 'Garlic'], color: 'purple', note: 'Free radical neutralization and cellular protection' },
              { label: 'Fiber (Prebiotic)', foods: ['Oats', 'Chia Seeds', 'Flaxseeds', 'Sweet Potato'], color: 'green', note: 'Gut microbiome nourishment and digestive health' },
              { label: 'Magnesium', foods: ['Bajra', 'Oats', 'Almonds', 'Spinach'], color: 'indigo', note: '300+ enzymatic reactions, muscle and nerve function' },
              { label: 'Zinc', foods: ['Moringa', 'Pumpkin Seeds', 'Garlic', 'Quinoa'], color: 'orange', note: 'Immune signaling, wound healing, testosterone synthesis' },
            ].map((n) => (
              <div key={n.label} className={`p-5 rounded-2xl border border-${n.color}-500/20 bg-${n.color}-500/5`}>
                <h4 className={`text-sm font-bold text-${n.color}-400 mb-1`}>{n.label}</h4>
                <p className="text-xs text-slate-400 mb-3">{n.note}</p>
                <div className="flex flex-wrap gap-2">
                  {n.foods.map(f => (
                    <button key={f} onClick={() => { const food = FOOD_DB.find(fd => fd.name === f); if (food) { setSelected(food); setActiveTab('explorer'); } }}
                      className={`text-xs px-2.5 py-1 rounded-full bg-${n.color}-500/10 text-${n.color}-400 border border-${n.color}-500/20 hover:bg-${n.color}-500/20 transition-colors`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

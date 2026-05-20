import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Shield, Syringe, X, ChevronRight, ArrowLeft,
  CheckCircle2, AlertTriangle, Clock, Globe, Star,
  Users, Activity, BookOpen, Calendar, Info,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ScrollArea } from '../components/ui/scroll-area';

interface Vaccine {
  id: number;
  name: string;
  acronym: string;
  diseases: string[];
  type: string;
  manufacturer: string[];
  discoveryYear: number;
  inventor: string;
  doses: number;
  schedule: string;
  ageGroup: string;
  category: string;
  booster: string;
  sideEffects: string[];
  contraindications: string[];
  storageTemp: string;
  whoApproved: boolean;
  cdcRecommended: boolean;
  indianUIP: boolean;
  efficacy: number;
  route: string;
  brands: string[];
  description: string;
}

const VACCINES: Vaccine[] = [
  { id: 1, name: 'Bacille Calmette-Guérin', acronym: 'BCG', diseases: ['Tuberculosis', 'Leprosy', 'Miliary TB'],
    type: 'Live Attenuated', manufacturer: ['Serum Institute of India', 'Sanofi Pasteur', 'Statens Serum Institut'],
    discoveryYear: 1921, inventor: 'Albert Calmette & Camille Guérin', doses: 1, ageGroup: 'Newborn (birth)',
    category: 'Infant', schedule: 'Single dose at birth',
    booster: 'No standard booster recommended', efficacy: 70,
    sideEffects: ['Local redness at injection site', 'Small ulcer at site (expected)', 'Swollen lymph nodes (rare)'],
    contraindications: ['Immunocompromised infants', 'HIV-positive infants', 'Severe immunodeficiency'],
    storageTemp: '2°C to 8°C; protect from light', whoApproved: true, cdcRecommended: false, indianUIP: true,
    route: 'Intradermal (left upper arm)', brands: ['BCG Vaccine BP'],
    description: 'The oldest vaccine still in widespread use. Provides strong protection against severe forms of tuberculosis in children including TB meningitis and miliary TB. Part of the Indian Universal Immunization Programme since 1985.' },

  { id: 2, name: 'Hepatitis B Vaccine', acronym: 'HepB', diseases: ['Hepatitis B', 'Liver Cirrhosis', 'Hepatocellular Carcinoma'],
    type: 'Recombinant Subunit', manufacturer: ['Serum Institute of India', 'Bharat Biotech', 'GlaxoSmithKline'],
    discoveryYear: 1982, inventor: 'Baruch Samuel Blumberg & William Hilleman', doses: 3, ageGroup: 'Birth, 6 weeks, 6 months',
    category: 'Infant', schedule: 'Birth dose within 24 hours, then at 6 and 14 weeks',
    booster: 'Booster at 10–15 years in endemic regions; occupational health every 5 years',
    efficacy: 95,
    sideEffects: ['Soreness at injection site', 'Mild fever', 'Fatigue', 'Headache'],
    contraindications: ['Allergy to yeast', 'Previous severe allergic reaction to HepB vaccine'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: true,
    route: 'Intramuscular (anterolateral thigh in infants; deltoid in adults)',
    brands: ['Engerix-B', 'Recombivax HB', 'Shanvac-B', 'Biovac-B'],
    description: 'Highly effective vaccine against Hepatitis B virus — the leading cause of liver cancer globally. India has reduced HBsAg prevalence significantly since introducing the birth dose. Considered the first anti-cancer vaccine.' },

  { id: 3, name: 'Oral Polio Vaccine', acronym: 'OPV', diseases: ['Poliomyelitis (Types 1, 2, 3)'],
    type: 'Live Attenuated', manufacturer: ['Serum Institute of India', 'Panacea Biotec', 'Bharat Immunologicals'],
    discoveryYear: 1961, inventor: 'Albert Sabin', doses: 4, ageGroup: 'Birth, 6, 10, 14 weeks + booster doses',
    category: 'Infant', schedule: 'Birth (P0), 6 weeks (P1), 10 weeks (P2), 14 weeks (P3)',
    booster: '18 months and 5 years (OPV booster); Pulse Polio campaigns annually',
    efficacy: 99,
    sideEffects: ['Vaccine-Associated Paralytic Polio (VAPP) — extremely rare: 1 in 750,000 first doses', 'Mild GI discomfort'],
    contraindications: ['Immunocompromised individuals', 'Diarrhea on day of vaccination (defer dose)'],
    storageTemp: '-20°C for long-term storage; 2–8°C for up to 3 months',
    whoApproved: true, cdcRecommended: false, indianUIP: true,
    route: 'Oral (2 drops)', brands: ['Polivac', 'OPV (Serum Institute)'],
    description: 'India was declared polio-free in 2014 — a historic achievement. OPV is easy to administer, induces mucosal immunity and creates community protection through natural spread. Bivalent OPV (bOPV) types 1 & 3 used in India after Type 2 eradication.' },

  { id: 4, name: 'DPT Vaccine (DTwP/DTaP)', acronym: 'DPT', diseases: ['Diphtheria', 'Pertussis (Whooping Cough)', 'Tetanus'],
    type: 'Toxoid + Inactivated', manufacturer: ['Serum Institute of India', 'Bharat Biotech', 'Sanofi'],
    discoveryYear: 1948, inventor: 'Louis Sauer', doses: 5, ageGroup: '6, 10, 14 weeks + boosters at 18 months and 5 years',
    category: 'Infant', schedule: '6w, 10w, 14w primary series + 18-month booster + 4-6 year booster',
    booster: 'Tdap at 11–12 years; Td booster every 10 years in adults; Tdap in pregnancy',
    efficacy: 85,
    sideEffects: ['Redness/swelling at injection site', 'Fever', 'Irritability', 'Drowsiness', 'Febrile seizure (rare)'],
    contraindications: ['Severe allergic reaction to previous dose', 'Encephalopathy within 7 days of prior dose'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: true,
    route: 'Intramuscular (anterolateral thigh)',
    brands: ['Pentavac', 'Pediarix', 'Infanrix', 'Easyfour TT'],
    description: 'One of the most impactful vaccines in history. Diphtheria caused massive childhood mortality before this vaccine. Tetanus remains a serious disease in unvaccinated individuals. Pertussis protection wanes — requiring boosters throughout life.' },

  { id: 5, name: 'Haemophilus influenzae type b', acronym: 'Hib', diseases: ['Meningitis', 'Pneumonia', 'Epiglottitis', 'Septicaemia'],
    type: 'Conjugate', manufacturer: ['Serum Institute of India', 'Sanofi Pasteur', 'Merck'],
    discoveryYear: 1985, inventor: 'Porter W. Anderson Jr. & others', doses: 3, ageGroup: '6, 10, 14 weeks',
    category: 'Infant', schedule: '6w, 10w, 14w (3-dose primary series)',
    booster: 'Booster at 18 months in some schedules', efficacy: 95,
    sideEffects: ['Redness at injection site', 'Fever', 'Irritability'],
    contraindications: ['Severe allergic reaction to previous dose', 'Age under 6 weeks'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: true,
    route: 'Intramuscular', brands: ['Hiberix', 'ActHIB', 'PedvaxHIB', 'Pentavac (combination)'],
    description: 'Before this vaccine, Hib was the most common cause of bacterial meningitis in children under 5 globally. Near-elimination of Hib disease achieved in countries with high vaccine coverage. Part of pentavalent combination vaccine in India.' },

  { id: 6, name: 'Pneumococcal Conjugate Vaccine', acronym: 'PCV13', diseases: ['Pneumonia', 'Meningitis', 'Septicaemia', 'Otitis Media'],
    type: 'Conjugate', manufacturer: ['Pfizer (Wyeth)', 'Bharat Biotech (Pneumosil)', 'Serum Institute'],
    discoveryYear: 2000, inventor: 'Robert Austrian (pioneer)', doses: 3, ageGroup: '6, 10, 14 weeks',
    category: 'Infant', schedule: '3-dose series at 6, 10, 14 weeks (Indian schedule)',
    booster: 'Single dose at 12–15 months in some schedules', efficacy: 80,
    sideEffects: ['Injection site reactions', 'Fever', 'Irritability', 'Decreased appetite'],
    contraindications: ['Severe allergy to any component', 'Severe febrile illness'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: true,
    route: 'Intramuscular', brands: ['Prevnar 13', 'Pneumosil', 'Synflorix (PCV10)'],
    description: 'Pneumococcal disease is the leading cause of vaccine-preventable death in children under 5. India introduced PCV nationally in 2021. Pneumosil, manufactured by Serum Institute of India, is a WHO-prequalified affordable option.' },

  { id: 7, name: 'Rotavirus Vaccine', acronym: 'RVV', diseases: ['Rotavirus Diarrhoea', 'Severe Gastroenteritis'],
    type: 'Live Attenuated', manufacturer: ['Bharat Biotech (Rotavac)', 'Serum Institute (Rotasiil)', 'Merck', 'GSK'],
    discoveryYear: 1998, inventor: 'Paul Offit, Fred Clark & others', doses: 3, ageGroup: '6, 10, 14 weeks',
    category: 'Infant', schedule: '3 oral doses at 6, 10, 14 weeks; complete by 32 weeks',
    booster: 'No booster recommended', efficacy: 48,
    sideEffects: ['Mild irritability', 'Mild diarrhoea', 'Vomiting (rare intussusception risk)'],
    contraindications: ['Severe combined immunodeficiency (SCID)', 'History of intussusception', 'Gut malformation'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: true,
    route: 'Oral (liquid drops)', brands: ['Rotavac', 'Rotasiil', 'RotaTeq', 'Rotarix'],
    description: 'Rotavirus is responsible for approximately 100,000 child deaths annually in India. Rotavac, developed by Bharat Biotech with support from PATH and NIH, is an indigenous vaccine at affordable cost. India introduced it nationally in 2016.' },

  { id: 8, name: 'Inactivated Polio Vaccine', acronym: 'IPV', diseases: ['Poliomyelitis'],
    type: 'Inactivated', manufacturer: ['Sanofi Pasteur', 'GlaxoSmithKline'],
    discoveryYear: 1955, inventor: 'Jonas Salk', doses: 2, ageGroup: '14 weeks + 18 months',
    category: 'Child', schedule: '1 fractional dose at 6 weeks intradermally + booster at 14 weeks in India',
    booster: 'Booster at 18 months', efficacy: 99,
    sideEffects: ['Redness at injection site', 'Mild fever'],
    contraindications: ['Severe allergic reaction to neomycin, streptomycin, or polymyxin B'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: true,
    route: 'Intradermal (fractional IPV) or Intramuscular', brands: ['IPOL', 'Imovax Polio'],
    description: 'IPV cannot cause vaccine-associated polio unlike OPV. India introduced fractional IPV (fIPV) intradermally to reduce costs while maintaining seroconversion rates. Essential for polio eradication endgame strategy.' },

  { id: 9, name: 'Measles, Mumps & Rubella Vaccine', acronym: 'MMR', diseases: ['Measles', 'Mumps', 'Rubella (German Measles)', 'Congenital Rubella Syndrome'],
    type: 'Live Attenuated', manufacturer: ['Serum Institute of India', 'Merck (M-M-R II)', 'GSK'],
    discoveryYear: 1971, inventor: 'Maurice Hilleman', doses: 2, ageGroup: '9 months, 15–18 months',
    category: 'Child', schedule: 'Dose 1 at 9 months; Dose 2 at 15–18 months',
    booster: 'Second dose is the booster; additional dose may be given at 4–6 years', efficacy: 97,
    sideEffects: ['Mild fever', 'Rash (5–12 days post vaccination)', 'Mild joint pain', 'Very rare: febrile seizure, thrombocytopenic purpura'],
    contraindications: ['Pregnancy', 'Severe immunodeficiency', 'Allergy to neomycin or gelatin', 'Recent blood products'],
    storageTemp: '2°C to 8°C or frozen; protect from light', whoApproved: true, cdcRecommended: true, indianUIP: true,
    route: 'Subcutaneous', brands: ['M-M-R II', 'Priorix', 'Tresivac (Serum Institute)'],
    description: 'Measles remains a leading cause of child mortality globally. The MMR vaccine was falsely linked to autism — a claim thoroughly debunked by extensive studies. India replaced MR vaccine with MMR for complete mumps protection.' },

  { id: 10, name: 'Varicella (Chickenpox) Vaccine', acronym: 'VZV', diseases: ['Chickenpox (Varicella)', 'Shingles (Herpes Zoster)'],
    type: 'Live Attenuated', manufacturer: ['Merck (Varivax)', 'GSK (Varilrix)', 'Serum Institute'],
    discoveryYear: 1974, inventor: 'Michiaki Takahashi', doses: 2, ageGroup: '15 months, 4–6 years',
    category: 'Child', schedule: '2 doses: 15 months and 4–6 years (or minimum 3 months apart)',
    booster: 'Second dose serves as booster; shingles vaccine (Shingrix) for adults 50+', efficacy: 92,
    sideEffects: ['Mild fever', 'Rash at injection site', 'Mild chickenpox rash (3–4 weeks post)', 'Febrile seizure (rare)'],
    contraindications: ['Pregnancy', 'Severe immunodeficiency', 'Neomycin allergy', 'Active untreated TB'],
    storageTemp: '−50°C to −15°C (frozen storage); 2–8°C for up to 72 hours',
    whoApproved: true, cdcRecommended: true, indianUIP: false,
    route: 'Subcutaneous', brands: ['Varivax', 'Varilrix', 'Varicella Vaccine (Serum)'],
    description: 'Chickenpox can cause severe complications including secondary bacterial infection, pneumonia and encephalitis. Vaccination prevents the disease and also reduces shingles risk later in life. Not yet part of Indian UIP but recommended by IAP.' },

  { id: 11, name: 'Hepatitis A Vaccine', acronym: 'HepA', diseases: ['Hepatitis A', 'Acute Liver Failure'],
    type: 'Inactivated', manufacturer: ['GSK (Havrix)', 'Merck (Vaqta)', 'Biological E (Biovac-A)'],
    discoveryYear: 1992, inventor: 'Philip Provost & Maurice Hilleman', doses: 2, ageGroup: '12 months, 18 months',
    category: 'Child', schedule: 'Dose 1 at 12 months; Dose 2 at 18 months (6–18 months after first)',
    booster: 'Complete primary series provides lifetime protection', efficacy: 95,
    sideEffects: ['Soreness at injection site', 'Headache', 'Fatigue', 'Mild fever'],
    contraindications: ['Severe allergy to alum (aluminum hydroxide) or 2-phenoxyethanol'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: false,
    route: 'Intramuscular (deltoid)', brands: ['Havrix', 'Vaqta', 'Biovac-A', 'Avaxim'],
    description: 'India has high Hepatitis A endemicity, particularly in low-income areas. Recommended by IAP for all children. Essential for travellers to endemic regions. Combination Hepatitis A+B vaccine (Twinrix) available for adults.' },

  { id: 12, name: 'Typhoid Conjugate Vaccine', acronym: 'TCV', diseases: ['Typhoid Fever', 'Drug-resistant Salmonella typhi'],
    type: 'Conjugate', manufacturer: ['Bharat Biotech (Typbar TCV)', 'Bio Farma', 'Sanofi (Typhim Vi — polysaccharide)'],
    discoveryYear: 2013, inventor: 'Bharat Biotech (Typbar TCV)', doses: 1, ageGroup: '9 months+',
    category: 'Child', schedule: 'Single dose at 9 months to 15 years',
    booster: 'Booster at 3 years interval recommended', efficacy: 81,
    sideEffects: ['Injection site pain', 'Mild fever', 'Malaise'],
    contraindications: ['Severe allergic reaction to previous typhoid vaccine', 'Severe febrile illness'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: false, indianUIP: true,
    route: 'Intramuscular', brands: ['Typbar TCV', 'PedaTyph', 'Typhim Vi (polysaccharide — not conjugate)'],
    description: 'Typhoid remains a major public health challenge in India, especially with rising drug resistance. Typbar TCV (Bharat Biotech) was the first conjugate typhoid vaccine to receive WHO prequalification and is part of Indian UIP in endemic areas.' },

  { id: 13, name: 'HPV Vaccine', acronym: 'HPV', diseases: ['Cervical Cancer', 'Genital Warts', 'Vulvar/Vaginal Cancer', 'Oropharyngeal Cancer'],
    type: 'Recombinant Subunit', manufacturer: ['Merck (Gardasil 9)', 'GSK (Cervarix)', 'Serum Institute (Cervavac)'],
    discoveryYear: 2006, inventor: 'Ian Frazer & Jian Zhou', doses: 2, ageGroup: '9–14 years (2 doses); 15+ (3 doses)',
    category: 'Adolescent', schedule: '0 and 6 months (9–14 years); 0, 2 and 6 months (15+ years)',
    booster: 'No booster currently recommended', efficacy: 99,
    sideEffects: ['Injection site pain', 'Syncope (fainting — brief post-injection)', 'Nausea', 'Dizziness', 'Headache'],
    contraindications: ['Pregnancy', 'Severe yeast allergy', 'Severe reaction to previous HPV vaccine dose'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: false,
    route: 'Intramuscular (deltoid)', brands: ['Gardasil 9', 'Cervarix', 'Cervavac (Serum Institute — affordable Indian option)'],
    description: 'Cervical cancer is the second most common cancer in Indian women. Nearly all cervical cancers are caused by HPV. Cervavac (Serum Institute) — an indigenous quadrivalent HPV vaccine — was approved in 2022 at significantly lower cost, making mass vaccination feasible in India.' },

  { id: 14, name: 'Influenza Vaccine', acronym: 'FLU', diseases: ['Seasonal Influenza', 'Influenza A & B', 'H1N1 Swine Flu'],
    type: 'Inactivated / Live Attenuated (LAIV)', manufacturer: ['Abbott (Influvac)', 'Serum Institute', 'Sanofi Pasteur (Vaxigrip)', 'GSK (Fluarix)'],
    discoveryYear: 1945, inventor: 'Thomas Francis Jr.', doses: 1, ageGroup: 'Annual vaccination for all ages 6 months+',
    category: 'Adult', schedule: 'Single dose annually before monsoon season (July–September in India)',
    booster: 'Annual revaccination required due to antigenic drift', efficacy: 60,
    sideEffects: ['Arm soreness', 'Low-grade fever', 'Muscle aches', 'Nasal congestion (LAIV nasal spray)'],
    contraindications: ['Severe egg allergy (egg-based vaccines)', 'Previous Guillain-Barré syndrome', 'Age under 6 months'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: false,
    route: 'Intramuscular or nasal spray (LAIV)', brands: ['Influvac', 'Vaxigrip Tetra', 'Fluarix Tetra', 'Nasovac-S (LAIV)'],
    description: 'Influenza vaccine composition is updated annually based on WHO surveillance of circulating strains. High-dose and adjuvanted formulations available for adults 65+. Particularly recommended for healthcare workers, pregnant women, elderly, and immunocompromised.' },

  { id: 15, name: 'Meningococcal Vaccine', acronym: 'MCV4', diseases: ['Bacterial Meningitis', 'Meningococcal Septicaemia'],
    type: 'Conjugate', manufacturer: ['Sanofi Pasteur (Menactra)', 'Pfizer (Nimenrix)', 'GSK (Menveo)'],
    discoveryYear: 1969, inventor: 'Emil Gotschlich', doses: 2, ageGroup: '11–12 years; boosters for high-risk',
    category: 'Adolescent', schedule: '11–12 years, booster at 16 years; pilgrims to Hajj require it',
    booster: 'At 16 years if first dose given at 11–12 years', efficacy: 85,
    sideEffects: ['Injection site pain', 'Fever', 'Headache', 'Fatigue', 'Rare: allergic reaction'],
    contraindications: ['Previous severe allergic reaction to diphtheria toxoid-containing vaccine'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: false,
    route: 'Intramuscular', brands: ['Menactra', 'Nimenrix', 'Menveo', 'Mencevax'],
    description: 'Meningococcal disease can be fatal within 24 hours of symptom onset. Saudi Arabia requires proof of meningococcal vaccination for Hajj/Umra pilgrims. College students in dormitories are at particularly high risk.' },

  { id: 16, name: 'Japanese Encephalitis Vaccine', acronym: 'JE', diseases: ['Japanese Encephalitis', 'Viral Encephalitis'],
    type: 'Live Attenuated / Inactivated', manufacturer: ['Bharat Biotech (JENVAC)', 'Chengdu Institute (SA-14-14-2)'],
    discoveryYear: 1954, inventor: 'Multiple researchers', doses: 1, ageGroup: '9 months–15 years in endemic areas',
    category: 'Child', schedule: 'Single dose at 9–12 months in endemic areas of India',
    booster: 'Booster at 16–24 months; travel booster after 2 years', efficacy: 91,
    sideEffects: ['Injection site reactions', 'Fever', 'Headache', 'Malaise'],
    contraindications: ['Immunodeficiency', 'Pregnancy (live attenuated)'],
    storageTemp: '2°C to 8°C', whoApproved: true, cdcRecommended: false, indianUIP: true,
    route: 'Subcutaneous', brands: ['JENVAC (inactivated)', 'Jeev (live attenuated)'],
    description: 'Japanese encephalitis is endemic in 24 Indian states/UTs. It is the leading cause of viral encephalitis in Asia. JENVAC (Bharat Biotech) is an indigenously developed inactivated vaccine with WHO prequalification.' },

  { id: 17, name: 'Rabies Vaccine', acronym: 'PCECV/HDCV', diseases: ['Rabies'],
    type: 'Inactivated', manufacturer: ['Bharat Biotech (Rabipur)', 'Serum Institute', 'Sanofi (Imovax Rabies)'],
    discoveryYear: 1885, inventor: 'Louis Pasteur', doses: 5, ageGroup: 'Pre-exposure: 3 doses; Post-exposure: 4–5 doses',
    category: 'Adult', schedule: 'Pre-exposure: Days 0, 7, 21/28. Post-exposure: Days 0, 3, 7, 14, 28',
    booster: 'Pre-exposure: every 2–3 years for high-risk individuals', efficacy: 100,
    sideEffects: ['Local pain and swelling', 'Headache', 'Nausea', 'Muscle aches', 'Allergic reaction (rare)'],
    contraindications: ['None absolute for post-exposure prophylaxis — rabies is invariably fatal without treatment'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: true, indianUIP: false,
    route: 'Intramuscular (deltoid)', brands: ['Rabipur', 'Verorab', 'Imovax Rabies', 'Abhayrab'],
    description: 'India accounts for 36% of global rabies deaths — approximately 18,000 per year. Rabies is 100% preventable with timely post-exposure prophylaxis. Dog bites are the primary source. Wound washing with soap and water for 15 minutes is the first and most critical step.' },

  { id: 18, name: 'Cholera Vaccine', acronym: 'OCV', diseases: ['Cholera', 'Vibrio cholerae infection'],
    type: 'Inactivated (Oral)', manufacturer: ['Shantha Biotechnics/Sanofi (Shanchol)', 'Valneva (Dukoral)'],
    discoveryYear: 1990, inventor: 'Multiple researchers (modern OCV)', doses: 2, ageGroup: '1 year and above',
    category: 'Travel', schedule: '2 doses 2 weeks apart; complete 1 week before travel',
    booster: 'Every 2 years for adults; annually for children 2–6 years', efficacy: 65,
    sideEffects: ['Generally well-tolerated', 'Mild GI upset', 'Nausea'],
    contraindications: ['Severe GI illness on day of vaccination', 'Allergy to any component'],
    storageTemp: '2°C to 8°C; do not freeze', whoApproved: true, cdcRecommended: false, indianUIP: false,
    route: 'Oral', brands: ['Shanchol', 'Dukoral', 'OrchoVax'],
    description: 'Cholera is endemic in parts of India and Southeast Asia. Oral cholera vaccine provides moderate protection and is recommended for travellers to endemic areas, humanitarian aid workers, and during outbreak response campaigns.' },

  { id: 19, name: 'Yellow Fever Vaccine', acronym: 'YF', diseases: ['Yellow Fever'],
    type: 'Live Attenuated', manufacturer: ['Sanofi Pasteur (Stamaril)', 'Bio-Manguinhos'],
    discoveryYear: 1937, inventor: 'Max Theiler', doses: 1, ageGroup: '9 months and above; Travellers to endemic zones',
    category: 'Travel', schedule: 'Single dose at least 10 days before travel to endemic country',
    booster: 'Considered lifelong after a single dose (previously every 10 years)', efficacy: 99,
    sideEffects: ['Mild fever', 'Headache', 'Muscle pain', 'Rare: vaccine-associated viscerotropic disease (VAVD) — severe, elderly risk'],
    contraindications: ['Age under 9 months', 'Immunocompromised', 'Thymus disorder', 'Egg allergy', 'Pregnancy (unless high risk)'],
    storageTemp: '2°C to 8°C; must be used within 1 hour of reconstitution',
    whoApproved: true, cdcRecommended: true, indianUIP: false,
    route: 'Subcutaneous', brands: ['Stamaril', 'YF-Vax'],
    description: 'Required by international health regulations for entry into many African and South American countries. India requires proof of yellow fever vaccination from travellers arriving from endemic countries. Administered only at approved international vaccination centres.' },

  { id: 20, name: 'COVID-19 Vaccine (Covaxin)', acronym: 'BBV152', diseases: ['COVID-19 (SARS-CoV-2)', 'Severe Acute Respiratory Syndrome'],
    type: 'Inactivated', manufacturer: ['Bharat Biotech (Covaxin)', 'Serum Institute (Covishield — ChAdOx1)', 'Zydus (ZyCoV-D)'],
    discoveryYear: 2021, inventor: 'Bharat Biotech & ICMR-NIV', doses: 2, ageGroup: '12 years and above',
    category: 'Adult', schedule: 'Doses 4 weeks apart for Covaxin; 12–16 weeks for Covishield',
    booster: 'Precaution (booster) dose recommended at 9 months after primary series', efficacy: 78,
    sideEffects: ['Injection site pain', 'Fever', 'Fatigue', 'Headache', 'Myalgia', 'Very rare AEFI — myocarditis (mRNA vaccines)', 'Rare VITT (adenoviral vector vaccines)'],
    contraindications: ['Severe allergy to any component', 'Thrombocytopenia (adenoviral vector vaccines)'],
    storageTemp: '2°C to 8°C (Covaxin); 2–8°C (Covishield)', whoApproved: true, cdcRecommended: true, indianUIP: false,
    route: 'Intramuscular (deltoid)', brands: ['Covaxin (BBV152)', 'Covishield (ChAdOx1)', 'ZyCoV-D (DNA — needle-free)'],
    description: 'India launched the world\'s largest COVID-19 vaccination campaign — "Tika Utsav." Covaxin is India\'s indigenous inactivated COVID-19 vaccine developed by Bharat Biotech with ICMR. ZyCoV-D by Zydus is the world\'s first DNA vaccine for human use, administered needle-free via PharmaJet.' },

  { id: 21, name: 'Shingles (Herpes Zoster) Vaccine', acronym: 'RZV', diseases: ['Herpes Zoster (Shingles)', 'Post-herpetic Neuralgia'],
    type: 'Recombinant Subunit', manufacturer: ['GSK (Shingrix)'],
    discoveryYear: 2017, inventor: 'GSK Research', doses: 2, ageGroup: '50 years and above',
    category: 'Elderly', schedule: '2 doses 2–6 months apart',
    booster: 'Studies ongoing; current evidence suggests lasting protection', efficacy: 91,
    sideEffects: ['Strong injection site reactions', 'Fatigue', 'Muscle pain', 'Shivering', 'Headache — side effects common but transient'],
    contraindications: ['Current shingles episode', 'Allergy to any component; note: NOT live — safe for immunocompromised'],
    storageTemp: '2°C to 8°C; adjuvant stored frozen', whoApproved: true, cdcRecommended: true, indianUIP: false,
    route: 'Intramuscular (deltoid)', brands: ['Shingrix'],
    description: 'Shingles affects 1 in 3 people in their lifetime and risk increases dramatically with age. Post-herpetic neuralgia — debilitating nerve pain lasting months — occurs in 10–15% of cases. Shingrix is preferred over the older Zostavax due to superior efficacy even in immunocompromised adults.' },
];

const SCHEDULES: { age: string; vaccines: string[]; icon: string }[] = [
  { age: 'Birth', vaccines: ['BCG', 'OPV-0 (Zero dose)', 'Hepatitis B (Birth dose — within 24 hours)'], icon: '🍼' },
  { age: '6 Weeks', vaccines: ['DTwP-1 / DTaP-1', 'IPV-1 (Fractional intradermal)', 'Hib-1', 'Rotavirus-1', 'PCV-1', 'Hepatitis B-1'], icon: '📅' },
  { age: '10 Weeks', vaccines: ['DTwP-2 / DTaP-2', 'IPV-2', 'Hib-2', 'Rotavirus-2', 'PCV-2'], icon: '📅' },
  { age: '14 Weeks', vaccines: ['DTwP-3 / DTaP-3', 'IPV-3', 'Hib-3', 'Rotavirus-3 (last dose by 32 weeks)', 'PCV-3', 'Typhoid Conjugate Vaccine (TCV)'], icon: '📅' },
  { age: '6 Months', vaccines: ['OPV-1', 'Hepatitis B-2', 'Influenza-1 (IAP recommendation)'], icon: '👶' },
  { age: '9 Months', vaccines: ['MMR-1', 'Vitamin A-1 (100,000 IU)', 'OPV-2', 'Typhoid Conjugate Vaccine (if not given at 14w)', 'JE Vaccine-1 (endemic areas)'], icon: '👶' },
  { age: '12–15 Months', vaccines: ['Hepatitis A-1', 'Varicella-1 (IAP; not UIP)', 'PCV Booster (if 3+1 schedule)'], icon: '🧒' },
  { age: '15–18 Months', vaccines: ['MMR-2', 'DTwP Booster-1', 'IPV Booster', 'Hib Booster', 'Varicella-2 (minimum 3 months after first)'], icon: '🧒' },
  { age: '18–24 Months', vaccines: ['OPV Booster', 'Hepatitis A-2', 'JE Vaccine-2 (endemic areas)'], icon: '🧒' },
  { age: '4–6 Years', vaccines: ['DTwP Booster-2 / Tdap', 'OPV Booster-2', 'MMR-3 (IAP)', 'Varicella Booster (if 2-dose schedule not completed)'], icon: '🧒' },
  { age: '10–12 Years (Adolescent)', vaccines: ['Tdap (Tetanus, diphtheria, acellular pertussis booster)', 'HPV Vaccine (Girls AND Boys — 2-dose series)', 'Typhoid booster', 'Influenza (annual)', 'Meningococcal (if travelling/pilgrim/college)'], icon: '🧑' },
  { age: 'Adult (18–49 years)', vaccines: ['Influenza (annual)', 'Td Booster (every 10 years)', 'Hepatitis B series (if not done)', 'MMR (if not immune)', 'Varicella (if not immune)', 'HPV (up to 26 years)', 'COVID-19 (primary + booster)', 'Travel vaccines as needed'], icon: '🧑‍💼' },
  { age: 'Pregnant Women', vaccines: ['Tdap (27–36 weeks every pregnancy)', 'Influenza (any trimester)', 'COVID-19 (2nd or 3rd trimester safe)', 'Hepatitis B (if non-immune)'], icon: '🤰' },
  { age: 'Adults 50+ / Elderly', vaccines: ['Influenza (annual; high-dose or adjuvanted preferred)', 'Pneumococcal (PCV15/PCV20 or PCV13 + PPSV23)', 'Shingrix (Herpes Zoster) — 2 doses', 'Td Booster (every 10 years)', 'COVID-19 booster'], icon: '👴' },
];

const TYPE_COLORS: Record<string, string> = {
  'Live Attenuated': 'text-green-400 bg-green-500/10 border-green-500/25',
  'Inactivated': 'text-blue-400 bg-blue-500/10 border-blue-500/25',
  'Inactivated (Oral)': 'text-blue-400 bg-blue-500/10 border-blue-500/25',
  'Recombinant Subunit': 'text-purple-400 bg-purple-500/10 border-purple-500/25',
  'mRNA': 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  'Toxoid': 'text-rose-400 bg-rose-500/10 border-rose-500/25',
  'Toxoid + Inactivated': 'text-orange-400 bg-orange-500/10 border-orange-500/25',
  'Conjugate': 'text-teal-400 bg-teal-500/10 border-teal-500/25',
};

const CATEGORIES = ['All', 'Infant', 'Child', 'Adolescent', 'Adult', 'Travel', 'Elderly'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs">
        <p className="text-slate-300 font-semibold">{label}</p>
        <p className="text-blue-400">{payload[0]?.value}% efficacy</p>
      </div>
    );
  }
  return null;
};

export default function VaccineGuide() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Vaccine | null>(null);
  const [activeTab, setActiveTab] = useState('database');

  const filtered = useMemo(() => VACCINES.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      v.name.toLowerCase().includes(q) ||
      v.acronym.toLowerCase().includes(q) ||
      v.diseases.some(d => d.toLowerCase().includes(q)) ||
      v.brands.some(b => b.toLowerCase().includes(q)) ||
      v.type.toLowerCase().includes(q);
    const matchCat = category === 'All' || v.category === category;
    return matchSearch && matchCat;
  }), [search, category]);

  const efficacyData = VACCINES.slice(0, 10).map(v => ({ name: v.acronym, value: v.efficacy, fill: v.efficacy >= 90 ? '#34d399' : v.efficacy >= 75 ? '#60a5fa' : '#fbbf24' }));
  const typeData = Object.entries(
    VACCINES.reduce((acc, v) => { const t = v.type.split(' (')[0]; acc[t] = (acc[t] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));
  const TYPE_PIE_COLORS = ['#34d399', '#60a5fa', '#818cf8', '#f59e0b', '#f87171', '#a78bfa', '#2dd4bf'];

  const tc = selected ? (TYPE_COLORS[selected.type] || TYPE_COLORS['Inactivated']) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <PageHeader
        icon={Syringe}
        title="Vaccine Guide"
        description="Complete immunization intelligence — global vaccine database, schedules, and disease prevention data."
        color="blue"
        badge="Immunization"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vaccines in Database', value: VACCINES.length, color: 'text-blue-400' },
          { label: 'Diseases Prevented', value: '35+', color: 'text-teal-400' },
          { label: 'WHO Approved', value: VACCINES.filter(v => v.whoApproved).length, color: 'text-green-400' },
          { label: 'Indian UIP Schedule', value: VACCINES.filter(v => v.indianUIP).length, color: 'text-indigo-400' },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02, y: -1 }} className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm">
            <p className="text-[11px] font-medium text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/80 border border-slate-800/60 p-1 rounded-2xl h-auto">
          <TabsTrigger value="database" className="rounded-xl data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-400 text-slate-400 text-sm px-4 py-2">
            <Shield className="w-4 h-4 mr-2" /> Vaccine Database
          </TabsTrigger>
          <TabsTrigger value="schedule" className="rounded-xl data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-400 text-slate-400 text-sm px-4 py-2">
            <Calendar className="w-4 h-4 mr-2" /> Immunization Schedule
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-xl data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-400 text-slate-400 text-sm px-4 py-2">
            <Activity className="w-4 h-4 mr-2" /> Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="mt-6">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Vaccine Database
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-5">
                    <div className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex-shrink-0">
                          <Syringe className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                            <span className="text-sm font-bold text-blue-400">({selected.acronym})</span>
                          </div>
                          {tc && <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border mt-2 ${tc}`}>{selected.type}</span>}
                          <p className="text-slate-400 text-sm mt-3 leading-relaxed">{selected.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Efficacy', value: `${selected.efficacy}%`, color: selected.efficacy >= 90 ? 'text-green-400' : selected.efficacy >= 75 ? 'text-blue-400' : 'text-amber-400' },
                        { label: 'Doses', value: selected.doses, color: 'text-purple-400' },
                        { label: 'Discovered', value: selected.discoveryYear, color: 'text-teal-400' },
                        { label: 'Route', value: selected.route.split(' ')[0], color: 'text-slate-300' },
                      ].map((s, i) => (
                        <div key={i} className="p-3 rounded-xl border border-slate-800/60 bg-slate-900/60 text-center">
                          <p className="text-[10px] text-slate-400 mb-1">{s.label}</p>
                          <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Diseases Prevented</h4>
                      <div className="flex flex-wrap gap-2">
                        {selected.diseases.map(d => <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{d}</span>)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Vaccination Schedule</h4>
                        <p className="text-sm text-slate-300">{selected.schedule}</p>
                        <div className="mt-3 pt-3 border-t border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Booster</p>
                          <p className="text-xs text-slate-400">{selected.booster}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Storage & Route</h4>
                        <p className="text-sm text-slate-300">{selected.route}</p>
                        <div className="mt-3 pt-3 border-t border-slate-800">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">Storage</p>
                          <p className="text-xs text-slate-400">{selected.storageTemp}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Known Side Effects</h4>
                      <ul className="space-y-1.5">
                        {selected.sideEffects.map(s => <li key={s} className="flex items-start gap-2 text-sm text-slate-300"><span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>{s}</li>)}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/5">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Contraindications</h4>
                      <ul className="space-y-1.5">
                        {selected.contraindications.map(c => <li key={c} className="flex items-start gap-2 text-sm text-slate-300"><span className="text-amber-400 mt-0.5 flex-shrink-0">⚠</span>{c}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Inventor & History</h4>
                      <p className="text-sm font-semibold text-white">{selected.inventor}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Developed in {selected.discoveryYear}</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Approvals & Guidelines</h4>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 text-sm ${selected.whoApproved ? 'text-green-400' : 'text-slate-500'}`}>
                          {selected.whoApproved ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />} WHO Prequalified
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${selected.cdcRecommended ? 'text-green-400' : 'text-slate-500'}`}>
                          {selected.cdcRecommended ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />} CDC Recommended
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${selected.indianUIP ? 'text-green-400' : 'text-slate-500'}`}>
                          {selected.indianUIP ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />} India UIP Schedule
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Brand Names</h4>
                      <div className="flex flex-wrap gap-2">
                        {selected.brands.map(b => <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{b}</span>)}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/60">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Manufacturers</h4>
                      <ul className="space-y-1">
                        {selected.manufacturer.map(m => <li key={m} className="text-xs text-slate-400">• {m}</li>)}
                      </ul>
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
                      placeholder="Search vaccine, disease, or brand name..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-500 hover:text-slate-300" /></button>}
                  </div>
                </div>

                <ScrollArea className="w-full pb-2">
                  <div className="flex gap-2 flex-nowrap">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setCategory(c)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          category === c ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-slate-600 hover:text-slate-300'
                        }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((vaccine) => {
                    const tc = TYPE_COLORS[vaccine.type] || TYPE_COLORS['Inactivated'];
                    return (
                      <motion.button
                        key={vaccine.id}
                        onClick={() => setSelected(vaccine)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-left p-5 rounded-2xl border border-slate-800/60 bg-slate-900/60 hover:border-slate-700 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/20">
                            <Syringe className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tc}`}>{vaccine.type.split(' ')[0]}</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-200 group-hover:text-white truncate">{vaccine.acronym}</h3>
                          {vaccine.indianUIP && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 flex-shrink-0">UIP</span>}
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3 line-clamp-2">{vaccine.diseases.join(', ')}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{vaccine.efficacy}% efficacy</span>
                          <span><Clock className="w-3 h-3 inline mr-0.5" />{vaccine.doses} dose{vaccine.doses > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
                          <span className="text-[10px] text-slate-500">{vaccine.ageGroup.split(';')[0].trim()}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-300">
                This schedule follows the <strong className="text-blue-400">Indian Academy of Pediatrics (IAP) 2023</strong> and <strong className="text-blue-400">Universal Immunization Programme (UIP)</strong> recommendations. Always consult your paediatrician for individual schedules.
              </p>
            </div>

            <div className="space-y-3">
              {SCHEDULES.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-lg flex-shrink-0">
                      {entry.icon}
                    </div>
                    {i < SCHEDULES.length - 1 && <div className="w-px flex-1 mt-1 bg-slate-800" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <h4 className="text-sm font-bold text-blue-400 mb-2">{entry.age}</h4>
                    <div className="flex flex-wrap gap-2">
                      {entry.vaccines.map(v => (
                        <span key={v} className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">{v}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/60">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Vaccine Efficacy Comparison</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={efficacyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {efficacyData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/60">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Vaccine Types Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name.split(' ')[0]}: ${value}`} labelLine={false} fontSize={9} fill="#60a5fa">
                    {typeData.map((_, i) => <Cell key={i} fill={TYPE_PIE_COLORS[i % TYPE_PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Diseases Eradicated by Vaccines', items: ['Smallpox (1980 — only human disease ever eradicated)', 'Rinderpest (animal disease, 2011)', 'Polio (India: 2014; Wild poliovirus Type 2 & 3 globally eradicated)'], color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/5', icon: CheckCircle2 },
              { label: 'Vaccine Preventable Deaths Averted (Global/Year)', items: ['~3–4 million deaths prevented annually', '~1.5 million additional if coverage improved', 'Measles vaccine alone saves 1+ million lives/year', 'Polio vaccine has averted 1.5 billion cases since 1988'], color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5', icon: Shield },
              { label: 'India Immunization Milestones', items: ['UIP launched: 1978 (BCG, DPT, OPV, TT, Typhoid)', 'Polio-free declared: 27 March 2014', 'Mission Indradhanush: 2015 (missed child catch-up)', 'PCV & Rotavirus added: 2017–2021', 'COVID vaccination: 220 crore+ doses by 2023'], color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5', icon: Globe },
            ].map((card, i) => (
              <div key={i} className={`p-5 rounded-2xl border ${card.border} ${card.bg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                  <h4 className={`text-xs font-bold ${card.color} uppercase tracking-wide`}>{card.label}</h4>
                </div>
                <ul className="space-y-1.5">
                  {card.items.map(item => <li key={item} className="text-xs text-slate-400 leading-relaxed">• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/60">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" /> Upcoming & Emerging Vaccines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'Malaria Vaccine (R21/Matrix-M)', status: 'WHO Approved 2023', desc: 'Oxford/Serum Institute — first vaccine to exceed 75% efficacy threshold', color: 'amber' },
                { name: 'RSV Vaccine (Abrysvo/mRESVIA)', status: 'FDA Approved 2023', desc: 'Respiratory Syncytial Virus — major cause of infant hospitalization', color: 'blue' },
                { name: 'Dengue Vaccine (Qdenga)', status: 'WHO Approved 2024', desc: 'TAK-003 by Takeda — effective against all 4 dengue serotypes', color: 'rose' },
                { name: 'mRNA Flu Vaccine', status: 'Phase 3 Trials', desc: 'Annual update possible via mRNA platform — potentially universal flu protection', color: 'purple' },
                { name: 'Cancer Vaccine (mRNA-4157)', status: 'Phase 3 Trials', desc: 'Personalized melanoma vaccine; Moderna/Merck — reduces recurrence by 49%', color: 'green' },
                { name: 'HIV Vaccine', status: 'Phase 3 Trials', desc: 'HVTN 702 and mosaic HIV-1 mRNA — decades of research converging', color: 'teal' },
              ].map(v => (
                <div key={v.name} className={`p-3 rounded-xl border border-${v.color}-500/20 bg-${v.color}-500/5`}>
                  <p className={`text-xs font-bold text-${v.color}-400 mb-0.5`}>{v.name}</p>
                  <p className="text-[10px] text-slate-500 mb-1">{v.status}</p>
                  <p className="text-[11px] text-slate-400">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

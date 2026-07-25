import { Medicine, MedicineCategory, Order, HealthArticle } from '@/types'

/**
 * Oncology catalog — HalfTablet launches cancer-first.
 * ~53 medicines across targeted therapy, immunotherapy, chemotherapy,
 * hormonal therapy, and supportive care.
 *
 * NOTE: prices are indicative market figures for demo purposes.
 * Replace mrp/halftabletPrice with your distributor price list before launch.
 */

type DrugClass = 'tki' | 'mab' | 'immuno' | 'chemo' | 'hormonal' | 'imid' | 'supportive' | 'gcsf'

const SIDE_EFFECTS: Record<DrugClass, Medicine['sideEffects']> = {
  tki: {
    common: ['Fatigue', 'Nausea', 'Diarrhea', 'Skin rash', 'Muscle cramps'],
    serious: ['Liver problems', 'Fluid retention (swelling)', 'Low blood counts'],
    emergency: ['Difficulty breathing', 'Severe chest pain', 'Unusual bleeding'],
  },
  mab: {
    common: ['Infusion reactions', 'Fever', 'Chills', 'Headache'],
    serious: ['Heart function changes', 'Lung inflammation', 'Serious infections'],
    emergency: ['Severe breathlessness', 'Swelling of face or throat', 'Irregular heartbeat'],
  },
  immuno: {
    common: ['Fatigue', 'Itching', 'Skin rash', 'Joint pain'],
    serious: ['Immune-related inflammation of lungs, liver or gut', 'Thyroid changes'],
    emergency: ['Severe breathlessness', 'Severe abdominal pain', 'Confusion'],
  },
  chemo: {
    common: ['Nausea', 'Vomiting', 'Hair loss', 'Fatigue', 'Mouth sores'],
    serious: ['Low blood counts and infection risk', 'Kidney or nerve effects'],
    emergency: ['Fever above 38°C', 'Uncontrolled vomiting', 'Unusual bleeding or bruising'],
  },
  hormonal: {
    common: ['Hot flashes', 'Joint stiffness', 'Fatigue', 'Mood changes'],
    serious: ['Bone thinning', 'Blood clots', 'Liver changes'],
    emergency: ['Painful leg swelling', 'Sudden breathlessness', 'Severe headache'],
  },
  imid: {
    common: ['Fatigue', 'Constipation', 'Skin rash'],
    serious: ['Blood clots', 'Low blood counts', 'Severe harm to unborn babies — never use in pregnancy'],
    emergency: ['Painful leg swelling', 'Chest pain', 'Severe blistering rash'],
  },
  supportive: {
    common: ['Headache', 'Constipation', 'Mild dizziness'],
    serious: ['Allergic reactions', 'Irregular heartbeat (rare)'],
    emergency: ['Severe allergic reaction', 'Chest pain'],
  },
  gcsf: {
    common: ['Bone pain', 'Headache', 'Mild fever'],
    serious: ['Spleen enlargement', 'Allergic reactions'],
    emergency: ['Severe pain in the left upper abdomen', 'Difficulty breathing'],
  },
}

const IMAGES = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
  'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80',
]

interface Spec {
  id: string
  name: string
  generic: string
  mfr: string
  category: MedicineCategory
  mrp: number
  price: number
  salt: string
  cls: DrugClass
  desc: string
  uses: string[]
  dosage: string
  cold?: boolean
  rx?: boolean
  tags?: string[]
}

function med(s: Spec, i: number): Medicine {
  return {
    id: s.id,
    name: s.name,
    genericName: s.generic,
    manufacturer: s.mfr,
    category: s.category,
    mrp: s.mrp,
    halftabletPrice: s.price,
    discountPercent: Math.round((1 - s.price / s.mrp) * 100),
    inStock: true,
    stockLevel: 'high',
    requiresPrescription: s.rx ?? true,
    imageUrl: IMAGES[i % IMAGES.length],
    description: s.desc,
    uses: s.uses,
    sideEffects: SIDE_EFFECTS[s.cls],
    dosage: s.dosage,
    storage: s.cold
      ? 'Refrigerate at 2–8°C. Do not freeze. Cold chain maintained till delivery.'
      : 'Store below 30°C, away from moisture and direct sunlight.',
    coldChain: s.cold ?? false,
    saltComposition: s.salt,
    rating: 4.5 + ((i * 7) % 5) / 10,
    reviewCount: 40 + ((i * 53) % 280),
    tags: [...(s.tags ?? []), ...s.uses.map(u => u.toLowerCase())],
  }
}

const ORAL = 'Take exactly as prescribed by your oncologist. Do not change the dose or stop without medical advice.'
const INFUSION = 'Administered as an infusion/injection by a healthcare professional. Schedule decided by your oncologist.'

const SPECS: Spec[] = [
  // ---------- Targeted therapy (TKIs, oral) ----------
  { id: 'm1', name: 'Imatinib 400mg', generic: 'Imatinib Mesylate', mfr: 'Natco Pharma', category: 'blood-cancer', mrp: 18000, price: 2700, salt: 'Imatinib Mesylate 400mg', cls: 'tki', desc: 'Targeted therapy that transformed CML treatment — blocks the BCR-ABL protein that drives the cancer.', uses: ['Chronic Myeloid Leukemia (CML)', 'GIST'], dosage: '400mg once daily with a meal and a large glass of water.', tags: ['kinase inhibitor'] },
  { id: 'm2', name: 'Dasatinib 50mg', generic: 'Dasatinib', mfr: 'BDR Pharma', category: 'blood-cancer', mrp: 32000, price: 4800, salt: 'Dasatinib 50mg', cls: 'tki', desc: 'Second-generation targeted therapy for CML, including cases resistant to imatinib.', uses: ['Chronic Myeloid Leukemia (CML)', 'Ph+ ALL'], dosage: ORAL, tags: ['kinase inhibitor'] },
  { id: 'm3', name: 'Nilotinib 200mg', generic: 'Nilotinib', mfr: 'Novartis / generic', category: 'blood-cancer', mrp: 42000, price: 9500, salt: 'Nilotinib 200mg', cls: 'tki', desc: 'Targeted CML therapy taken on an empty stomach, often used after imatinib.', uses: ['Chronic Myeloid Leukemia (CML)'], dosage: 'Twice daily on an empty stomach — no food 2 hours before and 1 hour after.', tags: ['kinase inhibitor'] },
  { id: 'm4', name: 'Ibrutinib 140mg', generic: 'Ibrutinib', mfr: 'Zydus', category: 'blood-cancer', mrp: 62000, price: 9800, salt: 'Ibrutinib 140mg', cls: 'tki', desc: 'BTK inhibitor for chronic lymphocytic leukemia and certain lymphomas.', uses: ['CLL', 'Mantle Cell Lymphoma'], dosage: ORAL, tags: ['BTK inhibitor'] },
  { id: 'm5', name: 'Ruxolitinib 5mg', generic: 'Ruxolitinib', mfr: 'Cipla', category: 'blood-cancer', mrp: 38000, price: 7200, salt: 'Ruxolitinib Phosphate 5mg', cls: 'tki', desc: 'JAK inhibitor for myelofibrosis and polycythemia vera.', uses: ['Myelofibrosis', 'Polycythemia Vera'], dosage: ORAL, tags: ['JAK inhibitor'] },
  { id: 'm6', name: 'Gefitinib 250mg', generic: 'Gefitinib', mfr: 'Natco Pharma', category: 'lung-cancer', mrp: 15500, price: 2200, salt: 'Gefitinib 250mg', cls: 'tki', desc: 'EGFR-targeted therapy for non-small cell lung cancer with EGFR mutations.', uses: ['EGFR+ Non-Small Cell Lung Cancer'], dosage: '250mg once daily, with or without food.', tags: ['EGFR inhibitor'] },
  { id: 'm7', name: 'Erlotinib 150mg', generic: 'Erlotinib', mfr: 'Cipla', category: 'lung-cancer', mrp: 18000, price: 2900, salt: 'Erlotinib Hydrochloride 150mg', cls: 'tki', desc: 'EGFR-targeted therapy for advanced non-small cell lung cancer.', uses: ['EGFR+ Non-Small Cell Lung Cancer', 'Pancreatic Cancer'], dosage: 'Once daily at least 1 hour before or 2 hours after food.', tags: ['EGFR inhibitor'] },
  { id: 'm8', name: 'Osimertinib 80mg', generic: 'Osimertinib', mfr: 'AstraZeneca / generic', category: 'lung-cancer', mrp: 155000, price: 52000, salt: 'Osimertinib Mesylate 80mg', cls: 'tki', desc: 'Third-generation EGFR inhibitor, effective against T790M-resistant lung cancer.', uses: ['EGFR T790M+ Non-Small Cell Lung Cancer'], dosage: ORAL, tags: ['EGFR inhibitor'] },
  { id: 'm9', name: 'Afatinib 40mg', generic: 'Afatinib', mfr: 'Lupin', category: 'lung-cancer', mrp: 24000, price: 5200, salt: 'Afatinib Dimaleate 40mg', cls: 'tki', desc: 'Irreversible EGFR-family blocker for EGFR-mutant lung cancer.', uses: ['EGFR+ Non-Small Cell Lung Cancer'], dosage: 'Once daily on an empty stomach.', tags: ['EGFR inhibitor'] },
  { id: 'm10', name: 'Crizotinib 250mg', generic: 'Crizotinib', mfr: 'Mylan', category: 'lung-cancer', mrp: 98000, price: 28000, salt: 'Crizotinib 250mg', cls: 'tki', desc: 'ALK-targeted therapy for ALK-positive advanced lung cancer.', uses: ['ALK+ Non-Small Cell Lung Cancer'], dosage: ORAL, tags: ['ALK inhibitor'] },
  { id: 'm11', name: 'Sunitinib 50mg', generic: 'Sunitinib', mfr: 'Natco Pharma', category: 'uro-cancer', mrp: 39000, price: 7800, salt: 'Sunitinib Malate 50mg', cls: 'tki', desc: 'Multi-kinase inhibitor for kidney cancer and GIST.', uses: ['Renal Cell Carcinoma', 'GIST'], dosage: '4 weeks on, 2 weeks off — exactly as your oncologist schedules.', tags: ['kinase inhibitor'] },
  { id: 'm12', name: 'Sorafenib 200mg', generic: 'Sorafenib', mfr: 'Cipla', category: 'gi-cancer', mrp: 28000, price: 4900, salt: 'Sorafenib Tosylate 200mg', cls: 'tki', desc: 'Targeted therapy for liver and kidney cancer.', uses: ['Hepatocellular Carcinoma', 'Renal Cell Carcinoma'], dosage: 'Twice daily without food (1 hour before or 2 hours after).', tags: ['kinase inhibitor'] },
  { id: 'm13', name: 'Lenvatinib 10mg', generic: 'Lenvatinib', mfr: 'Eisai / generic', category: 'gi-cancer', mrp: 45000, price: 12500, salt: 'Lenvatinib Mesylate 10mg', cls: 'tki', desc: 'Targeted therapy for liver and thyroid cancer.', uses: ['Hepatocellular Carcinoma', 'Thyroid Cancer'], dosage: ORAL, tags: ['kinase inhibitor'] },
  { id: 'm14', name: 'Regorafenib 40mg', generic: 'Regorafenib', mfr: 'Bayer / generic', category: 'gi-cancer', mrp: 52000, price: 14800, salt: 'Regorafenib 40mg', cls: 'tki', desc: 'Oral targeted therapy for advanced colorectal cancer and GIST.', uses: ['Colorectal Cancer', 'GIST'], dosage: '3 weeks on, 1 week off, with a low-fat meal.', tags: ['kinase inhibitor'] },
  { id: 'm15', name: 'Palbociclib 125mg', generic: 'Palbociclib', mfr: 'Pfizer / generic', category: 'breast-cancer', mrp: 85000, price: 17500, salt: 'Palbociclib 125mg', cls: 'tki', desc: 'CDK4/6 inhibitor combined with hormonal therapy for HR+ advanced breast cancer.', uses: ['HR+/HER2− Advanced Breast Cancer'], dosage: '3 weeks on, 1 week off, with food.', tags: ['CDK4/6 inhibitor'] },
  { id: 'm16', name: 'Ribociclib 200mg', generic: 'Ribociclib', mfr: 'Novartis / generic', category: 'breast-cancer', mrp: 58000, price: 21000, salt: 'Ribociclib Succinate 200mg', cls: 'tki', desc: 'CDK4/6 inhibitor for HR-positive advanced breast cancer.', uses: ['HR+/HER2− Advanced Breast Cancer'], dosage: '3 weeks on, 1 week off, once daily in the morning.', tags: ['CDK4/6 inhibitor'] },
  { id: 'm17', name: 'Lapatinib 250mg', generic: 'Lapatinib', mfr: 'Natco Pharma', category: 'breast-cancer', mrp: 22000, price: 4600, salt: 'Lapatinib Ditosylate 250mg', cls: 'tki', desc: 'Oral HER2-targeted therapy, often combined with capecitabine.', uses: ['HER2+ Breast Cancer'], dosage: 'Once daily, 1 hour before or after food.', tags: ['HER2'] },
  { id: 'm18', name: 'Olaparib 150mg', generic: 'Olaparib', mfr: 'AstraZeneca / generic', category: 'gynae-cancer', mrp: 125000, price: 42000, salt: 'Olaparib 150mg', cls: 'tki', desc: 'PARP inhibitor for BRCA-mutated ovarian and breast cancer.', uses: ['BRCA+ Ovarian Cancer', 'BRCA+ Breast Cancer'], dosage: 'Twice daily, swallowed whole.', tags: ['PARP inhibitor'] },
  { id: 'm19', name: 'Everolimus 10mg', generic: 'Everolimus', mfr: 'Biocon', category: 'breast-cancer', mrp: 48000, price: 9200, salt: 'Everolimus 10mg', cls: 'tki', desc: 'mTOR inhibitor for advanced breast and kidney cancer.', uses: ['HR+ Advanced Breast Cancer', 'Renal Cell Carcinoma'], dosage: ORAL, tags: ['mTOR inhibitor'] },

  // ---------- Monoclonal antibodies & immunotherapy (cold chain) ----------
  { id: 'm20', name: 'Trastuzumab 440mg', generic: 'Trastuzumab', mfr: 'Biocon / Roche', category: 'breast-cancer', mrp: 75000, price: 22500, salt: 'Trastuzumab 440mg', cls: 'mab', desc: 'HER2-targeted antibody that changed outcomes in HER2-positive breast cancer.', uses: ['HER2+ Breast Cancer', 'HER2+ Gastric Cancer'], dosage: INFUSION, cold: true, tags: ['HER2', 'biologic'] },
  { id: 'm21', name: 'Rituximab 500mg', generic: 'Rituximab', mfr: 'Dr. Reddy\'s / Roche', category: 'blood-cancer', mrp: 98000, price: 28500, salt: 'Rituximab 500mg', cls: 'mab', desc: 'CD20-targeted antibody for B-cell lymphomas and leukemias.', uses: ['Non-Hodgkin Lymphoma', 'CLL'], dosage: INFUSION, cold: true, tags: ['CD20', 'biologic'] },
  { id: 'm22', name: 'Bevacizumab 400mg', generic: 'Bevacizumab', mfr: 'Hetero / Roche', category: 'gi-cancer', mrp: 85000, price: 24000, salt: 'Bevacizumab 400mg', cls: 'mab', desc: 'Anti-VEGF antibody that starves tumors of blood supply.', uses: ['Colorectal Cancer', 'Ovarian Cancer', 'Lung Cancer'], dosage: INFUSION, cold: true, tags: ['VEGF', 'biologic'] },
  { id: 'm23', name: 'Pertuzumab 420mg', generic: 'Pertuzumab', mfr: 'Roche', category: 'breast-cancer', mrp: 240000, price: 165000, salt: 'Pertuzumab 420mg', cls: 'mab', desc: 'Used with trastuzumab for dual HER2 blockade in breast cancer.', uses: ['HER2+ Breast Cancer'], dosage: INFUSION, cold: true, tags: ['HER2', 'biologic'] },
  { id: 'm24', name: 'Nivolumab 100mg', generic: 'Nivolumab', mfr: 'BMS', category: 'lung-cancer', mrp: 105000, price: 68000, salt: 'Nivolumab 100mg', cls: 'immuno', desc: 'PD-1 immunotherapy that helps your own immune system attack cancer cells.', uses: ['Lung Cancer', 'Melanoma', 'Renal Cell Carcinoma'], dosage: INFUSION, cold: true, tags: ['PD-1', 'immunotherapy'] },
  { id: 'm25', name: 'Pembrolizumab 100mg', generic: 'Pembrolizumab', mfr: 'MSD', category: 'lung-cancer', mrp: 205000, price: 155000, salt: 'Pembrolizumab 100mg', cls: 'immuno', desc: 'PD-1 immunotherapy used across many cancers including lung and melanoma.', uses: ['Lung Cancer', 'Melanoma', 'Head & Neck Cancer'], dosage: INFUSION, cold: true, tags: ['PD-1', 'immunotherapy'] },

  // ---------- Chemotherapy ----------
  { id: 'm26', name: 'Capecitabine 500mg', generic: 'Capecitabine', mfr: 'Cipla', category: 'gi-cancer', mrp: 3200, price: 950, salt: 'Capecitabine 500mg', cls: 'chemo', desc: 'Oral chemotherapy converted to 5-FU inside tumor cells.', uses: ['Colorectal Cancer', 'Breast Cancer', 'Gastric Cancer'], dosage: 'Twice daily within 30 minutes after food, in cycles.', tags: ['oral chemo'] },
  { id: 'm27', name: 'Temozolomide 250mg', generic: 'Temozolomide', mfr: 'Sun Pharma', category: 'other-cancer', mrp: 9800, price: 2400, salt: 'Temozolomide 250mg', cls: 'chemo', desc: 'Oral chemotherapy for brain tumors.', uses: ['Glioblastoma', 'Astrocytoma'], dosage: 'Once daily on an empty stomach, per cycle schedule.', tags: ['brain tumor', 'oral chemo'] },
  { id: 'm28', name: 'Methotrexate 2.5mg', generic: 'Methotrexate', mfr: 'Zydus', category: 'blood-cancer', mrp: 120, price: 45, salt: 'Methotrexate 2.5mg', cls: 'chemo', desc: 'Classic antimetabolite used in leukemias and lymphomas.', uses: ['ALL', 'Lymphoma'], dosage: 'Exactly as prescribed — dosing errors are dangerous. Often weekly, not daily.', tags: ['antimetabolite'] },
  { id: 'm29', name: 'Hydroxyurea 500mg', generic: 'Hydroxyurea', mfr: 'Cipla', category: 'blood-cancer', mrp: 165, price: 68, salt: 'Hydroxyurea 500mg', cls: 'chemo', desc: 'Controls high blood counts in chronic blood cancers.', uses: ['CML', 'Polycythemia Vera', 'Essential Thrombocythemia'], dosage: ORAL, tags: ['oral chemo'] },
  { id: 'm30', name: 'Cyclophosphamide 50mg', generic: 'Cyclophosphamide', mfr: 'Zydus', category: 'breast-cancer', mrp: 240, price: 95, salt: 'Cyclophosphamide 50mg', cls: 'chemo', desc: 'Alkylating chemotherapy used in breast cancer and lymphoma regimens.', uses: ['Breast Cancer', 'Lymphoma'], dosage: ORAL, tags: ['alkylating agent'] },
  { id: 'm31', name: 'Lenalidomide 10mg', generic: 'Lenalidomide', mfr: 'Natco Pharma', category: 'blood-cancer', mrp: 4200, price: 1250, salt: 'Lenalidomide 10mg', cls: 'imid', desc: 'Immunomodulator that is the backbone of multiple myeloma treatment.', uses: ['Multiple Myeloma', 'Myelodysplastic Syndrome'], dosage: '21 days on, 7 days off, per cycle.', tags: ['immunomodulator', 'myeloma'] },
  { id: 'm32', name: 'Pomalidomide 4mg', generic: 'Pomalidomide', mfr: 'Natco Pharma', category: 'blood-cancer', mrp: 12500, price: 3600, salt: 'Pomalidomide 4mg', cls: 'imid', desc: 'Next-generation immunomodulator for relapsed multiple myeloma.', uses: ['Relapsed Multiple Myeloma'], dosage: '21 days on, 7 days off, per cycle.', tags: ['immunomodulator', 'myeloma'] },
  { id: 'm33', name: 'Bortezomib 2mg', generic: 'Bortezomib', mfr: 'Dr. Reddy\'s', category: 'blood-cancer', mrp: 12800, price: 4200, salt: 'Bortezomib 2mg Injection', cls: 'chemo', desc: 'Proteasome inhibitor injection for multiple myeloma.', uses: ['Multiple Myeloma', 'Mantle Cell Lymphoma'], dosage: INFUSION, cold: true, tags: ['proteasome inhibitor', 'myeloma'] },
  { id: 'm34', name: 'Gemcitabine 1g', generic: 'Gemcitabine', mfr: 'Fresenius Kabi', category: 'gi-cancer', mrp: 3800, price: 1450, salt: 'Gemcitabine 1g Injection', cls: 'chemo', desc: 'Infusion chemotherapy for pancreatic, lung and bladder cancer.', uses: ['Pancreatic Cancer', 'Lung Cancer', 'Bladder Cancer'], dosage: INFUSION, tags: ['infusion chemo'] },
  { id: 'm35', name: 'Paclitaxel 260mg', generic: 'Paclitaxel', mfr: 'Cipla', category: 'breast-cancer', mrp: 6800, price: 2600, salt: 'Paclitaxel 260mg Injection', cls: 'chemo', desc: 'Taxane chemotherapy for breast, ovarian and lung cancer.', uses: ['Breast Cancer', 'Ovarian Cancer', 'Lung Cancer'], dosage: INFUSION, tags: ['taxane'] },
  { id: 'm36', name: 'Docetaxel 120mg', generic: 'Docetaxel', mfr: 'Sun Pharma', category: 'breast-cancer', mrp: 8900, price: 3200, salt: 'Docetaxel 120mg Injection', cls: 'chemo', desc: 'Taxane chemotherapy for breast and prostate cancer.', uses: ['Breast Cancer', 'Prostate Cancer'], dosage: INFUSION, tags: ['taxane'] },
  { id: 'm37', name: 'Carboplatin 450mg', generic: 'Carboplatin', mfr: 'Fresenius Kabi', category: 'gynae-cancer', mrp: 2900, price: 1150, salt: 'Carboplatin 450mg Injection', cls: 'chemo', desc: 'Platinum chemotherapy used widely in ovarian and lung cancer.', uses: ['Ovarian Cancer', 'Lung Cancer'], dosage: INFUSION, tags: ['platinum'] },
  { id: 'm38', name: 'Oxaliplatin 100mg', generic: 'Oxaliplatin', mfr: 'Dr. Reddy\'s', category: 'gi-cancer', mrp: 4200, price: 1600, salt: 'Oxaliplatin 100mg Injection', cls: 'chemo', desc: 'Platinum chemotherapy central to colorectal cancer regimens.', uses: ['Colorectal Cancer', 'Gastric Cancer'], dosage: INFUSION, tags: ['platinum'] },
  { id: 'm39', name: 'Pemetrexed 500mg', generic: 'Pemetrexed', mfr: 'Cipla', category: 'lung-cancer', mrp: 12500, price: 3900, salt: 'Pemetrexed 500mg Injection', cls: 'chemo', desc: 'Antifolate chemotherapy for non-squamous lung cancer.', uses: ['Non-Small Cell Lung Cancer', 'Mesothelioma'], dosage: INFUSION, tags: ['antifolate'] },

  // ---------- Hormonal therapy ----------
  { id: 'm40', name: 'Letrozole 2.5mg', generic: 'Letrozole', mfr: 'Sun Pharma', category: 'breast-cancer', mrp: 320, price: 110, salt: 'Letrozole 2.5mg', cls: 'hormonal', desc: 'Aromatase inhibitor — first-line hormonal therapy for HR+ breast cancer after menopause.', uses: ['HR+ Breast Cancer'], dosage: 'One tablet daily, same time each day, usually for 5+ years.', tags: ['aromatase inhibitor'] },
  { id: 'm41', name: 'Anastrozole 1mg', generic: 'Anastrozole', mfr: 'Cipla', category: 'breast-cancer', mrp: 350, price: 125, salt: 'Anastrozole 1mg', cls: 'hormonal', desc: 'Aromatase inhibitor for hormone-receptor-positive breast cancer.', uses: ['HR+ Breast Cancer'], dosage: 'One tablet daily, same time each day.', tags: ['aromatase inhibitor'] },
  { id: 'm42', name: 'Tamoxifen 20mg', generic: 'Tamoxifen Citrate', mfr: 'Zydus', category: 'breast-cancer', mrp: 140, price: 55, salt: 'Tamoxifen Citrate 20mg', cls: 'hormonal', desc: 'The classic hormonal therapy for HR+ breast cancer, effective before and after menopause.', uses: ['HR+ Breast Cancer'], dosage: 'One tablet daily for 5–10 years as prescribed.', tags: ['SERM'] },
  { id: 'm43', name: 'Exemestane 25mg', generic: 'Exemestane', mfr: 'Natco Pharma', category: 'breast-cancer', mrp: 780, price: 260, salt: 'Exemestane 25mg', cls: 'hormonal', desc: 'Steroidal aromatase inhibitor, often used after tamoxifen.', uses: ['HR+ Breast Cancer'], dosage: 'One tablet daily after food.', tags: ['aromatase inhibitor'] },
  { id: 'm44', name: 'Abiraterone 250mg', generic: 'Abiraterone Acetate', mfr: 'Sun Pharma', category: 'uro-cancer', mrp: 16500, price: 3400, salt: 'Abiraterone Acetate 250mg', cls: 'hormonal', desc: 'Blocks androgen production for advanced prostate cancer; taken with prednisolone.', uses: ['Metastatic Prostate Cancer'], dosage: 'Once daily on an empty stomach, with low-dose steroid as prescribed.', tags: ['prostate'] },
  { id: 'm45', name: 'Enzalutamide 40mg', generic: 'Enzalutamide', mfr: 'Astellas / generic', category: 'uro-cancer', mrp: 42000, price: 9800, salt: 'Enzalutamide 40mg', cls: 'hormonal', desc: 'Androgen receptor blocker for advanced prostate cancer.', uses: ['Metastatic Prostate Cancer'], dosage: 'Four capsules once daily, with or without food.', tags: ['prostate'] },
  { id: 'm46', name: 'Bicalutamide 50mg', generic: 'Bicalutamide', mfr: 'Cipla', category: 'uro-cancer', mrp: 280, price: 95, salt: 'Bicalutamide 50mg', cls: 'hormonal', desc: 'Anti-androgen tablet used in prostate cancer treatment.', uses: ['Prostate Cancer'], dosage: 'One tablet daily at the same time.', tags: ['prostate'] },

  // ---------- Supportive care ----------
  { id: 'm47', name: 'Ondansetron 8mg', generic: 'Ondansetron', mfr: 'Cipla', category: 'supportive', mrp: 110, price: 48, salt: 'Ondansetron 8mg', cls: 'supportive', desc: 'Prevents chemotherapy-induced nausea and vomiting.', uses: ['Chemo Nausea Prevention'], dosage: '30 minutes before chemotherapy, then as prescribed.', tags: ['anti-nausea'] },
  { id: 'm48', name: 'Aprepitant 125mg Kit', generic: 'Aprepitant', mfr: 'MSD / generic', category: 'supportive', mrp: 1450, price: 520, salt: 'Aprepitant 125mg + 80mg Kit', cls: 'supportive', desc: '3-day anti-nausea kit for highly emetogenic chemotherapy.', uses: ['Chemo Nausea Prevention'], dosage: '125mg 1 hour before chemo on day 1, then 80mg on days 2 and 3.', tags: ['anti-nausea'] },
  { id: 'm49', name: 'Filgrastim 300mcg', generic: 'Filgrastim', mfr: 'Intas', category: 'supportive', mrp: 1800, price: 750, salt: 'Filgrastim 300mcg Injection', cls: 'gcsf', desc: 'Boosts white blood cells after chemotherapy to reduce infection risk.', uses: ['Chemo-induced Neutropenia'], dosage: 'Daily injection after chemo as prescribed; usually under the skin.', cold: true, tags: ['G-CSF', 'immunity'] },
  { id: 'm50', name: 'Pegfilgrastim 6mg', generic: 'Pegfilgrastim', mfr: 'Biocon', category: 'supportive', mrp: 8500, price: 2900, salt: 'Pegfilgrastim 6mg Injection', cls: 'gcsf', desc: 'Long-acting white-cell booster — one injection per chemo cycle.', uses: ['Chemo-induced Neutropenia'], dosage: 'Single injection about 24 hours after each chemo cycle.', cold: true, tags: ['G-CSF', 'immunity'] },
  { id: 'm51', name: 'Zoledronic Acid 4mg', generic: 'Zoledronic Acid', mfr: 'Natco Pharma', category: 'supportive', mrp: 2800, price: 980, salt: 'Zoledronic Acid 4mg Injection', cls: 'supportive', desc: 'Strengthens bones and treats high calcium when cancer has spread to bone.', uses: ['Bone Metastases', 'Hypercalcemia'], dosage: 'IV infusion every 3–4 weeks at a healthcare facility.', tags: ['bone health'] },
  { id: 'm52', name: 'Megestrol 400mg/10ml', generic: 'Megestrol Acetate', mfr: 'Cipla', category: 'supportive', mrp: 850, price: 340, salt: 'Megestrol Acetate 400mg/10ml Suspension', cls: 'supportive', desc: 'Improves appetite and helps with cancer-related weight loss.', uses: ['Cancer-related Appetite Loss'], dosage: 'Once daily as prescribed.', tags: ['appetite'] },
  { id: 'm53', name: 'Folinic Acid 15mg', generic: 'Calcium Leucovorin', mfr: 'Zydus', category: 'supportive', mrp: 420, price: 160, salt: 'Calcium Leucovorin 15mg', cls: 'supportive', desc: '"Rescue" medicine given after methotrexate to protect healthy cells.', uses: ['Methotrexate Rescue'], dosage: 'Exact timing after methotrexate matters — follow your oncologist\'s schedule strictly.', tags: ['rescue'] },
]

export const MEDICINES: Medicine[] = SPECS.map(med)

export const CONDITIONS = [
  { id: 'blood-cancer',  label: 'Blood Cancers',        icon: '🩸', color: 'from-rose-500 to-red-600',      count: 210 },
  { id: 'breast-cancer', label: 'Breast Cancer',        icon: '🎗️', color: 'from-pink-500 to-rose-500',     count: 185 },
  { id: 'lung-cancer',   label: 'Lung Cancer',          icon: '🫁', color: 'from-blue-500 to-blue-700',     count: 140 },
  { id: 'gi-cancer',     label: 'GI & Liver Cancers',   icon: '🧬', color: 'from-amber-500 to-orange-600',  count: 130 },
  { id: 'uro-cancer',    label: 'Prostate & Kidney',    icon: '🔵', color: 'from-indigo-500 to-purple-600', count: 95 },
  { id: 'gynae-cancer',  label: 'Ovarian & Cervical',   icon: '🌸', color: 'from-fuchsia-500 to-pink-600',  count: 80 },
  { id: 'other-cancer',  label: 'Brain & Rare Cancers', icon: '🧠', color: 'from-violet-500 to-purple-700', count: 60 },
  { id: 'supportive',    label: 'Supportive Care',      icon: '💊', color: 'from-teal-500 to-green-600',    count: 120 },
]

export const HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: 'a1',
    title: 'Understanding CML: What Is Chronic Myeloid Leukemia?',
    slug: 'understanding-cml-chronic-myeloid-leukemia',
    category: 'Blood Cancers',
    excerpt: 'A complete guide to CML — symptoms, diagnosis, and how targeted therapy like Imatinib has transformed treatment outcomes.',
    readTime: 7,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
    publishedAt: '2026-05-12',
    author: 'Dr. Priya Nair, Oncologist',
  },
  {
    id: 'a2',
    title: 'Generic vs Branded Cancer Medicines: What You Need to Know',
    slug: 'generic-vs-branded-cancer-medicines',
    category: 'Treatment Costs',
    excerpt: 'The same molecule can cost 5–10× less as a generic. How Indian generics are approved, and why oncologists trust them.',
    readTime: 6,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    publishedAt: '2026-04-28',
    author: 'Dr. Rajan Menon, Clinical Pharmacologist',
  },
  {
    id: 'a3',
    title: 'Managing Chemotherapy Side Effects at Home',
    slug: 'managing-chemotherapy-side-effects-at-home',
    category: 'Supportive Care',
    excerpt: 'Nausea, mouth sores, fatigue — practical, doctor-approved ways to stay comfortable between chemo cycles.',
    readTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80',
    publishedAt: '2026-06-02',
    author: 'Dr. Kavitha Raman, Palliative Care',
  },
  {
    id: 'a4',
    title: 'Patient Assistance Programs: Free Cancer Medicines You May Qualify For',
    slug: 'patient-assistance-programs-cancer-medicines',
    category: 'Treatment Costs',
    excerpt: 'Pharma access programs, PM-JAY, and NGO funds can cut treatment costs to near zero. A step-by-step eligibility guide.',
    readTime: 9,
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80',
    publishedAt: '2026-06-20',
    author: 'HalfTablet Patient Support Team',
  },
]

export const MOCK_ORDER: Order = {
  id: 'ORD-2026-001234',
  createdAt: '2026-06-12T10:30:00Z',
  status: 'dispatched',
  items: [
    { medicine: MEDICINES[0], quantity: 1, prescriptionUploaded: true },
    { medicine: MEDICINES[39], quantity: 2, prescriptionUploaded: true },
  ],
  totalAmount: 2920,
  deliveryAddress: {
    name: 'Thirumurugan',
    line1: '45, Anna Nagar East',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600102',
    phone: '98765 43210',
  },
  estimatedDelivery: '2026-06-15',
  trackingEvents: [
    { status: 'Order Placed', timestamp: '2026-06-12T10:30:00Z', location: 'Online' },
    { status: 'Prescription Verified', timestamp: '2026-06-12T14:00:00Z', location: 'HalfTablet Pharmacy, Chennai' },
    { status: 'Order Confirmed', timestamp: '2026-06-12T14:15:00Z', location: 'HalfTablet Warehouse, Chennai' },
    { status: 'Dispatched', timestamp: '2026-06-13T09:00:00Z', location: 'HalfTablet Hub, Chennai' },
  ],
}

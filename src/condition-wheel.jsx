import React, { useState } from 'react';

// Mapping conditions to their areas of clinical practice based on Appendix 1
const conditionsWithSpecialties = {
  // Acute and emergency
  "Acid-base abnormality": ["Acute and emergency"],
  "Acute bronchitis": ["Acute and emergency", "General practice and primary healthcare", "Respiratory"],
  "Acute coronary syndromes": ["Acute and emergency", "Cardiovascular"],
  "Acute kidney injury": ["Acute and emergency", "Child health", "Perioperative medicine and anaesthesia", "Renal and urology"],
  "Allergic disorder": ["Acute and emergency", "General practice and primary healthcare", "Respiratory"],
  "Anaphylaxis": ["Acute and emergency", "Child health", "General practice and primary healthcare", "Perioperative medicine and anaesthesia"],
  "Aortic aneurysm": ["Acute and emergency", "Cardiovascular", "Surgery"],
  "Arrhythmias": ["Acute and emergency", "Cardiovascular", "General practice and primary healthcare", "Perioperative medicine and anaesthesia"],
  "Cardiac arrest": ["Acute and emergency", "Child health", "Perioperative medicine and anaesthesia"],
  "Cardiac failure": ["Acute and emergency", "Cardiovascular", "Clinical imaging", "Medicine of older adult", "Palliative and end of life care", "Perioperative medicine and anaesthesia"],
  "Chronic obstructive pulmonary disease": ["Acute and emergency", "General practice and primary healthcare", "Perioperative medicine and anaesthesia", "Respiratory"],
  "Compartment syndrome": ["Acute and emergency", "Musculoskeletal"],
  "Deep vein thrombosis": ["Acute and emergency", "Cardiovascular", "Clinical haematology", "Perioperative medicine and anaesthesia"],
  "Dehydration": ["Acute and emergency", "Child health", "Perioperative medicine and anaesthesia", "Renal and urology"],
  "Diabetic ketoacidosis": ["Acute and emergency", "Child health", "Endocrine and metabolic"],
  "Drug overdose": ["Acute and emergency", "Child health", "Mental health", "Perioperative medicine and anaesthesia"],
  "Ectopic pregnancy": ["Acute and emergency", "Obstetrics and gynaecology"],
  "Epilepsy": ["Acute and emergency", "Child health", "Neurosciences", "Obstetrics and gynaecology"],
  "Epistaxis": ["Acute and emergency", "Clinical haematology", "Ear, nose and throat"],
  "Extradural haemorrhage": ["Acute and emergency", "Clinical imaging", "Neurosciences"],
  "Gastrointestinal perforation": ["Acute and emergency", "Gastrointestinal including liver", "Surgery"],
  "Haemoglobinopathies": ["Acute and emergency", "Clinical haematology"],
  "Hyperosmolar hyperglycaemic state": ["Acute and emergency", "Endocrine and metabolic"],
  "Hyperthermia and hypothermia": ["Acute and emergency", "Endocrine and metabolic", "Medicine of older adult"],
  "Meningitis": ["Acute and emergency", "Child health", "Infection", "Neurosciences"],
  "Myocardial infarction": ["Acute and emergency", "Cardiovascular"],
  "Necrotising fasciitis": ["Acute and emergency", "Infection", "Perioperative medicine and anaesthesia"],
  "Non-accidental injury": ["Acute and emergency", "Child health", "Medicine of older adult", "Musculoskeletal"],
  "Pancytopenia": ["Acute and emergency", "Child health", "Clinical haematology"],
  "Pneumonia": ["Acute and emergency", "Clinical imaging", "Infection", "Respiratory"],
  "Pneumothorax": ["Acute and emergency", "Child health", "Clinical imaging", "Respiratory"],
  "Postpartum haemorrhage": ["Acute and emergency", "Obstetrics and gynaecology", "Perioperative medicine and anaesthesia", "Surgery"],
  "Pulmonary embolism": ["Acute and emergency", "Cardiovascular", "Clinical haematology", "Clinical imaging", "Respiratory"],
  "Raised intracranial pressure": ["Acute and emergency", "Child health", "Clinical imaging", "Neurosciences"],
  "Respiratory arrest": ["Acute and emergency", "Child health", "Perioperative medicine and anaesthesia"],
  "Respiratory failure": ["Acute and emergency", "Perioperative medicine and anaesthesia", "Respiratory"],
  "Self-harm": ["Acute and emergency", "Child health", "Mental health"],
  "Sepsis": ["Acute and emergency", "Child health", "Infection", "Obstetrics and gynaecology", "Perioperative medicine and anaesthesia"],
  "Spinal cord compression": ["Acute and emergency", "Cancer", "Clinical imaging", "Musculoskeletal", "Neurosciences"],
  "Spinal cord injury": ["Acute and emergency", "Clinical imaging", "Musculoskeletal", "Neurosciences"],
  "Spinal fracture": ["Acute and emergency", "Clinical imaging", "Musculoskeletal", "Neurosciences"],
  "Stroke": ["Acute and emergency", "Cardiovascular", "Clinical imaging", "Medicine of older adult", "Neurosciences"],
  "Subarachnoid haemorrhage": ["Acute and emergency", "Child health", "Clinical imaging", "Neurosciences"],
  "Subdural haemorrhage": ["Acute and emergency", "Child health", "Clinical imaging", "Neurosciences"],
  "Substance use disorder": ["Acute and emergency", "Child health", "General practice and primary healthcare", "Mental health", "Obstetrics and gynaecology", "Perioperative medicine and anaesthesia"],
  "Testicular torsion": ["Acute and emergency", "Child health", "Surgery"],
  "Toxic shock syndrome": ["Acute and emergency", "Child health", "Infection"],
  "Transfusion reactions": ["Acute and emergency", "Clinical haematology"],
  "Unstable angina": ["Acute and emergency", "Cardiovascular"],

  // Cancer
  "Basal cell carcinoma": ["Cancer", "Dermatology"],
  "Bladder cancer": ["Cancer", "Clinical imaging", "Renal and urology"],
  "Brain metastases": ["Cancer", "Neurosciences"],
  "Breast cancer": ["Cancer", "Clinical imaging", "Surgery"],
  "Cervical cancer": ["Cancer", "Obstetrics and gynaecology"],
  "Colorectal tumours": ["Cancer", "Gastrointestinal including liver", "Clinical imaging", "Surgery"],
  "Endometrial cancer": ["Cancer", "Obstetrics and gynaecology"],
  "Gastric cancer": ["Cancer", "Gastrointestinal including liver"],
  "Hypercalcaemia of malignancy": ["Cancer", "Endocrine and metabolic"],
  "Leukaemia": ["Cancer", "Child health", "Clinical haematology"],
  "Lung cancer": ["Cancer", "Clinical imaging", "Respiratory"],
  "Lymphoma": ["Cancer", "Child health", "Clinical haematology"],
  "Malignant melanoma": ["Cancer", "Dermatology"],
  "Metastatic disease": ["Cancer", "Musculoskeletal", "Neurosciences", "Palliative and end of life care", "Respiratory"],
  "Multiple myeloma": ["Cancer", "Clinical haematology", "Renal and urology"],
  "Oesophageal cancer": ["Cancer", "Gastrointestinal including liver", "Surgery"],
  "Ovarian cancer": ["Cancer", "Obstetrics and gynaecology", "Surgery"],
  "Pancreatic cancer": ["Cancer", "Gastrointestinal including liver", "Surgery"],
  "Pathological fracture": ["Cancer", "Clinical haematology", "Clinical imaging", "Musculoskeletal"],
  "Patient on anti-coagulant therapy": ["Cancer", "Clinical haematology"],
  "Prostate cancer": ["Cancer", "General practice and primary healthcare", "Renal and urology"],
  "Squamous cell carcinoma": ["Cancer", "Dermatology"],
  "Testicular cancer": ["Cancer", "Renal and urology", "Surgery"],

  // Cardiovascular
  "Aneurysms, ischaemic limb and occlusions": ["Cardiovascular", "Clinical imaging"],
  "Aortic dissection": ["Cardiovascular", "Surgery"],
  "Aortic valve disease": ["Cardiovascular", "Perioperative medicine and anaesthesia", "Surgery"],
  "Arterial thrombosis": ["Cardiovascular"],
  "Arterial ulcers": ["Cardiovascular", "Dermatology"],
  "Gangrene": ["Cardiovascular", "Infection"],
  "Haemochromatosis": ["Cardiovascular", "Clinical haematology", "Gastrointestinal including liver"],
  "Infective endocarditis": ["Cardiovascular", "Infection"],
  "Intestinal ischaemia": ["Cardiovascular", "Clinical imaging", "Surgery"],
  "Ischaemic heart disease": ["Cardiovascular"],
  "Mitral valve disease": ["Cardiovascular"],
  "Myocarditis": ["Cardiovascular"],
  "Pericardial disease": ["Cardiovascular"],
  "Peripheral vascular disease": ["Cardiovascular", "Endocrine and metabolic", "General practice and primary healthcare"],
  "Pulmonary hypertension": ["Cardiovascular", "Respiratory"],
  "Right heart valve disease": ["Cardiovascular"],
  "Transient ischaemic attacks": ["Cardiovascular", "Neurosciences"],
  "Vasovagal syncope": ["Cardiovascular", "General practice and primary healthcare"],
  "Venous ulcers": ["Cardiovascular", "General practice and primary healthcare", "Dermatology"],

  // Child health
  "Anaemia": ["Child health", "Clinical haematology", "Gastrointestinal including liver", "General practice and primary healthcare", "Obstetrics and gynaecology", "Perioperative medicine and anaesthesia"],
  "Appendicitis": ["Child health", "Gastrointestinal including liver"],
  "Asthma": ["Child health", "General practice and primary healthcare", "Perioperative medicine and anaesthesia", "Respiratory"],
  "Atopic dermatitis and eczema": ["Child health", "Dermatology", "General practice and primary healthcare"],
  "Attention deficit hyperactivity disorder": ["Child health", "Mental health"],
  "Autism spectrum disorder": ["Child health", "Mental health"],
  "Biliary atresia": ["Child health"],
  "Bronchiectasis": ["Child health", "Clinical imaging", "Respiratory"],
  "Bronchiolitis": ["Child health", "General practice and primary healthcare", "Respiratory"],
  "Candidiasis": ["Child health", "Infection"],
  "Cellulitis": ["Child health", "Dermatology", "Infection"],
  "Cerebral palsy and hypoxic-ischaemic encephalopathy": ["Child health", "Neurosciences"],
  "Chronic kidney disease": ["Child health", "General practice and primary healthcare", "Perioperative medicine and anaesthesia", "Renal and urology"],
  "Coeliac disease": ["Child health", "Gastrointestinal including liver"],
  "Conjunctivitis": ["Child health", "Infection", "Ophthalmology"],
  "Constipation": ["Child health", "Gastrointestinal including liver", "Medicine of older adult"],
  "Croup": ["Child health", "Ear, nose and throat", "General practice and primary healthcare", "Infection"],
  "Cushing's syndrome": ["Child health", "Endocrine and metabolic"],
  "Cystic fibrosis": ["Child health", "Respiratory"],
  "Developmental delay": ["Child health"],
  "Diabetes mellitus type 1 and 2": ["Child health", "Endocrine and metabolic", "General practice and primary healthcare", "Perioperative medicine and anaesthesia"],
  "Disseminated intravascular coagulation": ["Child health", "Clinical haematology"],
  "Down's syndrome": ["Child health"],
  "Eating disorders": ["Child health", "Gastrointestinal including liver", "Mental health"],
  "Epididymitis and orchitis": ["Child health", "Infection", "Renal and urology"],
  "Epiglottitis": ["Child health", "Ear, nose and throat", "Perioperative medicine and anaesthesia"],
  "Febrile convulsion": ["Child health", "Neurosciences"],
  "Gastro-oesophageal reflux disease": ["Child health", "Gastrointestinal including liver", "General practice and primary healthcare", "Perioperative medicine and anaesthesia"],
  "Henoch-Schonlein purpura": ["Child health"],
  "Hepatitis": ["Child health", "Gastrointestinal including liver", "Infection"],
  "Hernias": ["Child health", "Gastrointestinal including liver", "Surgery"],
  "Herpes simplex virus": ["Child health", "General practice and primary healthcare", "Infection"],
  "Human papilloma virus infection": ["Child health", "Infection"],
  "Hypoglycaemia": ["Child health", "Endocrine and metabolic"],
  "Hyposplenism/splenectomy": ["Child health", "Clinical haematology", "Gastrointestinal including liver"],
  "Hypothyroidism": ["Child health", "Endocrine and metabolic", "General practice and primary healthcare"],
  "Idiopathic arthritis": ["Child health", "Musculoskeletal"],
  "Impetigo": ["Child health", "Dermatology", "General practice and primary healthcare", "Infection"],
  "Inflammatory bowel disease": ["Child health", "Gastrointestinal including liver", "Musculoskeletal"],
  "Influenza": ["Child health", "General practice and primary healthcare", "Infection", "Respiratory"],
  "Intestinal obstruction and ileus": ["Child health", "Clinical imaging", "Perioperative medicine and anaesthesia", "Surgery"],
  "Intussusception": ["Child health", "Clinical imaging", "Surgery"],
  "Kawasaki disease": ["Child health"],
  "Lower respiratory tract infection": ["Child health", "Infection", "Respiratory"],
  "Malaria": ["Child health", "Infection", "Neurosciences"],
  "Malnutrition": ["Child health", "Gastrointestinal including liver", "Medicine of older adult"],
  "Measles": ["Child health", "General practice and primary healthcare", "Infection"],
  "Migraine": ["Child health", "General practice and primary healthcare", "Neurosciences"],
  "Mumps": ["Child health", "General practice and primary healthcare", "Infection"],
  "Muscular dystrophies": ["Child health", "Neurosciences"],
  "Obesity": ["Child health", "Endocrine and metabolic", "General practice and primary healthcare"],
  "Obstructive sleep apnoea": ["Child health", "Ear, nose and throat", "Perioperative medicine and anaesthesia", "Respiratory"],
  "Otitis media": ["Child health", "Ear, nose and throat", "General practice and primary healthcare", "Infection"],
  "Peptic ulcer disease and gastritis": ["Child health", "Gastrointestinal including liver"],
  "Periorbital and orbital cellulitis": ["Child health", "Infection", "Ophthalmology"],
  "Peripheral nerve injuries/palsies": ["Child health", "Neurosciences"],
  "Peritonitis": ["Child health", "Gastrointestinal including liver", "Infection", "Surgery"],
  "Pyloric stenosis": ["Child health"],
  "Reactive arthritis": ["Child health", "General practice and primary healthcare", "Musculoskeletal"],
  "Rubella": ["Child health"],
  "Septic arthritis": ["Child health", "Infection", "Musculoskeletal"],
  "Sickle cell disease": ["Child health", "Clinical haematology"],
  "Tension headache": ["Child health", "General practice and primary healthcare", "Mental health", "Neurosciences"],
  "Thyrotoxicosis": ["Child health", "Endocrine and metabolic"],
  "Tonsillitis": ["Child health", "Ear, nose and throat", "General practice and primary healthcare", "Infection"],
  "Tuberculosis": ["Child health", "Infection", "Respiratory"],
  "Upper respiratory tract infection": ["Child health", "General practice and primary healthcare", "Infection"],
  "Urinary tract infection": ["Child health", "General practice and primary healthcare", "Infection", "Obstetrics and gynaecology", "Renal and urology"],
  "Urticaria": ["Child health", "Dermatology", "General practice and primary healthcare"],
  "Viral exanthema": ["Child health", "General practice and primary healthcare", "Infection"],
  "Viral gastroenteritis": ["Child health", "General practice and primary healthcare", "Infection"],
  "Visual field defects": ["Child health", "Ophthalmology"],
  "Volvulus": ["Child health", "Clinical imaging", "Surgery"],

  // Dermatology
  "Acne vulgaris": ["Dermatology", "General practice and primary healthcare"],
  "Contact dermatitis": ["Dermatology", "General practice and primary healthcare"],
  "Cutaneous fungal infection": ["Dermatology", "General practice and primary healthcare", "Infection"],
  "Cutaneous warts": ["Dermatology", "General practice and primary healthcare", "Infection"],
  "Folliculitis": ["Dermatology", "General practice and primary healthcare", "Infection"],
  "Head lice": ["Dermatology", "Infection"],
  "Pressure sores": ["Dermatology", "Medicine of older adult"],
  "Psoriasis": ["Dermatology", "General practice and primary healthcare", "Musculoskeletal"],
  "Scabies": ["Dermatology", "Infection"],

  // Ear, nose and throat
  "Acoustic neuroma": ["Ear, nose and throat", "Neurosciences"],
  "Benign paroxysmal positional vertigo": ["Ear, nose and throat", "Medicine of older adult", "Neurosciences"],
  "Infectious mononucleosis": ["Ear, nose and throat", "Gastrointestinal including liver", "General practice and primary healthcare", "Infection"],
  "Ménière's disease": ["Ear, nose and throat", "Neurosciences"],
  "Otitis externa": ["Ear, nose and throat", "General practice and primary healthcare"],
  "Rhinosinusitis": ["Ear, nose and throat", "General practice and primary healthcare"],

  // Endocrine and metabolic
  "Addison's disease": ["Endocrine and metabolic"],
  "Diabetes in pregnancy": ["Endocrine and metabolic", "Obstetrics and gynaecology"],
  "Diabetes insipidus": ["Endocrine and metabolic", "Renal and urology"],
  "Diabetic nephropathy": ["Endocrine and metabolic", "Renal and urology"],
  "Diabetic neuropathy": ["Endocrine and metabolic", "Neurosciences"],
  "Essential or secondary hypertension": ["Endocrine and metabolic", "Cardiovascular", "General practice and primary healthcare", "Obstetrics and gynaecology", "Perioperative medicine and anaesthesia"],
  "Hyperlipidemia": ["Endocrine and metabolic"],
  "Hyperparathyroidism": ["Endocrine and metabolic"],
  "Hypoparathyroidism": ["Endocrine and metabolic"],
  "Osteomalacia": ["Endocrine and metabolic", "Musculoskeletal"],
  "Osteoporosis": ["Endocrine and metabolic", "General practice and primary healthcare", "Medicine of older adult", "Musculoskeletal"],
  "Pituitary tumours": ["Endocrine and metabolic"],
  "Thyroid eye disease": ["Endocrine and metabolic", "Ophthalmology"],
  "Thyroid nodules": ["Endocrine and metabolic"],

  // Gastrointestinal including liver
  "Acute cholangitis": ["Gastrointestinal including liver", "Infection"],
  "Acute pancreatitis": ["Gastrointestinal including liver", "Surgery"],
  "Alcoholic hepatitis": ["Gastrointestinal including liver", "Mental health"],
  "Anal fissure": ["Gastrointestinal including liver", "General practice and primary healthcare"],
  "Ascites": ["Gastrointestinal including liver"],
  "Cholecystitis": ["Gastrointestinal including liver"],
  "Cirrhosis": ["Gastrointestinal including liver"],
  "Diverticular disease": ["Gastrointestinal including liver", "General practice and primary healthcare"],
  "Gallstones and biliary colic": ["Gastrointestinal including liver"],
  "Haemorrhoids": ["Gastrointestinal including liver", "General practice and primary healthcare"],
  "Hiatus hernia": ["Gastrointestinal including liver", "General practice and primary healthcare"],
  "Infectious colitis": ["Gastrointestinal including liver", "Infection"],
  "Irritable bowel syndrome": ["Gastrointestinal including liver", "General practice and primary healthcare"],
  "Liver failure": ["Gastrointestinal including liver"],
  "Malabsorption": ["Gastrointestinal including liver"],
  "Mesenteric adenitis": ["Gastrointestinal including liver"],
  "Necrotising enterocolitis": ["Gastrointestinal including liver"],
  "Perianal abscesses and fistulae": ["Gastrointestinal including liver", "Infection", "Surgery"],
  "Vitamin B12 and/or folate deficiency": ["Gastrointestinal including liver"],

  // General practice and primary healthcare
  "Acute stress reaction": ["General practice and primary healthcare", "Mental health"],
  "Anxiety disorder: generalised": ["General practice and primary healthcare", "Mental health"],
  "Anxiety, phobias, OCD": ["General practice and primary healthcare", "Mental health"],
  "Atrophic vaginitis": ["General practice and primary healthcare", "Obstetrics and gynaecology"],
  "Bacterial vaginosis": ["General practice and primary healthcare", "Obstetrics and gynaecology"],
  "Bell's palsy": ["General practice and primary healthcare", "Neurosciences"],
  "Benign eyelid disorders": ["General practice and primary healthcare", "Ophthalmology"],
  "Benign prostatic hyperplasia": ["General practice and primary healthcare", "Renal and urology"],
  "Breast abscess/mastitis": ["General practice and primary healthcare", "Infection", "Surgery"],
  "Bursitis": ["General practice and primary healthcare", "Musculoskeletal"],
  "Chlamydia": ["General practice and primary healthcare", "Infection", "Sexual health"],
  "Chronic fatigue syndrome": ["General practice and primary healthcare", "Neurosciences"],
  "Crystal arthropathy": ["General practice and primary healthcare", "Musculoskeletal"],
  "Dementias": ["General practice and primary healthcare", "Medicine of older adult", "Mental health", "Neurosciences"],
  "Depression": ["General practice and primary healthcare", "Mental health", "Obstetrics and gynaecology"],
  "Disease prevention/screening": ["General practice and primary healthcare"],
  "Fibromyalgia": ["General practice and primary healthcare", "Musculoskeletal"],
  "Gonorrhoea": ["General practice and primary healthcare", "Infection", "Sexual health"],
  "Lower limb soft tissue injury": ["General practice and primary healthcare", "Clinical imaging", "Musculoskeletal"],
  "Lyme disease": ["General practice and primary healthcare", "Infection", "Musculoskeletal"],
  "Menopause": ["General practice and primary healthcare", "Obstetrics and gynaecology"],
  "Osteoarthritis": ["General practice and primary healthcare", "Musculoskeletal"],
  "Parkinson's disease": ["General practice and primary healthcare", "Medicine of older adult", "Neurosciences"],
  "Pelvic inflammatory disease": ["General practice and primary healthcare", "Obstetrics and gynaecology", "Surgery"],
  "Polymyalgia rheumatica": ["General practice and primary healthcare", "Musculoskeletal"],
  "Radiculopathies": ["General practice and primary healthcare", "Musculoskeletal", "Neurosciences"],
  "Syphilis": ["General practice and primary healthcare", "Infection", "Obstetrics and gynaecology", "Sexual health"],
  "Trichomonas vaginalis": ["General practice and primary healthcare", "Infection", "Obstetrics and gynaecology", "Sexual health"],
  "Trigeminal neuralgia": ["General practice and primary healthcare", "Neurosciences"],
  "Upper limb soft tissue injury": ["General practice and primary healthcare", "Clinical imaging", "Musculoskeletal"],
  "Urinary incontinence": ["General practice and primary healthcare", "Medicine of older adult", "Obstetrics and gynaecology", "Renal and urology", "Surgery"],
  "Varicella zoster": ["General practice and primary healthcare", "Infection", "Obstetrics and gynaecology"],
  "Varicose veins": ["General practice and primary healthcare", "Surgery"],
  "Whooping cough": ["General practice and primary healthcare", "Infection"],

  // Infection
  "Brain abscess": ["Infection", "Neurosciences"],
  "Covid-19": ["Infection"],
  "Encephalitis": ["Infection", "Neurosciences"],
  "Notifiable diseases": ["Infection"],
  "Osteomyelitis": ["Infection", "Clinical imaging", "Musculoskeletal"],
  "Surgical site infection": ["Infection", "Clinical imaging", "Perioperative medicine and anaesthesia", "Surgery"],
  "Infectious diarrhoea": ["Infection"],
  "Viral hepatitides": ["Infection"],

  // Medicine of older adult
  "Delirium": ["Medicine of older adult", "Mental health"],
  "Lower limb fractures": ["Medicine of older adult", "Clinical imaging", "Musculoskeletal"],

  // Mental health
  "Anxiety disorder: post-traumatic stress disorder": ["Mental health"],
  "Bipolar affective disorder": ["Mental health"],
  "Personality disorder": ["Mental health"],
  "Schizophrenia": ["Mental health"],
  "Somatisation": ["Mental health"],
  "Wernicke's encephalopathy": ["Mental health", "Neurosciences"],

  // Musculoskeletal
  "Ankylosing spondylitis": ["Musculoskeletal"],
  "Rheumatoid arthritis": ["Musculoskeletal"],
  "Sarcoidosis": ["Musculoskeletal", "Respiratory"],
  "Systemic lupus erythematosus": ["Musculoskeletal"],
  "Upper limb fractures": ["Musculoskeletal", "Clinical imaging"],

  // Neurosciences
  "Essential tremor": ["Neurosciences"],
  "Motor neurone disease": ["Neurosciences"],
  "Multiple sclerosis": ["Neurosciences"],
  "Myasthenia gravis": ["Neurosciences"],

  // Obstetrics and gynaecology
  "Cervical screening (HPV)": ["Obstetrics and gynaecology"],
  "Cord prolapse": ["Obstetrics and gynaecology"],
  "Endometriosis": ["Obstetrics and gynaecology"],
  "Fibroids": ["Obstetrics and gynaecology", "Surgery"],
  "Obesity and pregnancy": ["Obstetrics and gynaecology"],
  "Placenta praevia": ["Obstetrics and gynaecology", "Clinical imaging", "Perioperative medicine and anaesthesia"],
  "Placental abruption": ["Obstetrics and gynaecology", "Perioperative medicine and anaesthesia"],
  "Pre-eclampsia, gestational hypertension": ["Obstetrics and gynaecology", "Perioperative medicine and anaesthesia"],
  "Termination of pregnancy": ["Obstetrics and gynaecology"],
  "Vasa praevia": ["Obstetrics and gynaecology"],
  "VTE in pregnancy and puerperium": ["Obstetrics and gynaecology"],

  // Ophthalmology
  "Acute glaucoma": ["Ophthalmology"],
  "Blepharitis": ["Ophthalmology"],
  "Cataracts": ["Ophthalmology"],
  "Central retinal arterial occlusion": ["Ophthalmology"],
  "Chronic glaucoma": ["Ophthalmology"],
  "Diabetic eye disease": ["Ophthalmology"],
  "Infective keratitis": ["Ophthalmology"],
  "Iritis": ["Ophthalmology"],
  "Macular degeneration": ["Ophthalmology"],
  "Optic neuritis": ["Ophthalmology"],
  "Retinal detachment": ["Ophthalmology"],
  "Scleritis": ["Ophthalmology"],
  "Uveitis": ["Ophthalmology"],

  // Palliative and end of life care
  "Multi-organ dysfunction syndrome": ["Palliative and end of life care"],

  // Renal and urology
  "Nephrotic syndrome": ["Renal and urology"],
  "Urinary tract calculi": ["Renal and urology"],

  // Respiratory
  "Asbestos-related lung disease": ["Respiratory"],
  "Asthma COPD overlap syndrome": ["Respiratory"],
  "Fibrotic lung disease": ["Respiratory"],
  "Occupational lung disease": ["Respiratory"],

  // Surgery
  "Breast cysts": ["Surgery"],
  "Fibroadenoma": ["Surgery"],

  // Clinical haematology
  "Haemophilia": ["Clinical haematology"],
  "Myeloproliferative disorders": ["Clinical haematology"],
  "Patient on anti-platelet therapy": ["Clinical haematology", "Perioperative medicine and anaesthesia"],
  "Polycythaemia": ["Clinical haematology"]
};

export default function ConditionWheel() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [history, setHistory] = useState([]);
  const [filterSpecialties, setFilterSpecialties] = useState([]);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get all conditions, filtered by specialties if selected
  const getFilteredConditions = () => {
    if (filterSpecialties.length === 0) {
      return Object.keys(conditionsWithSpecialties);
    }
    return Object.keys(conditionsWithSpecialties).filter(condition =>
      conditionsWithSpecialties[condition].some(specialty => 
        filterSpecialties.includes(specialty)
      )
    );
  };

  const conditions = getFilteredConditions();

  // Get unique specialties for filter checkboxes
  const allSpecialties = [...new Set(
    Object.values(conditionsWithSpecialties).flat()
  )].sort();

  // Toggle specialty filter
  const toggleSpecialty = (specialty) => {
    setFilterSpecialties(prev => 
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterSpecialties([]);
  };

  const getSpecialtyColor = (specialty) => {
    const colors = {
      "Acute and emergency": "bg-red-100 text-red-800",
      "Cancer": "bg-purple-100 text-purple-800",
      "Cardiovascular": "bg-pink-100 text-pink-800",
      "Child health": "bg-blue-100 text-blue-800",
      "Clinical haematology": "bg-rose-100 text-rose-800",
      "Clinical imaging": "bg-cyan-100 text-cyan-800",
      "Dermatology": "bg-orange-100 text-orange-800",
      "Ear, nose and throat": "bg-amber-100 text-amber-800",
      "Endocrine and metabolic": "bg-lime-100 text-lime-800",
      "Gastrointestinal including liver": "bg-yellow-100 text-yellow-800",
      "General practice and primary healthcare": "bg-green-100 text-green-800",
      "Infection": "bg-emerald-100 text-emerald-800",
      "Medicine of older adult": "bg-teal-100 text-teal-800",
      "Mental health": "bg-sky-100 text-sky-800",
      "Musculoskeletal": "bg-indigo-100 text-indigo-800",
      "Neurosciences": "bg-violet-100 text-violet-800",
      "Obstetrics and gynaecology": "bg-fuchsia-100 text-fuchsia-800",
      "Ophthalmology": "bg-slate-100 text-slate-800",
      "Palliative and end of life care": "bg-gray-100 text-gray-800",
      "Perioperative medicine and anaesthesia": "bg-zinc-100 text-zinc-800",
      "Renal and urology": "bg-stone-100 text-stone-800",
      "Respiratory": "bg-red-50 text-red-700",
      "Sexual health": "bg-pink-50 text-pink-700",
      "Surgery": "bg-blue-50 text-blue-700"
    };
    return colors[specialty] || "bg-gray-100 text-gray-800";
  };

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    setSelectedCondition(null);
    setSelectedSpecialties([]);

    // Random condition selection
    const randomIndex = Math.floor(Math.random() * conditions.length);
    const selected = conditions[randomIndex];
    const specialties = conditionsWithSpecialties[selected];

    // Calculate rotation (multiple full spins + landing position)
    const spins = 5 + Math.random() * 3;
    const extraRotation = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + extraRotation;

    setRotation(totalRotation);

    // Show result after animation
    setTimeout(() => {
      setSelectedCondition(selected);
      setSelectedSpecialties(specialties);
      setSpinning(false);
      setHistory(prev => [{ condition: selected, specialties }, ...prev].slice(0, 10));
    }, 3000);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-center text-indigo-900 mb-2">
            MLA Condition Wheel
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Spin to generate a random medical condition with its clinical specialty
          </p>

          {/* How to Use Toggle Button */}
          <div className="text-center">
            <button
              onClick={() => setShowHowToUse(!showHowToUse)}
              className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              {showHowToUse ? '✕ Hide' : 'ℹ️ How to Use for Revision'}
            </button>
          </div>

          {/* How to Use Section */}
          {showHowToUse && (
            <div className="mt-4 bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
              <h2 className="text-xl font-bold text-indigo-900 mb-4">How to Use This Wheel for Revision</h2>
              <div className="space-y-3 text-gray-700 text-left">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <p><strong>Random Practice:</strong> Click "Spin the Wheel" to get a random condition. Try to recall everything you know about it before looking it up.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <p><strong>Focused Study:</strong> Use the specialty filter to focus on specific areas you need to revise (e.g., only Cardiovascular conditions).</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <p><strong>Active Recall:</strong> For each condition, try to remember: key symptoms, investigations, differential diagnoses, and management plan.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <p><strong>Track Progress:</strong> Use the history section to review conditions you've practiced and identify patterns in what you need to study more.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  <p><strong>Study Buddy Mode:</strong> Spin the wheel with classmates and quiz each other on the selected conditions.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-700">Filter by Specialties:</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium transition-colors"
                >
                  {showFilters ? 'Hide Filters' : `Show Filters ${filterSpecialties.length > 0 ? `(${filterSpecialties.length})` : ''}`}
                </button>
              </div>
              
              {filterSpecialties.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  ✕ Clear All Filters
                </button>
              )}
            </div>

            {/* Filter Checkboxes */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {allSpecialties.map((specialty) => {
                    const count = Object.keys(conditionsWithSpecialties).filter(
                      condition => conditionsWithSpecialties[condition].includes(specialty)
                    ).length;
                    return (
                      <label
                        key={specialty}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filterSpecialties.includes(specialty)}
                          onChange={() => toggleSpecialty(specialty)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          {specialty} <span className="text-gray-500">({count})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            
            {filterSpecialties.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 mb-2">
                  {filterSpecialties.map((specialty) => (
                    <span
                      key={specialty}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getSpecialtyColor(specialty)} flex items-center gap-1`}
                    >
                      {specialty}
                      <button
                        onClick={() => toggleSpecialty(specialty)}
                        className="ml-1 hover:bg-black/10 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Showing <span className="font-semibold text-indigo-600">{conditions.length}</span> condition{conditions.length !== 1 ? 's' : ''} matching selected {filterSpecialties.length === 1 ? 'specialty' : 'specialties'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Centered */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            {/* Wheel Container */}
            <div className="relative mb-8">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-red-500"></div>
              </div>

              {/* Wheel */}
              <div
                className="w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                }}
              >
                {/* Decorative segments */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-full"
                    style={{
                      transform: `rotate(${i * 30}deg)`,
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                      clipPath: 'polygon(50% 50%, 50% 0%, 60% 0%)'
                    }}
                  />
                ))}
                
                <div className="absolute inset-8 rounded-full bg-white shadow-inner flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎯</div>
                    <div className="text-sm font-semibold text-indigo-600">
                      {spinning ? 'SPINNING...' : 'READY'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <button
              onClick={spinWheel}
              disabled={spinning || conditions.length === 0}
              className={`px-8 py-4 text-xl font-bold rounded-full shadow-lg transform transition-all ${
                spinning || conditions.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 active:scale-95'
              } text-white`}
            >
              {spinning ? 'SPINNING...' : conditions.length === 0 ? 'NO CONDITIONS AVAILABLE' : 'SPIN THE WHEEL'}
            </button>

            {/* Selected Condition Display */}
            {selectedCondition && (
              <div className="mt-8 bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <h2 className="text-sm font-semibold text-gray-500 mb-2">SELECTED CONDITION:</h2>
                <p className="text-2xl font-bold text-indigo-900 mb-4">{selectedCondition}</p>
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">
                    CLINICAL {selectedSpecialties.length === 1 ? 'SPECIALTY' : 'SPECIALTIES'}:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpecialties.map((specialty, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${getSpecialtyColor(specialty)}`}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History Section - Full Width Below */}
          {history.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Recent Spins</h3>
                <button
                  onClick={() => setHistory([])}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  Clear History
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-2 break-words">{item.condition}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.specialties.map((specialty, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded text-xs font-medium ${getSpecialtyColor(specialty)}`}
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="max-w-4xl mx-auto mt-8 text-center text-sm text-gray-600 bg-white rounded-lg shadow p-4">
          <p>Total conditions available: <span className="font-semibold text-indigo-600">{conditions.length}</span></p>
          <p className="mt-1">Conditions are core diagnoses (not presentations) from the MLA content map</p>
        </div>
      </div>
    </div>
  );
}

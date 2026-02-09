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

// Presentations mapped to specialties from MLA content map
const presentationsWithSpecialties = {
  // Acute and emergency
  "Abnormal urinalysis": ["Acute and emergency"],
  "Acute and chronic pain management": ["Acute and emergency"],
  "Acute change in or loss of vision": ["Acute and emergency"],
  "Acute kidney injury": ["Acute and emergency"],
  "Anaphylaxis": ["Acute and emergency"],
  "Bites and stings": ["Acute and emergency"],
  "Bleeding antepartum": ["Acute and emergency"],
  "Bleeding from lower GI tract": ["Acute and emergency"],
  "Bleeding from upper GI tract": ["Acute and emergency"],
  "Breathlessness": ["Acute and emergency"],
  "Burns": ["Acute and emergency"],
  "Cardiorespiratory arrest": ["Acute and emergency"],
  "Chest pain": ["Acute and emergency"],
  "Cyanosis": ["Acute and emergency"],
  "Decreased/loss of consciousness": ["Acute and emergency"],
  "Dehydration": ["Acute and emergency"],
  "Deteriorating patient": ["Acute and emergency"],
  "Electrolyte abnormalities": ["Acute and emergency"],
  "Epistaxis": ["Acute and emergency"],
  "Eye trauma": ["Acute and emergency"],
  "Facial/periorbital swelling": ["Acute and emergency"],
  "Foreign body in eye": ["Acute and emergency"],
  "Head injury": ["Acute and emergency"],
  "Headache": ["Acute and emergency"],
  "Lacerations": ["Acute and emergency"],
  "Massive haemorrhage": ["Acute and emergency"],
  "Melaena": ["Acute and emergency"],
  "Overdose": ["Acute and emergency"],
  "Poisoning": ["Acute and emergency"],
  "Post-surgical care and complications": ["Acute and emergency"],
  "Scrotal/testicular pain and/or lump/swelling": ["Acute and emergency"],
  "Self-harm": ["Acute and emergency"],
  "Shock": ["Acute and emergency"],
  "Soft tissue injury": ["Acute and emergency"],
  "Stridor": ["Acute and emergency"],
  "Substance misuse": ["Acute and emergency"],
  "Trauma": ["Acute and emergency"],
  "Vomiting": ["Acute and emergency"],
  "Wheeze": ["Acute and emergency"],

  // Cancer
  "Abdominal distension": ["Cancer", "Gastrointestinal including liver", "Obstetrics and gynaecology", "Surgery"],
  "Abdominal mass": ["Cancer", "Child health", "Obstetrics and gynaecology", "Surgery"],
  "Ascites": ["Cancer", "Gastrointestinal including liver"],
  "Bone pain": ["Cancer", "Endocrine and metabolic", "Musculoskeletal", "Perioperative medicine and anaesthesia"],
  "Breast lump": ["Cancer", "General practice and primary healthcare", "Surgery"],
  "Change in bowel habit": ["Cancer", "Gastrointestinal including liver", "General practice and primary healthcare"],
  "Cough": ["Cancer", "Child health", "Ear, nose and throat", "General practice and primary healthcare", "Respiratory"],
  "Decreased appetite": ["Cancer", "Gastrointestinal including liver", "Mental health"],
  "Fatigue": ["Cancer", "Clinical haematology", "Endocrine and metabolic", "General practice and primary healthcare", "Mental health"],
  "Haematuria": ["Cancer", "Child health", "General practice and primary healthcare", "Infection", "Renal and urology", "Surgery"],
  "Haemoptysis": ["Cancer", "Cardiovascular", "General practice and primary healthcare", "Infection", "Respiratory"],
  "Jaundice": ["Cancer", "Child health", "Clinical haematology", "Gastrointestinal including liver", "Obstetrics and gynaecology"],
  "Limb weakness": ["Cancer", "Cardiovascular", "Neurosciences"],
  "Lump in groin": ["Cancer", "Clinical haematology", "Gastrointestinal including liver", "Surgery"],
  "Lymphadenopathy": ["Cancer", "Child health", "Clinical haematology", "General practice and primary healthcare"],
  "Neck lump": ["Cancer", "Clinical haematology", "Ear, nose and throat", "Endocrine and metabolic"],
  "Pain on inspiration": ["Cancer", "Cardiovascular", "Respiratory"],
  "Painful swollen leg": ["Cancer", "Cardiovascular", "General practice and primary healthcare", "Infection", "Obstetrics and gynaecology"],
  "Pelvic mass": ["Cancer", "Obstetrics and gynaecology"],
  "Pleural effusion": ["Cancer", "Infection", "Respiratory"],
  "Swallowing problems": ["Cancer", "Ear, nose and throat", "Gastrointestinal including liver", "General practice and primary healthcare", "Neurosciences"],
  "Weight loss": ["Cancer", "Gastrointestinal including liver", "Infection", "Mental health"],

  // Cardiovascular
  "Acute abdominal pain": ["Cardiovascular", "Child health", "Gastrointestinal including liver", "General practice and primary healthcare", "Obstetrics and gynaecology", "Surgery"],
  "Blackouts and faints": ["Cardiovascular", "Medicine of older adult", "Neurosciences"],
  "Cold, painful, pale, pulseless leg/foot": ["Cardiovascular"],
  "Dizziness": ["Cardiovascular", "Ear, nose and throat", "General practice and primary healthcare", "Medicine of older adult", "Neurosciences"],
  "Driving advice": ["Cardiovascular", "General practice and primary healthcare", "Medicine of older adult", "Mental health", "Neurosciences"],
  "Erectile dysfunction": ["Cardiovascular", "Endocrine and metabolic", "General practice and primary healthcare", "Renal and urology", "Sexual health"],
  "Fever": ["Cardiovascular", "Child health", "Clinical haematology", "General practice and primary healthcare", "Infection", "Musculoskeletal", "Respiratory"],
  "Heart murmurs": ["Cardiovascular"],
  "Hypertension": ["Cardiovascular", "Endocrine and metabolic", "General practice and primary healthcare", "Medicine of older adult", "Obstetrics and gynaecology", "Renal and urology"],
  "Limb claudication": ["Cardiovascular"],
  "Low blood pressure": ["Cardiovascular"],
  "Palpitations": ["Cardiovascular", "Endocrine and metabolic", "Mental health"],
  "Peripheral oedema and ankle swelling": ["Cardiovascular", "Child health", "General practice and primary healthcare", "Medicine of older adult", "Renal and urology"],
  "Pregnancy risk assessment": ["Cardiovascular", "Obstetrics and gynaecology"],
  "Skin ulcers": ["Cardiovascular", "Dermatology", "Medicine of older adult"],

  // Child health - major presentations
  "Abnormal development/ developmental delay": ["Child health", "Neurosciences"],
  "Abnormal involuntary movements": ["Child health", "Medicine of older adult", "Neurosciences"],
  "Acute joint pain/swelling": ["Child health", "General practice and primary healthcare", "Musculoskeletal"],
  "Acute rash": ["Child health", "Dermatology", "General practice and primary healthcare", "Infection"],
  "Allergies": ["Child health", "Ear, nose and throat", "General practice and primary healthcare", "Ophthalmology", "Respiratory"],
  "Behavioural difficulties in childhood": ["Child health", "Mental health"],
  "Bruising": ["Child health", "Clinical haematology", "Musculoskeletal"],
  "Child abuse": ["Child health", "Mental health"],
  "Chronic abdominal pain": ["Child health", "Gastrointestinal including liver", "General practice and primary healthcare", "Mental health"],
  "Chronic kidney disease": ["Child health", "General practice and primary healthcare", "Perioperative medicine and anaesthesia", "Renal and urology"],
  "Chronic rash": ["Child health", "Dermatology", "General practice and primary healthcare"],
  "Congenital abnormalities": ["Child health", "Musculoskeletal"],
  "Constipation": ["Child health", "Gastrointestinal including liver", "General practice and primary healthcare", "Medicine of older adult"],
  "Crying baby": ["Child health", "General practice and primary healthcare"],
  "Diarrhoea": ["Child health", "Gastrointestinal including liver", "General practice and primary healthcare", "Infection"],
  "Difficulty with breast feeding": ["Child health", "Obstetrics and gynaecology"],
  "Dysmorphic child": ["Child health"],
  "Fits/seizures": ["Child health", "Neurosciences", "Obstetrics and gynaecology"],
  "Food intolerance": ["Child health", "Gastrointestinal including liver"],
  "Infant feeding problems": ["Child health", "General practice and primary healthcare"],
  "Learning disability": ["Child health", "Mental health", "Perioperative medicine and anaesthesia"],
  "Limp": ["Child health", "Musculoskeletal", "Neurosciences"],
  "Musculoskeletal deformities": ["Child health", "Musculoskeletal"],
  "Neonatal death or cot death": ["Child health"],
  "Pallor": ["Child health", "Clinical haematology"],
  "Polydipsia (thirst)": ["Child health", "Endocrine and metabolic"],
  "Prematurity": ["Child health"],
  "Pubertal development": ["Child health", "Endocrine and metabolic"],
  "Speech and language problems": ["Child health", "Ear, nose and throat", "Neurosciences"],
  "Squint": ["Child health", "Ophthalmology"],
  "Suicidal thoughts": ["Child health", "Mental health"],
  "The sick child": ["Child health", "General practice and primary healthcare"],
  "Urinary incontinence": ["Child health", "General practice and primary healthcare", "Medicine of older adult", "Obstetrics and gynaecology", "Renal and urology", "Surgery"],
  "Urinary symptoms": ["Child health", "Endocrine and metabolic", "General practice and primary healthcare", "Infection", "Neurosciences", "Obstetrics and gynaecology", "Renal and urology", "Surgery"],
  "Vaccination": ["Child health", "General practice and primary healthcare", "Infection"],

  // Clinical haematology
  "Bleeding from lower GI tract": ["Clinical haematology", "Acute and emergency", "Cancer", "Gastrointestinal including liver", "General practice and primary healthcare", "Surgery"],
  "Bleeding from upper GI tract": ["Clinical haematology", "Acute and emergency", "Cancer", "Gastrointestinal including liver", "Surgery"],
  "Organomegaly": ["Clinical haematology", "Gastrointestinal including liver"],
  "Petechial rash": ["Clinical haematology", "Infection"],
  "Purpura": ["Clinical haematology"],

  // Dermatology
  "Nail abnormalities": ["Dermatology"],
  "Pruritus": ["Dermatology", "Gastrointestinal including liver", "Obstetrics and gynaecology"],
  "Scarring": ["Dermatology"],
  "Skin lesion": ["Dermatology"],
  "Skin or subcutaneous lump": ["Dermatology"],

  // Ear, nose and throat
  "Anosmia": ["Ear, nose and throat", "Infection", "Neurosciences"],
  "Ear and nasal discharge": ["Ear, nose and throat", "General practice and primary healthcare"],
  "Facial pain": ["Ear, nose and throat", "Neurosciences", "Perioperative medicine and anaesthesia"],
  "Hearing loss": ["Ear, nose and throat", "Medicine of older adult"],
  "Hoarseness and voice change": ["Ear, nose and throat", "Endocrine and metabolic", "Respiratory"],
  "Nasal obstruction": ["Ear, nose and throat"],
  "Painful ear": ["Ear, nose and throat", "General practice and primary healthcare"],
  "Snoring": ["Ear, nose and throat", "Respiratory"],
  "Sore throat": ["Ear, nose and throat", "General practice and primary healthcare", "Infection"],
  "Tinnitus": ["Ear, nose and throat", "General practice and primary healthcare"],
  "Vertigo": ["Ear, nose and throat", "General practice and primary healthcare", "Medicine of older adult", "Neurosciences"],

  // Endocrine and metabolic
  "Amenorrhoea": ["Endocrine and metabolic", "Obstetrics and gynaecology"],
  "Confusion": ["Endocrine and metabolic", "Medicine of older adult", "Mental health", "Neurosciences", "Perioperative medicine and anaesthesia"],
  "Gynaecomastia": ["Endocrine and metabolic"],
  "Gradual change in or loss of vision": ["Endocrine and metabolic", "Ophthalmology"],
  "Menstrual problems": ["Endocrine and metabolic", "General practice and primary healthcare", "Obstetrics and gynaecology"],
  "Nausea": ["Endocrine and metabolic", "Gastrointestinal including liver", "Palliative and end of life care", "Perioperative medicine and anaesthesia"],
  "Nipple discharge": ["Endocrine and metabolic", "Obstetrics and gynaecology", "Surgery"],
  "Weight gain": ["Endocrine and metabolic", "General practice and primary healthcare", "Mental health"],

  // Gastrointestinal including liver
  "Change in stool colour": ["Gastrointestinal including liver", "Surgery"],
  "Faecal incontinence": ["Gastrointestinal including liver", "Medicine of older adult"],
  "Perianal symptoms": ["Gastrointestinal including liver", "General practice and primary healthcare"],
  "Rectal prolapse": ["Gastrointestinal including liver", "Surgery"],

  // General practice and primary healthcare
  "Abnormal eating or exercising behaviour": ["General practice and primary healthcare", "Mental health"],
  "Anxiety, phobias, OCD": ["General practice and primary healthcare", "Mental health"],
  "Back pain": ["General practice and primary healthcare", "Musculoskeletal", "Neurosciences", "Perioperative medicine and anaesthesia"],
  "Behaviour/personality change": ["General practice and primary healthcare", "Mental health", "Neurosciences"],
  "Breast tenderness/pain": ["General practice and primary healthcare", "Obstetrics and gynaecology", "Surgery"],
  "Chronic joint pain/stiffness": ["General practice and primary healthcare", "Musculoskeletal"],
  "Contraception request/advice": ["General practice and primary healthcare", "Obstetrics and gynaecology"],
  "Eye pain/discomfort": ["General practice and primary healthcare", "Musculoskeletal", "Neurosciences", "Ophthalmology"],
  "Falls": ["General practice and primary healthcare", "Medicine of older adult"],
  "Fit notes": ["General practice and primary healthcare"],
  "Frailty": ["General practice and primary healthcare", "Medicine of older adult", "Perioperative medicine and anaesthesia"],
  "Loss of libido": ["General practice and primary healthcare", "Mental health", "Sexual health"],
  "Low mood/affective problems": ["General practice and primary healthcare", "Mental health"],
  "Menopausal problems": ["General practice and primary healthcare", "Obstetrics and gynaecology"],
  "Muscle pain/ myalgia": ["General practice and primary healthcare", "Musculoskeletal", "Neurosciences"],
  "Painful sexual intercourse": ["General practice and primary healthcare", "Obstetrics and gynaecology", "Sexual health", "Surgery"],
  "Pelvic pain": ["General practice and primary healthcare", "Obstetrics and gynaecology"],
  "Sleep problems": ["General practice and primary healthcare", "Mental health", "Neurosciences"],
  "Somatisation/ medically unexplained physical symptoms": ["General practice and primary healthcare", "Mental health"],
  "Struggling to cope at home": ["General practice and primary healthcare", "Medicine of older adult", "Mental health"],
  "Subfertility": ["General practice and primary healthcare", "Obstetrics and gynaecology", "Surgery"],
  "Travel health advice": ["General practice and primary healthcare", "Infection"],
  "Tremor": ["General practice and primary healthcare", "Neurosciences"],
  "Unwanted pregnancy and termination": ["General practice and primary healthcare", "Obstetrics and gynaecology"],
  "Urethral discharge and genital ulcers/warts": ["General practice and primary healthcare", "Infection", "Obstetrics and gynaecology", "Sexual health"],
  "Vaginal discharge": ["General practice and primary healthcare", "Infection", "Obstetrics and gynaecology", "Sexual health"],
  "Wellbeing checks": ["General practice and primary healthcare"],

  // Infection
  "Loss of smell": ["Infection", "Neurosciences"],
  "Neck pain/stiffness": ["Infection", "Musculoskeletal", "Neurosciences"],
  "Night sweats": ["Infection"],
  "Vulval itching/lesion": ["Infection", "Obstetrics and gynaecology", "Sexual health"],
  "Vulval/vaginal lump": ["Infection", "Obstetrics and gynaecology", "Sexual health"],

  // Medicine of older adult
  "Auditory hallucinations": ["Medicine of older adult", "Mental health"],
  "Elder abuse": ["Medicine of older adult", "Mental health"],
  "Immobility": ["Medicine of older adult"],
  "Memory loss": ["Medicine of older adult", "Mental health", "Neurosciences"],
  "Mental capacity concerns": ["Medicine of older adult", "Mental health"],
  "Visual hallucinations": ["Medicine of older adult", "Mental health"],

  // Mental health
  "Addiction": ["Mental health"],
  "Elation/elated mood": ["Mental health"],
  "End of life care/symptoms of terminal illness": ["Mental health", "Palliative and end of life care", "Perioperative medicine and anaesthesia"],
  "Fixed abnormal beliefs": ["Mental health"],
  "Mental health problems in pregnancy or postpartum": ["Mental health", "Obstetrics and gynaecology"],
  "Pressure of speech": ["Mental health"],
  "Threats to harm others": ["Mental health"],

  // Musculoskeletal
  "Red eye": ["Musculoskeletal", "Ophthalmology"],

  // Neurosciences
  "Altered sensation, numbness and tingling": ["Neurosciences"],
  "Diplopia": ["Neurosciences", "Ophthalmology"],
  "Facial weakness": ["Neurosciences"],
  "Fasciculation": ["Neurosciences"],
  "Neuromuscular weakness": ["Neurosciences", "Palliative and end of life care", "Perioperative medicine and anaesthesia"],
  "Ptosis": ["Neurosciences"],
  "Unsteadiness": ["Neurosciences"],

  // Obstetrics and gynaecology
  "Abnormal cervical smear result": ["Obstetrics and gynaecology"],
  "Bleeding postpartum": ["Obstetrics and gynaecology", "Perioperative medicine and anaesthesia", "Surgery"],
  "Complications of labour": ["Obstetrics and gynaecology"],
  "Hyperemesis": ["Obstetrics and gynaecology"],
  "Intrauterine death": ["Obstetrics and gynaecology"],
  "Labour": ["Obstetrics and gynaecology", "Perioperative medicine and anaesthesia"],
  "Normal pregnancy and antenatal care": ["Obstetrics and gynaecology"],
  "Reduced/change in fetal movements": ["Obstetrics and gynaecology"],
  "Small for gestational age/ large for gestational age": ["Obstetrics and gynaecology"],
  "Vaginal prolapse": ["Obstetrics and gynaecology", "Surgery"],

  // Ophthalmology
  "Flashes and floaters in visual fields": ["Ophthalmology"],
  "Loss of red reflex": ["Ophthalmology"],

  // Perioperative medicine and anaesthesia
  "Misplaced nasogastric tube": ["Perioperative medicine and anaesthesia", "Clinical imaging"],

  // Renal and urology
  "Oliguria": ["Renal and urology"],

  // All areas of clinical practice
  "Death and dying": ["All areas of clinical practice"],
  "Family history of possible genetic disorder": ["All areas of clinical practice"],
  "Incidental findings": ["All areas of clinical practice"]
};

// Complete mapping of all 212 MLA presentations to their differential diagnoses
const presentationsToConditions = {
  // Acute and Emergency Medicine (30 presentations)
  "Acute abdominal pain": ["Appendicitis", "Acute cholecystitis", "Acute pancreatitis", "Perforated peptic ulcer", "Intestinal obstruction", "Mesenteric ischemia", "Ruptured AAA", "Ectopic pregnancy", "Ovarian torsion", "Testicular torsion", "Renal colic", "Acute diverticulitis", "Ruptured ovarian cyst", "Pelvic inflammatory disease", "Biliary colic", "Intussusception", "Volvulus", "Necrotizing enterocolitis", "Diabetic ketoacidosis", "Sickle cell crisis"],
  "Acute kidney injury": ["Dehydration", "Sepsis", "Heart failure", "Hemorrhage", "Acute tubular necrosis", "Acute interstitial nephritis", "Glomerulonephritis", "Urinary tract obstruction", "Prostatic hyperplasia", "Ureteric stones", "NSAIDs", "ACE inhibitors", "Aminoglycosides", "Contrast nephropathy", "Rhabdomyolysis", "Tumor lysis syndrome", "Hemolytic uremic syndrome"],
  "Abnormal urinalysis": ["Urinary tract infection", "Kidney stones", "Glomerulonephritis", "Proteinuria", "Nephrotic syndrome", "Diabetes", "Hypertension", "Hematuria", "Glycosuria", "Contamination", "Menstruation"],
  "Anaphylaxis": ["IgE-mediated anaphylaxis", "Non-IgE mediated anaphylactoid reactions", "Idiopathic anaphylaxis", "Exercise-induced anaphylaxis", "Mastocytosis", "Vasovagal reaction", "Panic attack"],
  "Bleeding from upper GI tract": ["Peptic ulcer disease", "Oesophageal varices", "Mallory-Weiss tear", "Gastritis", "Erosive gastritis", "Oesophagitis", "Gastric cancer", "Dieulafoy's lesion", "Angiodysplasia", "Aorto-enteric fistula"],
  "Bleeding from lower GI tract": ["Diverticular disease", "Angiodysplasia", "Colorectal cancer", "Ischemic colitis", "Inflammatory bowel disease", "Hemorrhoids", "Anal fissure", "Meckel's diverticulum", "Intussusception", "Infectious colitis", "Radiation proctitis"],
  "Breathlessness": ["Acute coronary syndrome", "Pulmonary embolism", "Pneumothorax", "Acute heart failure", "Pneumonia", "Acute asthma", "COPD exacerbation", "Pleural effusion", "Anaphylaxis", "Upper airway obstruction", "Cardiac tamponade", "Metabolic acidosis", "Bronchiolitis", "Croup", "Foreign body aspiration"],
  "Burns": ["Thermal burns", "Electrical burns", "Chemical burns", "Radiation burns", "Inhalation injury", "Non-accidental injury", "Compartment syndrome", "Infection", "Sepsis"],
  "Cardiorespiratory arrest": ["Ventricular fibrillation", "Pulseless ventricular tachycardia", "Asystole", "Pulseless electrical activity", "Hypoxia", "Hypovolemia", "Hypokalemia", "Hyperkalemia", "Hypothermia", "Tension pneumothorax", "Cardiac tamponade", "Toxins", "Thrombosis"],
  "Chest pain": ["STEMI", "NSTEMI", "Unstable angina", "Aortic dissection", "Pulmonary embolism", "Pneumothorax", "Pericarditis", "Myocarditis", "Oesophageal rupture", "Pneumonia", "Musculoskeletal pain", "Gastro-oesophageal reflux", "Costochondritis", "Panic attack", "Rib fracture"],
  "Decreased/loss of consciousness": ["Syncope", "Vasovagal syncope", "Cardiac syncope", "Orthostatic syncope", "Seizure", "Hypoglycemia", "Stroke", "Head injury", "Intracranial hemorrhage", "Drug intoxication", "Alcohol intoxication", "Overdose", "Sepsis", "Arrhythmia", "Hypovolemic shock", "Hypoxia", "Metabolic disturbance", "Raised intracranial pressure", "Status epilepticus", "Meningitis", "Encephalitis"],
  "Dehydration": ["Gastroenteritis", "Inadequate fluid intake", "Diabetic ketoacidosis", "Hyperosmolar hyperglycemic state", "Excessive sweating", "Heat exposure", "Burns", "Pancreatitis", "Intestinal obstruction", "Pyloric stenosis", "Diabetes insipidus", "Diuretic use", "Chronic kidney disease"],
  "Deteriorating patient": ["Sepsis", "Septic shock", "Hypovolemic shock", "Cardiogenic shock", "Respiratory failure", "Acute coronary syndrome", "Pulmonary embolism", "Diabetic emergencies", "Multi-organ dysfunction", "Anaphylaxis", "Acute kidney injury", "Raised intracranial pressure", "Cardiac tamponade"],
  "Electrolyte abnormalities": ["Hyponatremia", "SIADH", "Heart failure", "Renal failure", "Hypernatremia", "Dehydration", "Diabetes insipidus", "Hypokalemia", "Diuretics", "Vomiting", "Diarrhea", "DKA", "Hyperkalemia", "Acidosis", "Rhabdomyolysis", "Hypocalcemia", "Vitamin D deficiency", "Hypoparathyroidism", "Pancreatitis", "Hypercalcemia", "Malignancy", "Hyperparathyroidism", "Hypomagnesemia", "Hypermagnesemia"],
  "Epistaxis": ["Idiopathic", "Spontaneous bleeding", "Trauma", "Hypertension", "Anticoagulant therapy", "Antiplatelet therapy", "Coagulopathy", "Hemophilia", "Von Willebrand disease", "Nasal tumors", "Hereditary hemorrhagic telangiectasia", "Thrombocytopenia", "Liver disease", "Foreign body"],
  "Eye trauma": ["Corneal abrasion", "Corneal foreign body", "Hyphaema", "Globe rupture", "Orbital fracture", "Blowout fracture", "Chemical injury", "Traumatic iritis", "Retinal detachment", "Vitreous hemorrhage", "Non-accidental injury"],
  "Facial/periorbital swelling": ["Anaphylaxis", "Angioedema", "Cellulitis", "Sinusitis", "Dental abscess", "Trauma", "Insect bite", "Nephrotic syndrome", "Superior vena cava obstruction", "Hypothyroidism"],
  "Foreign body in eye": ["Corneal foreign body", "Subtarsal foreign body", "Embedded foreign body", "Superficial foreign body", "Conjunctival foreign body", "Risk of infection", "Corneal ulcer"],
  "Head injury": ["Concussion", "Skull fracture", "Extradural hematoma", "Subdural hematoma", "Subarachnoid hemorrhage", "Intracerebral hemorrhage", "Diffuse axonal injury", "Scalp laceration", "Non-accidental injury"],
  "Lacerations": ["Simple laceration", "Complex laceration", "Tissue loss", "Nerve injury", "Tendon injury", "Vascular injury", "Contaminated wound", "Infection risk", "Non-accidental injury"],
  "Massive haemorrhage": ["Major trauma", "Gastrointestinal bleeding", "Postpartum hemorrhage", "Ruptured aortic aneurysm", "Ruptured ectopic pregnancy", "Ruptured liver", "Ruptured spleen", "Surgical bleeding", "Coagulopathy", "Placental abruption", "Placenta previa", "Disseminated intravascular coagulation"],
  "Melaena": ["Peptic ulcer disease", "Oesophageal varices", "Gastritis", "Gastric erosions", "Mallory-Weiss tear", "Gastric cancer", "Oesophagitis", "Angiodysplasia", "Meckel's diverticulum", "Aorto-enteric fistula"],
  "Overdose": ["Paracetamol overdose", "Opioid overdose", "Benzodiazepine overdose", "Tricyclic antidepressant overdose", "SSRI overdose", "Aspirin overdose", "Salicylate overdose", "Beta-blocker overdose", "Calcium channel blocker overdose", "Antipsychotic overdose", "Anticonvulsant overdose", "Cocaine toxicity", "Stimulant toxicity", "Alcohol intoxication", "Carbon monoxide poisoning", "Digoxin toxicity"],
  "Poisoning": ["Drug overdose", "Alcohol poisoning", "Carbon monoxide poisoning", "Organophosphate poisoning", "Paraquat poisoning", "Mushroom poisoning", "Heavy metal poisoning", "Lead poisoning", "Mercury poisoning", "Household chemical ingestion", "Plant ingestion", "Berry ingestion", "Button battery ingestion"],
  "Post-surgical care and complications": ["Surgical site infection", "Wound dehiscence", "Anastomotic leak", "Postoperative ileus", "Hemorrhage", "Deep vein thrombosis", "Pulmonary embolism", "Pneumonia", "Urinary retention", "Acute kidney injury", "Compartment syndrome", "Necrotizing fasciitis", "Sepsis"],
  "Scrotal/testicular pain and/or lump/swelling": ["Testicular torsion", "Epididymo-orchitis", "Trauma", "Testicular cancer", "Hydrocele", "Varicocele", "Inguinal hernia", "Spermatocele", "Mumps orchitis", "Idiopathic scrotal edema"],
  "Self-harm": ["Borderline personality disorder", "Depression", "Anxiety disorders", "Post-traumatic stress disorder", "Substance misuse", "Psychosis", "Eating disorders", "Autism spectrum disorder", "Adjustment disorder", "Relationship difficulties", "Bullying", "Abuse"],
  "Shock": ["Hypovolemic shock", "Hemorrhage", "Dehydration", "Cardiogenic shock", "Myocardial infarction", "Arrhythmia", "Heart failure", "Distributive shock", "Sepsis", "Anaphylaxis", "Neurogenic shock", "Obstructive shock", "Pulmonary embolism", "Cardiac tamponade", "Tension pneumothorax"],
  "Soft tissue injury": ["Contusion", "Bruise", "Sprain", "Strain", "Hematoma", "Compartment syndrome", "Rhabdomyolysis", "Laceration", "Crush injury", "Non-accidental injury"],
  "Stridor": ["Croup", "Viral laryngotracheobronchitis", "Epiglottitis", "Foreign body aspiration", "Anaphylaxis", "Angioedema", "Retropharyngeal abscess", "Peritonsillar abscess", "Laryngeal edema", "Tracheal stenosis", "Laryngomalacia"],
  "Substance misuse": ["Alcohol use disorder", "Opioid use disorder", "Cannabis use disorder", "Stimulant use disorder", "Cocaine use disorder", "Amphetamine use disorder", "Benzodiazepine misuse", "Novel psychoactive substances", "Polysubstance use", "Dual diagnosis"],
  "Trauma": ["Blunt trauma", "Penetrating trauma", "Head injury", "Chest trauma", "Pneumothorax", "Hemothorax", "Rib fractures", "Abdominal trauma", "Solid organ injury", "Hollow viscus injury", "Pelvic fracture", "Long bone fractures", "Spinal injury", "Vascular injury", "Non-accidental injury"],
  "Vomiting": ["Gastroenteritis", "Food poisoning", "Intestinal obstruction", "Appendicitis", "Pancreatitis", "Cholecystitis", "Diabetic ketoacidosis", "Raised intracranial pressure", "Pregnancy", "Hyperemesis gravidarum", "Pyloric stenosis", "Intussusception", "Volvulus", "Medication side effect"],
  "Wheeze": ["Acute asthma", "COPD exacerbation", "Anaphylaxis", "Acute heart failure", "Cardiac wheeze", "Bronchiolitis", "Foreign body aspiration", "Pulmonary embolism", "Pneumonia"],

  // Cardiovascular (10 presentations)
  "Blackouts and faints": ["Vasovagal syncope", "Orthostatic hypotension", "Cardiac arrhythmia", "Aortic stenosis", "Hypertrophic cardiomyopathy", "Long QT syndrome", "Postural tachycardia syndrome", "Seizure", "Hypoglycemia", "Carotid sinus hypersensitivity", "Pulmonary embolism", "Situational syncope"],
  "Cold, painful, pale, pulseless leg/foot": ["Acute limb ischemia", "Thrombosis", "Embolism", "Arterial dissection", "Compartment syndrome", "Severe peripheral vascular disease", "Thromboangiitis obliterans", "Buerger's disease", "Popliteal aneurysm thrombosis"],
  "Cyanosis": ["Respiratory failure", "Pneumonia", "Pulmonary embolism", "Right-to-left cardiac shunt", "Poor perfusion", "Cold exposure", "Raynaud's phenomenon", "Shock", "Congenital heart disease", "Methemoglobinemia", "Polycythemia"],
  "Driving advice": ["DVLA notification requirements", "Seizure disorders", "One-year seizure-free", "Cardiovascular disease", "Post-MI", "Arrhythmia", "Visual impairment", "Cognitive impairment", "Dementia", "Diabetes", "Hypoglycemia risk", "Stroke", "TIA", "Psychiatric conditions", "Drug dependence", "Alcohol dependence", "Sleep disorders"],
  "Erectile dysfunction": ["Vascular disease", "Atherosclerosis", "Diabetes mellitus", "Hypertension", "Hypogonadism", "Hyperprolactinemia", "Hypothyroidism", "Medication side effect", "Antihypertensives", "Antidepressants", "Psychological causes", "Peyronie's disease", "Spinal cord injury", "Pelvic surgery", "Radiotherapy"],
  "Heart murmurs": ["Aortic stenosis", "Aortic regurgitation", "Mitral stenosis", "Mitral regurgitation", "Tricuspid regurgitation", "Pulmonary stenosis", "Ventricular septal defect", "Atrial septal defect", "Patent ductus arteriosus", "Innocent murmur", "Flow murmur", "Hypertrophic cardiomyopathy"],
  "Hypertension": ["Essential hypertension", "Renal artery stenosis", "Chronic kidney disease", "Primary hyperaldosteronism", "Conn's syndrome", "Pheochromocytoma", "Cushing's syndrome", "Coarctation of aorta", "Pre-eclampsia", "NSAIDs", "Steroids", "Oral contraceptives", "Obstructive sleep apnea"],
  "Limb claudication": ["Peripheral arterial disease", "Critical limb ischemia", "Thromboangiitis obliterans", "Spinal stenosis", "Neurogenic claudication", "Chronic compartment syndrome", "Popliteal entrapment syndrome"],
  "Low blood pressure": ["Hypovolemia", "Hemorrhage", "Dehydration", "Septic shock", "Cardiogenic shock", "Anaphylaxis", "Adrenal insufficiency", "Autonomic dysfunction", "Medication side effect", "Postural hypotension", "Vasovagal syncope"],
  "Painful swollen leg": ["Deep vein thrombosis", "Cellulitis", "Ruptured Baker's cyst", "Chronic venous insufficiency", "Superficial thrombophlebitis", "Compartment syndrome", "Necrotizing fasciitis", "Lymphedema", "Lipodermatosclerosis"],
  "Pain on inspiration": ["Pleurisy", "Pleuritic chest pain", "Pneumonia", "Pulmonary embolism", "Pneumothorax", "Pericarditis", "Rib fracture", "Costochondritis", "Bornholm disease", "Epidemic pleurodynia", "Pleural effusion", "Empyema"],
  "Palpitations": ["Atrial fibrillation", "Supraventricular tachycardia", "Ventricular tachycardia", "Atrial flutter", "Ectopic beats", "PACs", "PVCs", "Sinus tachycardia", "Anxiety", "Fever", "Thyrotoxicosis", "Anemia", "Wolff-Parkinson-White syndrome", "Long QT syndrome", "Hyperthyroidism", "Pheochromocytoma", "Panic disorder"],
  "Peripheral oedema and ankle swelling": ["Heart failure", "Chronic venous insufficiency", "Deep vein thrombosis", "Nephrotic syndrome", "Liver cirrhosis", "Hypoalbuminemia", "Lymphedema", "Calcium channel blocker", "Pregnancy", "Dependent edema", "Hypothyroidism", "Myxedema"],
  "Pregnancy risk assessment": ["Previous cesarean section", "Previous preterm birth", "Pre-existing medical conditions", "Diabetes", "Hypertension", "Cardiac disease", "Advanced maternal age", "Multiple pregnancy", "Fetal anomaly", "Placenta previa", "Obstetric cholestasis", "Pre-eclampsia risk", "Thrombophilia"],
  "Skin ulcers": ["Venous ulcer", "Arterial ulcer", "Diabetic foot ulcer", "Pressure sore", "Vasculitis", "Pyoderma gangrenosum", "Malignancy", "Squamous cell carcinoma", "Basal cell carcinoma", "Infection", "Cellulitis", "Necrotizing fasciitis", "Sickle cell ulcer", "Neuropathic ulcer"],

  // Respiratory (6 presentations)
  "Cough": ["Asthma", "COPD", "Gastro-oesophageal reflux disease", "Post-nasal drip", "Upper airway cough syndrome", "ACE inhibitor side effect", "Chronic bronchitis", "Bronchiectasis", "Lung cancer", "Tuberculosis", "Interstitial lung disease", "Post-viral cough", "Heart failure", "Pertussis", "Whooping cough", "Psychogenic cough"],
  "Haemoptysis": ["Bronchitis", "Pneumonia", "Tuberculosis", "Lung cancer", "Bronchiectasis", "Pulmonary embolism", "Pulmonary edema", "Mitral stenosis", "Goodpasture syndrome", "Wegener's granulomatosis", "Foreign body", "Trauma", "Anticoagulant therapy"],
  "Hoarseness and voice change": ["Laryngitis", "Viral laryngitis", "Bacterial laryngitis", "Vocal cord nodules", "Vocal cord polyps", "Laryngeal cancer", "Recurrent laryngeal nerve palsy", "Gastro-oesophageal reflux", "Vocal strain", "Vocal overuse", "Hypothyroidism", "Reinke's edema", "Laryngeal papillomatosis", "Mediastinal mass", "Aortic aneurysm"],
  "Pleural effusion": ["Heart failure", "Pneumonia", "Parapneumonic effusion", "Malignancy", "Tuberculosis", "Pulmonary embolism", "Empyema", "Hypoalbuminemia", "Liver disease", "Kidney disease", "Pancreatitis", "Mesothelioma", "Rheumatoid arthritis", "Systemic lupus erythematosus", "Post-cardiac injury syndrome"],
  "Snoring": ["Obstructive sleep apnea", "Nasal obstruction", "Nasal polyps", "Deviated septum", "Obesity", "Tonsillar hypertrophy", "Adenoidal hypertrophy", "Hypothyroidism", "Acromegaly", "Alcohol use", "Sedative use"],

  // Gastrointestinal (20 presentations)
  "Abdominal distension": ["Intestinal obstruction", "Ascites", "Pregnancy", "Obesity", "Constipation", "Ileus", "Abdominal mass", "Abdominal tumor", "Ovarian cyst", "Ovarian tumor", "Bladder distension", "Urinary retention", "Hirschsprung disease", "Hepatomegaly", "Splenomegaly", "Celiac disease"],
  "Abdominal mass": ["Colorectal cancer", "Ovarian tumor", "Pancreatic tumor", "Gastric cancer", "Hepatomegaly", "Splenomegaly", "Abdominal aortic aneurysm", "Polycystic kidney disease", "Wilms tumor", "Neuroblastoma", "Pregnancy", "Bladder distension", "Fecal impaction"],
  "Ascites": ["Liver cirrhosis", "Malignancy", "Peritoneal carcinomatosis", "Heart failure", "Nephrotic syndrome", "Tuberculosis", "Pancreatitis", "Budd-Chiari syndrome", "Constrictive pericarditis", "Hypoalbuminemia", "Portal vein thrombosis"],
  "Bone pain": ["Osteoporosis with fracture", "Osteomalacia", "Rickets", "Paget's disease", "Multiple myeloma", "Metastatic bone disease", "Primary bone tumors", "Osteomyelitis", "Hyperparathyroidism", "Sickle cell crisis", "Acute leukemia", "Neuroblastoma"],
  "Change in bowel habit": ["Colorectal cancer", "Inflammatory bowel disease", "Irritable bowel syndrome", "Diverticular disease", "Celiac disease", "Hyperthyroidism", "Hypothyroidism", "Medication side effect", "Dietary change", "Diabetes mellitus", "Chronic pancreatitis", "Microscopic colitis"],
  "Change in stool colour": ["Melaena", "Upper GI bleeding", "Fresh blood", "Lower GI bleeding", "Pale stools", "Obstructive jaundice", "Pancreatic disease", "Biliary disease", "Steatorrhea", "Malabsorption", "Pancreatic insufficiency", "Dietary causes", "Iron supplements", "Biliary atresia"],
  "Chronic abdominal pain": ["Irritable bowel syndrome", "Inflammatory bowel disease", "Chronic pancreatitis", "Peptic ulcer disease", "Chronic constipation", "Endometriosis", "Celiac disease", "Functional abdominal pain", "Chronic mesenteric ischemia", "Abdominal wall pain", "Recurrent abdominal pain"],
  "Constipation": ["Functional constipation", "Inadequate fiber intake", "Inadequate fluid intake", "Hypothyroidism", "Hypercalcemia", "Intestinal obstruction", "Colorectal cancer", "Anal fissure", "Hemorrhoids", "Medication side effect", "Opioids", "Anticholinergics", "Hirschsprung disease", "Spinal cord lesion", "Irritable bowel syndrome", "Parkinson's disease"],
  "Decreased appetite": ["Cancer", "Gastrointestinal disorders", "Mental health conditions", "Depression", "Chronic illness", "Medication side effect", "Infection", "Liver disease", "Kidney disease"],
  "Diarrhoea": ["Viral gastroenteritis", "Bacterial gastroenteritis", "Campylobacter", "Salmonella", "Shigella", "E. coli", "C. difficile infection", "Food poisoning", "Inflammatory bowel disease", "Celiac disease", "Lactose intolerance", "Irritable bowel syndrome", "Hyperthyroidism", "Malabsorption syndromes", "Giardiasis", "Medication side effect", "Antibiotics", "Laxatives", "Colorectal cancer", "Rotavirus", "Overflow diarrhea"],
  "Faecal incontinence": ["Diarrhea", "Fecal impaction with overflow", "Anal sphincter damage", "Obstetric trauma", "Surgical trauma", "Neurological disease", "Spinal cord disease", "Dementia", "Rectal prolapse", "Inflammatory bowel disease", "Diabetes neuropathy", "Radiation proctitis", "Hirschsprung disease"],
  "Food intolerance": ["Lactose intolerance", "Fructose malabsorption", "Celiac disease", "Gluten intolerance", "Food allergy", "IgE-mediated allergy", "Histamine intolerance", "FODMAP sensitivity", "Enzyme deficiencies", "Irritable bowel syndrome"],
  "Jaundice": ["Hemolysis", "Hemolytic anemia", "Sickle cell", "G6PD deficiency", "Viral hepatitis", "Alcoholic hepatitis", "Cirrhosis", "Drug-induced hepatitis", "Gilbert's syndrome", "Gallstones", "Cholangitis", "Pancreatic cancer", "Cholangiocarcinoma", "Physiological jaundice", "Breast milk jaundice", "Hemolytic disease", "Biliary atresia"],
  "Nausea": ["Gastroenteritis", "Food poisoning", "Pregnancy", "Medication side effect", "Gastritis", "Peptic ulcer", "Gastroparesis", "Intestinal obstruction", "Appendicitis", "Pancreatitis", "Cholecystitis", "Migraine", "Labyrinthitis", "Raised intracranial pressure", "Diabetic ketoacidosis", "Uremia", "Motion sickness", "Psychogenic"],
  "Perianal symptoms": ["Hemorrhoids", "Anal fissure", "Perianal abscess", "Anal fistula", "Pruritus ani", "Rectal prolapse", "Pilonidal sinus", "Inflammatory bowel disease", "Sexually transmitted infections", "Anal cancer", "Threadworms"],
  "Pruritus": ["Dry skin", "Xerosis", "Atopic dermatitis", "Urticaria", "Cholestasis", "Obstructive jaundice", "Chronic kidney disease", "Hodgkin lymphoma", "Polycythemia vera", "Hyperthyroidism", "Iron deficiency", "Diabetes mellitus", "Psychogenic", "Medication side effect", "Opioids", "Scabies", "Parasitic infection"],
  "Rectal prolapse": ["Chronic constipation", "Straining", "Pelvic floor weakness", "Cystic fibrosis", "Neurological disease", "Ehlers-Danlos syndrome", "Previous pelvic surgery", "Childbirth trauma"],
  "Swallowing problems": ["Oesophageal cancer", "Pharyngeal cancer", "Gastro-oesophageal reflux", "Oesophageal stricture", "Achalasia", "Oesophageal spasm", "Stroke", "Parkinson's disease", "Motor neurone disease", "Myasthenia gravis", "Pharyngeal pouch", "Foreign body", "Globus sensation", "Schatzki ring"],
  "Weight gain": ["Overeating", "Decreased activity", "Hypothyroidism", "Cushing's syndrome", "Polycystic ovary syndrome", "Medication", "Steroids", "Antipsychotics", "Insulin", "Pregnancy", "Fluid retention", "Heart failure", "Nephrotic syndrome", "Prader-Willi syndrome", "Hypothalamic obesity"],
  "Weight loss": ["Malignancy", "Cancer", "Hyperthyroidism", "Diabetes mellitus type 1", "Chronic infection", "Tuberculosis", "HIV", "Inflammatory bowel disease", "Celiac disease", "Chronic pancreatitis", "Malabsorption", "Depression", "Anorexia nervosa", "Chronic heart failure", "COPD", "Chronic kidney disease", "Addison's disease", "Medication side effect", "Poverty"],

  // Endocrine and Metabolic (8 presentations)
  "Amenorrhoea": ["Pregnancy", "Polycystic ovary syndrome", "Hypothalamic amenorrhea", "Stress", "Weight loss", "Exercise", "Premature ovarian insufficiency", "Hyperprolactinemia", "Thyroid disease", "Cushing's syndrome", "Congenital adrenal hyperplasia", "Asherman's syndrome", "Constitutional delay", "Turner syndrome"],
  "Gynaecomastia": ["Physiological", "Neonatal", "Pubertal", "Aging", "Medication", "Spironolactone", "Cimetidine", "Finasteride", "Antipsychotics", "Hypogonadism", "Hyperthyroidism", "Liver cirrhosis", "Chronic kidney disease", "Testicular tumors", "Prolactinoma", "Klinefelter syndrome", "Adrenal tumors"],
  "Menstrual problems": ["Polycystic ovary syndrome", "Thyroid disease", "Hyperprolactinemia", "Uterine fibroids", "Endometriosis", "Adenomyosis", "Endometrial polyps", "Coagulopathy", "Von Willebrand disease", "Anovulation", "Premature ovarian insufficiency", "Stress", "Weight changes", "Medication", "Anticoagulants", "Contraceptives"],
  "Nipple discharge": ["Physiological", "Hyperprolactinemia", "Prolactinoma", "Medication", "Duct ectasia", "Intraductal papilloma", "Breast cancer", "Pregnancy", "Lactation", "Hypothyroidism", "Galactorrhea"],
  "Polydipsia (thirst)": ["Diabetes mellitus type 1", "Diabetes mellitus type 2", "Diabetes insipidus", "Cranial diabetes insipidus", "Nephrogenic diabetes insipidus", "Hypercalcemia", "Chronic kidney disease", "Psychogenic polydipsia", "Medication", "Diuretics", "Lithium", "Hyperglycemia", "Hyperthyroidism"],
  "Pubertal development": ["Precocious puberty", "Central precocious puberty", "Peripheral precocious puberty", "Delayed puberty", "Constitutional delay", "Hypogonadism", "Turner syndrome", "Klinefelter syndrome", "Kallmann syndrome", "Chronic illness", "Hypothyroidism", "Cushing's syndrome", "Congenital adrenal hyperplasia"],

  // Neurology (26 presentations)
  "Abnormal development/developmental delay": ["Global developmental delay", "Cerebral palsy", "Autism spectrum disorder", "Genetic syndromes", "Down's syndrome", "Fragile X syndrome", "Fetal alcohol syndrome", "Congenital infections", "CMV", "Toxoplasmosis", "Hypothyroidism", "Inborn errors of metabolism", "Lead poisoning", "Neglect", "Deprivation"],
  "Abnormal involuntary movements": ["Parkinson's disease", "Tremor", "Rigidity", "Essential tremor", "Huntington's disease", "Chorea", "Tardive dyskinesia", "Tics", "Tourette syndrome", "Myoclonus", "Dystonia", "Athetosis", "Hemifacial spasm", "Benign fasciculations", "Wilson's disease", "Sydenham's chorea"],
  "Acute change in or loss of vision": ["Acute glaucoma", "Central retinal artery occlusion", "Retinal detachment", "Vitreous hemorrhage", "Optic neuritis", "Posterior circulation stroke", "Giant cell arteritis", "Acute papilledema", "Methanol poisoning", "Retrobulbar hemorrhage", "Functional vision loss", "Non-organic vision loss"],
  "Altered sensation, numbness and tingling": ["Peripheral neuropathy", "Diabetes", "Alcohol", "B12 deficiency", "Carpal tunnel syndrome", "Cervical radiculopathy", "Lumbar radiculopathy", "Multiple sclerosis", "Stroke", "TIA", "Spinal cord compression", "Guillain-Barré syndrome", "Migraine with aura", "Hyperventilation", "Anxiety", "Peripheral nerve injury"],
  "Back pain": ["Mechanical back pain", "Non-specific back pain", "Lumbar strain", "Disc prolapse", "Spinal stenosis", "Vertebral fracture", "Spondylolisthesis", "Ankylosing spondylitis", "Spinal infection", "Discitis", "Osteomyelitis", "Spinal metastases", "Cauda equina syndrome", "Abdominal aortic aneurysm", "Kidney stones", "Pyelonephritis", "Pancreatitis"],
  "Behaviour/personality change": ["Dementia", "Frontotemporal dementia", "Alzheimer's disease", "Brain tumor", "Stroke", "Traumatic brain injury", "Bipolar disorder", "Schizophrenia", "Substance misuse", "Personality disorder", "Thyroid disease", "Neurosyphilis", "HIV-associated dementia"],
  "Confusion": ["Delirium", "Infection", "Medication", "Metabolic disturbance", "Dementia", "Stroke", "Hypoglycemia", "Hypoxia", "Encephalitis", "Meningitis", "Urinary tract infection", "Electrolyte disturbance", "Drug intoxication", "Alcohol intoxication", "Alcohol withdrawal", "Head injury", "Seizure", "Post-ictal state", "Hepatic encephalopathy"],
  "Diplopia": ["Third nerve palsy", "Sixth nerve palsy", "Myasthenia gravis", "Multiple sclerosis", "Stroke", "Brain tumor", "Thyroid eye disease", "Orbital mass", "Diabetes mellitus", "Giant cell arteritis", "Miller Fisher syndrome"],
  "Dizziness": ["Benign paroxysmal positional vertigo", "Vestibular neuronitis", "Ménière's disease", "Migraine-associated vertigo", "Labyrinthitis", "Stroke", "TIA", "Acoustic neuroma", "Orthostatic hypotension", "Cardiac arrhythmia", "Anxiety", "Hyperventilation", "Medication side effect", "Anemia", "Hypoglycemia"],
  "Eye pain/discomfort": ["Acute glaucoma", "Uveitis", "Scleritis", "Corneal abrasion", "Foreign body", "Dry eye", "Cluster headache", "Sinusitis", "Orbital cellulitis", "Trigeminal neuralgia"],
  "Facial pain": ["Trigeminal neuralgia", "Sinusitis", "Dental abscess", "Dental caries", "Temporomandibular joint disorder", "Giant cell arteritis", "Cluster headache", "Postherpetic neuralgia", "Atypical facial pain", "Multiple sclerosis", "Migraine"],
  "Facial weakness": ["Bell's palsy", "Stroke", "Ramsay Hunt syndrome", "Herpes zoster", "Lyme disease", "Cerebellopontine angle tumor", "Acoustic neuroma", "Guillain-Barré syndrome", "Myasthenia gravis", "Parotid tumor", "Multiple sclerosis", "Sarcoidosis", "Otitis media"],
  "Fasciculation": ["Benign fasciculation syndrome", "Motor neurone disease", "Radiculopathy", "Peripheral neuropathy", "Anxiety", "Stress", "Hyperthyroidism", "Electrolyte imbalance", "Medication", "Neostigmine"],
  "Fits/seizures": ["Epilepsy", "Focal epilepsy", "Generalized epilepsy", "Febrile convulsions", "Cerebrovascular disease", "Brain tumor", "Metabolic causes", "Hypoglycemia", "Hyponatremia", "Drug withdrawal", "Alcohol withdrawal", "Eclampsia", "Meningitis", "Encephalitis", "Head injury", "Hypoxia", "Toxins", "Poisoning", "Psychogenic non-epileptic seizures"],
  "Gradual change in or loss of vision": ["Cataract", "Age-related macular degeneration", "Diabetic retinopathy", "Chronic glaucoma", "Refractive error", "Optic atrophy", "Retinitis pigmentosa", "Macular hole", "Epiretinal membrane", "Chronic papilledema", "Pituitary tumor"],
  "Headache": ["Tension-type headache", "Migraine", "Cluster headache", "Medication overuse headache", "Sinusitis", "Raised intracranial pressure", "Subarachnoid hemorrhage", "Meningitis", "Giant cell arteritis", "Idiopathic intracranial hypertension", "Carbon monoxide poisoning", "Acute glaucoma", "Cervicogenic headache", "Brain tumor"],
  "Limb weakness": ["Stroke", "Transient ischemic attack", "Multiple sclerosis", "Guillain-Barré syndrome", "Myasthenia gravis", "Peripheral neuropathy", "Radiculopathy", "Spinal cord compression", "Motor neurone disease", "Polymyositis", "Dermatomyositis", "Muscular dystrophy", "Hypokalemia", "Functional weakness"],
  "Memory loss": ["Alzheimer's dementia", "Vascular dementia", "Lewy body dementia", "Frontotemporal dementia", "Mild cognitive impairment", "Depression", "Pseudodementia", "Normal aging", "Vitamin B12 deficiency", "Hypothyroidism", "Normal pressure hydrocephalus", "Head injury", "Alcohol-related brain damage", "Wernicke-Korsakoff syndrome"],
  "Muscle pain/myalgia": ["Viral infection", "Influenza", "COVID-19", "Polymyalgia rheumatica", "Fibromyalgia", "Statin-induced myopathy", "Polymyositis", "Dermatomyositis", "Rhabdomyolysis", "Hypothyroidism", "Chronic fatigue syndrome", "Exercise-induced muscle injury", "Vitamin D deficiency"],
  "Neck pain/stiffness": ["Mechanical neck pain", "Neck strain", "Cervical spondylosis", "Whiplash injury", "Cervical radiculopathy", "Meningitis", "Subarachnoid hemorrhage", "Torticollis", "Cervical dystonia", "Rheumatoid arthritis", "Polymyalgia rheumatica"],
  "Neuromuscular weakness": ["Myasthenia gravis", "Lambert-Eaton myasthenic syndrome", "Guillain-Barré syndrome", "Muscular dystrophy", "Polymyositis", "Dermatomyositis", "Motor neurone disease", "Critical illness polyneuropathy", "Critical illness myopathy", "Botulism", "Periodic paralysis", "Myotonic dystrophy"],
  "Ptosis": ["Myasthenia gravis", "Third nerve palsy", "Horner's syndrome", "Congenital ptosis", "Senile ptosis", "Myotonic dystrophy", "Oculopharyngeal muscular dystrophy", "Mitochondrial myopathy"],
  "Speech and language problems": ["Stroke", "Aphasia", "Dysarthria", "Transient ischemic attack", "Brain tumor", "Multiple sclerosis", "Motor neurone disease", "Parkinson's disease", "Developmental language disorder", "Autism spectrum disorder", "Hearing loss", "Selective mutism", "Dysphonia", "Voice disorder", "Cerebral palsy"],
  "Tremor": ["Essential tremor", "Parkinson's disease", "Cerebellar tremor", "Physiological tremor", "Anxiety", "Hyperthyroidism", "Caffeine", "Drug-induced tremor", "Beta-agonists", "Valproate", "Lithium", "Alcohol withdrawal", "Wilson's disease", "Dystonic tremor", "Enhanced physiological tremor"],
  "Unsteadiness": ["Cerebellar disease", "Parkinson's disease", "Stroke", "Peripheral neuropathy", "Vestibular disorders", "Normal pressure hydrocephalus", "Vitamin B12 deficiency", "Cervical myelopathy", "Multiple sclerosis", "Medication side effect", "Hereditary ataxia", "Alcohol toxicity"],
  "Vertigo": ["Benign paroxysmal positional vertigo", "Vestibular neuronitis", "Ménière's disease", "Labyrinthitis", "Migraine-associated vertigo", "Posterior circulation stroke", "Acoustic neuroma", "Multiple sclerosis", "Medication side effect", "Vertebrobasilar insufficiency"],

  // Mental Health and Psychiatry (19 presentations)
  "Abnormal eating or exercising behaviour": ["Anorexia nervosa", "Bulimia nervosa", "Binge eating disorder", "Avoidant restrictive food intake disorder", "Exercise addiction", "Body dysmorphic disorder", "Orthorexia", "Compulsive exercise"],
  "Addiction": ["Alcohol use disorder", "Opioid use disorder", "Stimulant use disorder", "Cannabis use disorder", "Benzodiazepine dependence", "Gambling disorder", "Gaming disorder", "Nicotine dependence"],
  "Anxiety, phobias, OCD": ["Generalized anxiety disorder", "Panic disorder", "Social anxiety disorder", "Specific phobia", "Agoraphobia", "Obsessive-compulsive disorder", "Post-traumatic stress disorder", "Health anxiety", "Hypochondriasis", "Separation anxiety disorder"],
  "Auditory hallucinations": ["Schizophrenia", "Schizoaffective disorder", "Bipolar disorder", "Manic episode", "Severe depression with psychotic features", "Substance-induced psychosis", "Delirium", "Dementia with Lewy bodies", "Charles Bonnet syndrome", "Temporal lobe epilepsy", "Brain tumor"],
  "Behavioural difficulties in childhood": ["Attention deficit hyperactivity disorder", "Autism spectrum disorder", "Oppositional defiant disorder", "Conduct disorder", "Attachment disorder", "Learning disability", "Anxiety disorders", "Child abuse", "Neglect", "Family stress", "Family dysfunction", "Trauma"],
  "Child abuse": ["Physical abuse", "Sexual abuse", "Emotional abuse", "Neglect", "Fabricated illness", "Induced illness", "Munchausen by proxy"],
  "Elation/elated mood": ["Bipolar disorder", "Manic episode", "Hypomanic episode", "Schizoaffective disorder", "Substance-induced", "Stimulants", "Steroids", "Hyperthyroidism", "Frontal lobe lesion", "Cyclothymia"],
  "Elder abuse": ["Physical abuse", "Psychological abuse", "Financial abuse", "Sexual abuse", "Neglect", "Institutional abuse"],
  "End of life care/symptoms of terminal illness": ["Pain", "Dyspnea", "Nausea", "Vomiting", "Constipation", "Delirium", "Terminal agitation", "Death rattle", "Respiratory secretions", "Anorexia", "Cachexia", "Fatigue", "Anxiety", "Depression", "Spiritual distress"],
  "Fixed abnormal beliefs": ["Schizophrenia", "Delusions", "Delusional disorder", "Bipolar disorder", "Severe depression with psychotic features", "Dementia", "Substance-induced psychosis", "Organic psychosis", "Brain tumor", "Encephalitis", "Body dysmorphic disorder", "Hypochondriasis"],
  "Learning disability": ["Intellectual disability", "Genetic syndromes", "Down's syndrome", "Fragile X syndrome", "Fetal alcohol syndrome", "Birth injury", "Hypoxic brain injury", "Congenital infections", "CMV", "Toxoplasmosis", "Lead poisoning", "Cerebral palsy", "Inborn errors of metabolism", "Autism spectrum disorder"],
  "Loss of libido": ["Depression", "Anxiety", "Relationship problems", "Stress", "Medication", "SSRIs", "Antipsychotics", "Beta-blockers", "Hypogonadism", "Hyperprolactinemia", "Hypothyroidism", "Chronic illness", "Alcohol misuse", "Substance misuse", "Menopause"],
  "Low mood/affective problems": ["Major depressive disorder", "Persistent depressive disorder", "Dysthymia", "Bipolar disorder", "Depressive episode", "Seasonal affective disorder", "Post-natal depression", "Adjustment disorder", "Bereavement", "Medical illness", "Hypothyroidism", "Anemia", "Cancer", "Substance misuse", "Medication side effect"],
  "Mental capacity concerns": ["Dementia", "Delirium", "Learning disability", "Severe mental illness", "Psychosis", "Severe depression", "Stroke", "Traumatic brain injury", "Substance intoxication"],
  "Mental health problems in pregnancy or postpartum": ["Postnatal depression", "Postpartum psychosis", "Anxiety disorders", "Obsessive-compulsive disorder", "Post-traumatic stress disorder", "Bipolar disorder", "Schizophrenia relapse", "Adjustment disorder", "Tokophobia"],
  "Pressure of speech": ["Bipolar disorder", "Mania", "Hypomania", "Schizophrenia", "Schizoaffective disorder", "Anxiety disorder", "Hyperthyroidism", "Stimulant use", "Cocaine", "Amphetamines", "Frontal lobe disinhibition"],
  "Sleep problems": ["Insomnia", "Primary insomnia", "Secondary insomnia", "Obstructive sleep apnea", "Restless legs syndrome", "Circadian rhythm disorders", "Narcolepsy", "Depression", "Anxiety", "Bipolar disorder", "Medication side effect", "Substance misuse", "Chronic pain", "Parasomnias", "Night terrors", "Sleepwalking"],
  "Somatisation/medically unexplained physical symptoms": ["Somatic symptom disorder", "Illness anxiety disorder", "Functional neurological disorder", "Conversion disorder", "Persistent pain disorder", "Depression", "Anxiety disorders", "Trauma", "Abuse history", "Personality disorder", "Factitious disorder"],
  "Struggling to cope at home": ["Dementia", "Depression", "Anxiety", "Frailty", "Physical decline", "Chronic illness", "Social isolation", "Financial difficulties", "Housing problems", "Bereavement", "Caregiver burden"],
  "Suicidal thoughts": ["Major depressive disorder", "Bipolar disorder", "Schizophrenia", "Borderline personality disorder", "Post-traumatic stress disorder", "Substance misuse", "Chronic pain", "Chronic illness", "Social isolation", "Recent loss", "Bereavement", "Financial problems", "Legal problems"],
  "Threats to harm others": ["Schizophrenia", "Command hallucinations", "Mania with irritability", "Antisocial personality disorder", "Intermittent explosive disorder", "Substance intoxication", "Alcohol intoxication", "Stimulant intoxication", "Delirium", "Frontal lobe syndrome", "Intellectual disability", "Autism spectrum disorder"],
  "Visual hallucinations": ["Dementia with Lewy bodies", "Parkinson's disease dementia", "Charles Bonnet syndrome", "Delirium", "Alcohol withdrawal", "Drug-induced hallucinations", "LSD", "Amphetamines", "Schizophrenia", "Severe depression with psychotic features", "Mania with psychotic features", "Brain tumor", "Occipital lobe lesion"],

  // Musculoskeletal and Rheumatology (5 presentations)
  "Acute joint pain/swelling": ["Septic arthritis", "Gout", "Pseudogout", "Calcium pyrophosphate", "Reactive arthritis", "Rheumatoid arthritis flare", "Trauma", "Fracture", "Hemarthrosis", "Bleeding disorder", "Anticoagulation", "Juvenile idiopathic arthritis", "Transient synovitis", "Osteomyelitis", "Lyme disease"],
  "Chronic joint pain/stiffness": ["Osteoarthritis", "Rheumatoid arthritis", "Psoriatic arthritis", "Ankylosing spondylitis", "Polymyalgia rheumatica", "Systemic lupus erythematosus", "Fibromyalgia", "Chronic gout", "Hemochromatosis", "Sarcoidosis", "Juvenile idiopathic arthritis"],
  "Limp": ["Trauma", "Fracture", "Soft tissue injury", "Septic arthritis", "Osteomyelitis", "Transient synovitis", "Irritable hip", "Perthes disease", "Slipped capital femoral epiphysis", "Developmental dysplasia of hip", "Juvenile idiopathic arthritis", "Bone tumor", "Non-accidental injury", "Cerebral palsy", "Muscular dystrophy"],
  "Musculoskeletal deformities": ["Developmental dysplasia of hip", "Clubfoot", "Talipes equinovarus", "Scoliosis", "Kyphosis", "Genu valgum", "Genu varum", "Knock knees", "Bow legs", "Rheumatoid arthritis", "Osteoarthritis", "Rickets", "Cerebral palsy", "Marfan syndrome", "Ehlers-Danlos syndrome"],
  "Red eye": ["Conjunctivitis", "Viral conjunctivitis", "Bacterial conjunctivitis", "Allergic conjunctivitis", "Subconjunctival hemorrhage", "Acute glaucoma", "Anterior uveitis", "Iritis", "Keratitis", "Episcleritis", "Scleritis", "Foreign body", "Corneal abrasion", "Blepharitis", "Dry eye syndrome"],

  // Dermatology (9 presentations)
  "Acute rash": ["Viral exanthem", "Measles", "Rubella", "Roseola", "Varicella", "Urticaria", "Allergic reaction", "Erythema multiforme", "Stevens-Johnson syndrome", "TEN", "Drug eruption", "Meningococcal septicemia", "Henoch-Schönlein purpura", "Kawasaki disease", "Scarlet fever", "Cellulitis", "Impetigo", "Contact dermatitis", "Pityriasis rosea", "Guttate psoriasis"],
  "Chronic rash": ["Atopic dermatitis", "Eczema", "Psoriasis", "Seborrhoeic dermatitis", "Contact dermatitis", "Allergic contact dermatitis", "Irritant contact dermatitis", "Lichen planus", "Discoid lupus", "Cutaneous T-cell lymphoma", "Tinea corporis", "Scabies", "Chronic urticaria", "Pityriasis versicolor"],
  "Nail abnormalities": ["Fungal nail infection", "Onychomycosis", "Psoriasis", "Lichen planus", "Alopecia areata", "Trauma", "Paronychia", "Subungual hematoma", "Melanoma", "Pigmented lesion", "Clubbing", "Respiratory disease", "Cardiac disease", "Koilonychia", "Iron deficiency", "Yellow nail syndrome", "Beau's lines"],
  "Petechial rash": ["Meningococcal septicemia", "Idiopathic thrombocytopenic purpura", "Henoch-Schönlein purpura", "Thrombocytopenia", "Acute leukemia", "Vasculitis", "Non-accidental injury", "Coagulopathy", "Hemophilia", "DIC", "Drug-induced thrombocytopenia", "Antibiotics", "Viral infection", "EBV", "CMV"],
  "Purpura": ["Thrombocytopenia", "ITP", "Drug-induced thrombocytopenia", "Bone marrow failure", "Henoch-Schönlein purpura", "Vasculitis", "Meningococcemia", "Coagulopathy", "Senile purpura", "Scurvy", "Vitamin C deficiency", "Amyloidosis", "Ehlers-Danlos syndrome"],
  "Scarring": ["Post-traumatic scarring", "Post-surgical scarring", "Acne scars", "Burns", "Keloid scar", "Hypertrophic scar", "Chickenpox scars", "Self-harm scars", "Non-accidental injury"],
  "Skin lesion": ["Seborrhoeic keratosis", "Dermatofibroma", "Lipoma", "Skin tags", "Basal cell carcinoma", "Squamous cell carcinoma", "Melanoma", "Actinic keratosis", "Bowen's disease", "Cherry angioma", "Spider naevi", "Port-wine stain", "Eczema", "Psoriasis plaque", "Lichen planus"],
  "Skin or subcutaneous lump": ["Lipoma", "Sebaceous cyst", "Epidermoid cyst", "Dermatofibroma", "Abscess", "Neurofibroma", "Lymph node", "Basal cell carcinoma", "Squamous cell carcinoma", "Melanoma", "Sarcoma", "Ganglion cyst"],

  // Pediatrics - General (13 presentations)
  "Bruising": ["Trauma", "Thrombocytopenia", "ITP", "Drug-induced thrombocytopenia", "Bone marrow failure", "Coagulopathy", "Hemophilia", "Von Willebrand disease", "Anticoagulant therapy", "Antiplatelet therapy", "Liver disease", "Vitamin C deficiency", "Scurvy", "Henoch-Schönlein purpura", "Non-accidental injury", "Senile purpura", "Vasculitis"],
  "Congenital abnormalities": ["VSD", "ASD", "PDA", "Tetralogy of Fallot", "Coarctation of aorta", "Spina bifida", "Anencephaly", "Tracheo-esophageal fistula", "Imperforate anus", "Gastroschisis", "Hydronephrosis", "Polycystic kidney", "Limb abnormalities", "Cleft lip", "Cleft palate", "Diaphragmatic hernia", "Down's syndrome", "Edwards syndrome", "Patau syndrome"],
  "Crying baby": ["Hunger", "Discomfort", "Wet nappy", "Temperature discomfort", "Colic", "Gastro-oesophageal reflux", "Constipation", "Milk protein allergy", "Infection", "UTI", "Meningitis", "Otitis media", "Intussusception", "Testicular torsion", "Incarcerated hernia", "Non-accidental injury", "Hair tourniquet"],
  "Difficulty with breast feeding": ["Poor latch", "Low milk supply", "Engorgement", "Blocked duct", "Mastitis", "Nipple pain", "Nipple damage", "Tongue tie", "Infant not gaining weight", "Maternal anxiety", "Maternal fatigue"],
  "Dysmorphic child": ["Down's syndrome", "Turner syndrome", "Noonan syndrome", "Williams syndrome", "Prader-Willi syndrome", "Angelman syndrome", "Fetal alcohol syndrome", "CHARGE syndrome", "22q11 deletion syndrome", "Congenital hypothyroidism"],
  "Infant feeding problems": ["Breastfeeding difficulties", "Poor latch", "Low milk supply", "Milk protein allergy", "Gastro-oesophageal reflux", "Tongue tie", "Cleft lip", "Cleft palate", "Pyloric stenosis", "Oral thrush", "Cardiac disease", "Sepsis", "Hypothyroidism"],
  "Neonatal death or cot death": ["Sudden infant death syndrome", "SIDS", "Prematurity complications", "Congenital abnormalities", "Infection", "Sepsis", "Meningitis", "Non-accidental injury", "Cardiac arrhythmia", "Metabolic disorder"],
  "Prematurity": ["Respiratory distress syndrome", "Bronchopulmonary dysplasia", "Necrotizing enterocolitis", "Intraventricular hemorrhage", "Retinopathy of prematurity", "Patent ductus arteriosus", "Hypothermia", "Hypoglycemia", "Jaundice", "Apnea of prematurity", "Sepsis", "Developmental delay", "Cerebral palsy"],
  "Small for gestational age/large for gestational age": ["IUGR", "Placental insufficiency", "Maternal hypertension", "Maternal smoking", "Congenital infection", "Chromosomal abnormality", "Maternal diabetes", "Constitutional", "Beckwith-Wiedemann syndrome", "Hypoglycemia", "Polycythemia", "Birth trauma"],
  "Squint": ["Refractive error", "Amblyopia", "Strabismus", "Accommodative strabismus", "Congenital strabismus", "Cranial nerve palsy", "Third nerve palsy", "Fourth nerve palsy", "Sixth nerve palsy", "Retinoblastoma", "Cataract", "Neurological disease", "Cerebral palsy", "Hydrocephalus"],
  "The sick child": ["Sepsis", "Meningitis", "Pneumonia", "Bronchiolitis", "Gastroenteritis with dehydration", "Diabetic ketoacidosis", "Intussusception", "Appendicitis", "Non-accidental injury", "Cardiac disease", "Metabolic disorder", "Acute leukemia"],
  "Vaccination": ["Routine childhood immunization", "Contraindications", "Precautions", "Vaccine-preventable diseases", "Adverse reactions", "Fever", "Local reactions", "Anaphylaxis", "Immunocompromised patients"],
  "Wellbeing checks": ["Growth monitoring", "Developmental surveillance", "Safeguarding concerns", "Parental health", "Postnatal depression", "Social circumstances", "Health promotion", "Immunization status"],

  // Obstetrics and Gynecology (22 presentations)
  "Abnormal cervical smear result": ["HPV infection", "Cervical intraepithelial neoplasia", "CIN", "Cervical cancer", "Inflammation", "Infection", "Inadequate sample"],
  "Bleeding antepartum": ["Placenta previa", "Placental abruption", "Vasa previa", "Cervical ectropion", "Cervical polyp", "Cervical cancer", "Trauma", "Show", "Bloody show", "Marginal placental bleed"],
  "Bleeding postpartum": ["Uterine atony", "Retained placenta", "Retained products of conception", "Genital tract trauma", "Perineal tears", "Vaginal tears", "Cervical tears", "Uterine inversion", "Coagulopathy", "Uterine rupture"],
  "Breast lump": ["Fibroadenoma", "Breast cyst", "Breast cancer", "Fibrocystic breast disease", "Lipoma", "Fat necrosis", "Abscess", "Mastitis"],
  "Breast tenderness/pain": ["Cyclical mastalgia", "Hormonal mastalgia", "Pregnancy", "Lactation", "Mastitis", "Breast abscess", "Fibrocystic breast disease", "Costochondritis", "Referred pain", "Cardiac pain", "Musculoskeletal pain", "Medication", "Hormones", "Antipsychotics"],
  "Complications of labour": ["Failure to progress", "Fetal distress", "Shoulder dystocia", "Cord prolapse", "Uterine rupture", "Placental abruption", "Postpartum hemorrhage", "Maternal exhaustion", "Obstructed labor", "Precipitate labor", "Retained placenta"],
  "Contraception request/advice": ["Combined oral contraceptive pill", "Progesterone-only pill", "Injectable contraception", "Implant", "Intrauterine device", "Copper IUD", "Hormonal IUD", "Barrier methods", "Emergency contraception", "Sterilization", "Natural family planning", "Contraindications", "Eligibility"],
  "Hyperemesis": ["Hyperemesis gravidarum", "Multiple pregnancy", "Molar pregnancy", "Gastroenteritis", "Urinary tract infection", "Thyrotoxicosis", "Psychological factors"],
  "Intrauterine death": ["Placental insufficiency", "Placental abruption", "Cord accident", "Congenital abnormality", "Infection", "Parvovirus", "CMV", "Toxoplasmosis", "Maternal diabetes", "Pre-eclampsia", "Antiphospholipid syndrome", "Rhesus isoimmunization", "Unknown"],
  "Labour": ["Normal labor", "Latent phase", "Active labor", "Second stage", "Pushing stage", "Third stage", "Placenta delivery", "Augmentation of labor", "Induction of labor"],
  "Menopausal problems": ["Vasomotor symptoms", "Hot flushes", "Night sweats", "Vaginal atrophy", "Vaginal dryness", "Mood changes", "Depression", "Sleep disturbance", "Reduced libido", "Urinary symptoms", "Frequency", "Urgency", "Infections", "Osteoporosis risk", "Cardiovascular risk"],
  "Normal pregnancy and antenatal care": ["Booking visit", "Routine antenatal appointments", "Screening tests", "Anomaly scan", "Blood tests", "Fetal growth monitoring", "Management of minor symptoms", "Education", "Birth planning", "Risk assessment", "Vaccination", "Pertussis", "Influenza"],
  "Painful sexual intercourse": ["Vaginal atrophy", "Vaginal dryness", "Vulvovaginitis", "Endometriosis", "Pelvic inflammatory disease", "Vaginismus", "Vulvodynia", "Cervical pathology", "Uterine pathology", "Psychological factors", "Postpartum trauma", "Postpartum scarring"],
  "Pelvic mass": ["Ovarian cyst", "Ovarian cancer", "Uterine fibroids", "Pregnancy", "Bladder distension", "Bowel mass", "Endometrioma", "Tubo-ovarian abscess"],
  "Pelvic pain": ["Pelvic inflammatory disease", "Endometriosis", "Ovarian cyst rupture", "Ovarian torsion", "Ectopic pregnancy", "Dysmenorrhea", "Adenomyosis", "Ovulation pain", "Mittelschmerz", "Adhesions", "Irritable bowel syndrome", "Urinary tract infection", "Musculoskeletal pain"],
  "Reduced/change in fetal movements": ["Normal variation", "Fetal sleep cycle", "Placental insufficiency", "Oligohydramnios", "Intrauterine growth restriction", "Fetal distress", "Intrauterine death", "Anterior placenta"],
  "Subfertility": ["Ovulatory disorders", "PCOS", "Hypothalamic amenorrhea", "Tubal factor", "PID", "Endometriosis", "Uterine factor", "Fibroids", "Polyps", "Male factor", "Low sperm count", "Low sperm quality", "Unexplained infertility", "Age-related decline", "Premature ovarian insufficiency"],
  "Unwanted pregnancy and termination": ["Medical termination", "Surgical termination", "Counseling", "Contraception advice", "Safeguarding concerns", "Adoption"],
  "Urethral discharge and genital ulcers/warts": ["Chlamydia", "Gonorrhea", "Genital herpes", "HSV", "Syphilis", "Genital warts", "HPV", "Trichomonas", "Candidiasis", "Bacterial vaginosis", "Chancroid", "Lymphogranuloma venereum"],
  "Vaginal discharge": ["Physiological discharge", "Bacterial vaginosis", "Candidiasis", "Thrush", "Trichomonas", "Chlamydia", "Gonorrhea", "Cervicitis", "Foreign body", "Cervical polyp", "Cervical cancer"],
  "Vaginal prolapse": ["Cystocele", "Anterior wall prolapse", "Rectocele", "Posterior wall prolapse", "Uterine prolapse", "Vault prolapse", "Post-hysterectomy prolapse", "Enterocele", "Childbirth", "Age", "Obesity", "Chronic cough"],
  "Vulval itching/lesion": ["Candidiasis", "Lichen sclerosus", "Lichen planus", "Contact dermatitis", "Vulval intraepithelial neoplasia", "Vulval cancer", "Genital warts", "Herpes simplex", "Bartholin's cyst", "Sebaceous cyst"],
  "Vulval/vaginal lump": ["Bartholin's cyst", "Bartholin's abscess", "Sebaceous cyst", "Genital warts", "Vaginal cyst", "Fibroma", "Vulval cancer", "Prolapse"],

  // Ophthalmology and ENT (13 presentations)
  "Anosmia": ["Upper respiratory tract infection", "Post-viral anosmia", "Nasal polyps", "Chronic rhinosinusitis", "Allergic rhinitis", "Head trauma", "Neurodegenerative disease", "Parkinson's disease", "Alzheimer's disease", "Congenital anosmia", "Kallmann syndrome", "COVID-19", "Nasal tumor", "Smoking"],
  "Ear and nasal discharge": ["Otitis externa", "Otitis media with perforation", "Chronic suppurative otitis media", "Rhinosinusitis", "Allergic rhinitis", "Foreign body", "CSF leak", "Base of skull fracture", "Cholesteatoma", "Mastoiditis"],
  "Flashes and floaters in visual fields": ["Posterior vitreous detachment", "Retinal tear", "Retinal detachment", "Vitreous hemorrhage", "Uveitis", "Migraine", "Visual aura", "Age-related floaters", "Benign floaters"],
  "Hearing loss": ["Wax impaction", "Otitis media with effusion", "Otosclerosis", "Perforated tympanic membrane", "Age-related hearing loss", "Presbycusis", "Noise-induced hearing loss", "Ménière's disease", "Acoustic neuroma", "Ototoxic drugs", "Congenital hearing loss", "Genetic hearing loss", "Congenital infection", "Glue ear", "Mixed hearing loss"],
  "Loss of red reflex": ["Cataract", "Retinoblastoma", "Persistent fetal vasculature", "Vitreous hemorrhage", "Retinal detachment", "Corneal opacity", "Leukocoria"],
  "Loss of smell": ["Upper respiratory tract infection", "Post-viral", "Nasal polyps", "Chronic rhinosinusitis", "Head trauma", "Neurodegenerative disease", "COVID-19", "Nasal tumor"],
  "Nasal obstruction": ["Deviated nasal septum", "Nasal polyps", "Chronic rhinosinusitis", "Allergic rhinitis", "Adenoidal hypertrophy", "Nasal tumor", "Foreign body", "Cocaine use"],
  "Neck lump": ["Lymphadenopathy", "Infection", "Malignancy", "Thyroid nodule", "Goiter", "Thyroglossal cyst", "Branchial cyst", "Cystic hygroma", "Salivary gland tumor", "Carotid body tumor", "Lipoma", "Dermoid cyst", "Tuberculosis lymph node"],
  "Painful ear": ["Otitis externa", "Otitis media", "Mastoiditis", "Foreign body", "Temporomandibular joint disorder", "Referred pain", "Dental pain", "Pharyngeal pain", "Trauma", "Furunculosis", "Herpes zoster", "Ramsay Hunt syndrome"],
  "Sore throat": ["Viral pharyngitis", "Bacterial pharyngitis", "Strep throat", "Tonsillitis", "Infectious mononucleosis", "Glandular fever", "Peritonsillar abscess", "Quinsy", "Epiglottitis", "Gastro-oesophageal reflux", "Laryngopharyngeal reflux"],
  "Tinnitus": ["Age-related hearing loss", "Noise-induced hearing loss", "Ménière's disease", "Acoustic neuroma", "Otosclerosis", "Temporomandibular joint disorder", "Medication", "Aspirin", "Aminoglycosides", "Pulsatile tinnitus", "Vascular malformation", "Carotid stenosis", "Impacted wax"],

  // Renal and Urology (4 presentations)
  "Haematuria": ["Urinary tract infection", "Kidney stones", "Bladder cancer", "Prostate cancer", "Renal cell carcinoma", "Glomerulonephritis", "Benign prostatic hyperplasia", "Polycystic kidney disease", "Trauma", "Anticoagulation", "IgA nephropathy", "Exercise-induced hematuria"],
  "Loin pain": ["Pyelonephritis", "Kidney stones", "Renal colic", "Renal infarction", "Renal vein thrombosis", "Polycystic kidney disease", "Musculoskeletal pain", "Referred pain", "Abdominal pain"],
  "Oliguria": ["Dehydration", "Hypovolemia", "Heart failure", "Acute tubular necrosis", "Glomerulonephritis", "Urinary obstruction", "Kidney stones", "BPH", "Tumor", "Acute kidney injury"],
  "Urinary incontinence": ["Stress incontinence", "Pelvic floor weakness", "Urge incontinence", "Overactive bladder", "Mixed incontinence", "Overflow incontinence", "Urinary retention", "Functional incontinence", "Neurogenic bladder", "Spinal cord disease", "MS", "Urinary tract infection", "Dementia", "Prostate enlargement", "Fistula", "Vesicovaginal fistula"],
  "Urinary symptoms": ["Lower urinary tract symptoms", "LUTS", "Benign prostatic hyperplasia", "Overactive bladder", "Urinary tract infection", "Interstitial cystitis", "Prostatitis", "Bladder cancer", "Urethral stricture", "Neurogenic bladder", "Medication side effect"],

  // Hematology and Oncology (7 presentations)
  "Fatigue": ["Anemia", "Iron deficiency", "B12 deficiency", "Folate deficiency", "Hemolysis", "Hypothyroidism", "Diabetes mellitus", "Chronic kidney disease", "Heart failure", "Depression", "Chronic fatigue syndrome", "Malignancy", "Infection", "Viral infection", "Tuberculosis", "HIV", "Sleep disorders", "Medication side effect", "Adrenal insufficiency"],
  "Fever": ["Viral infection", "Respiratory infection", "GI infection", "Bacterial infection", "Pneumonia", "UTI", "Sepsis", "Childhood infections", "Measles", "Chickenpox", "Malaria", "Tuberculosis", "Endocarditis", "Malignancy", "Lymphoma", "Autoimmune disease", "SLE", "Still's disease", "Drug reaction", "Factitious fever", "Heat stroke"],
  "Lymphadenopathy": ["Viral infection", "EBV", "CMV", "HIV", "Bacterial infection", "Streptococcus", "Tuberculosis", "Cat scratch disease", "Malignancy", "Lymphoma", "Leukemia", "Metastatic cancer", "Autoimmune disease", "SLE", "Rheumatoid arthritis", "Sarcoidosis", "Reactive lymphadenopathy", "Kawasaki disease"],
  "Night sweats": ["Lymphoma", "Tuberculosis", "HIV", "AIDS", "Endocarditis", "Hyperthyroidism", "Menopause", "Medication", "Antidepressants", "Hormones", "Idiopathic hyperhidrosis", "Obstructive sleep apnea", "Anxiety"],
  "Organomegaly": ["Hepatomegaly", "Cirrhosis", "Hepatitis", "Heart failure", "Malignancy", "Storage diseases", "Splenomegaly", "Portal hypertension", "Hematological malignancy", "Infection", "Malaria", "EBV", "Hemolysis", "Myeloproliferative disorders", "Lymphoma", "Amyloidosis"],
  "Pallor": ["Anemia", "Iron deficiency", "B12 deficiency", "Folate deficiency", "Hemolytic anemia", "Aplastic anemia", "Acute blood loss", "Chronic disease", "Leukemia", "Genetic disorders", "Sickle cell", "Thalassemia", "Normal variation", "Fair complexion"],

  // Infectious Diseases (3 presentations)
  "Allergies": ["Food allergy", "Peanut allergy", "Tree nut allergy", "Milk allergy", "Egg allergy", "Shellfish allergy", "Drug allergy", "Penicillin allergy", "NSAID allergy", "Insect venom allergy", "Environmental allergies", "Pollen allergy", "Dust mite allergy", "Animal dander allergy", "Latex allergy", "Allergic rhinitis", "Asthma", "Atopic dermatitis"],
  "Bites and stings": ["Insect bites", "Mosquito bites", "Bed bug bites", "Flea bites", "Hymenoptera stings", "Bee stings", "Wasp stings", "Hornet stings", "Animal bites", "Dog bites", "Cat bites", "Human bites", "Snake bite", "Spider bite", "Tick bite", "Lyme disease", "Marine stings", "Jellyfish stings", "Local reaction", "Systemic reaction", "Anaphylaxis", "Infection risk", "Cellulitis", "Rabies"],
  "Travel health advice": ["Vaccinations", "Hepatitis A", "Hepatitis B", "Typhoid", "Yellow fever", "Rabies", "Meningococcal vaccine", "Japanese encephalitis", "Malaria prophylaxis", "Traveler's diarrhea prevention", "Altitude sickness", "Deep vein thrombosis prevention", "Insect bite prevention", "Safe food practices", "Safe water practices", "Travel insurance", "Zika virus precautions"],

  // Miscellaneous and Cross-Specialty (9 presentations)
  "Death and dying": ["Terminal illness", "Cancer", "Heart failure", "Dementia", "COPD", "Palliative care needs", "Symptom control", "Advance care planning", "Bereavement support", "Expected death certification", "Unexpected death", "Coroner referral"],
  "Falls": ["Syncope", "Orthostatic hypotension", "Arrhythmia", "Seizure", "Stroke", "TIA", "Parkinson's disease", "Vestibular disorders", "Visual impairment", "Medication side effect", "Environmental hazards", "Sarcopenia", "Muscle weakness", "Osteoporosis", "Fracture risk", "Dementia"],
  "Family history of possible genetic disorder": ["Cancer syndromes", "BRCA", "Lynch syndrome", "FAP", "Cardiac conditions", "Hypertrophic cardiomyopathy", "Long QT syndrome", "Hemochromatosis", "Familial hypercholesterolemia", "Huntington's disease", "Sickle cell", "Thalassemia", "Cystic fibrosis carrier", "Muscular dystrophies", "Polycystic kidney disease", "Down's syndrome risk"],
  "Fit notes": ["Not fit for work", "Fit for work with adjustments", "Short-term illness", "Infection", "Injury", "Chronic conditions", "Mental health problems", "Post-operative recovery", "Occupational health referral", "Return to work planning"],
  "Frailty": ["Multi-morbidity", "Sarcopenia", "Cognitive impairment", "Falls", "Incontinence", "Delirium susceptibility", "Polypharmacy", "Social isolation", "Malnutrition", "Functional decline", "Increased care needs"],
  "Immobility": ["Stroke", "Hip fracture", "Severe arthritis", "Parkinson's disease", "Spinal cord injury", "Multiple sclerosis", "Severe heart disease", "Severe lung disease", "Frailty", "Obesity", "Pain", "Depression", "Complications", "DVT", "Pressure sores", "Pneumonia", "Deconditioning"],
  "Incidental findings": ["Pulmonary nodule", "Renal cyst", "Hepatic lesion", "Thyroid nodule", "Adrenal incidentaloma", "Ovarian cyst", "Bone lesion", "Further investigation", "Surveillance", "Patient anxiety management"],
  "Lump in groin": ["Inguinal hernia", "Femoral hernia", "Lymphadenopathy", "Lipoma", "Sebaceous cyst", "Saphena varix", "Femoral artery aneurysm", "Testicular malpresent", "Undescended testicle", "Abscess", "Hidradenitis suppurativa"],
  "Misplaced nasogastric tube": ["Bronchial placement", "Oesophageal placement", "Curled placement", "Gastric position", "Post-pyloric position", "Confirmation methods", "pH testing", "X-ray confirmation", "Complications", "Aspiration", "Pneumothorax", "Perforation"]
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
  const [selectionMode, setSelectionMode] = useState('condition'); // 'condition' or 'presentation'
  
  // Quiz state for presentations
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [flashGreen, setFlashGreen] = useState(false);

  // Get the appropriate data based on selection mode
  const dataSource = selectionMode === 'condition' ? conditionsWithSpecialties : presentationsWithSpecialties;

  // Get all items, filtered by specialties if selected
  const getFilteredItems = () => {
    if (filterSpecialties.length === 0) {
      return Object.keys(dataSource);
    }
    return Object.keys(dataSource).filter(item =>
      dataSource[item].some(specialty => 
        filterSpecialties.includes(specialty)
      )
    );
  };

  const items = getFilteredItems();

  // Get unique specialties for filter checkboxes (from both conditions and presentations)
  const allSpecialties = [...new Set(
    [...Object.values(conditionsWithSpecialties).flat(), ...Object.values(presentationsWithSpecialties).flat()]
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
  
  // Quiz functions for presentations
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || !selectedCondition) return;
    
    const expectedConditions = presentationsToConditions[selectedCondition] || [];
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    
    // Check if answer matches any expected condition (case-insensitive)
    const isCorrect = expectedConditions.some(condition => 
      condition.toLowerCase() === normalizedAnswer ||
      condition.toLowerCase().includes(normalizedAnswer) ||
      normalizedAnswer.includes(condition.toLowerCase())
    );
    
    if (isCorrect && !correctAnswers.some(ans => ans.toLowerCase() === normalizedAnswer)) {
      // Find the exact match from expected conditions
      const matchedCondition = expectedConditions.find(condition =>
        condition.toLowerCase() === normalizedAnswer ||
        condition.toLowerCase().includes(normalizedAnswer) ||
        normalizedAnswer.includes(condition.toLowerCase())
      );
      
      setCorrectAnswers(prev => [...prev, matchedCondition]);
      setFlashGreen(true);
      setTimeout(() => setFlashGreen(false), 500);
      setUserAnswer('');
    }
  };
  
  const getRemainingCount = () => {
    const expectedConditions = presentationsToConditions[selectedCondition] || [];
    return Math.max(0, expectedConditions.length - correctAnswers.length);
  };
  
  const resetQuiz = () => {
    setUserAnswer('');
    setCorrectAnswers([]);
    setShowAnswers(false);
    setFlashGreen(false);
  };
  
  const revealAnswers = () => {
    setShowAnswers(true);
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
    
    // Reset quiz state
    setUserAnswer('');
    setCorrectAnswers([]);
    setShowAnswers(false);
    setFlashGreen(false);

    // Random item selection
    const randomIndex = Math.floor(Math.random() * items.length);
    const selected = items[randomIndex];
    const specialties = dataSource[selected];

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
      setHistory(prev => [{ item: selected, specialties, type: selectionMode }, ...prev].slice(0, 10));
    }, 3000);
  };

  return (
    <div className={`fixed inset-0 w-screen h-screen ${
      selectionMode === 'condition' 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-100' 
        : 'bg-gradient-to-br from-purple-50 to-pink-100'
    } overflow-auto transition-colors duration-500`}>
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-center text-indigo-900 mb-2">
            MLA Condition Wheel
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Spin to generate a random medical {selectionMode === 'condition' ? 'condition' : 'presentation'} with its clinical specialty
          </p>

          {/* Selection Mode Toggle */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setSelectionMode('condition')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectionMode === 'condition'
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Conditions
            </button>
            <button
              onClick={() => setSelectionMode('presentation')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectionMode === 'presentation'
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Presentations
            </button>
          </div>

          {/* How to Use Toggle Button */}
          <div className="text-center">
            <button
              onClick={() => setShowHowToUse(!showHowToUse)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 inline-flex items-center gap-2 ${
                selectionMode === 'condition'
                  ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
              }`}
            >
              {showHowToUse ? '✕ Hide' : 'ℹ️ How to Use for Revision'}
            </button>
          </div>

          {/* How to Use Section */}
          {showHowToUse && (
            <div className="mt-4 bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
              <h2 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                selectionMode === 'condition' ? 'text-indigo-900' : 'text-purple-900'
              }`}>How to Use This Wheel for Revision</h2>
              <div className="space-y-3 text-gray-700 text-left">
                <div className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                    selectionMode === 'condition' ? 'bg-indigo-500' : 'bg-purple-500'
                  }`}>1</span>
                  <p><strong>Random Practice:</strong> Click "Spin the Wheel" to get a random {selectionMode}. Try to recall everything you know about it before looking it up.</p>
                </div>
                <div className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                    selectionMode === 'condition' ? 'bg-indigo-500' : 'bg-purple-500'
                  }`}>2</span>
                  <p><strong>Focused Study:</strong> Use the specialty filter to focus on specific areas you need to revise (e.g., only Cardiovascular {selectionMode}s).</p>
                </div>
                <div className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                    selectionMode === 'condition' ? 'bg-indigo-500' : 'bg-purple-500'
                  }`}>3</span>
                  <p><strong>Active Recall:</strong> For each {selectionMode}, try to remember: key symptoms, investigations, differential diagnoses, and management plan.</p>
                </div>
                <div className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                    selectionMode === 'condition' ? 'bg-indigo-500' : 'bg-purple-500'
                  }`}>4</span>
                  <p><strong>Track Progress:</strong> Use the history section to review {selectionMode}s you've practiced and identify patterns in what you need to study more.</p>
                </div>
                <div className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                    selectionMode === 'condition' ? 'bg-indigo-500' : 'bg-purple-500'
                  }`}>5</span>
                  <p><strong>Study Buddy Mode:</strong> Spin the wheel with classmates and quiz each other on the selected {selectionMode}s.</p>
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
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectionMode === 'condition'
                      ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                  }`}
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
                    const count = Object.keys(dataSource).filter(
                      item => dataSource[item].includes(specialty)
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
                  Showing <span className={`font-semibold transition-colors duration-300 ${
                    selectionMode === 'condition' ? 'text-indigo-600' : 'text-purple-600'
                  }`}>{items.length}</span> {selectionMode === 'condition' ? 'condition' : 'presentation'}{items.length !== 1 ? 's' : ''} matching selected {filterSpecialties.length === 1 ? 'specialty' : 'specialties'}
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
                className={`w-80 h-80 rounded-full ${
                  selectionMode === 'condition'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    : 'bg-gradient-to-br from-purple-500 to-pink-600'
                } shadow-2xl flex items-center justify-center relative overflow-hidden transition-colors duration-500`}
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
                    <div className={`text-sm font-semibold ${
                      selectionMode === 'condition' ? 'text-indigo-600' : 'text-purple-600'
                    } transition-colors duration-500`}>
                      {spinning ? 'SPINNING...' : 'READY'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <button
              onClick={spinWheel}
              disabled={spinning || items.length === 0}
              className={`px-8 py-4 text-xl font-bold rounded-full shadow-lg transform transition-all duration-500 ${
                spinning || items.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : selectionMode === 'condition'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 active:scale-95'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95'
              } text-white`}
            >
              {spinning ? 'SPINNING...' : items.length === 0 ? `NO ${selectionMode.toUpperCase()}S AVAILABLE` : 'SPIN THE WHEEL'}
            </button>

            {/* Selected Item Display */}
            {selectedCondition && (
              <div className={`mt-8 bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl transition-all duration-500 ${
                flashGreen ? 'ring-4 ring-green-500' : ''
              }`}>
                <h2 className="text-sm font-semibold text-gray-500 mb-2">SELECTED {selectionMode.toUpperCase()}:</h2>
                <p className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  selectionMode === 'condition' ? 'text-indigo-900' : 'text-purple-900'
                }`}>{selectedCondition}</p>
                
                {/* Quiz Interface for Presentations */}
                {selectionMode === 'presentation' && presentationsToConditions[selectedCondition] && !showAnswers && (
                  <div className="border-t pt-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-500">
                        NAME THE CONDITIONS:
                      </h3>
                      <span className={`text-lg font-bold transition-colors duration-300 ${
                        getRemainingCount() === 0 ? 'text-green-600' : 'text-purple-600'
                      }`}>
                        {getRemainingCount()} remaining
                      </span>
                    </div>
                    
                    {/* Input Form */}
                    <form onSubmit={handleAnswerSubmit} className="mb-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Type a condition..."
                          className="flex-1 px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                          disabled={getRemainingCount() === 0}
                        />
                        <button
                          type="submit"
                          disabled={!userAnswer.trim() || getRemainingCount() === 0}
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                    
                    {/* Correct Answers Display */}
                    {correctAnswers.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-green-700 mb-2">✓ Correct answers:</h4>
                        <div className="flex flex-wrap gap-2">
                          {correctAnswers.map((answer, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                            >
                              {answer}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={revealAnswers}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Reveal Answers
                      </button>
                      <button
                        onClick={resetQuiz}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Show All Answers (for presentations when revealed, or always for conditions) */}
                {selectionMode === 'presentation' && showAnswers && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">
                      ALL DIFFERENTIAL DIAGNOSES:
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {presentationsToConditions[selectedCondition]?.map((condition, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                            correctAnswers.includes(condition)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={resetQuiz}
                      className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors"
                    >
                      Try Again
                    </button>
                    <div className="mt-4 border-t pt-4">
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
                
                {selectionMode === 'condition' && (
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
                )}
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
                {history.map((historyItem, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                        historyItem.type === 'condition' ? 'bg-indigo-500' : 'bg-purple-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold uppercase transition-colors duration-300 ${
                            historyItem.type === 'condition' ? 'text-indigo-600' : 'text-purple-600'
                          }`}>
                            {historyItem.type}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 mb-2 break-words">{historyItem.item}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {historyItem.specialties.map((specialty, idx) => (
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
          <p>
            Total {selectionMode === 'condition' ? 'conditions' : 'presentations'} available: <span className={`font-semibold transition-colors duration-300 ${
              selectionMode === 'condition' ? 'text-indigo-600' : 'text-purple-600'
            }`}>{items.length}</span>
          </p>
          <p className="mt-1">
            {selectionMode === 'condition' ? 'Conditions are core diagnoses (not presentations)' : 'Presentations are signs, symptoms, and patient-related issues'} from the MLA content map
          </p>
        </div>
      </div>
    </div>
  );
}

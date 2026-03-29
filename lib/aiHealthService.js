
export const analyzeHealth = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 2500));

  const symptoms = (data.symptoms || "").toLowerCase();
  const lifestyle = (data.lifestyle || "").toLowerCase();
  const timeline = (data.timeline || "").toLowerCase();
  const history = (data.history || "").toLowerCase();
  
  const severityMap = { "low": 3, "medium": 6, "high": 9 };
  const severityScore = severityMap[data.severity] || parseInt(data.severity) || 3;
  
  const tempMap = { "normal": 98.6, "warm": 101.0, "fever": 103.5 };
  const temp = tempMap[data.temperature] || parseFloat(data.temperature) || 98.6;

  const emergencyFlags = ["chest pain", "shortness of breath", "difficulty breathing", "confusion", "loss of consciousness", "severe bleeding", "numbness", "blurred vision", "slurred speech"];
  const seriousFlags = ["persistent vomiting", "high fever", "migraine", "intense pain", "dizziness", "palpitations"];
  const hasEmergencySymptom = emergencyFlags.some(flag => symptoms.includes(flag));
  const hasSeriousSymptom = seriousFlags.some(flag => symptoms.includes(flag));

  let specialist = "General Physician";
  if (symptoms.includes("chest") || symptoms.includes("heart") || symptoms.includes("breath")) specialist = "Cardiologist";
  else if (symptoms.includes("stomach") || symptoms.includes("digestion") || symptoms.includes("gut")) specialist = "Gastroenterologist";
  else if (symptoms.includes("head") || symptoms.includes("migraine") || symptoms.includes("dizzy")) specialist = "Neurologist";
  else if (symptoms.includes("skin") || symptoms.includes("rash") || symptoms.includes("itch")) specialist = "Dermatologist";

  let causeOfIllness = "Unknown physiological stress";
  if (symptoms.includes("fever") || symptoms.includes("cold") || symptoms.includes("cough")) causeOfIllness = "Possible Viral or Bacterial Infection";
  else if (symptoms.includes("stomach") || symptoms.includes("nausea")) causeOfIllness = lifestyle.includes("junk") ? "Dietary Trigger / Gastric Irritation" : "Gastrointestinal Distress";
  else if (symptoms.includes("head") || symptoms.includes("migraine")) causeOfIllness = (data.vitals?.screenTime > 300) ? "Digital Eye Strain / Screen Fatigue" : "Neuralgic Tension";
  else if (symptoms.includes("tired") || symptoms.includes("fatigue")) causeOfIllness = "Exhaustion / Sleep Deprivation";

  let diagnosisType = "home";
  if (hasEmergencySymptom || temp > 103) diagnosisType = "hospital";
  else if (severityScore >= 9 || hasSeriousSymptom) diagnosisType = "doctor";

  return {
    type: diagnosisType,
    title: diagnosisType === "hospital" ? "Immediate Hospital Care Required" : diagnosisType === "doctor" ? "Direct Physician Consultation" : "Supervised Home Recovery",
    desc: diagnosisType === "hospital" ? "Critical emergency markers detected." : diagnosisType === "doctor" ? "High-severity symptoms detected." : "Your symptoms are being monitored.",
    advice: diagnosisType === "hospital" ? ["Proceed to ER immediately."] : diagnosisType === "doctor" ? [`Consult a ${specialist}.`] : ["Adhere to rest targets."],
    doctor: specialist,
    cause: causeOfIllness,
    treatmentPlan: {
      hydration: { target: "2.5", unit: "Liters Daily", icon: "Droplets", color: "text-blue-400" },
      sleep: { target: "8.0", unit: "Hours / Night", icon: "Moon", color: "text-indigo-400" },
      nutrition: { target: symptoms.includes("stomach") ? "BRAT Diet" : "Lean Protein", unit: "recovery focus", icon: "Apple", color: "text-emerald-400" },
      rest: { target: severityScore >= 6 ? "Complete Bed Rest" : "Standard", unit: "Critical Recovery", icon: "Activity", color: "text-amber-400" }
    }
  };
};

export const generateHealthReport = async (averages) => {
  const { sleep, distance, screenTime } = averages;
  
  // Stress Analysis
  let stressLevel = "Optimal";
  let stressColor = "text-emerald-400";
  let stressDesc = "Your physiological balance looks stable based on activity and rest patterns.";

  if (sleep < 6 || screenTime > 420) {
    stressLevel = "High Stress Indicators";
    stressColor = "text-red-400";
    stressDesc = "Chronic sleep deprivation and high digital exposure suggest elevated cortisol levels.";
  } else if (sleep < 7 || screenTime > 300 || distance < 2) {
    stressLevel = "Moderate Strain";
    stressColor = "text-amber-400";
    stressDesc = "Sub-optimal rest or low movement is creating minor physiological tension.";
  }

  // Dietary and Nutrition
  let dietAdvice = "Balanced Whole Foods";
  if (distance > 6) dietAdvice = "High-Protein / Complex Carb Focus";
  else if (screenTime > 360) dietAdvice = "Anti-Inflammatory / Omega-3 Rich";

  // Vitamin Recommendations
  let vitamins = ["Vitamin D3 (Immune Support)", "Magnesium (Muscle/Sleep Recovery)"];
  if (screenTime > 300) vitamins.push("Lutein (Eye Health Protection)");
  if (distance < 2) vitamins.push("B12 (Energy Metabolism)");
  if (sleep < 6) vitamins.push("Melatonin (Cycle Regulation - Short term)");

  return {
    averages: { sleep, distance, screenTime },
    stress: {
        level: stressLevel,
        color: stressColor,
        description: stressDesc
    },
    nutrition: {
        focus: dietAdvice,
        nutrients: distance > 5 ? ["Potassium", "Creatine", "Magnesium"] : ["Fiber", "Zinc", "Probiotics"],
        vitamins: vitamins
    },
    weeklyQuote: sleep > 7 && distance > 5 ? "You're in the elite recovery zone." : "Small adjustments in rest will yield massive energy gains."
  };
};

/**
 * Simulated AI Health Analysis Service
 * Provides intelligent-feeling health recommendations based on user vitals and input.
 */

export const analyzeHealth = async (data) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2500));

  const symptoms = data.symptoms.toLowerCase();
  const lifestyle = data.lifestyle.toLowerCase();
  const timeline = data.timeline.toLowerCase();
  const history = data.history.toLowerCase();
  const severity = data.severity;
  const age = parseInt(data.age);
  const vitals = data.vitals || {};
  const weight = data.weight;
  const height = data.height;

  // Specialist detection logic
  let specialist = null;
  if (symptoms.includes("chest") || symptoms.includes("heart") || symptoms.includes("breath")) {
    specialist = "Cardiologist";
  } else if (symptoms.includes("stomach") || symptoms.includes("digestion") || symptoms.includes("gut")) {
    specialist = "Gastroenterologist";
  } else if (symptoms.includes("head") || symptoms.includes("migraine") || symptoms.includes("dizzy")) {
    specialist = "Neurologist";
  } else if (symptoms.includes("skin") || symptoms.includes("rash") || symptoms.includes("itch")) {
    specialist = "Dermatologist";
  } else if (severity === "high" || age > 65) {
    specialist = "General Physician";
  }

  const currentSleep = parseFloat(data.lifestyle.match(/Sleep: (\d+)/)?.[1] || 0);
  const currentWater = data.lifestyle.includes("Low") ? 1 : data.lifestyle.includes("Normal") ? 2 : 3;

  // Recommendation engine
  let recommendations = {
    type: severity === "high" || specialist || age > 75 ? "hospital" : "home",
    title: "",
    desc: "",
    advice: [],
    doctor: specialist,
    aiInsights: [],
    treatmentPlan: {
      hydration: { 
        target: currentWater < 2.5 ? "2.5" : "3.0", 
        unit: "Liters Daily", 
        icon: "Droplets", 
        color: "text-blue-400" 
      },
      sleep: { 
        target: currentSleep < 7 ? "8.5" : "7.5", 
        unit: "Hours / Night", 
        icon: "Moon", 
        color: "text-indigo-400" 
      },
      nutrition: { 
        target: "Lean Protein", 
        unit: "& Leafy Greens", 
        icon: "Apple", 
        color: "text-emerald-400" 
      },
      rest: { 
        target: "Deep", 
        unit: "Recovery", 
        icon: "Coffee", 
        color: "text-amber-400" 
      }
    }
  };

  // Vitals Correlation Logic
  if (vitals.screenTime > 300) { // Over 5 hours
    recommendations.aiInsights.push("Warning: Excessive screen time usage (5h+) detected. This highly correlates with your reported ocular or cerebral strain.");
    recommendations.treatmentPlan.rest.target = "Digital Detox";
    recommendations.treatmentPlan.rest.icon = "EyeOff";
    if (symptoms.includes("head") || symptoms.includes("eye")) {
      recommendations.advice.push("Implement the 20-20-20 rule to reduce digital eye strain.");
    }
  }

  if (vitals.distance < 0.5) { // Less than 500m
    recommendations.aiInsights.push("Sedentary pattern detected: Extremely low physical activity (<500m) may be slowing your metabolic recovery.");
    recommendations.treatmentPlan.rest.target = "Light Motion";
    recommendations.treatmentPlan.rest.icon = "Activity";
    recommendations.advice.push("Try light stretching or a 10-minute walk to improve circulation if symptoms allow.");
  }

  if (recommendations.type === "hospital") {
    recommendations.title = "Urgent Medical Consultation";
    recommendations.desc = "AI Analysis detected patterns requiring professional medical intervention.";
    recommendations.advice = [
      "Contact Emergency Services if breathing becomes difficult.",
      "Bring your digital health record to the consultation.",
      ...recommendations.advice
    ];
    recommendations.aiInsights = [
      `Patient age (${age}) and symptom onset patterns indicate high priority.`,
      `Biometric correlation: Weight (${weight}) and Height (${height}) analyzed against symptom severity.`,
      ...recommendations.aiInsights
    ];
    recommendations.treatmentPlan.hydration.target = "Strict";
    recommendations.treatmentPlan.sleep.target = "Immediate";
  } else {
    recommendations.title = "Personalized Home Care Protocol";
    recommendations.desc = "Your reports indicate a non-critical condition manageable with structured care.";
    recommendations.advice = [
      "Maintain active hydration: Goal 2.5L / day.",
      "Ensure restorative sleep as indicated in your habits panel.",
      ...recommendations.advice
    ];
    recommendations.aiInsights = [
      "Biometric cross-check: User profile biometrics suggest stable recovery potential.",
      "Timeline consistency check: Symptom marked as manageable.",
      ...recommendations.aiInsights
    ];
  }

  // Specialized triggers
  if (lifestyle.includes("junk food") && symptoms.includes("stomach")) {
    recommendations.aiInsights.push("Nutritional Trigger: Correlation between recent processed food intake and gastric distress.");
    recommendations.treatmentPlan.nutrition.target = "Bland Diet";
    recommendations.treatmentPlan.nutrition.icon = "Soup";
  }

  return recommendations;
};

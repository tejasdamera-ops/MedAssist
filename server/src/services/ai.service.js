import { env } from "../config/env.js";

export async function generateClinicalSummary(note) {
  const prompt = [
    "Summarize this structured clinical note for physician review only.",
    "Do not add diagnoses, medications, recommendations, or claims absent from the input.",
    JSON.stringify({
      chiefComplaint: note.chiefComplaint,
      findings: note.examinationFindings,
      vitals: note.vitals,
      diagnosis: note.diagnosis,
      treatmentPlan: note.treatmentPlan
    })
  ].join("\n");

  if (!env.openAiApiKey) {
    return `Draft summary: ${note.chiefComplaint || "No chief complaint recorded"}. Findings: ${note.examinationFindings || "not recorded"}. Diagnoses listed: ${(note.diagnosis || []).join(", ") || "none"}.`;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.openAiApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4.1-mini", input: prompt })
  });
  const data = await response.json();
  return data.output_text || "AI summary unavailable";
}

export async function generatePlainExplanation(prescription) {
  const prompt = [
    "Rewrite only these prescription and follow-up instructions in simple patient-friendly language.",
    "Do not diagnose, suggest alternative treatments, or add new medical claims.",
    JSON.stringify({
      medications: prescription.medications,
      followUpDate: prescription.followUpDate
    })
  ].join("\n");

  if (!env.openAiApiKey) {
    return "Take medicines exactly as written on the prescription. Follow up on the listed date if one was provided.";
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.openAiApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4.1-mini", input: prompt })
  });
  const data = await response.json();
  return data.output_text || "Plain-language explanation unavailable";
}

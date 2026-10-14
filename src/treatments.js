export const TREATMENT_OPTIONS = [
  "Unheated",
  "Heated",
  "No indication of heating",
  "Beryllium treated"
];

export const normalizeTreatment = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

  if (["unheated", "untreated", "natural"].includes(normalized)) {
    return "Unheated";
  }
  if (normalized === "heated") return "Heated";
  if (
    [
      "no indication of heating",
      "no indication heating",
      "no evidence of heating",
      "no evidence heating"
    ].includes(normalized)
  ) {
    return "No indication of heating";
  }
  if (
    ["beryllium treated", "beryllium treatment", "beryllium"].includes(normalized)
  ) {
    return "Beryllium treated";
  }

  return value || "Not specified";
};

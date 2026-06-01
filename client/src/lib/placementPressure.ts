export type PlacementPressureBand = "low" | "normal" | "high" | "critical";
export type PlacementPressureHorizon = "TODAY" | "3_DAYS" | "1_WEEK" | "2_WEEKS" | ">2_WEEKS";
export type OperationalUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRISIS";

export interface PlacementPressureInput {
  start_date?: string;
  target_completion_date?: string;
  placement_pressure_horizon?: string;
  safety_pressure?: boolean;
  time_sensitive_arrangement?: boolean;
  escalation_needed?: boolean;
}

export interface PlacementPressureAssessment {
  band: PlacementPressureBand;
  urgency: OperationalUrgency;
  label: "Laag" | "Normaal" | "Hoog" | "Spoed";
  reason: string;
  implication: string;
  score: number;
}

function parseDateValue(value: string | undefined | null): Date | null {
  if (!value) {
    return null;
  }

  const [yearText, monthText, dayText] = String(value).split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeHorizon(value: string | undefined | null): PlacementPressureHorizon | "" {
  const normalized = String(value || "").trim().toUpperCase();
  if (
    normalized === "TODAY" ||
    normalized === "3_DAYS" ||
    normalized === "1_WEEK" ||
    normalized === "2_WEEKS" ||
    normalized === ">2_WEEKS"
  ) {
    return normalized;
  }
  return "";
}

export function derivePlacementPressure(input: PlacementPressureInput, now = new Date()): PlacementPressureAssessment {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let score = 0;
  const reasons: string[] = [];
  let implication = "Normale routing";

  const horizon = normalizeHorizon(input.placement_pressure_horizon);
  const horizonWeights: Record<PlacementPressureHorizon, number> = {
    TODAY: 4,
    "3_DAYS": 3,
    "1_WEEK": 2,
    "2_WEEKS": 1,
    ">2_WEEKS": 0,
  };
  const horizonReasons: Record<PlacementPressureHorizon, string> = {
    TODAY: "Directe inzet: acute plaatsingsdruk",
    "3_DAYS": "Binnen 72 uur: zeer korte termijn",
    "1_WEEK": "Binnen 1 week: korte termijn",
    "2_WEEKS": "Binnen 2 weken",
    ">2_WEEKS": "Langer dan 2 weken",
  };

  if (horizon) {
    score += horizonWeights[horizon];
    reasons.push(horizonReasons[horizon]);
  }

  const deadline = parseDateValue(input.target_completion_date ?? null);
  if (deadline) {
    const daysUntilDeadline = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDeadline <= 0) {
      score += 4;
      reasons.push("Uiterste plaatsingsdatum is bereikt of verlopen");
    } else if (daysUntilDeadline <= 3) {
      score += 3;
      reasons.push("Uiterste plaatsingsdatum valt binnen 3 dagen");
    } else if (daysUntilDeadline <= 14) {
      score += 2;
      reasons.push("Uiterste plaatsingsdatum valt binnen 14 dagen");
    }
  }

  const startDate = parseDateValue(input.start_date ?? null);
  if (startDate) {
    const daysUntilStart = Math.round((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilStart <= 0) {
      score += 2;
      reasons.push("Gewenste startdatum is vandaag of eerder");
    } else if (daysUntilStart <= 14) {
      score += 2;
      reasons.push("Gewenste startdatum valt binnen 14 dagen");
    }
  }

  if (input.safety_pressure) {
    score += 3;
    reasons.push("Veiligheidsdruk aanwezig");
  }

  if (input.time_sensitive_arrangement) {
    score += 2;
    reasons.push("Tijdskritisch arrangement");
  }

  if (input.escalation_needed) {
    score += 2;
    reasons.push("Escalatie nodig");
  }

  let band: PlacementPressureBand;
  if (score >= 8 || (input.safety_pressure && input.escalation_needed && (horizon === "TODAY" || horizon === "3_DAYS"))) {
    band = "critical";
    implication = "Spoedroute actief";
  } else if (score >= 5) {
    band = "high";
    implication = "Snelle plaatsing en strakkere opvolging nodig";
  } else if (score >= 2) {
    band = "normal";
    implication = "Normale routing";
  } else {
    band = "low";
    implication = "Ruimte voor inhoudelijke matching";
  }

  const urgency: OperationalUrgency = band === "critical" ? "CRISIS" : band === "high" ? "HIGH" : band === "normal" ? "MEDIUM" : "LOW";
  const label = band === "critical" ? "Spoed" : band === "high" ? "Hoog" : band === "normal" ? "Normaal" : "Laag";
  const reason = reasons.length > 0 ? reasons.slice(0, 3).join(" · ") : "Plaatsingsdruk lijkt stabiel.";

  return {
    band,
    urgency,
    label,
    reason,
    implication,
    score: Math.min(score, 10),
  };
}

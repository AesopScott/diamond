export function buildSlotDraftText(slot = {}, strategy = {}) {
  const language = slot.language || "en";
  const pillars = Array.isArray(strategy.pillars) ? strategy.pillars.slice(0, 2).join(" / ") : "";
  const audience = Array.isArray(strategy.audience) ? strategy.audience[0] : "";
  if (language === "es") {
    return [
      translateSlotTopic(slot.topic),
      strategyText(strategy, "offer", "es"),
      audience ? "Para fans del Mundial que quieren competir gratis." : "",
      pillars ? `Enfoque: ${translatePillars(pillars)}.` : "",
      strategyText(strategy, "cta", "es"),
    ].filter(Boolean).join(" ");
  }
  return [
    slot.topic,
    strategy.offer || "",
    audience ? `Built for ${audience.toLowerCase()}` : "",
    pillars ? `Angle: ${pillars}.` : "",
    strategy.cta || "",
  ].filter(Boolean).join(" ");
}

export function strategyText(strategy = {}, key, language) {
  if (language === "es") return strategy[`${key}Es`] || translateFallback(strategy[key], key);
  return strategy[key] || "";
}

export function translateSlotTopic(topic) {
  return String(topic || "")
    .replace(/World Cup/gi, "Mundial")
    .replace(/free league/gi, "liga gratis")
    .replace(/leaderboard/gi, "tabla de posiciones")
    .replace(/launch/gi, "lanzamiento");
}

export function translatePillars(value) {
  return String(value || "")
    .replace(/Country pride/gi, "orgullo por tu pais")
    .replace(/Leaderboard movement/gi, "movimiento en la tabla")
    .replace(/Prize clarity/gi, "premios claros")
    .replace(/Matchday urgency/gi, "urgencia de partido")
    .replace(/Free-to-play onboarding/gi, "entrada gratis al juego");
}

function translateFallback(value, key) {
  if (key === "cta") return "Unete gratis a la liga del Mundial en thecard.bet.";
  if (key === "offer") return "$1,000 en premios totales para la campana del Mundial.";
  return value || "";
}

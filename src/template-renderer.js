export function validateTemplateForRender(template) {
  if (!template) return { ok: false, reason: "Template is missing" };
  if (!template.companyId || !template.brandId || !template.campaignId) {
    return { ok: false, reason: "Template is missing tenant scope" };
  }
  if (!template.type) return { ok: false, reason: "Template is missing type" };
  if (!template.safeZone) return { ok: false, reason: "Template is missing safe-zone metadata" };
  return { ok: true, reason: "Template can render" };
}

export function renderWorldCupLeaderboardSvg(input = {}) {
  const title = input.title || "World Cup League";
  const subtitle = input.subtitle || "Free picks. Country pride. Real leaderboard heat.";
  const cta = input.cta || "Join at thecard.bet";
  const rows = normalizeRows(input.rows);
  const width = 1200;
  const height = 675;
  const rowMarkup = rows.map((row, index) => {
    const y = 250 + index * 74;
    return `
      <g>
        <rect x="96" y="${y - 42}" width="1008" height="58" rx="14" fill="${index === 0 ? "#221a1d" : "#121923"}" stroke="${index === 0 ? "#e94b4b" : "#263244"}"/>
        <text x="124" y="${y}" fill="#f4f7fb" font-size="28" font-weight="900">${escapeXml(String(index + 1).padStart(2, "0"))}</text>
        <text x="190" y="${y}" fill="#f4f7fb" font-size="28" font-weight="900">${escapeXml(row.name)}</text>
        <text x="870" y="${y}" fill="#8f9bae" font-size="24" font-weight="800">${escapeXml(row.country)}</text>
        <text x="1038" y="${y}" fill="#38d98a" font-size="24" font-weight="900" text-anchor="end">${escapeXml(row.score)}</text>
      </g>
    `;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)} leaderboard card">
  <rect width="${width}" height="${height}" fill="#090b10"/>
  <rect x="38" y="38" width="1124" height="599" rx="34" fill="#111722" stroke="#283244" stroke-width="2"/>
  <circle cx="1060" cy="126" r="84" fill="#e94b4b" opacity="0.18"/>
  <circle cx="974" cy="110" r="46" fill="#38d98a" opacity="0.14"/>
  <text x="96" y="112" fill="#e94b4b" font-size="24" font-weight="900" letter-spacing="6">THECARD.BET</text>
  <text x="96" y="172" fill="#f4f7fb" font-size="58" font-weight="1000">${escapeXml(title)}</text>
  <text x="98" y="216" fill="#8f9bae" font-size="26" font-weight="700">${escapeXml(subtitle)}</text>
  ${rowMarkup}
  <rect x="96" y="575" width="1008" height="42" rx="21" fill="#e94b4b"/>
  <text x="600" y="604" fill="#ffffff" font-size="22" font-weight="1000" text-anchor="middle">${escapeXml(cta)}</text>
</svg>`;
}

export function buildGeneratedAssetRecord({ template, filePath, language = "en", type = "leaderboard" }) {
  return {
    id: `generated-${Date.now()}`,
    companyId: template.companyId,
    brandId: template.brandId,
    campaignId: template.campaignId,
    platform: template.platform || "x",
    language,
    type,
    filePath,
    altText: "World Cup league leaderboard card for thecard.bet.",
    safeZone: template.safeZone,
    notes: `Generated from template ${template.id}.`,
    doNotUse: false,
    generatedFromTemplateId: template.id,
    createdAt: new Date().toISOString(),
  };
}

function normalizeRows(rows) {
  const fallback = [
    { name: "A. Rivera", country: "USA", score: "+$420" },
    { name: "M. Santos", country: "BRA", score: "+$315" },
    { name: "J. Keller", country: "GER", score: "+$240" },
    { name: "L. Moreno", country: "MEX", score: "+$190" },
  ];
  return (Array.isArray(rows) && rows.length ? rows : fallback).slice(0, 4).map((row) => ({
    name: String(row.name || "Player"),
    country: String(row.country || "World"),
    score: String(row.score || "+$0"),
  }));
}

function escapeXml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

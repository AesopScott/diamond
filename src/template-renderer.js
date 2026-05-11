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

export function renderWorldCupPrizeSvg(input = {}) {
  const title = input.title || "$1,000 World Cup Payouts";
  const subtitle = input.subtitle || "Free league. Real prizes. Country pride on the board.";
  const cta = input.cta || "Join at thecard.bet";
  const prizes = input.prizes || [
    ["Winner", "$500"],
    ["Runner-up", "$250"],
    ["Third place", "$100"],
    ["Fourth-sixth", "$50 each"],
  ];
  const prizeMarkup = prizes.map(([label, amount], index) => {
    const x = index % 2 === 0 ? 96 : 620;
    const y = index < 2 ? 260 : 410;
    return `
      <g>
        <rect x="${x}" y="${y}" width="484" height="112" rx="20" fill="#121923" stroke="${index === 0 ? "#e94b4b" : "#283244"}" stroke-width="2"/>
        <text x="${x + 30}" y="${y + 44}" fill="#8f9bae" font-size="23" font-weight="900">${escapeXml(label)}</text>
        <text x="${x + 30}" y="${y + 88}" fill="${index === 0 ? "#e94b4b" : "#f4f7fb"}" font-size="42" font-weight="1000">${escapeXml(amount)}</text>
      </g>
    `;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="${escapeXml(title)} prize card">
  <rect width="1200" height="675" fill="#090b10"/>
  <rect x="38" y="38" width="1124" height="599" rx="34" fill="#111722" stroke="#283244" stroke-width="2"/>
  <circle cx="1042" cy="132" r="92" fill="#e94b4b" opacity="0.2"/>
  <text x="96" y="112" fill="#e94b4b" font-size="24" font-weight="900" letter-spacing="6">WORLD CUP 2026</text>
  <text x="96" y="174" fill="#f4f7fb" font-size="58" font-weight="1000">${escapeXml(title)}</text>
  <text x="98" y="218" fill="#8f9bae" font-size="26" font-weight="700">${escapeXml(subtitle)}</text>
  ${prizeMarkup}
  <rect x="96" y="575" width="1008" height="42" rx="21" fill="#e94b4b"/>
  <text x="600" y="604" fill="#ffffff" font-size="22" font-weight="1000" text-anchor="middle">${escapeXml(cta)}</text>
</svg>`;
}

export function renderWorldCupCountrySvg(input = {}) {
  const country = input.country || "Your Country";
  const title = input.title || `${country} needs you on the board`;
  const subtitle = input.subtitle || "Make your picks and climb the free World Cup league.";
  const cta = input.cta || "Join at thecard.bet";
  const flag = input.flag || "★";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="${escapeXml(country)} World Cup campaign card">
  <rect width="1200" height="675" fill="#090b10"/>
  <rect x="38" y="38" width="1124" height="599" rx="34" fill="#111722" stroke="#283244" stroke-width="2"/>
  <rect x="92" y="94" width="382" height="382" rx="36" fill="#121923" stroke="#e94b4b" stroke-width="3"/>
  <text x="283" y="318" fill="#f4f7fb" font-size="156" font-weight="1000" text-anchor="middle">${escapeXml(flag)}</text>
  <text x="530" y="132" fill="#e94b4b" font-size="24" font-weight="900" letter-spacing="6">COUNTRY BOARD</text>
  <text x="530" y="210" fill="#f4f7fb" font-size="60" font-weight="1000">${escapeXml(title)}</text>
  <text x="532" y="268" fill="#8f9bae" font-size="28" font-weight="800">${escapeXml(subtitle)}</text>
  <rect x="530" y="330" width="574" height="76" rx="18" fill="#121923" stroke="#283244"/>
  <text x="562" y="378" fill="#38d98a" font-size="30" font-weight="1000">Free league leaderboard</text>
  <rect x="530" y="430" width="574" height="76" rx="18" fill="#121923" stroke="#283244"/>
  <text x="562" y="478" fill="#f4f7fb" font-size="30" font-weight="1000">Every pick can move the table</text>
  <rect x="96" y="575" width="1008" height="42" rx="21" fill="#e94b4b"/>
  <text x="600" y="604" fill="#ffffff" font-size="22" font-weight="1000" text-anchor="middle">${escapeXml(cta)}</text>
</svg>`;
}

export function renderWorldCupAssetSvg(type, input = {}) {
  if (type === "prize") return renderWorldCupPrizeSvg(input);
  if (type === "country") return renderWorldCupCountrySvg(input);
  return renderWorldCupLeaderboardSvg(input);
}

export function buildGeneratedAssetRecord({ template, filePath, language = "en", type = "leaderboard" }) {
  const labels = {
    leaderboard: "World Cup league leaderboard card for thecard.bet.",
    prize: "World Cup prize payout card for thecard.bet.",
    country: "World Cup country leaderboard campaign card for thecard.bet.",
  };
  return {
    id: `generated-${Date.now()}`,
    companyId: template.companyId,
    brandId: template.brandId,
    campaignId: template.campaignId,
    platform: template.platform || "x",
    language,
    type,
    filePath,
    altText: labels[type] || "World Cup campaign card for thecard.bet.",
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

export function createPostMetrics(input = {}) {
  const impressions = toCount(input.impressions);
  const clicks = toCount(input.clicks);
  const signups = toCount(input.signups);
  const leagueJoins = toCount(input.leagueJoins);
  return {
    impressions,
    clicks,
    signups,
    leagueJoins,
    leagueId: clean(input.leagueId),
    leagueName: clean(input.leagueName),
    notes: clean(input.notes),
    capturedAt: input.capturedAt || new Date().toISOString(),
    ctr: rate(clicks, impressions),
    signupRate: rate(signups, clicks || impressions),
    leagueJoinRate: rate(leagueJoins, signups || clicks || impressions),
  };
}

export function summarizePostMetrics(metrics = {}) {
  const parts = [
    `${toCount(metrics.impressions)} impressions`,
    `${toCount(metrics.clicks)} clicks`,
    `${toCount(metrics.signups)} signups`,
    `${toCount(metrics.leagueJoins)} league joins`,
  ];
  if (metrics.ctr !== null && metrics.ctr !== undefined) parts.push(`CTR ${formatPercent(metrics.ctr)}`);
  if (metrics.signupRate !== null && metrics.signupRate !== undefined) parts.push(`Signup rate ${formatPercent(metrics.signupRate)}`);
  if (metrics.leagueName || metrics.leagueId) parts.push(`League ${metrics.leagueName || metrics.leagueId}`);
  return parts.join(" / ");
}

function toCount(value) {
  const number = Number.parseInt(String(value ?? "0").replace(/,/g, ""), 10);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function rate(numerator, denominator) {
  if (!denominator) return null;
  return Number((numerator / denominator).toFixed(4));
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function clean(value) {
  return String(value || "").trim();
}

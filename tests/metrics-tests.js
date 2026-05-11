import assert from "node:assert/strict";
import {
  createPostMetrics,
  summarizePostMetrics,
} from "../src/index.js";

const metrics = createPostMetrics({
  impressions: "1,000",
  clicks: 125,
  signups: 25,
  leagueJoins: 10,
  leagueId: "wc-free-2026",
  leagueName: "World Cup Free League",
  notes: "Country posts outperformed generic posts.",
  capturedAt: "2026-05-11T12:00:00.000Z",
});

assert.equal(metrics.impressions, 1000);
assert.equal(metrics.clicks, 125);
assert.equal(metrics.signups, 25);
assert.equal(metrics.leagueJoins, 10);
assert.equal(metrics.ctr, 0.125);
assert.equal(metrics.signupRate, 0.2);
assert.equal(metrics.leagueJoinRate, 0.4);
assert.equal(metrics.leagueId, "wc-free-2026");
assert.equal(metrics.capturedAt, "2026-05-11T12:00:00.000Z");

const summary = summarizePostMetrics(metrics);
assert.match(summary, /1,?000|1000/);
assert.match(summary, /125 clicks/);
assert.match(summary, /25 signups/);
assert.match(summary, /10 league joins/);
assert.match(summary, /CTR 12.5%/);
assert.match(summary, /Signup rate 20.0%/);
assert.match(summary, /World Cup Free League/);

const empty = createPostMetrics();
assert.equal(empty.ctr, null);
assert.equal(empty.signupRate, null);
assert.equal(empty.leagueJoinRate, null);

console.log("All Diamond metrics tests passed.");

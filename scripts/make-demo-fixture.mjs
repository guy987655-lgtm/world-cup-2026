// Builds public/demo/fixture.json — the frozen mid-tournament snapshot shown at /?demo=1.
// Pulls the same public ESPN scoreboard the site uses, keeps only the fields loadScores() reads,
// and rewinds everything after DEMO_NOW: later matches become "pre" (no score, no goals), and
// knockout pairings that weren't decided yet go back to TBD. No user data is involved.
//   node scripts/make-demo-fixture.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const DEMO_NOW = "2026-06-27T10:00:00+03:00"; // last group-stage day, before any kickoff
const URL_ = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=250";

const res = await fetch(URL_);
if (!res.ok) throw new Error(`ESPN ${res.status}`);
const { events = [] } = await res.json();
const cutoff = Date.parse(DEMO_NOW);

const pickStats = (stats = []) => stats.filter((s) => s.name === "possessionPct").map(({ name, displayValue }) => ({ name, displayValue }));
const pickOdds = (odds) =>
  (odds || []).filter(Boolean).slice(0, 1).map((o) => ({
    moneyline: o.moneyline && {
      home: { close: o.moneyline.home?.close && { odds: o.moneyline.home.close.odds } },
      draw: { close: o.moneyline.draw?.close && { odds: o.moneyline.draw.close.odds } },
      away: { close: o.moneyline.away?.close && { odds: o.moneyline.away.close.odds } },
    },
  }));

const out = events.map((e) => {
  const comp = e.competitions[0];
  const played = Date.parse(e.date) < cutoff;
  // Knockout pairings weren't known yet at DEMO_NOW — put the placeholders back.
  const tbd = !played && e.season?.slug !== "group-stage";
  return {
    date: e.date,
    status: { type: { state: played ? "post" : "pre" }, displayClock: "" },
    competitions: [
      {
        competitors: comp.competitors.map((c) => ({
          homeAway: c.homeAway,
          team: tbd ? { displayName: "TBD", id: "0" } : { displayName: c.team.displayName, id: c.team.id },
          ...(played
            ? { score: c.score, winner: c.winner, shootoutScore: c.shootoutScore, statistics: pickStats(c.statistics), form: c.form }
            : { score: "0" }),
        })),
        details: played
          ? (comp.details || [])
              .filter((d) => d.scoringPlay || d.redCard)
              .map((d) => ({
                scoringPlay: d.scoringPlay,
                shootout: d.shootout,
                redCard: d.redCard,
                ownGoal: d.ownGoal,
                penaltyKick: d.penaltyKick,
                clock: { displayValue: d.clock?.displayValue },
                team: { id: d.team?.id },
                athletesInvolved: (d.athletesInvolved || []).slice(0, 1).map((a) => ({ id: a.id, displayName: a.displayName })),
              }))
          : [],
        odds: tbd ? [] : pickOdds(comp.odds),
      },
    ],
  };
});

mkdirSync(new URL("../public/demo/", import.meta.url), { recursive: true });
writeFileSync(
  new URL("../public/demo/fixture.json", import.meta.url),
  JSON.stringify({ _comment: "Demo snapshot for ?demo=1 — regenerate with node scripts/make-demo-fixture.mjs", demoNow: DEMO_NOW, events: out }) + "\n",
);
console.log(`wrote ${out.length} events (${out.filter((e) => e.status.type.state === "post").length} played before ${DEMO_NOW})`);

#!/usr/bin/env node
// Decision-support insights generator (CI-only — never shipped to the browser).
//
// For each upcoming match in a lookahead window it asks Claude (with web search)
// for three human signals — news/lineups, what's-at-stake motivation, form/goal
// trend — plus a *small* multiplicative λ-nudge, and writes them to
// public/data/insights.json keyed by "<date>@<match>" (the same key the front-end
// builds from m.date + '@' + m.match). Every claim must carry a source; with no
// evidence the signal is dropped and the nudge stays neutral (1.0). The nudge is
// clamped to [0.85, 1.15] here regardless of what the model returns.
//
// Usage:
//   ANTHROPIC_API_KEY=… node scripts/gen-insights.mjs            # window run (CI)
//   node scripts/gen-insights.mjs --match "מקסיקו" --limit 1     # target a match
//   node scripts/gen-insights.mjs --window-hours 72              # widen the window
//   node scripts/gen-insights.mjs --dry                          # no API, neutral stub
//
// Env: ANTHROPIC_API_KEY (required unless --dry).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MATCHES_PATH = path.join(ROOT, 'public', 'data', 'matches.json');
const INSIGHTS_PATH = path.join(ROOT, 'public', 'data', 'insights.json');

const MODEL = 'claude-sonnet-4-6'; // explicit cheap+capable choice (supports web_search_20260209)
const NUDGE_MIN = 0.85, NUDGE_MAX = 1.15;
const YEAR = 2026;
const IL_OFFSET_H = 3; // Israel is UTC+3 throughout the tournament (June–July)

// Hebrew month → number. Keep in sync with MONTH_NUM in src/main.js.
const MONTH_NUM = { 'ביוני': 6, 'ביולי': 7 };
// Hebrew → English team names. Keep in sync with TEAM_EN in src/main.js — used
// for higher-quality web-search queries (English finds more sources).
const TEAM_EN = {
  'ספרד': 'Spain', 'צרפת': 'France', 'אנגליה': 'England', 'ארגנטינה': 'Argentina',
  'ברזיל': 'Brazil', 'פורטוגל': 'Portugal', 'גרמניה': 'Germany', 'הולנד': 'Netherlands',
  'בלגיה': 'Belgium', 'נורווגיה': 'Norway', 'אורוגוואי': 'Uruguay', 'אורוגואי': 'Uruguay',
  'מקסיקו': 'Mexico', 'ארה"ב': 'USA', 'קנדה': 'Canada', 'מרוקו': 'Morocco', 'קרואטיה': 'Croatia',
  'קולומביה': 'Colombia', 'יפן': 'Japan', 'שווייץ': 'Switzerland', 'איראן': 'Iran',
  'סנגל': 'Senegal', 'אוסטרליה': 'Australia', 'דרום קוריאה': 'South Korea',
  'אוסטריה': 'Austria', 'טורקיה': 'Turkey', 'פרגוואי': 'Paraguay', 'תוניסיה': 'Tunisia',
  'ערב הסעודית': 'Saudi Arabia', 'מצרים': 'Egypt', "צ'כיה": 'Czech Republic',
  'שבדיה': 'Sweden', 'סקוטלנד': 'Scotland', 'גאנה': 'Ghana', 'עיראק': 'Iraq',
  'פנמה': 'Panama', 'אקוודור': 'Ecuador', 'חוף השנהב': "Côte d'Ivoire",
  "אלג'יריה": 'Algeria', 'קטאר': 'Qatar', 'אוזבקיסטן': 'Uzbekistan', 'ירדן': 'Jordan',
  'קונגו': 'DR Congo', 'האיטי': 'Haiti', 'בוסניה והרצגובינה': 'Bosnia & Herzegovina',
  'כף ורדה': 'Cape Verde', 'ניו זילנד': 'New Zealand', 'דרום אפריקה': 'South Africa',
  'קוראסאו': 'Curaçao'
};

// ── args ────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { windowHours: 72, limit: Infinity, match: null, dry: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--dry') a.dry = true;
    else if (t === '--window-hours') a.windowHours = Number(argv[++i]);
    else if (t === '--limit') a.limit = Number(argv[++i]);
    else if (t === '--match') a.match = argv[++i];
  }
  return a;
}

const matchKey = m => `${m.date}@${m.match}`;
const teams = m => m.match.split(' - ').map(s => s.trim());
const isReal = name => TEAM_EN[name] != null;

// Hebrew "11 ביוני" + "22:00" (Israel time) → epoch ms. null if unparseable.
function kickoffMs(m) {
  const [dayStr, monthHe] = (m.date || '').split(' ');
  const month = MONTH_NUM[monthHe], day = parseInt(dayStr, 10);
  if (!month || !day) return null;
  const [h, min] = (m.time || '00:00').split(':').map(n => parseInt(n, 10));
  return Date.UTC(YEAR, month - 1, day, (h || 0) - IL_OFFSET_H, min || 0);
}

function clampNudge(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 1;
  return Math.max(NUDGE_MIN, Math.min(NUDGE_MAX, n));
}

// ── prompt ──────────────────────────────────────────────────────────────────
const SYSTEM = `You are a football analyst feeding a kids-friendly World Cup 2026 prediction site.
For one upcoming match, use web search to find decision-relevant context across three signals:
1) news — confirmed injuries, suspensions, expected lineup rotation, key players in/out.
2) stakes — what each side needs (qualification math, "must win" vs "nothing to play for", rest-and-rotate).
3) form — recent results and goal trend (scoring/conceding) coming into the match.

Hard rules:
- NEVER invent lineups, injuries, or facts. Every signal you report MUST be backed by at least one real source URL you actually found via search. If you cannot find evidence for a signal, omit it.
- Keep each signal to one short, concrete sentence, in BOTH Hebrew and English (no mixing within a sentence).
- Propose a SMALL multiplicative goal-expectation nudge per team in [0.85, 1.15] (1.0 = no change). Only move it meaningfully when the evidence is strong (e.g. a key striker ruled out → lower that team's nudge). Default to 1.0.
- confidence in [0,1] reflects how much real evidence you found.

Respond with ONLY a single JSON object (no prose, no code fences) of this exact shape:
{"confidence":0.0,"nudge":{"t1":1.0,"t2":1.0},"signals":[{"id":"news|stakes|form","weight":"med|low","text":{"he":"…","en":"…"},"sources":[{"title":"…","url":"https://…"}]}]}
"t1" is the first team listed, "t2" the second.`;

function buildPrompt(m) {
  const [t1, t2] = teams(m);
  return `Match: ${TEAM_EN[t1]} (${t1}) vs ${TEAM_EN[t2]} (${t2})
Group ${m.group}. Kickoff: ${m.date} ${m.time} (Israel time), World Cup 2026.
t1 = ${TEAM_EN[t1]}, t2 = ${TEAM_EN[t2]}.
Search the web for the latest news and return the JSON described in the system prompt.`;
}

// Pull the first balanced top-level JSON object out of the model's text.
function extractJson(text) {
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; }
    else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { if (--depth === 0) { try { return JSON.parse(text.slice(start, i + 1)); } catch { return null; } } }
  }
  return null;
}

function normalizeInsight(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const signals = Array.isArray(raw.signals) ? raw.signals : [];
  const clean = signals
    .map(s => ({
      id: ['news', 'stakes', 'form'].includes(s?.id) ? s.id : 'news',
      weight: s?.weight === 'low' ? 'low' : 'med',
      text: { he: String(s?.text?.he || '').trim(), en: String(s?.text?.en || '').trim() },
      sources: (Array.isArray(s?.sources) ? s.sources : [])
        .filter(x => x && /^https?:\/\//.test(x.url || ''))
        .map(x => ({ title: String(x.title || x.url).slice(0, 120), url: x.url })),
    }))
    // sources-or-silence: drop any signal with no real source or no text
    .filter(s => s.sources.length && (s.text.he || s.text.en));
  return {
    generatedAt: new Date().toISOString(),
    confidence: Math.max(0, Math.min(1, Number(raw.confidence) || 0)),
    nudge: { t1: clampNudge(raw?.nudge?.t1), t2: clampNudge(raw?.nudge?.t2) },
    signals: clean,
  };
}

// ── Claude call (web search; handles the server-side pause_turn loop) ─────────
async function fetchInsight(client, m) {
  const messages = [{ role: 'user', content: buildPrompt(m) }];
  let resp;
  for (let i = 0; i < 6; i++) {
    resp = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: SYSTEM,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }],
      messages,
    });
    if (resp.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: resp.content }); continue; }
    break;
  }
  const text = (resp?.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  return normalizeInsight(extractJson(text));
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const matches = JSON.parse(fs.readFileSync(MATCHES_PATH, 'utf8'));
  let insights = {};
  try { insights = JSON.parse(fs.readFileSync(INSIGHTS_PATH, 'utf8')); } catch { /* first run */ }

  const now = Date.now();
  // Prune entries for matches that have already kicked off (>6h ago = finished).
  for (const m of matches) {
    const k = matchKey(m), ms = kickoffMs(m);
    if (insights[k] && ms != null && ms < now - 6 * 3600e3) delete insights[k];
  }

  // Select: real-team matches either matching --match, or kicking off in-window.
  const winMin = now, winMax = now + args.windowHours * 3600e3;
  let selected = matches.filter(m => {
    const [t1, t2] = teams(m);
    if (!isReal(t1) || !isReal(t2)) return false; // skips knockout placeholders
    if (args.match) return matchKey(m).includes(args.match);
    const ms = kickoffMs(m);
    return ms != null && ms >= winMin && ms <= winMax;
  });
  if (Number.isFinite(args.limit)) selected = selected.slice(0, args.limit);

  console.log(`Matches: ${matches.length} · selected: ${selected.length} · dry: ${args.dry}`);
  if (!selected.length) { console.log('Nothing to do.'); return; }

  let client = null;
  if (!args.dry) {
    if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY is required (or pass --dry).'); process.exit(1); }
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    client = new Anthropic();
  }

  let written = 0;
  for (const m of selected) {
    const k = matchKey(m);
    try {
      const insight = args.dry
        ? { generatedAt: new Date().toISOString(), confidence: 0, nudge: { t1: 1, t2: 1 }, signals: [] }
        : await fetchInsight(client, m);
      if (insight) { insights[k] = insight; written++; console.log(`✓ ${k} — ${insight.signals.length} signal(s), conf ${insight.confidence}`); }
      else console.warn(`· ${k} — no usable insight, leaving as-is`);
    } catch (e) {
      console.warn(`! ${k} — ${e?.message || e}`);
    }
  }

  fs.mkdirSync(path.dirname(INSIGHTS_PATH), { recursive: true });
  fs.writeFileSync(INSIGHTS_PATH, JSON.stringify(insights, null, 2) + '\n');
  console.log(`Wrote ${written} insight(s) → ${path.relative(ROOT, INSIGHTS_PATH)} (${Object.keys(insights).length} total)`);
}

main().catch(e => { console.error(e); process.exit(1); });

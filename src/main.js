import { inject } from '@vercel/analytics';
inject();

const TOP = [
  "ספרד","צרפת","אנגליה","ארגנטינה","ברזיל","פורטוגל",
  "גרמניה","הולנד","בלגיה","נורווגיה","אורוגוואי","אורוגואי"
];

// ─── i18n ───────────────────────────────────────────────────────────────
let lang = localStorage.getItem('lang') || 'he';
let currentTz = localStorage.getItem('tz') || 'il';

const TIMEZONES = [
  { id: 'il', tz: 'Asia/Jerusalem',   he: 'שעון ישראל',    en: 'IL Timezone' },
  { id: 'uk', tz: 'Europe/London',    he: 'שעון אנגליה',   en: 'UK Timezone' },
  { id: 'ny', tz: 'America/New_York', he: 'שעון ניו יורק', en: 'NY Timezone' },
];
const MONTH_NUM = { 'ביוני': 6, 'ביולי': 7 };
const NUM_TO_MONTH_HE = { 6: 'ביוני', 7: 'ביולי' };

function tzLabel(id) {
  const t = TIMEZONES.find(t => t.id === id) || TIMEZONES[0];
  return t[lang] || t.he;
}

function matchInTz(m) {
  if (!m.time || currentTz === 'il') return { date: m.date, time: m.time };
  const tzObj = TIMEZONES.find(t => t.id === currentTz);
  if (!tzObj) return { date: m.date, time: m.time };
  const [dayStr, monthHe] = m.date.split(' ');
  const month = MONTH_NUM[monthHe];
  if (!month) return { date: m.date, time: m.time };
  // Build a Date at Israel local time (+03:00 in summer — tournament window is fully DST)
  const iso = `2026-${String(month).padStart(2,'0')}-${String(parseInt(dayStr,10)).padStart(2,'0')}T${m.time}:00+03:00`;
  const d = new Date(iso);
  if (isNaN(d)) return { date: m.date, time: m.time };
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tzObj.tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(d);
  const get = (t) => parts.find(p => p.type === t).value;
  const newMonth = parseInt(get('month'), 10);
  const newDay = parseInt(get('day'), 10);
  let newHour = get('hour');
  if (newHour === '24') newHour = '00';
  const newDateKey = `${String(newDay).padStart(2,'0')} ${NUM_TO_MONTH_HE[newMonth] || monthHe}`;
  return { date: newDateKey, time: `${newHour}:${get('minute')}` };
}

const STR = {
  he: {
    title: 'מונדיאל 2026',
    sub: 'לוח משחקים · שעון ישראל',
    subPrefix: 'לוח משחקים · ',
    tzModalTitle: 'בחר אזור זמן',
    onlyQualify: 'רק משחקים שעומדים בתנאים ⭐',
    qualifyHint: 'טופ נבחרות',
    windowLink: 'חלון שעות לילדים',
    allTeams: 'כל הנבחרות',
    allStages: 'כל הבתים',
    onlyTop: 'רק נבחרות טופ',
    today: 'היום ⤴',
    clear: 'נקה',
    played: 'שוחקו', notPlayed: 'טרם שוחקו',
    refresh: 'רענן תוצאות', refreshing: 'מעדכן...', refreshed: 'עודכן', refreshErr: 'שגיאה',
    timeTBD: 'שעה טרם נקבעה',
    group: 'בית',
    meetsCriteria: 'עומד בתנאים', finished: 'סיום', live: 'LIVE',
    scorersTitle: 'כובשים', noGoals: 'ללא שערים', possession: 'אחזקת כדור',
    oddsTitle: 'יחס הימורים', draw: 'תיקו', formTitle: 'כושר אחרון',
    projLabel: 'מצב נוכחי:',
    oddsUpdated: s => `עודכן לפני ${s} שנ'`,
    pen: 'פנדל', ownGoal: 'שער עצמי',
    topModalTitle: 'נבחרות הטופ', scorerModalTitle: 'מלך השערים',
    collapseAll: 'סגור הכל',
    scrollTop: 'גלול למעלה',
    likelyScores: 'תוצאות סבירות',
    actualResult: 'בפועל',
    predAccTitle: 'דיוק התחזיות',
    predAccDesc: 'מתוך המשחקים שהסתיימו — כמה פעמים התוצאה בפועל תאמה לכל תחזית',
    predAccP1: 'תחזית 1 (הסבירה ביותר)', predAccP2: 'תחזית 2', predAccP3: 'תחזית 3', predAccOther: 'תוצאה אחרת',
    predAccTotal: n => `סה״כ משחקים שהסתיימו: ${n}`,
    predAccNone: 'עדיין אין משחקים שהסתיימו עם נבחרות ידועות',
    commonResTitle: 'התוצאות הנפוצות', commonResDesc: 'פילוח לפי תוצאה (ללא תלות בנבחרת)',
    restRow: 'כל השאר', swipeHint: 'החליקו שמאלה לפילוח התוצאות →',
    playChance: 'הסיכוי שהמשחק הזה ישוחק', matchupSet: 'המשחק נקבע',
    playoffBtn: 'אזור הפלייאוף', playoffTitle: 'אזור הפלייאוף',
    backToSchedule: 'חזרה לשלב הבתים',
    playoffHint: 'לחצו על משחק עתידי כדי לראות הסתברויות יריבות',
    playoffFilter: 'סינון לפי נבחרת',
    scenCount: n => `מספר התרחישים: ${n}`,
    pairFilter: 'מפגש בין', choose: 'בחר נבחרת', vsWord: 'מול',
    meetChance: s => `סיכוי מפגש: ${s}%`,
    likelyMode: 'תרחיש סביר ביותר',
    probScenarios: 'תרחישי יריבות אפשריים',
    probCurrent: 'מצב נוכחי', probCurrentHint: 'היריבות אם שלב הבתים יסתיים כעת',
    probCalc: 'מחשב הסתברויות…', probDecided: 'המפגש כבר נקבע',
    probVs: ' מול ', thirdPlaceTitle: 'מקום 3',
    phWinnerGroup: g => `מנצחת ${g}`, phRunnerGroup: g => `סגנית ${g}`,
    phThird: 'מקום 3', phWinnerMatch: n => `מנצחת מ׳ ${n}`, phLoserMatch: n => `מפסידה מ׳ ${n}`,
    noMatches: 'אין משחקים שעונים על הסינון 🤷',
    note: '🔒 שמות הנבחרות במשחקי הנוקאאוט (מ-28 ביוני) יתעדכנו לאחר סיום שלב הבתים. השעות כבר סופיות.',
    legend: '⭐ = נבחרת טופ שעומדת בחלון השעות · פס צהוב = משתתפת נבחרת טופ<br>מסגרת ירוקה = עומד בכל התנאים<br><b>חלון השעות:</b> א\'–ה\' 14:00–21:00 · שישי 12:00–23:00 · שבת 07:00–21:00',
    modalTitle: 'חלון השעות שהוגדר',
    winSunThu: 'ראשון–חמישי', winFri: 'שישי', winSat: 'שבת',
    standingsTitle: g => `טבלת בית ${g}`,
    sTeam: 'נבחרת', sW: 'נ', sD: 'ת', sL: 'ה', sGF: 'ש״ז', sGD: 'הפ', sPts: 'נק',
    sWTitle: 'ניצחונות', sDTitle: 'תיקו', sLTitle: 'הפסדים',
    sGFTitle: 'שערי זכות', sGDTitle: 'הפרש שערים', sPtsTitle: 'נקודות',
    topGroup: '⭐ נבחרות טופ', restGroup: 'שאר הנבחרות',
    dayLabel: d => `יום ${d}`,
    groupLabel: g => `בית ${g}`,
  },
  en: {
    title: 'World Cup 2026',
    sub: 'Match schedule · Israel time',
    subPrefix: 'Match schedule · ',
    tzModalTitle: 'Choose time zone',
    onlyQualify: 'Only matches meeting criteria ⭐',
    qualifyHint: 'Top teams',
    windowLink: 'kid-friendly hours',
    allTeams: 'All teams',
    allStages: 'All groups',
    onlyTop: 'Top teams only',
    today: 'Today ⤴',
    clear: 'Clear',
    played: 'Played', notPlayed: 'Upcoming',
    refresh: 'Refresh', refreshing: 'Updating...', refreshed: 'Updated', refreshErr: 'Error',
    timeTBD: 'Time TBD',
    group: 'Group',
    meetsCriteria: 'Meets criteria', finished: 'Final', live: 'LIVE',
    scorersTitle: 'Scorers', noGoals: 'No goals', possession: 'Possession',
    oddsTitle: 'Odds', draw: 'Draw', formTitle: 'Recent form',
    projLabel: 'Currently:',
    oddsUpdated: s => `updated ${s}s ago`,
    pen: 'pen.', ownGoal: 'own goal',
    topModalTitle: 'Top teams', scorerModalTitle: 'Top scorers',
    collapseAll: 'Collapse all',
    scrollTop: 'Scroll to top',
    likelyScores: 'Likely scorelines',
    actualResult: 'Actual',
    predAccTitle: 'Prediction accuracy',
    predAccDesc: 'Across finished matches — how often the actual result matched each prediction',
    predAccP1: 'Prediction 1 (most likely)', predAccP2: 'Prediction 2', predAccP3: 'Prediction 3', predAccOther: 'Other result',
    predAccTotal: n => `Finished matches: ${n}`,
    predAccNone: 'No finished matches with known teams yet',
    commonResTitle: 'Most common results', commonResDesc: 'Breakdown by scoreline (regardless of team)',
    restRow: 'All the rest', swipeHint: '← Swipe for the result breakdown',
    playChance: 'Chance this matchup is played', matchupSet: 'Matchup set',
    playoffBtn: 'Playoff Zone', playoffTitle: 'Playoff Zone',
    backToSchedule: 'Back to group stage',
    playoffHint: 'Tap a future match to see matchup probabilities',
    playoffFilter: 'Filter by team',
    scenCount: n => `Scenarios: ${n}`,
    pairFilter: 'Matchup between', choose: 'Choose team', vsWord: 'vs',
    meetChance: s => `Meeting chance: ${s}%`,
    likelyMode: 'Most likely bracket',
    probScenarios: 'Possible matchup scenarios',
    probCurrent: 'Current status', probCurrentHint: 'The matchup if the group stage ended now',
    probCalc: 'Calculating…', probDecided: 'Matchup already decided',
    probVs: ' vs ', thirdPlaceTitle: '3rd place',
    phWinnerGroup: g => `Winner ${g}`, phRunnerGroup: g => `Runner-up ${g}`,
    phThird: '3rd', phWinnerMatch: n => `Winner M${n}`, phLoserMatch: n => `Loser M${n}`,
    noMatches: 'No matches match the filter 🤷',
    note: '🔒 Knockout team names (from June 28) will be set after the group stage. Times are final.',
    legend: '⭐ = Top team in the time window · Yellow bar = top team playing<br>Green border = meets all criteria<br><b>Time window:</b> Sun–Thu 14:00–21:00 · Fri 12:00–23:00 · Sat 07:00–21:00',
    modalTitle: 'Kid-friendly time window',
    winSunThu: 'Sun–Thu', winFri: 'Friday', winSat: 'Saturday',
    standingsTitle: g => `Group ${g} standings`,
    sTeam: 'Team', sW: 'W', sD: 'D', sL: 'L', sGF: 'GF', sGD: 'GD', sPts: 'Pts',
    sWTitle: 'Wins', sDTitle: 'Draws', sLTitle: 'Losses',
    sGFTitle: 'Goals for', sGDTitle: 'Goal difference', sPtsTitle: 'Points',
    topGroup: '⭐ Top teams', restGroup: 'Other teams',
    dayLabel: d => d,
    groupLabel: g => `Group ${g}`,
  }
};
function T(k, ...args) {
  const v = STR[lang][k];
  return typeof v === 'function' ? v(...args) : (v ?? k);
}

const TEAM_EN = {
  "ספרד":"Spain","צרפת":"France","אנגליה":"England","ארגנטינה":"Argentina",
  "ברזיל":"Brazil","פורטוגל":"Portugal","גרמניה":"Germany","הולנד":"Netherlands",
  "בלגיה":"Belgium","נורווגיה":"Norway","אורוגוואי":"Uruguay","אורוגואי":"Uruguay",
  "מקסיקו":"Mexico","ארה\"ב":"USA","קנדה":"Canada","מרוקו":"Morocco","קרואטיה":"Croatia",
  "קולומביה":"Colombia","יפן":"Japan","שווייץ":"Switzerland","איראן":"Iran",
  "סנגל":"Senegal","אוסטרליה":"Australia","דרום קוריאה":"South Korea",
  "אוסטריה":"Austria","טורקיה":"Turkey","פרגוואי":"Paraguay","תוניסיה":"Tunisia",
  "ערב הסעודית":"Saudi Arabia","מצרים":"Egypt","צ'כיה":"Czech Republic",
  "שבדיה":"Sweden","סקוטלנד":"Scotland","גאנה":"Ghana","עיראק":"Iraq",
  "פנמה":"Panama","אקוודור":"Ecuador","חוף השנהב":"Côte d'Ivoire",
  "אלג'יריה":"Algeria","קטאר":"Qatar","אוזבקיסטן":"Uzbekistan","ירדן":"Jordan",
  "קונגו":"DR Congo","האיטי":"Haiti","בוסניה והרצגובינה":"Bosnia & Herzegovina",
  "כף ורדה":"Cape Verde","ניו זילנד":"New Zealand","דרום אפריקה":"South Africa",
  "קוראסאו":"Curaçao"
};
const MONTH_EN = { "ביוני":"June", "ביולי":"July" };
const DOW_EN = {
  "ראשון":"Sunday","שני":"Monday","שלישי":"Tuesday","רביעי":"Wednesday",
  "חמישי":"Thursday","שישי":"Friday","שבת":"Saturday"
};
const KO_EN = {
  "32 הגדולות":"Round of 32","שמינית גמר":"Round of 16","רבע גמר":"Quarter-final",
  "חצי גמר":"Semi-final","מקום 3":"3rd Place","גמר":"Final"
};

function tTeam(name)  { return lang === 'he' ? name : (TEAM_EN[name] || name); }
function tDate(key)   {
  if (lang === 'he') return key;
  const [dayStr, monthHe] = key.split(' ');
  return `${MONTH_EN[monthHe] || monthHe} ${parseInt(dayStr,10)}`;
}
function tDow(dateKey) {
  const he = DOW[dateKey] || '';
  return lang === 'he' ? he : (DOW_EN[he] || he);
}
function tStage(g)    { return lang === 'he' ? g : (KO_EN[g] || g); }
function teamLabelText(v) {
  if (v === '__TOP__') return T('topGroup');
  return v ? tTeam(v) : T('allTeams');
}

function tMatchPart(s) {
  s = s.trim();
  if (lang === 'he') return s;
  let m;
  if (m = s.match(/^מנצחת משחק (\d+)$/)) return `Winner Match ${m[1]}`;
  if (m = s.match(/^מפסידה משחק (\d+)$/)) return `Loser Match ${m[1]}`;
  if (m = s.match(/^מנצחת בית ([A-L])$/)) return `Group ${m[1]} Winner`;
  if (m = s.match(/^סגנית בית ([A-L])$/)) return `Group ${m[1]} Runner-up`;
  if (m = s.match(/^מקום 3 מבתים (.+)$/)) return `3rd from Groups ${m[1]}`;
  return TEAM_EN[s] || s;
}
function tMatchString(s) {
  // The "משחק N:" prefix is data-only (used for bracket cross-references) —
  // never shown to the user
  s = s.replace(/^משחק \d+( \(הגמר!\))?: /, '');
  if (lang === 'he') return s;
  return s.split(' - ').map(tMatchPart).join(' - ');
}


const KNOCKOUT = new Set([
  "32 הגדולות","שמינית גמר","רבע גמר","חצי גמר","מקום 3","גמר"
]);

// Seeding rank (FIFA approximate) — used as tiebreaker before any games are played
const SEED = {
  "ספרד":1,"צרפת":2,"ארגנטינה":3,"אנגליה":4,"ברזיל":5,
  "פורטוגל":6,"גרמניה":7,"הולנד":8,"בלגיה":9,"נורווגיה":10,
  "אורוגוואי":11,"אורוגואי":11,"מקסיקו":12,"ארה\"ב":13,"מרוקו":14,
  "קרואטיה":15,"קולומביה":16,"יפן":17,"שווייץ":18,"איראן":19,
  "סנגל":20,"אוסטרליה":21,"דרום קוריאה":22,"אוסטריה":23,
  "טורקיה":24,"פרגוואי":25,"תוניסיה":26,"ערב הסעודית":27,
  "מצרים":28,"צ'כיה":29,"שבדיה":30,"סקוטלנד":31,"גאנה":32,
  "עיראק":33,"פנמה":34,"אקוודור":35,"חוף השנהב":36,
  "אלג'יריה":37,"קטאר":38,"אוזבקיסטן":39,"ירדן":40,
  "קונגו":41,"האיטי":42,"בוסניה והרצגובינה":43,"כף ורדה":44,
  "ניו זילנד":45,"דרום אפריקה":46,"קוראסאו":47
};

// Official-style ranking: points, then goal difference, then goals for, then seed
function standingsCmp(a, b) {
  return b.pts - a.pts || b.gd - a.gd || b.gf - a.gf ||
         (SEED[a.name] || 99) - (SEED[b.name] || 99);
}

function calcStandings(group, MATCHES) {
  const gms = MATCHES.filter(m => m.group === group);
  const teams = {};
  gms.forEach(m => {
    const [home, away] = m.match.split(' - ').map(s => s.trim());
    if (!teams[home]) teams[home] = { w:0, d:0, l:0, gf:0, ga:0, pts:0 };
    if (!teams[away]) teams[away] = { w:0, d:0, l:0, gf:0, ga:0, pts:0 };
    if (m.score) {
      const [hg, ag] = m.score.split('-').map(s => parseInt(s.trim(), 10));
      teams[home].gf += hg; teams[home].ga += ag;
      teams[away].gf += ag; teams[away].ga += hg;
      if      (hg > ag) { teams[home].w++; teams[home].pts += 3; teams[away].l++; }
      else if (hg < ag) { teams[away].w++; teams[away].pts += 3; teams[home].l++; }
      else              { teams[home].d++; teams[home].pts++;     teams[away].d++; teams[away].pts++; }
    }
  });
  return Object.entries(teams)
    .map(([name, s]) => ({ name, ...s, gd: s.gf - s.ga }))
    .sort(standingsCmp);
}

function buildStandingsTable(standings, group) {
  const wrap = document.createElement('div');
  wrap.className = 'standings-wrap';
  wrap.innerHTML = `
    <div class="standings-title">${T('standingsTitle', group)}</div>
    <table class="standings-table">
      <thead>
        <tr>
          <th>#</th>
          <th class="s-team">${T('sTeam')}</th>
          <th title="${T('sWTitle')}">${T('sW')}</th>
          <th title="${T('sDTitle')}">${T('sD')}</th>
          <th title="${T('sLTitle')}">${T('sL')}</th>
          <th title="${T('sGFTitle')}">${T('sGF')}</th>
          <th title="${T('sGDTitle')}">${T('sGD')}</th>
          <th title="${T('sPtsTitle')}">${T('sPts')}</th>
        </tr>
      </thead>
      <tbody>
        ${standings.map((t, i) => `
          <tr class="${TOP.includes(t.name) ? 's-top' : ''}">
            <td class="s-pos">${i + 1}</td>
            <td class="s-team">${tTeam(t.name)}</td>
            <td>${t.w}</td>
            <td>${t.d}</td>
            <td>${t.l}</td>
            <td>${t.gf}</td>
            <td class="s-gd ${t.gd > 0 ? 's-pos-gd' : t.gd < 0 ? 's-neg-gd' : ''}">${t.gd > 0 ? '+' : ''}${t.gd}</td>
            <td class="s-pts">${t.pts}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  return wrap;
}

// ── Round-of-32 snapshot projection ─────────────────────────────────────
// Who would fill each bracket placeholder if the group stage ended right now.
const GROUP_IDS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

function buildProjection(MATCHES) {
  const standings = {};
  GROUP_IDS.forEach(g => { standings[g] = calcStandings(g, MATCHES); });
  // Third-placed teams ranked by the official criteria (pts, gd, gf)
  const thirds = GROUP_IDS
    .map(g => standings[g][2] && { group: g, ...standings[g][2] })
    .filter(Boolean)
    .sort(standingsCmp);
  const slots = [];
  MATCHES.forEach(m => {
    if (m.group !== '32 הגדולות') return;
    m.match.replace(/^משחק \d+: /, '').split(' - ').forEach(part => {
      const mm = part.trim().match(/^מקום 3 מבתים (.+)$/);
      if (mm) slots.push({ key: part.trim(), groups: mm[1].split('/') });
    });
  });
  return { standings, thirdSlots: allocateThirds(slots, thirds) };
}

// Assign the best third-placed teams to the bracket slots that accept their
// group (bipartite matching; the pool grows past 8 only if the top 8 can't
// cover every slot)
function allocateThirds(slots, thirds) {
  for (let size = Math.min(slots.length, thirds.length); size <= thirds.length; size++) {
    const pool = thirds.slice(0, size);
    const slotByThird = new Array(pool.length).fill(-1);
    const thirdBySlot = new Array(slots.length).fill(-1);
    const augment = (si, seen) => {
      for (let ti = 0; ti < pool.length; ti++) {
        if (seen[ti] || !slots[si].groups.includes(pool[ti].group)) continue;
        seen[ti] = true;
        if (slotByThird[ti] === -1 || augment(slotByThird[ti], seen)) {
          slotByThird[ti] = si;
          thirdBySlot[si] = ti;
          return true;
        }
      }
      return false;
    };
    if (slots.every((_, si) => augment(si, new Array(pool.length).fill(false)))) {
      const map = {};
      slots.forEach((s, si) => { map[s.key] = pool[thirdBySlot[si]].name; });
      return map;
    }
  }
  return {};
}

function projectedTeam(part, proj) {
  part = part.trim();
  let m;
  if (m = part.match(/^מנצחת בית ([A-L])$/)) return proj.standings[m[1]]?.[0]?.name;
  if (m = part.match(/^סגנית בית ([A-L])$/)) return proj.standings[m[1]]?.[1]?.name;
  if (/^מקום 3 מבתים /.test(part)) return proj.thirdSlots[part];
  return null;
}

// ── Playoff probability engine ──────────────────────────────────────────
// A Monte-Carlo simulation of the whole knockout tree. Every remaining group
// match (and every knockout match) is replayed thousands of times from the
// current results, so each bracket slot gets a distribution over which teams
// might actually meet there. Re-run on every data refresh → live-responsive.
const SIM_N = 3000;          // simulations per run
const SIM_BASE = 1.32;       // baseline expected goals per side
const SIM_ALPHA = 3.5;       // how strongly the seed gap skews the scoreline (tuned to bookmaker lines)
const SIM_LMIN = 0.35, SIM_LMAX = 3.4; // keep extreme mismatches realistic
const LIVE_REMAIN = 0.4;     // fraction of scoring still to come in a live match
const SEP = '␟';        // internal key separator (won't appear in names)

function isRealTeam(s) { return SEED[s] != null || TEAM_EN[s] != null; }
function ratingFromSeed(name) { return (48 - (SEED[name] || 40)) / 47; }
function simLambdas(r1, r2) {
  const d = (r1 - r2) * SIM_ALPHA * 0.5;
  const cap = l => Math.max(SIM_LMIN, Math.min(SIM_LMAX, l));
  return [cap(SIM_BASE * Math.exp(d)), cap(SIM_BASE * Math.exp(-d))];
}
function simPoisson(l) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
// Exact-scoreline probabilities from the same Poisson model: P(g1,g2) =
// pmf(g1;λ1)·pmf(g2;λ2). Returns the n most likely {g1,g2,p}.
function poissonPmf(k, l) { let f = 1; for (let i = 2; i <= k; i++) f *= i; return Math.exp(-l) * Math.pow(l, k) / f; }
function topScorelines(t1, t2, n = 3) {
  const [l1, l2] = simLambdas(ratingFromSeed(t1), ratingFromSeed(t2));
  const out = [];
  for (let g1 = 0; g1 <= 6; g1++) for (let g2 = 0; g2 <= 6; g2++) out.push({ g1, g2, p: poissonPmf(g1, l1) * poissonPmf(g2, l2) });
  return out.sort((a, b) => b.p - a.p).slice(0, n);
}
function emptyRec() { return { w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }; }
function applyPair(h, a, hg, ag) {
  h.gf += hg; h.ga += ag; a.gf += ag; a.ga += hg;
  if (hg > ag) { h.w++; h.pts += 3; a.l++; }
  else if (hg < ag) { a.w++; a.pts += 3; h.l++; }
  else { h.d++; h.pts++; a.d++; a.pts++; }
}

// Split each group into a fixed base (decided matches) + a list of matches
// still to simulate (future = full sim, live = current score + reduced sim)
function prepareGroups(MATCHES) {
  const groups = {};
  GROUP_IDS.forEach(id => groups[id] = { teams: new Set(), base: {}, pending: [] });
  MATCHES.forEach(m => {
    if (isKnockoutRow(m) || !groups[m.group]) return;
    const G = groups[m.group];
    const [home, away] = m.match.split(' - ').map(s => s.trim());
    G.teams.add(home); G.teams.add(away);
    if (!G.base[home]) G.base[home] = emptyRec();
    if (!G.base[away]) G.base[away] = emptyRec();
    const goals = m.score ? m.score.split('-').map(n => parseInt(n.trim(), 10)) : null;
    if (m.score && !m.live) applyPair(G.base[home], G.base[away], goals[0], goals[1]);
    else if (m.live && goals) G.pending.push({ home, away, hg0: goals[0], ag0: goals[1], scale: LIVE_REMAIN });
    else G.pending.push({ home, away, hg0: 0, ag0: 0, scale: 1 });
  });
  Object.values(groups).forEach(G => { G.teams = [...G.teams]; });
  return groups;
}

function simGroup(G) {
  const stats = {};
  G.teams.forEach(t => { const b = G.base[t]; stats[t] = { name: t, w: b.w, d: b.d, l: b.l, gf: b.gf, ga: b.ga, pts: b.pts }; });
  G.pending.forEach(p => {
    const [lH, lA] = simLambdas(ratingFromSeed(p.home), ratingFromSeed(p.away));
    const hg = p.hg0 + simPoisson(lH * p.scale);
    const ag = p.ag0 + simPoisson(lA * p.scale);
    applyPair(stats[p.home], stats[p.away], hg, ag);
  });
  return Object.values(stats).map(s => { s.gd = s.gf - s.ga; return s; }).sort(standingsCmp);
}

// The eight R32 slots that take a third-placed team, with the groups each accepts
function thirdSlotDefs(MATCHES) {
  const slots = [];
  MATCHES.forEach(m => {
    if (m.group !== '32 הגדולות') return;
    m.match.replace(/^משחק \d+: /, '').split(' - ').forEach(part => {
      const mm = part.trim().match(/^מקום 3 מבתים (.+)$/);
      if (mm) slots.push({ key: part.trim(), groups: mm[1].split('/') });
    });
  });
  return slots;
}

// Every knockout match in bracket order, with whatever is already decided
function parseKO(MATCHES) {
  const list = [];
  MATCHES.forEach(m => {
    if (!isKnockoutRow(m)) return;
    const num = (m.match.match(/^משחק (\d+)/) || [])[1];
    const body = m.match.replace(/^משחק \d+( \(הגמר!\))?: /, '');
    const i = body.indexOf(' - ');
    const side1 = body.slice(0, i).trim(), side2 = body.slice(i + 3).trim();
    const finalized = isRealTeam(side1) && isRealTeam(side2);
    let fixedWinner = null, fixedLoser = null;
    if (finalized && m.score && !m.live) {
      const [g1, g2] = m.score.split('-').map(n => parseInt(n.trim(), 10));
      if (g1 > g2) { fixedWinner = side1; fixedLoser = side2; }
      else if (g2 > g1) { fixedWinner = side2; fixedLoser = side1; }
    }
    list.push({ num, side1, side2, group: m.group, finalized, m, fixedWinner, fixedLoser });
  });
  return list.sort((a, b) => (+a.num) - (+b.num));
}

function resolveSide(side, standings, thirdSlots, winner, loser) {
  if (isRealTeam(side)) return side;
  let mm;
  if (mm = side.match(/^מנצחת בית ([A-L])$/)) return standings[mm[1]]?.[0]?.name;
  if (mm = side.match(/^סגנית בית ([A-L])$/)) return standings[mm[1]]?.[1]?.name;
  if (/^מקום 3 מבתים /.test(side)) return thirdSlots[side];
  if (mm = side.match(/^מנצחת משחק (\d+)$/)) return winner[mm[1]];
  if (mm = side.match(/^מפסידה משחק (\d+)$/)) return loser[mm[1]];
  return null;
}

function koWinner(t1, t2) {
  const r1 = ratingFromSeed(t1), r2 = ratingFromSeed(t2);
  const [l1, l2] = simLambdas(r1, r2);
  const g1 = simPoisson(l1), g2 = simPoisson(l2);
  if (g1 > g2) return t1;
  if (g2 > g1) return t2;
  return Math.random() < 0.5 + (r1 - r2) * 0.2 ? t1 : t2; // penalties — slight lean to the favourite
}

function simulateOnce(groups, koList, slotDefs, tally) {
  const standings = {};
  GROUP_IDS.forEach(id => standings[id] = simGroup(groups[id]));
  const thirds = GROUP_IDS.map(id => standings[id][2] && { group: id, ...standings[id][2] })
    .filter(Boolean).sort(standingsCmp);
  const thirdSlots = allocateThirds(slotDefs, thirds);
  const winner = {}, loser = {};
  koList.forEach(k => {
    const t1 = resolveSide(k.side1, standings, thirdSlots, winner, loser);
    const t2 = resolveSide(k.side2, standings, thirdSlots, winner, loser);
    if (t1 && t2) tally[k.num].set(t1 + SEP + t2, (tally[k.num].get(t1 + SEP + t2) || 0) + 1);
    let w = k.fixedWinner, l = k.fixedLoser;
    if (!w && t1 && t2) { w = koWinner(t1, t2); l = w === t1 ? t2 : t1; }
    if (w) winner[k.num] = w;
    if (l) loser[k.num] = l;
  });
}

// What every slot would resolve to right now: current standings + each knockout
// going to the higher-seeded side. This is the highlighted "current status" line.
function deterministicMatchups(MATCHES, koList, slotDefs) {
  const standings = {};
  GROUP_IDS.forEach(id => standings[id] = calcStandings(id, MATCHES));
  const thirds = GROUP_IDS.map(id => standings[id][2] && { group: id, ...standings[id][2] })
    .filter(Boolean).sort(standingsCmp);
  const thirdSlots = allocateThirds(slotDefs, thirds);
  const winner = {}, loser = {}, matchup = {};
  koList.forEach(k => {
    const t1 = resolveSide(k.side1, standings, thirdSlots, winner, loser);
    const t2 = resolveSide(k.side2, standings, thirdSlots, winner, loser);
    matchup[k.num] = [t1, t2];
    let w = k.fixedWinner, l = k.fixedLoser;
    if (!w && t1 && t2) { w = ratingFromSeed(t1) >= ratingFromSeed(t2) ? t1 : t2; l = w === t1 ? t2 : t1; }
    if (w) winner[k.num] = w;
    if (l) loser[k.num] = l;
  });
  return matchup;
}

function computePlayoff(MATCHES) {
  const groups = prepareGroups(MATCHES);
  const koList = parseKO(MATCHES);
  const slotDefs = thirdSlotDefs(MATCHES);
  const tally = {};
  koList.forEach(k => tally[k.num] = new Map());
  for (let i = 0; i < SIM_N; i++) simulateOnce(groups, koList, slotDefs, tally);
  const prob = {};
  koList.forEach(k => {
    prob[k.num] = [...tally[k.num].entries()]
      .map(([key, c]) => { const [a, b] = key.split(SEP); return { a, b, pct: c / SIM_N }; })
      .sort((x, y) => y.pct - x.pct);
  });
  return { prob, current: deterministicMatchups(MATCHES, koList, slotDefs), koList };
}

// Top scenarios for a slot, guaranteeing the current-status matchup is shown
function scenarioList(num, data) {
  const entries = data.prob[num] || [];
  const cur = data.current[num];
  const curKey = cur && cur[0] && cur[1] ? cur[0] + SEP + cur[1] : null;
  let top = entries.slice(0, 5);
  if (curKey && !top.some(e => e.a + SEP + e.b === curKey)) {
    const curEntry = entries.find(e => e.a + SEP + e.b === curKey) || { a: cur[0], b: cur[1], pct: 0 };
    top = [...entries.slice(0, 4), curEntry].sort((x, y) => y.pct - x.pct);
  }
  return { top, curKey };
}

// Probability that the slot's currently-shown matchup (per the active scenario
// mode) is the one actually played here. null if there's no projected pair yet.
function matchupProbability(num) {
  const data = PLAYOFF.data;
  const t = slotTeams(num);
  if (!data || !t[0] || !t[1]) return null;
  const e = (data.prob[num] || []).find(x => (x.a === t[0] && x.b === t[1]) || (x.a === t[1] && x.b === t[0]));
  return e ? e.pct : 0;
}

// ── Bracket view ────────────────────────────────────────────────────────
// Cached probability run + the active filters (single-team highlight and a pair "do they meet")
const PLAYOFF = { data: null, filter: '', pairA: '', pairB: '', zoom: 1, scenarioMode: 'current' };
let CURRENT_MATCHES = []; // latest match list, for the prediction-accuracy popup

// Top-to-bottom order within each round so the connector lines pair up correctly
const BK_ROUNDS = ['32 הגדולות', 'שמינית גמר', 'רבע גמר', 'חצי גמר', 'גמר'];
const BK_ORDER = {
  '32 הגדולות': [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87],
  'שמינית גמר': [89, 90, 93, 94, 91, 92, 95, 96],
  'רבע גמר': [97, 98, 99, 100],
  'חצי גמר': [101, 102],
  'גמר': [104],
};

function flagOf(he) { return TEAM_FLAG[TEAM_EN[he] || he] || ''; }

// {real, label, sub?, flag?} for one side of a knockout match
function sideMeta(side) {
  if (isRealTeam(side)) return { real: true, label: tTeam(side), flag: flagOf(side) };
  let mm;
  if (mm = side.match(/^מנצחת בית ([A-L])$/)) return { real: false, label: T('phWinnerGroup', mm[1]) };
  if (mm = side.match(/^סגנית בית ([A-L])$/)) return { real: false, label: T('phRunnerGroup', mm[1]) };
  if (mm = side.match(/^מקום 3 מבתים (.+)$/)) return { real: false, label: T('phThird'), sub: mm[1] };
  if (mm = side.match(/^מנצחת משחק (\d+)$/)) return { real: false, label: T('phWinnerMatch', mm[1]) };
  if (mm = side.match(/^מפסידה משחק (\d+)$/)) return { real: false, label: T('phLoserMatch', mm[1]) };
  return { real: false, label: side };
}

function buildMatchCard(k) {
  const x = k.m;
  // For unresolved slots, show the projected team per the active scenario mode
  // (current status / most-likely). The slot label moves to a sub-line.
  const cur = slotTeams(k.num);
  const projMeta = (meta, team) => {
    if (meta.real || !team) return meta;
    const slot = meta.sub ? `${meta.label} ${meta.sub}` : meta.label;
    return { real: false, projected: true, label: tTeam(team), flag: flagOf(team), sub: slot };
  };
  const m1 = projMeta(sideMeta(k.side1), cur[0]);
  const m2 = projMeta(sideMeta(k.side2), cur[1]);
  const hasScore = !!x.score;
  const [s1, s2] = hasScore ? x.score.split('-').map(t => t.trim()) : ['', ''];
  const live = !!x.live;
  const row = (meta, score, side) => {
    const flag = meta.flag ? `<span class="bk-flag">${meta.flag}</span>` : '<span class="bk-flag"></span>';
    const nameCls = meta.real ? '' : (meta.projected ? ' bk-ph bk-proj' : ' bk-ph');
    const name = `<span class="bk-name${nameCls}">${meta.label}</span>` +
      (meta.sub ? `<span class="bk-sub">${meta.sub}</span>` : '');
    const sc = hasScore ? `<span class="bk-score">${score}</span>` : '';
    return `<div class="bk-row${k.fixedWinner === side ? ' bk-win' : ''}">${flag}<span class="bk-nm">${name}</span>${sc}</div>`;
  };
  const conv = matchInTz(x);
  const dow = tDow(conv.date);
  const when = `${tDate(conv.date)}${dow ? ' · ' + dow : ''}${conv.time ? ' · ' + conv.time : ''}`;
  const clickable = !k.finalized;
  const inWin = inWindow(x); // played inside the kids time window → green frame
  // Top-end corner: chance this exact matchup is the one played here; a green ✓
  // once the matchup is locked (certain). Live matches just show the live badge.
  let corner;
  if (live) corner = `<span class="bk-livebadge">${T('live')}</span>`;
  else if (k.finalized) corner = `<span class="bk-done" aria-label="${T('matchupSet')}">✓</span>`;
  else {
    const p = matchupProbability(k.num);
    corner = p == null ? '' : `<span class="bk-prob" title="${T('playChance')}">${p < 0.005 ? '<1%' : Math.round(p * 100) + '%'}</span>`;
  }
  return `<div class="bk-match${clickable ? ' bk-clickable' : ''}${live ? ' bk-live' : ''}${inWin ? ' bk-window' : ''}" data-num="${k.num}">
    <div class="bk-when"><span class="bk-when-txt">${when}</span>${corner}</div>
    ${row(m1, s1, k.side1)}
    ${row(m2, s2, k.side2)}
  </div>`;
}

function renderBracket() {
  const host = document.getElementById('bracket');
  if (!host) return;
  const data = PLAYOFF.data;
  if (!data) { host.innerHTML = `<div class="bk-calc">${T('probCalc')}</div>`; return; }
  const byNum = {};
  data.koList.forEach(k => byNum[k.num] = k);
  const bracket = document.createElement('div');
  bracket.className = 'bracket';
  BK_ROUNDS.forEach(rk => {
    const round = document.createElement('div');
    round.className = 'bk-round' + (rk === 'גמר' ? ' bk-final' : '') + (rk !== '32 הגדולות' ? ' bk-haschildren' : '');
    const title = document.createElement('div');
    title.className = 'bk-round-title';
    title.textContent = tStage(rk);
    round.appendChild(title);
    const ties = document.createElement('div');
    ties.className = 'bk-ties';
    (BK_ORDER[rk] || []).forEach(num => {
      const k = byNum[num];
      if (!k) return;
      const tie = document.createElement('div');
      tie.className = 'bk-tie';
      tie.innerHTML = buildMatchCard(k);
      ties.appendChild(tie);
    });
    round.appendChild(ties);
    bracket.appendChild(round);
  });
  host.innerHTML = '';
  host.appendChild(bracket);
  PLAYOFF.natW = bracket.offsetWidth;  // natural (unzoomed) size → used for the "fit whole bracket" zoom
  PLAYOFF.natH = bracket.offsetHeight;
  if (PLAYOFF.zoom !== 1) bracket.style.zoom = PLAYOFF.zoom; // keep pinch-zoom across re-renders
  const third = byNum[103];
  if (third) {
    const wrap = document.createElement('div');
    wrap.className = 'bk-third';
    wrap.innerHTML = `<div class="bk-round-title">${T('thirdPlaceTitle')}</div><div class="bk-tie">${buildMatchCard(third)}</div>`;
    host.appendChild(wrap);
  }
  buildPlayoffFilterPanel();
  applyBracketFilter();
}

// Teams that appear in at least one match's top-5 scenarios (so every option does something)
function playoffTeamList() {
  const teams = new Set();
  PLAYOFF.data.koList.forEach(k => scenarioList(k.num, PLAYOFF.data).top.forEach(e => { teams.add(e.a); teams.add(e.b); }));
  return [...teams].filter(Boolean);
}

// Fill one dropdown panel: empty option, then top teams, then the rest (like the schedule)
function fillTeamPanel(panel, selected, emptyLabel) {
  if (!panel || !PLAYOFF.data) return;
  const sortBy = (a, b) => tTeam(a).localeCompare(tTeam(b), lang === 'he' ? 'he' : 'en');
  const list = playoffTeamList();
  const topTeams = list.filter(t => TOP.includes(t)).sort(sortBy);
  const restTeams = list.filter(t => !TOP.includes(t)).sort(sortBy);
  panel.innerHTML = '';
  const addItem = (value, text, cls) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cs-item' + (cls ? ' ' + cls : '') + (value === selected ? ' selected' : '');
    b.dataset.value = value;
    b.innerHTML = `<span class="cs-main">${text}</span>`;
    panel.appendChild(b);
  };
  const addLabel = t => { const d = document.createElement('div'); d.className = 'cs-sec-label'; d.textContent = t; panel.appendChild(d); };
  const addSep = () => { const d = document.createElement('div'); d.className = 'cs-sep'; panel.appendChild(d); };
  addItem('', emptyLabel);
  if (topTeams.length) { addSep(); addLabel(T('topGroup')); topTeams.forEach(t => addItem(t, `${flagOf(t)} ${tTeam(t)}`, 'cs-indent')); }
  if (restTeams.length) { addSep(); addLabel(T('restGroup')); restTeams.forEach(t => addItem(t, `${flagOf(t)} ${tTeam(t)}`, 'cs-indent')); }
}

function setPlayoffLabel(id, team, emptyLabel) {
  const el = document.getElementById(id);
  if (el) el.textContent = team ? `${flagOf(team)} ${tTeam(team)}` : emptyLabel;
}

// (Re)build all three filter dropdowns + labels from the current data and selections
function buildPlayoffFilterPanel() {
  if (!PLAYOFF.data) return;
  const list = playoffTeamList();
  ['filter', 'pairA', 'pairB'].forEach(k => { if (PLAYOFF[k] && !list.includes(PLAYOFF[k])) PLAYOFF[k] = ''; });
  fillTeamPanel(document.getElementById('playoffFilterPanel'), PLAYOFF.filter, T('allTeams'));
  fillTeamPanel(document.getElementById('playoffPairPanelA'), PLAYOFF.pairA, T('choose'));
  fillTeamPanel(document.getElementById('playoffPairPanelB'), PLAYOFF.pairB, T('choose'));
  setPlayoffLabel('playoffFilterLabel', PLAYOFF.filter, T('allTeams'));
  setPlayoffLabel('playoffPairLabelA', PLAYOFF.pairA, T('choose'));
  setPlayoffLabel('playoffPairLabelB', PLAYOFF.pairB, T('choose'));
}

// Total probability two teams meet anywhere — sum of their (unordered) matchup
// probability over every match (mutually exclusive: they can meet at most once)
function pairMeetProbability(a, b) {
  let p = 0;
  PLAYOFF.data.koList.forEach(k => (PLAYOFF.data.prob[k.num] || []).forEach(e => {
    if ((e.a === a && e.b === b) || (e.a === b && e.b === a)) p += e.pct;
  }));
  return p;
}

// Apply whichever filter is active: a pair "do they meet" takes over when both
// teams are chosen, otherwise the single-team highlight
function applyBracketFilter() {
  const host = document.getElementById('bracket');
  if (!host || !PLAYOFF.data) return;
  const team = PLAYOFF.filter;
  const a = PLAYOFF.pairA, b = PLAYOFF.pairB;
  const pairMode = a && b && a !== b;
  const hl = new Set();
  if (pairMode) {
    PLAYOFF.data.koList.forEach(k => {
      if (scenarioList(k.num, PLAYOFF.data).top.some(e => (e.a === a && e.b === b) || (e.a === b && e.b === a))) hl.add(k.num);
    });
  } else if (team) {
    PLAYOFF.data.koList.forEach(k => {
      if (scenarioList(k.num, PLAYOFF.data).top.some(e => e.a === team || e.b === team)) hl.add(k.num);
    });
  }
  host.classList.toggle('bk-filtering', hl.size > 0);
  host.querySelectorAll('.bk-match[data-num]').forEach(el => el.classList.toggle('bk-hl', hl.has(el.dataset.num)));
  const cnt = document.getElementById('playoffScenCount');
  if (cnt) { const show = !!team && !pairMode; cnt.hidden = !show; cnt.textContent = show ? T('scenCount', hl.size) : ''; }
  const meet = document.getElementById('playoffPairResult');
  if (meet) {
    if (pairMode) {
      const p = pairMeetProbability(a, b);
      meet.hidden = false;
      meet.textContent = T('meetChance', p > 0 && p < 0.005 ? '<1' : String(Math.round(p * 100)));
    } else { meet.hidden = true; meet.textContent = ''; }
  }
  const clr = document.getElementById('playoffClear');
  if (clr) clr.disabled = !(PLAYOFF.filter || PLAYOFF.pairA || PLAYOFF.pairB);
}

// After filtering, bring the first highlighted match into view (both axes) so the
// user doesn't have to hunt for it down/sideways in the bracket
function scrollToFirstHighlight() {
  const el = document.querySelector('#bracket .bk-match.bk-hl');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
}

function openProbModal(num) {
  const data = PLAYOFF.data;
  if (!data) return;
  const k = data.koList.find(x => x.num === num);
  if (!k) return;
  const m1 = sideMeta(k.side1), m2 = sideMeta(k.side2);
  document.getElementById('probModalTitle').textContent = tStage(k.group);
  document.getElementById('probModalSlot').textContent = `${m1.label}${T('probVs')}${m2.label}`;
  const { top, curKey } = scenarioList(num, data);
  const body = document.getElementById('probModalBody');
  if (!top.length) {
    body.innerHTML = `<div class="prob-empty">${T('probDecided')}</div>`;
  } else {
    const pa = PLAYOFF.pairA, pb = PLAYOFF.pairB;
    const pairMode = pa && pb && pa !== pb;
    const single = !pairMode ? PLAYOFF.filter : ''; // single-team filter → highlight that name in gold
    const nm = t => t && t === single ? `<span class="prob-hl">${tTeam(t)}</span>` : tTeam(t);
    body.innerHTML = top.map(e => {
      const pct = Math.round(e.pct * 100);
      const isPair = pairMode && ((e.a === pa && e.b === pb) || (e.a === pb && e.b === pa));
      const isCur = curKey === e.a + SEP + e.b; // tag shows even when the row is also the green pair row
      return `<div class="prob-row${isPair ? ' prob-pair' : isCur ? ' prob-cur' : ''}">
        <div class="prob-bar" style="width:${Math.max(3, pct)}%"></div>
        <span class="prob-teams">${flagOf(e.a)} ${nm(e.a)} <span class="prob-dash">-</span> ${nm(e.b)} ${flagOf(e.b)}</span>
        ${isCur ? `<span class="prob-cur-tag">${T('probCurrent')}</span>` : ''}
        <span class="prob-pct">${pct}%</span>
      </div>`;
    }).join('');
  }
  // Likely exact scorelines for the projected matchup (per the active mode)
  const cur = slotTeams(num);
  const scoresEl = document.getElementById('probModalScores');
  if (scoresEl) {
    if (cur && isRealTeam(cur[0]) && isRealTeam(cur[1])) {
      scoresEl.innerHTML = `<div class="prob-scen-label sl-title">${T('likelyScores')} · ${tTeam(cur[0])}${T('probVs')}${tTeam(cur[1])} ${statsBtn()}</div><div class="sl-list">${scorelineRows(cur[0], cur[1])}</div>`;
      scoresEl.hidden = false;
    } else { scoresEl.hidden = true; scoresEl.innerHTML = ''; }
  }
  document.getElementById('probModalFoot').textContent = T('probCurrentHint');
  document.getElementById('probModal').hidden = false;
}

// ── Most-likely consistent bracket ──────────────────────────────────────
// Builds one coherent bracket: each first-round slot gets its most probable
// matchup with NO team repeated (a team lands in the slot where its scenario is
// strongest), then every later round follows from the previous round's winners.
// Returns { pair:{num:[t1,t2]}, pct:{num} } and is cached on the data object.
function likelyBracket(data) {
  const pair = {}, pct = {}, winner = {}, loser = {};
  const isGroupFed = k => !/משחק/.test(k.side1) && !/משחק/.test(k.side2);
  const setWin = (num, t1, t2) => {
    if (!t1 || !t2) return;
    const w = ratingFromSeed(t1) >= ratingFromSeed(t2) ? t1 : t2;
    winner[num] = w; loser[num] = w === t1 ? t2 : t1;
  };
  // Round 1 — greedy unique assignment, most-confident slots first so each
  // team ends up in its strongest slot and never appears twice.
  const used = new Set();
  data.koList.filter(isGroupFed)
    .map(k => ({ k, ent: data.prob[k.num] || [] }))
    .sort((a, b) => (b.ent[0]?.pct || 0) - (a.ent[0]?.pct || 0))
    .forEach(({ k, ent }) => {
      const pick = ent.find(e => !used.has(e.a) && !used.has(e.b)) || ent[0];
      if (!pick) return;
      pair[k.num] = [pick.a, pick.b]; pct[k.num] = pick.pct;
      used.add(pick.a); used.add(pick.b);
      setWin(k.num, pick.a, pick.b);
    });
  // Later rounds — continue from the previous round's winners (and losers, for
  // the 3rd-place match), processed in match-number order.
  const resolve = side => {
    let m;
    if (m = side.match(/^מנצחת משחק (\d+)$/)) return winner[m[1]];
    if (m = side.match(/^מפסידה משחק (\d+)$/)) return loser[m[1]];
    return isRealTeam(side) ? side : null;
  };
  data.koList.filter(k => !isGroupFed(k)).sort((a, b) => (+a.num) - (+b.num))
    .forEach(k => {
      const t1 = resolve(k.side1), t2 = resolve(k.side2);
      pair[k.num] = [t1, t2];
      const e = (data.prob[k.num] || []).find(x => (x.a === t1 && x.b === t2) || (x.a === t2 && x.b === t1));
      pct[k.num] = e ? e.pct : 0;
      setWin(k.num, t1, t2);
    });
  return { pair, pct };
}
// The [t1,t2] to display for a slot, per the active scenario mode
function slotTeams(num) {
  const data = PLAYOFF.data;
  if (!data) return [];
  if (PLAYOFF.scenarioMode === 'likely') {
    const lb = data.likely || (data.likely = likelyBracket(data));
    return lb.pair[num] || [];
  }
  return data.current[num] || [];
}

const DOW = {
  "11 ביוני":"חמישי","12 ביוני":"שישי","13 ביוני":"שבת","14 ביוני":"ראשון",
  "15 ביוני":"שני","16 ביוני":"שלישי","17 ביוני":"רביעי","18 ביוני":"חמישי",
  "19 ביוני":"שישי","20 ביוני":"שבת","21 ביוני":"ראשון","22 ביוני":"שני",
  "23 ביוני":"שלישי","24 ביוני":"רביעי","25 ביוני":"חמישי",
  "26 ביוני":"שישי","27 ביוני":"שבת",
  "28 ביוני":"ראשון","29 ביוני":"שני","30 ביוני":"שלישי",
  "01 ביולי":"רביעי","02 ביולי":"חמישי","03 ביולי":"שישי",
  "04 ביולי":"שבת","05 ביולי":"ראשון","06 ביולי":"שני","07 ביולי":"שלישי",
  "09 ביולי":"חמישי","10 ביולי":"שישי","11 ביולי":"שבת","12 ביולי":"ראשון",
  "14 ביולי":"שלישי","15 ביולי":"רביעי",
  "18 ביולי":"שבת","19 ביולי":"ראשון"
};

function isKnockoutRow(m) { return KNOCKOUT.has(m.group); }
function noTime(m) { return !m.time; }

function teamsOf(m) {
  if (isKnockoutRow(m)) return [];
  return m.match.split(" - ").map(s => s.trim());
}

function isTop(m) { return teamsOf(m).some(t => TOP.includes(t)); }

function toMin(t) {
  const [h, mm] = t.split(":").map(Number);
  return h * 60 + mm;
}

function inWindow(m) {
  if (noTime(m)) return false;
  const conv = (typeof matchInTz === 'function') ? matchInTz(m) : { date: m.date, time: m.time };
  const day = DOW[conv.date];
  const mins = toMin(conv.time);
  if (typeof currentTz !== 'undefined' && currentTz !== 'il') {
    // UK / US weekend convention: Sat = weekend-start, Sun = full weekend
    if (day === "שבת")    return mins >= 12 * 60 && mins <= 23 * 60;
    if (day === "ראשון") return mins >= 7  * 60 && mins <= 21 * 60;
    return mins >= 14 * 60 && mins <= 21 * 60;
  }
  // Israel: Fri = weekend-start, Sat = full weekend
  if (day === "שישי") return mins >= 12 * 60 && mins <= 23 * 60;
  if (day === "שבת")  return mins >= 7  * 60 && mins <= 21 * 60;
  return mins >= 14 * 60 && mins <= 21 * 60;
}

function qualifies(m) { return !noTime(m) && isTop(m) && inWindow(m); }

const DATE_ORDER = Object.keys(DOW);

// Convert a Hebrew date key like "11 ביוני" → ordinal number for comparison
function keyToOrd(key) {
  const [dayStr, monthHe] = key.split(' ');
  const m = monthHe === 'ביולי' ? 7 : 6;
  return m * 100 + parseInt(dayStr, 10);
}
function todayOrd() {
  const d = new Date();
  return (d.getMonth() + 1) * 100 + d.getDate();
}
function findTodayHeader() {
  const headers = [...document.querySelectorAll('.day-header')];
  if (!headers.length) return null;
  const t = todayOrd();
  for (const h of headers) {
    if (keyToOrd(h.dataset.date) >= t) return h;
  }
  return headers[headers.length - 1];
}

function getTopmostVisibleDate() {
  if (window.scrollY < 100) return null;
  const topEdge = 60;
  let result = null;
  for (const h of document.querySelectorAll('.day-header')) {
    if (h.getBoundingClientRect().top <= topEdge + 4) result = h.dataset.date;
    else break;
  }
  return result;
}

function scrollToNearestDate(targetDate) {
  const headers = [...document.querySelectorAll('.day-header')];
  if (!headers.length) return;
  let found = headers.find(h => h.dataset.date === targetDate);
  if (!found) {
    const idx = DATE_ORDER.indexOf(targetDate);
    for (let i = idx - 1; i >= 0; i--) {
      found = headers.find(h => h.dataset.date === DATE_ORDER[i]);
      if (found) break;
    }
  }
  if (!found) return;
  const y = window.scrollY + found.getBoundingClientRect().top - 58;
  window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
}

// ── Live scores via ESPN's public World Cup scoreboard API ──
const SCORES_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=250';
// ESPN naming differs from our TEAM_EN values for a handful of teams
const ESPN_ALIAS = {
  'Czechia': 'Czech Republic',
  'Bosnia-Herzegovina': 'Bosnia & Herzegovina',
  'Congo DR': 'DR Congo',
  'Ivory Coast': "Côte d'Ivoire",
  'United States': 'USA',
  'Türkiye': 'Turkey',
};
// English → Hebrew (first spelling wins for duplicate Hebrew variants)
const TEAM_HE = {};
for (const [he, en] of Object.entries(TEAM_EN)) if (!TEAM_HE[en]) TEAM_HE[en] = he;

const HE_MONTH = { 6: 'ביוני', 7: 'ביולי' };
// ESPN reports UTC; our date/time keys are Israel time (UTC+3 throughout June–July 2026)
function espnIlDateTime(utcIso) {
  const d = new Date(new Date(utcIso).getTime() + 3 * 3600 * 1000);
  const pad = n => String(n).padStart(2, '0');
  return {
    date: `${pad(d.getUTCDate())} ${HE_MONTH[d.getUTCMonth() + 1]}`,
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
  };
}

// Flag emoji per team (keyed by our English team names)
const TEAM_FLAG = {
  'Spain':'🇪🇸','France':'🇫🇷','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Argentina':'🇦🇷','Brazil':'🇧🇷',
  'Portugal':'🇵🇹','Germany':'🇩🇪','Netherlands':'🇳🇱','Belgium':'🇧🇪','Norway':'🇳🇴',
  'Uruguay':'🇺🇾','Mexico':'🇲🇽','USA':'🇺🇸','Canada':'🇨🇦','Morocco':'🇲🇦',
  'Croatia':'🇭🇷','Colombia':'🇨🇴','Japan':'🇯🇵','Switzerland':'🇨🇭','Iran':'🇮🇷',
  'Senegal':'🇸🇳','Australia':'🇦🇺','South Korea':'🇰🇷','Austria':'🇦🇹','Turkey':'🇹🇷',
  'Paraguay':'🇵🇾','Tunisia':'🇹🇳','Saudi Arabia':'🇸🇦','Egypt':'🇪🇬','Czech Republic':'🇨🇿',
  'Sweden':'🇸🇪','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Ghana':'🇬🇭','Iraq':'🇮🇶','Panama':'🇵🇦',
  'Ecuador':'🇪🇨',"Côte d'Ivoire":'🇨🇮','Algeria':'🇩🇿','Qatar':'🇶🇦','Uzbekistan':'🇺🇿',
  'Jordan':'🇯🇴','DR Congo':'🇨🇩','Haiti':'🇭🇹','Bosnia & Herzegovina':'🇧🇦',
  'Cape Verde':'🇨🇻','New Zealand':'🇳🇿','South Africa':'🇿🇦','Curaçao':'🇨🇼',
};

// ── Latin → Hebrew transliteration of player names ──
// Rules vary by the team's language so "Jiménez" (es) → חימנס while "Johnson" (en) → ג'ונסון
const TEAM_LANG = {
  'Spain':'es','Argentina':'es','Mexico':'es','Uruguay':'es','Colombia':'es',
  'Ecuador':'es','Paraguay':'es','Panama':'es',
  'Brazil':'pt','Portugal':'pt','Cape Verde':'pt',
  'France':'fr','Haiti':'fr','Senegal':'fr',"Côte d'Ivoire":'fr','DR Congo':'fr',
  'Germany':'de','Austria':'de','Switzerland':'de',
  'Netherlands':'nl','Belgium':'nl','Curaçao':'nl',
  'Morocco':'ar','Tunisia':'ar','Algeria':'ar','Egypt':'ar','Saudi Arabia':'ar',
  'Qatar':'ar','Jordan':'ar','Iraq':'ar','Iran':'ar',
}; // everything else falls back to 'en'

const HE_FINAL = { 'מ':'ם', 'נ':'ן', 'צ':'ץ', 'פ':'ף', 'כ':'ך' };
// Ordered: longest patterns first; optional third field restricts to languages
const TRANS_RULES = [
  ['tsch','טש','de'], ['sch','ש','de'],
  ['ch',"צ'",'es en'], ['ch','ש','fr pt ar'], ['ch','כ','de nl'],
  ['sh','ש'], ['th','ת'], ['ph','פ'], ['kh','ח'], ['gh','ג'], ['ck','ק'],
  ['tz','צ'], ['ts','צ'],
  ['ll','י','es'], ['ñ','ני'], ['ç','ס'],
  ['ij','יי','nl'], ['eu','וי','de'], ['ei','יי','de nl'],
  ['ou','ו','fr'], ['oo','ו','en'], ['ee','י','en nl'],
  ['qu','ק'], ['q','ק'], ['x','קס'], ['w','ו'], ['v','ו'],
  ['b','ב'], ['d','ד'], ['f','פ'], ['k','ק'], ['l','ל'], ['m','מ'],
  ['n','נ'], ['p','פ'], ['r','ר'], ['s','ס'], ['t','ט'],
  ['z','ס','es'], ['z','ז'],
];

function translitWord(raw, lg) {
  let w = raw.normalize('NFD')
    .replace(/ñ/g, 'ñ')
    .replace(/ç/g, 'ç')
    .replace(/é/g, 'é')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  // Collapse doubled Latin letters, except digraphs that carry meaning per language
  const keepDoubles = { es: ['ll'], en: ['ee', 'oo'], nl: ['ee'] };
  w = w.replace(/(.)\1+/g, (m0, ch) => (keepDoubles[lg] || []).includes(ch + ch) ? ch + ch : ch);
  let out = '';
  let i = 0;
  while (i < w.length) {
    const start = i === 0;
    const end = i === w.length - 1;
    const rest = w.slice(i);
    const nxt = w[i + 1] || '';
    const c = w[i];
    let matched = null, len = 1;
    for (const [pat, heb, langs] of TRANS_RULES) {
      if ((!langs || langs.includes(lg)) && rest.startsWith(pat)) { matched = heb; len = pat.length; break; }
    }
    if (matched !== null) { out += matched; i += len; continue; }
    if (c === 'j') { out += ({ es: 'ח', pt: "ז'", fr: "ז'", de: 'י', nl: 'י' }[lg] || "ג'"); i++; continue; }
    if (c === 'g') { out += ('eiy'.includes(nxt) && ({ es: 'ח', pt: "ז'", fr: "ז'" }[lg])) || 'ג'; i++; continue; }
    if (c === 'c') { out += 'eiy'.includes(nxt) ? 'ס' : 'ק'; i++; continue; }
    if (c === 'h') { if (!['es', 'fr', 'pt'].includes(lg)) out += 'ה'; i++; continue; }
    if ('aeiouyé'.includes(c)) {
      out += {
        a: start ? 'א' : end ? 'ה' : 'א',
        e: start ? 'א' : '',
        i: start ? 'אי' : 'י',
        o: start ? 'או' : 'ו',
        u: start ? 'או' : 'ו',
        y: 'י',
        'é': start ? 'א' : end ? 'ה' : '',
      }[c];
      i++; continue;
    }
    i++; // unmapped char — drop
  }
  const last = out[out.length - 1];
  if (out.length > 1 && HE_FINAL[last]) out = out.slice(0, -1) + HE_FINAL[last];
  return out;
}

// Display name for a player: transliterated to Hebrew when the UI is Hebrew
function pName(name, teamEn) {
  if (lang !== 'he' || !name) return name;
  const lg = TEAM_LANG[teamEn] || 'en';
  return name.split(/([^a-zA-ZÀ-ɏ]+)/).map(part =>
    /[a-zA-ZÀ-ɏ]/.test(part) ? translitWord(part, lg) : part
  ).join('');
}

// American moneyline ("+165" / "-225") → decimal odds string ("2.65" / "1.44")
function amToDec(s) {
  if (s === 'EVEN') return '2.00';
  const v = parseInt(s, 10);
  if (!Number.isFinite(v) || v === 0) return null;
  return (v > 0 ? 1 + v / 100 : 1 + 100 / Math.abs(v)).toFixed(2);
}

async function loadScores() {
  const res = await fetch(SCORES_URL);
  if (!res.ok) throw new Error('Scores network error: ' + res.status);
  const data = await res.json();
  return (data.events || []).map(e => {
    const comp = e.competitions[0];
    const home = comp.competitors.find(c => c.homeAway === 'home');
    const away = comp.competitors.find(c => c.homeAway === 'away');
    const norm = n => ESPN_ALIAS[n] || n;
    const state = e.status?.type?.state; // 'pre' | 'in' | 'post'
    const stat = (c, name) => (c.statistics || []).find(s2 => s2.name === name)?.displayValue || '';
    const ml = comp.odds?.[0]?.moneyline;
    const homeEn = norm(home.team.displayName);
    const awayEn = norm(away.team.displayName);
    return {
      ...espnIlDateTime(e.date),
      state,
      homeEn,
      awayEn,
      homeScore: home.score,
      awayScore: away.score,
      clock: state === 'in' ? (e.status?.displayClock || '') : '',
      homeId: home.team.id,
      awayId: away.team.id,
      goals: (comp.details || []).filter(d2 => d2.scoringPlay && !d2.shootout).map(d2 => ({
        teamId: d2.team?.id,
        teamEn: d2.team?.id === home.team.id ? homeEn : awayEn,
        minute: d2.clock?.displayValue || '',
        player: d2.athletesInvolved?.[0]?.displayName || '',
        playerId: d2.athletesInvolved?.[0]?.id || '',
        og: !!d2.ownGoal,
        pk: !!d2.penaltyKick,
      })),
      reds: (comp.details || []).filter(d2 => d2.redCard).map(d2 => d2.team?.id),
      posHome: stat(home, 'possessionPct'),
      posAway: stat(away, 'possessionPct'),
      formHome: home.form || '',
      formAway: away.form || '',
      oddsHome: amToDec(ml?.home?.close?.odds),
      oddsDraw: amToDec(ml?.draw?.close?.odds),
      oddsAway: amToDec(ml?.away?.close?.odds),
      // In-play odds — DraftKings keeps updating `current` while the match runs
      oddsHomeLive: amToDec(ml?.home?.current?.odds),
      oddsDrawLive: amToDec(ml?.draw?.current?.odds),
      oddsAwayLive: amToDec(ml?.away?.current?.odds),
    };
  });
}

// Merge live/final scores into the schedule rows (mutates matches in place).
// Group matches are matched by team pair + date; knockout matches by their
// unique date+time slot (verified unique across the whole bracket).
function applyScores(matches, scores) {
  const byPair = new Map(), byDt = new Map();
  scores.forEach(s => {
    byPair.set([s.homeEn, s.awayEn].sort().join('|') + '@' + s.date, s);
    byDt.set(s.date + '@' + s.time, s);
  });
  matches.forEach(m => {
    let s, flip = false;
    if (isKnockoutRow(m)) {
      s = byDt.get(m.date + '@' + m.time);
      // Once the bracket resolves, ESPN carries real team names — show them
      // instead of the "מנצחת משחק X" placeholders (ESPN home-away order)
      if (s && TEAM_HE[s.homeEn] && TEAM_HE[s.awayEn]) {
        const prefix = m.match.match(/^(משחק [^:]+: )/);
        m.match = (prefix ? prefix[1] : '') + TEAM_HE[s.homeEn] + ' - ' + TEAM_HE[s.awayEn];
      }
    } else {
      const en = teamsOf(m).map(t => TEAM_EN[t]);
      if (en[0] && en[1]) {
        s = byPair.get(en.slice().sort().join('|') + '@' + m.date);
        if (s) flip = en[0] !== s.homeEn; // keep score in the row's team order
      }
    }
    if (!s) return;
    // Extra ESPN data for the expandable row panel, oriented to the row's team order
    const A = !flip; // true when the row's first team is ESPN's home team
    m.ext = {
      state: s.state,
      clock: s.clock,
      goals1: s.goals.filter(g => g.teamId === (A ? s.homeId : s.awayId)),
      goals2: s.goals.filter(g => g.teamId === (A ? s.awayId : s.homeId)),
      reds1: s.reds.filter(id => id === (A ? s.homeId : s.awayId)).length,
      reds2: s.reds.filter(id => id === (A ? s.awayId : s.homeId)).length,
      pos1: A ? s.posHome : s.posAway,
      pos2: A ? s.posAway : s.posHome,
      form1: A ? s.formHome : s.formAway,
      form2: A ? s.formAway : s.formHome,
      odds1: A ? s.oddsHome : s.oddsAway,
      oddsX: s.oddsDraw,
      odds2: A ? s.oddsAway : s.oddsHome,
      odds1Live: A ? s.oddsHomeLive : s.oddsAwayLive,
      oddsXLive: s.oddsDrawLive,
      odds2Live: A ? s.oddsAwayLive : s.oddsHomeLive,
    };
    if (s.state === 'pre') return;
    m.score = flip ? `${s.awayScore}-${s.homeScore}` : `${s.homeScore}-${s.awayScore}`;
    m.live = s.state === 'in';
  });
}

// Tournament golden-boot table, aggregated from every goal event ESPN reports
// (own goals excluded). Refreshed on each data load.
let TOP_SCORERS = [];
let SCORES_AT = null; // when the last successful ESPN fetch landed
function computeTopScorers(scores) {
  const byId = {};
  scores.forEach(s => s.goals.forEach(g => {
    if (g.og || !g.playerId) return;
    if (!byId[g.playerId]) byId[g.playerId] = { id: g.playerId, player: g.player, team: g.teamEn, goals: 0 };
    byId[g.playerId].goals++;
  }));
  return Object.values(byId).sort((a, b) => b.goals - a.goals);
}

// Displayed names of a row's two teams (knockout rows lose their "משחק N:" prefix)
function rowTeamLabels(m) {
  if (!isKnockoutRow(m)) return teamsOf(m).map(tTeam);
  let s = tMatchString(m.match);
  const ci = s.indexOf(': ');
  if (ci > -1) s = s.slice(ci + 2);
  const i = s.indexOf(' - ');
  return i > -1 ? [s.slice(0, i), s.slice(i + 3)] : [s, ''];
}

const FORM_HE = { W: 'נ', D: 'ת', L: 'ה' };
function formHtml(f) {
  // ESPN form is newest-first; we want oldest-first in logical order, so
  // the bidi renderer puts the newest at the reading-direction end in both
  // languages: leftmost in Hebrew (RTL letters), rightmost in English
  const chars = f.split('');
  return `<span class="f-letters" dir="ltr">${chars.map(c => `<span class="f-${c}">${lang === 'he' ? (FORM_HE[c] || c) : c}</span>`).join('')}</span>`;
}

function goalsHtml(goals) {
  return goals.map(g => {
    const display = pName(g.player, g.teamEn);
    const name = g.playerId
      ? `<button type="button" class="scorer-link" data-pid="${g.playerId}">${display}</button>`
      : display;
    return `<div class="scorer">⚽ ${g.minute} ${name}${g.pk ? ` (${T('pen')})` : ''}${g.og ? ` (${T('ownGoal')})` : ''}</div>`;
  }).join('');
}

// Expandable panel content per match state:
// pre → odds + recent form · live → scorers + possession + group table · post → scorers
// The two real team names of a match (group or finalized KO), else null
function matchRealTeams(m) {
  let parts;
  if (isKnockoutRow(m)) {
    const body = m.match.replace(/^משחק \d+( \(הגמר!\))?: /, '');
    const i = body.indexOf(' - ');
    if (i < 0) return null;
    parts = [body.slice(0, i).trim(), body.slice(i + 3).trim()];
  } else {
    parts = teamsOf(m);
  }
  return parts.length === 2 && isRealTeam(parts[0]) && isRealTeam(parts[1]) ? parts : null;
}
// Rows of the 3 most likely pre-match exact scorelines (digits sit next to each
// team). If `actual` ("g1-g2", in t1-t2 order) is given, the matching row is
// flagged; if the actual result wasn't in the top 3 it's appended as a 4th row.
function scorelineRows(t1, t2, actual) {
  const top = topScorelines(t1, t2, 3);
  let act = null;
  if (actual) {
    const [a1, a2] = actual.split('-').map(s => parseInt(s.trim(), 10));
    if (Number.isInteger(a1) && Number.isInteger(a2)) {
      const [l1, l2] = simLambdas(ratingFromSeed(t1), ratingFromSeed(t2));
      act = { g1: a1, g2: a2, p: poissonPmf(a1, l1) * poissonPmf(a2, l2) };
    }
  }
  const same = s => act && s.g1 === act.g1 && s.g2 === act.g2;
  const row = (s, mark) => {
    const pct = Math.round(s.p * 100);
    return `<div class="sl-row${mark ? ' sl-actual' : ''}">
      <span class="sl-teams">${flagOf(t1)} ${tTeam(t1)} <b class="sl-g">${s.g1}</b><span class="sl-dash">–</span><b class="sl-g">${s.g2}</b> ${tTeam(t2)} ${flagOf(t2)}</span>
      ${mark ? `<span class="sl-tag">${T('actualResult')}</span>` : ''}
      <span class="sl-pct">${pct < 1 ? '<1' : pct}%</span>
    </div>`;
  };
  let html = top.map(s => row(s, same(s))).join('');
  if (act && !top.some(same)) html += row(act, true);
  return html;
}

// Back-test: across every finished match with known teams, how often the actual
// result matched the model's 1st / 2nd / 3rd pick (or none — "other").
function predictionAccuracy(MATCHES) {
  let r1 = 0, r2 = 0, r3 = 0, other = 0, total = 0;
  (MATCHES || []).forEach(m => {
    if (m.live || !m.score) return;
    const teams = matchRealTeams(m);
    if (!teams) return;
    const [a1, a2] = m.score.split('-').map(s => parseInt(s.trim(), 10));
    if (!Number.isInteger(a1) || !Number.isInteger(a2)) return;
    total++;
    const idx = topScorelines(teams[0], teams[1], 3).findIndex(s => s.g1 === a1 && s.g2 === a2);
    if (idx === 0) r1++; else if (idx === 1) r2++; else if (idx === 2) r3++; else other++;
  });
  return { r1, r2, r3, other, total };
}
// Distribution of actual scorelines across finished matches, grouped by margin
// (e.g. 0-2 and 2-0 both count as "2-0"), most common first.
function commonResults(MATCHES) {
  const map = new Map();
  let total = 0;
  (MATCHES || []).forEach(m => {
    if (m.live || !m.score) return;
    if (!matchRealTeams(m)) return;
    const [a, b] = m.score.split('-').map(s => parseInt(s.trim(), 10));
    if (!Number.isInteger(a) || !Number.isInteger(b)) return;
    total++;
    const key = `${Math.max(a, b)}-${Math.min(a, b)}`;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return { arr: [...map.entries()].map(([score, n]) => ({ score, n })).sort((x, y) => y.n - x.n), total };
}
// Small "descending bars" icon button that opens the accuracy popup
function statsBtn() {
  return `<button type="button" class="sl-stats-btn" title="${T('predAccTitle')}" aria-label="${T('predAccTitle')}"><svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><rect x="1" y="2.5" width="3.4" height="11" rx="1"/><rect x="6.3" y="6" width="3.4" height="7.5" rx="1"/><rect x="11.6" y="9.5" width="3.4" height="4" rx="1"/></svg></button>`;
}

function buildExtPanel(m, MATCHES) {
  const x = m.ext;
  const panel = document.createElement('div');
  panel.className = 'ext-panel';
  const [n1, n2] = rowTeamLabels(m);

  // Pre-match top-3 exact scorelines for matches with two known teams. Shown
  // for unplayed matches, and for finished ones too (with the actual flagged).
  const realTeams = matchRealTeams(m);
  const finished = !!m.score && !m.live;
  const scoresHtml = (realTeams && !m.live)
    ? `<div class="ext-sec-title sl-title">${T('likelyScores')} ${statsBtn()}</div><div class="sl-list">${scorelineRows(realTeams[0], realTeams[1], finished ? m.score : null)}</div>`
    : '';

  if (!x) {
    if (!scoresHtml) return null;
    panel.innerHTML = scoresHtml;
    return panel;
  }

  if (x.state === 'pre') {
    let html = '';
    if (x.odds1 && x.oddsX && x.odds2) {
      html += `<div class="ext-sec-title">${T('oddsTitle')}</div>
        <div class="ext-odds">
          <div class="odds-cell"><span class="odds-team">${n1}</span><span class="odds-val">${x.odds1}</span></div>
          <div class="odds-cell"><span class="odds-team">${T('draw')}</span><span class="odds-val">${x.oddsX}</span></div>
          <div class="odds-cell"><span class="odds-team">${n2}</span><span class="odds-val">${x.odds2}</span></div>
        </div>`;
    }
    if (x.form1 || x.form2) {
      const formDir = `<div class="form-dir" dir="ltr" style="text-align:${lang === 'he' ? 'left' : 'right'}">${lang === 'he' ? '─────►' : '◄─────'}</div>`;
      html += `<div class="ext-sec-title">${T('formTitle')}</div>${formDir}<div class="ext-form">`;
      if (x.form1) html += `<div class="form-row"><span>${n1}</span>${formHtml(x.form1)}</div>`;
      if (x.form2) html += `<div class="form-row"><span>${n2}</span>${formHtml(x.form2)}</div>`;
      html += `</div>`;
    }
    html += scoresHtml;
    if (!html) return null;
    panel.innerHTML = html;
    return panel;
  }

  // live or finished — scorers first
  const g1 = goalsHtml(x.goals1), g2 = goalsHtml(x.goals2);
  let html = `<div class="ext-sec-title">${T('scorersTitle')}</div>`;
  html += (g1 || g2)
    ? `<div class="ext-scorers"><div class="ext-col">${g1}</div><div class="ext-col">${g2}</div></div>`
    : `<div class="ext-nogoals">${T('noGoals')}</div>`;
  panel.innerHTML = html;

  if (x.state === 'in' && x.pos1 && x.pos2) {
    panel.insertAdjacentHTML('beforeend', `
      <div class="ext-sec-title">${T('possession')}</div>
      <div class="ext-pos"><span>${Math.round(x.pos1)}%</span><div class="pos-bar"><div class="pos-fill" style="width:${x.pos1}%"></div></div><span>${Math.round(x.pos2)}%</span></div>`);
  }
  // In-play odds, refreshed with every data reload
  if (x.state === 'in' && x.odds1Live && x.oddsXLive && x.odds2Live) {
    panel.insertAdjacentHTML('beforeend', `
      <div class="ext-sec-title">${T('oddsTitle')} <span class="badge live">${T('live')}</span> <span class="odds-updated">${SCORES_AT ? T('oddsUpdated', Math.max(0, Math.round((Date.now() - SCORES_AT) / 1000))) : ''}</span></div>
      <div class="ext-odds">
        <div class="odds-cell"><span class="odds-team">${n1}</span><span class="odds-val">${x.odds1Live}</span></div>
        <div class="odds-cell"><span class="odds-team">${T('draw')}</span><span class="odds-val">${x.oddsXLive}</span></div>
        <div class="odds-cell"><span class="odds-team">${n2}</span><span class="odds-val">${x.odds2Live}</span></div>
      </div>`);
  }
  // Pre-match top-3 prediction vs the actual result (finished matches)
  if (scoresHtml) panel.insertAdjacentHTML('beforeend', scoresHtml);
  // Group standings shown for both live and finished group-stage matches
  if (!isKnockoutRow(m)) {
    panel.appendChild(buildStandingsTable(calcStandings(m.group, MATCHES), m.group));
  }
  return panel;
}

async function loadData() {
  const res = await fetch('/data/matches.json?t=' + Date.now());
  if (!res.ok) throw new Error('Network error: ' + res.status);
  const matches = await res.json();
  // Live scores are best-effort — the schedule must still load if ESPN is down
  try {
    const scores = await loadScores();
    applyScores(matches, scores);
    TOP_SCORERS = computeTopScorers(scores);
    SCORES_AT = Date.now();
  } catch (e) {
    console.warn('Live scores unavailable:', e);
  }
  return matches;
}


async function init() {
  let MATCHES = await loadData();

  const teamSel = document.getElementById('filterTeam');
  const stageSel = document.getElementById('filterStage');

  function rebuildDropdowns() {
    const prevTeam = teamSel.value;
    const prevStage = stageSel.value;

    // ── Team custom dropdown ──
    const allTeams = new Set();
    MATCHES.forEach(m => teamsOf(m).forEach(t => allTeams.add(t)));
    const sortLocale = lang === 'he' ? 'he' : 'en';
    const sortBy = (a, b) => tTeam(a).localeCompare(tTeam(b), sortLocale);
    const topTeams  = [...allTeams].filter(t =>  TOP.includes(t)).sort(sortBy);
    const restTeams = [...allTeams].filter(t => !TOP.includes(t)).sort(sortBy);
    // Rebuild hidden native select (value tracking)
    teamSel.innerHTML = '<option value=""></option>';
    const topOpt = document.createElement('option'); topOpt.value = '__TOP__'; topOpt.textContent = T('topGroup'); teamSel.appendChild(topOpt);
    topTeams.forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = tTeam(t); teamSel.appendChild(o); });
    restTeams.forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = tTeam(t); teamSel.appendChild(o); });
    if ([...teamSel.options].some(o => o.value === prevTeam)) teamSel.value = prevTeam;
    // Build custom team panel
    const teamPanel = document.getElementById('filterTeamPanel');
    const teamLabel = document.getElementById('filterTeamLabel');
    if (teamPanel) {
      teamPanel.innerHTML = '';
      const addTeamItem = (value, text, extraClass) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'cs-item' + (value === teamSel.value ? ' selected' : '') + (extraClass ? ' ' + extraClass : '');
        item.dataset.value = value;
        item.innerHTML = `<span class="cs-main">${text}</span>`;
        teamPanel.appendChild(item);
      };
      const addSecLabel = (text) => {
        const div = document.createElement('div');
        div.className = 'cs-sec-label';
        div.textContent = text;
        teamPanel.appendChild(div);
      };
      addTeamItem('', T('allTeams'));
      const sep1 = document.createElement('div'); sep1.className = 'cs-sep'; teamPanel.appendChild(sep1);
      // "Top teams" is now a selectable filter (replaces the old top-only toggle)
      addTeamItem('__TOP__', T('topGroup'), 'cs-group-opt');
      topTeams.forEach(t => addTeamItem(t, tTeam(t), 'cs-indent'));
      if (restTeams.length) {
        const sep2 = document.createElement('div'); sep2.className = 'cs-sep'; teamPanel.appendChild(sep2);
        addSecLabel(T('restGroup'));
        restTeams.forEach(t => addTeamItem(t, tTeam(t), 'cs-indent'));
      }
      if (teamLabel) teamLabel.textContent = teamLabelText(teamSel.value);
    }

    stageSel.innerHTML = '<option value="">כל הבתים</option>';
    const KO_ORDER = ["32 הגדולות","שמינית גמר","רבע גמר","חצי גמר","מקום 3","גמר"];
    const allGroups = [...new Set(MATCHES.map(m => m.group))];
    const letters = allGroups.filter(g => !KNOCKOUT.has(g)).sort();
    const kos     = KO_ORDER.filter(g => allGroups.includes(g));
    const topSeed = {};
    letters.forEach(g => {
      const teams = new Set();
      MATCHES.filter(m => m.group === g).forEach(m =>
        m.match.split(' - ').map(s => s.trim()).forEach(t => teams.add(t))
      );
      topSeed[g] = [...teams].sort((a, b) => (SEED[a] || 99) - (SEED[b] || 99))[0];
    });
    // Hidden native select — for value persistence + form semantics
    [...letters, ...kos].forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s;
      stageSel.appendChild(o);
    });
    // Build the custom dropdown panel
    const panel = document.getElementById('filterStagePanel');
    const label = document.getElementById('filterStageLabel');
    panel.innerHTML = '';
    const addItem = (value, text, faded) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'cs-item' + (value === stageSel.value ? ' selected' : '');
      item.dataset.value = value;
      item.innerHTML = faded
        ? `<span class="cs-main">${text}</span><span class="cs-sub">${faded}</span>`
        : `<span class="cs-main">${text}</span>`;
      panel.appendChild(item);
    };
    addItem('', T('allStages'), '');
    letters.forEach(s => addItem(s, lang === 'en' ? s : T('groupLabel', s), tTeam(topSeed[s] || '')));
    if (kos.length) {
      const sep = document.createElement('div');
      sep.className = 'cs-sep';
      panel.appendChild(sep);
      kos.forEach(s => addItem(s, tStage(s), ''));
    }
    // Sync label with current value
    const syncLabel = () => {
      const v = stageSel.value;
      if (!v) label.textContent = T('allStages');
      else if (KNOCKOUT.has(v)) label.textContent = tStage(v);
      else label.textContent = T('groupLabel', v) + (topSeed[v] ? ` · ${tTeam(topSeed[v])}` : '');
    };
    syncLabel();
    if ([...stageSel.options].some(o => o.value === prevStage)) stageSel.value = prevStage;
  }

  rebuildDropdowns();

  // Custom stage dropdown — open/close + item selection
  const csWrap = document.getElementById('filterStageWrap');
  const csTrigger = document.getElementById('filterStageTrigger');
  const csPanel = document.getElementById('filterStagePanel');
  csTrigger.addEventListener('click', e => {
    e.stopPropagation();
    // Close the team panel if it's open (only one filter open at a time)
    const tp = document.getElementById('filterTeamPanel');
    const tt = document.getElementById('filterTeamTrigger');
    if (tp) { tp.hidden = true; tt && tt.setAttribute('aria-expanded', 'false'); }
    const open = !csPanel.hidden;
    csPanel.hidden = open;
    csTrigger.setAttribute('aria-expanded', String(!open));
  });
  csPanel.addEventListener('click', e => {
    const item = e.target.closest('.cs-item');
    if (!item) return;
    stageSel.value = item.dataset.value;
    csPanel.hidden = true;
    csTrigger.setAttribute('aria-expanded', 'false');
    csPanel.querySelectorAll('.cs-item').forEach(it => it.classList.toggle('selected', it === item));
    stageSel.dispatchEvent(new Event('change'));
  });
  document.addEventListener('click', e => {
    if (!csWrap.contains(e.target)) { csPanel.hidden = true; csTrigger.setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { csPanel.hidden = true; csTrigger.setAttribute('aria-expanded', 'false'); }
  });

  // Custom team dropdown — open/close + item selection
  const teamWrap    = document.getElementById('filterTeamWrap');
  const teamTrigger = document.getElementById('filterTeamTrigger');
  const teamPanelEl = document.getElementById('filterTeamPanel');
  if (teamWrap && teamTrigger && teamPanelEl) {
    teamTrigger.addEventListener('click', e => {
      e.stopPropagation();
      // Close the stage panel if it's open (only one filter open at a time)
      csPanel.hidden = true;
      csTrigger.setAttribute('aria-expanded', 'false');
      const open = !teamPanelEl.hidden;
      teamPanelEl.hidden = open;
      teamTrigger.setAttribute('aria-expanded', String(!open));
    });
    teamPanelEl.addEventListener('click', e => {
      const item = e.target.closest('.cs-item');
      if (!item) return;
      teamSel.value = item.dataset.value;
      teamPanelEl.hidden = true;
      teamTrigger.setAttribute('aria-expanded', 'false');
      teamPanelEl.querySelectorAll('.cs-item').forEach(it => it.classList.toggle('selected', it === item));
      const tl = document.getElementById('filterTeamLabel');
      if (tl) tl.textContent = teamLabelText(teamSel.value);
      teamSel.dispatchEvent(new Event('change'));
    });
    document.addEventListener('click', e => {
      if (!teamWrap.contains(e.target)) { teamPanelEl.hidden = true; teamTrigger.setAttribute('aria-expanded', 'false'); }
    });
  }

  // When stage value changes (from any source), update the trigger label
  stageSel.addEventListener('change', () => {
    const v = stageSel.value;
    const label = document.getElementById('filterStageLabel');
    if (!v) label.textContent = T('allStages');
    else if (KNOCKOUT.has(v)) label.textContent = tStage(v);
    else {
      const teams = new Set();
      MATCHES.filter(m => m.group === v).forEach(m =>
        m.match.split(' - ').map(s => s.trim()).forEach(t => teams.add(t))
      );
      const top = [...teams].sort((a, b) => (SEED[a] || 99) - (SEED[b] || 99))[0];
      label.textContent = T('groupLabel', v) + (top ? ` · ${tTeam(top)}` : '');
    }
  });

  const els = {
    q:    document.getElementById('filterQualify'),
    team: teamSel,
    stage: stageSel,
    list: document.getElementById('list'),
    count: document.getElementById('count'),
    btn: document.getElementById('refreshBtn'),
    clear: document.getElementById('clearFilters'),
  };

  function anyFilterActive() {
    return els.q.checked || !!els.team.value || !!els.stage.value;
  }
  function updateClearBtn() {
    els.clear.disabled = !anyFilterActive();
  }
  els.clear.addEventListener('click', () => {
    els.q.checked = false;
    els.team.value = '';
    els.stage.value = '';
    // Reset team panel visual state
    const tl = document.getElementById('filterTeamLabel');
    if (tl) tl.textContent = T('allTeams');
    document.querySelectorAll('#filterTeamPanel .cs-item').forEach(it =>
      it.classList.toggle('selected', it.dataset.value === '')
    );
    stageSel.dispatchEvent(new Event('change'));
    render();
  });

  // "היום" floating button — shows when today's date header is scrolled away from top
  const todayBtn = document.getElementById('todayBtn');
  function updateTodayBtn() {
    const target = findTodayHeader();
    if (!target) { todayBtn.hidden = true; return; }
    const top = target.getBoundingClientRect().top;
    // Hide while today's header is resting near the top (you're already there)
    todayBtn.hidden = (top >= 20 && top <= 96);
  }
  todayBtn.addEventListener('click', () => {
    const target = findTodayHeader();
    if (!target) return;
    const y = window.scrollY + target.getBoundingClientRect().top - 58;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  });

  // Pin only the "היום" button to the top once the count row scrolls past it
  function updateTodayPin() {
    const cr = document.querySelector('.count-row');
    if (!cr) return;
    todayBtn.classList.toggle('pinned', cr.getBoundingClientRect().top <= 10);
  }

  // Refresh fab — collapses to icon-only once the page is scrolled
  // When in "refreshed" (✓) state, hide entirely on scroll instead of collapsing
  let refreshState = 'refresh';
  function updateRefreshFab() {
    const isScrolled = window.scrollY > 60;
    if (refreshState === 'refreshed') {
      els.btn.classList.remove('scrolled');
      els.btn.classList.toggle('fab-hidden', isScrolled);
    } else {
      els.btn.classList.remove('fab-hidden');
      els.btn.classList.toggle('scrolled', isScrolled);
    }
  }

  function onScroll() { updateTodayBtn(); updateTodayPin(); updateRefreshFab(); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Which live rows are expanded — keyed by date+match so the state
  // survives the silent background re-renders
  const expandedLive = new Set();

  function render() {
    CURRENT_MATCHES = MATCHES;
    const savedDate = getTopmostVisibleDate();

    let rows = MATCHES.filter(m => {
      if (els.q.checked && !qualifies(m)) return false;
      if (els.team.value === '__TOP__') {
        if (!isTop(m)) return false;
      } else if (els.team.value && !teamsOf(m).includes(els.team.value)) {
        return false;
      }
      if (els.stage.value && m.group !== els.stage.value) return false;
      return true;
    });

    const playedCount = rows.filter(m => m.score && !m.live).length;
    const notPlayedCount = rows.length - playedCount;
    els.count.textContent = `${T('played')}: ${playedCount} · ${T('notPlayed')}: ${notPlayedCount}`;
    updateClearBtn();
    els.list.innerHTML = '';

    // Show standings table when a specific group stage (not knockout) is selected,
    // or when a specific team is selected (its group's table)
    const selGroup = els.stage.value;
    if (selGroup && !KNOCKOUT.has(selGroup)) {
      els.list.appendChild(buildStandingsTable(calcStandings(selGroup, MATCHES), selGroup));
    } else if (els.team.value && els.team.value !== '__TOP__') {
      const gm = MATCHES.find(m => !isKnockoutRow(m) && teamsOf(m).includes(els.team.value));
      if (gm) els.list.appendChild(buildStandingsTable(calcStandings(gm.group, MATCHES), gm.group));
    }

    if (rows.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty';
      emptyDiv.textContent = T('noMatches');
      els.list.appendChild(emptyDiv);
      return;
    }

    let curDay = null, group = null;
    let proj = null; // built lazily — only when an unresolved R32 row is rendered

    rows.forEach(m => {
      const conv = matchInTz(m);
      const displayDate = conv.date;
      const displayTime = conv.time;
      if (displayDate !== curDay) {
        curDay = displayDate;
        group = document.createElement('div');
        group.className = 'day-group';
        const h = document.createElement('div');
        h.className = 'day-header';
        h.dataset.date = displayDate;
        const dow = tDow(displayDate);
        h.textContent = dow ? `${tDate(displayDate)} · ${T('dayLabel', dow)}` : tDate(displayDate);
        group.appendChild(h);
        els.list.appendChild(group);
      }

      const nt   = noTime(m);
      const ko   = isKnockoutRow(m);
      const top  = isTop(m);
      const qual = qualifies(m);

      const d = document.createElement('div');
      const live = !!m.live;
      const played = !!m.score && !live;
      d.className = 'match' + (top ? ' top10' : '') + (qual ? ' qualifies' : '') + (nt && !played ? ' notime' : '') + (played ? ' played' : '') + (live ? ' live' : '');

      let rightCol;
      if (m.score) {
        // In RTL the first team sits on the right, so flip the digits to keep
        // each team's goals visually adjacent to its name
        const dispScore = lang === 'he' ? m.score.split('-').reverse().join('-') : m.score;
        rightCol = `<div class="m-score" dir="ltr">${dispScore}</div>`;
      } else if (nt) {
        rightCol = `<div class="m-time tbd-t">${T('timeTBD')}</div>`;
      } else {
        rightCol = `<div class="m-time">${displayTime}</div>`;
      }

      const stageBadge = ko  ? `<span class="badge stage">${tStage(m.group)}</span>` : T('groupLabel', m.group);
      const qualBadge  = qual ? `<span class="badge">${T('meetsCriteria')}</span>` : '';
      const finishedBadge = played ? `<span class="badge finished">${T('finished')}</span>` : '';
      const liveClock = live && m.ext?.clock ? ' · ' + m.ext.clock : '';
      const liveBadge = live ? `<span class="badge live" dir="ltr">${T('live')}${liveClock}</span>` : '';

      const starSymbol = qual ? '⭐' : (top ? '●' : '');

      // Red card marker next to the offending team's name while the match is live
      let teamsHtml = tMatchString(m.match);
      if (live && m.ext && (m.ext.reds1 || m.ext.reds2)) {
        const i = teamsHtml.indexOf(' - ');
        if (i > -1) {
          const rc = n => '<span class="red-card"></span>'.repeat(n || 0);
          teamsHtml = teamsHtml.slice(0, i) + rc(m.ext.reds1) + ' - ' + teamsHtml.slice(i + 3) + rc(m.ext.reds2);
        }
      }

      // Snapshot of who would fill the R32 placeholders if the group stage
      // ended right now (disappears once ESPN swaps in the real names)
      let projHtml = '';
      if (m.group === '32 הגדולות') {
        proj = proj || buildProjection(MATCHES);
        const sides = m.match.replace(/^משחק \d+: /, '').split(' - ')
          .map(p => projectedTeam(p, proj));
        if (sides[0] && sides[1]) {
          projHtml = `<div class="m-proj">${T('projLabel')} ${tTeam(sides[0])} - ${tTeam(sides[1])}</div>`;
        }
      }

      // Every row with ESPN data expands to a details slider
      const panel = buildExtPanel(m, MATCHES);
      const expandable = !!panel;
      const expKey = m.date + '@' + m.match;
      const isOpen = expandable && expandedLive.has(expKey);
      if (expandable) {
        d.classList.add('expandable');
        if (isOpen) d.classList.add('open');
        d.dataset.expKey = expKey;
      }

      // Future knockout rows (teams not yet set) open the matchup-scenario box,
      // exactly like clicking the slot in the Playoff Zone
      let probNum = null;
      if (ko && !expandable) {
        const n = (m.match.match(/^משחק (\d+)/) || [])[1];
        const body = m.match.replace(/^משחק \d+( \(הגמר!\))?: /, '');
        const ix = body.indexOf(' - ');
        const future = ix > -1 && !(isRealTeam(body.slice(0, ix).trim()) && isRealTeam(body.slice(ix + 3).trim()));
        if (future && n) { probNum = n; d.classList.add('prob-clickable'); d.dataset.num = n; }
      }

      d.innerHTML = `
        <div class="star">${starSymbol}</div>
        <div class="m-info">
          <div class="m-teams">${teamsHtml}</div>
          ${projHtml}
          <div class="m-meta">${stageBadge}${qualBadge}${finishedBadge}${liveBadge}</div>
        </div>
        ${rightCol}
        ${expandable ? '<span class="m-chevron">▾</span>' : (probNum ? `<span class="m-prob-cue" title="${T('probScenarios')}">📊</span>` : '')}
      `;
      group.appendChild(d);

      if (expandable) {
        const exp = document.createElement('div');
        exp.className = 'm-expand' + (isOpen ? ' open' : '');
        const inner = document.createElement('div');
        inner.className = 'm-expand-inner';
        inner.appendChild(panel);
        exp.appendChild(inner);
        group.appendChild(exp);
      }
    });

    if (savedDate) requestAnimationFrame(() => scrollToNearestDate(savedDate));
    requestAnimationFrame(onScroll);
    updateCollapseFab();
  }

  [els.q, els.team, els.stage].forEach(e => e.addEventListener('change', render));

  // Collapse-all FAB — appears once two or more row panels are open
  const collapseAllBtn = document.getElementById('collapseAllBtn');
  function updateCollapseFab() {
    collapseAllBtn.hidden = document.querySelectorAll('.m-expand.open').length < 2;
  }
  collapseAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.m-expand.open').forEach(x => x.classList.remove('open'));
    document.querySelectorAll('.match.expandable.open').forEach(x => x.classList.remove('open'));
    expandedLive.clear();
    updateCollapseFab();
  });

  // Future knockout rows open the same matchup-scenario box as the Playoff Zone
  els.list.addEventListener('click', e => {
    const probRow = e.target.closest('.match.prob-clickable');
    if (!probRow || !probRow.dataset.num) return;
    e.stopPropagation();
    const num = probRow.dataset.num;
    if (PLAYOFF.data) { openProbModal(num); return; }
    // Cold start — paint a "calculating…" state, then compute off the next frame
    const pm = document.getElementById('probModal');
    document.getElementById('probModalTitle').textContent = '';
    document.getElementById('probModalSlot').textContent = '';
    document.getElementById('probModalFoot').textContent = '';
    document.getElementById('probModalBody').innerHTML = `<div class="prob-empty">${T('probCalc')}</div>`;
    pm.hidden = false;
    requestAnimationFrame(() => setTimeout(() => { ensurePlayoffData(); openProbModal(num); }, 20));
  });

  // Toggle the details slider under a match row
  els.list.addEventListener('click', e => {
    const row = e.target.closest('.match.expandable');
    if (!row) return;
    const exp = row.nextElementSibling;
    if (!exp || !exp.classList.contains('m-expand')) return;
    const open = exp.classList.toggle('open');
    row.classList.toggle('open', open);
    if (open) expandedLive.add(row.dataset.expKey);
    else expandedLive.delete(row.dataset.expKey);
    updateCollapseFab();
  });

  // Time-window info modal — opened by clicking the hint link, closed via the ✕,
  // backdrop click, or Escape. A real overlay modal is far more robust on mobile
  // than a positioned tooltip.
  const winModal = document.getElementById('windowModal');
  const openWin = document.getElementById('openWindowInfo');
  const closeWin = document.getElementById('closeWindowInfo');
  if (winModal && openWin) {
    const show = () => { winModal.hidden = false; };
    const hide = () => { winModal.hidden = true; };
    openWin.addEventListener('click', show);
    closeWin.addEventListener('click', hide);
    winModal.addEventListener('click', e => { if (e.target === winModal) hide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  }

  // Top-teams info modal — opened from the "טופ נבחרות" hint link
  const topModal = document.getElementById('topModal');
  const openTop = document.getElementById('openTopInfo');
  const closeTop = document.getElementById('closeTopInfo');
  if (topModal && openTop) {
    const show = () => {
      const seen = new Set();
      const names = TOP.filter(t => {
        const en = TEAM_EN[t] || t;
        if (seen.has(en)) return false;
        seen.add(en);
        return true;
      });
      document.getElementById('topModalBody').innerHTML =
        names.map(t => `<div class="legend-line">⭐ ${tTeam(t)}</div>`).join('');
      topModal.hidden = false;
    };
    const hide = () => { topModal.hidden = true; };
    openTop.addEventListener('click', show);
    closeTop.addEventListener('click', hide);
    topModal.addEventListener('click', e => { if (e.target === topModal) hide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  }

  // Golden-boot modal — opened by clicking a scorer's name in a row panel.
  // Shows the top 4 plus the clicked player at his rank (or the top 5 if he's in it).
  const scorerModal = document.getElementById('scorerModal');
  const closeScorer = document.getElementById('closeScorerModal');
  if (scorerModal) {
    const hide = () => { scorerModal.hidden = true; };
    els.list.addEventListener('click', e => {
      const btn = e.target.closest('.scorer-link');
      if (!btn || !TOP_SCORERS.length) return;
      e.stopPropagation();
      const pid = btn.dataset.pid;
      const idx = TOP_SCORERS.findIndex(p => p.id === pid);
      if (idx === -1) return;
      const rank = p => 1 + TOP_SCORERS.filter(q => q.goals > p.goals).length;
      const shown = idx < 5
        ? TOP_SCORERS.slice(0, 5)
        : [...TOP_SCORERS.slice(0, 4), TOP_SCORERS[idx]];
      document.getElementById('scorerModalBody').innerHTML = shown.map(p => `
        <div class="sc-row${p.id === pid ? ' sc-me' : ''}">
          <span class="sc-rank">${rank(p)}</span>
          <span class="sc-name">${TEAM_FLAG[p.team] || ''} ${pName(p.player, p.team)}</span>
          <span class="sc-goals">${p.goals} ⚽</span>
        </div>`).join('');
      scorerModal.hidden = false;
    });
    closeScorer.addEventListener('click', hide);
    scorerModal.addEventListener('click', e => { if (e.target === scorerModal) hide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  }

  // ── Playoff Zone view ──
  const playoffView = document.getElementById('playoffView');
  const playoffBtn = document.getElementById('playoffBtn');
  const playoffBack = document.getElementById('playoffBack');
  const probModal = document.getElementById('probModal');
  function ensurePlayoffData() { PLAYOFF.data = computePlayoff(MATCHES); }
  // Keep the run warm so opening a scenario box is instant (compute ≈150ms)
  function warmPlayoff() { if (PLAYOFF.data) return; setTimeout(() => { if (!PLAYOFF.data) { try { ensurePlayoffData(); } catch (e) { console.warn('playoff warm-up failed', e); } } }, 400); }
  function openPlayoff() {
    document.body.classList.add('playoff-mode');
    playoffView.hidden = false;
    window.scrollTo(0, 0);
    renderBracket(); // paints the "calculating…" state instantly when data isn't ready
    if (!PLAYOFF.data) requestAnimationFrame(() => setTimeout(() => { ensurePlayoffData(); renderBracket(); }, 20));
  }
  function closePlayoff() { document.body.classList.remove('playoff-mode'); playoffView.hidden = true; PLAYOFF.zoom = 1; }
  // Results changed → drop the cached run; recompute now if the view is open
  function playoffInvalidate() {
    PLAYOFF.data = null;
    if (playoffView && !playoffView.hidden) { ensurePlayoffData(); renderBracket(); }
  }
  if (playoffBtn) playoffBtn.addEventListener('click', openPlayoff);
  if (playoffBack) playoffBack.addEventListener('click', closePlayoff);
  if (playoffView) playoffView.addEventListener('click', e => {
    const card = e.target.closest('.bk-match.bk-clickable');
    if (card && card.dataset.num) openProbModal(card.dataset.num);
  });
  // Team filters — three custom dropdowns (single-team highlight + a pair "do they meet")
  const PF_PANELS = ['playoffFilterPanel', 'playoffPairPanelA', 'playoffPairPanelB'];
  const PF_TRIGGERS = ['playoffFilterTrigger', 'playoffPairTriggerA', 'playoffPairTriggerB'];
  function closeAllPlayoffPanels() {
    PF_PANELS.forEach(id => { const p = document.getElementById(id); if (p) p.hidden = true; });
    PF_TRIGGERS.forEach(id => { const t = document.getElementById(id); if (t) t.setAttribute('aria-expanded', 'false'); });
  }
  const anyPlayoffPanelOpen = () => PF_PANELS.some(id => { const p = document.getElementById(id); return p && !p.hidden; });
  function openPlayoffPanel(triggerId) {
    const t = document.getElementById(triggerId);
    const p = t && t.parentElement.querySelector('.cs-panel');
    if (p) { p.hidden = false; t.setAttribute('aria-expanded', 'true'); }
  }
  function wirePlayoffDropdown(triggerId, panelId, pick) {
    const trigger = document.getElementById(triggerId), panel = document.getElementById(panelId);
    if (!trigger || !panel) return;
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = panel.hidden;
      closeAllPlayoffPanels();
      if (willOpen) { panel.hidden = false; trigger.setAttribute('aria-expanded', 'true'); }
    });
    panel.addEventListener('click', e => {
      const item = e.target.closest('.cs-item');
      if (!item) return;
      // Own this click — rebuilding the panel detaches the item, so the document
      // outside-click handler would otherwise misread it and re-close the panel
      e.stopPropagation();
      const next = pick(item.dataset.value); // pick may return the next dropdown to auto-open
      closeAllPlayoffPanels();
      if (next) openPlayoffPanel(next);
    });
  }
  wirePlayoffDropdown('playoffFilterTrigger', 'playoffFilterPanel', v => {
    PLAYOFF.filter = v;
    if (v) { PLAYOFF.pairA = ''; PLAYOFF.pairB = ''; } // single + pair are mutually exclusive
    buildPlayoffFilterPanel(); applyBracketFilter(); scrollToFirstHighlight();
  });
  // After picking one side of the pair, jump straight to the other empty side
  wirePlayoffDropdown('playoffPairTriggerA', 'playoffPairPanelA', v => {
    PLAYOFF.pairA = v; if (v) PLAYOFF.filter = '';
    buildPlayoffFilterPanel(); applyBracketFilter(); scrollToFirstHighlight();
    return v && !PLAYOFF.pairB ? 'playoffPairTriggerB' : null;
  });
  wirePlayoffDropdown('playoffPairTriggerB', 'playoffPairPanelB', v => {
    PLAYOFF.pairB = v; if (v) PLAYOFF.filter = '';
    buildPlayoffFilterPanel(); applyBracketFilter(); scrollToFirstHighlight();
    return v && !PLAYOFF.pairA ? 'playoffPairTriggerA' : null;
  });
  document.addEventListener('click', e => { if (!e.target.closest('.pv-select')) closeAllPlayoffPanels(); });

  // ── Pinch-to-zoom the bracket (two fingers, touch devices) ──
  const ZOOM_MAX = 3;
  // Max zoom-out = the scale at which the whole bracket fits on screen
  function fitZoom() {
    const sc = document.getElementById('bracket');
    if (!sc || !PLAYOFF.natW || !PLAYOFF.natH) return 0.4;
    const availW = sc.clientWidth || window.innerWidth;
    const availH = Math.max(220, window.innerHeight - 120); // room left below the header + filters
    return Math.max(0.15, Math.min(1, Math.min(availW / PLAYOFF.natW, availH / PLAYOFF.natH)));
  }
  let pinchDist0 = 0, pinchZoom0 = 1;
  const touchDist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  playoffView.addEventListener('touchstart', e => {
    if (e.touches.length === 2) { pinchDist0 = touchDist(e.touches); pinchZoom0 = PLAYOFF.zoom; }
  }, { passive: true });
  playoffView.addEventListener('touchmove', e => {
    if (e.touches.length !== 2 || !pinchDist0) return;
    const el = playoffView.querySelector('.bracket');
    if (!el) return;
    e.preventDefault(); // we own the pinch; stop native page zoom/scroll
    const z = Math.min(ZOOM_MAX, Math.max(fitZoom(), pinchZoom0 * (touchDist(e.touches) / pinchDist0)));
    PLAYOFF.zoom = z;
    el.style.zoom = z;
  }, { passive: false });
  playoffView.addEventListener('touchend', e => { if (e.touches.length < 2) pinchDist0 = 0; }, { passive: true });

  const playoffClear = document.getElementById('playoffClear');
  if (playoffClear) playoffClear.addEventListener('click', () => {
    PLAYOFF.filter = ''; PLAYOFF.pairA = ''; PLAYOFF.pairB = '';
    closeAllPlayoffPanels();
    buildPlayoffFilterPanel(); applyBracketFilter();
  });

  // Scenario-mode toggle: current status (default) ↔ most-likely bracket
  const scenarioModeToggle = document.getElementById('scenarioModeToggle');
  if (scenarioModeToggle) {
    scenarioModeToggle.checked = PLAYOFF.scenarioMode === 'likely';
    scenarioModeToggle.addEventListener('change', () => {
      PLAYOFF.scenarioMode = scenarioModeToggle.checked ? 'likely' : 'current';
      renderBracket();
    });
  }

  // Prediction-accuracy popup — opened by the descending-bars icon next to any
  // "likely scorelines" heading (schedule expand panel or playoff scenario box)
  const predAccModal = document.getElementById('predAccModal');
  const paRow = (label, n, total, other) => {
    const pct = total ? Math.round(n / total * 100) : 0;
    return `<div class="pa-row${other ? ' pa-other' : ''}">
      <span class="pa-label">${label}</span>
      <span class="pa-bar-wrap"><span class="pa-bar" style="width:${pct}%"></span></span>
      <span class="pa-val">${n} · ${pct}%</span>
    </div>`;
  };
  function openPredAcc() {
    const titleEl = document.getElementById('predAccTitle');
    const subEl = document.getElementById('predAccSub');
    const body = document.getElementById('predAccBody');
    const acc = predictionAccuracy(CURRENT_MATCHES);
    if (!acc.total) {
      titleEl.textContent = T('predAccTitle');
      subEl.textContent = '';
      body.innerHTML = `<div class="prob-empty">${T('predAccNone')}</div>`;
      predAccModal.hidden = false;
      return;
    }
    // Slide 1 — how often each prediction rank matched the actual result
    const slide1 = `<div class="pa-slide">${
      paRow(T('predAccP1'), acc.r1, acc.total) + paRow(T('predAccP2'), acc.r2, acc.total) +
      paRow(T('predAccP3'), acc.r3, acc.total) + paRow(T('predAccOther'), acc.other, acc.total, true)
    }<div class="pa-total">${T('predAccTotal', acc.total)}</div></div>`;
    // Slide 2 — most common actual scorelines (top 6 + all the rest)
    const cr = commonResults(CURRENT_MATCHES);
    const top6 = cr.arr.slice(0, 6);
    const restN = cr.arr.slice(6).reduce((s, r) => s + r.n, 0);
    const slide2 = `<div class="pa-slide">${
      top6.map(r => paRow(`<span class="pa-score" dir="ltr">${r.score.replace('-', '–')}</span>`, r.n, cr.total)).join('') +
      paRow(T('restRow'), restN, cr.total, true)
    }<div class="pa-total">${T('predAccTotal', cr.total)}</div></div>`;

    body.innerHTML = `<div class="pa-carousel">${slide1}${slide2}</div>
      <div class="pa-dots"><span class="pa-dot"></span><span class="pa-dot"></span></div>
      <div class="pa-swipe-hint">${T('swipeHint')}</div>`;
    const carousel = body.querySelector('.pa-carousel');
    const slides = carousel.querySelectorAll('.pa-slide');
    const dots = body.querySelectorAll('.pa-dot');
    const titles = [T('predAccTitle'), T('commonResTitle')];
    const subs = [T('predAccDesc'), T('commonResDesc')];
    const apply = idx => {
      titleEl.textContent = titles[idx];
      subEl.textContent = subs[idx];
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    };
    carousel.addEventListener('scroll', () => apply(Math.min(1, Math.round(Math.abs(carousel.scrollLeft) / (carousel.clientWidth || 1)))), { passive: true });
    dots.forEach((d, i) => d.addEventListener('click', () => slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })));
    apply(0);
    predAccModal.hidden = false;
  }
  if (predAccModal) {
    document.addEventListener('click', e => { if (e.target.closest('.sl-stats-btn')) { e.stopPropagation(); openPredAcc(); } });
    document.getElementById('closePredAcc').addEventListener('click', () => { predAccModal.hidden = true; });
    predAccModal.addEventListener('click', e => { if (e.target === predAccModal) predAccModal.hidden = true; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !predAccModal.hidden) predAccModal.hidden = true; });
  }

  if (probModal) {
    const hideProb = () => { probModal.hidden = true; };
    document.getElementById('closeProbModal').addEventListener('click', hideProb);
    probModal.addEventListener('click', e => { if (e.target === probModal) hideProb(); });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (!probModal.hidden) hideProb();
      else if (anyPlayoffPanelOpen()) closeAllPlayoffPanels();
      else if (playoffView && !playoffView.hidden) closePlayoff();
    });
  }

  const R_ICONS = { refresh: '🔄', refreshing: '⏳', refreshed: '✓', refreshErr: '✗' };
  function setRefreshState(state) {
    refreshState = state;
    const ic = els.btn.querySelector('.r-icon');
    const tx = els.btn.querySelector('.r-text');
    if (ic) ic.textContent = R_ICONS[state];
    if (tx) tx.textContent = T(state);
    updateRefreshFab(); // re-evaluate sticky/hidden based on new state
  }
  const SUCCESS_MS = 5 * 60 * 1000; // keep the ✓ visible for 5 minutes
  let refreshTimer = null;
  function markRefreshed() {
    setRefreshState('refreshed');
    refreshTimer = setTimeout(() => { setRefreshState('refresh'); refreshTimer = null; }, SUCCESS_MS);
  }
  async function doRefresh() {
    if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null; }
    els.btn.disabled = true;
    setRefreshState('refreshing');
    try {
      const data = await loadData();
      // Verify the refresh actually returned valid match data before declaring success
      if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid or empty data');
      MATCHES = data;
      rebuildDropdowns();
      render();
      playoffInvalidate();
      warmPlayoff();
      els.btn.disabled = false;
      markRefreshed();
    } catch (e) {
      console.error(e);
      setRefreshState('refreshErr');
      refreshTimer = setTimeout(() => { setRefreshState('refresh'); els.btn.disabled = false; refreshTimer = null; }, 2000);
    }
  }
  els.btn.addEventListener('click', doRefresh);
  // The page load itself fetched fresh data — reflect that with the ✓ state
  markRefreshed();
  // Re-fetch fresh results whenever the user returns to the tab/app
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') doRefresh();
  });
  // Silent background poll — keeps live scores ticking without touching the button
  setInterval(async () => {
    if (document.visibilityState !== 'visible') return;
    try {
      const data = await loadData();
      if (Array.isArray(data) && data.length > 0) {
        MATCHES = data;
        render();
        playoffInvalidate();
      }
    } catch (e) {
      console.warn('Background score update failed:', e);
    }
  }, 60 * 1000);
  // Freshness stamp next to the live-odds title, ticking once a second
  setInterval(() => {
    if (!SCORES_AT) return;
    const s = Math.max(0, Math.round((Date.now() - SCORES_AT) / 1000));
    document.querySelectorAll('.odds-updated').forEach(el => { el.textContent = T('oddsUpdated', s); });
  }, 1000);

  // Window labels — adapt to weekend convention of selected tz
  function getWindowLabels() {
    const il = currentTz === 'il';
    if (il) {
      return lang === 'he'
        ? { a: "ראשון–חמישי", b: "שישי",  c: "שבת",  short: "א'–ה'" }
        : { a: "Sun–Thu",      b: "Friday", c: "Saturday", short: "Sun–Thu" };
    }
    return lang === 'he'
      ? { a: "שני–שישי", b: "שבת", c: "ראשון", short: "ב'–ו'" }
      : { a: "Mon–Fri",  b: "Saturday", c: "Sunday", short: "Mon–Fri" };
  }
  function applyWindowModalBody() {
    const body = document.querySelector('#windowModal .modal-body');
    if (!body) return;
    const w = getWindowLabels();
    body.innerHTML = `
      <div class="win-row"><span>${w.a}</span><span>14:00–21:00</span></div>
      <div class="win-row"><span>${w.b}</span><span>12:00–23:00</span></div>
      <div class="win-row"><span>${w.c}</span><span>07:00–21:00</span></div>
    `;
  }
  function getLegendHtml() {
    const w = getWindowLabels();
    const winLine = lang === 'he'
      ? `<b>חלון השעות:</b> ${w.short} 14:00–21:00 · ${w.b} 12:00–23:00 · ${w.c} 07:00–21:00`
      : `<b>Time window:</b> ${w.short} 14:00–21:00 · ${w.b.substring(0,3)} 12:00–23:00 · ${w.c.substring(0,3)} 07:00–21:00`;
    return lang === 'he'
      ? `⭐ = נבחרת טופ שעומדת בחלון השעות · פס צהוב = משתתפת נבחרת טופ<br>מסגרת ירוקה = עומד בכל התנאים<br>${winLine}`
      : `⭐ = Top team in the time window · Yellow bar = top team playing<br>Green border = meets all criteria<br>${winLine}`;
  }

  // Apply static (HTML) translations using data-i18n attributes
  function applyStaticI18n() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      // Skip elements that are dynamically rebuilt elsewhere
      if (el.closest('#windowModal .modal-body')) return;
      el.textContent = T(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = T(el.dataset.i18nHtml);
    });
    // Override legend with tz-aware version
    const legend = document.querySelector('.legend');
    if (legend) legend.innerHTML = getLegendHtml();
    // Rebuild tz-aware window modal body
    applyWindowModalBody();
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.textContent = lang === 'he' ? 'EN' : 'עב';
    const tzBtn = document.getElementById('tzBtn');
    if (tzBtn) tzBtn.textContent = tzLabel(currentTz);
    // Re-apply the refresh button's current state (icon + translated text)
    setRefreshState(refreshState);
  }
  applyStaticI18n();

  // Timezone modal
  const tzModal = document.getElementById('tzModal');
  const tzBtn = document.getElementById('tzBtn');
  const closeTzModal = document.getElementById('closeTzModal');
  const tzOptions = document.getElementById('tzOptions');
  function buildTzOptions() {
    tzOptions.innerHTML = '';
    TIMEZONES.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tz-option' + (t.id === currentTz ? ' selected' : '');
      b.dataset.tz = t.id;
      b.textContent = t[lang] || t.he;
      tzOptions.appendChild(b);
    });
  }
  tzBtn.addEventListener('click', () => { buildTzOptions(); tzModal.hidden = false; });
  closeTzModal.addEventListener('click', () => { tzModal.hidden = true; });
  tzModal.addEventListener('click', e => { if (e.target === tzModal) tzModal.hidden = true; });
  tzOptions.addEventListener('click', e => {
    const opt = e.target.closest('.tz-option');
    if (!opt) return;
    currentTz = opt.dataset.tz;
    localStorage.setItem('tz', currentTz);
    tzModal.hidden = true;
    applyStaticI18n();
    render();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') tzModal.hidden = true; });

  // Language toggle
  const langBtn = document.getElementById('langToggle');
  langBtn.addEventListener('click', () => {
    lang = lang === 'he' ? 'en' : 'he';
    localStorage.setItem('lang', lang);
    currentTz = lang === 'en' ? 'uk' : 'il';
    localStorage.setItem('tz', currentTz);
    applyStaticI18n();
    rebuildDropdowns();
    render();
    if (playoffView && !playoffView.hidden) renderBracket();
  });

  render();
  warmPlayoff();

  // Landing quick-nav: two buttons shown on arrival — "scroll to top" (right)
  // and the playoff zone (left). They fade once the user scrolls ~5cm away
  // from the landing position, leaving the top row clean until then.
  const landingNav = document.getElementById('landingNav');
  const FIVE_CM = 189; // 5cm ≈ 189 CSS px
  let landingY = 0, landingDismissed = false;
  function dismissLanding() {
    if (!landingNav || landingDismissed) return;
    landingDismissed = true;
    landingNav.classList.add('fade');
    document.body.classList.remove('landing-top');
    setTimeout(() => { landingNav.hidden = true; }, 340);
  }
  function onLandingScroll() {
    if (landingDismissed) return;
    if (Math.abs(window.scrollY - landingY) > FIVE_CM) dismissLanding();
  }
  document.getElementById('landingTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.getElementById('landingPlayoff')?.addEventListener('click', () => { dismissLanding(); openPlayoff(); });
  window.addEventListener('scroll', onLandingScroll, { passive: true });

  // On first load, jump straight to today's matches, then arm the landing nav.
  // setTimeout (not rAF) so it still runs if the tab loads in the background.
  setTimeout(() => {
    const t = findTodayHeader();
    if (t) window.scrollTo({ top: Math.max(0, window.scrollY + t.getBoundingClientRect().top - 58), behavior: 'instant' });
    landingY = window.scrollY;
    if (landingNav) { landingNav.hidden = false; landingNav.classList.remove('fade'); document.body.classList.add('landing-top'); }
  }, 0);
}

init();

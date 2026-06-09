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
    meetsCriteria: 'עומד בתנאים', finished: 'סיום',
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
    meetsCriteria: 'Meets criteria', finished: 'Final',
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
  if (lang === 'he') return s;
  const ko = s.match(/^משחק (\d+)( \(הגמר!\))?: (.+)$/);
  if (ko) {
    const [, num, final, rest] = ko;
    return `Match ${num}${final ? ' (Final!)' : ''}: ${rest.split(' - ').map(tMatchPart).join(' - ')}`;
  }
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
    .sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf ||
      (SEED[a.name] || 99) - (SEED[b.name] || 99)
    );
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

async function loadData() {
  const res = await fetch('/data/matches.json?t=' + Date.now());
  if (!res.ok) throw new Error('Network error: ' + res.status);
  return await res.json();
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

  function render() {
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

    const playedCount = rows.filter(m => m.score).length;
    const notPlayedCount = rows.length - playedCount;
    els.count.textContent = `${T('played')}: ${playedCount} · ${T('notPlayed')}: ${notPlayedCount}`;
    updateClearBtn();
    els.list.innerHTML = '';

    // Show standings table when a specific group stage (not knockout) is selected
    const selGroup = els.stage.value;
    if (selGroup && !KNOCKOUT.has(selGroup)) {
      els.list.appendChild(buildStandingsTable(calcStandings(selGroup, MATCHES), selGroup));
    }

    if (rows.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty';
      emptyDiv.textContent = T('noMatches');
      els.list.appendChild(emptyDiv);
      return;
    }

    let curDay = null, group = null;
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
      const played = !!m.score;
      d.className = 'match' + (top ? ' top10' : '') + (qual ? ' qualifies' : '') + (nt && !played ? ' notime' : '') + (played ? ' played' : '');

      let rightCol;
      if (played) {
        rightCol = `<div class="m-score">${m.score}</div>`;
      } else if (nt) {
        rightCol = `<div class="m-time tbd-t">${T('timeTBD')}</div>`;
      } else {
        rightCol = `<div class="m-time">${displayTime}</div>`;
      }

      const stageBadge = ko  ? `<span class="badge stage">${tStage(m.group)}</span>` : T('groupLabel', m.group);
      const qualBadge  = qual ? `<span class="badge">${T('meetsCriteria')}</span>` : '';
      const finishedBadge = played ? `<span class="badge finished">${T('finished')}</span>` : '';

      const starSymbol = qual ? '⭐' : (top ? '●' : '');

      d.innerHTML = `
        <div class="star">${starSymbol}</div>
        <div class="m-info">
          <div class="m-teams">${tMatchString(m.match)}</div>
          <div class="m-meta">${stageBadge}${qualBadge}${finishedBadge}</div>
        </div>
        ${rightCol}
      `;
      group.appendChild(d);
    });

    if (savedDate) requestAnimationFrame(() => scrollToNearestDate(savedDate));
    requestAnimationFrame(onScroll);
  }

  [els.q, els.team, els.stage].forEach(e => e.addEventListener('change', render));

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
  els.btn.addEventListener('click', async () => {
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
      els.btn.disabled = false;
      setRefreshState('refreshed');
      refreshTimer = setTimeout(() => { setRefreshState('refresh'); refreshTimer = null; }, SUCCESS_MS);
    } catch (e) {
      console.error(e);
      setRefreshState('refreshErr');
      refreshTimer = setTimeout(() => { setRefreshState('refresh'); els.btn.disabled = false; refreshTimer = null; }, 2000);
    }
  });

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
  });

  render();
}

init();

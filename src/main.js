const TOP = [
  "ספרד","צרפת","אנגליה","ארגנטינה","ברזיל","פורטוגל",
  "גרמניה","הולנד","בלגיה","נורווגיה","אורוגוואי","אורוגואי"
];


const KNOCKOUT = new Set([
  "32 הגדולות","שמינית גמר","רבע גמר","חצי גמר","מקום 3","גמר"
]);

const DOW = {
  "11 ביוני":"חמישי","12 ביוני":"שישי","13 ביוני":"שבת","14 ביוני":"ראשון",
  "15 ביוני":"שני","16 ביוני":"שלישי","17 ביוני":"רביעי","18 ביוני":"חמישי",
  "19 ביוני":"שישי","20 ביוני":"שבת","21 ביוני":"ראשון","22 ביוני":"שני",
  "23 ביוני":"שלישי","24 ביוני":"רביעי","25 ביוני":"חמישי",
  "26 ביוני":"שישי","27 ביוני":"שבת",
  "28 ביוני":"ראשון","29 ביוני":"שני","30 ביוני":"שלישי",
  "01 ביולי":"רביעי","02 ביולי":"חמישי","03 ביולי":"שישי",
  "04 ביולי":"שבת","05 ביולי":"ראשון","06 ביולי":"שני","07 ביולי":"שלישי",
  "09 ביולי":"חמישי","10 ביולי":"שישי","11 ביולי":"שבת",
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
  const day = DOW[m.date];
  const mins = toMin(m.time);
  if (day === "שישי") return mins >= 12 * 60 && mins <= 23 * 60;
  if (day === "שבת")  return mins >= 7 * 60  && mins <= 21 * 60;
  return mins >= 14 * 60 && mins <= 21 * 60;
}

function qualifies(m) { return !noTime(m) && isTop(m) && inWindow(m); }

const DATE_ORDER = Object.keys(DOW);

function getTopmostVisibleDate() {
  if (window.scrollY < 100) return null;
  const sticky = document.querySelector('.sticky-top11');
  const stickyBottom = sticky ? sticky.getBoundingClientRect().bottom : 60;
  let result = null;
  for (const h of document.querySelectorAll('.day-header')) {
    if (h.getBoundingClientRect().top <= stickyBottom + 4) result = h.dataset.date;
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
  const sticky = document.querySelector('.sticky-top11');
  const offset = sticky ? sticky.offsetHeight : 50;
  const y = window.scrollY + found.getBoundingClientRect().top - offset - 8;
  window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
}

async function loadData() {
  const res = await fetch('/data/matches.json?t=' + Date.now());
  if (!res.ok) throw new Error('Network error: ' + res.status);
  return await res.json();
}

function fmtTime(d) {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

async function init() {
  let MATCHES = await loadData();

  const teamSel = document.getElementById('filterTeam');
  const stageSel = document.getElementById('filterStage');

  function rebuildDropdowns() {
    const prevTeam = teamSel.value;
    const prevStage = stageSel.value;

    teamSel.innerHTML = '<option value="">כל הנבחרות</option>';
    const allTeams = new Set();
    MATCHES.forEach(m => teamsOf(m).forEach(t => allTeams.add(t)));
    [...allTeams].sort((a, b) => a.localeCompare(b, 'he')).forEach(t => {
      const o = document.createElement('option');
      o.value = t; o.textContent = t;
      teamSel.appendChild(o);
    });
    if ([...teamSel.options].some(o => o.value === prevTeam)) teamSel.value = prevTeam;

    stageSel.innerHTML = '<option value="">כל השלבים</option>';
    [...new Set(MATCHES.map(m => m.group))].forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s;
      stageSel.appendChild(o);
    });
    if ([...stageSel.options].some(o => o.value === prevStage)) stageSel.value = prevStage;
  }

  rebuildDropdowns();

  const els = {
    q:    document.getElementById('filterQualify'),
    top:  document.getElementById('filterTop10'),
    hide: document.getElementById('hideTbd'),
    team: teamSel,
    stage: stageSel,
    list: document.getElementById('list'),
    count: document.getElementById('count'),
    updated: document.getElementById('lastUpdated'),
    btn: document.getElementById('refreshBtn'),
  };

  function render() {
    const savedDate = getTopmostVisibleDate();

    let rows = MATCHES.filter(m => {
      if (els.q.checked    && !qualifies(m))                        return false;
      if (els.top.checked  && !isTop(m))                            return false;
      if (els.hide.checked && noTime(m))                            return false;
      if (els.team.value   && !teamsOf(m).includes(els.team.value)) return false;
      if (els.stage.value  && m.group !== els.stage.value)          return false;
      return true;
    });

    els.count.textContent = rows.length + ' רשומות';
    els.list.innerHTML = '';

    if (rows.length === 0) {
      els.list.innerHTML = '<div class="empty">אין משחקים שעונים על הסינון 🤷</div>';
      return;
    }

    let curDay = null, group = null;
    rows.forEach(m => {
      if (m.date !== curDay) {
        curDay = m.date;
        group = document.createElement('div');
        group.className = 'day-group';
        const h = document.createElement('div');
        h.className = 'day-header';
        h.dataset.date = m.date;
        h.textContent = DOW[m.date] ? `${m.date} · יום ${DOW[m.date]}` : m.date;
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
        rightCol = '<div class="m-time tbd-t">שעה טרם נקבעה</div>';
      } else {
        rightCol = `<div class="m-time">${m.time}</div>`;
      }

      const stageBadge = ko  ? `<span class="badge stage">${m.group}</span>` : `בית ${m.group}`;
      const qualBadge  = qual ? '<span class="badge">עומד בתנאים</span>' : '';
      const finishedBadge = played ? '<span class="badge finished">סיום</span>' : '';

      const starSymbol = qual ? '⭐' : (top ? '●' : '');

      d.innerHTML = `
        <div class="star">${starSymbol}</div>
        <div class="m-info">
          <div class="m-teams">${m.match}</div>
          <div class="m-meta">${stageBadge}${qualBadge}${finishedBadge}</div>
        </div>
        ${rightCol}
      `;
      group.appendChild(d);
    });

    if (savedDate) requestAnimationFrame(() => scrollToNearestDate(savedDate));
  }

  [els.q, els.top, els.hide, els.team, els.stage].forEach(e => e.addEventListener('change', render));

  // Mobile tap: toggle tooltip on the filter ⭐
  const filterStar = document.querySelector('.has-tip');
  if (filterStar) {
    filterStar.addEventListener('click', e => {
      e.stopPropagation();
      filterStar.classList.toggle('tip-open');
    });
    document.addEventListener('click', () => filterStar.classList.remove('tip-open'));
  }

  function setUpdatedNow() {
    els.updated.textContent = '· עודכן ב-' + fmtTime(new Date());
  }

  els.btn.addEventListener('click', async () => {
    const original = els.btn.textContent;
    els.btn.disabled = true;
    els.btn.textContent = '⏳ מעדכן...';
    try {
      MATCHES = await loadData();
      rebuildDropdowns();
      render();
      setUpdatedNow();
      els.btn.textContent = '✓ עודכן';
    } catch (e) {
      els.btn.textContent = '✗ שגיאה';
      console.error(e);
    } finally {
      setTimeout(() => {
        els.btn.textContent = original;
        els.btn.disabled = false;
      }, 1500);
    }
  });

  setUpdatedNow();
  render();
}

init();

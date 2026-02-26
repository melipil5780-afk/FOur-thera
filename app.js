// ═══════════════════════════════════════════════════════════
// SAFE ANXIETY CURRICULUM — App Logic
// ═══════════════════════════════════════════════════════════

(function() {
‘use strict’;

const { PHASES, CURRICULUM, SOS_SKILLS, getReviewSchedule } = window.SAFE_DATA;

// ── State ────────────────────────────────────────────────────
const DEFAULT_STATE = {
currentWeek: 1,
currentDay: 1,
completedWorksheets: {},    // “w1d1”: { responses:{}, completedAt, intention }
completedWeeks: [],         // [1, 2, 3, …]
readinessChecks: {},        // { 1: “yes”|“proceed”|“repeat” }
reviews: [],                // [{ weekNum, type, dueDate, prompt, done }]
sosLog: [],                 // [{ ts, skill, helped }]
journeyLog: [],             // [{ week, weekTitle, anchor, ts }]
anchorPrompts: {},          // { weekNum: text }
lastOpened: null,
popupShownFor: null,        // “w1d2” — avoid re-showing same popup
startedAt: Date.now(),
};

let STATE = loadState();
let currentScreen = ‘today’;
let worksheetState = null; // active worksheet session

function loadState() {
try {
const s = localStorage.getItem(‘safe_state_v2’);
return s ? { …DEFAULT_STATE, …JSON.parse(s) } : { …DEFAULT_STATE };
} catch(e) { return { …DEFAULT_STATE }; }
}

function saveState() {
try { localStorage.setItem(‘safe_state_v2’, JSON.stringify(STATE)); } catch(e) {}
}

// ── DOM refs ─────────────────────────────────────────────────
const $root      = document.getElementById(‘screen-root’);
const $topBar    = document.getElementById(‘top-bar’);
const $topTitle  = document.getElementById(‘top-title’);
const $btnBack   = document.getElementById(‘btn-back’);
const $navBtns   = document.querySelectorAll(’.nav-btn’);
const $weeklyModal    = document.getElementById(‘modal-weekly’);
const $readinessModal = document.getElementById(‘modal-readiness’);
const $celebrateModal = document.getElementById(‘modal-celebrate’);
const $infoModal      = document.getElementById(‘modal-info’);

// ── Nav routing ──────────────────────────────────────────────
$navBtns.forEach(btn => {
btn.addEventListener(‘click’, () => {
const scr = btn.dataset.screen;
const S = window.SAFE_SOUND;
if (S) scr === ‘sos’ ? S.playSOSActivate() : S.playNavTap();
navigate(scr);
});
});

function navigate(screen, data) {
currentScreen = screen;
$navBtns.forEach(b => b.classList.toggle(‘active’, b.dataset.screen === screen));
const titles = { today:‘SAFE’, map:‘Week Map’, sos:‘Right Now’, journey:‘My Journey’ };
$topTitle.textContent = titles[screen] || ‘SAFE’;
$btnBack.classList.add(‘hidden’);
worksheetState = null;
// Scene-appropriate ambient
const S = window.SAFE_SOUND;
if (S) {
if (screen === ‘sos’) S.playSOSAmbient();
else if (screen === ‘today’ || screen === ‘journey’) S.playHomeAmbient();
else S.stopAmbient(1.5);
}
renderScreen(screen, data);
}

function showWorksheet(weekNum, dayNum) {
const wkData = CURRICULUM[weekNum - 1];
const wsData = wkData.worksheets[dayNum - 1];
worksheetState = { weekNum, dayNum, wkData, wsData, responses: {}, saved: false };
$topTitle.textContent = `Week ${weekNum} · ${wsData.day}`;
$btnBack.classList.remove(‘hidden’);
renderWorksheet();
}

$btnBack.addEventListener(‘click’, () => {
if (currentScreen === ‘worksheet’) {
navigate(worksheetState?._fromMap ? ‘map’ : ‘today’);
} else {
navigate(‘today’);
}
});

document.getElementById(‘btn-info-open’).addEventListener(‘click’, () => {
$infoModal.classList.remove(‘hidden’);
});
document.getElementById(‘btn-info-close’).addEventListener(‘click’, () => {
$infoModal.classList.add(‘hidden’);
});
$infoModal.addEventListener(‘click’, e => { if(e.target === $infoModal) $infoModal.classList.add(‘hidden’); });

// ── Helpers ──────────────────────────────────────────────────
function wsKey(w, d) { return `w${w}d${d}`; }

function isCompleted(w, d) { return !!STATE.completedWorksheets[wsKey(w, d)]; }

function isWeekUnlocked(weekNum) {
if (weekNum <= 1) return true;
return STATE.completedWeeks.includes(weekNum - 1) ||
STATE.currentWeek >= weekNum;
}

function getPhaseClass(phase) { return (PHASES[phase] || PHASES.SEE).cls; }

function getPhaseColor(phase) { return (PHASES[phase] || PHASES.SEE).color; }

function dueReviews() {
const now = Date.now();
return STATE.reviews.filter(r => !r.done && r.dueDate <= now);
}

function nextWorksheet() {
// Returns { weekNum, dayNum } of the current task
const w = STATE.currentWeek;
const d = STATE.currentDay;
return { weekNum: w, dayNum: d };
}

function el(tag, cls, html) {
const e = document.createElement(tag);
if (cls) e.className = cls;
if (html !== undefined) e.innerHTML = html;
return e;
}

function fmt(ts) {
const d = new Date(ts);
return d.toLocaleDateString(‘en-US’, { month:‘short’, day:‘numeric’, year:‘numeric’ });
}

// ── SCREEN: TODAY ─────────────────────────────────────────────
function renderScreen(screen, data) {
$root.innerHTML = ‘’;
const wrap = el(‘div’, ‘screen-enter’);
$root.appendChild(wrap);

if (screen === ‘today’)    renderToday(wrap);
else if (screen === ‘map’) renderMap(wrap);
else if (screen === ‘sos’) renderSOS(wrap);
else if (screen === ‘journey’) renderJourney(wrap);
else if (screen === ‘worksheet’) renderWorksheet();
}

function renderToday(container) {
const div = el(‘div’, ‘today-screen’);
container.appendChild(div);

const wk = CURRICULUM[STATE.currentWeek - 1];
const phCls = getPhaseClass(wk.phase);

// Greeting
const hour = new Date().getHours();
const greet = hour < 12 ? ‘Good morning’ : hour < 17 ? ‘Good afternoon’ : ‘Good evening’;
div.innerHTML += `<div class="today-greeting"> <h1>${greet} 👋</h1> <p>Week ${STATE.currentWeek} of 20 · ${PHASES[wk.phase].label}</p> </div>`;

// Overall progress
const pct = Math.round((STATE.completedWeeks.length / 20) * 100);
div.innerHTML += `<div class="overall-progress mb-16"> <div class="progress-label"><span>Overall progress</span><span>${pct}% complete</span></div> <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div> </div>`;

// Week hero card
div.innerHTML += `<div class="week-hero ${phCls}" style="border-left: 4px solid ${getPhaseColor(wk.phase)}"> <div class="week-hero-phase">${PHASES[wk.phase].label}</div> <div class="week-hero-week">Week ${STATE.currentWeek} of 20</div> <div class="week-hero-title">${wk.title}</div> <div class="week-hero-skill">${wk.skill}</div> </div>`;

// Day dots
const dotHtml = wk.worksheets.map((_, i) => {
const done = isCompleted(STATE.currentWeek, i + 1);
const active = (i + 1) === STATE.currentDay && !done;
return `<div class="day-dot ${done ? 'done' : active ? 'active' : ''}"></div>`;
}).join(’’);

// Check for due reviews
const due = dueReviews();
if (due.length > 0) {
const r = due[0];
const reviewWk = CURRICULUM[r.weekNum - 1];
div.innerHTML += `<div class="review-card" id="review-card" style="cursor:pointer"> <div class="review-icon" style="background:${getPhaseColor(reviewWk.phase)}22">📝</div> <div class="review-text"> <h4>Review Due: Week ${r.weekNum}</h4> <p>${r.type === 'day7' ? 'Day 7 spaced review' : 'Day 21 deep review'} · 2 min</p> </div> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color:var(--text-3);flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg> </div>`;
}

// Today’s action
const allDone = wk.worksheets.every((_, i) => isCompleted(STATE.currentWeek, i + 1));

if (allDone) {
div.innerHTML += `<div class="today-action-card"> <div class="rest-state"> <div class="rest-glyph">✓</div> <h3>Week ${STATE.currentWeek} Complete</h3> <p>All worksheets done. Moving forward when you're ready.</p> </div> <button class="btn-primary mt-12" id="btn-advance-week">Continue to Week ${Math.min(STATE.currentWeek + 1, 20)}</button> </div>`;
} else {
const ws = wk.worksheets[STATE.currentDay - 1];
div.innerHTML += `<div class="today-action-card"> <div class="today-action-header"> <div class="ws-icon-sm"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="20" height="20"> <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/> <polyline points="14 2 14 8 20 8"/> <line x1="16" y1="13" x2="8" y2="13"/> <line x1="16" y1="17" x2="8" y2="17"/> </svg> </div> <div class="today-action-meta"> <h3>${ws.title}</h3> <p>${ws.day} · 10–12 min</p> </div> </div> <div class="worksheet-days">${dotHtml}</div> <button class="btn-primary" id="btn-open-ws">Open Today's Worksheet</button> </div>`;
}

// Optional: Review past skills
if (STATE.completedWeeks.length > 0) {
div.innerHTML += `<div style="margin-top:16px;margin-bottom:8px;"> <p style="font-size:13px;color:var(--text-3);margin-bottom:10px;">Or revisit a past skill:</p> <div style="display:flex;flex-wrap:wrap;gap:8px;" id="past-skills-row"></div> </div>`;
}

// Bind events
const btnWs = div.querySelector(’#btn-open-ws’);
if (btnWs) btnWs.addEventListener(‘click’, () => showWorksheet(STATE.currentWeek, STATE.currentDay));

const btnAdv = div.querySelector(’#btn-advance-week’);
if (btnAdv) btnAdv.addEventListener(‘click’, () => triggerReadinessCheck());

const reviewCard = div.querySelector(’#review-card’);
if (reviewCard) reviewCard.addEventListener(‘click’, () => showReview(due[0]));

const pastRow = div.querySelector(’#past-skills-row’);
if (pastRow) {
STATE.completedWeeks.slice(-5).reverse().forEach(wn => {
const pwk = CURRICULUM[wn - 1];
const btn = el(‘button’, ‘btn-pill’);
btn.textContent = `W${wn}: ${pwk.title.split(' ').slice(0,3).join(' ')}...`;
btn.addEventListener(‘click’, () => showWeekDetail(wn));
pastRow.appendChild(btn);
});
}
}

// ── Readiness check ───────────────────────────────────────────
function triggerReadinessCheck() {
const w = STATE.currentWeek;
if (w >= 20) { completeWeekAndAdvance(‘yes’); return; }
const wk = CURRICULUM[w - 1];
document.getElementById(‘readiness-title’).textContent = ‘Before moving on…’;
document.getElementById(‘readiness-body’).textContent = wk.readinessQuestion;
$readinessModal.classList.remove(‘hidden’);

document.getElementById(‘btn-ready-yes’).onclick = () => {
$readinessModal.classList.add(‘hidden’);
completeWeekAndAdvance(‘yes’);
};
document.getElementById(‘btn-ready-proceed’).onclick = () => {
$readinessModal.classList.add(‘hidden’);
completeWeekAndAdvance(‘proceed’);
};
document.getElementById(‘btn-ready-repeat’).onclick = () => {
$readinessModal.classList.add(‘hidden’);
// Reset current week days so they can redo it
STATE.currentDay = 1;
saveState();
navigate(‘today’);
};
}

function completeWeekAndAdvance(readiness) {
const w = STATE.currentWeek;
STATE.readinessChecks[w] = readiness;
if (!STATE.completedWeeks.includes(w)) {
STATE.completedWeeks.push(w);
// Schedule spaced reviews
const newReviews = getReviewSchedule(w, Date.now());
STATE.reviews.push(…newReviews);
// Add to journey log
STATE.journeyLog.push({
week: w,
weekTitle: CURRICULUM[w - 1].title,
anchor: STATE.anchorPrompts[w] || ‘’,
ts: Date.now(),
});
}
if (w < 20) {
STATE.currentWeek = w + 1;
STATE.currentDay = 1;
}
saveState();
celebrate(w);
}

// ── Week review ───────────────────────────────────────────────
function showReview(review) {
const wk = CURRICULUM[review.weekNum - 1];
// Mark review done
review.done = true;
saveState();

$root.innerHTML = ‘’;
currentScreen = ‘review’;
$topTitle.textContent = `Review: Week ${review.weekNum}`;
$btnBack.classList.remove(‘hidden’);

const div = el(‘div’, ‘ws-screen screen-enter’);
$root.appendChild(div);

div.innerHTML = `<div class="ws-top-banner"> <div class="ws-banner-title">Review: ${wk.title}</div> <div class="ws-banner-day" style="color:${getPhaseColor(wk.phase)}">${review.type === 'day7' ? '7-Day Spaced Review' : '21-Day Deep Review'} · 2 min</div> </div> <div class="ws-content"> <div class="ws-instruction">${review.prompt}</div> <div class="prompt-block"> <div class="prompt-label">Your reflection:</div> <textarea id="review-response" placeholder="Write whatever comes up — even a single sentence counts." rows="5"></textarea> </div> <div style="margin-top:20px"> <button class="btn-primary" id="btn-save-review">Save Reflection</button> </div> </div>`;

div.querySelector(’#btn-save-review’).addEventListener(‘click’, () => {
navigate(‘today’);
});
}

// ── Celebrate ─────────────────────────────────────────────────
function celebrate(weekNum) {
const wk = CURRICULUM[weekNum - 1];
const isLast = weekNum === 20;
document.getElementById(‘celebrate-icon’).textContent = isLast ? ‘🌟’ : ‘✦’;
document.getElementById(‘celebrate-title’).textContent = isLast ? ‘Week 20 Complete!’ : `Week ${weekNum} Complete!`;
document.getElementById(‘celebrate-body’).textContent = isLast
? ‘You have completed the full 20-week SAFE curriculum. That is extraordinary work.’
: `${wk.title} is done. Every week you practice, the skills become more automatic.`;
$celebrateModal.classList.remove(‘hidden’);
// Play celebration sound
if (window.SAFE_SOUND) window.SAFE_SOUND.playWeekComplete();
document.getElementById(‘btn-celebrate-ok’).onclick = () => {
$celebrateModal.classList.add(‘hidden’);
navigate(‘today’);
};
}

// ── SCREEN: MAP ───────────────────────────────────────────────
function renderMap(container) {
const div = el(‘div’, ‘map-screen’);
container.appendChild(div);

div.innerHTML = `<h1>Week Map</h1><p>Your 20-week journey through the SAFE model.</p>`;

const phaseGroups = {
SEE:    CURRICULUM.filter(w => w.phase === ‘SEE’),
ACCEPT: CURRICULUM.filter(w => w.phase === ‘ACCEPT’),
FREE:   CURRICULUM.filter(w => w.phase === ‘FREE’),
ENGAGE: CURRICULUM.filter(w => w.phase === ‘ENGAGE’),
};

Object.entries(phaseGroups).forEach(([phase, weeks]) => {
const ph = PHASES[phase];
const section = el(‘div’, ‘phase-section’);

```
section.innerHTML = `
  <div class="phase-section-header">
    <div class="phase-section-dot" style="background:${ph.color}"></div>
    <div>
      <div class="phase-section-title" style="color:${ph.color}">${ph.label}</div>
      <div class="phase-section-weeks">Weeks ${ph.weeks}</div>
    </div>
  </div>
`;

const grid = el('div', 'weeks-grid');
weeks.forEach(wk => {
  const isDone = STATE.completedWeeks.includes(wk.week);
  const isCurrent = wk.week === STATE.currentWeek;
  const isLocked = !isWeekUnlocked(wk.week);

  const node = el('div', `week-node ${isDone ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`);
  node.style.borderColor = isCurrent ? ph.color : '';
  node.innerHTML = `
    <div class="wn-num" style="${isCurrent ? `color:${ph.color}` : ''}">${wk.week}</div>
    <div class="wn-label">${wk.title.split(' ').slice(0,2).join(' ')}</div>
    ${isDone ? '<div class="wn-check">✓</div>' : ''}
  `;

  if (!isLocked) {
    node.addEventListener('click', () => showWeekDetail(wk.week, div));
  }
  grid.appendChild(node);
});

section.appendChild(grid);
div.appendChild(section);
```

});
}

function showWeekDetail(weekNum, container) {
const wk = CURRICULUM[weekNum - 1];
const ph = PHASES[wk.phase];
const phCls = getPhaseClass(wk.phase);

// Remove old detail if any
const old = document.querySelector(’.week-detail’);
if (old) old.remove();

const detail = el(‘div’, ‘week-detail mt-16’);
detail.innerHTML = `<div class="week-detail-header" style="border-top:3px solid ${ph.color}"> <div style="margin-bottom:6px"><span class="phase-badge ${phCls}">${ph.label}</span></div> <div class="week-detail-title">Week ${weekNum}: ${wk.title}</div> <div class="week-detail-skill">${wk.skill}</div> </div> <div class="week-detail-worksheets"> ${wk.worksheets.map((ws, i) => { const dayNum = i + 1; const done = isCompleted(weekNum, dayNum); const active = weekNum === STATE.currentWeek && dayNum === STATE.currentDay; const locked = !isWeekUnlocked(weekNum) || (weekNum === STATE.currentWeek && dayNum > STATE.currentDay && !done); return`
<div class="ws-row ${done ? 'completed' : active ? 'active' : ''}" data-w="${weekNum}" data-d="${dayNum}" style="${locked ? 'opacity:0.4;pointer-events:none' : 'cursor:pointer'}">
<div class="ws-row-day">${ws.day}</div>
<div class="ws-row-title">${ws.title}</div>
<div class="ws-row-status">${done ? ‘✓ Done’ : active ? ‘← Current’ : ‘’}</div>
</div>
`; }).join('')} </div> `;

detail.querySelectorAll(’.ws-row[data-w]’).forEach(row => {
row.addEventListener(‘click’, () => {
const w = parseInt(row.dataset.w);
const d = parseInt(row.dataset.d);
if (worksheetState) worksheetState._fromMap = true;
showWorksheet(w, d);
});
});

// Append to map screen
const mapScreen = document.querySelector(’.map-screen’) || container;
if (mapScreen) mapScreen.appendChild(detail);
detail.scrollIntoView({ behavior:‘smooth’, block:‘nearest’ });
}

// ── SCREEN: WORKSHEET (conversational player) ──────────────────
function renderWorksheet() {
currentScreen = ‘worksheet’;
$root.innerHTML = ‘’;
const { weekNum, dayNum, wkData, wsData } = worksheetState;
const saved = STATE.completedWorksheets[wsKey(weekNum, dayNum)];

const div = el(‘div’, ‘ws-screen screen-enter’);
$root.appendChild(div);

// Active player instance
let activePlayer = null;

const launchPlayer = () => {
div.innerHTML = ‘’;
activePlayer = new WorksheetPlayer({
container: div,
weekNum, dayNum, wkData, wsData,
savedState: saved || null,
appState:   STATE,
onSave: (responses, intention) => {
// Auto-save as they go
STATE.completedWorksheets[wsKey(weekNum, dayNum)] = {
responses: { …responses },
intention: intention || ‘’,
completedAt: STATE.completedWorksheets[wsKey(weekNum, dayNum)]?.completedAt || Date.now(),
partial: true,
};
saveState();
},
onComplete: (responses, intention) => {
if (activePlayer) activePlayer.destroy();
saveWorksheet(weekNum, dayNum, responses, intention);
const allDone = wkData.worksheets.every((_, i) => isCompleted(weekNum, i + 1));
if (allDone) showAnchorPrompt(weekNum);
else {
// Brief celebration then back
showMiniCelebration(div, `${wsData.day} complete`, () => {
navigate(worksheetState?._fromMap ? ‘map’ : ‘today’);
});
}
}
});
};

launchPlayer();
}

function showMiniCelebration(container, msg, cb) {
const overlay = document.createElement(‘div’);
overlay.className = ‘mini-celebrate’;
overlay.innerHTML = `<div class="mini-celebrate-inner"><div style="font-size:36px">✦</div><p>${msg}</p></div>`;
container.appendChild(overlay);
if (window.SAFE_SOUND) window.SAFE_SOUND.playCompletion();
setTimeout(() => { overlay.remove(); cb(); }, 2200);
}

function saveWorksheet(weekNum, dayNum, responses, intention) {
const key = wsKey(weekNum, dayNum);
const existing = STATE.completedWorksheets[key];
STATE.completedWorksheets[key] = {
responses:   { …(responses || {}) },
intention:   intention || ‘’,
completedAt: existing?.completedAt || Date.now(),
partial:     false,
};
const wk = CURRICULUM[weekNum - 1];
if (dayNum < wk.worksheets.length) STATE.currentDay = dayNum + 1;
saveState();
}

function showAnchorPrompt(weekNum) {
const wk = CURRICULUM[weekNum - 1];
// Show a mini modal-like inline prompt asking for the weekly anchor
const modal = document.createElement(‘div’);
modal.className = ‘modal-overlay’;
modal.innerHTML = `<div class="modal-card readiness-card"> <div class="readiness-glyph">📓</div> <h2>Week ${weekNum} Reflection</h2> <p style="font-size:14px;color:var(--text-3);margin-bottom:16px;line-height:1.6">Add this week to your Journey Log. What anxious moment did you face, what skill did you reach for, and what did you notice?</p> <textarea id="anchor-text" rows="4" placeholder="This week, the anxious moment I faced was... The skill I reached for was... What I noticed was..." style="width:100%;margin-bottom:12px"></textarea> <div class="readiness-actions"> <button class="btn-primary" id="btn-save-anchor">Save to Journey</button> <button class="btn-ghost" id="btn-skip-anchor">Skip</button> </div> </div>`;
document.body.appendChild(modal);

modal.querySelector(’#btn-save-anchor’).onclick = () => {
const text = modal.querySelector(’#anchor-text’).value.trim();
STATE.anchorPrompts[weekNum] = text;
document.body.removeChild(modal);
triggerReadinessCheck();
};
modal.querySelector(’#btn-skip-anchor’).onclick = () => {
document.body.removeChild(modal);
triggerReadinessCheck();
};
}

// ── SCREEN: SOS ───────────────────────────────────────────────
function renderSOS(container) {
const div = el(‘div’, ‘sos-screen’);
container.appendChild(div);

const unlocked = SOS_SKILLS.filter(s => s.unlocksAfterWeek <= STATE.currentWeek);
let activeSkill = unlocked[unlocked.length - 1] || SOS_SKILLS[0];
let activePlayer = null;

const header = el(‘div’, ‘sos-header’);
header.innerHTML = `<div class="sos-glyph">🌊</div> <h1>Right Now</h1> <p>Anxiety is a wave. It peaks and falls.<br>Let's work with it.</p>`;
div.appendChild(header);

const skillArea = el(‘div’, ‘sos-skill-area’);
div.appendChild(skillArea);

const selector = el(‘div’, ‘sos-selector’);
div.appendChild(selector);

function renderSkill(skill) {
if (activePlayer && activePlayer.destroy) activePlayer.destroy();
skillArea.innerHTML = `<div class="sos-card"> <div class="sos-skill-name">${skill.name}</div> <div class="sos-skill-desc">${skill.desc}</div> <div id="sos-player-zone"></div> <div id="sos-feedback" class="hidden"></div> </div>`;

```
const zone = document.getElementById('sos-player-zone');
const onDone = () => showSOSFeedback(skill);

if (skill.type === 'breathing') {
  activePlayer = new BreathingPlayer({ container:zone, skill, phColor:'var(--amber)', onDone });
} else if (skill.id === 'grounding_54321') {
  activePlayer = new GroundingPlayer({ container:zone, phColor:'var(--see)', onDone });
} else {
  // Steps list
  zone.innerHTML = `
    <div class="sos-steps">
      ${skill.steps.map((s,i) => `
        <div class="sos-step">
          <div class="sos-step-n">${i+1}</div>
          <div class="sos-step-t">${s}</div>
        </div>`).join('')}
    </div>
    <button class="btn-primary mt-16" id="sos-steps-done" style="background:var(--amber)">I did this</button>
  `;
  document.getElementById('sos-steps-done').addEventListener('click', onDone);

  // Read steps aloud
  if (window.AUDIO && window.AUDIO.enabled) {
    const allText = skill.steps.join('. ');
    setTimeout(() => window.AUDIO.instruction(allText), 400);
  }
}
```

}

function showSOSFeedback(skill) {
const fb = document.getElementById(‘sos-feedback’);
if (!fb) return;
fb.classList.remove(‘hidden’);
fb.innerHTML = `<p class="sos-fb-q">Did that help at all?</p> <div class="sos-fb-btns"> <button class="btn-secondary" id="sos-yes">Yes — it helped</button> <button class="btn-secondary" id="sos-no">Not much</button> </div>`;
document.getElementById(‘sos-yes’).addEventListener(‘click’, () => {
logSOS(skill.id, true);
fb.innerHTML = ‘<p class="sos-fb-done" style="color:var(--free)">Good. The wave is passing. You handled it. ✦</p>’;
if (window.AUDIO && window.AUDIO.enabled) window.AUDIO.affirm(‘Good. The wave is passing. You handled it.’);
});
document.getElementById(‘sos-no’).addEventListener(‘click’, () => {
logSOS(skill.id, false);
fb.innerHTML = ‘<p class="sos-fb-done" style="color:var(--text-3)">That's okay. Try another skill below, or just breathe and wait. The wave will fall.</p>’;
});
}

// Skill selector pills
if (unlocked.length > 1) {
selector.innerHTML = `<p class="sos-sel-label">Try a different skill:</p><div class="sos-pills" id="sos-pills"></div>`;
const pills = document.getElementById(‘sos-pills’);
unlocked.forEach(skill => {
const btn = el(‘button’, `btn-pill ${skill.id === activeSkill.id ? 'active' : ''}`);
btn.textContent = skill.name;
btn.addEventListener(‘click’, () => {
activeSkill = skill;
pills.querySelectorAll(’.btn-pill’).forEach(b => b.classList.remove(‘active’));
btn.classList.add(‘active’);
renderSkill(skill);
});
pills.appendChild(btn);
});
}

renderSkill(activeSkill);
}

function logSOS(skillId, helped) {
STATE.sosLog.push({ ts: Date.now(), skill: skillId, helped });
saveState();
}

// ── SCREEN: JOURNEY ───────────────────────────────────────────
function renderJourney(container) {
const div = el(‘div’, ‘journey-screen’);
container.appendChild(div);

const weeksComplete = STATE.completedWeeks.length;
const worksheetsComplete = Object.keys(STATE.completedWorksheets).length;
const sosCount = STATE.sosLog.length;

div.innerHTML = `<h1>My Journey</h1> <p>Your record of progress through the SAFE curriculum.</p> <div class="journey-stats"> <div class="stat-card"><div class="stat-num">${weeksComplete}</div><div class="stat-label">Weeks Done</div></div> <div class="stat-card"><div class="stat-num">${worksheetsComplete}</div><div class="stat-label">Worksheets</div></div> <div class="stat-card"><div class="stat-num">${sosCount}</div><div class="stat-label">SOS Uses</div></div> </div>`;

// Current week anchor prompt card
if (STATE.currentWeek <= 20) {
const curWk = CURRICULUM[STATE.currentWeek - 1];
div.innerHTML += `<div class="anchor-prompt-card"> <h4>This Week's Anchor — Week ${STATE.currentWeek}</h4> <p>"This week, the anxious moment I faced was... The skill I reached for was... What I noticed was..."</p> <textarea id="anchor-current" placeholder="Write your weekly reflection here..." rows="3">${STATE.anchorPrompts[STATE.currentWeek] || ''}</textarea> <button class="btn-primary mt-8" id="btn-save-anchor-current" style="margin-top:10px">Save Reflection</button> </div>`;
}

// Past entries
div.innerHTML += `<h2 class="mb-12" style="font-size:18px">Past Weeks</h2>`;

const entriesDiv = el(‘div’, ‘journey-entries’);
div.appendChild(entriesDiv);

if (STATE.journeyLog.length === 0) {
entriesDiv.innerHTML = `<p style="color:var(--text-3);font-size:14px;font-style:italic">Your journey log will fill as you complete weeks. Keep going.</p>`;
} else {
[…STATE.journeyLog].reverse().forEach(entry => {
const wk = CURRICULUM[entry.week - 1];
const ph = PHASES[wk.phase];
const entryEl = el(‘div’, ‘journey-entry’);
entryEl.innerHTML = `<div class="journey-entry-header" style="border-left:3px solid ${ph.color}"> <div class="entry-week">Week ${entry.week}: ${entry.weekTitle}</div> <div class="entry-date">${fmt(entry.ts)}</div> </div> <div class="journey-entry-body"> ${entry.anchor ?`<div class="entry-anchor">”${entry.anchor}”</div>`:`<div class="entry-empty">No anchor note recorded for this week.</div>`} </div> `;
entriesDiv.appendChild(entryEl);
});
}

// Bind anchor save
const anchorCurrent = div.querySelector(’#anchor-current’);
const btnSaveAnchor = div.querySelector(’#btn-save-anchor-current’);
if (btnSaveAnchor && anchorCurrent) {
btnSaveAnchor.addEventListener(‘click’, () => {
STATE.anchorPrompts[STATE.currentWeek] = anchorCurrent.value;
saveState();
btnSaveAnchor.textContent = ‘Saved ✓’;
btnSaveAnchor.style.background = ‘var(–free)’;
setTimeout(() => {
btnSaveAnchor.textContent = ‘Save Reflection’;
btnSaveAnchor.style.background = ‘’;
}, 2000);
});
}
}

// ── WEEKLY POPUP ──────────────────────────────────────────────
function maybeShowWeeklyPopup() {
const w = STATE.currentWeek;
const d = STATE.currentDay;
const key = wsKey(w, d);

if (STATE.popupShownFor === key) return;
if (isCompleted(w, d)) return;

const wk = CURRICULUM[w - 1];
const ws = wk.worksheets[d - 1];
if (!wk || !ws) return;

const ph = PHASES[wk.phase];

document.getElementById(‘popup-stripe’).style.background = ph.color;
document.getElementById(‘popup-week-label’).textContent = `Week ${w} of 20 · ${ph.label}`;
document.getElementById(‘popup-title’).textContent = ws.title;
document.getElementById(‘popup-subtitle’).textContent = wk.title;
document.getElementById(‘popup-day-badge’).textContent = ws.day;

$weeklyModal.classList.remove(‘hidden’);

document.getElementById(‘btn-popup-start’).onclick = () => {
STATE.popupShownFor = key;
saveState();
$weeklyModal.classList.add(‘hidden’);
showWorksheet(w, d);
};
document.getElementById(‘btn-popup-later’).onclick = () => {
STATE.popupShownFor = key;
saveState();
$weeklyModal.classList.add(‘hidden’);
};

$weeklyModal.addEventListener(‘click’, e => {
if (e.target === $weeklyModal) {
STATE.popupShownFor = key;
saveState();
$weeklyModal.classList.add(‘hidden’);
}
});
}

// ── Init ──────────────────────────────────────────────────────
function init() {
// Update lastOpened
STATE.lastOpened = Date.now();
saveState();

// Render initial screen
navigate(‘today’);

// Show weekly popup after brief delay
setTimeout(maybeShowWeeklyPopup, 600);
}

// Small delay to ensure fonts loaded
window.addEventListener(‘DOMContentLoaded’, () => setTimeout(init, 100));

})();

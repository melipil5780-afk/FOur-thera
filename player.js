// ═══════════════════════════════════════════════════════════
// SAFE — Conversational Worksheet Player
// One prompt at a time · Voice guidance · Smart responses
// ═══════════════════════════════════════════════════════════

class WorksheetPlayer {
  constructor({ container, weekNum, dayNum, wkData, wsData, savedState, appState, onSave, onComplete }) {
    this.container = container;
    this.weekNum   = weekNum;
    this.dayNum    = dayNum;
    this.wkData    = wkData;
    this.wsData    = wsData;
    this.appState  = appState;
    this.onSave    = onSave;
    this.onComplete= onComplete;

    this.audio   = window.AUDIO;
    this.voice   = window.VOICE_INPUT;
    this.RE      = window.RESPONSE_ENGINE;
    this.phColor = getPhaseColor(wkData.phase);

    // Separate actionable prompts from notes
    this.activePrompts = wsData.prompts.filter(p => p.type !== 'note');
    this.noteFor = {};
    let pending = null, ai = 0;
    wsData.prompts.forEach(p => {
      if (p.type === 'note') { pending = p.text; }
      else { if (pending) { this.noteFor[ai] = pending; pending = null; } ai++; }
    });

    this.idx       = 0;
    this.responses = { ...(savedState?.responses || {}) };
    this.intention = savedState?.intention || '';
    this.answered  = new Set();
    this.stopListen= null;

    this._buildShell();
  }

  // ── Shell ─────────────────────────────────────────────────
  _buildShell() {
    this.container.innerHTML = `
      <div class="pl-wrap">
        <div class="pl-topbar">
          <span class="pl-week-label" style="color:${this.phColor}">
            Week ${this.weekNum} · ${this.wsData.day} · ${this.wkData.title}
          </span>
          <button class="pl-icon-btn" id="pl-audio-btn" aria-label="Toggle voice">
            <svg id="pl-speaker" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" id="pl-waves"/>
            </svg>
          </button>
        </div>
        <div class="pl-dots" id="pl-dots"></div>
        <div class="pl-instruction-panel" id="pl-instr">
          <div class="pl-instr-text"></div>
          <button class="btn-primary pl-begin-btn" id="pl-begin" style="background:${this.phColor};box-shadow:0 4px 20px ${this.phColor}44">
            Begin Worksheet
          </button>
        </div>
        <div class="pl-stage hidden" id="pl-stage"></div>
        <div class="pl-foot" id="pl-foot"></div>
      </div>
    `;

    this.$dots  = this.container.querySelector('#pl-dots');
    this.$instr = this.container.querySelector('#pl-instr');
    this.$stage = this.container.querySelector('#pl-stage');
    this.$foot  = this.container.querySelector('#pl-foot');
    const $audioBtn = this.container.querySelector('#pl-audio-btn');
    const $waves    = this.container.querySelector('#pl-waves');

    // Audio toggle
    $audioBtn.addEventListener('click', () => {
      const on = this.audio.toggle();
      $waves.style.opacity = on ? '1' : '0.15';
    });
    $waves.style.opacity = this.audio.enabled ? '1' : '0.15';

    // Instruction text
    this.$instr.querySelector('.pl-instr-text').textContent = this.wsData.instruction;
    if (this.audio.enabled) setTimeout(() => this.audio.instruction(this.wsData.instruction), 500);

    this.container.querySelector('#pl-begin').addEventListener('click', () => {
      this.$instr.classList.add('hidden');
      this.$stage.classList.remove('hidden');
      this._showPrompt(0);
    });

    this._renderDots();
  }

  _renderDots() {
    this.$dots.innerHTML = this.activePrompts.map((_, i) => `
      <div class="pl-dot ${i < this.idx ? 'pl-dot-done' : i === this.idx ? 'pl-dot-active' : ''}"
           style="${i === this.idx ? `background:${this.phColor}` : i < this.idx ? 'background:var(--free)' : ''}">
      </div>
    `).join('');
  }

  // ── Show one prompt ───────────────────────────────────────
  _showPrompt(idx) {
    if (idx >= this.activePrompts.length) { this._showIntention(); return; }
    this.idx = idx;
    this._renderDots();

    const prompt  = this.activePrompts[idx];
    const origIdx = this.wsData.prompts.indexOf(prompt);
    const key     = `p${origIdx}`;
    const note    = this.noteFor[idx];
    const saved   = this.responses[key];

    this.$stage.innerHTML = '';
    this.$foot.innerHTML  = '';

    // Note context
    if (note) {
      const nb = document.createElement('div');
      nb.className = 'pl-note';
      nb.textContent = note;
      this.$stage.appendChild(nb);
    }

    // Prompt card
    const card = document.createElement('div');
    card.className = 'pl-card pl-slide-up';
    card.innerHTML = `<div class="pl-q">${prompt.label}</div><div class="pl-input-zone" id="pl-iz"></div>`;
    this.$stage.appendChild(card);

    // Response area (hidden until answered)
    const ra = document.createElement('div');
    ra.id = 'pl-ra';
    ra.className = 'pl-response hidden';
    this.$stage.appendChild(ra);

    const iz = card.querySelector('#pl-iz');
    if (prompt.type === 'text')   this._text(iz, key, saved, prompt);
    if (prompt.type === 'rating') this._rating(iz, key, saved, prompt);
    if (prompt.type === 'checks') this._checks(iz, key, saved, prompt);
    if (prompt.type === 'twocol') this._twocol(iz, key, saved, prompt);

    // Footer
    this.$foot.innerHTML = `
      <button class="btn-primary pl-continue hidden" id="pl-cont" style="background:${this.phColor};box-shadow:0 4px 20px ${this.phColor}44">Continue →</button>
      <button class="btn-ghost pl-skip-btn" id="pl-skip">Skip</button>
    `;
    this.$foot.querySelector('#pl-cont').addEventListener('click', () => {
      this.audio.stop();
      this._showPrompt(idx + 1);
    });
    this.$foot.querySelector('#pl-skip').addEventListener('click', () => {
      this.audio.stop();
      this._showPrompt(idx + 1);
    });

    // If revisiting answered prompt — show continue immediately
    if (saved !== undefined && saved !== '') this._showContinue();

    // Speak the prompt
    if (this.audio.enabled) {
      const intro = this.RE.promptIntro(idx);
      const text  = (intro ? intro + ' ' : '') + prompt.label;
      setTimeout(() => this.audio.question(text), 250);
    }
  }

  _showContinue() {
    const btn = document.getElementById('pl-cont');
    if (btn) btn.classList.remove('hidden');
  }

  // ── Respond after answer ──────────────────────────────────
  _respond(key, answer, prompt) {
    if (this.answered.has(key)) return;
    this.answered.add(key);
    this._showContinue();
    this.onSave && this.onSave(this.responses, this.intention);

    const resp = this.RE.getResponse({
      type:    prompt.type,
      label:   prompt.label,
      answer,
      idx:     this.idx,
      weekNum: this.weekNum,
      phase:   this.wkData.phase,
      state:   this.appState,
    });

    if (!resp || !resp.text) return;

    const ra = document.getElementById('pl-ra');
    if (!ra) return;

    setTimeout(() => {
      ra.classList.remove('hidden');
      ra.innerHTML = `
        <div class="pl-resp-card pl-resp-${resp.cls || 'generic'} pl-slide-up">
          <div class="pl-resp-dot" style="background:${this.phColor}"></div>
          <div class="pl-resp-text">${resp.text}</div>
        </div>
      `;
      if (this.audio.enabled) setTimeout(() => this.audio.reflection(resp.text), 200);
    }, 350);
  }

  // ── Input builders ────────────────────────────────────────
  _text(iz, key, saved, prompt) {
    const rows = Math.min(prompt.lines || 3, 5);
    iz.innerHTML = `
      <div class="pl-ta-wrap">
        <textarea id="pl-ta" rows="${rows}" placeholder="Write whatever comes up...">${saved || ''}</textarea>
        ${this.voice.isSupported() ? `<button class="pl-mic" id="pl-mic" aria-label="Speak your answer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
          </svg>
        </button>` : ''}
      </div>
    `;
    const ta = iz.querySelector('#pl-ta');
    ta.addEventListener('input', () => {
      this.responses[key] = ta.value;
      if (ta.value.trim().length > 5) this._respond(key, ta.value, prompt);
    });
    if (saved) this._showContinue();

    const mic = iz.querySelector('#pl-mic');
    if (mic) {
      mic.addEventListener('click', () => {
        if (this.stopListen) { this.stopListen(); this.stopListen = null; mic.classList.remove('pl-mic-on'); return; }
        mic.classList.add('pl-mic-on');
        this.stopListen = this.voice.listen(
          interim => { ta.value = interim; },
          final   => {
            ta.value = final;
            this.responses[key] = final;
            mic.classList.remove('pl-mic-on');
            this.stopListen = null;
            this._respond(key, final, prompt);
          },
          err     => { mic.classList.remove('pl-mic-on'); this.stopListen = null; }
        );
      });
    }
  }

  _rating(iz, key, saved, prompt) {
    iz.innerHTML = `
      <div class="pl-rating">
        <div class="pl-rating-row" id="pl-rr">
          ${[1,2,3,4,5,6,7,8,9,10].map(n => `
            <button class="pl-rb ${saved===n?'pl-rb-sel':''}" data-n="${n}"
              style="${saved===n?`background:${this.phColor};border-color:${this.phColor};color:#fff`:''}">
              ${n}
            </button>`).join('')}
        </div>
        <div class="pl-rating-lbl">
          <span>${prompt.lo||'Not at all'}</span><span>${prompt.hi||'Extremely'}</span>
        </div>
      </div>
    `;
    iz.querySelectorAll('.pl-rb').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.n);
        this.responses[key] = val;
        iz.querySelectorAll('.pl-rb').forEach(b => {
          const sel = parseInt(b.dataset.n) === val;
          b.classList.toggle('pl-rb-sel', sel);
          b.style.background  = sel ? this.phColor : '';
          b.style.borderColor = sel ? this.phColor : '';
          b.style.color       = sel ? '#fff' : '';
        });
        this._respond(key, val, prompt);
      });
    });
    if (saved !== undefined) this._showContinue();
  }

  _checks(iz, key, saved, prompt) {
    const sel = Array.isArray(saved) ? [...saved] : [];
    const div = document.createElement('div');
    div.className = 'pl-checks';
    prompt.items.forEach((item, ci) => {
      const checked = sel.includes(ci);
      const row = document.createElement('div');
      row.className = `pl-ci ${checked ? 'pl-ci-on' : ''}`;
      row.innerHTML = `
        <div class="pl-cb" style="${checked?`background:${this.phColor};border-color:${this.phColor}`:''}">
          <svg viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.5" width="10" height="10" ${checked?'':'style="display:none"'}>
            <polyline points="2 6 5 9 10 3"/>
          </svg>
        </div>
        <div class="pl-cl">${item}</div>
      `;
      row.addEventListener('click', () => {
        const i = sel.indexOf(ci);
        i > -1 ? sel.splice(i,1) : sel.push(ci);
        this.responses[key] = [...sel];
        const on  = sel.includes(ci);
        row.classList.toggle('pl-ci-on', on);
        const cb  = row.querySelector('.pl-cb');
        const svg = row.querySelector('svg');
        cb.style.background  = on ? this.phColor : '';
        cb.style.borderColor = on ? this.phColor : '';
        svg.style.display    = on ? '' : 'none';
        if (sel.length > 0) this._respond(key, sel, prompt);
      });
      div.appendChild(row);
    });
    iz.appendChild(div);
    if (sel.length > 0) this._showContinue();
  }

  _twocol(iz, key, saved, prompt) {
    const lv = (saved && saved.l) || '';
    const rv = (saved && saved.r) || '';
    iz.innerHTML = `
      <div class="pl-2col">
        <div class="pl-2col-side">
          <label class="pl-2col-lbl">${prompt.l}</label>
          <textarea rows="4" id="pl-tcl" placeholder="Write here...">${lv}</textarea>
        </div>
        <div class="pl-2col-side">
          <label class="pl-2col-lbl">${prompt.r}</label>
          <textarea rows="4" id="pl-tcr" placeholder="Write here...">${rv}</textarea>
        </div>
      </div>
    `;
    const L = iz.querySelector('#pl-tcl');
    const R = iz.querySelector('#pl-tcr');
    const upd = () => {
      this.responses[key] = { l:L.value, r:R.value };
      if (L.value.trim() || R.value.trim()) this._respond(key, this.responses[key], prompt);
    };
    L.addEventListener('input', upd);
    R.addEventListener('input', upd);
    if (lv || rv) this._showContinue();
  }

  // ── Implementation intention ──────────────────────────────
  _showIntention() {
    this.idx = this.activePrompts.length;
    this._renderDots();
    this.$stage.innerHTML = `
      <div class="pl-card pl-slide-up pl-intention">
        <div class="pl-intention-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22" style="color:${this.phColor}">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <div>
            <div class="pl-intention-title">Your Intention</div>
            <div class="pl-intention-sub">Specific plans double follow-through</div>
          </div>
        </div>
        <p class="pl-intention-hint">Finish this sentence — be specific about when and where:</p>
        <div class="pl-intention-placeholder" id="pl-iph" style="color:${this.phColor}44;font-style:italic;font-size:13px;margin-bottom:8px">"${this.wsData.intention}"</div>
        <textarea id="pl-intent-ta" rows="3" placeholder="${this.wsData.intention}">${this.intention}</textarea>
      </div>
    `;
    this.$foot.innerHTML = `
      <button class="btn-primary" id="pl-done" style="background:${this.phColor};box-shadow:0 4px 20px ${this.phColor}44">
        Complete Worksheet ✦
      </button>
      <button class="btn-ghost mt-4" id="pl-skip-intent">Skip intention</button>
    `;
    const ta = this.$stage.querySelector('#pl-intent-ta');
    ta.addEventListener('focus', () => { const h = document.getElementById('pl-iph'); if(h) h.style.display='none'; });
    ta.addEventListener('input', () => {
      this.intention = ta.value;
      this.onSave && this.onSave(this.responses, ta.value);
    });
    document.getElementById('pl-done').addEventListener('click', () => {
      this.onComplete && this.onComplete(this.responses, ta.value);
    });
    document.getElementById('pl-skip-intent').addEventListener('click', () => {
      this.onComplete && this.onComplete(this.responses, '');
    });

    if (this.audio.enabled) {
      setTimeout(() => this.audio.instruction('Almost done. Set your intention for this skill — be specific about when you\'ll use it.'), 300);
    }
  }

  destroy() {
    this.audio.stop();
    if (this.stopListen) this.stopListen();
  }
}

// ── Breathing Player ──────────────────────────────────────────
class BreathingPlayer {
  constructor({ container, skill, phColor, onDone }) {
    this.container = container;
    this.skill   = skill;
    this.phColor = phColor || '#e8a838';
    this.onDone  = onDone;
    this.audio   = window.AUDIO;
    this.active  = false;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="bp-wrap">
        <div class="bp-ring-wrap">
          <div class="bp-ring" id="bp-ring" style="border-color:${this.phColor}">
            <div class="bp-inner" style="background:${this.phColor}11">
              <span class="bp-num" id="bp-num">●</span>
            </div>
          </div>
        </div>
        <div class="bp-label" id="bp-label">Ready when you are</div>
        <div class="bp-cycle" id="bp-cycle"></div>
        <button class="btn-primary mt-16 bp-start" id="bp-start" style="background:${this.phColor};box-shadow:0 4px 16px ${this.phColor}44">
          Start · ${this.skill.cycles||4} cycles
        </button>
      </div>
    `;
    document.getElementById('bp-start').addEventListener('click', () => {
      document.getElementById('bp-start').style.display = 'none';
      this._go();
    });
  }

  async _go() {
    this.active = true;
    const ring  = document.getElementById('bp-ring');
    const num   = document.getElementById('bp-num');
    const label = document.getElementById('bp-label');
    const cycle = document.getElementById('bp-cycle');
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const cycles = this.skill.cycles || 4;

    for (let c = 0; c < cycles; c++) {
      if (!this.active) return;
      cycle.textContent = `Cycle ${c+1} of ${cycles}`;
      for (const step of this.skill.steps) {
        if (!this.active) return;
        label.textContent = step.label;
        ring.className = `bp-ring bp-${step.phase}`;
        ring.style.borderColor = this.phColor;
        for (let i = step.duration; i >= 1; i--) {
          if (!this.active) return;
          num.textContent = i;
          if (this.audio.enabled) await this.audio.speak(String(i), { rate:0.7 });
          else await sleep(1000);
        }
      }
    }

    if (!this.active) return;
    ring.className = 'bp-ring';
    num.textContent = '✓';
    label.textContent = 'Well done. Notice how you feel.';
    cycle.textContent = '';
    if (this.audio.enabled) await this.audio.speak('Well done. Notice how you feel now.', { rate:0.78 });
    if (this.onDone) this.onDone();
  }

  destroy() { this.active = false; this.audio.stop(); }
}

// ── Grounding Player ──────────────────────────────────────────
class GroundingPlayer {
  constructor({ container, phColor, onDone }) {
    this.container = container;
    this.phColor   = phColor || '#2e8b9a';
    this.onDone    = onDone;
    this.audio     = window.AUDIO;
    this._run();
  }

  _run() {
    const steps = [
      { n:5, e:'👀', s:'See',   q:'Name 5 things you can see right now. Look slowly.' },
      { n:4, e:'✋', s:'Touch', q:'Touch 4 things. Really feel the texture of each.' },
      { n:3, e:'👂', s:'Hear',  q:'Listen. Name 3 sounds — even very quiet ones.' },
      { n:2, e:'👃', s:'Smell', q:'2 things you can smell — or vividly remember.' },
      { n:1, e:'💧', s:'Taste', q:'1 thing you can taste. Take a slow breath first.' },
    ];
    let i = 0;
    const show = () => {
      if (i >= steps.length) {
        this.container.innerHTML = `
          <div class="gp-done pl-slide-up">
            <div style="font-size:48px;margin-bottom:12px">🌿</div>
            <p style="font-size:16px;color:var(--text-2);margin-bottom:20px">You're here. Right now. That's enough.</p>
            ${this.onDone ? '<button class="btn-primary" id="gp-done">Done</button>' : ''}
          </div>
        `;
        if (this.onDone) document.getElementById('gp-done').addEventListener('click', this.onDone);
        if (this.audio.enabled) this.audio.speak("You're here. Right now. That's enough.", { rate:0.78 });
        return;
      }
      const st = steps[i];
      this.container.innerHTML = `
        <div class="gp-step pl-slide-up">
          <div class="gp-num" style="color:${this.phColor}">${st.e}  ${st.n}</div>
          <div class="gp-sense" style="color:${this.phColor}">${st.s}</div>
          <div class="gp-q">${st.q}</div>
          <textarea class="gp-ta" rows="3" placeholder="List them here, or just do it in your head..."></textarea>
          <button class="btn-primary mt-12 gp-next" style="background:${this.phColor}">
            ${i < steps.length-1 ? 'Next →' : 'Finish'}
          </button>
        </div>
      `;
      this.container.querySelector('.gp-next').addEventListener('click', () => { i++; show(); });
      if (this.audio.enabled) this.audio.instruction(st.q);
    };
    show();
  }
}

// Helper used by both this file and app.js
function getPhaseColor(phase) { return (window.SAFE_DATA.PHASES[phase]||window.SAFE_DATA.PHASES.SEE).color; }
function getPhaseClass(phase) { return (window.SAFE_DATA.PHASES[phase]||window.SAFE_DATA.PHASES.SEE).cls; }

window.WorksheetPlayer = WorksheetPlayer;
window.BreathingPlayer = BreathingPlayer;
window.GroundingPlayer = GroundingPlayer;
window.getPhaseColor   = getPhaseColor;
window.getPhaseClass   = getPhaseClass;

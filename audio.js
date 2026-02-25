// ═══════════════════════════════════════════════════════════
// SAFE — Audio Guide (Web Speech API)
// Free · Unlimited · Built into every browser
// ═══════════════════════════════════════════════════════════

class AudioGuide {
  constructor() {
    this.synth   = window.speechSynthesis || null;
    this.enabled = localStorage.getItem('safe_audio') !== 'off';
    this.voice   = null;
    this._loadVoices();
  }

  _loadVoices() {
    if (!this.synth) return;
    const pick = () => {
      const voices = this.synth.getVoices();
      if (!voices.length) return;
      const preferred = ['Samantha','Karen','Moira','Tessa',
        'Google US English','Google UK English Female',
        'Microsoft Aria Online','Microsoft Aria','Zira'];
      for (const name of preferred) {
        const m = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
        if (m) { this.voice = m; return; }
      }
      this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    };
    pick();
    if (this.synth.onvoiceschanged !== undefined) this.synth.onvoiceschanged = pick;
    setTimeout(pick, 500);
  }

  isSupported() { return !!this.synth; }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('safe_audio', this.enabled ? 'on' : 'off');
    if (!this.enabled) this.stop();
    return this.enabled;
  }

  stop() {
    if (this.synth) { try { this.synth.cancel(); } catch(e){} }
  }

  speak(text, opts = {}) {
    if (!this.enabled || !this.synth || !text) return Promise.resolve();
    const clean = text.replace(/\*\*/g,'').replace(/\*/g,'')
      .replace(/[✦✓→←·]/g,'').replace(/#+/g,'').trim();
    if (!clean) return Promise.resolve();
    return new Promise(resolve => {
      try { this.synth.cancel(); } catch(e){}
      const utt = new SpeechSynthesisUtterance(clean);
      if (this.voice) utt.voice = this.voice;
      utt.rate   = opts.rate   !== undefined ? opts.rate   : 0.82;
      utt.pitch  = opts.pitch  !== undefined ? opts.pitch  : 1.0;
      utt.volume = opts.volume !== undefined ? opts.volume : 1.0;
      utt.onend  = () => resolve();
      utt.onerror= () => resolve();
      setTimeout(() => { try { this.synth.speak(utt); } catch(e){ resolve(); } }, 60);
    });
  }

  instruction(text) { return this.speak(text, { rate: 0.78 }); }
  question(text)    { return this.speak(text, { rate: 0.84 }); }
  reflection(text)  { return this.speak(text, { rate: 0.80 }); }
  affirm(text)      { return this.speak(text, { rate: 0.88 }); }
}

// ── Voice Input ───────────────────────────────────────────────
class VoiceInput {
  constructor() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.supported = !!SR;
    if (this.supported) {
      this.rec = new SR();
      this.rec.continuous = false;
      this.rec.interimResults = true;
      this.rec.lang = 'en-US';
    }
    this.listening = false;
  }

  isSupported() { return this.supported; }

  listen(onInterim, onFinal, onError) {
    if (!this.supported) { onError && onError('not-supported'); return ()=>{}; }
    if (this.listening) { try { this.rec.stop(); } catch(e){} }
    this.rec.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      const final = e.results[e.results.length-1].isFinal;
      if (final) { this.listening = false; onFinal && onFinal(t); }
      else onInterim && onInterim(t);
    };
    this.rec.onerror = e => { this.listening = false; onError && onError(e.error); };
    this.rec.onend   = () => { this.listening = false; };
    try { this.rec.start(); this.listening = true; }
    catch(e) { this.listening = false; onError && onError('start-failed'); }
    return () => { this.listening = false; try { this.rec.stop(); } catch(e){} };
  }

  stop() { if (this.supported) { try { this.rec.stop(); } catch(e){} } this.listening = false; }
}

window.AUDIO       = new AudioGuide();
window.VOICE_INPUT = new VoiceInput();

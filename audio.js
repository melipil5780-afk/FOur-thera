// ═══════════════════════════════════════════════════════════
// SAFE — audio.js
// TTS removed — all sound now via SAFE_SOUND (sounds.js)
// This file keeps only Voice Input (speech-to-text)
// and a stub AUDIO object so player.js calls are safe
// ═══════════════════════════════════════════════════════════

// Stub so any remaining player.js references don’t throw
const AUDIO_STUB = {
enabled:       false,
isSupported:   () => false,
toggle:        () => false,
stop:          () => {},
speak:         () => Promise.resolve(),
instruction:   () => Promise.resolve(),
question:      () => Promise.resolve(),
reflection:    () => Promise.resolve(),
affirm:        () => Promise.resolve(),
};
window.AUDIO = AUDIO_STUB;

// ── Voice Input (speech-to-text for typing answers) ───────────
class VoiceInput {
constructor() {
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
this.supported = !!SR;
if (this.supported) {
this.rec = new SR();
this.rec.continuous     = false;
this.rec.interimResults = true;
this.rec.lang           = ‘en-US’;
}
this.listening = false;
}

isSupported() { return this.supported; }

listen(onInterim, onFinal, onError) {
if (!this.supported) { onError && onError(‘not-supported’); return () => {}; }
if (this.listening)  { try { this.rec.stop(); } catch(e) {} }

```
this.rec.onresult = e => {
  const t     = Array.from(e.results).map(r => r[0].transcript).join('');
  const final = e.results[e.results.length - 1].isFinal;
  if (final) { this.listening = false; onFinal && onFinal(t); }
  else onInterim && onInterim(t);
};
this.rec.onerror = e => { this.listening = false; onError && onError(e.error); };
this.rec.onend   = ()  => { this.listening = false; };

try   { this.rec.start(); this.listening = true; }
catch (e) { this.listening = false; onError && onError('start-failed'); }

return () => { this.listening = false; try { this.rec.stop(); } catch(e) {} };
```

}

stop() {
if (this.supported) { try { this.rec.stop(); } catch(e) {} }
this.listening = false;
}
}

window.VOICE_INPUT = new VoiceInput();

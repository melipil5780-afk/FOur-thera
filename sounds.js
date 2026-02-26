// ═══════════════════════════════════════════════════════════
// SAFE — High-Quality Audio Engine
// Web Audio API · Zero cost · Zero files · Works offline
//
// Architecture:
//   Master chain: Source nodes → Dynamics → Reverb → Master out
//   Ambient layer: Pink noise + binaural tones + nature texture
//   Breathing layer: Tonal guide that IS the breath pacer
//   UI layer: Micro-sounds for every interaction
//   SOS layer: Immediate calming environment
// ═══════════════════════════════════════════════════════════

class SAFEAudio {
constructor() {
this.ctx         = null;
this.enabled     = localStorage.getItem(‘safe_sound’) !== ‘off’;
this.ambientOn   = false;
this.masterGain  = null;
this.reverbNode  = null;
this.compressor  = null;

```
// Active nodes (for cleanup)
this._ambientNodes  = [];
this._breathNodes   = [];
this._currentScene  = null;

// Volume levels (0–1)
this.levels = {
  master:  0.72,
  ambient: 0.28,
  breath:  0.55,
  ui:      0.45,
};
```

}

// ── Init ─────────────────────────────────────────────────
// Web Audio requires user gesture — call on first tap
async init() {
if (this.ctx) return;
try {
this.ctx = new (window.AudioContext || window.webkitAudioContext)();
if (this.ctx.state === ‘suspended’) await this.ctx.resume();
this._buildMasterChain();
} catch(e) {
console.warn(‘SAFE Audio: Web Audio not available’, e);
this.ctx = null;
}
}

// ── Master signal chain ───────────────────────────────────
_buildMasterChain() {
const ctx = this.ctx;

```
// Master gain
this.masterGain = ctx.createGain();
this.masterGain.gain.value = this.enabled ? this.levels.master : 0;

// Soft limiter / dynamics compressor
this.compressor = ctx.createDynamicsCompressor();
this.compressor.threshold.value = -18;
this.compressor.knee.value      = 12;
this.compressor.ratio.value     = 4;
this.compressor.attack.value    = 0.003;
this.compressor.release.value   = 0.25;

// Reverb (synthesized hall IR)
this.reverbNode = this._buildReverb(2.8, 0.5);

// Dry/wet blend
this.reverbDry = ctx.createGain(); this.reverbDry.gain.value = 0.62;
this.reverbWet = ctx.createGain(); this.reverbWet.gain.value = 0.38;

// Chain: masterGain → compressor → [dry + wet reverb] → destination
this.masterGain.connect(this.compressor);
this.compressor.connect(this.reverbDry);
this.compressor.connect(this.reverbNode);
this.reverbNode.connect(this.reverbWet);
this.reverbDry.connect(ctx.destination);
this.reverbWet.connect(ctx.destination);
```

}

// Synthesized convolution reverb (no IR file needed)
_buildReverb(duration, decay) {
const ctx    = this.ctx;
const rate   = ctx.sampleRate;
const length = rate * duration;
const buffer = ctx.createBuffer(2, length, rate);

```
for (let ch = 0; ch < 2; ch++) {
  const d = buffer.getChannelData(ch);
  for (let i = 0; i < length; i++) {
    // Gaussian noise with exponential decay + slight pre-delay shimmer
    const t = i / rate;
    const shimmer = 1 + 0.03 * Math.sin(2 * Math.PI * 8 * t);
    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t / duration, decay) * shimmer;
  }
}

const convolver = ctx.createConvolver();
convolver.buffer = buffer;
return convolver;
```

}

// ── Pink noise generator ──────────────────────────────────
// Pink noise = -3dB/octave — much warmer than white noise
// Sounds like distant rain, wind in trees, or gentle water
_createPinkNoise(gainVal = 1) {
const ctx    = this.ctx;
const bufSec = 4;
const rate   = ctx.sampleRate;
const buffer = ctx.createBuffer(2, rate * bufSec, rate);

```
for (let ch = 0; ch < 2; ch++) {
  const d = buffer.getChannelData(ch);
  // Voss–McCartney pink noise algorithm
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for (let i = 0; i < d.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886*b0 + white*0.0555179;
    b1 = 0.99332*b1 + white*0.0750759;
    b2 = 0.96900*b2 + white*0.1538520;
    b3 = 0.86650*b3 + white*0.3104856;
    b4 = 0.55000*b4 + white*0.5329522;
    b5 = -0.7616*b5 - white*0.0168980;
    d[i] = (b0+b1+b2+b3+b4+b5+b6 + white*0.5362) * 0.11;
    b6 = white * 0.115926;
  }
}

const src = this.ctx.createBufferSource();
src.buffer = buffer;
src.loop   = true;

const gain = this.ctx.createGain();
gain.gain.value = gainVal;
src.connect(gain);
return { src, gain };
```

}

// ── Isochronic tone generator ─────────────────────────────
// Works on ANY speaker or earphones - no headphones required
// Pulses a carrier at the target brainwave frequency
// 4Hz theta = deep calm  |  8Hz alpha = soft awareness
_createBinaural(baseFreq = 136.1, beatFreq = 4.0, gainVal = 0.06) {
const ctx = this.ctx;
// Two slightly detuned carriers for warmth
const oL = ctx.createOscillator();
const oR = ctx.createOscillator();
oL.type = oR.type = ‘sine’;
oL.frequency.value = baseFreq;
oR.frequency.value = baseFreq * 1.002;
// Amplitude gate driven by LFO
const ampGate = ctx.createGain();
ampGate.gain.value = 0;
// LFO at isochronic beat frequency
const lfo = ctx.createOscillator();
lfo.type = ‘sine’;
lfo.frequency.value = beatFreq;
const lfoAmp = ctx.createGain();
lfoAmp.gain.value = 0.5;
const lfoBase = ctx.createConstantSource();
lfoBase.offset.value = 0.5;
// Soft pulse edges via LPF
const lpf = ctx.createBiquadFilter();
lpf.type = ‘lowpass’;
lpf.frequency.value = Math.max(beatFreq * 3, 20);
lpf.Q.value = 0.5;
// Master output
const gain = ctx.createGain();
gain.gain.value = gainVal;
// Wire carriers
const gL = ctx.createGain(); gL.gain.value = 0.5;
const gR = ctx.createGain(); gR.gain.value = 0.5;
oL.connect(gL); gL.connect(ampGate);
oR.connect(gR); gR.connect(ampGate);
ampGate.connect(gain);
// Wire LFO
lfo.connect(lfoAmp); lfoAmp.connect(lpf);
lpf.connect(ampGate.gain); lfoBase.connect(ampGate.gain);
return { oL, oR, gain,
_isoNodes: [lfo, lfoBase, lfoAmp, lpf, ampGate, gL, gR] };
}

// ── Harmonic drone ────────────────────────────────────────
// Stacked slightly-detuned sine waves = warm pad sound
_createDrone(rootFreq, harmonics = [1, 2, 3, 5], gainVal = 0.04) {
const ctx    = this.ctx;
const merger = ctx.createChannelMerger(2);
const gain   = ctx.createGain();
gain.gain.value = gainVal;

```
const oscs = harmonics.map((h, i) => {
  const osc = ctx.createOscillator();
  osc.type      = 'sine';
  // Slight random detuning per harmonic for organic beating
  osc.frequency.value = rootFreq * h * (1 + (Math.random() - 0.5) * 0.003);
  const g = ctx.createGain();
  // Higher harmonics quieter
  g.gain.value = 0.5 / (h * 0.8);
  osc.connect(g);
  // Pan alternating L/R
  const panner = ctx.createStereoPanner();
  panner.pan.value = (i % 2 === 0 ? -1 : 1) * 0.15;
  g.connect(panner);
  panner.connect(merger, 0, i % 2);
  return osc;
});

merger.connect(gain);
return { oscs, gain };
```

}

// ── Low-frequency movement (shimmer / movement in ambient) ──
_createShimmer(freq = 0.12, depth = 0.15) {
// LFO that modulates ambient gain for gentle movement
const lfo  = this.ctx.createOscillator();
const lfoG = this.ctx.createGain();
lfo.type = ‘sine’;
lfo.frequency.value = freq;
lfoG.gain.value = depth;
lfo.connect(lfoG);
return { lfo, lfoG };
}

// ══════════════════════════════════════════════════════════
// SCENES — different soundscapes for different app states
// ══════════════════════════════════════════════════════════

// ── Worksheet ambient — focus state ──────────────────────
// Warm pink noise + 4Hz binaural theta + root 432hz drone
// 432hz tuning — perceived as more harmonious than 440hz
async playWorksheetAmbient() {
if (!this.enabled) return;
await this.init();
if (!this.ctx) return;
this.stopAmbient();

```
const ctx   = this.ctx;
const nodes = [];

// Pink noise base — quiet, textural
const pink = this._createPinkNoise(this.levels.ambient * 0.5);
pink.src.start();
pink.gain.connect(this.masterGain);
nodes.push(pink.src, pink.gain);

// Binaural 4Hz theta on 136.1Hz (C# — ancient tuning, "Om" frequency)
const bin = this._createBinaural(136.1, 4.0, this.levels.ambient * 0.25);
bin.oL.start(); bin.oR.start();
(bin._isoNodes||[]).forEach(n => { try { if(n.start) n.start(); } catch(e){} });
bin.gain.connect(this.masterGain);
nodes.push(bin.oL, bin.oR, bin.gain, ...(bin._isoNodes||[]));

// Harmonic drone — 432hz root (A=432)
const drone = this._createDrone(108, [1, 2, 4, 6], this.levels.ambient * 0.18);
drone.oscs.forEach(o => o.start());
drone.gain.connect(this.masterGain);
nodes.push(...drone.oscs, drone.gain);

// Gentle shimmer LFO on drone
const shimmer = this._createShimmer(0.08, this.levels.ambient * 0.12);
shimmer.lfo.start();
shimmer.lfoG.connect(drone.gain.gain);

// Slow fade in
this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
this.masterGain.gain.linearRampToValueAtTime(
  this.levels.master, ctx.currentTime + 3.5
);

this._ambientNodes = nodes;
this._currentScene = 'worksheet';
this.ambientOn = true;
```

}

// ── SOS ambient — immediate calm ─────────────────────────
// Deeper, slower, more enveloping — brown noise + low drone
// Immediate onset (no long fade-in — person is activated)
async playSOSAmbient() {
if (!this.enabled) return;
await this.init();
if (!this.ctx) return;
this.stopAmbient();

```
const ctx   = this.ctx;
const nodes = [];

// Slightly louder pink noise for SOS — more enveloping
const pink = this._createPinkNoise(this.levels.ambient * 0.7);
pink.src.start();
// Low-pass filter for warmth — cuts harsh highs
const lpf = ctx.createBiquadFilter();
lpf.type = 'lowpass';
lpf.frequency.value = 800;
lpf.Q.value = 0.5;
pink.gain.connect(lpf);
lpf.connect(this.masterGain);
nodes.push(pink.src, pink.gain, lpf);

// Lower binaural — 2Hz delta — deepest relaxation state
const bin = this._createBinaural(110, 2.0, this.levels.ambient * 0.3);
bin.oL.start(); bin.oR.start();
(bin._isoNodes||[]).forEach(n => { try { if(n.start) n.start(); } catch(e){} });
bin.gain.connect(this.masterGain);
nodes.push(bin.oL, bin.oR, bin.gain, ...(bin._isoNodes||[]));

// Very low drone — 55Hz root (A1)
const drone = this._createDrone(55, [1, 2, 3], this.levels.ambient * 0.2);
drone.oscs.forEach(o => o.start());
drone.gain.connect(this.masterGain);
nodes.push(...drone.oscs, drone.gain);

// Fast fade in — person needs this NOW
this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
this.masterGain.gain.linearRampToValueAtTime(
  this.levels.master, ctx.currentTime + 1.2
);

this._ambientNodes = nodes;
this._currentScene = 'sos';
this.ambientOn = true;
```

}

// ── Today / Journey ambient — lighter, open ───────────────
async playHomeAmbient() {
if (!this.enabled) return;
await this.init();
if (!this.ctx) return;
this.stopAmbient();

```
const ctx   = this.ctx;
const nodes = [];

// Very quiet pink noise
const pink = this._createPinkNoise(this.levels.ambient * 0.3);
pink.src.start();
pink.gain.connect(this.masterGain);
nodes.push(pink.src, pink.gain);

// Alpha 8Hz binaural — gentle wakefulness
const bin = this._createBinaural(144, 8.0, this.levels.ambient * 0.18);
bin.oL.start(); bin.oR.start();
(bin._isoNodes||[]).forEach(n => { try { if(n.start) n.start(); } catch(e){} });
bin.gain.connect(this.masterGain);
nodes.push(bin.oL, bin.oR, bin.gain, ...(bin._isoNodes||[]));

this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
this.masterGain.gain.linearRampToValueAtTime(
  this.levels.master * 0.7, ctx.currentTime + 4
);

this._ambientNodes = nodes;
this._currentScene = 'home';
this.ambientOn = true;
```

}

// ── Stop ambient ──────────────────────────────────────────
stopAmbient(fadeTime = 1.5) {
if (!this.ctx || !this.ambientOn) return;
const now = this.ctx.currentTime;
this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
this.masterGain.gain.linearRampToValueAtTime(0, now + fadeTime);

```
setTimeout(() => {
  this._ambientNodes.forEach(n => {
    try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch(e){}
  });
  this._ambientNodes = [];
  this.ambientOn = false;
  // Restore master gain
  if (this.ctx && this.masterGain) {
    this.masterGain.gain.setValueAtTime(this.enabled ? this.levels.master : 0, this.ctx.currentTime);
  }
}, (fadeTime + 0.2) * 1000);
```

}

// ══════════════════════════════════════════════════════════
// BREATHING TONE GUIDE
// The tone IS the breath pacer — rises on inhale, falls on exhale
// No voice needed. The sound does the work.
// ══════════════════════════════════════════════════════════

startBreathingTone(pattern, onPhaseChange, onComplete) {
if (!this.ctx) { this._breathFallback(pattern, onPhaseChange, onComplete); return; }

```
let active   = true;
const sleep  = ms => new Promise(r => setTimeout(r, ms));
const ctx    = this.ctx;
let toneNodes = [];

const cleanTone = () => {
  toneNodes.forEach(n => { try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch(e){} });
  toneNodes = [];
};

// Build a rich sustained tone (base + octave + fifth)
const makeTone = (freq, gainVal) => {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc3.type = 'sine';
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 2;        // octave
  osc3.frequency.value = freq * 1.5;      // perfect fifth

  const g1 = ctx.createGain(); g1.gain.value = gainVal;
  const g2 = ctx.createGain(); g2.gain.value = gainVal * 0.35;
  const g3 = ctx.createGain(); g3.gain.value = gainVal * 0.2;

  [osc1,osc2,osc3].forEach((o,i) => {
    const g = [g1,g2,g3][i];
    o.connect(g); g.connect(this.masterGain);
  });
  return [osc1, osc2, osc3, g1, g2, g3];
};

const phases = {
  inhale: { freqStart: 180, freqEnd: 320, label:'Breathe in...' },
  hold:   { freqStart: 320, freqEnd: 320, label:'Hold...' },
  exhale: { freqStart: 320, freqEnd: 160, label:'Breathe out...' },
};

const runPhase = async (step) => {
  if (!active) return;
  const ph    = phases[step.phase] || phases.exhale;
  const dur   = step.duration;
  const nodes = makeTone(ph.freqStart, this.levels.breath * 0.4);
  toneNodes.push(...nodes);

  // Animate frequency over duration
  const osc = nodes[0];
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(ph.freqStart, now);
  osc.frequency.linearRampToValueAtTime(ph.freqEnd, now + dur);
  // Same for octave
  nodes[1].frequency.setValueAtTime(ph.freqStart * 2, now);
  nodes[1].frequency.linearRampToValueAtTime(ph.freqEnd * 2, now + dur);
  // Fifth
  nodes[2].frequency.setValueAtTime(ph.freqStart * 1.5, now);
  nodes[2].frequency.linearRampToValueAtTime(ph.freqEnd * 1.5, now + dur);

  // Amplitude envelope — soft attack, hold, soft release
  const gMain = nodes[3];
  gMain.gain.setValueAtTime(0, now);
  gMain.gain.linearRampToValueAtTime(this.levels.breath * 0.4, now + 0.4);
  gMain.gain.setValueAtTime(this.levels.breath * 0.4, now + dur - 0.4);
  gMain.gain.linearRampToValueAtTime(0, now + dur);

  nodes.slice(0,3).forEach(o => o.start(now));

  onPhaseChange && onPhaseChange(step.phase, ph.label, dur);
  await sleep(dur * 1000 + 50);
  cleanTone();
};

const run = async (cycles) => {
  for (let c = 0; c < cycles; c++) {
    if (!active) return;
    for (const step of pattern) {
      if (!active) return;
      await runPhase(step);
      // Brief silence between phases
      await sleep(120);
    }
    // Between-cycle pause with a gentle bell
    if (c < cycles - 1) {
      await sleep(400);
      this.playBell(0.3);
      await sleep(600);
    }
  }
  if (active) {
    // Completion — ascending three-tone
    await sleep(300);
    this.playCompletion();
    onComplete && onComplete();
  }
};

return {
  start: (cycles = 4) => run(cycles),
  stop:  () => { active = false; cleanTone(); }
};
```

}

// Fallback timer if AudioContext unavailable
_breathFallback(pattern, onPhaseChange, onComplete) {
let active = true;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const run = async (cycles) => {
const phases = { inhale:‘Breathe in…’, hold:‘Hold…’, exhale:‘Breathe out…’ };
for (let c = 0; c < cycles; c++) {
for (const step of pattern) {
if (!active) return;
onPhaseChange && onPhaseChange(step.phase, phases[step.phase]||’’, step.duration);
await sleep(step.duration * 1000);
}
}
onComplete && onComplete();
};
return { start: (c=4) => run(c), stop: () => { active = false; } };
}

// ══════════════════════════════════════════════════════════
// UI MICRO-SOUNDS
// Each interaction has a distinct, satisfying, non-intrusive sound
// ══════════════════════════════════════════════════════════

// Generic tone builder with envelope
_tone(freq, type = ‘sine’, duration = 0.18, gainVal = 0.3, delayStart = 0) {
if (!this.ctx || !this.enabled) return;
const ctx = this.ctx;
const now = ctx.currentTime + delayStart;

```
const osc  = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = type;
osc.frequency.value = freq;

// Sharp attack, fast decay
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(gainVal, now + 0.012);
gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

osc.connect(gain);
gain.connect(this.masterGain);
osc.start(now);
osc.stop(now + duration + 0.05);
```

}

// Soft wooden click (checkbox tick)
// Brief noise burst through a resonant bandpass filter
playTick() {
if (!this.ctx || !this.enabled) return;
const ctx = this.ctx;
const now = ctx.currentTime;

```
const bufLen = ctx.sampleRate * 0.06;
const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
const d      = buf.getChannelData(0);
for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;

const src  = ctx.createBufferSource();
src.buffer = buf;

const bpf  = ctx.createBiquadFilter();
bpf.type   = 'bandpass';
bpf.frequency.value = 1800;
bpf.Q.value = 8;

const gain = ctx.createGain();
gain.gain.setValueAtTime(this.levels.ui * 0.5, now);
gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

src.connect(bpf);
bpf.connect(gain);
gain.connect(this.masterGain);
src.start(now);
```

}

// Rating button — pitch rises with value (1=low warm, 10=bright)
playRating(value) {
if (!this.ctx || !this.enabled) return;
// Map 1–10 to a pentatonic scale for musical feel
const pentatonic = [196, 220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
const freq = pentatonic[Math.min(value - 1, 9)];
this._tone(freq, ‘sine’, 0.22, this.levels.ui * 0.35);
// Add soft octave above for shimmer
this._tone(freq * 2, ‘sine’, 0.14, this.levels.ui * 0.1, 0.008);
}

// Continue / Next button — soft forward whoosh
playContinue() {
if (!this.ctx || !this.enabled) return;
const ctx  = this.ctx;
const now  = ctx.currentTime;

```
// Rising sweep
const osc  = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = 'sine';
osc.frequency.setValueAtTime(280, now);
osc.frequency.exponentialRampToValueAtTime(420, now + 0.2);
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(this.levels.ui * 0.22, now + 0.04);
gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
osc.connect(gain); gain.connect(this.masterGain);
osc.start(now); osc.stop(now + 0.25);
```

}

// Prompt response appears — very soft bell shimmer
playResponseAppear() {
if (!this.ctx || !this.enabled) return;
// Soft two-note chime — E and G# (major third, gentle)
this._tone(329.6, ‘sine’, 0.45, this.levels.ui * 0.18, 0);
this._tone(415.3, ‘sine’, 0.38, this.levels.ui * 0.12, 0.06);
}

// Bell — used between breathing cycles
playBell(gainMul = 1) {
if (!this.ctx || !this.enabled) return;
const ctx  = this.ctx;
const now  = ctx.currentTime;
const freq = 528; // 528Hz — “love frequency,” widely used in meditation apps

```
// Bell = sine fundamental + inharmonic partials + long decay
[[1, 0.5], [2.756, 0.2], [5.404, 0.08], [8.93, 0.04]].forEach(([ratio, amp]) => {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq * ratio;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(this.levels.ui * amp * gainMul, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
  osc.connect(gain); gain.connect(this.masterGain);
  osc.start(now); osc.stop(now + 3);
});
```

}

// Worksheet / day complete — ascending three-note resolution
playCompletion() {
if (!this.ctx || !this.enabled) return;
// Major triad ascending — C E G — classic resolution
const notes = [261.6, 329.6, 392, 523.3];
notes.forEach((freq, i) => {
setTimeout(() => {
if (!this.ctx) return;
const now  = this.ctx.currentTime;
[[1, 0.45], [2, 0.15], [3, 0.08]].forEach(([ratio, amp]) => {
const osc  = this.ctx.createOscillator();
const gain = this.ctx.createGain();
osc.type = ‘sine’;
osc.frequency.value = freq * ratio;
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(this.levels.ui * amp * 0.7, now + 0.01);
gain.gain.exponentialRampToValueAtTime(0.0001, now + (i === 3 ? 2.5 : 1.2));
osc.connect(gain); gain.connect(this.masterGain);
osc.start(now); osc.stop(now + (i === 3 ? 2.8 : 1.5));
});
}, i * 180);
});
}

// Week complete — richer, more celebratory
playWeekComplete() {
if (!this.ctx || !this.enabled) return;
// Ascending pentatonic cascade with reverb tail
const notes = [261.6, 329.6, 392, 523.3, 659.3];
notes.forEach((freq, i) => {
setTimeout(() => {
if (!this.ctx) return;
const now = this.ctx.currentTime;
[[1,0.5],[2,0.2],[3,0.1],[4,0.05]].forEach(([ratio,amp]) => {
const osc  = this.ctx.createOscillator();
const gain = this.ctx.createGain();
osc.type = ‘sine’;
osc.frequency.value = freq * ratio;
const decay = i === 4 ? 3.5 : 1.5;
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(this.levels.ui * amp * 0.8, now + 0.01);
gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
osc.connect(gain); gain.connect(this.masterGain);
osc.start(now); osc.stop(now + decay + 0.1);
});
}, i * 140);
});
}

// Screen transition — very soft low whoosh
playTransition() {
if (!this.ctx || !this.enabled) return;
const ctx = this.ctx;
const now = ctx.currentTime;
const osc  = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = ‘sine’;
osc.frequency.setValueAtTime(180, now);
osc.frequency.linearRampToValueAtTime(220, now + 0.15);
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(this.levels.ui * 0.12, now + 0.04);
gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
osc.connect(gain); gain.connect(this.masterGain);
osc.start(now); osc.stop(now + 0.2);
}

// SOS activated — immediate grounding tone
playSOSActivate() {
if (!this.ctx || !this.enabled) return;
const ctx = this.ctx;
const now = ctx.currentTime;
// Deep grounding tone — 174Hz (lowest Solfeggio frequency)
[[174, 0.4], [348, 0.15], [261, 0.1]].forEach(([freq, amp]) => {
const osc  = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = ‘sine’;
osc.frequency.value = freq;
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(this.levels.ui * amp, now + 0.3);
gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
osc.connect(gain); gain.connect(this.masterGain);
osc.start(now); osc.stop(now + 2.8);
});
}

// Navigation tab tap
playNavTap() {
if (!this.ctx || !this.enabled) return;
this._tone(440, ‘sine’, 0.08, this.levels.ui * 0.15);
}

// Intention saved
playIntentionSaved() {
if (!this.ctx || !this.enabled) return;
this._tone(392, ‘sine’, 0.3, this.levels.ui * 0.25, 0);
this._tone(494, ‘sine’, 0.3, this.levels.ui * 0.2, 0.12);
}

// ── Toggle ────────────────────────────────────────────────
toggle() {
this.enabled = !this.enabled;
localStorage.setItem(‘safe_sound’, this.enabled ? ‘on’ : ‘off’);
if (this.ctx && this.masterGain) {
const now = this.ctx.currentTime;
this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
if (!this.enabled) {
this.masterGain.gain.linearRampToValueAtTime(0, now + 0.3);
} else {
this.masterGain.gain.linearRampToValueAtTime(this.levels.master, now + 0.5);
}
}
if (!this.enabled) this.stopAmbient(0.3);
return this.enabled;
}

isEnabled() { return this.enabled; }
}

// ── Singleton ─────────────────────────────────────────────────
window.SAFE_SOUND = new SAFEAudio();

// Init on first user interaction
const _initSound = async () => {
await window.SAFE_SOUND.init();
document.removeEventListener(‘touchstart’, _initSound);
document.removeEventListener(‘mousedown’, _initSound);
document.removeEventListener(‘keydown’, _initSound);
};
document.addEventListener(‘touchstart’, _initSound, { once:true, passive:true });
document.addEventListener(‘mousedown’,  _initSound, { once:true });
document.addEventListener(‘keydown’,    _initSound, { once:true });

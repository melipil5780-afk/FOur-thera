// ═══════════════════════════════════════════════════════════
// SAFE — Response Intelligence Engine
// Pre-written therapeutic responses · Zero API cost
// Keyword detection · Rating branching · Pattern memory
// ═══════════════════════════════════════════════════════════

const RESPONSE_ENGINE = (() => {

  // ── Keyword detection ──────────────────────────────────────
  const EMOTION_WORDS = {
    shame:       ['shame','ashamed','embarrass','worthless','broken','defective','pathetic','not enough','failure','fraud'],
    grief:       ['grief','loss','lost','miss','mourn','gone','died','death','sad','cry','crying','bereaved'],
    anger:       ['anger','angry','furious','rage','resent','unfair','hate','frustrat','bitter'],
    loneliness:  ['alone','lonely','isolated','no one','nobody','disconnect','invisible','unseen','abandoned'],
    helpless:    ['helpless','powerless','stuck','trapped','hopeless','no control','can\'t do anything','no way out'],
    perfectionism:['perfect','not enough','failure','fail','mistake','should have','must be','have to be'],
    catastrophe: ['die','dying','worst','disaster','catastrophe','never recover','everything falls apart','ruined'],
    always_never:['always','never','everyone','nobody','everything','nothing','forever','no one ever','every time'],
  };

  const TRAP_WORDS = {
    catastrophizing: ['worst','terrible','disaster','catastrophe','ruined','destroy','end of'],
    all_or_nothing:  ['always','never','everyone','nobody','completely','totally','absolutely','entirely'],
    mind_reading:    ['they think','she thinks','he thinks','they must think','people think','everyone thinks'],
    fortune_telling: ['will fail','going to fail','will go wrong','won\'t work','it\'s going to'],
    personalization: ['my fault','because of me','i caused','i made them','i ruined'],
  };

  function detect(text) {
    if (!text || typeof text !== 'string') return {};
    const t = text.toLowerCase();
    const found = {};
    Object.entries(EMOTION_WORDS).forEach(([k,words]) => { if(words.some(w=>t.includes(w))) found[k]=true; });
    Object.entries(TRAP_WORDS).forEach(([k,words]) => { if(words.some(w=>t.includes(w))) found['trap_'+k]=true; });
    found.short = t.trim().length < 15;
    found.long  = t.trim().length > 180;
    found.has   = t.trim().length > 10;
    return found;
  }

  function rateTone(n) {
    if (n <= 3) return 'low';
    if (n <= 6) return 'med';
    if (n <= 8) return 'high';
    return 'max';
  }

  // ── Response library ───────────────────────────────────────
  const R = {
    anxiety: {
      low:  "Something softer today — worth pausing to notice. Not every moment is a crisis, even when the mind insists otherwise.",
      med:  "That middle range is where most of the real work happens. Not flooded, not numb — present enough to practice.",
      high: "High intensity right now. That makes showing up here all the more meaningful. This is the nervous system you're learning to work with.",
      max:  "A 9 or 10 is your system at full alarm. Before anything else: one slow breath out through your mouth. Long exhale. You don't have to fix this — just be here."
    },
    tension: {
      low:  "A relatively settled body today. Your baseline isn't always flooded — that's worth knowing.",
      med:  "Medium tension often lives so far in the background we stop noticing it. You noticed it. That's the first move.",
      high: "Your body is working hard to keep you safe right now. It doesn't need to work quite so hard here.",
      max:  "That level of physical tension is exhausting to carry. The act of noticing it — without trying to fix it — can begin to soften it."
    },
    progress: {
      low:  "Early days. You're not supposed to be skilled at this yet — you're learning to see it. That's enough.",
      med:  "Something is shifting, even if it doesn't feel dramatic yet. These skills build quietly and then suddenly feel automatic.",
      high: "That's real progress — not just reported, but felt. Hold onto that evidence for when your mind says nothing is changing.",
      max:  "That kind of growth is significant. Trust it even when the doubting mind shows up."
    },
    willingness: {
      low:  "Low willingness right now — and that's honest. Willingness isn't a feeling you wait for. It's a decision. You made it by opening this.",
      med:  "Some willingness, some resistance — that tension is actually the sweet spot. Not forcing, not collapsing.",
      high: "High willingness. That's courage in quiet form. Most people never get here.",
      max:  "That level of willingness is rare. Remember this moment when the resistance returns — and it will."
    },
    emotion: {
      shame:       "Shame underneath anxiety is one of the hardest combinations — because shame feels like the truth about you, not just a feeling you're having. It isn't the truth. It's an old story lodged very deep. Naming it here is already an act of defiance against it.",
      grief:       "Grief lives underneath more anxiety than people realize. When we haven't fully mourned something — a person, a version of life, a relationship — anxiety often holds the space for it. Naming the grief, even just here, begins something.",
      anger:       "Anger underneath anxiety is common and underacknowledged. Often anxiety is safer to feel than anger — because anger feels dangerous. But the anger is information. Something matters, something felt unfair, something crossed a line.",
      loneliness:  "Loneliness underneath anxiety is one of the quietest, most painful combinations. The anxious mind interprets disconnection as evidence of unworthiness. It almost never is. You're here. That's a form of reaching.",
      helpless:    "Helplessness underneath anxiety is draining — the mind circling what it can't control. The work isn't solving the unsolvable. It's finding what you can do, even one small thing, and doing that.",
      perfectionism:"The perfectionism-anxiety link is tight and often invisible. 'Not enough' is a story the anxious mind tells as fact. Worth asking: enough by whose standard — and when did you agree to that standard?",
      catastrophe: "The catastrophizing mind rehearses disaster as if preparation will make it survivable. It won't — but it does make the present unbearable. Notice the thought. Name it. That's the interruption.",
      always_never: "Words like 'always' and 'never' are worth catching. The anxious mind overgeneralizes — one event becomes a permanent law. What's the one exception to that 'always' or 'never' you just wrote?",
    },
    trap: {
      catastrophizing:   "That's catastrophizing — jumping to the most extreme outcome as if it's the most likely one. What's the realistic version?",
      all_or_nothing:    "That black-and-white language — always, never, completely — is a flag worth noticing. Reality almost always lives in the middle.",
      mind_reading:      "We're rarely as certain about others' thoughts as we feel in the moment. That certainty is usually our own fear reflected back.",
      fortune_telling:   "You're predicting the future as fact. The honest answer in most cases: you don't know. Neither does the anxiety.",
      personalization:   "Taking full responsibility for something with many causes is over-attribution. You weren't the only variable in that situation.",
    },
    phase: {
      SEE:    "The SEE phase is just about seeing clearly — not fixing, not changing. Honest observation is harder than it sounds and more powerful than it seems.",
      ACCEPT: "The ACCEPT phase asks something counterintuitive: stop fighting what you feel and see what happens. Everything that follows is built on this foundation.",
      FREE:   "You're in the FREE phase — actively working with the content of anxiety rather than just observing it. This is where the real restructuring happens.",
      ENGAGE: "The ENGAGE phase is where skills translate into life. You're not just building insight now — you're building proof.",
    },
    week: {
      1:  "Week 1. You're at the very beginning of something that takes real courage to start. Most people never do.",
      3:  "You've completed your first full map of the anxiety loop. You now know more about your own anxiety than most people ever will.",
      4:  "Defusion is the beginning of the most important shift in this curriculum — from being your thoughts to having your thoughts. That difference is everything.",
      8:  "Five weeks into the ACCEPT phase. Learning to stop fighting what you feel is not small work.",
      9:  "Moving into FREE. This is where many people feel the most tangible change — because you're actively restructuring now.",
      12: "Facing the existential 'what ifs' is some of the bravest work in this curriculum. Most people avoid this territory entirely.",
      15: "End of the FREE phase. Seven weeks of deep skill work. You now have more anxiety tools than most people who've been in therapy for years.",
      16: "Self-compassion is not a soft add-on. It's one of the most evidence-based interventions for anxiety that exists.",
      20: "Week 20. The final week. Whatever you feel right now — celebration, relief, or something more complicated — it's exactly right.",
    },
    generic: [
      "That took something to write.",
      "Real and honest. Keep going.",
      "Worth sitting with.",
      "Every answer here is information — about you, for you.",
      "You're building clarity, even when it doesn't feel that way.",
      "That kind of honesty with yourself is rare.",
    ],
    short: "Take your time. Even a word or two is a real answer.",
    long:  "You went deep there. That level of honesty with yourself is exactly what this work asks for — and exactly what it rewards.",
  };

  // ── Pattern memory ─────────────────────────────────────────
  function patternInsight(state) {
    if (!state) return null;
    const keys = Object.keys(state.completedWorksheets || {});
    if (keys.length < 4) return null;

    // Anxiety rating trend
    const ratings = [];
    keys.forEach(k => {
      const rs = (state.completedWorksheets[k] || {}).responses || {};
      Object.values(rs).forEach(r => { if (typeof r === 'number' && r >= 1 && r <= 10) ratings.push(r); });
    });
    if (ratings.length >= 6) {
      const a = ratings.slice(0,4).reduce((s,x)=>s+x,0)/4;
      const b = ratings.slice(-4).reduce((s,x)=>s+x,0)/4;
      if (b < a - 1.5) return `Your anxiety ratings have dropped about ${Math.round(a-b)} points on average since you started. That's measurable — not imagined.`;
    }

    // SOS log
    const log = state.sosLog || [];
    if (log.length >= 3) {
      const pct = Math.round(log.filter(s=>s.helped).length / log.length * 100);
      if (pct >= 60) return `Your SOS tools have helped ${pct}% of the times you've reached for them. You're learning which tools work for your nervous system.`;
    }

    const done = (state.completedWeeks || []).length;
    if (done >= 3) return `${done} weeks completed. Each one is four worksheets and a set of skills your nervous system is quietly internalizing — even when it doesn't feel that way.`;
    return null;
  }

  // ── Main function ──────────────────────────────────────────
  function getResponse({ type, label, answer, idx, weekNum, phase, state }) {
    // 1. Pattern insight — surprise them occasionally
    if (idx === 0 && Math.random() < 0.2) {
      const insight = patternInsight(state);
      if (insight) return { text: insight, cls: 'insight' };
    }

    // 2. Week-specific — first prompt of the worksheet
    if (idx === 0 && R.week[weekNum]) return { text: R.week[weekNum], cls: 'week' };

    // 3. Rating responses
    if (type === 'rating' && typeof answer === 'number') {
      const tone = rateTone(answer);
      const l = (label || '').toLowerCase();
      if (l.includes('anxiety') || l.includes('activat') || l.includes('anxious')) return { text: R.anxiety[tone],    cls:'rating' };
      if (l.includes('tension') || l.includes('body'))                               return { text: R.tension[tone],   cls:'rating' };
      if (l.includes('willing'))                                                      return { text: R.willingness[tone], cls:'rating' };
      return { text: R.progress[tone], cls:'rating' };
    }

    // 4. Checkboxes
    if (type === 'checks') {
      if (!Array.isArray(answer) || answer.length === 0)
        return { text: "Nothing checked — or maybe nothing quite fit. The most honest answer is sometimes 'none of these.'", cls:'generic' };
      return { text: "What you checked is a map of your inner landscape. That map is useful.", cls:'generic' };
    }

    // 5. Text — keyword detection
    if (type === 'text' || type === 'twocol') {
      const raw = typeof answer === 'string' ? answer
        : (answer && typeof answer === 'object' ? `${answer.l||''} ${answer.r||''}` : '');
      if (!raw || raw.trim().length < 3) return { text:"Take your time. Even a word or two counts.", cls:'gentle' };

      const d = detect(raw);
      if (d.short) return { text: R.short, cls:'generic' };
      if (d.long)  return { text: R.long,  cls:'affirm' };

      // Emotion keywords — priority order
      for (const k of ['shame','grief','loneliness','helpless','anger','perfectionism','catastrophe','always_never']) {
        if (d[k]) return { text: R.emotion[k], cls:'emotional' };
      }

      // Thinking traps
      for (const k of ['catastrophizing','all_or_nothing','mind_reading','fortune_telling','personalization']) {
        if (d['trap_'+k]) return { text: R.trap[k], cls:'cognitive' };
      }

      // Phase response — 35% chance to give phase context
      if (d.has && Math.random() < 0.35 && R.phase[phase]) return { text: R.phase[phase], cls:'phase' };
    }

    // 6. Generic fallback
    return { text: R.generic[Math.floor(Math.random()*R.generic.length)], cls:'generic' };
  }

  const INTROS = ["","","","Next question.","Here's the next one.","Take your time with this.","No right answer here."];
  function promptIntro(idx) {
    if (idx === 0) return "Let's begin.";
    return INTROS[Math.floor(Math.random()*INTROS.length)];
  }

  const COMPLETIONS = [
    "Worksheet complete. Every one matters.",
    "Done. The skill you practiced today is one your nervous system is beginning to recognize.",
    "Complete. You showed up. That's the whole game — consistently, over time.",
    "Finished. Notice how you feel compared to when you opened this.",
    "That's a wrap. The work you do here is where the real change happens.",
  ];
  function completion() { return COMPLETIONS[Math.floor(Math.random()*COMPLETIONS.length)]; }

  return { getResponse, promptIntro, completion };
})();

window.RESPONSE_ENGINE = RESPONSE_ENGINE;

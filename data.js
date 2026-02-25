// ═══════════════════════════════════════════════════════════
// SAFE ANXIETY CURRICULUM — Data
// 20 weeks · 80 worksheets · Spaced repetition · SOS tools
// ═══════════════════════════════════════════════════════════

const PHASES = {
  SEE:    { name: 'SEE',    label: 'See — Awareness',              weeks: '1–3',  cls: 'see',    color: '#2e8b9a' },
  ACCEPT: { name: 'ACCEPT', label: 'Accept — Defusion & Willingness', weeks: '4–8',  cls: 'accept', color: '#8b82c4' },
  FREE:   { name: 'FREE',   label: 'Free — Restructuring & Regulation', weeks: '9–15', cls: 'free',   color: '#5a8a6e' },
  ENGAGE: { name: 'ENGAGE', label: 'Engage — Values & Action',    weeks: '16–20', cls: 'engage', color: '#c97b3a' },
};

// Prompt types: text | rating | checks | twocol | note
function ws(day, title, instruction, prompts, intention) {
  return { day, title, instruction, prompts, intention };
}
function text(label, lines) { return { type:'text', label, lines: lines||3 }; }
function rating(label, lo, hi) { return { type:'rating', label, lo: lo||'Not at all', hi: hi||'Extremely' }; }
function checks(label, items) { return { type:'checks', label, items }; }
function twocol(l, r) { return { type:'twocol', l, r }; }
function note(text) { return { type:'note', text }; }

// ── SOS SKILLS LIBRARY (unlocked progressively) ─────────────
const SOS_SKILLS = [
  {
    id: 'breathing_478',
    name: '4-7-8 Breathing',
    unlocksAfterWeek: 1,
    type: 'breathing',
    desc: 'Activates your vagus nerve. Exhale longer than inhale.',
    steps: [
      { phase:'inhale', label:'Breathe in through your nose', duration:4 },
      { phase:'hold',   label:'Hold gently', duration:7 },
      { phase:'exhale', label:'Breathe out slowly through your mouth', duration:8 },
    ],
    cycles: 4
  },
  {
    id: 'grounding_54321',
    name: '5-4-3-2-1 Grounding',
    unlocksAfterWeek: 1,
    type: 'steps',
    desc: 'Brings you back to the present moment.',
    steps: [
      '5 things you can see right now — name them',
      '4 things you can physically touch — feel the texture',
      '3 things you can hear',
      '2 things you can smell (or imagine)',
      '1 thing you can taste — take a breath'
    ]
  },
  {
    id: 'defusion_label',
    name: 'Name the Thought',
    unlocksAfterWeek: 4,
    type: 'steps',
    desc: 'Create distance from the anxious thought.',
    steps: [
      'Notice the thought that\'s causing distress',
      'Say to yourself: "I\'m having the thought that..."',
      'Repeat the thought with that prefix 3 times',
      'Notice: is the thought the same, or slightly less powerful?',
      'Remember: a thought is not a fact. It\'s just your mind doing its job.'
    ]
  },
  {
    id: 'expansion',
    name: 'Expansion Breath',
    unlocksAfterWeek: 6,
    type: 'steps',
    desc: 'Make room for the anxious feeling instead of fighting it.',
    steps: [
      'Find the most prominent anxious sensation in your body',
      'Instead of tensing against it — breathe INTO that space',
      'Imagine the breath opening up around the sensation',
      'Not pushing it out — giving it room to exist',
      'Breathe this way for 5–10 slow breaths. Notice any shift.'
    ]
  },
  {
    id: 'urge_surf',
    name: 'Urge Surfing',
    unlocksAfterWeek: 7,
    type: 'steps',
    desc: 'Ride the anxiety wave instead of acting on it.',
    steps: [
      'Notice the urge — to check, escape, seek reassurance',
      'Don\'t act on it. Just observe it like a wave.',
      'Rate it 1–10. Watch it build.',
      'The peak lasts at most 90 seconds. Stay with it.',
      'Notice as the wave begins to fall on its own.'
    ]
  },
  {
    id: 'safe_place',
    name: 'Safe Place',
    unlocksAfterWeek: 9,
    type: 'steps',
    desc: 'Your inner resource — available anytime.',
    steps: [
      'Close your eyes. Bring to mind your safe place.',
      'See it clearly — the light, the shapes, the space.',
      'Hear it — any sounds, or comfortable silence.',
      'Feel the temperature, the surface beneath you.',
      'Breathe here for 2–3 minutes. You can always return.'
    ]
  },
  {
    id: 'self_compassion',
    name: 'Self-Compassion Break',
    unlocksAfterWeek: 16,
    type: 'steps',
    desc: 'Three steps to meet yourself with kindness.',
    steps: [
      '"This is a moment of suffering." Name it honestly.',
      '"I am not alone — others struggle like this too."',
      'Place a hand on your heart. Feel its warmth.',
      '"What do I need right now?" Ask gently.',
      'Offer yourself one small act of kindness.'
    ]
  },
  {
    id: 'physio_sigh',
    name: 'Physiological Sigh',
    unlocksAfterWeek: 13,
    type: 'steps',
    desc: 'The fastest breath for acute anxiety.',
    steps: [
      'Inhale fully through your nose',
      'Take a quick second sniff in to fill your lungs completely',
      'Exhale slowly and completely through your mouth',
      'Let the exhale be long — release everything',
      'Repeat 3–5 times. This is your fastest reset.'
    ]
  },
];

// ── CURRICULUM ──────────────────────────────────────────────
const CURRICULUM = [

  // ════════════════════════════════════════
  // PHASE: SEE (Weeks 1–3)
  // ════════════════════════════════════════
  {
    week: 1, phase: 'SEE',
    title: 'Meeting Your Anxiety',
    skill: 'Anxiety Mapping + Your First Regulation Tool',
    intro: 'Before you try to change anything, you need to see clearly. This week you get to know your anxiety — how it shows up in your body, thoughts, and behavior — and you learn your first practical regulation tool. Awareness plus one body-based tool is the foundation for everything that follows.',
    readinessQuestion: 'Did you use 4-7-8 breathing at least once when you felt anxious this week?',
    worksheets: [
      ws('Day 1', 'Your Anxiety Portrait',
        'Anxiety shows up differently in every person. This is about honest, curious observation — not fixing, not judging. There are no right answers.',
        [
          text('In two or three sentences, what does your anxiety feel like from the inside?', 3),
          twocol('Physical sensations when anxious (heart, chest, stomach, breathing...):', 'Thoughts that tend to show up when anxious:'),
          text('What does anxiety make you do — or avoid doing?', 3),
          rating('On average this week, my anxiety level has been:', 'Barely there', 'Overwhelming'),
        ],
        'This week, when I notice anxiety rising, I will pause and observe it for 30 seconds before reacting.'
      ),
      ws('Day 2', 'Body Scan — First Contact',
        'Anxiety lives in the body before it reaches the mind. Spend 2–3 minutes doing a slow scan from head to feet. Just notice — don\'t try to change anything.',
        [
          text('Head, neck, jaw, face — what do I notice?', 2),
          text('Chest, shoulders, upper back — what do I notice?', 2),
          text('Stomach, gut, diaphragm — what do I notice?', 2),
          text('Arms, hands, legs, feet — what do I notice?', 2),
          rating('My body tension level right now:', 'Completely relaxed', 'Very tight / activated'),
          text('What was it like to pay attention to your body without trying to fix it?', 2),
        ],
        'Tomorrow, I will do a 2-minute body scan before I check my phone in the morning.'
      ),
      ws('Day 3', '4-7-8 Breathing — Your First Tool',
        'You cannot think your way out of anxiety when your nervous system is flooded. The 4-7-8 breath is your first body-based tool: inhale 4 counts, hold 7, exhale 8. The long exhale activates the vagus nerve. Do 4 cycles right now, then write.',
        [
          note('If holding 7 counts feels too long, try 4-4-6. What matters is that the exhale is always longer than the inhale.'),
          rating('My anxiety BEFORE the breathing:', 'Calm', 'Very activated'),
          rating('My anxiety AFTER the breathing:', 'Calm', 'Very activated'),
          text('What did I notice during or after the breathing? Any shift in body or mind?', 3),
          text('How easy or hard was it to focus on the breath? What interfered?', 2),
        ],
        'I will use 4-7-8 breathing the next time I feel anxious — before doing anything else.'
      ),
      ws('Day 4', 'Trigger Log + Week 1 Reflection',
        'Triggers can be situations, people, times of day, specific thoughts, or physical sensations. This week you start noticing patterns.',
        [
          text('Two situations this week that triggered or increased anxiety:', 3),
          twocol('What happened just before the anxiety spiked?', 'What did I do in response?'),
          text('The most important thing I noticed about my anxiety this week:', 3),
          text('One pattern I want to keep paying attention to:', 2),
        ],
        'Next week, I will notice at least one trigger and write down what happened before and after.'
      ),
    ]
  },

  {
    week: 2, phase: 'SEE',
    title: 'The Emotion Underneath',
    skill: 'Emotion Differentiation — EFT-Informed',
    intro: 'Anxiety is often a secondary emotion — a protective layer covering something deeper. Underneath anxiety there is often grief, shame, anger, loneliness, or fear of abandonment. When we never touch the primary emotion, the anxiety has nowhere to go. This week you start looking deeper. Use your 4-7-8 breath if things feel intense.',
    readinessQuestion: 'Did you identify at least one emotion underneath your anxiety this week?',
    worksheets: [
      ws('Day 1', 'Anxiety or Something Else?',
        'Think of a recent anxious moment. Take two 4-7-8 breaths. Then read the list below slowly — feel into what resonates, not just what makes rational sense.',
        [
          text('Describe the anxious situation briefly:', 2),
          checks('Could any of these be underneath the anxiety?', [
            'Fear of loss — losing someone or something I need',
            'Grief or sadness — something not fully mourned',
            'Shame — a deep sense of not being enough',
            'Anger or resentment — something unfair but unsafe to express',
            'Loneliness — a sense of being fundamentally alone',
            'Fear of rejection — of being abandoned or cast out',
            'Helplessness — feeling no control over what matters',
            'Fear of the unknown — the terror of not being able to predict what comes',
          ]),
          text('If the anxiety is the surface of the water, what might be at the bottom?', 3),
        ],
        'This week, when I feel anxious, I will pause and ask: "Is there another feeling underneath this?"'
      ),
      ws('Day 2', 'Making Contact with the Primary Emotion',
        'Today you\'ll gently make contact with one primary emotion — not to fix it, not to explain it away, but to acknowledge it. Go slowly. Use your breath if it feels intense.',
        [
          text('The primary emotion I\'m choosing to sit with today:', 1),
          text('Where do I feel it in my body? (Be specific — chest, throat, stomach...)', 2),
          text('If this emotion could speak, what would it say? What does it need?', 3),
          text('What makes complete sense about feeling this way?', 3),
          rating('After spending time with this emotion (not fighting it), my anxiety level:', 'Much lower', 'Unchanged or higher'),
        ],
        'I will practice naming the emotion underneath anxiety at least once this week — just naming it, nothing more.'
      ),
      ws('Day 3', 'The Emotion Story',
        'Emotions carry history. A current situation often activates anxiety because it echoes something earlier. This is not about blame — it is about understanding. Understanding reduces mystery, and reduced mystery reduces anxiety.',
        [
          text('A situation that makes me anxious right now:', 2),
          text('Does this remind me — even faintly — of something from earlier in my life?', 3),
          text('What did I need then that I didn\'t get?', 2),
          text('How might my younger self be showing up in my anxiety today?', 3),
        ],
        'I will sit with one old emotion this week — just for 2 minutes — without trying to fix it.'
      ),
      ws('Day 4', 'Emotion Vocabulary + Week 2 Reflection',
        'Research shows that people who can name emotions precisely — distinguishing "anxious" from "ashamed," "angry" from "hurt" — are less overwhelmed by them. Specificity gives the brain something to work with.',
        [
          text('List every emotion I felt this week — stretch beyond "anxious" and "stressed":', 4),
          twocol('The emotion hardest to sit with this week:', 'Why I think it\'s hard:'),
          text('One thing I\'m learning about what lives underneath my anxiety:', 3),
        ],
        'Next week, I will name at least one emotion per day — the real one, not just "stressed."'
      ),
    ]
  },

  {
    week: 3, phase: 'SEE',
    title: 'The Anxiety Loop',
    skill: 'The CBT Cycle — Understanding What Keeps Anxiety Alive',
    intro: 'Anxiety is not random — it runs in a loop. A trigger fires a thought, the thought produces a feeling, the feeling drives a behavior, and the behavior — especially avoidance — feeds the loop. You can\'t break a loop you can\'t see. This week you map yours.',
    readinessQuestion: 'Can you describe your personal anxiety loop — trigger, thought, feeling, behavior — for at least one situation?',
    worksheets: [
      ws('Day 1', 'Mapping My Anxiety Loop',
        'Trace one complete loop from your own life. Be specific — this is detective work, not self-criticism.',
        [
          text('Situation / Trigger:', 2),
          text('Automatic thought (the first thing your mind said):', 2),
          text('Emotion + body sensation:', 2),
          text('What I did (or avoided doing):', 2),
          twocol('How this behavior helped short-term:', 'What it cost me long-term:'),
        ],
        'This week, I will notice one anxiety loop in real time and write it down immediately after.'
      ),
      ws('Day 2', 'Safety Behaviors Inventory',
        'Safety behaviors reduce anxiety briefly — then maintain it long-term by preventing you from discovering you could have handled it. These are not weaknesses; they are learned responses.',
        [
          checks('I use these to manage anxiety (check all that apply):', [
            'Avoiding situations, people, or conversations',
            'Leaving situations early (escape)',
            'Checking — locks, body symptoms, messages, safety',
            'Seeking reassurance from others repeatedly',
            'Over-researching / googling health or risks',
            'Over-preparing to eliminate uncertainty',
            'Staying very busy to not have to feel',
            'Distraction — scrolling, TV, food',
            'Mental rehearsal / replaying events or conversations',
            'Procrastinating on anxiety-provoking tasks',
            'Minimizing my own needs to avoid conflict',
          ]),
          text('The safety behavior that costs me the most — and how:', 3),
        ],
        'I will notice my most-used safety behavior this week and pause for 10 seconds before using it.'
      ),
      ws('Day 3', 'The Avoidance Tax',
        'Every time we avoid something anxiety-provoking, the world gets a little smaller and anxiety gets a little stronger. Seeing the real cost is what builds motivation to change.',
        [
          text('Something I have been avoiding (big or small):', 2),
          text('How long I have been avoiding it:', 1),
          twocol('What avoiding it costs me (relationships, opportunities, self-respect):', 'What my life would look like if I stopped avoiding this:'),
          rating('My readiness to eventually face this:', 'Not at all ready', 'Ready to start'),
        ],
        'I will acknowledge the avoidance tax I\'m paying — even just to myself — once this week.'
      ),
      ws('Day 4', 'Phase 1 Reflection — SEE',
        'You\'ve spent three weeks in the SEE phase. You\'ve built an honest picture of your anxiety: how it feels, what lives underneath, and the loop that keeps it alive. This is not small work.',
        [
          text('The most important thing I\'ve learned about my anxiety in these three weeks:', 3),
          text('The pattern I notice most clearly:', 2),
          text('The emotion underneath my anxiety that feels most significant:', 2),
          text('The safety behavior I most want to work on:', 2),
          rating('My self-understanding of my anxiety now compared to Week 1:', 'About the same', 'Much clearer'),
        ],
        'Moving into Phase 2, I will bring one insight from these three weeks with me. That insight is:'
      ),
    ]
  },

  // ════════════════════════════════════════
  // PHASE: ACCEPT (Weeks 4–8)
  // ════════════════════════════════════════
  {
    week: 4, phase: 'ACCEPT',
    title: 'Unhooking from Anxious Thoughts — Part 1',
    skill: 'Cognitive Defusion (ACT) — The Fundamentals',
    intro: 'In ACT, "fusion" means being so merged with a thought it feels like reality. "Defusion" means stepping back to see the thought as a thought — not a fact, not a command. Anxious thoughts lose enormous power when you stop arguing with them and start watching them.',
    readinessQuestion: 'Did you use a defusion technique at least twice this week when an anxious thought showed up?',
    worksheets: [
      ws('Day 1', 'Thoughts Are Not Facts',
        'Your mind generates thoughts constantly, including many alarming ones. A thought being convincing does not make it accurate. Today: I am not my thoughts. I have thoughts.',
        [
          text('Three anxious thoughts I\'ve had recently:', 3),
          text('For each one: is it a fact, or an interpretation, prediction, or story?', 3),
          text('Has an anxious thought ever felt completely certain — and turned out to be wrong?', 3),
          note('The feeling of certainty is not evidence. Anxiety makes things feel inevitable — that\'s a feature of anxiety, not a feature of reality.'),
        ],
        'This week, when I have an anxious thought, I will ask: "Is this a fact, or is this a story my mind is telling?"'
      ),
      ws('Day 2', '"I Am Having the Thought That..."',
        'Instead of thinking "I\'m going to fail," say: "I notice I\'m having the thought that I\'m going to fail." The extra phrase creates psychological distance. It doesn\'t make the thought go away — it changes your relationship to it.',
        [
          text('Write 4 anxious thoughts from this week, each starting with "I notice I\'m having the thought that...":', 6),
          rating('After rephrasing, how much did the thoughts lose their grip?', 'No change', 'Much less power'),
          text('What was it like to observe the thoughts rather than be inside them?', 3),
        ],
        'Today, I will use "I notice I\'m having the thought that..." with the next anxious thought that arrives.'
      ),
      ws('Day 3', 'My Mind\'s Favorite Stations',
        'Imagine your anxious mind is a radio playing in the background. Naming the station creates distance from the content.',
        [
          checks('My mind\'s most-played anxiety stations:', [
            'Catastrophe FM — worst-case scenario broadcasting',
            'What-If Radio — endless hypothetical disasters',
            'Not Enough Network — you\'re failing, behind, inadequate',
            'Control Tower — must manage and prevent all risks',
            'Danger Alert 24/7 — hypervigilance, something is wrong',
            'Replay TV — looping past mistakes and painful moments',
            'Fortune Teller Channel — predicting a bad future',
            'People Pleaser Radio — what are they thinking? Are they upset?',
          ]),
          text('My most-played station and what it usually says:', 3),
          text('Practice: write a thought, then say "My mind is playing [station name] again." How does it feel?', 3),
        ],
        'I will name my anxiety station at least once today: "There goes [name] again."'
      ),
      ws('Day 4', 'Defusion Practice Review',
        'Defusion doesn\'t eliminate thoughts — it changes your relationship to them. Even a small shift matters.',
        [
          twocol('Thoughts I got hooked by this week:', 'Thoughts I successfully stepped back from:'),
          text('The defusion technique I found most useful:', 2),
          text('A phrase I\'m developing to remind myself that thoughts are not facts:', 2),
          rating('My ability to observe thoughts rather than be ruled by them:', 'Still very fused', 'Getting real distance'),
        ],
        'I will practice defusion once a day this week — even for 30 seconds.'
      ),
    ]
  },

  {
    week: 5, phase: 'ACCEPT',
    title: 'Unhooking from Anxious Thoughts — Part 2',
    skill: 'Advanced Defusion — Imagery, Story-Naming, and the Thanking Mind',
    intro: 'Defusion takes repetition before it becomes a reflex. This week you go deeper — practicing the techniques in more challenging moments and building a repertoire you can reach for automatically. The goal is not to silence the mind. It is to no longer be at its mercy.',
    readinessQuestion: 'Can you name your most common anxious "story" — and notice it as a story rather than the truth?',
    worksheets: [
      ws('Day 1', 'Leaves on a Stream',
        'Set a timer for 3 minutes. Close your eyes. Imagine a gentle stream with leaves floating by. As each thought arises, place it on a leaf and let it float downstream. Don\'t push the leaves. Don\'t follow them. Then write.',
        [
          text('Thoughts that came during the exercise (just list them):', 3),
          text('Did any thoughts pull me in — make me follow them instead of watching? Which ones?', 2),
          text('What did it feel like to watch thoughts pass without engaging?', 3),
          rating('How much did this practice create a sense of space from my thoughts?', 'No space', 'Significant space'),
        ],
        'I will do the leaves-on-a-stream practice for 3 minutes tomorrow morning.'
      ),
      ws('Day 2', 'Naming the Story',
        'Our minds tell stories — often repeatedly. Naming the story shifts it from "the truth" to "a story my mind tells." Try: "There goes the Not Good Enough Story again."',
        [
          text('The recurring anxiety story my mind tells most often:', 3),
          text('Give this story a name (e.g., "The Disaster Story," "The Rejection Story"):', 1),
          text('When I say "There goes [my story] again" — what happens?', 3),
          text('How old does this story feel? Has your mind been telling it for a long time?', 2),
        ],
        'Every time this story shows up this week, I will name it out loud or in my head.'
      ),
      ws('Day 3', 'Thank You, Mind',
        'When an anxious thought arrives, try saying — genuinely, not sarcastically — "Thank you, mind, for trying to protect me." Your mind is not your enemy. It\'s an overprotective guard dog.',
        [
          text('Three thoughts I thanked my mind for today:', 3),
          text('What was your mind trying to protect you from in each case?', 3),
          text('What was it like to feel some warmth toward your anxious mind rather than frustration?', 3),
        ],
        'When the next anxious thought arrives, I will pause and say "thank you" to my mind before anything else.'
      ),
      ws('Day 4', 'Defusion Under Pressure',
        'Defusion is easier when calm. The real test is using it when anxiety is high. Today you prepare for those harder moments.',
        [
          text('A recent situation when anxiety was high and defusion would have helped:', 2),
          text('Which defusion technique might have helped most in that moment?', 2),
          twocol('Situations this week where I\'ll practice defusion:', 'The technique I\'ll use:'),
          text('What I\'m learning about my relationship to my own thoughts:', 3),
        ],
        'I will choose one high-anxiety moment this week to practice defusion deliberately, even for 60 seconds.'
      ),
    ]
  },

  {
    week: 6, phase: 'ACCEPT',
    title: 'Making Room — Willingness Part 1',
    skill: 'ACT Acceptance — The Struggle Switch + Expansion',
    intro: 'Fighting anxiety makes it stronger. The struggle against anxiety adds a second layer of suffering. What we resist, persists. Willingness — sometimes called radical acceptance — does not mean liking anxiety or giving up. It means making room for it to be there while still living your life.',
    readinessQuestion: 'Did you practice willingness at least once this week — staying with discomfort instead of escaping it?',
    worksheets: [
      ws('Day 1', 'The Struggle Switch',
        'When the struggle switch is ON, every anxious feeling becomes a problem to fight. That fighting adds enormous energy to the anxiety. When the switch is OFF, the feeling is still there — but you\'re not at war with it.',
        [
          text('Describe a recent moment when you fought hard against anxiety:', 3),
          text('What happened when you fought it? Did it shrink or grow?', 2),
          text('What might "turning off the struggle switch" look like in that same moment?', 3),
          rating('How much am I currently in struggle with my anxiety?', 'Not struggling at all', 'Constant war with it'),
        ],
        'When anxiety shows up today, I will try turning off the struggle switch — just for 5 minutes.'
      ),
      ws('Day 2', 'DARE — Inviting Anxiety In',
        'The DARE technique flips the script: instead of running from anxiety, you say "come on then — show me what you\'ve got." Choose something small that makes you anxious. Stay with it for 5 minutes before writing.',
        [
          text('The anxious thing I chose to approach today:', 1),
          rating('My anxiety BEFORE inviting it in:', 'Low', 'High'),
          text('What happened when I stopped running and turned toward it?', 3),
          rating('My anxiety AFTER 5 minutes of allowing rather than fighting:', 'Lower', 'Higher'),
          text('What surprised me about this experiment?', 2),
        ],
        'I will choose one anxious thing tomorrow and practice inviting it in rather than escaping.'
      ),
      ws('Day 3', 'Expansion — Breathing Into Sensation',
        'Find the most prominent anxious sensation in your body. Instead of tightening against it, breathe into the space around it — imagining the breath opening and expanding around the sensation, as if making more room. Do this for 3 minutes, then write.',
        [
          text('Where in my body did I find the sensation?', 1),
          text('Describe the sensation before the expansion practice (shape, texture, temperature):', 2),
          text('As I breathed into the space around it, what happened?', 3),
          text('What did I notice about my relationship to the sensation when I stopped fighting it?', 3),
        ],
        'I will practice expansion breathing once today with any anxious sensation, however small.'
      ),
      ws('Day 4', 'Acceptance vs. Resignation',
        'Acceptance means: this is present right now, and I don\'t need to spend all my energy fighting it. I can feel it AND still move. Resignation means giving up.',
        [
          twocol('Acceptance looks like... (specific examples from your life):', 'Resignation looks like... (specific examples):'),
          text('An area of my life where acceptance (not resignation) could free me right now:', 3),
          rating('My willingness to feel discomfort in service of living more fully:', 'Very low', 'Very willing'),
        ],
        'I will practice acceptance of one uncomfortable feeling this week — not resignation, just allowing it to be there.'
      ),
    ]
  },

  {
    week: 7, phase: 'ACCEPT',
    title: 'Willingness in Real Life — Part 2',
    skill: 'Urge Surfing, the Willingness Ladder + In-Vivo Practice',
    intro: 'Understanding willingness is different from practicing it when your heart is racing and every instinct says run. This week takes willingness out of concept and into your actual life — in small, deliberate steps.',
    readinessQuestion: 'Did you ride at least one anxiety urge this week rather than acting on the safety behavior?',
    worksheets: [
      ws('Day 1', 'Urge Surfing — Riding the Wave',
        'Every anxiety spike is a wave. It builds, peaks, and falls. The problem is we usually escape at the peak. Urge surfing means riding the wave all the way through. The crest lasts at most 90 seconds.',
        [
          text('The urge I chose to surf today (to check, escape, seek reassurance, avoid):', 1),
          rating('The urge intensity at the peak:', 'Low', 'Very intense'),
          text('Describe what happened as you waited without acting on the urge:', 3),
          rating('The intensity after riding the wave:', 'Much lower', 'Same or higher'),
          text('What did this teach me about anxiety waves?', 2),
        ],
        'The next time I feel an anxiety urge, I will ride it for at least 90 seconds before deciding what to do.'
      ),
      ws('Day 2', 'The Willingness Ladder',
        'A willingness ladder lists anxiety-provoking situations from least to most scary. You start at the bottom and work up — not because you feel ready, but because you choose to.',
        [
          text('The domain I\'m building a ladder for (e.g., social situations, health worry, conflict):', 1),
          text('Step 1 — easiest (anxiety 2–3/10):', 1),
          text('Step 2 (anxiety 3–5/10):', 1),
          text('Step 3 (anxiety 5–6/10):', 1),
          text('Step 4 (anxiety 6–8/10):', 1),
          text('Step 5 — most challenging (anxiety 8–9/10):', 1),
          text('Which step will I practice this week?', 1),
        ],
        'I will take Step 1 on my ladder before this week is over.'
      ),
      ws('Day 3', 'Willingness in a Real Moment',
        'Today you\'ll practice willingness in a real, unscripted anxious moment. Before acting on the urge to avoid, pause. Take 2 breaths. Consciously choose to stay or approach for at least 5 minutes.',
        [
          text('The anxious situation that came up:', 2),
          text('What my first instinct told me to do:', 1),
          text('What I chose to do instead:', 2),
          text('What happened to the anxiety as I stayed with it?', 3),
          text('What did this moment teach me about what I\'m capable of?', 2),
        ],
        'I will choose willingness over avoidance at least once more before the week ends.'
      ),
      ws('Day 4', 'Willingness Weekly Review',
        'Willingness is not a feeling — it is a decision. You don\'t wait to feel willing. You choose willingness as an act of commitment to the life you want.',
        [
          twocol('Moments I chose willingness this week:', 'Moments I chose avoidance (honest):'),
          text('What I notice happens to anxiety when I choose willingness instead of escape:', 3),
          rating('My sense of courage and willingness to face anxiety:', 'Very low', 'Growing stronger'),
          text('One thing I\'m proving to myself by practicing willingness:', 2),
        ],
        'Next week, I will take the next step on my willingness ladder.'
      ),
    ]
  },

  {
    week: 8, phase: 'ACCEPT',
    title: 'The Observing Self',
    skill: 'Self-as-Context (ACT) + Mindful Awareness + Phase 2 Integration',
    intro: 'Beyond your thoughts and feelings, there is a part of you that watches. ACT calls this the "Observing Self." Unlike your thoughts (sometimes catastrophic) and feelings (sometimes overwhelming), the Observing Self is always stable, always present, never damaged. Connecting with it is one of the most grounding experiences in anxiety recovery.',
    readinessQuestion: 'Did you connect with the Observing Self — the stable, watching part of you — at least once this week?',
    worksheets: [
      ws('Day 1', 'The Observer Check-In',
        'Sit quietly for 1–2 minutes. Notice what you\'re seeing, hearing, feeling, sensing. Then notice the part of you that noticed all of that. That noticing part is the Observing Self — it was there when you were five years old and will be there at the end of your life.',
        [
          text('Right now I notice I am thinking about:', 2),
          text('Right now I notice I am feeling emotionally:', 2),
          text('Right now I notice in my body:', 2),
          text('The part of me that noticed all of that — what does it feel like?', 3),
        ],
        'Today, I will take one minute to check in with the Observing Self — the watching, steady part of me.'
      ),
      ws('Day 2', 'I Am Not My Anxiety',
        'Anxiety becomes most consuming when we fuse with it — when "I am anxious" becomes "I am broken." The Observing Self breaks that fusion. You are a person who has anxiety. Not a person who is anxiety.',
        [
          text('Complete this sentence 5 different ways: "I am more than my anxiety because..."', 6),
          text('A time when I was anxious AND still acted like my best self:', 3),
          text('What parts of myself has anxiety never been able to touch?', 3),
        ],
        'When anxiety shows up today, I will remind myself: "I am the observer of this anxiety, not the anxiety itself."'
      ),
      ws('Day 3', 'Mindful Presence — Pure Noticing',
        'Set a timer for 3 minutes. Let attention move freely — sounds, sensations, thoughts, the feeling of the chair, breath — without following any thought, without judging. When you get pulled into thinking (you will), gently return to noticing.',
        [
          text('Everything I noticed during the 3 minutes (stream of consciousness):', 5),
          text('Did the Observing Self feel distinct from the content I was noticing?', 2),
          rating('My sense of groundedness and safety in the Observing Self:', 'Very little', 'Strongly present'),
        ],
        'I will take 3 minutes tomorrow to practice pure noticing — no agenda, just watching.'
      ),
      ws('Day 4', 'Phase 2 Integration — ACCEPT',
        'Five weeks in the ACCEPT phase. Defusion, willingness, and the Observing Self together represent a profound shift: from fighting anxiety to having a different relationship with it.',
        [
          text('The most useful ACCEPT skill from these five weeks:', 2),
          text('A moment when I successfully stepped back from anxiety rather than being swallowed:', 3),
          twocol('What I still find hard in the ACCEPT phase:', 'What I want to keep practicing:'),
          rating('My ability to make space for anxiety without fighting it, vs. Week 4:', 'No change', 'Dramatically different'),
        ],
        'I will carry these three ACCEPT tools into Phase 3: (1) defusion, (2) willingness, (3) the observing self.'
      ),
    ]
  },

  // ════════════════════════════════════════
  // PHASE: FREE (Weeks 9–15)
  // ════════════════════════════════════════
  {
    week: 9, phase: 'FREE',
    title: 'Thinking Traps',
    skill: 'Identifying Cognitive Distortions (CBT)',
    intro: 'Now you\'ll work actively with the content of anxious thoughts — not to eliminate them, but to make them more accurate. CBT identifies specific patterns of distorted thinking that amplify anxiety. Learning to spot these patterns is like finding the knots in a tangled rope.',
    readinessQuestion: 'Did you catch and name at least one thinking trap this week?',
    worksheets: [
      ws('Day 1', 'Common Thinking Traps',
        'These are not signs of weakness — they are habits of an anxious mind. Everyone has them. Naming them is the first step.',
        [
          checks('My most frequent thinking traps:', [
            'Catastrophizing — assuming the worst is most likely',
            'Probability overestimation — treating unlikely events as certain',
            'Mind reading — assuming I know others\' negative thoughts',
            'Fortune telling — predicting a bad future as fact',
            'All-or-nothing — only black or white, no middle ground',
            'Overgeneralization — one bad event means always / never',
            'Emotional reasoning — "I feel it strongly, so it must be true"',
            'Discounting the positive — only the bad evidence counts',
            'Should statements — rigid rules about how things must be',
            'Personalization — taking responsibility for things outside my control',
          ]),
          text('My top 2 thinking traps with a recent example of each:', 4),
        ],
        'Today, when an anxious thought arrives, I will ask: "Which thinking trap is this?"'
      ),
      ws('Day 2', 'Catch It — Name It — Check It',
        'Three steps: (1) Catch the automatic thought. (2) Name the distortion. (3) Check it against evidence — not feelings, evidence.',
        [
          text('The automatic thought:', 2),
          text('The thinking trap it falls into:', 1),
          twocol('Evidence that SUPPORTS this thought (facts only):', 'Evidence that DOES NOT support this thought (facts only):'),
          text('A more accurate, balanced version of the thought:', 2),
          rating('Believability of the original thought AFTER this process:', 'Much less believable', 'Same or more believable'),
        ],
        'I will run one anxious thought through the Catch-Name-Check process before the day is over.'
      ),
      ws('Day 3', 'The Thought Court',
        'You are the judge. Feelings are not admissible as evidence. Only facts are allowed. The anxious thought is on trial. Be fair to both sides.',
        [
          text('The thought on trial:', 2),
          text('Evidence FOR (facts only):', 2),
          text('Evidence AGAINST (facts only):', 3),
          text('Has this thought ever been 100% accurate? What actually happened those times?', 2),
          text('The verdict — the most honest, accurate version of the thought:', 2),
        ],
        'I will bring my most persistent anxious thought to the Thought Court this week.'
      ),
      ws('Day 4', 'Thinking Trap Weekly Log',
        'Tracking thinking traps over time reveals which ones are most habitual — and tracking progress shows you the technique working.',
        [
          text('3 thinking traps I caught this week:', 4),
          text('Which was hardest to challenge, and why?', 2),
          twocol('Thoughts I successfully restructured this week:', 'Thoughts I got stuck on:'),
          rating('My skill at catching and questioning thinking traps:', 'Just learning', 'Getting genuinely skilled'),
        ],
        'Next week I will keep catching thinking traps — especially the one I find hardest.'
      ),
    ]
  },

  {
    week: 10, phase: 'FREE',
    title: 'Testing Predictions',
    skill: 'Behavioral Experiments + Downward Arrow (CBT)',
    intro: 'Cognitive restructuring has two arms: the verbal/written work you did last week, and the behavioral arm — actually testing your predictions in real life. Behavioral experiments are often more powerful than written restructuring because the evidence comes from lived experience.',
    readinessQuestion: 'Did you design and run at least one behavioral experiment this week?',
    worksheets: [
      ws('Day 1', 'The Downward Arrow — Finding the Core Fear',
        'The downward arrow asks: "If this thought were true, what would that mean?" — and keeps going deeper until it reaches the core belief. Finding the core belief is the most efficient target.',
        [
          text('Start with an anxious thought:', 1),
          text('"If that were true, what would it mean about me or my life?"', 1),
          text('"And if THAT were true, what would it mean?"', 1),
          text('"And if that were true?" (keep going until you feel the real fear):', 1),
          text('The core belief or fear at the bottom:', 2),
          text('How old does this core belief feel? When did I first learn it?', 2),
        ],
        'I will trace one anxious thought to its core belief this week using the downward arrow.'
      ),
      ws('Day 2', 'Behavioral Experiment Design',
        'A behavioral experiment tests an anxious prediction in real life. Unlike exposure, it\'s about gathering evidence. "My prediction is X. I\'m going to test it by doing Y. Then I\'ll see what actually happens."',
        [
          text('My anxious prediction:', 2),
          text('How strongly I believe this prediction (0–100%):', 1),
          text('The experiment: what I will do to test it:', 2),
          text('What I predict will happen:', 2),
          text('What actually happened (fill this in after):', 3),
        ],
        'I will run this experiment before the week ends — even if I feel nervous about it.'
      ),
      ws('Day 3', 'After the Experiment',
        'The most important part is what you do with the results. Anxious minds are skilled at discounting disconfirming evidence.',
        [
          text('What actually happened in the experiment?', 2),
          text('How does this compare to what I predicted?', 2),
          text('The most honest conclusion I can draw:', 2),
          text('Did my mind try to explain away the result? How?', 2),
          text('If a good friend had this experience, what would I tell them it proves?', 2),
        ],
        'I will hold on to the evidence from this experiment — and bring it up when this fear returns.'
      ),
      ws('Day 4', 'Restructuring — Week 2 Reflection',
        'Two weeks of cognitive restructuring. The goal is not positive thinking — it is accurate thinking.',
        [
          text('A thought I genuinely restructured this week (original + new version):', 3),
          text('The core belief I identified — and what I\'m beginning to think about it:', 3),
          rating('The accuracy and realism of my thinking vs. Week 9:', 'About the same', 'Noticeably more accurate'),
        ],
        'I will remember that accurate thinking — not positive thinking — is the goal.'
      ),
    ]
  },

  {
    week: 11, phase: 'FREE',
    title: 'Living with Uncertainty — Part 1',
    skill: 'Intolerance of Uncertainty Therapy (IUT) — The Core Problem',
    intro: 'At the root of most anxiety is intolerance of uncertainty (IUT) — not the uncertainty itself, the intolerance. The anxious mind treats "I don\'t know" as danger. This is especially important for existential and hypothetical anxieties — "What if I\'m dying," "What if something terrible happens" — that cannot be resolved through exposure.',
    readinessQuestion: 'Did you practice sitting with one uncertainty this week without seeking resolution?',
    worksheets: [
      ws('Day 1', 'Uncertainty Audit',
        'The first step is naming which uncertainties are driving your anxiety specifically.',
        [
          checks('Uncertainties that drive my anxiety most strongly:', [
            'Health — my own body, symptoms, future diagnosis',
            'Health of people I love',
            'Relationships — whether they are secure, whether I am loved',
            'Career, finances, the future I\'m building',
            'Being a good enough parent, friend, partner',
            'Death — my own or those I love',
            'Whether I made or will make the right decision',
            'Whether I am fundamentally okay as a person',
            'Global or external events I cannot control',
          ]),
          text('The uncertainty I find hardest to live with:', 2),
          text('What do I do to try to resolve this? (worry, research, seek reassurance...)', 3),
        ],
        'This week, I will notice every time I seek certainty — and pause before acting on that urge.'
      ),
      ws('Day 2', 'Certainty Is a Myth',
        'We live as if certainty is available if we just worry enough or plan enough. This worksheet confronts that belief with evidence from your own life.',
        [
          text('Something I was certain about that turned out wrong:', 2),
          text('Something I was uncertain about that turned out fine:', 2),
          text('Things I\'ve navigated well that I didn\'t know I could handle in advance:', 3),
          text('What is the cost — time, energy, peace, presence — of seeking certainty?', 3),
        ],
        'I will remind myself once today: "Certainty has never actually been available — and I\'ve been okay."'
      ),
      ws('Day 3', 'The Reassurance Trap',
        'Reassurance-seeking works for about 20 minutes. Then the doubt returns — often stronger. It confirms that uncertainty is dangerous and you can\'t handle it.',
        [
          text('My most common reassurance-seeking behaviors:', 3),
          twocol('Short-term effect of reassurance:', 'Long-term effect of reassurance:'),
          text('One reassurance-seeking behavior I will practice resisting this week:', 2),
        ],
        'I will resist one reassurance-seeking urge this week — and sit with the discomfort instead.'
      ),
      ws('Day 4', '"I Don\'t Know — And That\'s Okay"',
        'For 2 minutes, sit quietly with a significant uncertainty in your life. Just hold "I don\'t know" without trying to resolve it. Then write.',
        [
          text('The uncertainty I sat with:', 1),
          text('What came up as I held "I don\'t know" (thoughts, emotions, body sensations):', 3),
          text('What would change in my life if I could genuinely make peace with this uncertainty?', 3),
          rating('My current distress about this uncertainty:', 'At peace with it', 'Unbearable'),
        ],
        'My phrase for this uncertainty: "I can\'t know, and I can handle what comes."'
      ),
    ]
  },

  {
    week: 12, phase: 'FREE',
    title: 'The What-If Mind — Part 2',
    skill: 'Existential Anxiety — Facing the Core Fear, Building Coping Confidence',
    intro: 'This week tackles "what ifs" that cannot be resolved — not through real exposure, but through imaginal work, core fear facing, and building genuine coping confidence. "What if I\'m dying?" "What if something terrible happens?" These questions deserve honest, courageous engagement.',
    readinessQuestion: 'Did you face your core "what if" fear this week — even briefly, in writing?',
    worksheets: [
      ws('Day 1', 'Tracing the What-If Spiral',
        'A "what if" question is not a problem to be solved — it\'s an invitation into a spiral. The spiral has a bottom: the core fear. Today you trace it all the way down. Use your regulation tools if needed.',
        [
          text('The "what if" that haunts you most:', 1),
          text('And if that happened — then what? (follow the fear down):', 2),
          text('And then what? (keep going):', 2),
          text('The core fear at the very bottom:', 2),
          text('How familiar is this fear? How long has your mind been circling it?', 2),
        ],
        'I have looked at the core fear. I don\'t need to circle it forever. I can set it down for now.'
      ),
      ws('Day 2', 'Facing the Core Fear',
        'Now you\'re going to face the core fear with open eyes — not to resolve it, but to demystify it and discover what you believe about your own capacity to cope.',
        [
          text('The core fear (from yesterday):', 1),
          text('If this fear came true — what would actually happen? (be honest, don\'t minimize):', 3),
          text('What resources, relationships, or inner strengths would I have access to?', 3),
          text('Have I or others survived something as hard as this? What did that teach about human resilience?', 3),
        ],
        'I know my core fear. And I know I am not without resources.'
      ),
      ws('Day 3', 'Your Coping Statement',
        'A coping statement is not a positive affirmation. It is an honest acknowledgment: this might be hard, AND I have what it takes to face it. Write yours from what you actually believe.',
        [
          text('The truth about this uncertainty that I can genuinely accept:', 2),
          text('The evidence for my own coping capacity:', 3),
          text('My coping statement for this "what if" (in your own honest words):', 3),
          note('Write this statement on a card or in your phone. Return to it when the spiral begins.'),
        ],
        'When this "what if" arrives, I will read my coping statement before doing anything else.'
      ),
      ws('Day 4', 'Building Uncertainty Tolerance — Practice',
        'The only way to become more comfortable with uncertainty is to practice tolerating it in small doses, consistently.',
        [
          text('One uncertainty I practiced sitting with this week without seeking resolution:', 2),
          text('What happened when I didn\'t seek certainty? Did anxiety peak and fall?', 3),
          twocol('"What ifs" I am beginning to make peace with:', '"What ifs" I still struggle with:'),
          rating('My ability to sit with significant uncertainty:', 'Still very hard', 'Building real tolerance'),
        ],
        'My coping statement lives in my phone now. I will use it the next time the spiral starts.'
      ),
    ]
  },

  {
    week: 13, phase: 'FREE',
    title: 'Your Nervous System — Part 1',
    skill: 'Polyvagal-Informed Regulation, Breathwork + Grounding',
    intro: 'Anxiety is a full-body experience. The polyvagal theory (Dr. Stephen Porges) shows that the vagus nerve is the body\'s brake pedal: when active, it shifts us from threat-mode into safety. You can directly influence this system through breath, sound, temperature, and movement.',
    readinessQuestion: 'Did you use a somatic regulation tool (breath, grounding, visualization) at least twice this week?',
    worksheets: [
      ws('Day 1', 'Your Nervous System States',
        'Polyvagal theory describes three states: Safe & Social (ventral vagal), Fight/Flight (sympathetic), and Freeze (dorsal vagal). Anxiety lives in fight/flight. Recognizing where you are is the first step to shifting.',
        [
          checks('Right now, my nervous system feels more like:', [
            'Safe & Social — grounded, present, connected, able to think clearly',
            'Fight / Flight — activated, urgent, heart racing, mind spinning',
            'Freeze — numb, shut down, disconnected, flat, hard to move',
          ]),
          text('What does my fight/flight state feel like specifically in my body?', 3),
          text('What does my safe & social state feel like? How do I know when I\'m there?', 3),
          text('What tends to move me from fight/flight toward safe & social?', 2),
        ],
        'Today, I will name my nervous system state at least three times and notice any shifts.'
      ),
      ws('Day 2', 'Breathwork Deep Dive',
        'The physiological sigh (double inhale + long exhale) is the fastest-acting breath for acute anxiety. Extended exhale breathing is better for sustained calm. Try each for 2 minutes.',
        [
          note('Physiological sigh: Inhale fully → quick second sniff → long slow exhale through mouth. Repeat 3–5 times.'),
          rating('Anxiety BEFORE both practices:', 'Calm', 'Very activated'),
          text('After the physiological sigh: what did I notice?', 2),
          text('After extended exhale breathing (2 min): what did I notice?', 2),
          rating('Anxiety AFTER both practices:', 'Calm', 'Very activated'),
          text('Which technique felt most effective for my nervous system today?', 2),
        ],
        'I will use the physiological sigh the next time anxiety spikes suddenly.'
      ),
      ws('Day 3', '5-4-3-2-1 Grounding — Full Practice',
        'Anxiety lives in the future or past. Grounding returns you to the present. Do the full 5-4-3-2-1 right now: 5 things you see, 4 you can touch, 3 you hear, 2 smells, 1 taste. Be specific.',
        [
          text('5 things I see right now:', 2),
          text('4 things I touch (describe the texture):', 2),
          text('3 things I hear:', 1),
          text('2 smells / 1 taste:', 1),
          rating('My sense of presence in THIS moment after grounding:', 'Still scattered', 'Solidly present'),
          text('What did this do to the anxious thoughts?', 2),
        ],
        'I will use 5-4-3-2-1 grounding the next time I notice my mind in the future or past.'
      ),
      ws('Day 4', 'My Safe Place Visualization',
        'The nervous system cannot fully distinguish a vividly imagined safe experience from a real one. A safe place visualization creates a reliable inner resource. Spend 3 minutes building yours before writing.',
        [
          text('My safe place (describe what I see, hear, smell, feel, the light and temperature):', 4),
          text('What does my body feel like when I am there?', 2),
          rating('My sense of safety and groundedness after the visualization:', 'Very little', 'Strong and calm'),
          text('When during my week will I use this practice?', 2),
        ],
        'My safe place is available anytime. I will visit it for 3 minutes tomorrow.'
      ),
    ]
  },

  {
    week: 14, phase: 'FREE',
    title: 'Your Nervous System — Part 2',
    skill: 'Window of Tolerance, Interoceptive Exposure + Your Full Toolkit',
    intro: 'The Window of Tolerance explains why anxiety sometimes floods us completely. And interoceptive exposure — learning to tolerate the physical sensations of anxiety themselves — is one of the most powerful but least-known techniques. Physical sensations lose their power when they are no longer feared.',
    readinessQuestion: 'Did you practice interoceptive exposure or window of tolerance work at least once this week?',
    worksheets: [
      ws('Day 1', 'Your Window of Tolerance',
        'The Window of Tolerance is the zone where you can function without being overwhelmed. Above it: hyperarousal. Below it: shutdown. The goal is to recognize when you\'ve left it and know how to return.',
        [
          text('My hyperarousal signs (above the window — too activated):', 2),
          text('My hypoarousal signs (below the window — shut down, numb):', 2),
          text('What my window feels like from the inside:', 2),
          twocol('Things that help when I\'m above the window:', 'Things that help when I\'m below the window:'),
        ],
        'Today, I will notice which zone I\'m in at three different moments and name it.'
      ),
      ws('Day 2', 'Interoceptive Exposure',
        'Many with anxiety fear their own physical sensations: a racing heart feels like a heart attack. Interoceptive exposure deliberately provokes these sensations safely, teaching the nervous system they\'re not dangerous. Try: 30 seconds spinning, 20 jumping jacks, or breathing through a straw for 30 seconds. Then sit with the sensation.',
        [
          text('The exercise I chose and the sensations it produced:', 2),
          rating('My anxiety about the sensations while present:', 'Barely noticed', 'Very alarming'),
          text('What actually happened? Did the sensations become dangerous?', 2),
          rating('My anxiety about the sensations after they passed:', 'Minimal', 'Still alarming'),
          text('What is this teaching me about physical anxiety sensations?', 2),
        ],
        'I will do one more interoceptive exposure exercise before this week ends.'
      ),
      ws('Day 3', 'Movement and Temperature Regulation',
        'The vagus nerve can be stimulated through cold water, gentle movement, humming, or progressive muscle relaxation. Try one today.',
        [
          checks('I\'ll try one of these today:', [
            'Splash cold water on my face for 30 seconds',
            'Hum or sing for 2 minutes',
            'Progressive muscle relaxation — tense each muscle group 5s, release',
            'Slow deliberate 5-minute walk with full sensory attention',
            'Gentle bilateral movement — tap left-right-left-right for 3 minutes',
          ]),
          text('What I chose and what I noticed:', 3),
          text('How did this affect my nervous system state?', 2),
        ],
        'I will add one vagal toning practice to my daily routine — starting tomorrow.'
      ),
      ws('Day 4', 'My Personal Regulation Toolkit',
        'You now have a full toolkit. Different moments call for different tools.',
        [
          text('My top 2 tools for mild anxiety (2–4/10):', 2),
          text('My top 2 tools for moderate anxiety (5–7/10):', 2),
          text('My top 2 tools for high anxiety or panic (8–10/10):', 2),
          text('The single practice I will build into every day (even 5 minutes):', 2),
          rating('My sense of having real, body-based tools for anxiety:', 'Still feel unprepared', 'Genuinely equipped'),
        ],
        'My daily somatic practice starts tomorrow. It\'s:'
      ),
    ]
  },

  {
    week: 15, phase: 'FREE',
    title: 'Working with Worry',
    skill: 'Productive vs. Unproductive Worry, Postponement + Worry Exposure + Phase 3 Integration',
    intro: 'Worry feels like problem-solving but is usually repetitive, unresolvable mental circling. Not all worry is the same — productive worry leads to action; unproductive worry is a loop. This week you sort the two and contain the unproductive kind.',
    readinessQuestion: 'Did you use worry postponement at least twice this week?',
    worksheets: [
      ws('Day 1', 'Productive vs. Unproductive Worry',
        'Productive: leads to a concrete action within 48 hours. Unproductive: repetitive, hypothetical, no action possible. One deserves your attention. The other deserves containment.',
        [
          twocol('Productive worries this week (I CAN do something):', 'Unproductive worries (I cannot control or resolve):'),
          text('Pick one productive worry: the single next action I can take and when:', 2),
          text('Pick one unproductive worry: what makes it unresolvable?', 2),
        ],
        'For every unproductive worry this week, I will name it as unproductive and postpone it.'
      ),
      ws('Day 2', 'Worry Postponement Practice',
        'Worry postponement reduces total daily worry time by 35–50%. Assign 15 minutes per day as your designated worry window. When worry arises outside that window, write it here and postpone it.',
        [
          text('My designated worry window (specific time and location):', 1),
          text('Worries I postponed today (just the headlines — don\'t engage):', 4),
          text('When I returned to these during worry time, how many still felt as urgent?', 2),
          rating('How effective was postponement at reducing worry during the rest of the day?', 'Didn\'t help', 'Very effective'),
        ],
        'My worry window is set. All worries between now and then can wait.'
      ),
      ws('Day 3', 'Worry Exposure — The Worry Script',
        'For your most persistent, repetitive worry, written worry exposure can break the cycle: write the worry in full detail, sit with it, read it back without reassuring yourself.',
        [
          text('My most repetitive worry, written in full (worst case, full detail, don\'t minimize):', 5),
          rating('Anxiety while writing and reading it:', 'Low', 'Very high'),
          rating('Anxiety after sitting with it for 5 minutes:', 'Lower', 'Still high'),
          text('What happened? Did familiarity with the worry reduce its intensity even slightly?', 3),
        ],
        'Familiarity reduces the power of worries. I\'ve faced this one on the page.'
      ),
      ws('Day 4', 'Phase 3 Integration — FREE',
        'Seven weeks in the FREE phase. Thinking traps, core beliefs, behavioral experiments, uncertainty tolerance, nervous system regulation, worry. Take stock of what has genuinely shifted.',
        [
          text('The most powerful FREE skill for me personally:', 2),
          twocol('Skills becoming somewhat automatic:', 'Skills I still need to practice deliberately:'),
          text('What has changed in how I relate to anxious thoughts and feelings since Week 9?', 3),
          rating('My sense of having real, effective tools for anxiety — now vs. Week 1:', 'No different', 'Fundamentally equipped'),
        ],
        'Moving into Phase 4, I bring these tools with me. The most important one is:'
      ),
    ]
  },

  // ════════════════════════════════════════
  // PHASE: ENGAGE (Weeks 16–20)
  // ════════════════════════════════════════
  {
    week: 16, phase: 'ENGAGE',
    title: 'The Inner Critic and Anxiety',
    skill: 'Self-Compassion (Kristin Neff / MSC) + Shame vs. Guilt',
    intro: 'The inner critic is anxiety\'s closest ally. "You\'re not enough. You\'ll fail. You\'re broken." This relentless self-attack activates the same threat system as external danger — producing more anxiety, not less. Self-compassion is the most evidence-based antidote to shame-based anxiety.',
    readinessQuestion: 'Did you practice the self-compassion break at least once this week?',
    worksheets: [
      ws('Day 1', 'Meeting the Inner Critic',
        'The inner critic sounds like a harsh reality check. But it is almost always distorted — catastrophizing, attacking the person rather than the behavior.',
        [
          text('The most common things my inner critic says about me:', 3),
          text('What tone of voice does it use? (cold? contemptuous? panicked? shaming?)', 2),
          text('How old does this voice feel? When did it first appear?', 2),
          text('If a close friend spoke to you the way your inner critic does, what would you do?', 2),
        ],
        'When the inner critic speaks today, I will notice it — and name it as "the critic," not as the truth.'
      ),
      ws('Day 2', 'Treating Yourself as a Friend',
        'Self-compassion is more motivating than self-criticism, not less. Today: think of something you\'ve been harshly criticizing yourself for, then write what you\'d say to a dear friend in that situation.',
        [
          text('Something I\'ve been criticizing myself harshly for:', 2),
          text('What I would say to a close friend in this exact situation:', 3),
          text('What I actually say to myself:', 2),
          text('What would it mean to offer myself what I\'d offer my friend?', 3),
        ],
        'Today I will offer myself one response I would give a dear friend — about something the critic attacks.'
      ),
      ws('Day 3', 'The Self-Compassion Break',
        'Three steps, any difficult moment: (1) Acknowledge: "This is a moment of suffering." (2) Common humanity: "I am not alone." (3) Kindness: hand on heart, "What do I need right now?" Do it now with something current, then write.',
        [
          text('The difficult thing I brought to the practice:', 2),
          text('"This is a moment of suffering" — what does naming it honestly feel like?', 2),
          text('"I am not alone in this" — what happens when I remember others struggle too?', 2),
          text('"What do I need right now?" — what came up?', 2),
        ],
        'I will use the self-compassion break at least once today — and once more before the week ends.'
      ),
      ws('Day 4', 'Shame vs. Guilt',
        'Brené Brown\'s research: Guilt says "I did something bad." Shame says "I AM bad." Guilt can motivate repair. Shame is paralyzing — it drives anxiety, avoidance, and hiding.',
        [
          twocol('Things I feel guilty about (specific behaviors):', 'Things I feel shame about (who I am, my worth):'),
          text('How does shame show up in my anxiety specifically?', 3),
          text('One shame belief I carry — and one compassionate response to it:', 3),
        ],
        'When shame shows up this week, I will name it: "That\'s shame, not truth."'
      ),
    ]
  },

  {
    week: 17, phase: 'ENGAGE',
    title: 'Your Values Compass',
    skill: 'Values Clarification + Moving Toward What Matters (ACT)',
    intro: 'Anxiety tells you what to avoid. Values tell you what to move toward. Values are not goals — they are directions. When you act from your values, even when anxious, you build self-respect, vitality, and a sense of meaning that no amount of safety-seeking can provide.',
    readinessQuestion: 'Did you take at least one small action toward a value this week?',
    worksheets: [
      ws('Day 1', 'What Matters Most to Me',
        'Values are not what you think you should care about. They are what actually makes life feel meaningful when you\'re living it. Choose without editing yourself.',
        [
          checks('My most important values (choose 5–7):', [
            'Family — being truly present with people I love',
            'Intimate relationships — deep connection, love, being known',
            'Friendship — loyalty, care, genuine presence',
            'Adventure — exploring, growing, experiencing life fully',
            'Creativity — making things, expressing what\'s inside',
            'Health — honoring my body and its capacity',
            'Service — contributing to something larger than myself',
            'Learning — curiosity, mastery, continuous growth',
            'Career — meaningful work, excellence, impact',
            'Integrity — being honest, living by what I believe',
            'Spirituality / meaning — connection to something larger',
            'Fun and playfulness — lightness, joy',
          ]),
          text('My top 3 values and specifically what they mean to me:', 4),
        ],
        'I will name my top value today and notice one moment when I either honored or ignored it.'
      ),
      ws('Day 2', 'Anxiety vs. My Values',
        'Anxiety often pulls us away from what we value most. Mapping this tension makes the cost of anxiety concrete.',
        [
          twocol('A value that matters deeply to me:', 'How anxiety gets in the way of living this value:'),
          twocol('A second value:', 'How anxiety interferes:'),
          text('If anxiety weren\'t steering, what would I do differently this week?', 3),
        ],
        'I will do one small thing today in service of a value — even with anxiety present.'
      ),
      ws('Day 3', 'The Vitality Test',
        'ACT therapist Kelly Wilson describes "vitality" as the aliveness you feel when acting from values — even when hard. Compare this to the flatness of avoidance-based comfort.',
        [
          text('A recent moment when I felt genuinely alive and engaged:', 3),
          text('Was I acting from a value in that moment? Which one?', 2),
          text('A moment when I chose comfort over vitality this week:', 2),
          text('What would choosing vitality look like instead?', 2),
        ],
        'Today, I will choose vitality over anxiety-comfort in at least one moment.'
      ),
      ws('Day 4', 'Values Reflection',
        'Values are most useful when you\'ve lost your bearing.',
        [
          text('One value I want to bring more fully into my life:', 1),
          text('What gets in the way (including anxiety, old habits, fear of judgment):', 2),
          text('One small act of this value I can take in the next 48 hours:', 2),
          text('If I look back in twenty years, what will I wish I had cared about more?', 3),
        ],
        'My value action in the next 48 hours is:'
      ),
    ]
  },

  {
    week: 18, phase: 'ENGAGE',
    title: 'Taking Action — The Approach Ladder',
    skill: 'Committed Action + Approach Hierarchy (ACT/CBT)',
    intro: 'Committed action means moving toward what matters, in the presence of anxiety, without waiting for the anxiety to go away first. This week you build an approach ladder — the systematic, graduated structure that makes courageous action manageable.',
    readinessQuestion: 'Did you take at least one step on your approach ladder this week?',
    worksheets: [
      ws('Day 1', 'Building the Approach Ladder',
        'Choose an area of life where anxiety has been shrinking your world. Build a ladder from smallest step at the bottom to most challenging at the top.',
        [
          text('The life domain I\'m building a ladder for (and why it matters to me):', 2),
          text('Step 1 — easiest (anxiety 2–3/10):', 1),
          text('Step 2 (anxiety 3–5/10):', 1),
          text('Step 3 (anxiety 5–6/10):', 1),
          text('Step 4 (anxiety 6–8/10):', 1),
          text('Step 5 — most challenging (anxiety 8–9/10):', 1),
          text('Which step am I ready to take this week?', 1),
        ],
        'I will take Step 1 on my ladder before this week is over — even if I\'m nervous.'
      ),
      ws('Day 2', 'Taking One Step',
        'Today you take one step on your ladder. Before you do: take 2 regulation breaths. Notice anxiety is present. Choose to go anyway — because the value is bigger than the fear.',
        [
          text('The step I took:', 2),
          rating('Anticipatory anxiety BEFORE:', 'Low', 'High'),
          rating('Peak anxiety DURING:', 'Low', 'High'),
          rating('Anxiety AFTER:', 'Low', 'High'),
          text('What actually happened? How does this compare to what I feared?', 3),
          text('What did I prove to myself by doing this?', 2),
        ],
        'I proved something to myself today. That proof is:'
      ),
      ws('Day 3', 'When Anxiety Shows Up Mid-Action',
        'Anxiety will show up during committed action. That\'s not failure — that\'s the whole point. What matters is what you do when it arrives.',
        [
          text('A situation where anxiety showed up mid-action recently:', 2),
          text('What my mind said (the case for stopping, escaping, retreating):', 2),
          text('What I did (be honest):', 1),
          text('If I could replay it with full willingness, what would I do differently?', 2),
          text('My plan for the next time anxiety shows up mid-action:', 3),
        ],
        'When anxiety arrives mid-action, I will pause, breathe, and remember why I\'m doing this.'
      ),
      ws('Day 4', 'Committed Action — Weekly Review',
        'Committed action is not about being fearless. It\'s about being clear on what matters and moving toward it anyway.',
        [
          text('The approach steps I took this week:', 3),
          text('What happened to anxiety during and after approach vs. avoidance?', 2),
          text('What I\'m learning about the relationship between action and anxiety:', 2),
          rating('My confidence in my ability to act in the presence of anxiety:', 'Very low', 'Growing strongly'),
        ],
        'I will take the next step on my ladder this coming week.'
      ),
    ]
  },

  {
    week: 19, phase: 'ENGAGE',
    title: 'Expanding the World',
    skill: 'Behavioral Activation, Living by Design + The SAFE Model in Practice',
    intro: 'Anxiety shrinks life. This week is about actively expanding it — through deliberate, consistent choice to build the life you want rather than the life anxiety has designed for you. You now have every skill in the SAFE model. This week you use all of them together.',
    readinessQuestion: 'Did you live by design at least twice this week — scheduling a value-driven activity rather than waiting to feel ready?',
    worksheets: [
      ws('Day 1', 'The Anxiety-Shrunk Life Inventory',
        'Take an honest inventory. Anxiety has likely been the architect of some of your life\'s limits. That\'s not failure — that\'s what chronic anxiety does. Now you get to choose differently.',
        [
          text('Activities, relationships, or opportunities I\'ve been avoiding because of anxiety:', 4),
          text('Things I\'ve stopped doing that I used to enjoy:', 2),
          text('The version of my life anxiety has designed vs. the version I actually want:', 3),
        ],
        'I am choosing to design my own life, not let anxiety design it.'
      ),
      ws('Day 2', 'Living by Design — This Week\'s Plan',
        'Behavioral activation: proactively scheduling value-driven activities rather than waiting for motivation. Action produces motivation — not the other way around.',
        [
          text('Three value-driven activities I will do this week:', 3),
          text('The anxiety that might show up for each — and the skill I\'ll use:', 3),
          text('What "winning this week" looks like for me:', 2),
        ],
        'My three value-driven activities are scheduled. I don\'t need to feel ready — I just need to show up.'
      ),
      ws('Day 3', 'SAFE Model in One Moment',
        'Think of a recent anxious moment and walk the full SAFE framework through it. This is integration — all four phases working together.',
        [
          text('The anxious situation:', 2),
          text('SEE: What did I notice (anxiety, body, emotion underneath)?', 2),
          text('ACCEPT: How did I make room for it?', 2),
          text('FREE: What did I do with the thought or body sensation?', 2),
          text('ENGAGE: How did I act from my values in spite of the anxiety?', 2),
        ],
        'The SAFE model is mine now. I can run any anxious moment through it.'
      ),
      ws('Day 4', 'A Letter to Anxiety',
        'You\'ve been working with anxiety for 19 weeks. A lot has changed in your relationship with it. Write anxiety a letter — honest, not mean, not dismissive.',
        [
          text('Dear Anxiety,', 12),
        ],
        'I have written to my anxiety. Something has shifted in how I see it.'
      ),
    ]
  },

  {
    week: 20, phase: 'ENGAGE',
    title: 'Putting It All Together',
    skill: 'Full SAFE Integration, Relapse Prevention + Long-Term Flourishing',
    intro: 'This is the final week of the core 20-week curriculum. The goal is not to have eliminated anxiety — it is to have fundamentally changed your relationship with it. You have skills, insight, and proof of your own capacity. This week is about solidifying that and building the practice that sustains it.',
    readinessQuestion: 'Have you completed the program?',
    worksheets: [
      ws('Day 1', 'My Complete SAFE Map',
        'Your personal SAFE map is the distillation of 20 weeks into a reference you can return to for life.',
        [
          text('SEE — How I recognize my anxiety and the emotions underneath it:', 3),
          text('ACCEPT — My most effective defusion and willingness practices:', 3),
          text('FREE — My best cognitive tools, regulation practices, and uncertainty strategies:', 3),
          text('ENGAGE — My core values and the committed actions that express them:', 3),
        ],
        'My SAFE map lives here. I will return to it whenever I lose my bearing.'
      ),
      ws('Day 2', 'Warning Signs and Early Intervention',
        'Anxiety will return. That is not failure — that is life. The difference is now you have early warning signs you recognize.',
        [
          text('My earliest warning signs that anxiety is building (body, thoughts, behaviors):', 3),
          text('The first three things I will do when I notice these signs:', 3),
          text('Conditions that tend to increase my anxiety (sleep, stress, certain situations):', 2),
          text('The people I can reach out to for support:', 2),
        ],
        'My early warning system is built. I know what to do when the signs appear.'
      ),
      ws('Day 3', 'How Far You\'ve Come',
        'We almost never pause to acknowledge genuine progress. This worksheet does exactly that.',
        [
          text('Something I can do today that I couldn\'t (or wouldn\'t) do in Week 1:', 2),
          text('A moment in this program when something genuinely shifted for me:', 3),
          text('The most important thing I\'ve learned about myself through this work:', 3),
          rating('My overall confidence in handling anxiety now vs. where I started:', 'About the same', 'Profoundly different'),
          text('A letter to my Week 1 self:', 4),
        ],
        'I did this work. I am not who I was on Day 1.'
      ),
      ws('Day 4', 'My Ongoing Practice Plan',
        'Anxiety management is maintenance work — like fitness. The gains from this program are sustained by continued practice.',
        [
          text('Daily practices I will keep (even 5–10 minutes — be realistic):', 3),
          text('Weekly practices that support my mental health:', 2),
          text('Skills I want to deepen further:', 2),
          text('My commitment to myself — in my own words:', 3),
          note('You did this. Twenty weeks of honest, consistent work with your anxiety. That is remarkable.'),
        ],
        'My commitment to myself is written. I will keep it.'
      ),
    ]
  },
];

// ── SPACED REPETITION SCHEDULE ──────────────────────────────
// When a week is completed, schedule reviews at Day 7 and Day 21
function getReviewSchedule(weekNum, completedDate) {
  const d = new Date(completedDate);
  const day7  = new Date(d); day7.setDate(d.getDate() + 7);
  const day21 = new Date(d); day21.setDate(d.getDate() + 21);
  return [
    { weekNum, type: 'day7',  dueDate: day7.getTime(),  prompt: getReviewPrompt(weekNum, 'day7')  },
    { weekNum, type: 'day21', dueDate: day21.getTime(), prompt: getReviewPrompt(weekNum, 'day21') },
  ];
}

function getReviewPrompt(weekNum, type) {
  const wk = CURRICULUM[weekNum - 1];
  if (!wk) return null;
  const prompts7 = {
    1: 'Quick check: Can you do 4-7-8 breathing right now and notice any shift?',
    2: 'Pause and ask: Is there an emotion underneath any anxiety you\'ve felt this week?',
    3: 'Trace one anxiety loop from this week: trigger → thought → feeling → behavior.',
    4: 'Catch one thought right now and say "I notice I\'m having the thought that..."',
    5: 'Name your anxiety story. Notice it\'s a story, not a fact.',
    6: 'When did you fight anxiety this week? What would willingness have looked like?',
    7: 'Did you surf an urge this week? If not — is there one you could practice with today?',
    8: 'Take 1 minute with the Observer. Notice thoughts, feelings, sensations — and the part that notices.',
    9: 'Catch one thinking trap from this week. Name it. What\'s a more accurate version?',
    10: 'What prediction has anxiety made recently? How could you test it?',
    11: 'What uncertainty are you seeking resolution for right now? Can you hold it for 2 minutes without resolving it?',
    12: 'Read your coping statement from Week 12. Does it still feel true?',
    13: 'Do your preferred somatic tool right now — 2 minutes. What state are you in?',
    14: 'Notice your window of tolerance right now. Are you in it?',
    15: 'Write down one unproductive worry and schedule it for your worry window.',
    16: 'Say something to yourself that you would say to a dear friend right now.',
    17: 'Name your top value. Did you honor it at all this week?',
    18: 'Where are you on your approach ladder? Can you take one more step?',
    19: 'Run one recent anxious moment through the SAFE model — even briefly.',
    20: 'Look at your SAFE map. Which tool do you most need right now?',
  };
  const prompts21 = {
    1: 'How has your body awareness changed since Week 1? Do a quick body scan and notice.',
    2: 'What primary emotion has been underneath your anxiety most often lately?',
    3: 'Your loop: has it changed since you mapped it? What\'s the weakest link now?',
    4: 'Defusion: which technique do you reach for most automatically now?',
    5: 'Your anxiety story — does it still have the same power it did three weeks ago?',
    6: 'Willingness: what\'s the hardest thing you\'ve made room for in the last three weeks?',
    7: 'Has your willingness ladder moved? What step are you at now?',
    8: 'When was the last time you connected with the Observing Self? Do it now for 1 minute.',
    9: 'Which thinking trap do you catch most automatically now?',
    10: 'What core belief are you working with? Is it loosening at all?',
    11: 'What uncertainty feels more tolerable now than it did a month ago?',
    12: 'Has your coping statement needed updating? What does it say now?',
    13: 'Which somatic tool has become most automatic for you?',
    14: 'Your window of tolerance: does it feel wider than it did a month ago?',
    15: 'Worry postponement: is it working consistently? What adjustments have you made?',
    16: 'Self-compassion: what has changed in how you speak to yourself?',
    17: 'What value action have you taken in the last three weeks that you\'re proud of?',
    18: 'Where are you on your approach ladder? How does it compare to where you started?',
    19: 'A month in: what would the anxious version of you from Week 1 think of you now?',
    20: 'Final reflection: what is the most lasting change in your relationship with anxiety?',
  };
  return type === 'day7' ? (prompts7[weekNum] || `Quick review: What\'s the key skill from Week ${weekNum}?`)
                        : (prompts21[weekNum] || `Deep review: How has Week ${weekNum}\'s skill integrated into your life?`);
}

// Expose globally
window.SAFE_DATA = { PHASES, CURRICULUM, SOS_SKILLS, getReviewSchedule, getReviewPrompt };

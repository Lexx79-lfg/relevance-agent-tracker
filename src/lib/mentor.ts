import type { MentorMode, MentorResponse } from "../types/app";

export const MODE_META: Record<
  MentorMode,
  {
    label: string;
    subtitle: string;
    emoji: string;
  }
> = {
  regulation: {
    label: "Regulation",
    subtitle: "Calm first",
    emoji: "🫁",
  },
  execution: {
    label: "Execution",
    subtitle: "One clear action",
    emoji: "🚀",
  },
  strategy: {
    label: "Strategy",
    subtitle: "Choose the plan",
    emoji: "🧭",
  },
  partner: {
    label: "Partner/Parent",
    subtitle: "Repair and support",
    emoji: "🤝",
  },
};

export const MODE_QUOTES: Record<MentorMode, string[]> = {
  regulation: [
    "Slow is smooth. Smooth is calm.",
    "Safety first. Solutions later.",
    "You do not have to solve this while activated.",
  ],
  execution: [
    "One step counts.",
    "Momentum begins before confidence.",
    "Make it small enough to start now.",
  ],
  strategy: [
    "Clarity comes from reducing noise.",
    "Choose the simplest path that still works.",
    "Name the real outcome, then ignore the rest.",
  ],
  partner: [
    "Protect connection before trying to fix anything.",
    "Safety first, resolution later.",
    "Gentle words do more than perfect arguments.",
  ],
};

export const MODE_PROMPTS: Record<MentorMode, string[]> = {
  regulation: [
    "I feel overwhelmed and need to settle down.",
    "My mind is racing and I need help slowing it down.",
    "I feel emotionally activated and do not want to make it worse.",
  ],
  execution: [
    "I am avoiding the thing I need to do.",
    "I feel stuck and cannot start.",
    "I know what matters but I keep freezing.",
  ],
  strategy: [
    "I have too many options and need clarity.",
    "I need help choosing the most important thing.",
    "I want to stop reacting and think clearly.",
  ],
  partner: [
    "We are both triggered and I do not want to make this worse.",
    "I want to say something safe and helpful.",
    "I need help slowing down conflict and protecting the connection.",
  ],
};

const KEYWORD_GROUPS = {
  regulation: {
    panic: ["panic", "panicky", "can't breathe", "cant breathe", "breathing", "chest", "heart racing"],
    racingThoughts: ["spiral", "racing", "mind", "thoughts", "can't stop", "cant stop", "looping"],
    overwhelm: ["overwhelmed", "too much", "everything", "all of it", "buried", "flooded"],
    activation: ["trigger", "triggered", "activated", "angry", "rage", "mad", "reactive"],
    shame: ["ashamed", "shame", "failure", "failed", "worthless", "bad", "embarrassed"],
    exhaustion: ["tired", "exhausted", "drained", "burned out", "burnt out", "no energy"],
    fear: ["afraid", "fear", "scared", "worried", "unsafe", "anxious"],
    freeze: ["stuck", "frozen", "freeze", "numb", "blank", "shut down"],
    sadness: ["sad", "grief", "lonely", "alone", "heavy", "crying"],
  },
  execution: {
    avoidance: ["avoid", "avoiding", "procrast", "putting off", "dreading"],
    stuckStart: ["stuck", "freeze", "freezing", "can't start", "cant start", "blocked"],
    tooBig: ["overwhelmed", "too big", "too much", "huge", "massive"],
    communication: ["email", "message", "text", "send", "reply", "call"],
    cleanup: ["clean", "kitchen", "room", "laundry", "dishes", "trash"],
    focusWork: ["work", "focus", "project", "task", "assignment", "study"],
    lowEnergy: ["tired", "exhausted", "no energy", "drained", "burned out", "burnt out"],
    deadline: ["deadline", "late", "urgent", "behind", "due"],
    unsure: ["don't know", "dont know", "unsure", "what to do", "where to start"],
  },
  strategy: {
    tooManyOptions: ["too many", "options", "choices", "possibilities", "paths"],
    confusion: ["unclear", "confused", "foggy", "lost", "messy"],
    decision: ["decision", "decide", "choose", "which", "pick"],
    priority: ["priority", "important", "most important", "focus", "matter most"],
    planning: ["plan", "roadmap", "steps", "sequence", "organize"],
    risk: ["risk", "worried", "what if", "afraid", "wrong", "mistake"],
    time: ["time", "schedule", "busy", "not enough time", "calendar"],
    outcome: ["outcome", "goal", "result", "finish", "success"],
    tradeoff: ["tradeoff", "cost", "worth", "benefit", "sacrifice"],
  },
  partner: {
    conflict: ["fight", "argue", "argument", "yelling", "blow up", "conflict"],
    activation: ["trigger", "triggered", "reactive", "activated", "heated"],
    hurt: ["hurt", "pain", "wounded", "rejected", "ignored"],
    fear: ["afraid", "fear", "scared", "unsafe", "threat"],
    repair: ["sorry", "apologize", "apology", "repair", "messed up"],
    parenting: ["kid", "child", "children", "parent", "parenting", "son", "daughter"],
    partnerBond: ["partner", "spouse", "wife", "husband", "girlfriend", "boyfriend"],
    texting: ["text", "message", "send", "reply", "dm"],
    boundary: ["boundary", "space", "break", "pause", "leave"],
  },
} satisfies Record<MentorMode, Record<string, string[]>>;

type ResponseVariation = {
  keywords: string[];
  build: (missionLabel: string) => MentorResponse;
};

const RESPONSE_VARIATIONS: Record<MentorMode, ResponseVariation[]> = {
  regulation: [
    {
      keywords: KEYWORD_GROUPS.regulation.panic,
      build: (missionLabel) => ({
        title: `Let your body settle before ${missionLabel}.`,
        summary:
          "This is a body alarm, not a command. You do not have to solve anything while your system is loud.",
        helpfulPhrase: "I am safe enough to slow down for one breath.",
        nextStep: "Exhale slowly, place one hand on your chest, and name one object you can see.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.regulation.racingThoughts,
      build: (missionLabel) => ({
        title: `Slow the mental noise around ${missionLabel}.`,
        summary:
          "A racing mind asks for more thinking, but your nervous system needs less input first.",
        helpfulPhrase: "These are thoughts, not instructions.",
        nextStep: "Look away from the screen for 30 seconds and make your exhale longer than your inhale.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.regulation.overwhelm,
      build: (missionLabel) => ({
        title: `You do not have to carry all of ${missionLabel} right now.`,
        summary:
          "Overwhelm means the load feels too large. We are not solving the whole thing; we are finding one calm foothold.",
        helpfulPhrase: "Only one foothold right now.",
        nextStep: "Put both feet flat, drop your shoulders, and say: 'One thing at a time.'",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.regulation.activation,
      build: (missionLabel) => ({
        title: `Give activation room before ${missionLabel}.`,
        summary:
          "When your system is activated, speed can make things sharper. A short pause protects you from reacting too fast.",
        helpfulPhrase: "I can wait until I am steadier.",
        nextStep: "Unclench your jaw, relax your hands, and take three slow breaths before doing anything else.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.regulation.shame,
      build: (missionLabel) => ({
        title: `Bring gentleness into ${missionLabel}.`,
        summary:
          "Shame makes a hard moment feel like your whole identity. It is not; it is one hard moment.",
        helpfulPhrase: "This is a moment, not my whole self.",
        nextStep: "Place one hand somewhere steady and say one kind sentence you would say to someone you love.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.regulation.exhaustion,
      build: (missionLabel) => ({
        title: `Let ${missionLabel} meet your real energy.`,
        summary:
          "Low energy is information, not failure. Your next move can be softer and still count.",
        helpfulPhrase: "Gentle is allowed.",
        nextStep: "Drink water, sit back, and choose the least demanding version of the next two minutes.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.regulation.fear,
      build: (missionLabel) => ({
        title: `Create safety before deciding about ${missionLabel}.`,
        summary:
          "Fear narrows the room. Before you decide, remind your body where it is and what is not an emergency.",
        helpfulPhrase: "Right now, I am here, and I can move slowly.",
        nextStep: "Name the date, the room you are in, and one thing that is stable around you.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.regulation.freeze,
      build: (missionLabel) => ({
        title: `Thaw gently before approaching ${missionLabel}.`,
        summary:
          "Frozen does not mean unwilling. It means your system needs a tiny signal of safety before movement.",
        helpfulPhrase: "Small movement is enough.",
        nextStep: "Wiggle your fingers or toes for ten seconds, then take one slow breath.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.regulation.sadness,
      build: (missionLabel) => ({
        title: `Be kind to the heaviness around ${missionLabel}.`,
        summary:
          "You do not have to push sadness away to be okay. Let the feeling be present without making it solve anything.",
        helpfulPhrase: "I can be with this gently.",
        nextStep: "Soften your face, breathe once, and do one comforting thing within reach.",
      }),
    },
    {
      keywords: [],
      build: (missionLabel) => ({
        title: `Create steadiness around ${missionLabel}.`,
        summary:
          "Your first job is to reduce pressure. Calm makes the next moment safer and clearer.",
        helpfulPhrase: "Calm first. Then clarity.",
        nextStep: "Lower stimulation for two minutes and ask what would make this feel 10% safer.",
      }),
    },
  ],
  execution: [
    {
      keywords: KEYWORD_GROUPS.execution.avoidance,
      build: (missionLabel) => ({
        title: `Make ${missionLabel} too small to avoid.`,
        summary:
          "Avoidance weakens when the first step is tiny. You are not doing the whole task; you are touching the edge of it.",
        helpfulPhrase: "I only need to start the smallest version.",
        nextStep: "Open the thing you are avoiding. Do not work yet; just open it.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.execution.stuckStart,
      build: (missionLabel) => ({
        title: `Unstick ${missionLabel} with one visible action.`,
        summary:
          "Starting is easier when the step is physical and obvious. One visible action is enough to break the freeze.",
        helpfulPhrase: "Visible action beats mental pressure.",
        nextStep: "Do one action someone else could see, then stop after two minutes.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.execution.tooBig,
      build: (missionLabel) => ({
        title: `Shrink ${missionLabel} until it can begin.`,
        summary:
          "If the task feels too big, the next step is not small enough. The win is the first crumb, not the whole loaf.",
        helpfulPhrase: "Smaller is smarter right now.",
        nextStep: "Write one subtask that takes less than two minutes, then do only that.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.execution.communication,
      build: (missionLabel) => ({
        title: `Draft one rough line for ${missionLabel}.`,
        summary:
          "Communication tasks get easier when the first version only has to exist. It does not need to be polished yet.",
        helpfulPhrase: "Draft first. Improve later.",
        nextStep: "Write one rough sentence and do not edit it until it exists.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.execution.cleanup,
      build: (missionLabel) => ({
        title: `Give ${missionLabel} one small reset.`,
        summary:
          "A reset does not need to become a project. One small area can change the room and your momentum.",
        helpfulPhrase: "One surface counts.",
        nextStep: "Clear one small surface or put away five items, then stop.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.execution.focusWork,
      build: (missionLabel) => ({
        title: `Give ${missionLabel} five focused minutes.`,
        summary:
          "The goal is not a heroic work block. The goal is to enter the task and create a little traction.",
        helpfulPhrase: "Five focused minutes is real progress.",
        nextStep: "Set a five-minute timer and work only on the first visible part.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.execution.lowEnergy,
      build: (missionLabel) => ({
        title: `Match ${missionLabel} to your energy.`,
        summary:
          "Low energy needs a lighter entry point. Do the version that preserves dignity and still moves the mission forward.",
        helpfulPhrase: "Low energy can still take a small step.",
        nextStep: "Do the easiest 60-second version of the task, then reassess.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.execution.deadline,
      build: (missionLabel) => ({
        title: `Reduce the pressure around ${missionLabel}.`,
        summary:
          "Urgency can scatter attention. Pick the one required action that lowers the most pressure first.",
        helpfulPhrase: "One pressure-reducing action first.",
        nextStep: "Identify the next required deliverable and do the first two minutes of that only.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.execution.unsure,
      build: (missionLabel) => ({
        title: `Find the first known step for ${missionLabel}.`,
        summary:
          "You do not need the whole path to move. You only need the first thing you can verify.",
        helpfulPhrase: "Known next. Unknown later.",
        nextStep: "Write: 'The first thing I know is...' Then do that one thing.",
      }),
    },
    {
      keywords: [],
      build: (missionLabel) => ({
        title: `Move ${missionLabel} forward gently.`,
        summary:
          "Keep the mission small enough to start. The goal is visible movement you can repeat.",
        helpfulPhrase: "Small beats stalled.",
        nextStep: "Set a five-minute timer and do the next physical action only.",
      }),
    },
  ],
  strategy: [
    {
      keywords: KEYWORD_GROUPS.strategy.tooManyOptions,
      build: (missionLabel) => ({
        title: `Reduce the options around ${missionLabel}.`,
        summary:
          "Too many options creates noise. A good strategy removes choices until the next move is easier to see.",
        helpfulPhrase: "Fewer options, more clarity.",
        nextStep: "List three options, then cross out the one with the least value for the most energy.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.strategy.confusion,
      build: (missionLabel) => ({
        title: `Clarify the center of ${missionLabel}.`,
        summary:
          "Confusion usually means outcome, obstacle, and next move are mixed together. Separate them before deciding.",
        helpfulPhrase: "Separate the pieces.",
        nextStep: "Write one line each: outcome, obstacle, next move.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.strategy.decision,
      build: (missionLabel) => ({
        title: `Choose by outcome for ${missionLabel}.`,
        summary:
          "A decision gets simpler when you ask what each option protects or creates. Pick for the outcome, not the noise.",
        helpfulPhrase: "Choose what serves the outcome.",
        nextStep: "Name the outcome you want, then pick the option that most directly supports it today.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.strategy.priority,
      build: (missionLabel) => ({
        title: `Find what gets to lead in ${missionLabel}.`,
        summary:
          "Priority means one thing gets to lead. Everything else can wait until the lead thing is clearer.",
        helpfulPhrase: "One thing leads.",
        nextStep: "Ask: 'If only one thing moved today, what would matter most?' Write that answer.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.strategy.planning,
      build: (missionLabel) => ({
        title: `Make the plan for ${missionLabel} usable.`,
        summary:
          "A useful plan is short enough to use while tired. Start with the next three moves, not the whole future.",
        helpfulPhrase: "Three steps are enough.",
        nextStep: "Write step 1, step 2, and step 3. Circle step 1.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.strategy.risk,
      build: (missionLabel) => ({
        title: `Lower the risk around ${missionLabel}.`,
        summary:
          "Fear asks for certainty, but strategy asks for a safer test. You can learn without betting everything.",
        helpfulPhrase: "Test smaller.",
        nextStep: "Choose one low-risk experiment that teaches you something useful.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.strategy.time,
      build: (missionLabel) => ({
        title: `Fit ${missionLabel} into the real day.`,
        summary:
          "A plan that ignores time becomes pressure. A good plan respects the actual day in front of you.",
        helpfulPhrase: "Plan for the day I have.",
        nextStep: "Pick one 15-minute window and decide what belongs inside it.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.strategy.outcome,
      build: (missionLabel) => ({
        title: `Define success for ${missionLabel}.`,
        summary:
          "When the outcome is vague, every path looks equally loud. Make the finish line simple.",
        helpfulPhrase: "A clear finish line calms the plan.",
        nextStep: "Write: 'This is successful when...' and finish the sentence once.",
      }),
    },
    {
      keywords: KEYWORD_GROUPS.strategy.tradeoff,
      build: (missionLabel) => ({
        title: `Name the tradeoff in ${missionLabel}.`,
        summary:
          "Most hard choices are tradeoffs, not mysteries. Naming the cost makes the decision less slippery.",
        helpfulPhrase: "Every yes has a cost.",
        nextStep: "Write what you gain and what you give up for the leading option.",
      }),
    },
    {
      keywords: [],
      build: (missionLabel) => ({
        title: `Simplify your thinking around ${missionLabel}.`,
        summary:
          "You do not need the whole roadmap right now. You need the next right decision with the least friction.",
        helpfulPhrase: "Clarity comes from simplification.",
        nextStep: "Name the desired outcome, then choose the simplest useful next move.",
      }),
    },
  ],
  partner: [
    {
      keywords: KEYWORD_GROUPS.partner.conflict,
      build: () => ({
        title: "Slow the conflict before trying to solve it.",
        summary:
          "When both people are activated, more explanation can feel like more threat. The first goal is safety, not resolution.",
        helpfulPhrase: "I care about us. I want to slow this down.",
        nextStep: 'Say: "I want to understand, and I do not want us to hurt each other."',
      }),
    },
    {
      keywords: KEYWORD_GROUPS.partner.activation,
      build: () => ({
        title: "Treat this as activation, not the whole truth.",
        summary:
          "A trigger can make the moment feel larger than it is. Protect both nervous systems before making meaning.",
        helpfulPhrase: "This is a hard moment. We can slow down.",
        nextStep: 'Say: "I am getting activated. I am going to pause so I do not make this worse."',
      }),
    },
    {
      keywords: KEYWORD_GROUPS.partner.hurt,
      build: () => ({
        title: "Respond to the hurt without adding more hurt.",
        summary:
          "Pain needs care before analysis. Keep your words soft, short, and non-defensive.",
        helpfulPhrase: "I hear that this hurt.",
        nextStep: 'Say: "I hear that this hurt. I want to be careful with you."',
      }),
    },
    {
      keywords: KEYWORD_GROUPS.partner.fear,
      build: () => ({
        title: "Make safety the first message.",
        summary:
          "If someone feels afraid, persuasion will not help yet. Safety has to arrive before problem-solving.",
        helpfulPhrase: "I am not here to threaten you.",
        nextStep: 'Say: "You matter to me. I am not trying to corner you."',
      }),
    },
    {
      keywords: KEYWORD_GROUPS.partner.repair,
      build: () => ({
        title: "Repair with ownership, not a speech.",
        summary:
          "A safe repair is short, specific, and does not ask the other person to comfort you.",
        helpfulPhrase: "I can own my part without defending it.",
        nextStep: 'Say: "I am sorry for my part. I understand why that did not feel good."',
      }),
    },
    {
      keywords: KEYWORD_GROUPS.partner.parenting,
      build: () => ({
        title: "Lower the temperature for the child and the adult.",
        summary:
          "In parenting moments, calm is not weakness. Calm is the structure that helps everyone come back online.",
        helpfulPhrase: "I can be firm and gentle.",
        nextStep: 'Say: "You are safe. I am going to help us slow down."',
      }),
    },
    {
      keywords: KEYWORD_GROUPS.partner.partnerBond,
      build: () => ({
        title: "Protect the bond while you handle the issue.",
        summary:
          "The relationship needs reassurance before details. Lead with care, then slow the conversation.",
        helpfulPhrase: "I am on your side.",
        nextStep: 'Say: "I love you. I am on your side. Can we slow this down?"',
      }),
    },
    {
      keywords: KEYWORD_GROUPS.partner.texting,
      build: () => ({
        title: "Send fewer words with more safety.",
        summary:
          "Texts can escalate quickly because tone is missing. Short, warm, and low-pressure is safer.",
        helpfulPhrase: "Short is safer right now.",
        nextStep: 'Send: "I care about you. I want to talk when we both feel calmer."',
      }),
    },
    {
      keywords: KEYWORD_GROUPS.partner.boundary,
      build: () => ({
        title: "Take space without abandoning connection.",
        summary:
          "A good pause protects both people. Make it clear that space is for safety, not punishment.",
        helpfulPhrase: "I am pausing to protect us.",
        nextStep: 'Say: "I need a short pause. I will come back when I can be calmer."',
      }),
    },
    {
      keywords: [],
      build: () => ({
        title: "Protect both people before solving the issue.",
        summary:
          "Lead with softness, not intensity. You are trying to create safety, not win a point.",
        helpfulPhrase: "I am here. I care about you. We can slow this down.",
        nextStep: "Use one short phrase that communicates care and safety, then pause instead of explaining more.",
      }),
    },
  ],
};

function containsAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function getModeQuote(mode: MentorMode) {
  const quotes = MODE_QUOTES[mode];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function generateMentorResponse(
  mode: MentorMode,
  mission: string,
  userText: string
): MentorResponse {
  const text = userText.toLowerCase().trim();
  const missionLabel = mission.trim() || "this moment";
  const variations = RESPONSE_VARIATIONS[mode];
  const matchedVariation =
    variations.find((variation) => containsAny(text, variation.keywords)) ??
    variations[variations.length - 1];

  return matchedVariation.build(missionLabel);
}

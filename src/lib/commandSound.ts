type CommandSoundCue = "tab" | "confirm" | "fuel" | "ignition";

const COMMAND_SOUND_ENABLED_KEY = "relevance-agent-command-sound-enabled";

let audioContext: AudioContext | null = null;

export function isCommandSoundEnabled() {
  if (typeof window === "undefined") return true;

  return window.localStorage.getItem(COMMAND_SOUND_ENABLED_KEY) !== "false";
}

export function setCommandSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(COMMAND_SOUND_ENABLED_KEY, String(enabled));
}

function getAudioContext() {
  const audioWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextClass = audioWindow.AudioContext || audioWindow.webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function tone({
  at,
  duration,
  frequency,
  gain,
  type = "sine",
}: {
  at: number;
  duration: number;
  frequency: number;
  gain: number;
  type?: OscillatorType;
}) {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const start = context.currentTime + at;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  volume.gain.setValueAtTime(0.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

export function playCommandSound(cue: CommandSoundCue) {
  if (!isCommandSoundEnabled()) return;

  if (cue === "tab") {
    tone({ at: 0, duration: 0.055, frequency: 420, gain: 0.028, type: "square" });
    tone({ at: 0.045, duration: 0.07, frequency: 760, gain: 0.018 });
    return;
  }

  if (cue === "confirm") {
    tone({ at: 0, duration: 0.075, frequency: 540, gain: 0.026 });
    tone({ at: 0.06, duration: 0.105, frequency: 880, gain: 0.022 });
    return;
  }

  if (cue === "fuel") {
    tone({ at: 0, duration: 0.08, frequency: 180, gain: 0.035, type: "sawtooth" });
    tone({ at: 0.045, duration: 0.14, frequency: 330, gain: 0.03, type: "triangle" });
    tone({ at: 0.12, duration: 0.12, frequency: 680, gain: 0.018 });
    return;
  }

  tone({ at: 0, duration: 0.11, frequency: 86, gain: 0.052, type: "sawtooth" });
  tone({ at: 0.035, duration: 0.18, frequency: 144, gain: 0.046, type: "triangle" });
  tone({ at: 0.12, duration: 0.22, frequency: 420, gain: 0.026 });
}

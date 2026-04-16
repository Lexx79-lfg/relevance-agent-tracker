import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Coins, Flame, CalendarDays, Volume2, VolumeX, RotateCcw, Plus, Minus, Package, ArrowDown, Quote } from "lucide-react";

const STORAGE_KEY = "relevance-agent-token-tracker-v2";
const MILESTONE_EVERY = 4;

const QUOTES = [
  "Do what you can, with what you have, where you are. — Theodore Roosevelt",
  "The best way to predict the future is to create it. — Peter Drucker",
  "Action is the foundational key to all success. — Pablo Picasso",
  "I didn’t need a better answer to ‘If.’ I needed a way to move forward.",
  "A mission completed is stronger than a perfect plan delayed.",
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(dateA, dateB) {
  const a = new Date(dateA + "T00:00:00");
  const b = new Date(dateB + "T00:00:00");
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function safeLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        tokens: 0,
        streak: 0,
        lastTokenDate: null,
        milestone: MILESTONE_EVERY,
        todayMission: "Operation Deploy App 🚀",
        notes: [],
        soundOn: true,
        volume: 82,
      };
    }
    return { milestone: MILESTONE_EVERY, volume: 82, ...JSON.parse(raw) };
  } catch {
    return {
      tokens: 0,
      streak: 0,
      lastTokenDate: null,
      milestone: MILESTONE_EVERY,
      todayMission: "Operation Deploy App 🚀",
      notes: [],
      soundOn: true,
      volume: 82,
    };
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function useRewardSound(enabled, volumePercent) {
  const audioCtxRef = useRef(null);
  const audioFileRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("/Cha-Ching.mp3");
    audio.volume = Math.min(1, Math.max(0, volumePercent / 100));
    audio.preload = "auto";
    audioFileRef.current = audio;
  }, [volumePercent]);

  const ensureCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtxRef.current = new AudioContextClass();
    }
    return audioCtxRef.current;
  };

  const tone = (ctx, destination, { type = "sine", frequency = 440, start = 0, duration = 0.2, gain = 0.08, endFrequency = null }) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now + start);
    if (endFrequency) {
      osc.frequency.exponentialRampToValueAtTime(endFrequency, now + start + duration);
    }
    amp.gain.setValueAtTime(0.0001, now + start);
    amp.gain.exponentialRampToValueAtTime(gain, now + start + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    osc.connect(amp);
    amp.connect(destination);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.02);
  };

  const play = (type = "token") => {
    if (!enabled) return;

    const isMilestone = type === "milestone";
    const volume = Math.min(1, Math.max(0, volumePercent / 100));

    const ctx = ensureCtx();
    if (ctx && ctx.state === "suspended") {
      ctx.resume(); // 🔥 ensures sound works after user click
    }

    // Play cha-ching on EVERY token (stronger on milestone)
    if (audioFileRef.current) {
      try {
        audioFileRef.current.currentTime = 0;
        audioFileRef.current.volume = isMilestone ? Math.min(1, volume) : Math.min(1, volume * 0.7);
        audioFileRef.current.play().catch(() => {});
      } catch {}
    }

    if (!ctx) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime((isMilestone ? 0.55 : 0.35) * volume, now + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, now + (isMilestone ? 2.5 : 1.0));
    master.connect(ctx.destination);

    if (isMilestone) {
      // BIG reward
      tone(ctx, master, { type: "square", frequency: 460, endFrequency: 80, start: 0, duration: 0.08, gain: 0.45 });
      tone(ctx, master, { type: "sawtooth", frequency: 1100, endFrequency: 220, start: 0.008, duration: 0.05, gain: 0.25 });
      tone(ctx, master, { type: "triangle", frequency: 860, start: 0.06, duration: 0.14, gain: 0.2 });
      tone(ctx, master, { type: "sine", frequency: 1320, start: 0.11, duration: 0.16, gain: 0.18 });

      // YAAAAAY tail
      tone(ctx, master, { type: "triangle", frequency: 620, endFrequency: 900, start: 0.3, duration: 0.8, gain: 0.14 });
      tone(ctx, master, { type: "sine", frequency: 900, endFrequency: 1400, start: 0.5, duration: 1.0, gain: 0.12 });
    } else {
      // SMALL reward (make sure it's audible!)
      tone(ctx, master, { type: "square", frequency: 340, endFrequency: 120, start: 0, duration: 0.06, gain: 0.25 });
      tone(ctx, master, { type: "triangle", frequency: 1100, start: 0.06, duration: 0.15, gain: 0.12 });
    }
  };

  return play;
}

function CelebrationBurst({ burstKey, isMilestone }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: isMilestone ? 90 : 28 }, (_, i) => ({
        id: `${burstKey}-${i}`,
        left: 4 + Math.random() * 92,
        delay: Math.random() * (isMilestone ? 0.3 : 0.14),
        duration: (isMilestone ? 3.6 : 1.35) + Math.random() * (isMilestone ? 1.8 : 0.9),
        rotate: -320 + Math.random() * 640,
        x: -240 + Math.random() * 480,
        size: isMilestone ? 6 + Math.random() * 10 : 4 + Math.random() * 6,
        shape: Math.random() > 0.7 ? "circle" : Math.random() > 0.45 ? "diamond" : "rect",
        color: ["bg-amber-300", "bg-yellow-200", "bg-sky-300", "bg-emerald-300", "bg-fuchsia-300", "bg-rose-300"][Math.floor(Math.random() * 6)],
      })),
    [burstKey, isMilestone]
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: isMilestone ? 40 : 8 }, (_, i) => ({
        id: `spark-${burstKey}-${i}`,
        left: 6 + Math.random() * 88,
        delay: Math.random() * (isMilestone ? 0.7 : 0.2),
        duration: (isMilestone ? 2.4 : 0.8) + Math.random() * (isMilestone ? 1.2 : 0.4),
        x: -140 + Math.random() * 280,
        size: isMilestone ? 4 + Math.random() * 6 : 2 + Math.random() * 3,
      })),
    [burstKey, isMilestone]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: -14, x: 0, rotate: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 0.9, 0],
              y: isMilestone ? "110vh" : 320,
              x: p.x,
              rotate: p.rotate,
              scale: [0.4, 1, 0.9, 0.75],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
            className={`absolute top-0 shadow-[0_0_16px_rgba(255,255,255,0.45)] ${p.color} ${p.shape === "circle" ? "rounded-full" : p.shape === "diamond" ? "rotate-45 rounded-sm" : "rounded-sm"}`}
            style={{ left: `${p.left}%`, width: `${p.size}px`, height: `${p.size * 1.6}px` }}
          />
        ))}
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 0, scale: 0.2 }}
            animate={{
              opacity: [0, 1, 0.8, 0],
              y: isMilestone ? "95vh" : 160,
              x: s.x,
              scale: [0.2, 1.35, 0.8, 0.2],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: s.duration, delay: s.delay, ease: "easeOut" }}
            className="absolute top-2 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,1)]"
            style={{ left: `${s.left}%`, width: `${s.size}px`, height: `${s.size}px` }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function RelevanceAgentTokenTracker() {
  const [state, setState] = useState(() => safeLoad());
  const [burstKey, setBurstKey] = useState(0);
  const [message, setMessage] = useState("Welcome, Relevance Agent.");
  const [logText, setLogText] = useState("");
  const [lastBurstWasMilestone, setLastBurstWasMilestone] = useState(false);

  useEffect(() => {
    save(state);
  }, [state]);

  const playSound = useRewardSound(state.soundOn, state.volume);
  const toNextMilestone = state.milestone - (state.tokens % state.milestone || state.milestone);
  const progressValue = ((state.tokens % state.milestone) / state.milestone) * 100;
  const quote = QUOTES[state.tokens % QUOTES.length];

  const addToken = () => {
    const today = todayKey();
    let newStreak = 1;

    if (state.lastTokenDate) {
      const gap = daysBetween(state.lastTokenDate, today);
      if (gap === 0) newStreak = state.streak;
      else if (gap === 1) newStreak = state.streak + 1;
      else newStreak = 1;
    }

    const newTokens = state.tokens + 1;
    const hitMilestone = newTokens % state.milestone === 0;

    setState((prev) => ({
      ...prev,
      tokens: newTokens,
      streak: newStreak,
      lastTokenDate: today,
      notes:
        logText.trim().length > 0
          ? [{ date: new Date().toLocaleString(), text: logText.trim() }, ...prev.notes].slice(0, 20)
          : prev.notes,
    }));

    setLogText("");
    setLastBurstWasMilestone(hitMilestone);
    setBurstKey((k) => k + 1);
    playSound(hitMilestone ? "milestone" : "token");
    setMessage(hitMilestone ? `Milestone reached: ${newTokens} tokens. Yaaaaay.` : `+1 token earned.`);
  };

  const removeToken = () => {
    if (state.tokens <= 0) return;
    setState((prev) => ({ ...prev, tokens: prev.tokens - 1 }));
    setMessage("Removed 1 token.");
  };

  const resetAll = () => {
    setState({
      tokens: 0,
      streak: 0,
      lastTokenDate: null,
      milestone: MILESTONE_EVERY,
      todayMission: "Operation Deploy App 🚀",
      notes: [],
      soundOn: state.soundOn,
      volume: state.volume,
    });
    setLogText("");
    setMessage("Tracker reset.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden rounded-3xl border-slate-700 bg-slate-900/80 backdrop-blur">
            <CelebrationBurst burstKey={burstKey} isMilestone={lastBurstWasMilestone} />
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-slate-300">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm uppercase tracking-[0.25em]">The Relevance Agent</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-amber-300" />
                    <ArrowDown className="h-6 w-6 text-sky-300" />
                    <CardTitle className="text-3xl md:text-4xl">Operation Deploy App</CardTitle>
                  </div>
                  <p className="mt-2 max-w-2xl text-slate-300">
                    Complete one mission. Log it. Earn the token. Every 4th token gets the full celebration.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                    onClick={() => setState((prev) => ({ ...prev, soundOn: !prev.soundOn }))}
                  >
                    {state.soundOn ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                    {state.soundOn ? "Sound On" : "Sound Off"}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                    onClick={resetAll}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-3xl border-slate-700 bg-slate-800/70">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-2xl bg-amber-500/20 p-3">
                      <Coins className="h-6 w-6 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Total Tokens</div>
                      <div className="text-3xl font-bold">{state.tokens}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-700 bg-slate-800/70">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-2xl bg-orange-500/20 p-3">
                      <Flame className="h-6 w-6 text-orange-300" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Current Streak</div>
                      <div className="text-3xl font-bold">{state.streak}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-700 bg-slate-800/70">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-2xl bg-sky-500/20 p-3">
                      <CalendarDays className="h-6 w-6 text-sky-300" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Today</div>
                      <div className="text-lg font-semibold">{todayKey()}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-3xl border-slate-700 bg-slate-800/70">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">Milestone Progress</div>
                      <div className="text-sm text-slate-400">
                        {toNextMilestone} token{toNextMilestone === 1 ? "" : "s"} until your next celebration at {state.milestone}.
                      </div>
                    </div>
                    <Badge className="rounded-xl bg-slate-700 text-slate-100 hover:bg-slate-700">
                      Every {state.milestone} tokens
                    </Badge>
                  </div>
                  <Progress value={progressValue} className="h-4 rounded-full" />
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <Card className="rounded-3xl border-slate-700 bg-slate-800/70">
                  <CardContent className="space-y-4 p-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Today's mission</label>
                      <Input
                        value={state.todayMission}
                        onChange={(e) => setState((prev) => ({ ...prev, todayMission: e.target.value }))}
                        placeholder="Operation Deploy App 🚀"
                        className="rounded-2xl border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">Quick log entry</label>
                      <textarea
                        value={logText}
                        onChange={(e) => setLogText(e.target.value)}
                        placeholder="Mission: ...\nWin: ...\nNext: ..."
                        className="min-h-[180px] w-full rounded-2xl border border-slate-600 bg-slate-900 p-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Volume2 className="h-4 w-4" /> Reward volume
                      </div>
                      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                        <Slider
                          value={[state.volume]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => setState((prev) => ({ ...prev, volume: value[0] ?? 80 }))}
                        />
                        <div className="mt-2 text-sm text-slate-400">{state.volume}%</div>
                      </div>
                    </div>

                    <div className="mb-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                      “I complete my mission. I am a Relevance Agent.”
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={addToken} className="rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                        <Plus className="mr-2 h-4 w-4" /> Earn Token
                      </Button>
                      <Button onClick={removeToken} variant="outline" className="rounded-2xl border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-700">
                        <Minus className="mr-2 h-4 w-4" /> Remove Token
                      </Button>
                    </div>
                    <motion.div
                      key={message}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-200"
                    >
                      {message}
                    </motion.div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="rounded-3xl border-slate-700 bg-slate-800/70">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl"><Quote className="h-5 w-5 text-amber-300" /> Encouragement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-sm leading-6 text-slate-200">
                        {quote}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-slate-700 bg-slate-800/70">
                    <CardHeader>
                      <CardTitle className="text-xl">Recent Logs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {state.notes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-600 p-4 text-sm text-slate-400">
                          No logs yet. Complete a mission, add a note, and earn your first token.
                        </div>
                      ) : (
                        state.notes.map((note, idx) => (
                          <motion.div
                            key={`${note.date}-${idx}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4"
                          >
                            <div className="mb-2 text-xs text-slate-400">{note.date}</div>
                            <div className="whitespace-pre-wrap text-sm text-slate-200">{note.text}</div>
                          </motion.div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

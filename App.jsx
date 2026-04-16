import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Coins, Flame, CalendarDays, Volume2, VolumeX, RotateCcw, Plus, Minus, Package, ArrowDown } from "lucide-react";

const STORAGE_KEY = "relevance-agent-token-tracker-v1";

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
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
        milestone: 5,
        todayMission: "Operation Deploy App 🚀",
        notes: [],
        soundOn: true,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      tokens: 0,
      streak: 0,
      lastTokenDate: null,
      milestone: 5,
      todayMission: "Operation Deploy App 🚀",
      notes: [],
      soundOn: true,
    };
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function useRewardSound(enabled) {
  const audioCtxRef = useRef(null);

  const ensureCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtxRef.current = new AudioContextClass();
    }
    return audioCtxRef.current;
  };

  const play = (type = "token") => {
    if (!enabled) return;
    const ctx = ensureCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
    master.gain.exponentialRampToValueAtTime(0.0001, now + (type === "milestone" ? 1.2 : 0.55));
    master.connect(ctx.destination);

    // Main reward tones (musical "yay")
    const notes =
      type === "milestone"
        ? [523.25, 659.25, 783.99, 1046.5]
        : [523.25, 659.25];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.0001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.14, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });

    // "Pop" transient (like Halo headshot pop)
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = "square";
    popOsc.frequency.setValueAtTime(200, now);
    popOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    popGain.gain.setValueAtTime(0.2, now);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    popOsc.connect(popGain);
    popGain.connect(master);
    popOsc.start(now);
    popOsc.stop(now + 0.09);

    // "Cha-ching" high sparkle
    const ching1 = ctx.createOscillator();
    const chingGain1 = ctx.createGain();
    ching1.type = "triangle";
    ching1.frequency.setValueAtTime(1200, now + 0.12);
    chingGain1.gain.setValueAtTime(0.0001, now + 0.12);
    chingGain1.gain.exponentialRampToValueAtTime(0.12, now + 0.14);
    chingGain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    ching1.connect(chingGain1);
    chingGain1.connect(master);
    ching1.start(now + 0.12);
    ching1.stop(now + 0.32);

    const ching2 = ctx.createOscillator();
    const chingGain2 = ctx.createGain();
    ching2.type = "triangle";
    ching2.frequency.setValueAtTime(1600, now + 0.18);
    chingGain2.gain.setValueAtTime(0.0001, now + 0.18);
    chingGain2.gain.exponentialRampToValueAtTime(0.1, now + 0.2);
    chingGain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    ching2.connect(chingGain2);
    chingGain2.connect(master);
    ching2.start(now + 0.18);
    ching2.stop(now + 0.36);
  };

  return play;
}

function ConfettiBurst({ burstKey }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: `${burstKey}-${i}`,
        left: 10 + Math.random() * 80,
        delay: Math.random() * 0.15,
        duration: 0.9 + Math.random() * 0.8,
        rotate: -180 + Math.random() * 360,
        x: -120 + Math.random() * 240,
      })),
    [burstKey]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: -10, x: 0, rotate: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: 250, x: p.x, rotate: p.rotate }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
            className="absolute top-0 h-3 w-2 rounded-sm bg-amber-400 shadow"
            style={{ left: `${p.left}%` }}
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

  useEffect(() => {
    save(state);
  }, [state]);

  const playSound = useRewardSound(state.soundOn);

  const toNextMilestone = state.milestone - (state.tokens % state.milestone || state.milestone);
  const progressValue = ((state.tokens % state.milestone) / state.milestone) * 100;

  const addToken = () => {
    const today = todayKey();
    let newStreak = 1;

    if (state.lastTokenDate) {
      const gap = daysBetween(state.lastTokenDate, today);
      if (gap === 0) {
        newStreak = state.streak;
      } else if (gap === 1) {
        newStreak = state.streak + 1;
      } else {
        newStreak = 1;
      }
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
    setBurstKey((k) => k + 1);
    playSound(hitMilestone ? "milestone" : "token");
    setMessage(hitMilestone ? `Milestone reached: ${newTokens} tokens.` : `+1 token earned.`);
  };

  const removeToken = () => {
    if (state.tokens <= 0) return;
    setState((prev) => ({ ...prev, tokens: prev.tokens - 1 }));
    setMessage("Removed 1 token.");
  };

  const resetAll = () => {
    const fresh = {
      tokens: 0,
      streak: 0,
      lastTokenDate: null,
      milestone: state.milestone,
      todayMission: "Operation Deploy App 🚀",
      notes: [],
      soundOn: state.soundOn,
    };
    setState(fresh);
    setLogText("");
    setMessage("Tracker reset.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden rounded-3xl border-slate-700 bg-slate-900/80 backdrop-blur">
            <ConfettiBurst burstKey={burstKey} />
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
                    Complete one mission. Log it. Earn the token. Repeat the loop.
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
                        {toNextMilestone} token{toNextMilestone === 1 ? "" : "s"} until your next reward at {state.milestone}.
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

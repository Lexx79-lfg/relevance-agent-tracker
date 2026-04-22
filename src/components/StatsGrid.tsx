import { CalendarDays, Coins, Flame } from "lucide-react";

type StatsGridProps = {
  tokens: number;
  streak: number;
  today: string;
};

export function StatsGrid({ tokens, streak, today }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="starshooter-stat-card">
        <div className="flex items-center gap-4 p-4 md:p-5">
          <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-500/10 p-3 shadow-[0_0_24px_rgba(74,222,128,0.14)]">
            <Coins className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Fuel Cells</div>
            <div className="mt-2 text-3xl font-semibold text-white">{tokens}</div>
          </div>
        </div>
      </div>

      <div className="starshooter-stat-card">
        <div className="flex items-center gap-4 p-4 md:p-5">
          <div className="rounded-[20px] border border-orange-400/20 bg-orange-500/10 p-3 shadow-[0_0_24px_rgba(251,146,60,0.14)]">
            <Flame className="h-6 w-6 text-orange-300" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Current Streak</div>
            <div className="mt-2 text-3xl font-semibold text-white">{streak}</div>
          </div>
        </div>
      </div>

      <div className="starshooter-stat-card">
        <div className="flex items-center gap-4 p-4 md:p-5">
          <div className="rounded-[20px] border border-sky-400/20 bg-sky-500/10 p-3 shadow-[0_0_24px_rgba(56,189,248,0.12)]">
            <CalendarDays className="h-6 w-6 text-sky-300" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Today</div>
            <div className="mt-2 text-lg font-semibold text-white">{today}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

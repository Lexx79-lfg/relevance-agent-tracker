import { ArrowDown, Package, RotateCcw, Sparkles, Volume2, VolumeX } from "lucide-react";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type HeaderHeroProps = {
  todayMission: string;
  headline: string;
  quote: string;
  soundOn: boolean;
  onToggleSound: () => void;
  onReset: () => void;
};

function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50",
        variant === "outline"
          ? "border border-slate-600 bg-transparent text-slate-100"
          : "bg-slate-100 text-slate-950",
        className
      )}
      {...props}
    />
  );
}

export function HeaderHero({
  todayMission,
  headline,
  quote,
  soundOn,
  onToggleSound,
  onReset,
}: HeaderHeroProps) {
  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
      <div>
        <div className="flex items-center gap-2 text-emerald-200/80">
          <Sparkles className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.42em]">Starshooter Command</span>
        </div>
        <div className="mt-6 flex items-start gap-4">
          <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-3 shadow-[0_0_34px_rgba(74,222,128,0.18)]">
            <Package className="h-7 w-7 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-3 text-orange-200/80">
              <ArrowDown className="h-5 w-5" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.38em]">Primary Mission</span>
            </div>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold uppercase tracking-[0.14em] text-white md:text-5xl xl:text-6xl">
              {todayMission || "Your Mission"}
            </h1>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
          Complete one mission. Log the win. Fuel the rocket. Build momentum until the next launch celebration.
        </p>
      </div>

      <div className="starshooter-panel space-y-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.38em] text-orange-200/80">Flight Directive</div>
          <p className="mt-4 text-2xl font-semibold uppercase tracking-[0.08em] leading-tight text-white md:text-3xl">{headline}</p>
          <p className="mt-4 border-l border-emerald-400/18 pl-4 text-sm italic leading-8 text-slate-200 md:text-base">"{quote}"</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-full border-emerald-400/25 bg-emerald-500/10 px-5 text-emerald-50 hover:bg-emerald-500/20"
            onClick={onToggleSound}
          >
            {soundOn ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
            {soundOn ? "Sound On" : "Sound Off"}
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-orange-400/25 bg-orange-500/10 px-5 text-orange-50 hover:bg-orange-500/20"
            onClick={onReset}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

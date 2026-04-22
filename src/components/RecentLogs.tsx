import { motion } from "framer-motion";
import { TrackerState } from "../lib/tracker";

type RecentLogsProps = {
  notes: TrackerState["notes"];
};

export function RecentLogs({ notes }: RecentLogsProps) {
  return (
    <div className="starshooter-panel h-full">
      <div className="flex flex-col space-y-1.5 p-6 pb-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.38em] text-orange-200/80">Flight History</div>
        <h3 className="text-2xl font-semibold uppercase tracking-[0.16em] text-white">Mission Logs</h3>
      </div>
      <div className="p-6 pt-5 space-y-3">
        {notes.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-600/80 bg-slate-950/50 p-5 text-sm leading-7 text-slate-300">
            No logs yet. Complete a mission, add a note, and earn your first token.
          </div>
        ) : (
          notes.map((note, index) => (
            <motion.div
              key={`${note.date}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border border-slate-700/80 bg-slate-950/55 p-5 shadow-[0_18px_36px_rgba(0,0,0,0.24)]"
            >
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200/70">{note.date}</div>
              <div className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{note.text}</div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

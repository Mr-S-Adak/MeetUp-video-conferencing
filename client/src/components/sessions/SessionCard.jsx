import { CalendarIcon, UserIcon } from "lucide-react";
import React from "react";

const SessionCard = ({ session, onOpenDetails, onRejoin }) => {
  const isEnded = session.status === "ended";
  return (
    <div className="bg-white/70 backdrop-blur rounded-3xl p-6 transition-all flex flex-col justify-between space-y-5 shadow-[0_10px_40px_rgba(15,23,42,0.10)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 font-medium bg-slate-500/5 px-2.5 py-1 rounded-md">
            ID: {session.meetingId}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${isEnded ? "bg-slate-500/5 text-slate-500" : "bg-emerald-500/5 text-emerald-500"}`}
          >
            <span
              className={`size-1.25 rounded-full ${isEnded ? "bg-slate-400" : "bg-emerald-500"}`}
            />
            {isEnded ? "Ended" : "Active"}
          </span>
        </div>
        <h3 className="text-xl font-medium text-slate-900 truncate">
          {session.title || "Instant Meeting"}
        </h3>
        <p className="test-xs text-slate-400 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
          {new Date(session.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {/* stats row */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-300/30">
        <div className="flex items-center gap-2 text-xs bg-slate-500/5 p-2.5 rounded-xl">
          <UserIcon className="w-4 h-4 text-primary" />
          <span>
            <strong>{session.participants?.length || 0}</strong> Participants
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;

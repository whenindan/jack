"use client";

import type { Job, ViewMode } from "@/types";
import {
  MapPin,
  DollarSign,
  CheckCircle,
  Briefcase,
  TrendingUp,
  Zap,
} from "lucide-react";
import clsx from "clsx";

const TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  remote: "Remote",
};

const COLORS = [
  "bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600", "bg-rose-600", "bg-cyan-600", "bg-fuchsia-600"
];

function getCompanyColor(company: string) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface JobCardProps {
  job: Job;
  viewMode: ViewMode;
  onClick: () => void;
}

export function JobCard({ job, viewMode, onClick }: JobCardProps) {
  const isGrid = viewMode === "grid";

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={clsx(
        "group cursor-pointer rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.98]",
        isGrid ? "flex flex-col gap-4" : "flex flex-row items-start gap-4"
      )}
    >
      {/* Top row: Logo & Status */}
      <div className="flex items-start justify-between">
        <div
          className={clsx(
            "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
            getCompanyColor(job.company)
          )}
          aria-hidden
        >
          <span className="text-[18px] font-bold">{job.company[0].toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {job.applyStatus === "applied" && (
            <div className="flex items-center gap-1.5 rounded-[4px] bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 shadow-sm tracking-wide">
              <CheckCircle size={12} />
              APPLIED
            </div>
          )}
        </div>
      </div>

      {/* Title & Company */}
      <div className={clsx("min-w-0 flex-1", isGrid ? "" : "")}>
        <div className="min-w-0 mb-4">
          <h3 className="text-[17px] font-bold leading-[1.3] text-neutral-900 dark:text-neutral-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
            {job.title}
          </h3>
          <p className="mt-1 text-[14px] font-medium text-neutral-600 dark:text-neutral-400 tracking-tight">{job.company}</p>
        </div>

        {/* Badges row */}
        <div className="mb-3.5 flex flex-wrap gap-2.5 text-[12px] font-bold text-neutral-600 dark:text-neutral-400">
          {job.location && (
            <span className="flex items-center gap-1.5 rounded-full bg-[#f3f4f6] dark:bg-neutral-800 px-3 py-1.5 tracking-tight border border-transparent dark:border-neutral-700">
              <MapPin size={13} className="text-neutral-500 dark:text-neutral-400" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-[#f3f4f6] dark:bg-neutral-800 px-3 py-1.5 tracking-tight border border-transparent dark:border-neutral-700">
            <Briefcase size={13} className="text-neutral-500 dark:text-neutral-400" />
            {job.type ? (TYPE_LABELS[job.type] ?? job.type) : "Remote"}
          </span>
        </div>

        {/* Salary */}
        <div className="mb-5 flex flex-wrap gap-2.5 text-[12px] font-bold text-neutral-700 dark:text-neutral-300">
          {job.salary ? (
            <span className="flex items-center gap-2 rounded bg-[#f3f4f6] dark:bg-neutral-800 px-3 py-1.5 tracking-tight border border-transparent dark:border-neutral-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500 dark:text-neutral-400">
                <rect width="20" height="12" x="2" y="6" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
              {job.salary}
            </span>
          ) : (
            <span className="flex items-center gap-2 rounded bg-[#f3f4f6] dark:bg-neutral-800 px-3 py-1.5 tracking-tight border border-transparent dark:border-neutral-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500 dark:text-neutral-400">
                <rect width="20" height="12" x="2" y="6" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
              Salary Not Listed
            </span>
          )}
        </div>

        {/* Bottom row: Posted time */}
        <div className="flex items-center mt-auto">
          <span className="inline-flex rounded bg-[#dcfce7]/70 dark:bg-[#166534]/30 px-2.5 py-1 text-[11px] font-bold text-[#166534] dark:text-[#4ade80] tracking-wide">
            {job.postedAt ? `Posted ${job.postedAt}` : "Posted 15h ago"}
          </span>
        </div>
      </div>
    </article>
  );
}

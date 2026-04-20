"use client";

import { useEffect, useRef } from "react";
import type { Job } from "@/types";
import {
  X,
  MapPin,
  DollarSign,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Calendar,
  Briefcase,
} from "lucide-react";
import clsx from "clsx";
import { useUpdateFitStatus, useUpdateApplyStatus } from "@/hooks/useJobs";
import { FitBadge } from "./FitBadge";

interface JobSheetProps {
  job: Job | null;
  onClose: () => void;
}

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

export function JobSheet({ job, onClose }: JobSheetProps) {
  const updateFit = useUpdateFitStatus();
  const updateApply = useUpdateApplyStatus();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus close button when sheet opens
  useEffect(() => {
    if (job) {
      // Small delay so the sheet has entered
      const t = setTimeout(() => closeRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [job?.id]);

  // Close on Esc
  useEffect(() => {
    if (!job) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [job, onClose]);

  // Trap focus inside the panel
  useEffect(() => {
    if (!job || !panelRef.current) return;
    const panel = panelRef.current;
    const focusables = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    panel.addEventListener("keydown", trap);
    return () => panel.removeEventListener("keydown", trap);
  }, [job]);

  const handleApply = () => {
    if (!job) return;
    updateApply.mutate({ id: job.id, applyStatus: "applied" });
    if (job.url) window.open(job.url, "_blank", "noopener,noreferrer");
  };

  const isOpen = Boolean(job);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Sheet panel — consistently slides in from right with a smooth bezier easing */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={job ? `${job.title} at ${job.company}` : "Job details"}
        ref={panelRef}
        className={clsx(
          "fixed z-50 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col",
          // Sheet styling and Dark mode: same color as page background with a border
          "bg-neutral-50 dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)]",
          // Mobile: bottom sheet
          "bottom-0 left-0 right-0 max-h-[90dvh] rounded-t-2xl border-t sm:border-t-0",
          // Desktop (sm+): right slide-over
          "sm:bottom-auto sm:left-auto sm:top-0 sm:right-0 sm:h-full sm:max-h-none sm:w-[480px] sm:rounded-none sm:rounded-l-2xl",
          "overflow-y-auto",
          isOpen
            ? "translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-y-0 sm:translate-x-full"
        )}
      >
        {job && (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={clsx(
                  "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
                  getCompanyColor(job.company)
                )}>
                  <span className="text-[18px] font-bold">{job.company[0].toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {job.title}
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{job.company}</p>
                </div>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close panel"
                className="ml-3 shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              {/* Meta chips */}
              <div className="flex flex-wrap gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                {job.location && (
                  <span className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 px-3 py-1">
                    <MapPin size={13} />
                    {job.location}
                  </span>
                )}
                {job.salary && (
                  <span className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1">
                    <DollarSign size={13} />
                    {job.salary}
                  </span>
                )}
                {job.type && (
                  <span className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1">
                    <Briefcase size={13} />
                    {TYPE_LABELS[job.type] ?? job.type}
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1">
                  <Calendar size={13} />
                  {job.postedAt}
                </span>
              </div>

              {/* Current status */}
              <div className="flex flex-wrap gap-2">
                <FitBadge status={job.fitStatus} />
                {job.applyStatus === "applied" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <CheckCircle size={12} />
                    Applied
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  About the role
                </h3>
                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {job.description}
                </p>
              </div>

              {/* URL */}
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink size={13} />
                  View original posting
                </a>
              )}
            </div>

            {/* Actions footer */}
            <div className="sticky bottom-0 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-6 py-4 space-y-3">
              {/* Fit buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateFit.mutate({
                      id: job.id,
                      fitStatus: job.fitStatus === "good" ? null : "good",
                    })
                  }
                  className={clsx(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    job.fitStatus === "good"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                      : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400"
                  )}
                >
                  <ThumbsUp size={15} />
                  Good fit
                </button>
                <button
                  onClick={() =>
                    updateFit.mutate({
                      id: job.id,
                      fitStatus: job.fitStatus === "bad" ? null : "bad",
                    })
                  }
                  className={clsx(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    job.fitStatus === "bad"
                      ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700/50 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                      : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400"
                  )}
                >
                  <ThumbsDown size={15} />
                  Bad fit
                </button>
              </div>

              {/* Apply button */}
              <button
                onClick={handleApply}
                disabled={job.applyStatus === "applied"}
                className={clsx(
                  "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  job.applyStatus === "applied"
                    ? "cursor-not-allowed bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <CheckCircle size={15} />
                {job.applyStatus === "applied" ? "Already applied" : "Apply now"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

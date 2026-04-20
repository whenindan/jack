"use client";

import { useMemo, useState, useEffect } from "react";
import { Plus, AlertCircle, Loader2, Inbox, Moon, Sun } from "lucide-react";
import type { Job, JobFilters, ViewMode } from "@/types";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "./JobCard";
import { JobSheet } from "./JobSheet";
import { JobFiltersBar } from "./JobFilters";
import { AddJobModal } from "./AddJobModal";
import clsx from "clsx";

export function JobBoard() {
  const { data: jobs, isLoading, isError, error } = useJobs();

  const [filters, setFilters] = useState<JobFilters>({ company: "", title: "", type: "" });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDark(true);
  }, []);

  const toggleDark = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
  };

  // Derived state
  const companies = useMemo(
    () => Array.from(new Set((jobs ?? []).map((j) => j.company))).sort(),
    [jobs]
  );

  const types = useMemo(
    () => Array.from(new Set((jobs ?? []).map((j) => j.type).filter(Boolean) as string[])).sort(),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    const titleQ = filters.title.toLowerCase().trim();
    const companyQ = filters.company.toLowerCase().trim();
    const typeQ = filters.type.toLowerCase().trim();

    return jobs.filter((j) => {
      if (titleQ && !j.title.toLowerCase().includes(titleQ)) return false;
      if (companyQ && !j.company.toLowerCase().includes(companyQ)) return false;
      if (typeQ && j.type !== typeQ) return false;
      return true;
    });
  }, [jobs, filters]);

  const selectedJob = useMemo(
    () => (jobs ?? []).find((j) => j.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  // --- Render states ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-neutral-400">
        <Loader2 size={28} className="animate-spin" />
        <p className="text-sm">Loading jobs…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-red-500">
        <AlertCircle size={28} />
        <p className="text-sm font-medium">
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page header */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
            <span className="text-[36px] inline-block hover:rotate-12 origin-bottom-right transition-transform cursor-pointer">👋</span>
            Hi Dat
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={toggleDark}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button
            onClick={() => setAddOpen(true)}
            className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95"
          >
            <Plus size={16} />
            Add job
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <JobFiltersBar
          filters={filters}
          onChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          companies={companies}
          types={types}
          total={jobs?.length ?? 0}
          filtered={filteredJobs.length}
        />
      </div>

      {/* Job list / grid */}
      {filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 py-20 text-neutral-400 dark:text-neutral-500">
          <Inbox size={32} />
          <p className="text-sm">No jobs match your filters.</p>
        </div>
      ) : (
        <div
          className={clsx(
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          )}
        >
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              viewMode={viewMode}
              onClick={() => setSelectedJobId(job.id)}
            />
          ))}
        </div>
      )}

      {/* Job detail sheet */}
      <JobSheet job={selectedJob} onClose={() => setSelectedJobId(null)} />

      {/* Add job modal */}
      <AddJobModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

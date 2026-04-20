"use client";

import type { JobFilters, ViewMode } from "@/types";
import { ChevronDown, SlidersHorizontal, X, LayoutGrid, LayoutList } from "lucide-react";
import clsx from "clsx";

interface JobFiltersProps {
  filters: JobFilters;
  onChange: (f: JobFilters) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  companies: string[];
  types: string[];
  total: number;
  filtered: number;
}

export function JobFiltersBar({
  filters,
  onChange,
  viewMode,
  onViewModeChange,
  companies,
  types,
  filtered,
}: JobFiltersProps) {
  const hasTitleFilter = filters.title !== "";

  return (
    <div className="flex flex-col gap-6">
      {/* Job Titles Search */}
      <div>
        <label className="mb-2 block text-[15px] font-bold text-neutral-800 dark:text-neutral-200">
          Job Titles
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-[9px] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] dark:shadow-none focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-300 ease-in-out">
          <input
            type="text"
            placeholder="Search by job title..."
            value={filters.title}
            onChange={(e) => {
              onChange({ ...filters, title: e.target.value });
            }}
            className="flex-1 bg-transparent px-2 text-[15px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
          />
          {hasTitleFilter && (
            <button
              onClick={() => onChange({ ...filters, title: "" })}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none transition-colors px-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Other filters */}
      <div>
        <label className="mb-3 block text-[15px] font-bold text-neutral-800 dark:text-neutral-200">
          Other filters
        </label>
        <div className="flex flex-wrap items-center gap-3">
          {/* Companies Dropdown */}
          <div className="relative group">
            <select
              value={filters.company}
              onChange={(e) => onChange({ ...filters, company: e.target.value })}
              className="appearance-none flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 pl-4 pr-10 py-[7px] text-[15px] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 shadow-sm transition-all focus:outline-none cursor-pointer"
            >
              <option value="">Company</option>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown size={16} className="text-neutral-400 group-hover:text-neutral-600 transition-colors" />
            </div>
          </div>

          {/* Type Dropdown */}
          <div className="relative group">
            <select
              value={filters.type}
              onChange={(e) => onChange({ ...filters, type: e.target.value })}
              className="appearance-none flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 pl-4 pr-10 py-[7px] text-[15px] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 shadow-sm transition-all focus:outline-none cursor-pointer capitalize"
            >
              <option value="">Job Type</option>
              {types.map((t) => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown size={16} className="text-neutral-400 group-hover:text-neutral-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Header for job lists */}
      <div className="mt-8 flex items-center justify-between pb-1">
        <h2 className="text-[22px] font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
          {filtered} Jobs Available
        </h2>
        
        {/* View Mode Toggle */}
        <div className="flex rounded-[6px] border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden shadow-sm">
          <button
            onClick={() => onViewModeChange("grid")}
            className={clsx(
              "flex h-[34px] w-[34px] items-center justify-center transition-colors",
              viewMode === "grid"
                ? "bg-neutral-900 text-white dark:bg-neutral-200 dark:text-neutral-900"
                : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={clsx(
              "flex h-[34px] w-[34px] items-center justify-center transition-colors",
              viewMode === "list"
                ? "bg-neutral-900 text-white dark:bg-neutral-200 dark:text-neutral-900"
                : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            )}
            aria-label="List view"
          >
            <LayoutList size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import type { JobType } from "@/types";
import { useAddJob } from "@/hooks/useJobs";
import clsx from "clsx";

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
}

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
];

interface FormState {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary: string;
  type: JobType | "";
}

const EMPTY: FormState = {
  title: "",
  company: "",
  location: "",
  description: "",
  url: "",
  salary: "",
  type: "",
};

export function AddJobModal({ open, onClose }: AddJobModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const addJob = useAddJob();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (!open || !panelRef.current) return;
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
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    panel.addEventListener("keydown", trap);
    return () => panel.removeEventListener("keydown", trap);
  }, [open]);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.company.trim()) errs.company = "Company is required";
    if (form.url && !/^https?:\/\//.test(form.url))
      errs.url = "Must start with http:// or https://";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addJob.mutate(
      {
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim() || "Unspecified",
        description: form.description.trim() || "No description provided.",
        url: form.url.trim() || undefined,
        salary: form.salary.trim() || undefined,
        type: (form.type as JobType) || undefined,
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a new job"
        ref={panelRef}
        className={clsx(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl transition-all duration-200",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-base font-semibold text-neutral-900">Add a job</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-4 px-6 py-5">
            {/* Title */}
            <div className="col-span-2">
              <Label htmlFor="jt-title">
                Title <Required />
              </Label>
              <input
                ref={firstInputRef}
                id="jt-title"
                type="text"
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Senior Frontend Engineer"
                className={inputCls(!!errors.title)}
              />
              {errors.title && <FieldError msg={errors.title} />}
            </div>

            {/* Company */}
            <div className="col-span-2">
              <Label htmlFor="jt-company">
                Company <Required />
              </Label>
              <input
                id="jt-company"
                type="text"
                value={form.company}
                onChange={set("company")}
                placeholder="e.g. Acme Corp"
                className={inputCls(!!errors.company)}
              />
              {errors.company && <FieldError msg={errors.company} />}
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="jt-location">Location</Label>
              <input
                id="jt-location"
                type="text"
                value={form.location}
                onChange={set("location")}
                placeholder="e.g. Remote"
                className={inputCls()}
              />
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="jt-type">Type</Label>
              <select
                id="jt-type"
                value={form.type}
                onChange={set("type")}
                className={inputCls()}
              >
                <option value="">Select…</option>
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Salary */}
            <div>
              <Label htmlFor="jt-salary">Salary</Label>
              <input
                id="jt-salary"
                type="text"
                value={form.salary}
                onChange={set("salary")}
                placeholder="e.g. $120k–$160k"
                className={inputCls()}
              />
            </div>

            {/* URL */}
            <div>
              <Label htmlFor="jt-url">Job URL</Label>
              <input
                id="jt-url"
                type="url"
                value={form.url}
                onChange={set("url")}
                placeholder="https://…"
                className={inputCls(!!errors.url)}
              />
              {errors.url && <FieldError msg={errors.url} />}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="jt-desc">Description</Label>
              <textarea
                id="jt-desc"
                value={form.description}
                onChange={set("description")}
                rows={4}
                placeholder="Paste a snippet from the job posting…"
                className={inputCls() + " resize-none"}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-neutral-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addJob.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {addJob.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Add job
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// Small helpers

function inputCls(hasError = false) {
  return clsx(
    "mt-1 block w-full rounded-md border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
    hasError ? "border-red-400" : "border-neutral-200"
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-neutral-700">
      {children}
    </label>
  );
}

function Required() {
  return <span className="text-red-500"> *</span>;
}

function FieldError({ msg }: { msg: string }) {
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

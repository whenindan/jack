export type FitStatus = "good" | "bad" | null;
export type ApplyStatus = "applied" | "not_applied";
export type JobType = "full-time" | "part-time" | "contract" | "remote";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url?: string;
  salary?: string;
  type?: JobType;
  postedAt: string;
  fitStatus: FitStatus;
  applyStatus: ApplyStatus;
  isUserAdded?: boolean;
}

export interface JobFilters {
  company: string;
  title: string;
  type: string;
}

export type ViewMode = "grid" | "list";

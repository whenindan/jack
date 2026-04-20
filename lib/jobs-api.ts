import { supabase } from "./supabase";
import type { Job, FitStatus, ApplyStatus } from "@/types";
import type { JobRow, JobUpdate } from "./database.types";

function rowToJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    description: row.description,
    url: row.url ?? undefined,
    salary: row.salary ?? undefined,
    type: row.type ?? undefined,
    postedAt: row.posted_at,
    fitStatus: row.fit_status ?? null,
    applyStatus: row.apply_status,
    isUserAdded: row.is_user_added,
  };
}

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("posted_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToJob);
}

export async function updateJobState(
  id: string,
  patch: { fitStatus?: FitStatus; applyStatus?: ApplyStatus }
): Promise<void> {
  const update: JobUpdate = {};
  if ("fitStatus" in patch) update.fit_status = patch.fitStatus ?? null;
  if ("applyStatus" in patch) update.apply_status = patch.applyStatus!;

  const { error } = await supabase.from("jobs").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createJob(
  data: Omit<Job, "id" | "fitStatus" | "applyStatus" | "postedAt" | "isUserAdded">
): Promise<Job> {
  const { data: row, error } = await supabase
    .from("jobs")
    .insert({
      title: data.title,
      company: data.company,
      location: data.location,
      description: data.description,
      url: data.url ?? null,
      salary: data.salary ?? null,
      type: data.type ?? null,
      posted_at: new Date().toISOString().split("T")[0],
      is_user_added: true,
      fit_status: null,
      apply_status: "not_applied",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToJob(row);
}

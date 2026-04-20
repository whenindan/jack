"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { Job, FitStatus, ApplyStatus } from "@/types";
import { fetchJobs, updateJobState, createJob } from "@/lib/jobs-api";

export const JOBS_QUERY_KEY = ["jobs"] as const;

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export function useJobs() {
  return useQuery<Job[]>({
    queryKey: JOBS_QUERY_KEY,
    queryFn: fetchJobs,
    // No staleTime — network data should always be considered fresh on re-focus.
    // TanStack Query defaults (staleTime: 0) are appropriate here.
  });
}

// ---------------------------------------------------------------------------
// Mutations — optimistic updates for immediate UI, then re-fetch to confirm.
// ---------------------------------------------------------------------------

function applyOptimisticJobPatch(
  qc: QueryClient,
  id: string,
  patch: Partial<Job>
) {
  qc.setQueryData<Job[]>(JOBS_QUERY_KEY, (prev) =>
    prev?.map((j) => (j.id === id ? { ...j, ...patch } : j)) ?? []
  );
}

export function useUpdateFitStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fitStatus }: { id: string; fitStatus: FitStatus }) =>
      updateJobState(id, { fitStatus }),

    onMutate: ({ id, fitStatus }) => {
      const prev = qc.getQueryData<Job[]>(JOBS_QUERY_KEY);
      applyOptimisticJobPatch(qc, id, { fitStatus });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(JOBS_QUERY_KEY, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
}

export function useUpdateApplyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      applyStatus,
    }: {
      id: string;
      applyStatus: ApplyStatus;
    }) => updateJobState(id, { applyStatus }),

    onMutate: ({ id, applyStatus }) => {
      const prev = qc.getQueryData<Job[]>(JOBS_QUERY_KEY);
      applyOptimisticJobPatch(qc, id, { applyStatus });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(JOBS_QUERY_KEY, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
}

export function useAddJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createJob,
    onSuccess: (newJob) => {
      qc.setQueryData<Job[]>(JOBS_QUERY_KEY, (prev) =>
        prev ? [newJob, ...prev] : [newJob]
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
}

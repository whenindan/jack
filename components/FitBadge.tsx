import type { FitStatus } from "@/types";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import clsx from "clsx";

export function FitBadge({ status }: { status: FitStatus }) {
  if (!status) return null;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        status === "good"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-600"
      )}
    >
      {status === "good" ? <ThumbsUp size={11} /> : <ThumbsDown size={11} />}
      {status === "good" ? "Good fit" : "Bad fit"}
    </span>
  );
}

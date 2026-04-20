// Hand-written types matching the jobs table schema.
// Run `npx supabase gen types typescript` after linking a project to auto-generate these.

export type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string | null;
  salary: string | null;
  type: "full-time" | "part-time" | "contract" | "remote" | null;
  posted_at: string;
  created_at: string;
  is_user_added: boolean;
  fit_status: "good" | "bad" | null;
  apply_status: "applied" | "not_applied";
};

export type JobInsert = Omit<JobRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type JobUpdate = Partial<JobRow>;

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: JobRow;
        Insert: JobInsert;
        Update: JobUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

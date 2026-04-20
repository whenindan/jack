# Jack — Mini Job Board

A self-contained job board built with Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query, and Supabase.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase setup

### 1. Create a project

Go to [supabase.com](https://supabase.com), create a new project, and wait for it to be ready.

### 2. Create the table

Run this in the **SQL Editor** (Database → SQL Editor → New query):

```sql
create table jobs (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  company      text not null,
  location     text not null default '',
  description  text not null default '',
  url          text,
  salary       text,
  type         text check (type in ('full-time', 'part-time', 'contract', 'remote')),
  posted_at    date not null default current_date,
  created_at   timestamptz not null default now(),
  is_user_added boolean not null default false,
  fit_status   text check (fit_status in ('good', 'bad')),
  apply_status text not null default 'not_applied'
                    check (apply_status in ('applied', 'not_applied'))
);
```

### 3. Enable RLS and add policies

```sql
alter table jobs enable row level security;

-- For this demo, allow all anon reads and writes.
-- In production, replace `true` with `auth.uid() = owner_id` (add an owner_id column).
create policy "anon can read"   on jobs for select using (true);
create policy "anon can insert" on jobs for insert with check (true);
create policy "anon can update" on jobs for update using (true);
```

### 4. Seed the initial jobs

```sql
insert into jobs (title, company, location, description, url, salary, type, posted_at, is_user_added) values
('Senior Frontend Engineer',      'Vercel',   'Remote',                    'Join Vercel''s frontend team to shape developer experience at scale. You''ll work on the Vercel dashboard, build internal tooling, and contribute to open-source projects like Next.js. We value ownership, autonomy, and shipping fast.',                                                           'https://vercel.com/careers',          '$160k – $210k',        'remote',    '2026-04-15', false),
('Staff Software Engineer, Platform', 'Linear', 'San Francisco, CA / Remote','Help us build the infrastructure that powers project management for thousands of software teams. You''ll own large surface areas, mentor engineers, and drive technical strategy for our core platform.',                                                                                      'https://linear.app/careers',          '$200k – $260k',        'remote',    '2026-04-14', false),
('Full-Stack Engineer',           'Supabase', 'Remote',                    'Supabase is building the open source Firebase alternative. We need engineers who love databases, APIs, and great developer experiences. You''ll work across the stack—from Postgres internals to React UIs.',                                                                                        'https://supabase.com/careers',        '$140k – $190k',        'remote',    '2026-04-13', false),
('React Engineer',                'Figma',    'San Francisco, CA',         'Work on Figma''s web application, one of the most complex React apps in production. You''ll tackle performance, accessibility, and new feature development across a massive canvas-based editor.',                                                                                                 'https://figma.com/careers',           '$175k – $230k',        'full-time', '2026-04-12', false),
('Frontend Engineer, Growth',     'Notion',   'New York, NY / Remote',     'Drive Notion''s growth through experimentation, onboarding improvements, and monetization flows. You''ll partner closely with product and data to run A/B tests and measure impact on activation and retention.',                                                                                  'https://notion.so/careers',           '$155k – $200k',        'remote',    '2026-04-11', false),
('Software Engineer II, Data Platform', 'Stripe', 'Seattle, WA',           'Join Stripe''s data platform team to build scalable data pipelines and infrastructure that process billions of transactions. Strong distributed systems background required.',                                                                                                                    'https://stripe.com/jobs',             '$170k – $220k',        'full-time', '2026-04-10', false),
('Engineering Manager, Frontend', 'GitHub',   'Remote',                    'Lead a team of 5–8 engineers building GitHub''s web interfaces. You''ll combine hands-on technical leadership with people management—hiring, growing, and retaining top frontend talent.',                                                                                                        'https://github.com/about/careers',    '$185k – $245k',        'remote',    '2026-04-09', false),
('TypeScript Engineer',           'Prisma',   'Remote',                    'Shape the future of database tooling for JavaScript developers. You''ll work on the Prisma ORM, schema language, and IDE integrations—contributing directly to one of the most-used TypeScript libraries in the ecosystem.',                                                                      'https://prisma.io/careers',           '$130k – $175k',        'remote',    '2026-04-08', false),
('Senior Product Engineer',       'Loom',     'San Francisco, CA / Remote','Build async communication tools used by millions. As a product engineer at Loom you''ll own features end-to-end—from spec through shipping—working closely with design and product on a small, fast team.',                                                                                       'https://loom.com/careers',            '$150k – $195k',        'remote',    '2026-04-07', false),
('Software Engineer, Search',     'Algolia',  'Paris, France / Remote',    'Work on Algolia''s hosted search infrastructure, relevance algorithms, and developer-facing APIs. You''ll collaborate across engineering, product, and research teams to improve search quality for thousands of customers.',                                                                      'https://algolia.com/careers',         '€90k – €130k',         'remote',    '2026-04-06', false),
('Next.js Developer',             'Shopify',  'Ottawa, Canada / Remote',   'Help merchants sell more by building beautiful, fast storefronts with Next.js Commerce. You''ll contribute to Hydrogen, our headless commerce framework, and work closely with merchant success stories.',                                                                                        'https://shopify.com/careers',         'CAD $140k – $190k',    'remote',    '2026-04-05', false),
('Frontend Infrastructure Engineer', 'Airbnb','San Francisco, CA',         'Improve the developer experience for 200+ frontend engineers by building tooling, shared components, and performance infrastructure. Previous experience with monorepo tooling and CI optimization is a plus.',                                                                                   'https://airbnb.com/careers',          '$190k – $250k',        'full-time', '2026-04-04', false);
```

### 5. Copy your credentials

Go to **Settings → API** in your Supabase project and copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Paste them into `.env.local`.

---

## State management

| Concern | Where it lives |
|---|---|
| Job list | TanStack Query cache (`queryKey: ["jobs"]`), fetched from Supabase on mount |
| Fit status & apply status | Persisted directly on the `jobs` row in Supabase; updated via mutations with optimistic cache patches |
| UI state (selected job, modal open, view mode, filters) | Local `useState` in `JobBoard.tsx` |

Fit/apply mutations use optimistic updates (instant UI) + `invalidateQueries` on settle (keeps cache in sync with the database).

---

## Component / folder organisation

```
app/
  layout.tsx          Root layout — adds QueryProvider, global CSS
  page.tsx            Server component shell → renders <JobBoard />
  globals.css

components/
  QueryProvider.tsx   "use client" wrapper that instantiates QueryClient
  JobBoard.tsx        Main orchestrator — filters, view toggle, grid/list
  JobCard.tsx         Individual card (grid + list variants)
  JobSheet.tsx        Slide-over panel (right on desktop, bottom sheet on mobile)
  AddJobModal.tsx     Centred modal form for adding a job
  JobFilters.tsx      Title input + company select + clear button + view toggle
  FitBadge.tsx        Small reusable fit-status badge

hooks/
  useJobs.ts          useJobs (query) + useUpdateFitStatus / useUpdateApplyStatus
                      / useAddJob (mutations with optimistic updates)

lib/
  supabase.ts         Typed Supabase client (reads env vars)
  database.types.ts   Hand-written DB types (JobRow / JobInsert / JobUpdate / Database)
  jobs-api.ts         fetchJobs / updateJobState / createJob — called by TanStack Query

types/
  index.ts            Job, FitStatus, ApplyStatus, JobType, JobFilters, ViewMode
```

---

## API design

No Route Handlers are used — all queries go directly from the browser to Supabase via the anon key (which is safe because RLS policies gate what the anon role can do).

Three functions in `lib/jobs-api.ts` form the "logical API":

| Function | Supabase call |
|---|---|
| `fetchJobs()` | `select("*").order("posted_at", desc).order("created_at", desc)` |
| `updateJobState(id, patch)` | `update({ fit_status, apply_status }).eq("id", id)` |
| `createJob(data)` | `insert({...}).select().single()` |

---

## Schema / types

```ts
type FitStatus   = "good" | "bad" | null;
type ApplyStatus = "applied" | "not_applied";
type JobType     = "full-time" | "part-time" | "contract" | "remote";

interface Job {
  id: string;         // uuid from Supabase
  title: string;
  company: string;
  location: string;
  description: string;
  url?: string;
  salary?: string;
  type?: JobType;
  postedAt: string;   // maps to posted_at (date)
  fitStatus: FitStatus;
  applyStatus: ApplyStatus;
  isUserAdded?: boolean;
}
```

`rowToJob()` in `jobs-api.ts` maps snake_case DB columns to the camelCase `Job` type used throughout the UI.

---

## Loading & errors

| Scenario | Handling |
|---|---|
| Initial data load | `isLoading` → centered spinner |
| Fetch error | `isError` → red alert with `error.message` (Supabase surfaces the Postgres error) |
| Empty filter results | Empty state with inbox icon |
| Mutation error | Optimistic patch is rolled back; TanStack Query surfaces the error |
| Form validation | Title + company required; URL must start with `http(s)://`; per-field inline errors |
| Apply on already-applied job | Button disabled + labelled "Already applied" |

---

## RLS note

The policies above grant full access to the `anon` role. In production:

- Add an `owner_id uuid references auth.users` column to `jobs`.
- Restrict insert/update policies to `auth.uid() = owner_id`.
- Keep the select policy open (or restrict to the owner's jobs only).
- Seed jobs would be owned by a service-role import, not an end user.

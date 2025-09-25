Prompt for INITIAL supabase.ts:
"I just installed the supabase package (npm i @supabase/supabase-js) and just created the empty file src/supabase.ts. Walk me through how to code the supabase.ts before we move on."


remember to do wrangler put .dev.vars to deploy

Prompt for INITIAL tools.ts:
I put the env vars in .dev.vars, and I am ready to add a tool to tools.ts. The database doesn't contain any sensitive info so everything can be read. Here is all the information about the database, help me create the tool:






FULL SCHEMA DUMP:
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.campuslocations (
  id integer NOT NULL DEFAULT nextval('campuslocations_id_seq'::regclass),
  course_id integer,
  code text,
  description text,
  CONSTRAINT campuslocations_pkey PRIMARY KEY (id),
  CONSTRAINT campuslocations_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.corecodes (
  id integer NOT NULL DEFAULT nextval('corecodes_id_seq'::regclass),
  course_id integer,
  corecode text,
  corecodedescription text,
  lastupdated bigint,
  offeringunitcode text,
  offeringunitcampus text,
  code text,
  unit text,
  corecourse text,
  subject text,
  CONSTRAINT corecodes_pkey PRIMARY KEY (id),
  CONSTRAINT corecodes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.courses (
  id integer NOT NULL DEFAULT nextval('courses_id_seq'::regclass),
  subject text,
  opensections integer,
  synopsisurl text,
  title text,
  prereqnotes text,
  coursestring text,
  schoolcode text,
  schooldescription text,
  credits integer,
  subjectdescription text,
  expandedtitle text,
  maincampus text,
  subjectnotes text,
  coursenumber text,
  level text,
  campuscode text,
  subjectgroupnotes text,
  offeringunitcode text,
  offeringunittitle text,
  coursedescription text,
  supplementcode text,
  unitnotes text,
  coursenotes text,
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.crosslistedsections (
  id integer NOT NULL DEFAULT nextval('crosslistedsections_id_seq'::regclass),
  section_id integer,
  coursenumber text,
  supplementcode text,
  sectionnumber text,
  offeringunitcampus text,
  primaryregistrationindex text,
  offeringunitcode text,
  registrationindex text,
  subjectcode text,
  CONSTRAINT crosslistedsections_pkey PRIMARY KEY (id),
  CONSTRAINT crosslistedsections_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id)
);
CREATE TABLE public.meetingtimes (
  id integer NOT NULL DEFAULT nextval('meetingtimes_id_seq'::regclass),
  section_id integer,
  campuslocation text,
  roomnumber text,
  campusabbrev text,
  campusname text,
  starttimemilitary text,
  buildingcode text,
  meetingmodedesc text,
  endtimemilitary text,
  meetingmodecode text,
  baclasshours text,
  pmcode text,
  meetingday text,
  starttime text,
  endtime text,
  CONSTRAINT meetingtimes_pkey PRIMARY KEY (id),
  CONSTRAINT meetingtimes_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  graduation_year integer NOT NULL,
  major text NOT NULL,
  minor text,
  interests text NOT NULL,
  professional_aspirations text NOT NULL,
  bio text NOT NULL,
  updated_at timestamp without time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.schedule_sections (
  schedule_id uuid NOT NULL,
  section_id integer NOT NULL,
  CONSTRAINT schedule_sections_pkey PRIMARY KEY (schedule_id, section_id),
  CONSTRAINT schedule_sections_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedules(id)
);
CREATE TABLE public.schedules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  semester text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT schedules_pkey PRIMARY KEY (id),
  CONSTRAINT schedules_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.sectioncampuslocations (
  id integer NOT NULL DEFAULT nextval('sectioncampuslocations_id_seq'::regclass),
  section_id integer,
  code text,
  description text,
  CONSTRAINT sectioncampuslocations_pkey PRIMARY KEY (id),
  CONSTRAINT sectioncampuslocations_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id)
);
CREATE TABLE public.sectioncomments (
  id integer NOT NULL DEFAULT nextval('sectioncomments_id_seq'::regclass),
  section_id integer,
  code text,
  description text,
  CONSTRAINT sectioncomments_pkey PRIMARY KEY (id),
  CONSTRAINT sectioncomments_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id)
);
CREATE TABLE public.sectioninstructors (
  id integer NOT NULL DEFAULT nextval('sectioninstructors_id_seq'::regclass),
  section_id integer,
  name text,
  CONSTRAINT sectioninstructors_pkey PRIMARY KEY (id),
  CONSTRAINT sectioninstructors_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id)
);
CREATE TABLE public.sections (
  id integer NOT NULL DEFAULT nextval('sections_id_seq'::regclass),
  course_id integer,
  sectioneligibility text,
  sessiondateprintindicator text,
  examcode text,
  specialpermissionaddcode text,
  specialpermissiondropcode text,
  crosslistedsectiontype text,
  sectionnotes text,
  number text,
  openstatus boolean,
  openstatustext text,
  indexnumber text,
  coursefeedescr text,
  instructorstext text,
  examcodetext text,
  campuscode text,
  printed text,
  coursefee text,
  commentstext text,
  sectioncoursetype text,
  subtitle text,
  crosslistedsectionstext text,
  legendkey text,
  CONSTRAINT sections_pkey PRIMARY KEY (id),
  CONSTRAINT sections_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

RLS POLICIES:
[
  {
    "schemaname": "public",
    "tablename": "campuslocations",
    "policyname": "Enable read access for all users",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "corecodes",
    "policyname": "Enable read access for all users",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "courses",
    "policyname": "Enable read access for all users",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "crosslistedsections",
    "policyname": "Enable read access for all users",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "meetingtimes",
    "policyname": "Enable read access for all users",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Allow profiles insert access",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = id)"
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Allow profiles read access",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "policyname": "Allow profiles update access",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "(auth.uid() = id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "schedule_sections",
    "policyname": "Users can manage their schedule sections",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(auth.uid() = ( SELECT schedules.user_id\n   FROM schedules\n  WHERE (schedules.id = schedule_sections.schedule_id)))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "schedules",
    "policyname": "Users can manage their own schedules",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "sectioncampuslocations",
    "policyname": "Enable read access for all users",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "sectioncomments",
    "policyname": "Enable read access for all users",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "sectioninstructors",
    "policyname": "Enable read access for all users",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "sections",
    "policyname": "Enable read access for all users",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  }
]

INDEXES:
[
  {
    "table": "campuslocations",
    "index": "campuslocations_pkey",
    "definition": "CREATE UNIQUE INDEX campuslocations_pkey ON public.campuslocations USING btree (id)"
  },
  {
    "table": "corecodes",
    "index": "corecodes_pkey",
    "definition": "CREATE UNIQUE INDEX corecodes_pkey ON public.corecodes USING btree (id)"
  },
  {
    "table": "courses",
    "index": "courses_coursestring_expandedtitle_key",
    "definition": "CREATE UNIQUE INDEX courses_coursestring_expandedtitle_key ON public.courses USING btree (coursestring, expandedtitle)"
  },
  {
    "table": "courses",
    "index": "courses_pkey",
    "definition": "CREATE UNIQUE INDEX courses_pkey ON public.courses USING btree (id)"
  },
  {
    "table": "crosslistedsections",
    "index": "crosslistedsections_pkey",
    "definition": "CREATE UNIQUE INDEX crosslistedsections_pkey ON public.crosslistedsections USING btree (id)"
  },
  {
    "table": "meetingtimes",
    "index": "idx_meetingtimes_day_start_end",
    "definition": "CREATE INDEX idx_meetingtimes_day_start_end ON public.meetingtimes USING btree (meetingday, starttimemilitary, endtimemilitary)"
  },
  {
    "table": "meetingtimes",
    "index": "meetingtimes_pkey",
    "definition": "CREATE UNIQUE INDEX meetingtimes_pkey ON public.meetingtimes USING btree (id)"
  },
  {
    "table": "profiles",
    "index": "profiles_pkey",
    "definition": "CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id)"
  },
  {
    "table": "schedule_sections",
    "index": "schedule_sections_pkey",
    "definition": "CREATE UNIQUE INDEX schedule_sections_pkey ON public.schedule_sections USING btree (schedule_id, section_id)"
  },
  {
    "table": "schedules",
    "index": "schedules_pkey",
    "definition": "CREATE UNIQUE INDEX schedules_pkey ON public.schedules USING btree (id)"
  },
  {
    "table": "sectioncampuslocations",
    "index": "idx_scl_description",
    "definition": "CREATE INDEX idx_scl_description ON public.sectioncampuslocations USING btree (description)"
  },
  {
    "table": "sectioncampuslocations",
    "index": "sectioncampuslocations_pkey",
    "definition": "CREATE UNIQUE INDEX sectioncampuslocations_pkey ON public.sectioncampuslocations USING btree (id)"
  },
  {
    "table": "sectioncomments",
    "index": "sectioncomments_pkey",
    "definition": "CREATE UNIQUE INDEX sectioncomments_pkey ON public.sectioncomments USING btree (id)"
  },
  {
    "table": "sectioninstructors",
    "index": "sectioninstructors_pkey",
    "definition": "CREATE UNIQUE INDEX sectioninstructors_pkey ON public.sectioninstructors USING btree (id)"
  },
  {
    "table": "sections",
    "index": "sections_pkey",
    "definition": "CREATE UNIQUE INDEX sections_pkey ON public.sections USING btree (id)"
  }
]

ROW COUNTS:
[
  {
    "table": "meetingtimes",
    "approx_rows": 17061
  },
  {
    "table": "sectioncampuslocations",
    "approx_rows": 12394
  },
  {
    "table": "sections",
    "approx_rows": 11659
  },
  {
    "table": "sectioninstructors",
    "approx_rows": 8924
  },
  {
    "table": "sectioncomments",
    "approx_rows": 7258
  },
  {
    "table": "campuslocations",
    "approx_rows": 5141
  },
  {
    "table": "courses",
    "approx_rows": 4466
  },
  {
    "table": "corecodes",
    "approx_rows": 1659
  },
  {
    "table": "crosslistedsections",
    "approx_rows": 824
  },
  {
    "table": "audit_log_entries",
    "approx_rows": 471
  },
  {
    "table": "schema_migrations",
    "approx_rows": 64
  },
  {
    "table": "schema_migrations",
    "approx_rows": 63
  },
  {
    "table": "refresh_tokens",
    "approx_rows": 29
  },
  {
    "table": "migrations",
    "approx_rows": 26
  },
  {
    "table": "flow_state",
    "approx_rows": 21
  },
  {
    "table": "sessions",
    "approx_rows": 9
  },
  {
    "table": "mfa_amr_claims",
    "approx_rows": 9
  },
  {
    "table": "identities",
    "approx_rows": 3
  },
  {
    "table": "users",
    "approx_rows": 3
  },
  {
    "table": "profiles",
    "approx_rows": 3
  },
  {
    "table": "schedules",
    "approx_rows": 1
  },
  {
    "table": "schedule_sections",
    "approx_rows": 1
  },
  {
    "table": "mfa_factors",
    "approx_rows": 0
  },
  {
    "table": "mfa_challenges",
    "approx_rows": 0
  },
  {
    "table": "s3_multipart_uploads_parts",
    "approx_rows": 0
  },
  {
    "table": "saml_providers",
    "approx_rows": 0
  },
  {
    "table": "subscription",
    "approx_rows": 0
  },
  {
    "table": "oauth_clients",
    "approx_rows": 0
  },
  {
    "table": "one_time_tokens",
    "approx_rows": 0
  },
  {
    "table": "sso_providers",
    "approx_rows": 0
  },
  {
    "table": "instances",
    "approx_rows": 0
  },
  {
    "table": "sso_domains",
    "approx_rows": 0
  },
  {
    "table": "s3_multipart_uploads",
    "approx_rows": 0
  },
  {
    "table": "objects",
    "approx_rows": 0
  },
  {
    "table": "key",
    "approx_rows": 0
  },
  {
    "table": "buckets",
    "approx_rows": 0
  },
  {
    "table": "messages",
    "approx_rows": 0
  },
  {
    "table": "saml_relay_states",
    "approx_rows": 0
  },
  {
    "table": "secrets",
    "approx_rows": 0
  }
]

Prompt that I use very often to iterate on my own code:
implement the proposed changes. Minimize complexity while retaining all functionality

Prompt I used to add some UI stuff(adjusted it for each button):
"Add a button on the right side of the screen that says "What math courses are offered?" and when clicked, types this into the chat box and enters it."

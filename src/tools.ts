/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";

import type { Chat } from "./server";
import { getCurrentAgent } from "agents";
import { scheduleSchema } from "agents/schedule";

// --- Supabase helpers ---
import {
  getSupabase,
  isTableAllowed,
  getWhitelistedTables
} from "./supabase";

/**
 * Weather information tool that requires human confirmation
 * When invoked, this will present a confirmation dialog to the user
 */
const getWeatherInformation = tool({
  description: "show the weather in a given city to the user",
  inputSchema: z.object({ city: z.string() })
  // Omitting execute function makes this tool require human confirmation
});

/**
 * Local time tool that executes automatically
 * Since it includes an execute function, it will run without user confirmation
 * This is suitable for low-risk operations that don't need oversight
 */
const getLocalTime = tool({
  description: "get the local time for a specified location",
  inputSchema: z.object({ location: z.string() }),
  execute: async ({ location }) => {
    console.log(`Getting local time for ${location}`);
    return "10am";
  }
});

const scheduleTask = tool({
  description: "A tool to schedule a task to be executed at a later time",
  inputSchema: scheduleSchema,
  execute: async ({ when, description }) => {
    // we can now read the agent context from the ALS store
    const { agent } = getCurrentAgent<Chat>();

    function throwError(msg: string): string {
      throw new Error(msg);
    }
    if (when.type === "no-schedule") {
      return "Not a valid schedule input";
    }
    const input =
      when.type === "scheduled"
        ? when.date // scheduled
        : when.type === "delayed"
          ? when.delayInSeconds // delayed
          : when.type === "cron"
            ? when.cron // cron
            : throwError("not a valid schedule input");
    try {
      agent!.schedule(input!, "executeTask", description);
    } catch (error) {
      console.error("error scheduling task", error);
      return `Error scheduling task: ${error}`;
    }
    return `Task scheduled for type "${when.type}" : ${input}`;
  }
});

/**
 * Tool to list all scheduled tasks
 * This executes automatically without requiring human confirmation
 */
const getScheduledTasks = tool({
  description: "List all tasks that have been scheduled",
  inputSchema: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const tasks = agent!.getSchedules();
      if (!tasks || tasks.length === 0) {
        return "No scheduled tasks found.";
      }
      return tasks;
    } catch (error) {
      console.error("Error listing scheduled tasks", error);
      return `Error listing scheduled tasks: ${error}`;
    }
  }
});

/**
 * Tool to cancel a scheduled task by its ID
 * This executes automatically without requiring human confirmation
 */
const cancelScheduledTask = tool({
  description: "Cancel a scheduled task using its ID",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to cancel")
  }),
  execute: async ({ taskId }) => {
    const { agent } = getCurrentAgent<Chat>();
    try {
      await agent!.cancelSchedule(taskId);
      return `Task ${taskId} has been successfully canceled.`;
    } catch (error) {
      console.error("Error canceling scheduled task", error);
      return `Error canceling task ${taskId}: ${error}`;
    }
  }
});



//THIS IS THE NEW FREE TEXT SEARCH COURSES TOOL
const supabaseSearchCourses = tool({
  description:
    "Free-text course search (weighted) using Postgres full-text search. Returns ranked matches from public.courses.",
  inputSchema: z.object({
    q: z.string().min(1).describe("User's search query, e.g. 'data science machine learning'"),
    limit: z.coerce.number().int().min(1).max(50).default(50)
  }),
  execute: async ({ q, limit }) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("search_courses", {
        q,
        limit_count: limit
      });
      if (error) {
        return { error: error.message };
      }
      return data ?? [];
    } catch (err: any) {
      return { error: err?.message ?? "Unknown error calling search_courses" };
    }
  }
});
/* ============================
   Supabase read-only SELECT tool
   ============================ */

// Tables with SELECT allowed to all users per your RLS dump.
// (profiles/schedules/schedule_sections have auth.uid constraints; excluded here)
/*const PUBLIC_SELECT_TABLES = [
  "campuslocations",
  "corecodes",
  "courses",
  "crosslistedsections",
  "meetingtimes",
  "sectioncampuslocations",
  "sectioncomments",
  "sectioninstructors",
  "sections"
] as const;

const FilterOp = z.enum([
  "eq", "neq", "gt", "gte", "lt", "lte",
  "like", "ilike",
  "is",
  "in",
  "contains",
  "containedBy"
]);

const FilterSchema = z.object({
  column: z.string().min(1),
  op: FilterOp,
  value: z.any()
});

const OrderSchema = z.object({
  column: z.string().min(1),
  ascending: z.boolean().default(true),
  nullsFirst: z.boolean().optional()
});

// Build a PostgREST `.or()` disjunction like "col.ilike.%ai%,title.ilike.%ml%"
function buildOrExpression(
  or: Array<{ column: string; op: z.infer<typeof FilterOp>; value: unknown }>
): string {
  return or
    .map(({ column, op, value }) => {
      const encode = (v: unknown) =>
        encodeURIComponent(Array.isArray(v) ? v.join(",") : String(v));
      return `${column}.${op}.${encode(value)}`;
    })
    .join(",");
}*/

/**
 * Read-only SELECT from Supabase (public schema).
 * Supports AND filters, optional OR group, ordering, limit/offset, and optional count.
 */
/*const supabaseSelect = tool({
  description:
    "Read-only select from a Supabase Postgres table (public schema). Supports filters (AND), optional OR group, ordering, and pagination.",
  inputSchema: z.object({
    table: z.enum(PUBLIC_SELECT_TABLES)
      .describe("Public table to query (RLS allows SELECT for everyone)"),
    columns: z
      .string()
      .default("*")
      .describe("Projection (PostgREST select string). e.g. '*', 'id,title', 'sections(id,number)'"),
    filters: z.array(FilterSchema).optional()
      .describe("ANDed filters; each becomes a PostgREST predicate"),
    or: z.array(z.object({ column: z.string(), op: FilterOp, value: z.any() }))
      .optional()
      .describe("Disjunctive predicates; combined into a single PostgREST .or(...)"),
    orderBy: OrderSchema.optional(),
    limit: z.number().int().min(1).max(200).default(50),
    offset: z.number().int().min(0).default(0),
    count: z.enum(["exact", "planned"]).optional()
      .describe("Return row count using PostgREST count modes (may be slower with 'exact').")
  }),
  execute: async ({ table, columns, filters, or, orderBy, limit, offset, count }) => {
    // Optional runtime allow-list via SUPABASE_TABLE_WHITELIST
    if (!isTableAllowed(table)) {
      return {
        error: `Table "${table}" is not allowed by SUPABASE_TABLE_WHITELIST`,
        allowedTables: getWhitelistedTables()
      };
    }

    const supabase = getSupabase();

    // Start query
    let query = supabase
      .from(table)
      .select(columns, { count: count ?? undefined })
      .limit(limit);

    // Offset via range()
    if (offset && offset > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    // AND filters
    if (filters?.length) {
      for (const f of filters) {
        switch (f.op) {
          case "eq":
          case "neq":
          case "gt":
          case "gte":
          case "lt":
          case "lte":
          case "like":
          case "ilike":
          case "is":
            // @ts-expect-error: PostgREST query builder is indexed by op at runtime
            query = query[f.op](f.column, f.value);
            break;
          case "in":
            query = query.in(
              f.column,
              Array.isArray(f.value)
                ? f.value
                : String(f.value).split(",").map((s) => s.trim())
            );
            break;
          case "contains":
            query = query.contains(f.column, f.value);
            break;
          case "containedBy":
            query = query.containedBy(f.column, f.value);
            break;
        }
      }
    }

    // OR group
    if (or?.length) {
      query = query.or(buildOrExpression(or));
    }

    // Ordering
    if (orderBy) {
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending,
        nullsFirst: orderBy.nullsFirst
      });
    }

    const { data, error, count: total } = await query;

    if (error) {
      // Return readable error (avoid logging raw data)
      return { error: error.message };
    }

    return { data: data ?? [], count: total ?? undefined };
  }
});*/

/**
 * Optional: simple schema helper so the model knows columns & relations.
 */
const supabaseDescribeSchema = tool({
  description:
    "Describe public, read-allowed tables and commonly-used columns. Helps form valid queries and select embeddings.",
  inputSchema: z.object({}),
  execute: async () => {
    return {
      tables: {
        campuslocations: ["id", "course_id", "code", "description"],
        corecodes: [
          "id",
          "course_id",
          "corecode",
          "corecodedescription",
          "lastupdated",
          "offeringunitcode",
          "offeringunitcampus",
          "code",
          "unit",
          "corecourse",
          "subject"
        ],
        courses: [
          "id",
          "subject",
          "coursenumber",
          "title",
          "expandedtitle",
          "credits",
          "coursestring",
          "schoolcode",
          "schooldescription",
          "subjectdescription",
          "maincampus"
        ],
        crosslistedsections: [
          "id",
          "section_id",
          "subjectcode",
          "coursenumber",
          "sectionnumber",
          "primaryregistrationindex",
          "registrationindex",
          "offeringunitcode",
          "offeringunitcampus",
          "supplementcode"
        ],
        meetingtimes: [
          "id",
          "section_id",
          "meetingday",
          "starttimemilitary",
          "endtimemilitary",
          "starttime",
          "endtime",
          "buildingcode",
          "roomnumber",
          "campusname",
          "campuslocation",
          "meetingmodecode",
          "meetingmodedesc"
        ],
        sectioncampuslocations: ["id", "section_id", "code", "description"],
        sectioncomments: ["id", "section_id", "code", "description"],
        sectioninstructors: ["id", "section_id", "name"],
        sections: [
          "id",
          "course_id",
          "number",
          "openstatus",
          "openstatustext",
          "indexnumber",
          "subtitle",
          "campuscode",
          "sectionnotes",
          "instructorstext"
        ]
      },
      relations: [
        "courses.id = sections.course_id",
        "sections.id = meetingtimes.section_id",
        "sections.id = sectioninstructors.section_id",
        "sections.id = sectioncomments.section_id",
        "sections.id = crosslistedsections.section_id",
        "sections.id = sectioncampuslocations.section_id"
      ],
      note:
        "Use PostgREST select embedding, e.g. table='courses', columns='id,title,sections(id,number,openstatus)'."
    };
  }
});

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  //getWeatherInformation,
  //getLocalTime,
  //scheduleTask,
  //getScheduledTasks,
  //cancelScheduledTask,
  //supabaseSelect,
  supabaseSearchCourses,
  supabaseDescribeSchema
} satisfies ToolSet;

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  getWeatherInformation: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`);
    return `The weather in ${city} is sunny`;
  }
};

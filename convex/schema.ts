import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";
import { v } from "convex/values";
import { vPermission, vRole } from "./permissions";

// Example: 7 day soft deletion period for teams
const TEAM_DELETION_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

const schema = defineEntSchema(
  {
    teams: defineEnt({
      name: v.string(),
      isPersonal: v.boolean(),
    })
      .field("slug", v.string(), { unique: true })
      .edges("messages", { ref: true })
      .edges("members", { ref: true })
      .edges("invites", { ref: true })
      .deletion("scheduled", { delayMs: TEAM_DELETION_DELAY_MS }),

    users: defineEnt({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      fullName: v.string(),
      pictureUrl: v.optional(v.string()),
    })
      .field("email", v.string(), { unique: true })
      .field("tokenIdentifier", v.string(), { unique: true })
      .edges("members", { ref: true, deletion: "soft" })
      .edges("school_members", { ref: true, deletion: "soft" })
      .deletion("soft"),

    members: defineEnt({
      searchable: v.string(),
    })
      .edge("team")
      .edge("user")
      .edge("role")
      .index("teamUser", ["teamId", "userId"])
      .searchIndex("searchable", {
        searchField: "searchable",
        filterFields: ["teamId"],
      })
      .edges("messages", { ref: true })
      .deletion("soft"),

    invites: defineEnt({
      inviterEmail: v.string(),
    })
      .field("email", v.string(), { unique: true })
      .edge("team")
      .edge("role"),

    roles: defineEnt({
      isDefault: v.boolean(),
    })
      .field("name", vRole, { unique: true })
      .edges("permissions")
      .edges("members", { ref: true })
      .edges("invites", { ref: true })
      .edges("school_members", { ref: true, deletion: "soft" }),

    permissions: defineEnt({})
      .field("name", vPermission, { unique: true })
      .edges("roles"),

    messages: defineEnt({
      text: v.string(),
    })
      .edge("team")
      .edge("member"),
    as: defineEnt({ ["b"]: v.any() }).index("b", ["b"]),

    cycles: defineEnt({
      description: v.string(),
    })
      .field("name", v.string(), { unique: true })
      .edges("grades", { ref: true }),

    states: defineEnt({
      name: v.string(),
    }),

    grades: defineEnt({
      cycleId: v.id('cycles'),
      description: v.string(),
    })
      .field('name', v.string(), { unique: true })
      .edge('cycle'),

    schools: defineEnt({
      stateId: v.optional(v.id('states')),
      cycleId: v.id("cycles"),
      isTechnicalEducation: v.optional(v.boolean()),
      name: v.string(),
      code: v.string(),
      address: v.optional(v.string()),
      phone: v.string(),
      email: v.string(),
      imageUrl: v.optional(v.string()),
    })
      .edges('school_members', { ref: true })
      .edges('classes', { ref: true }),

    school_members: defineEnt({})
      .edge('school')
      .edge('user')
      .edge('role')
      .deletion('soft'),

      classes: defineEnt({
        schoolId: v.id('schools'),
        gradeId: v.id('grades'),
        // TODO: mainTeacherId: V.optional(v.id('teachers')),
      })
        .field('name', v.string(), { unique: true })
        .field('isActive', v.boolean(), { default: false })
        .edge('school'),
      
        schoolYears: defineEnt({
          startDate: v.number(),
          endDate: v.number(),
        })
          .field("academicYearName", v.string(), { unique: true })
          .field("startYear", v.number(), { index: true })
          .field("endYear", v.number(), { index: true })
          .field("semesterCount", v.number(), { default: 3 })
          .field("isCurrent", v.boolean(), { default: false })
          .index('isCurrent', ['isCurrent'])
          .index("byUniqueSchoolYear", ["startYear", "endYear"]),
  },
  { schemaValidation: true },
);

export default schema;

export const entDefinitions = getEntDefinitions(schema);

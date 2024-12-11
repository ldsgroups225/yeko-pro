import { query } from "./functions";
import { v } from "convex/values";

export const getClasses = query({
  args: {
    schoolId: v.optional(v.id("schools")),
  },
  handler: async (ctx, args) => {
    // Check if user exits first
    if (ctx.viewer === null) {
      return null;
    }

    // ======SCHEMA ======
    // users: defineEnt({
    //   firstName: v.optional(v.string()),
    //   lastName: v.optional(v.string()),
    //   fullName: v.string(),
    //   pictureUrl: v.optional(v.string()),
    // })
    //   .field("email", v.string(), { unique: true })
    //   .field("tokenIdentifier", v.string(), { unique: true })
    //   .edges("members", { ref: true, deletion: "soft" })
    //   .edges("school_members", { ref: true, deletion: "soft" })
    //   .deletion("soft"),

    // roles: defineEnt({
    //   isDefault: v.boolean(),
    // })
    //   .field("name", vRole, { unique: true })
    //   .edges("permissions")
    //   .edges("members", { ref: true })
    //   .edges("invites", { ref: true })
    //   .edges("school_members", { ref: true, deletion: "soft" }),

    // schools: defineEnt({
    //   stateId: v.optional(v.id('states')),
    //   cycleId: v.id("cycles"),
    //   isTechnicalEducation: v.optional(v.boolean()),
    //   name: v.string(),
    //   code: v.string(),
    //   address: v.optional(v.string()),
    //   phone: v.string(),
    //   email: v.string(),
    //   imageUrl: v.optional(v.string()),
    // })
    //   .edges('school_members', { ref: true }),

    // school_members: defineEnt({})
    //   .edge('school')
    //   .edge('user')
    //   .edge('role')
    //   .deletion('soft'),
    // ===================

    const schoolMembers = await ctx.viewer.edge("school_members");

    const schools = await Promise.all(
      schoolMembers.map(async (schoolMember) => {
        const role = await schoolMember.edge("role");
        const school = await schoolMember.edge("school");

        if (args.schoolId && school._id !== args.schoolId) {
          return null
        }
        
        return { school, role: role.name };
      })
    );

    const filteredSchools = schools.filter((item) => item !== null) as {
      school: any;
      role: string;
    }[];

    let adminSchool = filteredSchools.find(
      (item) => item.role === "Admin"
    )?.school;
    let directorSchool = filteredSchools.find(
      (item) => item.role === "Director"
    )?.school;

    return adminSchool || directorSchool || null;
  }
})

import { query } from "./functions";
import { v } from "convex/values";

/**
 * Retrieves the school associated with the currently logged-in staff member.
 *
 * This query fetches the school based on the user's `school_members` edge in Convex.
 * It prioritizes schools where the user has an "Admin" role, followed by "Director" roles.
 *
 * @param {object} args - The arguments for the query.
 * @param {v.Id<"schools"> | undefined} args.schoolId - (Optional) A specific school ID to filter by.
 *   If provided, the query will only return the school if the user is a member of that specific school.
 *
 * @returns {Promise<{ school: Document<"schools"> | null, userId: string | null }>}
 *   An object containing the school data and the user's ID, or null if no school is found or the user is not logged in.
 *   - `school`: The school document from the "schools" table if found, otherwise null.
 *   - `userId`: The ID of the currently logged-in user if a school is found, otherwise null.
 *
 * @remarks
 * - This query does not use the `useSchool` hook directly. It fetches the necessary data from Convex
 *   and returns it to the client. The client-side code is then responsible for hydrating the Jotai
 *   atoms using the `useSchool` hook.
 * - The query assumes that the `ctx.viewer` object is available and represents the currently logged-in user.
 * - The `school_members` edge is expected to connect users to schools and have a related `role` edge
 *   that defines the user's role within the school.
 */
export const getStaffSchool = query({
  args: {
    schoolId: v.optional(v.id("schools")),
  },
  handler: async (ctx, args) => {
    if (ctx.viewer === null) {
      return null;
    }

    const schoolMembers = await ctx.viewer.edge("school_members");

    const schools = await Promise.all(
      schoolMembers.map(async (schoolMember) => {
        const role = await schoolMember.edge("role");
        const school = await schoolMember.edge("school");

        if (args.schoolId && school._id !== args.schoolId) {
          return null;
        }

        return { school, role: role.name };
      }),
    );

    let adminSchool = schools.find(
      (item) => item?.role === "Admin",
    )?.school;
    let directorSchool = schools.find(
      (item) => item?.role === "Director",
    )?.school;

    return adminSchool || directorSchool || null;
  },
});

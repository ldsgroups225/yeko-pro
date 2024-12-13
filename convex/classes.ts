import { query } from "./functions";
import { v } from "convex/values";

export const getClasses = query({
  args: {
    schoolId: v.optional(v.id("schools")),
    gradeId: v.optional(v.id("grades")),
    isActive: v.optional(v.boolean()),
    hasMainTeacher: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (ctx.viewer === null) {
      return null;
    }

    if (args.schoolId === undefined) return [];
    
    const allClassesOfSchool = await ctx.table('classes', 'schoolId', (schoolQs) => schoolQs.eq('schoolId', args.schoolId!));

    const filteredClasses = allClassesOfSchool.filter((cls) =>
      args.gradeId === undefined || cls.gradeId === args.gradeId &&
      (args.isActive === undefined || cls.isActive === args.isActive)
      // TODO: uncomment the following line to implement hasMainTeacher filter when mainTeacherId will be added to the schema
      // (args.hasMainTeacher === undefined || ((args.hasMainTeacher && cls.mainTeacherId !== null) || (!args.hasMainTeacher && cls.mainTeacherId === null)))
    );

    return filteredClasses;
  },
});

import { query } from "./functions";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getClasses = query({
  args: {
    schoolId: v.optional(v.id("schools")),
    gradeId: v.optional(v.id("grades")),
    isActive: v.optional(v.boolean()),
    hasMainTeacher: v.optional(v.boolean()),
    search: v.string(), // If empty, returns all classes
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // Return an empty PaginationResult if ctx.viewer is null
    if (ctx.viewer === null) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    // Return an empty PaginationResult if schoolId is undefined
    if (args.schoolId === undefined) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    let classesQuery = ctx.table("classes", "schoolId", (q) =>
      q.eq("schoolId", args.schoolId!)
    );

    if (args.gradeId !== undefined) {
      classesQuery = classesQuery.filter((q) =>
        q.eq(q.field("gradeId"), args.gradeId!)
      );
    }

    if (args.isActive !== undefined) {
      classesQuery = classesQuery.filter((q) =>
        q.eq(q.field("isActive"), args.isActive!)
      );
    }

    // TODO: implement search term into class name and main teacher name

    // TODO: uncomment the following line to implement hasMainTeacher filter when mainTeacherId will be added to the schema
    // if (args.hasMainTeacher !== undefined) {
    //   classesQuery = classesQuery.filter((q) =>
    //     args.hasMainTeacher!
    //       ? q.neq(q.field("mainTeacherId"), null)
    //       : q.eq(q.field("mainTeacherId"), null)
    //   );
    // }

    const page = await classesQuery.paginate(args.paginationOpts);

    return page;
  },
});

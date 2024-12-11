import { internalMutation } from "./functions";
import { getPermission } from "./permissions";

export const init = internalMutation({
  args: {},
  handler: async (ctx) => {
    if ((await ctx.table("roles").first()) !== null) {
      throw new Error("There's an existing roles setup already.");
    }
    await ctx
      .table('states')
      .insertMany([
        { name: "Active" },
        { name: "Checking" },
        { name: "Suspended" },
        { name: "Deleted" },
      ])

      await ctx
      .table('cycles')
      .insertMany([
        { name: "Primary", description: "Primary cycle" },
        { name: "Secondary", description: "Secondary cycle" },
      ])

    await ctx
      .table("permissions")
      .insertMany([
        { name: "Manage Team" },
        { name: "Delete Team" },
        { name: "Manage Members" },
        { name: "Read Members" },
        { name: "Contribute" },
      ]);

    await ctx.table("roles").insert({
      name: "Parent",
      isDefault: true,
      permissions: [],
    });
    await ctx.table("roles").insert({
      name: "Teacher",
      isDefault: false,
      permissions: [],
    });
    await ctx.table("roles").insert({
      name: "Director",
      isDefault: false,
      permissions: [],
    });
    await ctx.table("roles").insert({
      name: "Admin",
      isDefault: false,
      permissions: [],
    });
  },
});

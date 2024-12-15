import { v } from 'convex/values'
import { query } from './functions'

export const getGrades = query({
  args: {
    cycleId: v.optional(v.id('cycles')),
  },
  handler: async (ctx, args) => {
    if (ctx.viewer === null) {
      return null
    }

    if (args.cycleId === undefined)
      return []

    return ctx.table('grades', 'cycleId', cycleQs => cycleQs.eq('cycleId', args.cycleId!))
  },
})

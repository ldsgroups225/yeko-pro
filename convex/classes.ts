import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'
import { mutation, query } from './functions'
import { normalizeStringForSearch } from './utils'

export const getClasses = query({
  args: {
    paginationOpts: paginationOptsValidator,
    schoolId: v.optional(v.id('schools')),
    gradeId: v.optional(v.id('grades')),
    isActive: v.optional(v.boolean()),
    hasMainTeacher: v.optional(v.boolean()),
    search: v.string(), // If empty, returns all classes
  },
  handler: async (ctx, args) => {
    // Return an empty PaginationResult if ctx.viewer is null
    if (ctx.viewer === null) {
      return {
        page: [],
        isDone: true,
        continueCursor: '',
      }
    }

    // Return an empty PaginationResult if schoolId is undefined
    if (args.schoolId === undefined) {
      return {
        page: [],
        isDone: true,
        continueCursor: '',
      }
    }

    let classesQuery

    if (args.search !== undefined && args.search !== '') {
      classesQuery = ctx.table('classes').search(
        'searchable',
        q => q.search('name', normalizeStringForSearch(args.search)),
      )
    }
    else {
      classesQuery = ctx.table('classes', 'schoolId', q =>
        q.eq('schoolId', args.schoolId!))
    }

    if (args.gradeId !== undefined) {
      classesQuery = classesQuery.filter(q =>
        q.eq(q.field('gradeId'), args.gradeId!),
      )
    }

    if (args.isActive !== undefined) {
      classesQuery = classesQuery.filter(q =>
        q.eq(q.field('isActive'), args.isActive!),
      )
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

    const page = await classesQuery.paginate(args.paginationOpts)

    return page
  },
})

export const createClass = mutation({
  args: {
    name: v.string(),
    schoolId: v.id('schools'),
    gradeId: v.id('grades'),
  },
  handler: async (ctx, args) => {
    const newClassId = await ctx.table('classes')
      .insert({
        name: args.name,
        schoolId: args.schoolId,
        gradeId: args.gradeId,
        isActive: false,
      })

    return newClassId
  },
})

export const updateClass = mutation({
  args: {
    classId: v.id('classes'),
    name: v.string(),
    gradeId: v.id('grades'),
    // mainTeacherId: v.optional(v.id('teachers')),
  },
  handler: async (ctx, { classId, name, gradeId }) => {
    const oldClass = await ctx.table('classes').getX(classId)
    return oldClass.patch({
      name,
      gradeId,
      // mainTeacherId,
    })
  },
})

import type { MutationCtx } from './types'
import { internalMutation } from './functions'

/**
 * Initializes the database with default data, including states, cycles, permissions, roles, the current school year, and grades.
 *
 * This mutation should only be run once during the initial setup of the application. It checks if roles already exist
 * and throws an error if they do, preventing duplicate data insertion.
 *
 * @throws {Error} Throws an error if roles have already been initialized.
 */
export const init = internalMutation({
  args: {},
  handler: async (ctx) => {
    /**
     * Hard reset the database
     */
    await deleteAllData(ctx)

    // Check for existing roles to prevent re-initialization
    if ((await ctx.table('roles').first()) !== null) {
      throw new Error('Roles have already been initialized. This setup should only be run once.')
    }

    // --- Data Initialization ---

    /**
     * Inserts default states into the 'states' table.
     */
    await insertDefaultStates(ctx)

    /**
     * Inserts default cycles into the 'cycles' table.
     */
    await insertDefaultCycles(ctx)

    /**
     * Inserts default permissions into the 'permissions' table.
     */
    await insertDefaultPermissions(ctx)

    /**
     * Inserts default roles into the 'roles' table.
     */
    await insertDefaultRoles(ctx)

    /**
     * Calculates and inserts the current school year into the 'schoolYears' table.
     */
    await insertCurrentSchoolYear(ctx)

    /**
     * Inserts default grades into the 'grades' table, associating them with the correct cycles.
     */
    await insertDefaultGrades(ctx)
  },
})

// --- Helper Functions ---

/**
 * Deletes all data from the database.
 * @param {any} ctx - The mutation context.
 */
async function deleteAllData(ctx: MutationCtx) {
  const classesIds = await ctx.table('classes').map(class_ => class_._id)
  classesIds.forEach(async (classId) => {
    await ctx.table('classes').getX(classId).delete()
  })

  const statesIds = await ctx.table('states').map(state => state._id)
  statesIds.forEach(async (stateId) => {
    await ctx.table('states').getX(stateId).delete()
  })

  const cyclesIds = await ctx.table('cycles').map(cycle => cycle._id)
  cyclesIds.forEach(async (cycleId) => {
    await ctx.table('cycles').getX(cycleId).delete()
  })

  const permissionsIds = await ctx.table('permissions').map(permission => permission._id)
  permissionsIds.forEach(async (permissionId) => {
    await ctx.table('permissions').getX(permissionId).delete()
  })

  const rolesIds = await ctx.table('roles').map(role => role._id)
  rolesIds.forEach(async (roleId) => {
    await ctx.table('roles').getX(roleId).delete()
  })

  const schoolYearsIds = await ctx.table('schoolYears').map(schoolYear => schoolYear._id)
  schoolYearsIds.forEach(async (schoolYearId) => {
    await ctx.table('schoolYears').getX(schoolYearId).delete()
  })

  const gradesIds = await ctx.table('grades').map(grade => grade._id)
  gradesIds.forEach(async (gradeId) => {
    await ctx.table('grades').getX(gradeId).delete()
  })
}

/**
 * Inserts default states into the 'states' table.
 * @param {any} ctx - The mutation context.
 */
async function insertDefaultStates(ctx: MutationCtx) {
  await ctx.table('states').insertMany([
    { name: 'Active' },
    { name: 'Checking' },
    { name: 'Suspended' },
    { name: 'Deleted' },
  ])
}

/**
 * Inserts default cycles into the 'cycles' table.
 * @param {any} ctx - The mutation context.
 */
async function insertDefaultCycles(ctx: MutationCtx) {
  await ctx.table('cycles').insertMany([
    { name: 'Primary', description: 'Primary cycle (CP1, CP2, CE1, CE2, CM1, CM2)' },
    { name: 'Secondary', description: 'Secondary cycle (6ème, 5ème, 4ème, 3ème, Seconde, Première, Terminale)' },
  ])
}

/**
 * Inserts default permissions into the 'permissions' table.
 * @param {any} ctx - The mutation context.
 */
async function insertDefaultPermissions(ctx: MutationCtx) {
  await ctx.table('permissions').insertMany([
    { name: 'Manage Team' },
    { name: 'Delete Team' },
    { name: 'Manage Members' },
    { name: 'Read Members' },
    { name: 'Contribute' },
  ])
}

/**
 * Inserts default roles into the 'roles' table.
 * @param {any} ctx - The mutation context.
 */
async function insertDefaultRoles(ctx: MutationCtx) {
  await ctx.table('roles').insert({ name: 'Parent', isDefault: true, permissions: [] })
  await ctx.table('roles').insert({ name: 'Teacher', isDefault: false, permissions: [] })
  await ctx.table('roles').insert({ name: 'Director', isDefault: false, permissions: [] })
  await ctx.table('roles').insert({ name: 'Admin', isDefault: false, permissions: [] })
}

/**
 * Calculates the details of the current school year.
 * @returns {object} An object containing the school year details.
 */
function calculateSchoolYearDetails() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // (0-indexed, so +1)
  const currentYear = now.getFullYear()

  // School year typically starts in September (9) and ends in June (6) in the next year.
  // If the current month is between June and December, it's the start of the school year.
  const isSchoolYearStart = currentMonth >= 6 && currentMonth <= 12

  const startYear = isSchoolYearStart ? currentYear : currentYear - 1
  const endYear = isSchoolYearStart ? currentYear + 1 : currentYear

  return {
    startYear,
    endYear,
    academicYearName: `${startYear}-${endYear}`,
    semesterCount: 3,
    isCurrent: true,
    startDate: new Date(`${startYear}-09-01`).getTime(), // Start of September
    endDate: new Date(`${endYear}-06-15`).getTime(), // Middle of June
  }
}

/**
 * Inserts the current school year into the 'schoolYears' table.
 * @param {any} ctx - The mutation context.
 */
async function insertCurrentSchoolYear(ctx: MutationCtx) {
  await ctx.table('schoolYears').insert(calculateSchoolYearDetails())
}

/**
 * Retrieves all cycles from the 'cycles' table.
 * @param {any} ctx - The mutation context.
 * @returns {Promise<any[]>} A promise that resolves to an array of cycle objects.
 */
async function getCycles(ctx: MutationCtx): Promise<any[]> {
  return ctx.table('cycles')
}

/**
 * Inserts default grades into the 'grades' table, associating them with the correct cycles.
 * @param {any} ctx - The mutation context.
 */
async function insertDefaultGrades(ctx: MutationCtx) {
  const cycles = await getCycles(ctx)

  await ctx.table('grades').insertMany([
    { name: 'CP1', description: 'Cours préparatoire 1', cycleId: cycles.find(cycle => cycle.name === 'Primary')!._id },
    { name: 'CP2', description: 'Cours préparatoire 2', cycleId: cycles.find(cycle => cycle.name === 'Primary')!._id },
    { name: 'CE1', description: 'Cours élémentaire 1', cycleId: cycles.find(cycle => cycle.name === 'Primary')!._id },
    { name: 'CE2', description: 'Cours élémentaire 2', cycleId: cycles.find(cycle => cycle.name === 'Primary')!._id },
    { name: 'CM1', description: 'Cours moyen 1', cycleId: cycles.find(cycle => cycle.name === 'Primary')!._id },
    { name: 'CM2', description: 'Cours moyen 2', cycleId: cycles.find(cycle => cycle.name === 'Primary')!._id },
    { name: '6ème', description: 'Niveau 6ème', cycleId: cycles.find(cycle => cycle.name === 'Secondary')!._id },
    { name: '5ème', description: 'Niveau 5ème', cycleId: cycles.find(cycle => cycle.name === 'Secondary')!._id },
    { name: '4ème', description: 'Niveau 4ème', cycleId: cycles.find(cycle => cycle.name === 'Secondary')!._id },
    { name: '3ème', description: 'Niveau 3ème', cycleId: cycles.find(cycle => cycle.name === 'Secondary')!._id },
    { name: 'Seconde', description: 'Niveau Seconde', cycleId: cycles.find(cycle => cycle.name === 'Secondary')!._id },
    { name: 'Première', description: 'Niveau Première', cycleId: cycles.find(cycle => cycle.name === 'Secondary')!._id },
    { name: 'Terminale', description: 'Niveau Terminale', cycleId: cycles.find(cycle => cycle.name === 'Secondary')!._id },
  ])
}

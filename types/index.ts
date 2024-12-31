/**
 * Enumeration representing different roles in the system.
 * @enum {number}
 */
export enum ERole {
  /** Represents a parent role */
  PARENT = 1,
  /** Represents a teacher role */
  TEACHER = 2,
  /** Represents a director role */
  DIRECTOR = 3,
}

/**
 * Converts an ERole enum value to its string representation.
 *
 * @param {ERole} role - The role enum value to convert.
 * @returns {string} The string representation of the role.
 * @throws {Error} If an invalid role is provided.
 *
 * @example
 * const roleString = roleToString(ERole.PARENT);
 * console.log(roleString); // Output: 'Parent'
 */
export function roleToString(role: ERole): string {
  const roleMap: { [key in ERole]: string } = {
    [ERole.PARENT]: 'Parent',
    [ERole.TEACHER]: 'Teacher',
    [ERole.DIRECTOR]: 'Director',
  }

  const result = roleMap[role]
  if (!result) {
    throw new Error(`Invalid role: ${role}`)
  }
  return result
}

/**
 * Converts a string representation of a role to its corresponding ERole enum value.
 *
 * @param {string} roleString - The string representation of the role.
 * @returns {ERole | undefined} The corresponding ERole enum value, or undefined if no match is found.
 *
 * @example
 * const role = stringToRole('Teacher');
 * if (role !== undefined) {
 *   console.log(role); // Output: 2 (ERole.TEACHER)
 * } else {
 *   console.log('Invalid role string');
 * }
 */
export function stringToRole(roleString: string): ERole | undefined {
  const stringRoleMap: { [key: string]: ERole } = {
    Parent: ERole.PARENT,
    Teacher: ERole.TEACHER,
    Director: ERole.DIRECTOR,
  }

  return stringRoleMap[roleString]
}

export interface ISchoolDTO {
  id: string
  name: string
  code: string
  cycleId: string
  imageUrl: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  classCount?: number
  studentCount?: number
}

export interface IUserProfileDTO {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  fullName?: string
  phoneNumber?: string
  school: ISchoolDTO
}

export
interface IStudentDTO {
  id: string
  firstName: string
  lastName: string
  schoolId?: string | null
  idNumber: string
  gender: string
  dateOfBirth: string

  classroom?: {
    id: string
    name: string
  }

  parent?: {
    id: string
    fullName: string
    phoneNumber: string
    email: string
  }

  classId?: string | null
  parentId?: string

  createdAt?: string
  createdBy?: string | null
  updatedAt?: string
  updatedBy?: string | null
}

export interface ISchoolYear {
  id: number
  name: string | null
}

export interface IStudentFiltersDTO {
  name?: string
  idNumber?: string
  classId?: string
  schoolId?: string
  ageMin?: number
  ageMax?: number
}

export interface StaffMemberDTO {
  id: string
  name: string
  email: string
  role: string
}

export interface IGrade {
  id: number
  name: string
}

export interface IClass {
  id: string
  name: string
  slug: string
  gradeId: number
  isActive: boolean
  teacher: {
    id: string
    fullName: string
  } | null
  studentCount: number
}

export interface IClassDetailsStats {
  totalStudents: number
  lateRate: number
  absentRate: number
  averageGrade: number
}

export interface ClassDetailsStudent {
  id: string
  firstName: string
  lastName: string
  idNumber: string
  gradeAverage: number
  lateCount: number
  absentCount: number
}

export interface IStudentsQueryParams {
  schoolId?: string
  page?: number
  limit?: number
  searchTerm?: string
  isStudent?: boolean
  isTeacher?: boolean
  isAdmin?: boolean
  selectedClasses?: string[]
  sort?: { column: string, direction: 'asc' | 'desc' }
  hasNotParentFilter?: boolean
  hasNotClassFilter?: boolean
}

export interface IClassesGrouped {
  id: string
  name: string
  count: number
  subclasses: {
    slug: string
    name: string
  }[]
}

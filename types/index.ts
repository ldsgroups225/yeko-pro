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
  /** Represents a school life supervisor/educator role */
  EDUCATOR = 4,
  /** Represents an accountant role */
  ACCOUNTANT = 5,
  /** Represents a headmaster/principal role */
  HEADMASTER = 6,
  /** Represents a cashier role */
  CASHIER = 7,
  // /** Represents the super admin role */
  // SUPER_ADMIN = 8,
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
    [ERole.CASHIER]: 'Cashier',
    [ERole.EDUCATOR]: 'Educator',
    [ERole.ACCOUNTANT]: 'Accountant',
    [ERole.HEADMASTER]: 'Headmaster',
    // [ERole.SUPER_ADMIN]: 'Super Admin',
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
    Cashier: ERole.CASHIER,
    Educator: ERole.EDUCATOR,
    Accountant: ERole.ACCOUNTANT,
    Headmaster: ERole.HEADMASTER,
    // 'Super Admin': ERole.SUPER_ADMIN,
  }

  return stringRoleMap[roleString]
}

export interface ISchoolDTO {
  id: string
  name: string
  code: string
  city?: string
  email?: string
  cycleId: string
  imageUrl: string
  phone?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  classCount?: number
  studentCount?: number
  address?: string | null
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

export interface MedicalCondition {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface IStudentDTO {
  id: string
  firstName: string
  lastName: string
  schoolId?: string | null
  idNumber: string
  gender: 'M' | 'F' | null
  dateOfBirth: string | null
  isGouvernentAffected?: boolean
  isOrphan?: boolean
  hasSubscribedTransportationService?: boolean
  hasSubscribedCanteenService?: boolean
  medicalCondition?: MedicalCondition[]
  avatarUrl?: string | null
  address?: string | null

  classroom?: {
    id: string
    name: string
  }

  parent?: {
    id: string
    fullName: string
    phoneNumber: string
    email: string
    avatarUrl?: string | null
  }

  secondParent?: {
    id: string
    fullName: string
    phone: string
    gender: 'M' | 'F'
    type: 'father' | 'mother' | 'guardian'
  }

  classId?: string | null
  parentId?: string
  enrollmentId?: string | null

  createdAt?: string | null
  createdBy?: string | null
  updatedAt?: string | null
  updatedBy?: string | null
}

export interface ISchoolYear {
  id: number
  name: string | null
  isCurrent?: boolean
}

export interface ISemester {
  id: number
  name: string
  isCurrent: boolean
  startDate: string
  endDate: string
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

export interface ISubject {
  id: string
  name: string
}

export interface IClass {
  id: string
  maxStudent: number
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
  averageGrade: number
  absentCount: number
  lateCount: number
  boyCount: number
  girlCount: number
  activeStudents: number
  inactiveStudents: number
  performanceData: {
    month: string
    average: number
    attendance: number
  }[]
  subjectPerformance: {
    subject: string
    average: number
    highest: number
    lowest: number
  }[]
}

export interface ClassDetailsStudent {
  id: string
  rank: string
  status: string
  idNumber: string
  lastName: string
  firstName: string
  gender: 'M' | 'F'
  birthDate: string | null
  avatarUrl: string | null
  address: string | null
  classId: string | null
  className: string | null
  isGouvernentAffected: boolean
  isOrphan: boolean
  hasSubscribedTransportationService: boolean
  hasSubscribedCanteenService: boolean
  lateCount: number
  absentCount: number
  teacherNotes: string
  gradeAverage: number
  lastEvaluation: string
  dateJoined: string | null
  parent?: {
    id: string
    fullName: string
    email: string
    phone: string
    avatarUrl: string | null
  }
}

export interface IStudentsQueryParams {
  page?: number
  limit?: number
  schoolId?: string
  isAdmin?: boolean
  searchTerm?: string
  isStudent?: boolean
  isTeacher?: boolean
  selectedClasses?: string[]
  hasNotClassFilter?: boolean
  hasNotParentFilter?: boolean
  refusedStudentsFilter?: boolean
  sort?: { column: string, direction: 'asc' | 'desc' }
}

export interface IClassesGrouped {
  id: string
  name: string
  count: number
  subclasses: {
    id: string
    slug: string
    name: string
  }[]
}

/**
 * Represents a schedule entry in the calendar
 * @interface IScheduleCalendarDTO
 */
export interface IScheduleCalendarDTO {
  id: string
  classId: string
  classroomName?: string
  subjectId: string
  subjectName: string
  teacherId: string
  teacherName?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room?: string
}

export const courseTypes: Record<string, CourseType> = {
  CM: {
    label: 'Cours Magistral',
    color: 'bg-primary/20 hover:bg-primary/30',
  },
  TD: {
    label: 'Travaux Dirigés',
    color: 'bg-secondary/20 hover:bg-secondary/30',
  },
  TP: {
    label: 'Travaux Pratiques',
    color: 'bg-accent/20 hover:bg-accent/30',
  },
}

export interface Event {
  id: number
  title: string
  professor: string
  room: string
  type: keyof typeof courseTypes
  day: string
  hour: number
  duration: number
}

export interface CourseType {
  label: string
  color: string
}

export interface ITeacherDTO {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  status: 'pending' | 'accepted' | 'rejected'
  assignments?: {
    id: string
    classId: string
    className: string
    subjectId: string
    subjectName: string
    isMainTeacher: boolean
  }[]
}

export interface ITeacherOptions {
  id: string
  name: string
}

export interface ITeacherQueryParams {
  searchTerm?: string
  selectedClasses?: string[]
  selectedSubjects?: string[]
  status?: 'pending' | 'accepted' | 'rejected'
  schoolId?: string
  page?: number
  limit?: number
  sort?: {
    column: string
    direction: 'asc' | 'desc'
  }
}

export interface FilterStudentWhereNotInTheClass {
  idNumber: string
  fullName: string
  currentClass: {
    id: string
    name: string
  } | null
  imageUrl: string | null
}

export interface IPonctualite {
  month: string
  absences: number
  lates: number
}

export interface ICandidature {
  candidateId: string
  time: string
  name: string
  type: 'student' | 'teacher'
  status: string
  grade?: number
}

export interface IGradeNote {
  id: string
  classroom: string
  studentCount: number
  minNote: number
  maxNote: number
  createdAt: string
  teacher: string
  subject: string
  status: string
}

export interface IMetricCardProps {
  title: string
  icon: React.ReactNode
  variant: 'primary' | 'destructive' | 'input' | 'success'
  children: React.ReactNode
}

export interface IDashboardChartProps {
  data: IPonctualite[]
}

export interface IApplicationsProps {
  applications: ICandidature[]
}

export interface IGradesTableProps {
  onPublish?: (id: string) => void
}

export interface ILessonProgressReportConfig {
  id: string
  gradeId: number
  subjectId: string
  schoolYearId: number
  level: string
  subjectName: string
  lesson: string
  lessonOrder: number
  series: string | null
  sessionsCount: number
  createdAt: string
  updatedAt: string
  schoolId?: string
}

export interface ILessonProgressReport {
  id: string
  config: {
    id: string
    level: string
    subjectName: string
    lessonOrder: number
    sessionsCount: number
    lesson: string
  }
  classId: string
  createdAt: string
  isCompleted: boolean
  sessionsCompleted: number
  startedAt: string
  updatedAt: string
  completedAt: string | null
}

// Re-export conduct types
export * from './conduct'

// Conduct-related type definitions based on Côte d'Ivoire Ministry guidelines

export interface IConductIncident {
  id: string
  studentId: string
  categoryId: string
  description: string
  pointsDeducted: number
  reportedBy: string
  reportedAt: string
  schoolYearId: number
  semesterId: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IConductCategory {
  id: string
  name: string
  description: string
  maxPoints: number
  color: string
  icon: string
  isActive: boolean
}

export interface IConductScore {
  id: string
  studentId: string
  schoolYearId: number
  semesterId: number
  attendanceScore: number // 0-6 points
  dresscodeScore: number // 0-3 points
  moralityScore: number // 0-4 points
  disciplineScore: number // 0-7 points
  totalScore: number // 0-20 points
  grade: 'BLAME' | 'MAUVAISE' | 'PASSABLE' | 'BONNE' | 'TRES_BONNE'
  lastUpdated: string
}

export interface IConductStudent {
  id: string
  firstName: string
  lastName: string
  idNumber: string
  avatarUrl?: string
  className: string
  classId: string
  currentScore: IConductScore
  recentIncidents: IConductIncident[]
  attendanceStats: {
    totalSessions: number
    absences: number
    lates: number
    attendanceRate: number
  }
}

export interface IConductQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  classId?: string
  gradeFilter?: 'BLAME' | 'MAUVAISE' | 'PASSABLE' | 'BONNE' | 'TRES_BONNE'
  scoreRange?: { min: number, max: number }
  sort?: { column: string, direction: 'asc' | 'desc' }
}

export interface IConductStats {
  totalStudents: number
  averageScore: number
  excellenceRate: number
  gradeDistribution: {
    BLAME: number
    MAUVAISE: number
    PASSABLE: number
    BONNE: number
    TRES_BONNE: number
  }
  recentIncidents: number
  improvementTrend: number
}

// Ministry-defined conduct categories with point deductions
export const CONDUCT_CATEGORIES: IConductCategory[] = [
  {
    id: 'attendance',
    name: 'Assiduité et ponctualité',
    description: 'Retards et absences injustifiées',
    maxPoints: 6,
    color: 'bg-blue-500',
    icon: 'Clock',
    isActive: true,
  },
  {
    id: 'dresscode',
    name: 'Tenue et présentation',
    description: 'Conformité au règlement vestimentaire',
    maxPoints: 3,
    color: 'bg-green-500',
    icon: 'Shirt',
    isActive: true,
  },
  {
    id: 'morality',
    name: 'Moralité et intégrité',
    description: 'Fraude, tricherie, vol, etc.',
    maxPoints: 4,
    color: 'bg-purple-500',
    icon: 'Heart',
    isActive: true,
  },
  {
    id: 'discipline',
    name: 'Discipline',
    description: 'Respect des règles et du personnel',
    maxPoints: 7,
    color: 'bg-red-500',
    icon: 'Shield',
    isActive: true,
  },
]

// Ministry-defined point deduction rules
export const CONDUCT_DEDUCTIONS = {
  // Attendance (max 6 points)
  UNJUSTIFIED_ABSENCE_HOUR: 0.5, // Per hour of unjustified absence
  UNJUSTIFIED_ABSENCE_10H: 1, // After 10 hours of unjustified absence
  LATE_ARRIVAL: 0.5, // Per late arrival after warning

  // Dress code (max 3 points)
  DRESS_CODE_VIOLATION: 0.5, // Per dress code violation
  REPEATED_DRESS_VIOLATION: 1, // After multiple warnings

  // Morality (max 4 points)
  FRAUD_ATTEMPT: 1, // Attempted fraud/cheating
  CONFIRMED_FRAUD: 1, // Confirmed fraud (systematic deduction)
  THEFT: 1, // Theft or extortion
  ALCOHOL_TOBACCO: 1, // Alcohol/tobacco consumption

  // Discipline (max 7 points)
  DISRESPECT_STAFF: 1, // Disrespect to staff
  CLASSROOM_DISRUPTION: 0.5, // Disrupting class
  UNAUTHORIZED_ABSENCE: 1, // Leaving without permission
  VIOLENCE: 2, // Physical violence
  PROPERTY_DAMAGE: 1, // Damaging school property
  ACADEMIC_MATERIAL_MISUSE: 1, // Misusing academic materials
}

export function calculateConductGrade(totalScore: number): IConductScore['grade'] {
  if (totalScore <= 5)
    return 'BLAME'
  if (totalScore < 10)
    return 'MAUVAISE'
  if (totalScore <= 12)
    return 'PASSABLE'
  if (totalScore <= 15)
    return 'BONNE'
  return 'TRES_BONNE'
}

export function getConductGradeColor(grade: IConductScore['grade']): string {
  const colors = {
    BLAME: 'text-red-600 bg-red-50',
    MAUVAISE: 'text-orange-600 bg-orange-50',
    PASSABLE: 'text-yellow-600 bg-yellow-50',
    BONNE: 'text-blue-600 bg-blue-50',
    TRES_BONNE: 'text-green-600 bg-green-50',
  }
  return colors[grade]
}

export function getConductGradeLabel(grade: IConductScore['grade']): string {
  const labels = {
    BLAME: 'Blâme',
    MAUVAISE: 'Mauvaise conduite',
    PASSABLE: 'Conduite passable',
    BONNE: 'Bonne conduite',
    TRES_BONNE: 'Très bonne conduite',
  }
  return labels[grade]
}

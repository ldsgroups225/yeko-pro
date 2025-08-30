// app/educator/types/conduct.ts

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
    color: 'bg-emerald-500',
    icon: 'Shirt',
    isActive: true,
  },
  {
    id: 'morality',
    name: 'Moralité et honnêteté',
    description: 'Comportement éthique et honnêteté',
    maxPoints: 4,
    color: 'bg-purple-500',
    icon: 'Heart',
    isActive: true,
  },
  {
    id: 'discipline',
    name: 'Discipline et respect',
    description: 'Respect des règles et du personnel',
    maxPoints: 7,
    color: 'bg-red-500',
    icon: 'Shield',
    isActive: true,
  },
]

// Point deduction constants based on ministry guidelines
export const CONDUCT_DEDUCTIONS = {
  LATE_ARRIVAL: 0.5, // Removed per ministry update
  UNJUSTIFIED_ABSENCE_HOUR: 1,
  DRESS_CODE_VIOLATION: 0.5,
  FRAUD_ATTEMPT: 2,
  CONFIRMED_FRAUD: 4,
  THEFT: 3,
  DISRESPECT_STAFF: 1,
  CLASSROOM_DISRUPTION: 0.5,
  VIOLENCE: 3,
  PROPERTY_DAMAGE: 2,
} as const

// Utility functions for conduct grades
export function calculateConductGrade(totalScore: number): IConductScore['grade'] {
  if (totalScore >= 18)
    return 'TRES_BONNE'
  if (totalScore >= 14)
    return 'BONNE'
  if (totalScore >= 10)
    return 'PASSABLE'
  if (totalScore >= 6)
    return 'MAUVAISE'
  return 'BLAME'
}

export function getConductGradeLabel(grade: IConductScore['grade']): string {
  const labels = {
    TRES_BONNE: 'Très bonne conduite',
    BONNE: 'Bonne conduite',
    PASSABLE: 'Conduite passable',
    MAUVAISE: 'Mauvaise conduite',
    BLAME: 'Blâme',
  }
  return labels[grade]
}

export function getConductGradeColor(grade: IConductScore['grade']): string {
  const colors = {
    TRES_BONNE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    BONNE: 'bg-blue-100 text-blue-800 border-blue-200',
    PASSABLE: 'bg-amber-100 text-amber-800 border-amber-200',
    MAUVAISE: 'bg-orange-100 text-orange-800 border-orange-200',
    BLAME: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[grade]
}

export function getConductGradeDescription(grade: IConductScore['grade']): string {
  const descriptions = {
    TRES_BONNE: 'Excellente conduite, modèle pour les autres élèves',
    BONNE: 'Bonne conduite générale, respect des règles',
    PASSABLE: 'Conduite acceptable avec quelques améliorations possibles',
    MAUVAISE: 'Conduite problématique nécessitant une attention particulière',
    BLAME: 'Conduite très problématique, mesures disciplinaires requises',
  }
  return descriptions[grade]
}

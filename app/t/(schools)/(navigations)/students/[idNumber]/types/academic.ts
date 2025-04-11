export interface AcademicStats {
  semesters: Array<{
    id: string | number
    name: string
    average: number | null
    isComplete: boolean
    startDate: string
    endDate: string
    rank?: {
      position: number
      total: number
    }
  }>
  subjects: Array<{
    id: string
    name: string
    grade: number | null
    coefficient: number
  }>
  observations: Array<{
    id: string
    content: string
    date: string
    teacher: {
      name: string
      isMainTeacher: boolean
    }
  }>
}

export interface Term {
  id: string
  name: string
  average: number
  maxScore: number
  progress: number
  rank?: {
    position: number
    total: number
  }
}

export interface Subject {
  id: string
  name: string
  grade: number
  maxGrade: number
  coefficient: number
}

export interface Observation {
  id: string
  content: string
  teacher: {
    name: string
    role: string
  }
  date: string
}

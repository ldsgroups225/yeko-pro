export * from './convexTypes'

export interface Classes {
  id: string
  schoolId: string
  gradeId: number
  name: string
  mainTeacherId: string | null
  createdAt: Date | null
  createdBy: string | null
  updatedAt: Date | null
  updatedBy: string | null
}

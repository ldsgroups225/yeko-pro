export interface SearchResult {
  student: IStudent | null
  school: ISchool | null
  isFirstAttempt: boolean
  error?: string
}

export interface IStudent {
  id: string
  idNumber: string
  firstName: string
  lastName: string
  address: string | null
  gender: string | null
  birthDate: string | null
  medicalCondition: string | null
  avatarUrl: string | null
  parentId: string
  classId: string | null
  gradeId: number | null
  schoolId: string | null
  createdAt: string | null
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

export interface ISchool {
  id: string
  code: string
  name: string
  address: string | null
  imageUrl: string | null
  city: string
  email: string
  cycleId: string
  isTechnicalEducation: boolean | null
  phone: string
  stateId: number | null
  createdAt: string | null
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

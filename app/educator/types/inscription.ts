// app/educator/types/inscription.ts

export interface IInscriptionRecord {
  id: string
  studentId: string
  studentFirstName: string
  studentLastName: string
  studentIdNumber: string
  studentAvatarUrl?: string
  parentId: string
  parentFirstName?: string
  parentLastName?: string
  parentPhone?: string
  classId?: string
  className?: string
  gradeName: string
  gradeId: number
  schoolId: string
  schoolYearId: number
  enrollmentStatus: string
  isActive: boolean
  isGovernmentAffected: boolean
  isOrphan: boolean
  isRedoublement: boolean
  isSubscribedToCanteen: boolean
  isSubscribedToTransportation: boolean
  createdAt: string
  updatedAt?: string
  updatedBy?: string
}

export interface IInscriptionStats {
  totalInscriptions: number
  pendingInscriptions: number
  activeInscriptions: number
  thisMonthInscriptions: number
  orphanStudents: number
  governmentAffectedStudents: number
  canteenSubscriptions: number
  transportationSubscriptions: number
}

export interface IInscriptionQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  enrollmentStatus?: string
  gradeId?: number
  classId?: string
  isGovernmentAffected?: boolean
  isOrphan?: boolean
  sort?: { column: string, direction: 'asc' | 'desc' }
}

export interface IGrade {
  id: number
  name: string
}

export interface IClass {
  id: string
  name: string
  gradeId: number
  gradeName: string
  maxStudent: number
  remainingSeats: number
}

export interface INewInscriptionData {
  studentFirstName: string
  studentLastName: string
  studentGender: 'M' | 'F'
  studentBirthDate: string
  studentAddress?: string
  studentIdNumber?: string
  parentPhone: string
  guardianFirstName: string
  guardianLastName: string
  guardianPhone: string
  gradeId: number
  classId?: string
  isGovernmentAffected: boolean
  isOrphan: boolean
  isSubscribedToCanteen: boolean
  isSubscribedToTransportation: boolean
  medicalConditions?: Array<{
    description: string
    severity: 'low' | 'medium' | 'high'
  }>
  secondParent?: {
    fullName: string
    gender: 'M' | 'F'
    phone: string
    type: 'father' | 'mother' | 'guardian'
  }
}

export interface IInscriptionResponse {
  inscriptions: IInscriptionRecord[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export interface IPendingInscription {
  candidateId: string
  time: string
  name: string
  type: 'student' // | 'teacher'
  status: 'pending' | 'refused' | 'accepted'
  affectedToClass: string | null
  grade?: number
}

// Helper functions
export function getEnrollmentStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'En attente'
    case 'active':
      return 'Actif'
    case 'inactive':
      return 'Inactif'
    case 'suspended':
      return 'Suspendu'
    case 'graduated':
      return 'Diplômé'
    case 'transferred':
      return 'Transféré'
    case 'accepted':
      return 'Accepté'
    case 'refused':
      return 'Refusé'
    default:
      return status
  }
}

export function getEnrollmentStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'suspended':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'graduated':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'transferred':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Student search interfaces
export interface IStudentSearchResult {
  id: string
  idNumber: string
  firstName: string
  lastName: string
  gender: string | null
  birthDate: string | null
  address: string | null
  avatarUrl: string | null
  medicalCondition: Array<{
    description: string
    severity: 'low' | 'medium' | 'high'
  }>
  parentId: string
  extraParent?: {
    fullName: string
    gender: 'M' | 'F'
    phone: string
    type: 'father' | 'mother' | 'guardian'
  } | null
  createdAt: string | null
  updatedAt: string | null
}

export interface IStudentSearchResponse {
  student: IStudentSearchResult | null
  error?: string
}

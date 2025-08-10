import type { IStudentDTO, MedicalCondition } from '@/types'

export interface Student {
  id: string
  idNumber: string
  firstName: string
  lastName: string
  gender: 'M' | 'F'
  dateOfBirth?: string
  address?: string
  avatarUrl?: string
  medicalCondition: MedicalCondition[]
  isGouvernentAffected: boolean
  isOrphan: boolean
  hasSubscribedTransportationService: boolean
  hasSubscribedCanteenService: boolean
  classroom?: {
    id: string
    name: string
  }
  enrollmentId?: string
  dateJoined?: string
}

export interface StudentStats {
  attendance: {
    lateCount: number
    absencesCount: number
    lateExcusedCount: number
    absencesExcusedCount: number
  }
  average: number
  payment: {
    status: 'up_to_date' | 'pending' | 'late'
    percentage: number
  }
  behavior: {
    status: string
    score: number
  }
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Helper function to transform DTO to our internal type
export function transformStudentDTO(dto: IStudentDTO): Student {
  return {
    id: dto.id,
    idNumber: dto.idNumber,
    firstName: dto.firstName,
    lastName: dto.lastName,
    gender: dto.gender as 'M' | 'F',
    dateOfBirth: dto.dateOfBirth || undefined,
    address: dto.address || undefined,
    avatarUrl: dto.avatarUrl || undefined,
    isGouvernentAffected: dto.isGouvernentAffected ?? false,
    isOrphan: dto.isOrphan ?? false,
    hasSubscribedTransportationService: dto.hasSubscribedTransportationService ?? false,
    hasSubscribedCanteenService: dto.hasSubscribedCanteenService ?? false,
    medicalCondition: dto.medicalCondition || [],
    classroom: dto.classroom
      ? {
          id: dto.classroom.id,
          name: dto.classroom.name,
        }
      : undefined,
    enrollmentId: dto.enrollmentId || undefined,
    dateJoined: dto.createdAt || undefined,
  }
}

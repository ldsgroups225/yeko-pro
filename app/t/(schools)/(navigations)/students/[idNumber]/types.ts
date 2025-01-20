import type { IStudentDTO } from '@/types'

export interface Student {
  id: string
  idNumber: string
  firstName: string
  lastName: string
  gender: 'M' | 'F'
  dateOfBirth?: string
  address?: string
  avatarUrl?: string
  classroom?: {
    id: string
    name: string
  }
}

export interface StudentStats {
  attendance: number
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
    classroom: dto.classroom
      ? {
          id: dto.classroom.id,
          name: dto.classroom.name,
        }
      : undefined,
  }
}

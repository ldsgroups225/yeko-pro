import type { ISchool } from '@/types'

import { createContext } from 'react'

export interface ISchoolData {
  school: ISchool | null
  isLoading: boolean
  error: any // TODO: define error type
}

export const SchoolContext = createContext<ISchoolData>({
  school: null,
  isLoading: true,
  error: null,
})

import type { DataModel } from '@/convex/_generated/dataModel'

import { createContext } from 'react'

type School = DataModel['schools']['document']

export interface ISchoolData {
  school: School | null
  isLoading: boolean
  error: any // TODO: define error type
}

export const SchoolContext = createContext<ISchoolData>({
  school: null,
  isLoading: true,
  error: null,
})

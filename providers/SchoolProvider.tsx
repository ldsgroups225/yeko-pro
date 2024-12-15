import type { ISchoolData } from './SchoolContext'
import { api } from '@/convex/_generated/api'

import { useQuery } from 'convex/react'
import React, { useEffect, useState } from 'react'
import { SchoolContext } from './SchoolContext'

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [schoolData, setSchoolData] = useState<ISchoolData>({
    school: null,
    isLoading: true,
    error: null,
  })

  const fetchedSchool = useQuery(api.schools.getStaffSchool, {})

  useEffect(() => {
    if (fetchedSchool === undefined) {
      // Query is still in progress
      setSchoolData({ ...schoolData, isLoading: true, error: null })
    }
    else if (fetchedSchool === null) {
      // Query returned null, no school found or user not logged in
      setSchoolData({ school: null, isLoading: false, error: null })
    }
    else {
      // Data is fetched
      setSchoolData({
        school: fetchedSchool,
        isLoading: false,
        error: null,
      })
    }
  }, [fetchedSchool])

  return (
    <SchoolContext value={schoolData}>
      {children}
    </SchoolContext>
  )
}

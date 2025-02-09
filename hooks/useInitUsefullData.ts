// hooks/useInitUsefullData.ts

import useGradeStore from '@/store/gradeStore'
import useSchoolYearStore from '@/store/schoolYearStore'
import useSubjectStore from '@/store/subjectStore'
import useUserStore from '@/store/userStore'
import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

export function useInitUsefulData() {
  const { fetchGrades } = useGradeStore(useShallow(state => ({ fetchGrades: state.fetchGrades })))
  const { fetchSubjects } = useSubjectStore(useShallow(state => ({ fetchSubjects: state.fetchSubjects })))
  const { fetchSchoolYears } = useSchoolYearStore(useShallow(state => ({ fetchSchoolYears: state.fetchSchoolYears })))

  const { fetchUser } = useUserStore(useShallow(state => ({ fetchUser: state.fetchUser })))
  const isAuthenticated = useUserStore(state => state.isAuthenticated)

  const initialize = useCallback(async (): Promise<void> => {
    try {
      if (isAuthenticated)
        return

      const user = await fetchUser()

      if (user?.school?.cycleId) {
        await Promise.all([
          fetchSubjects(),
          fetchSchoolYears(),
          fetchGrades(user.school.cycleId),
        ])
      }
      else {
        throw new Error('Invalid user data: missing school or cycle information')
      }
    }
    catch (error) {
      console.error('Error initializing useful data:', error)
      throw error
    }
  }, [isAuthenticated, fetchUser, fetchSubjects, fetchSchoolYears, fetchGrades])

  return { initialize }
}

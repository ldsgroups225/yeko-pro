// 'use server'

// import type { IStudentDTO, IStudentFiltersDTO } from '@/types'
// import { createStudent, fetchStudentById, fetchStudents, fetchStudentsByClass, updateStudent } from '@/app/(main)/(navigations)/students/actions'
// import { create } from 'zustand'
// import { createJSONStorage, persist } from 'zustand/middleware'

// interface StudentStore {
//   students: IStudentDTO[]
//   currentStudent: IStudentDTO | null
//   filters: IStudentFiltersDTO | null
//   setStudents: (students: IStudentDTO[]) => void
//   setCurrentStudent: (student: IStudentDTO | null) => void
//   setFilters: (filters: IStudentFiltersDTO | null) => void
//   fetchStudents: () => Promise<void>
//   fetchStudentById: (id: string) => Promise<void>
//   fetchStudentsByClass: (classId: string) => Promise<void>
//   updateStudent: (id: string, data: Partial<IStudentDTO>) => Promise<void>
//   createStudent: (data: Omit<IStudentDTO, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => Promise<void>
// }

// const useStudentStore = create<StudentStore>()(
//   persist(
//     set => ({
//       students: [],
//       currentStudent: null,
//       filters: null,

//       setStudents: students => set({ students }),
//       setCurrentStudent: student => set({ currentStudent: student }),
//       setFilters: filters => set({ filters }),

//       fetchStudents: async (): Promise<void> => {
//         try {
//           const students = await fetchStudents()
//           set({ students })
//         }
//         catch (error) {
//           console.error('[E_STUDENT_FETCH]:', error)
//         }
//       },

//       fetchStudentById: async (id) => {
//         const student = await fetchStudentById(id)
//         set({ currentStudent: student })
//       },

//       fetchStudentsByClass: async (classId) => {
//         const students = await fetchStudentsByClass(classId)
//         set({ students })
//       },

//       updateStudent: async (id, data) => {
//         const updatedStudent = await updateStudent(id, data)
//         set(state => ({
//           students: state.students.map(s => (s.id === id ? updatedStudent : s)),
//           currentStudent: state.currentStudent?.id === id ? updatedStudent : state.currentStudent,
//         }))
//       },

//       createStudent: async (data) => {
//         const newStudent = await createStudent(data)
//         set(state => ({
//           students: [...state.students, newStudent],
//         }))
//       },
//     }),
//     {
//       name: 'student-storage',
//       storage: createJSONStorage(() => localStorage),
//     },
//   ),
// )

// export default useStudentStore

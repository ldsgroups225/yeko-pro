import type { StudentForPayment } from './cashierServices'
import { getStudentByMatriculation } from './cashierServices'

export async function searchStudentsAction(query: string) {
  try {
    const result = await getStudentByMatriculation(query)
    return { success: true, data: result }
  }
  catch (error) {
    console.error('Search students action error:', error)
    return { success: false, data: <StudentForPayment>{} }
  }
}

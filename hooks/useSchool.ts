import { SchoolContext } from '@/providers/SchoolContext'
import { useContext } from 'react'

export const useSchool = () => useContext(SchoolContext)

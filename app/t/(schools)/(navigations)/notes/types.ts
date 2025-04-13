import type { Database } from '@/lib/supabase/types'

export type Note = Database['public']['Tables']['notes']['Row']
export type NoteDetail = Database['public']['Tables']['note_details']['Row']

export interface NotesQueryParams {
  classId?: string
  noteType?: string
  subjectId?: string
  semesterId?: string
  schoolYearId?: string
  page?: number
  limit?: number
  sort?: {
    column: keyof Note
    direction: 'asc' | 'desc'
  }
  searchTerm?: string
}

export interface NotesTableProps {
  searchParams?: NotesQueryParams
}

export interface NoteFiltersProps {
  onFilterChange?: (filters: Partial<NotesQueryParams>) => void
}

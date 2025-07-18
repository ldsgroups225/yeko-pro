import type { IClassesGrouped, IScheduleCalendarDTO, ITeacherOptions } from '@/types'
import { Loader2, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Combobox } from '@/components/Combobox'
import { GenericSelect } from '@/components/GenericSelect'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useScheduleCreate } from '@/hooks/useScheduleCreate'
import { getDayName } from '@/lib/utils'
import { useTeacherStore } from '@/store'
import useSubjectStore from '@/store/subjectStore'
import useUserStore from '@/store/userStore'

interface AddCourseDialogProps {
  classId: string
  mergedClasses: IClassesGrouped['subclasses']
  onAddSuccess?: () => void
  onError?: (error: Error) => void
}

const INITIAL_FORM_DATA = {
  room: '',
  dayOfWeek: 1,
  subjectId: '',
  teacherId: '',
  subjectName: '',
  teacherName: '',
  endTime: '09:00',
  startTime: '08:00',
}

export const AddCourseDialog: React.FC<AddCourseDialogProps> = ({
  classId,
  onAddSuccess,
  onError,
}) => {
  const { toast } = useToast()
  const { user } = useUserStore()
  const { subjects } = useSubjectStore()
  const { createSchedule } = useScheduleCreate()
  const { getTeacherToSetToCourse } = useTeacherStore()

  const [isTeacherLoading, setIsTeacherLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [teacherOptions, setTeacherOptions] = useState<ITeacherOptions[]>([])
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  const fetchTeachers = useCallback(async () => {
    if (!user)
      return

    setIsTeacherLoading(true)
    try {
      const teachers = await getTeacherToSetToCourse(user.school.id, search)
      setTeacherOptions(teachers)
    }
    catch (error) {
      toast({
        title: 'Erreur de recherche de professeurs',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: 'destructive',
      })
      onError?.(error instanceof Error ? error : new Error('Failed to fetch teachers'))
    }
    finally {
      setIsTeacherLoading(false)
      setSearch('')
    }
  }, [search])

  useEffect(() => {
    if (isOpen && user) {
      fetchTeachers()
    }
  }, [isOpen, user, fetchTeachers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { subjectId, teacherId, room, dayOfWeek, startTime, endTime } = formData

    if (!subjectId || !teacherId || !room) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    if (startTime >= endTime) {
      toast({
        title: 'Erreur de temps',
        description: 'L\'heure de début doit être antérieure à l\'heure de fin',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    try {
      const scheduleData: Omit<IScheduleCalendarDTO, 'id'> = {
        classId,
        endTime,
        classroomName: room,
        subjectId,
        teacherId,
        startTime,
        dayOfWeek,
        subjectName: subjects.find(s => s.id === subjectId)?.name || '',
        teacherName: teacherOptions.find(t => t.id === teacherId)?.name || '',
      }

      await createSchedule(scheduleData)

      setFormData(INITIAL_FORM_DATA)
      setIsOpen(false)
      onAddSuccess?.()
    }
    catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to create schedule'))
      toast({
        title: 'Échec de création',
        description: error instanceof Error ? error.message : 'Impossible de créer le cours',
        variant: 'destructive',
      })
    }
    finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un cours
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau cours</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <GenericSelect
              label="Matière"
              value={formData.subjectId}
              options={subjects}
              onValueChange={value => updateFormData({ subjectId: value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Combobox
              label="Professeur"
              value={formData.teacherId}
              options={teacherOptions}
              onSelect={teacher => updateFormData({
                teacherId: teacher.id,
                teacherName: teacher.name,
              })}
              isLoading={isTeacherLoading}
              placeholder="Sélectionnez un professeur"
              emptyText="Aucun professeur trouvé"
              onSearchChange={fetchTeachers}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Salle</Label>
            <Input
              value={formData.room}
              onChange={e => updateFormData({ room: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <GenericSelect
              label="Jour"
              value={formData.dayOfWeek.toString()}
              options={[
                { id: '1', name: getDayName(1) },
                { id: '2', name: getDayName(2) },
                { id: '3', name: getDayName(3) },
                { id: '4', name: getDayName(4) },
                { id: '5', name: getDayName(5) },
              ]}
              onValueChange={value => updateFormData({
                dayOfWeek: Number.parseInt(value),
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heure de début</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={e => updateFormData({ startTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Heure de fin</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={e => updateFormData({ endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout en cours
                  </>
                )
              : (
                  'Ajouter'
                )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

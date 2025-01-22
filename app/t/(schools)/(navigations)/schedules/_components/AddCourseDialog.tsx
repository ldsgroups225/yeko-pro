import type { IClassesGrouped, IScheduleCalendarDTO } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useScheduleCreate } from '@/hooks/useScheduleCreate'
import { getDayName } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface AddCourseDialogProps {
  classSlug: string
  mergedClasses: IClassesGrouped['subclasses']
  onAddSuccess?: () => void
  onError?: (error: Error) => void
}

export const AddCourseDialog: React.FC<AddCourseDialogProps> = ({
  classSlug,
  mergedClasses,
  onAddSuccess,
  onError,
}) => {
  const { createSchedule } = useScheduleCreate()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    subjectName: '',
    teacherName: '',
    room: '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const scheduleData = {
        subjectId: '', // TODO: Add subject selection
        teacherId: '', // TODO: Add teacher selection
        classId: classSlug,
        subjectName: formData.subjectName,
        teacherName: formData.teacherName,
        classroomName: formData.room,
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
      }

      await createSchedule(scheduleData, classSlug, mergedClasses)
      setIsOpen(false)
      setFormData({
        subjectName: '',
        teacherName: '',
        room: '',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:00',
      })
      onAddSuccess?.()
    }
    catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to create schedule'))
    }
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
            <Label>Matière</Label>
            <Input
              value={formData.subjectName}
              onChange={e => setFormData({ ...formData, subjectName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Professeur</Label>
            <Input
              value={formData.teacherName}
              onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Salle</Label>
            <Input
              value={formData.room}
              onChange={e => setFormData({ ...formData, room: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Jour</Label>
            <Select
              value={formData.dayOfWeek.toString()}
              onValueChange={value => setFormData({ ...formData, dayOfWeek: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    {getDayName(day)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heure de début</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Heure de fin</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">Ajouter</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

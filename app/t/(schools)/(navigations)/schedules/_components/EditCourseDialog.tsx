import type { IScheduleCalendarDTO } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getDayName } from '@/lib/utils'
import useSubjectStore from '@/store/subjectStore'
import { useEffect, useState } from 'react'

interface EditCourseDialogProps {
  event: IScheduleCalendarDTO
  isOpen: boolean
  onClose: () => void
  onEditEvent: (event: IScheduleCalendarDTO) => void
}

export const EditCourseDialog: React.FC<EditCourseDialogProps> = ({
  event,
  isOpen,
  onClose,
  onEditEvent,
}) => {
  const { subjects } = useSubjectStore()
  const [formData, setFormData] = useState({
    subjectId: '',
    teacherName: '',
    room: '',
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
  })

  useEffect(() => {
    setFormData({
      subjectId: event.subjectId,
      teacherName: event.teacherName ?? '',
      room: event.room ?? event.classroomName ?? '',
      dayOfWeek: event.dayOfWeek,
      startTime: event.startTime,
      endTime: event.endTime,
    })
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEditEvent({
      ...event,
      ...formData,
      subjectName: subjects.find(subject => subject.id === formData.subjectId)?.name ?? '',
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le cours</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Matière</Label>
            <Select
              value={formData.subjectId}
              onValueChange={value => setFormData({ ...formData, subjectId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <Button type="submit" className="w-full">Enregistrer</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

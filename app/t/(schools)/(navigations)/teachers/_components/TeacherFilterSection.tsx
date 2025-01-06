import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface TeacherFilterSectionProps {
  onStatusChange: (status: 'pending' | 'accepted' | 'rejected' | undefined) => void
  selectedStatus?: string
}

export function TeacherFilterSection({
  onStatusChange,
  selectedStatus,
}: TeacherFilterSectionProps) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="font-medium mb-3">Status</h4>
        <RadioGroup
          value={selectedStatus}
          onValueChange={value => onStatusChange(value as any)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="accepted" id="accepted" />
            <Label htmlFor="accepted">Accepté</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pending" id="pending" />
            <Label htmlFor="pending">En attente</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rejected" id="rejected" />
            <Label htmlFor="rejected">Rejeté</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}

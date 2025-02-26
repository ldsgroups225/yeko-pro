'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function TeacherFilterSection() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const selectedStatus = searchParams.get('status') ?? 'accepted'

  function handleStatusChange(value: string) {
    const params = new URLSearchParams(searchParams)
    params.set('status', value)
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="font-medium mb-3">Status</h4>
        <RadioGroup
          value={selectedStatus}
          onValueChange={handleStatusChange}
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

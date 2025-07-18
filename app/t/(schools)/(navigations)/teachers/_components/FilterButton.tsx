import { MixerVerticalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TeacherFilterSection } from './TeacherFilterSection'

export function FilterButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-label="Filter">
          <MixerVerticalIcon className="mr-2 h-4 w-4" />
          Filtrer
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <TeacherFilterSection />
      </PopoverContent>
    </Popover>
  )
}

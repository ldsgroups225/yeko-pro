import { useCallback, useState } from 'react'

export function useStudentClassSelection(
  initialSelectedClasses: string[] = [],
  onChange?: (selectedClasses: string[]) => void,
) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>(initialSelectedClasses)

  const handleClassChange = useCallback((classId: string, checked: boolean) => {
    setSelectedClasses((prev) => {
      const newSelection = checked
        ? [...prev, classId]
        : prev.filter(id => id !== classId)

      onChange?.(newSelection)
      return newSelection
    })
  }, [onChange])

  return {
    selectedClasses,
    handleClassChange,
    setSelectedClasses,
  }
}

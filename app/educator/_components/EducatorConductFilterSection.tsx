'use client'

import { MixerVerticalIcon } from '@radix-ui/react-icons'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Combobox } from '@/components/Combobox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useEducatorConduct } from '../hooks'

interface EducatorConductFilterSectionProps {
  classes: { id: string, name: string }[]
}

export function EducatorConductFilterSection({ classes,
}: EducatorConductFilterSectionProps) {
  const { filters, setFilters, fetchStudents } = useEducatorConduct()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [localScoreRange, setLocalScoreRange] = useState<[number, number]>([
    filters.scoreRange?.min ?? 0,
    filters.scoreRange?.max ?? 20,
  ])

  // Update URL when filters change
  const updateURL = useDebouncedCallback((newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove parameters based on new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key)
      }
      else if (typeof value === 'object') {
        params.set(key, JSON.stringify(value))
      }
      else {
        params.set(key, String(value))
      }
    })

    const search = params.toString()
    const newURL = search ? `${pathname}?${search}` : pathname
    router.push(newURL)
  }, 300)

  const handleScoreRangeChange = (values: number[]) => {
    setLocalScoreRange([values[0], values[1]])
  }

  const applyScoreRange = () => {
    const min = localScoreRange[0]
    const max = localScoreRange[1]

    const scoreRange = min === 0 && max === 20 ? undefined : { min, max }
    const newFilters = { scoreRange, page: 1 }
    setFilters(newFilters)
    fetchStudents({ ...filters, ...newFilters })
    updateURL(newFilters)
  }

  // Enhanced class options with "all" option for Combobox
  const enhancedClassOptions = useMemo(() => {
    const allOption = { id: 'all', name: 'Toutes les classes' }
    return [allOption, ...classes]
  }, [classes])

  // Handle class selection from Combobox
  const handleClassSelect = (option: { id: string, name: string }) => {
    const newFilters = { classId: option.id === 'all' ? undefined : option.id, page: 1 }
    setFilters(newFilters)
    fetchStudents({ ...filters, ...newFilters })
    updateURL(newFilters)
  }

  // Handle grade filter change
  const handleGradeFilterChange = (value: string) => {
    const gradeFilter = value === 'all' ? undefined : value as 'BLAME' | 'MAUVAISE' | 'PASSABLE' | 'BONNE' | 'TRES_BONNE'
    const newFilters = { gradeFilter, page: 1 }
    setFilters(newFilters)
    fetchStudents({ ...filters, ...newFilters })
    updateURL(newFilters)
  }

  const resetFilters = () => {
    const newFilters = {
      classId: undefined,
      gradeFilter: undefined,
      scoreRange: undefined,
      page: 1,
    }
    setFilters(newFilters)
    fetchStudents({ ...filters, ...newFilters })
    updateURL(newFilters)
    setLocalScoreRange([0, 20])
  }

  return (

    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label="Filter"
          className="hidden sm:flex bg-secondary/80 backdrop-blur-sm hover:bg-secondary hover:shadow-md transition-all duration-200 border-secondary/20"
        >
          <MixerVerticalIcon className="mr-2 h-4 w-4" />
          Filtrer
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm border-secondary/20">
        <div className="space-y-6 p-1">
          <div className="pb-2">
            <h4 className="font-semibold">Filtres de Conduite</h4>
            <p className="text-sm text-muted-foreground mt-1">Affiner les résultats selon vos critères</p>
          </div>

          {/* Class Filter */}
          <div className="space-y-3">
            <Combobox
              value={filters.classId || 'all'}
              options={enhancedClassOptions}
              onSelect={handleClassSelect}
              label="Classe"
              placeholder="Toutes les classes"
              searchPlaceholder="Rechercher une classe..."
              emptyText="Aucune classe trouvée"
              searchFrom="name"
              className="bg-white/80 border-slate-200 hover:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Grade Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">Appréciation</Label>
            <Select value={filters.gradeFilter || 'all'} onValueChange={handleGradeFilterChange}>
              <SelectTrigger className="bg-white/80 border-slate-200 hover:bg-white focus:ring-2 focus:ring-blue-500/20">
                <SelectValue placeholder="Toutes les appréciations" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200">
                <SelectItem value="all">Toutes les appréciations</SelectItem>
                <SelectItem value="TRES_BONNE">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Très bonne conduite</span>
                  </div>
                </SelectItem>
                <SelectItem value="BONNE">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Bonne conduite</span>
                  </div>
                </SelectItem>
                <SelectItem value="PASSABLE">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Conduite passable</span>
                  </div>
                </SelectItem>
                <SelectItem value="MAUVAISE">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Mauvaise conduite</span>
                  </div>
                </SelectItem>
                <SelectItem value="BLAME">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Blâme</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Score Range Filter */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">Plage de notes</Label>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {localScoreRange[0]}
                  {' '}
                  -
                  {localScoreRange[1]}
                  /20
                </div>
              </div>
            </div>

            <div className="px-3 py-2 bg-slate-50/80 rounded-lg">
              <Slider
                value={localScoreRange}
                onValueChange={handleScoreRangeChange}
                max={20}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={applyScoreRange}
              className="w-full bg-white/80 border-slate-200 hover:bg-white transition-all duration-200"
            >
              Appliquer la plage
            </Button>
          </div>

          {/* Reset Filters */}
          <div className="pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

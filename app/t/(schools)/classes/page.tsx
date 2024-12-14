'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  ArchiveIcon,
  UploadIcon,
  PersonIcon,
  PlusIcon,
  ViewGridIcon,
  ViewHorizontalIcon,
} from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'
import { usePaginatedQuery, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Separator } from '@/components/ui/separator'
import { useSchool } from '@/providers/SchoolProvider'

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        <ChevronLeftIcon width={16} height={16} />
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(1)}
            aria-label="Go to Page 1"
          >
            1
          </Button>
          {startPage > 2 && <span className="mx-1">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "ghost"}
          size="icon"
          onClick={() => onPageChange(page)}
          aria-label={`Go to Page ${page}`}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="mx-1">...</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            aria-label={`Go to Page ${totalPages}`}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        <ChevronRightIcon width={16} height={16} />
      </Button>
    </div>
  );
};

export default function ClassesPage() {
  const [selectedGrade, setSelectedGrade] = useState<Id<'grades'>>()
  const [schoolCycleId, setSchoolCycleId] = useState<Id<'cycles'>>()
  const [classesActiveState, setClassesActiveState] = useState<boolean | undefined>(undefined);
  const [hasMainTeacher, setHasMainTeacher] = useState<boolean | undefined>(undefined); // Currently not in use, but you can uncomment the filter in convex/classes.ts
  const [currentSchoolId, setCurrentSchoolId] = useState<Id<'schools'>>()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('2024-2025')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isTableViewMode, setIsTableViewMode] = useState(true);

  const { school, isLoading: schoolLoading, error: schoolError } = useSchool();
  const grades = useQuery(api.grades.getGrades, { cycleId: schoolCycleId });
  const { results, status, loadMore } = usePaginatedQuery(
    api.classes.getClasses,
    {
      schoolId: currentSchoolId,
      gradeId: selectedGrade,
      isActive: classesActiveState,
      hasMainTeacher: hasMainTeacher,
      search: searchTerm,
      paginationOpts: {
        numItems: itemsPerPage,
        cursor: null,
      }
    },
    { initialNumItems: itemsPerPage }
  );

  useEffect(() => {
    setCurrentSchoolId(school?._id)
    setSchoolCycleId(school?.cycleId)
  }, [school])

  // Reset current page when filters change, excluding the pagination itself
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedGrade, searchTerm, classesActiveState, hasMainTeacher]);

  if (schoolLoading) {
    return <div>Loading school data...</div>;
  }

  if (schoolError) {
    return <div>Error loading school: {schoolError.message}</div>;
  }

  return (
    <div className="space-y-2 px-6 py-2 h-full bg-orange-50">
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" aria-label="Profile">
            <PersonIcon width={16} height={16} className='text-secondary' />
          </Button>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] text-secondary" aria-label="School Year">
              <SelectValue placeholder="Année scolaire" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
              <SelectItem value="2023-2024">2023-2024</SelectItem>
              <SelectItem value="2022-2023">2022-2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle>Liste des classes</CardTitle>
          <Button variant="outline">
            <PlusIcon className="mr-2 h-4 w-4" /> Nouvelle classe
          </Button>
        </CardHeader>
        <CardContent className="px-6 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label htmlFor="grade-select" className="text-sm font-medium block mb-2">Niveau</label>
              <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value === '' ? undefined : value as Id<'grades'>)}>
                <SelectTrigger aria-label="Select Grade">
                  <SelectValue placeholder="Choisir un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les niveaux</SelectItem>
                  {grades && grades.map((grade) => (
                    <SelectItem key={grade?._id} value={(grade?._id ?? '').toString()}>
                      {`Niveau ${grade?.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="search-input" className="text-sm font-medium block mb-2">Recherche</label>
              <Input
                id="search-input"
                type="text"
                placeholder="Rechercher une classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters and View Mode Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className='flex flex-wrap items-center gap-4'>
              <div>
                <label htmlFor="status-filter" className="text-sm font-medium">Statut:</label>
                <Select value={classesActiveState === undefined ? '' : classesActiveState.toString()} onValueChange={(value) => setClassesActiveState(value === '' ? undefined : value === 'true')}>
                  <SelectTrigger className="w-[180px]" aria-label="Filter by Status">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="hidden">
                <label htmlFor="has-main-teacher-filter" className="text-sm font-medium">PP:</label>
                <Select value={hasMainTeacher === undefined ? '' : hasMainTeacher.toString()} onValueChange={(value) => setHasMainTeacher(value === '' ? undefined : value === 'true')}>
                  <SelectTrigger className="w-[180px]" aria-label="Filter by Main Teacher">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="true">Avec PP</SelectItem>
                    <SelectItem value="false">Sans PP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Toggle View Mode"
                onClick={() => setIsTableViewMode(!isTableViewMode)}
              >
                {isTableViewMode ? <ViewHorizontalIcon width={16} height={16} /> : <ViewGridIcon width={16} height={16} />}
              </Button>
              <Separator orientation="vertical" className="w-2" />
              <Button variant="outline" size="icon" aria-label="Archive">
                <ArchiveIcon width={16} height={16} />
              </Button>
              <Button variant="outline" size="icon" aria-label="Download">
                <DownloadIcon width={16} height={16} />
              </Button>
              <Button variant="outline" size="icon" aria-label="Upload">
                <UploadIcon width={16} height={16} />
              </Button>
            </div>
          </div>

          {/* Conditional Rendering based on View Mode */}
          {status === "LoadingFirstPage" && <div>Loading...</div>}
          {status !== "LoadingFirstPage" &&
            (isTableViewMode ? (
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Nom de la classe</TableHead>
                  <TableHead>Enseignant principal</TableHead>
                  <TableHead className='text-center'>Status</TableHead>
                  <TableHead className='text-center'>Actions</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                  {results?.map((cls, index) => (
                    <TableRow key={cls._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{cls.name}</TableCell>
                      <TableCell>
                        Non assigné
                      </TableCell>
                      <TableCell className='flex justify-center'>
                        <Badge variant={cls.isActive ? 'outline' : 'destructive'}>{cls.isActive ? 'Active' : 'Inactive'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 justify-center">
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results?.map((cls) => (
                  <Card key={cls._id} className="p-4">
                    <CardHeader className='p-0 pb-2'>
                      <CardTitle>{cls.name}</CardTitle>
                    </CardHeader>
                    <CardContent className='p-0'>
                      <Badge variant={cls.isActive ? 'outline' : 'destructive'}>{cls.isActive ? 'Active' : 'Inactive'}</Badge>
                      <p className="text-sm mt-2">
                        PP: Non assigné
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}

          {/* Pagination Controls */}
          {status !== "LoadingFirstPage" && (
            <Pagination
              currentPage={currentPage}
              totalPages={status === "Exhausted" ? currentPage : currentPage + 1}
              onPageChange={(newPage) => {
                if (newPage > currentPage) {
                  loadMore(itemsPerPage);
                }
                setCurrentPage(newPage);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

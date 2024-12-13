'use client'

import type { Classes } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  DownloadIcon, 
  ArchiveIcon, 
  UploadIcon, 
  PersonIcon,
} from '@radix-ui/react-icons'
import React, { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeftIcon width={16} height={16} />
      </Button>
      <span>{`Page ${currentPage} of ${totalPages}`}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRightIcon width={16} height={16} />
      </Button>
    </div>
  )
}

export default function ClassesPage() {
  const [selectedGrade, setSelectedGrade] = useState<Id<'grades'>>()
  const [selectedCycle, setSelectedCycle] = useState<Id<'cycles'>>()
  const [classesActiveState, setClassesActiveState] = useState<boolean>()
  const [currentSchoolId, setCurrentSchoolId] = useState<Id<'schools'>>()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('2024-2025')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const school = useQuery(api.schools.getStaffSchool, {});
  const grades = useQuery(api.grades.getGrades, { cycleId: selectedCycle });
  const classes = useQuery(api.classes.getClasses, {
    schoolId: currentSchoolId,
    gradeId: selectedGrade,
    isActive: classesActiveState,
  });

  useEffect(() => {
    setCurrentSchoolId(school?._id)
    setSelectedCycle(school?.cycleId)
  }, [school])

  return (
    <div className="space-y-6 p-6 bg-orange-50 h-screen">
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <PersonIcon width={16} height={16} className='text-secondary' />
          </Button>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] text-secondary">
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
        <CardHeader>
          <CardTitle>Liste des classes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Niveau</h3>
              <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value === '' ? undefined : value as Id<'grades'>)}>
                <SelectTrigger>
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
              <h3 className="text-lg font-medium mb-2">Recherche</h3>
              <Input
                type="text"
                placeholder="Rechercher une classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList>
              <TabsTrigger value="table">Vue Tableau</TabsTrigger>
              <TabsTrigger value="kanban">Vue Kanban</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Here later will be the filters part</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <ArchiveIcon width={16} height={16} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <DownloadIcon width={16} height={16} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <UploadIcon width={16} height={16} />
                  </Button>
                </div>
              </div>
              

                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N°</TableHead>
                        <TableHead>Nom de la classe</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Enseignant principal</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes?.map((cls, index) => (
                        <TableRow key={cls._id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>{cls.name}</TableCell>
                          <TableCell>
                            {grades?.find((grade) => grade._id === cls.gradeId)?.name                            }
                          </TableCell>
                          <TableCell>
                            {/* TODO: fix mainTeacherId */}
                            {/* {cls.mainTeacherId
                              ? `Teacher ID: ${cls.mainTeacherId}`
                              : 'Non assigné'} */}
                              Non assigné
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
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
                </>
              
            </TabsContent>
            <TabsContent value="kanban">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {classes?.map((cls) => (
                  <Card key={cls._id} className="p-4">
                    <h3 className="font-semibold">{cls.name}</h3>
                    <p className="text-sm">Niveau: {cls.gradeId}</p>
                    <p className="text-sm">
                      {/* TODO: fix mainTeacherId */}
                            {/* {cls.mainTeacherId
                              ? `Teacher ID: ${cls.mainTeacherId}`
                              : 'Non assigné'} */}
                              Non assigné
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm">
                        Voir
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          /> */}
        </CardContent>
      </Card>
    </div>
  )
}

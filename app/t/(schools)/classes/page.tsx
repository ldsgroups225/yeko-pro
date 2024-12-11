'use client'

import type { Classes } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  ChevronDownIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  DownloadIcon, 
  ArchiveIcon, 
  UploadIcon, 
  PersonIcon,
} from '@radix-ui/react-icons'
import React, { useEffect, useMemo, useState } from 'react'

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
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <span>{`Page ${currentPage} of ${totalPages}`}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Mock data for classes (replace with actual data fetching)
const mockClasses: Classes[] = [
  {
    id: '1',
    schoolId: 'school-1',
    gradeId: 1,
    name: 'Cp1 - A',
    mainTeacherId: 'teacher-1',
    createdAt: new Date(),
    createdBy: 'admin',
    updatedAt: null,
    updatedBy: null,
  },
  {
    id: '2',
    schoolId: 'school-1',
    gradeId: 1,
    name: 'Cp1 - B',
    mainTeacherId: 'teacher-2',
    createdAt: new Date(),
    createdBy: 'admin',
    updatedAt: null,
    updatedBy: null,
  },
  {
    id: '3',
    schoolId: 'school-1',
    gradeId: 2,
    name: 'Cp2 - A',
    mainTeacherId: null,
    createdAt: new Date(),
    createdBy: 'admin',
    updatedAt: null,
    updatedBy: null,
  },
  // Add more mock classes here
]

export default function ClassesPage() {
  // State variables
  const [classes, setClasses] = useState<Classes[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('2024 2025')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Replace this with your actual data fetching logic
  useEffect(() => {
    // Example: Fetch classes from an API
    // const fetchClasses = async () => {
    //   try {
    //     const response = await fetch('/api/classes');
    //     const data = await response.json();
    //     setClasses(data);
    //   } catch (error) {
    //     console.error('Error fetching classes:', error);
    //   }
    // };
    // fetchClasses();

    // For now, use mock data
    setClasses(mockClasses)
  }, [])

  // Filtered classes based on search term and selected grade
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGrade === '' || cls.gradeId.toString() === selectedGrade)
    )
  }, [searchTerm, selectedGrade, classes])

  // Paginated classes
  const paginatedClasses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredClasses.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredClasses, currentPage])

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage)

  // Unique grades for the grade filter
  const uniqueGrades = useMemo(() => {
    const grades = new Set<number>()
    classes.forEach((cls) => grades.add(cls.gradeId))
    return Array.from(grades).sort((a, b) => a - b)
  }, [classes])

  return (
    <div className="space-y-6 p-6 bg-orange-50 h-screen">
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <PersonIcon className="h-4 w-4" />
          </Button>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Année scolaire" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024 2025">2024 2025</SelectItem>
              <SelectItem value="2023 2024">2023 2024</SelectItem>
              <SelectItem value="2022 2023">2022 2023</SelectItem>
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
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les niveaux</SelectItem>
                  {uniqueGrades.map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      {`Niveau ${grade}`}
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
                <h3 className="text-lg font-medium">Effectif des classes</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <ArchiveIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <UploadIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
                  {paginatedClasses.map((cls, index) => (
                    <TableRow key={cls.id}>
                      <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>{cls.name}</TableCell>
                      <TableCell>{cls.gradeId}</TableCell>
                      <TableCell>
                        {cls.mainTeacherId
                          ? `Teacher ID: ${cls.mainTeacherId}`
                          : 'Non assigné'}
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
            </TabsContent>
            <TabsContent value="kanban">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedClasses.map((cls) => (
                  <Card key={cls.id} className="p-4">
                    <h3 className="font-semibold">{cls.name}</h3>
                    <p className="text-sm">Niveau: {cls.gradeId}</p>
                    <p className="text-sm">
                      Enseignant:
                      {cls.mainTeacherId
                        ? ` ID ${cls.mainTeacherId}`
                        : ' Non assigné'}
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}

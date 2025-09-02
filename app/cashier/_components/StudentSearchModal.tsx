'use client'

import type { StudentForPayment } from '../actions/cashierServices'
import { Clock, CreditCard, ExternalLink, Search, User } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { searchStudentsAction } from '../actions/searchStudents'

interface StudentSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectStudent?: (student: StudentForPayment) => void
}

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function StudentSearchModal({
  open,
  onOpenChange,
  onSelectStudent,
}: StudentSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StudentForPayment | null>(null)
  const [isSearching, startTransition] = useTransition()

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSearchResults(null)
        return
      }

      startTransition(async () => {
        try {
          const response = await searchStudentsAction(query)
          if (response.success) {
            setSearchResults(response.data)
          }
          else {
            setSearchResults(null)
          }
        }
        catch (error) {
          console.error('Search error:', error)
          setSearchResults(null)
        }
      })
    }, 300),
    [],
  )

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    debouncedSearch(query)
  }

  const handleSelectStudent = (student: StudentForPayment) => {
    onSelectStudent?.(student)
    onOpenChange(false)
    setSearchQuery('')
    setSearchResults(null)
  }

  // const getPaymentStatusColor = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case 'paid':
  //     case 'payé':
  //     case 'up_to_date':
  //       return 'bg-green-500/20 text-green-300 border-green-500/30'
  //     case 'partial':
  //     case 'partiel':
  //       return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  //     case 'overdue':
  //     case 'en_retard':
  //       return 'bg-red-500/20 text-red-300 border-red-500/30'
  //     default:
  //       return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  //   }
  // }

  // const getStatusText = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case 'up_to_date':
  //       return 'À jour'
  //     case 'partial':
  //       return 'Partiel'
  //     case 'overdue':
  //       return 'En Retard'
  //     default:
  //       return status
  //   }
  // }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche d'Étudiant
          </DialogTitle>
          <DialogDescription>
            Rechercher un étudiant par nom ou matricule pour voir ses informations de paiement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Nom ou matricule de l'étudiant..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="pl-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-muted border-t-primary rounded-full"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {searchQuery.length >= 2 && (
              <>
                {searchResults === null && !isSearching
                  ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Aucun étudiant trouvé</p>
                        <p className="text-sm">Essayez une autre recherche</p>
                      </div>
                    )
                  : (
                      searchResults && (
                        <div
                          key={searchResults.id}
                          className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-all duration-200 cursor-pointer"
                          onClick={() => handleSelectStudent(searchResults)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12 border-2 border-border">
                                <AvatarImage src={searchResults.photo || ''} alt={searchResults.fullName} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                  {searchResults.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{searchResults.fullName}</h4>
                                  {/* <Badge
                                    variant="outline"
                                    className={getPaymentStatusColor(searchResults.financialInfo.)}
                                  >
                                    {getStatusText(searchResults.paymentStatus)}
                                  </Badge> */}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {searchResults.matriculation}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" />
                                    {formatCurrency(searchResults.financialInfo.totalTuition - searchResults.financialInfo.remainingBalance)}
                                    {' '}
                                    /
                                    {formatCurrency(searchResults.financialInfo.remainingBalance)}
                                  </span>
                                  {searchResults.financialInfo.lastPayment && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {searchResults.financialInfo.lastPayment.date.toLocaleDateString('fr-FR')}
                                    </span>
                                  )}
                                </div>

                                {/* {student.className && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    Classe:
                                    {' '}
                                    {student.className}
                                  </div>
                                )} */}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectStudent(searchResults)
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Sélectionner
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
              </>
            )}
            {/* Search Instructions */}
            {searchQuery.length < 2 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Commencez à taper pour rechercher</p>
                <p className="text-sm">Au moins 2 caractères requis</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

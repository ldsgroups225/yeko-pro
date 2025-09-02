'use client'

import { Clock, CreditCard, ExternalLink, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState, useTransition } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { searchStudents } from '../actions/cashierServices'

interface StudentSearchResult {
  id: string
  idNumber: string
  firstName: string
  lastName: string
  fullName: string
  avatarUrl?: string
  className?: string
  gradeName?: string
  balance: number
  totalDue: number
  totalPaid: number
  lastPaymentDate?: Date
  paymentStatus: 'up_to_date' | 'overdue' | 'partial'
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

const EMPTY_RESULTS: StudentSearchResult[] = []

interface StudentSearchProps {
  initialResults?: StudentSearchResult[]
}

export function StudentSearch({ initialResults = EMPTY_RESULTS }: StudentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>(initialResults)
  const [isSearching, startTransition] = useTransition()

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSearchResults([])
        return
      }

      startTransition(async () => {
        try {
          const response = await searchStudents(query)
          if (response) {
            setSearchResults(response)
          }
          else {
            setSearchResults([])
          }
        }
        catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        }
      })
    }, 300),
    [],
  )

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    debouncedSearch(query)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'payé':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'partial':
      case 'partiel':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'overdue':
      case 'en_retard':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'Payé'
      case 'partial':
        return 'Partiel'
      case 'overdue':
        return 'En Retard'
      default:
        return status
    }
  }

  return (
    <Card
      className="border-border/30 shadow-glass bg-card/25 backdrop-blur-lg"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <CardHeader>
        <CardTitle className="text-card-foreground text-lg flex items-center gap-2">
          <Search className="h-5 w-5" />
          Recherche d'Étudiant
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Rechercher par nom ou matricule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Nom ou matricule de l'étudiant..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="pl-10 bg-background/20 border-border/30 text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:bg-background/30 backdrop-blur-sm"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-muted/30 border-t-primary rounded-full"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.length === 0 && !isSearching
                ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun étudiant trouvé</p>
                      <p className="text-sm">Essayez une autre recherche</p>
                    </div>
                  )
                : (
                    searchResults.map(student => (
                      <div
                        key={student.id}
                        className="p-4 rounded-lg bg-card/15 border border-border/20 hover:bg-card/25 hover:border-border/30 transition-all duration-200 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12 border-2 border-border/20">
                              <AvatarImage src={student.avatarUrl || ''} alt={student.fullName} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                                {student.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-card-foreground">{student.fullName}</h4>
                                <Badge
                                  variant="outline"
                                  className={getPaymentStatusColor(student.paymentStatus)}
                                >
                                  {getStatusText(student.paymentStatus)}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {student.idNumber}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CreditCard className="h-3 w-3" />
                                  {formatCurrency(student.totalPaid)}
                                  {' '}
                                  /
                                  {formatCurrency(student.totalDue)}
                                </span>
                                {student.lastPaymentDate && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(student.lastPaymentDate).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                              </div>

                              {student.className && (
                                <div className="mt-1 text-xs text-muted-foreground/80">
                                  Classe:
                                  {' '}
                                  {student.className}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              asChild
                              size="sm"
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30"
                              variant="outline"
                            >
                              <Link href={`/cashier/students/${student.id}`}>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Voir
                              </Link>
                            </Button>

                            {student.paymentStatus !== 'up_to_date' && (
                              <Button
                                asChild
                                size="sm"
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30"
                                variant="outline"
                              >
                                <Link href={`/cashier/payments?student=${student.id}`}>
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Payer
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
            </div>
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
      </CardContent>
    </Card>
  )
}

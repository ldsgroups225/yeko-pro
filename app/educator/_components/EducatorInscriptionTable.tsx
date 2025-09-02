// app/educator/_components/EducatorInscriptionTable.tsx

'use client'

import type { IInscriptionRecord } from '../types/inscription'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  Clock,
  MapPin,
  MoreHorizontal,
  Phone,
  User,
} from 'lucide-react'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { getEnrollmentStatusColor, getEnrollmentStatusLabel } from '../types/inscription'

interface EducatorInscriptionTableProps {
  inscriptions: IInscriptionRecord[]
  isLoading: boolean
  onSort: (field: string) => void
  onStatusChange: (inscriptionId: string, status: string) => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
}

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  onConfirm: () => Promise<void>
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

function ConfirmationDialog({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
    }
    catch (error) {
      console.error('Error in confirmation:', error)
      toast.error('Une erreur est survenue')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function EducatorInscriptionTable({
  inscriptions,
  isLoading,
  onSort,
  onStatusChange,
  sortColumn,
  sortDirection,
}: EducatorInscriptionTableProps) {
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean
    action: 'approve' | 'reject' | null
    inscriptionId: string | null
    studentName: string | null
  }>({
    isOpen: false,
    action: null,
    inscriptionId: null,
    studentName: null,
  })

  const [isActionLoading, setIsActionLoading] = useState(false)

  const handleStatusChangeWithConfirmation = (inscriptionId: string, status: string, studentName: string) => {
    const action = status === 'accepted' ? 'approve' : 'reject'
    setConfirmationDialog({
      isOpen: true,
      action,
      inscriptionId,
      studentName,
    })
  }

  const handleConfirmAction = async () => {
    if (!confirmationDialog.inscriptionId || !confirmationDialog.action)
      return

    setIsActionLoading(true)
    try {
      const status = confirmationDialog.action === 'approve' ? 'accepted' : 'refused'
      await onStatusChange(confirmationDialog.inscriptionId, status)

      const actionText = confirmationDialog.action === 'approve' ? 'approuvée' : 'refusée'
      toast.success(`Inscription ${actionText} avec succès`)
    }
    catch (error) {
      console.error('Error changing status:', error)
      const actionText = confirmationDialog.action === 'approve' ? 'approuver' : 'refuser'
      toast.error(`Erreur lors de l'action pour ${actionText} l'inscription`)
    }
    finally {
      setIsActionLoading(false)
    }
  }

  const closeConfirmationDialog = () => {
    setConfirmationDialog({
      isOpen: false,
      action: null,
      inscriptionId: null,
      studentName: null,
    })
  }

  const getSortIcon = (field: string) => {
    if (sortColumn !== field)
      return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  const getStudentInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map(() => (
              <div key={nanoid()} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-6 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (inscriptions.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-muted-foreground/80" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucune inscription trouvée</h3>
          <p className="text-muted-foreground">
            Aucune inscription ne correspond aux critères de recherche actuels.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <Card className="border-0 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        onClick={() => onSort('studentFirstName')}
                        className="h-auto p-0 font-semibold hover:text-foreground"
                      >
                        Élève
                        {getSortIcon('studentFirstName')}
                      </Button>
                    </th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        onClick={() => onSort('parentFirstName')}
                        className="h-auto p-0 font-semibold hover:text-foreground"
                      >
                        Parent/Tuteur
                        {getSortIcon('parentFirstName')}
                      </Button>
                    </th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        onClick={() => onSort('gradeName')}
                        className="h-auto p-0 font-semibold hover:text-foreground"
                      >
                        Niveau/Classe
                        {getSortIcon('gradeName')}
                      </Button>
                    </th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        onClick={() => onSort('enrollmentStatus')}
                        className="h-auto p-0 font-semibold hover:text-foreground"
                      >
                        Statut
                        {getSortIcon('enrollmentStatus')}
                      </Button>
                    </th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        onClick={() => onSort('createdAt')}
                        className="h-auto p-0 font-semibold hover:text-foreground"
                      >
                        Date d'inscription
                        {getSortIcon('createdAt')}
                      </Button>
                    </th>
                    <th className="text-right p-4">
                      <span className="font-semibold">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inscriptions.map((inscription, index) => (
                    <motion.tr
                      key={inscription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/20 hover:bg-muted/10 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={inscription.studentAvatarUrl}
                              alt={`${inscription.studentFirstName} ${inscription.studentLastName}`}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getStudentInitials(inscription.studentFirstName, inscription.studentLastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {inscription.studentFirstName}
                              {' '}
                              {inscription.studentLastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {inscription.studentIdNumber}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {inscription.parentFirstName}
                            {' '}
                            {inscription.parentLastName}
                          </p>
                          {inscription.parentPhone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {inscription.parentPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {inscription.gradeName}
                          </p>
                          {inscription.className && (
                            <p className="text-sm text-muted-foreground">
                              Classe:
                              {' '}
                              {inscription.className}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(inscription.enrollmentStatus)}
                          <Badge
                            variant="outline"
                            className={`${getEnrollmentStatusColor(inscription.enrollmentStatus)} border`}
                          >
                            {getEnrollmentStatusLabel(inscription.enrollmentStatus)}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">
                          {formatDate(inscription.createdAt)}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        {inscription.enrollmentStatus !== 'accepted'
                          ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChangeWithConfirmation(
                                      inscription.id,
                                      'accepted',
                                      `${inscription.studentFirstName} ${inscription.studentLastName}`,
                                    )}
                                  >
                                    Approuver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChangeWithConfirmation(
                                      inscription.id,
                                      'refused',
                                      `${inscription.studentFirstName} ${inscription.studentLastName}`,
                                    )}
                                  >
                                    Refuser
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )
                          : null}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {inscriptions.map((inscription, index) => (
            <motion.div
              key={inscription.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Student Info */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={inscription.studentAvatarUrl}
                          alt={`${inscription.studentFirstName} ${inscription.studentLastName}`}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getStudentInitials(inscription.studentFirstName, inscription.studentLastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {inscription.studentFirstName}
                          {' '}
                          {inscription.studentLastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {inscription.studentIdNumber}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getEnrollmentStatusColor(inscription.enrollmentStatus)} border`}
                      >
                        {getEnrollmentStatusLabel(inscription.enrollmentStatus)}
                      </Badge>
                    </div>

                    {/* Parent Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium">Parent:</span>
                        <span className="ml-1">
                          {inscription.parentFirstName}
                          {' '}
                          {inscription.parentLastName}
                        </span>
                      </div>
                      {inscription.parentPhone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {inscription.parentPhone}
                        </div>
                      )}
                    </div>

                    {/* Class & Date Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{inscription.gradeName}</span>
                        {inscription.className && (
                          <span className="ml-1">
                            -
                            {inscription.className}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Inscrit le
                        {' '}
                        {formatDate(inscription.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChangeWithConfirmation(
                          inscription.id,
                          'accepted',
                          `${inscription.studentFirstName} ${inscription.studentLastName}`,
                        )}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleStatusChangeWithConfirmation(
                              inscription.id,
                              'refused',
                              `${inscription.studentFirstName} ${inscription.studentLastName}`,
                            )}
                          >
                            Refuser
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={closeConfirmationDialog}
        title={
          confirmationDialog.action === 'approve'
            ? 'Confirmer l\'approbation'
            : 'Confirmer le refus'
        }
        description={
          confirmationDialog.action === 'approve'
            ? `Êtes-vous sûr de vouloir approuver l'inscription de ${confirmationDialog.studentName} ?`
            : `Êtes-vous sûr de vouloir refuser l'inscription de ${confirmationDialog.studentName} ?`
        }
        onConfirm={handleConfirmAction}
        confirmText={
          confirmationDialog.action === 'approve' ? 'Approuver' : 'Refuser'
        }
        cancelText="Annuler"
        isLoading={isActionLoading}
      />
    </>
  )
}

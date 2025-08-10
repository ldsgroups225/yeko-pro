'use client'

import { Bus, Loader2, Utensils } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { toggleStudentService } from '@/services/studentService'

export interface Service {
  id: 'transport' | 'cafeteria'
  name: string
  icon: React.ReactNode
  isActive: boolean
  onToggle: (checked: boolean) => void
}

interface SubscribedServicesProps {
  enrollmentId?: string
  hasSubscribedTransportationService: boolean
  hasSubscribedCanteenService: boolean
  isLoading?: boolean
  onServiceUpdate?: (serviceType: 'transport' | 'cafeteria', newStatus: boolean) => void
}

function ServiceRow({
  service,
  isToggling,
}: {
  service: Service
  isToggling: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {service.icon}
        <span>{service.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        {isToggling && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <Switch
          checked={service.isActive}
          onCheckedChange={service.onToggle}
          aria-label={`Toggle ${service.name}`}
          disabled={isToggling}
        />
      </div>
    </div>
  )
}

function SubscribedServicesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(index => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-10" />
        </div>
      ))}
    </div>
  )
}

interface ConfirmationState {
  isOpen: boolean
  serviceType: 'transport' | 'cafeteria' | null
  serviceName: string
  newStatus: boolean
  action: string
}

export function SubscribedServices({
  enrollmentId,
  hasSubscribedTransportationService,
  hasSubscribedCanteenService,
  isLoading,
  onServiceUpdate,
}: SubscribedServicesProps) {
  const [togglingServices, setTogglingServices] = useState<Set<string>>(() => new Set())
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    serviceType: null,
    serviceName: '',
    newStatus: false,
    action: '',
  })

  const showConfirmationDialog = (serviceType: 'transport' | 'cafeteria', newStatus: boolean) => {
    if (!enrollmentId) {
      toast.error('Impossible de modifier les services. Données d\'inscription manquantes.')
      return
    }

    const serviceName = serviceType === 'transport' ? 'Transport Scolaire' : 'Cantine'
    const action = newStatus ? 'souscrire à' : 'désabonner de'

    setConfirmation({
      isOpen: true,
      serviceType,
      serviceName,
      newStatus,
      action,
    })
  }

  const handleConfirmToggle = async () => {
    if (!confirmation.serviceType || !enrollmentId)
      return

    // Close confirmation dialog
    setConfirmation(prev => ({ ...prev, isOpen: false }))

    // Add service to toggling state
    setTogglingServices(prev => new Set(prev).add(confirmation.serviceType!))

    try {
      await toggleStudentService(enrollmentId, confirmation.serviceType, confirmation.newStatus)

      // Update parent component state
      onServiceUpdate?.(confirmation.serviceType, confirmation.newStatus)

      // Show success message
      const action = confirmation.newStatus ? 'souscrit' : 'désabonné'
      toast.success(`${confirmation.serviceName}: ${action} avec succès`)
    }
    catch (error) {
      console.error('Error toggling service:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification du service')
    }
    finally {
      // Remove service from toggling state
      setTogglingServices((prev) => {
        const newSet = new Set(prev)
        newSet.delete(confirmation.serviceType!)
        return newSet
      })
    }
  }

  const handleCancelToggle = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }))
  }

  const services: Service[] = [
    {
      id: 'transport',
      name: 'Transport Scolaire',
      icon: <Bus className="h-5 w-5 text-muted-foreground" />,
      isActive: hasSubscribedTransportationService,
      onToggle: checked => showConfirmationDialog('transport', checked),
    },
    {
      id: 'cafeteria',
      name: 'Cantine',
      icon: <Utensils className="h-5 w-5 text-muted-foreground" />,
      isActive: hasSubscribedCanteenService,
      onToggle: checked => showConfirmationDialog('cafeteria', checked),
    },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Services Souscrits</CardTitle>
          <CardDescription>
            {enrollmentId
              ? 'Gérez les services optionnels de l\'étudiant'
              : 'État des services optionnels'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading
            ? (
                <SubscribedServicesSkeleton />
              )
            : (
                <div className="space-y-4">
                  {services.map(service => (
                    <ServiceRow
                      key={service.id}
                      service={service}
                      isToggling={togglingServices.has(service.id)}
                    />
                  ))}
                  {!enrollmentId && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Les services ne peuvent pas être modifiés car les données d'inscription sont manquantes.
                    </p>
                  )}
                </div>
              )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmation.isOpen} onOpenChange={handleCancelToggle}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la modification du service</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir
              {' '}
              {confirmation.action}
              {' '}
              le service
              {' '}
              <strong>{confirmation.serviceName}</strong>
              {' '}
              ?
              {confirmation.newStatus && (
                <span className="block mt-2 text-sm text-muted-foreground">
                  Cette action ajoutera des frais à votre plan de paiement et les répartira sur vos échéances impayées.
                </span>
              )}
              {!confirmation.newStatus && (
                <span className="block mt-2 text-sm text-muted-foreground">
                  Cette action supprimera les frais de votre plan de paiement et ajustera vos échéances impayées.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelToggle}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmToggle}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

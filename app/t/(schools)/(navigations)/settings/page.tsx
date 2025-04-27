'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, ListChecks, School, User } from 'lucide-react'
import { useState } from 'react'

import ProfileSettingsTab from './tabs/ProfileSettingsTab'
import ProgressReportsSettingsTab from './tabs/ProgressReportsSettingsTab'
import SchoolSettingsTab from './tabs/SchoolSettingsTab'
import TuitionSettingsTab from './tabs/TuitionSettingsTab'

export default function SettingsPage() {
  // const { user } = useUser()
  // const [isLoading, setIsLoading] = useState(false)
  const [storageUsed, _setStorageUsed] = useState(65)

  // const handleSchoolUpdate = async (event: { preventDefault: () => void }) => {
  //   event.preventDefault()
  //   setIsLoading(true)
  //   // TODO: Implement logic
  //   setIsLoading(false)
  // }

  return (
    <div className="space-y-3 px-6 py-4">
      <Card className="bg-muted">
        <CardContent className="py-1.5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Espace de stockage</p>
              <Progress value={storageUsed} className="w-[200px]" />
            </div>
            <p className="text-sm text-muted-foreground">
              {storageUsed}
              % utilisé
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="school" className="space-y-3">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="school" className="space-x-2">
            <School className="h-4 w-4" />
            <span>École</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="space-x-2">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="tuition" className="space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Scolarité</span>
          </TabsTrigger>
          <TabsTrigger value="progress-reports" className="space-x-2">
            <ListChecks className="h-4 w-4" />
            <span>Conf. Suivi Pédagogique</span>
          </TabsTrigger>
          {/* <TabsTrigger value="notifications" className="space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="space-x-2">
            <Shield className="h-4 w-4" />
            <span>Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="space-x-2">
            <Globe className="h-4 w-4" />
            <span>Intégrations</span>
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="school">
          <SchoolSettingsTab />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileSettingsTab />
        </TabsContent>

        <TabsContent value="tuition">
          <TuitionSettingsTab />
        </TabsContent>

        <TabsContent value="progress-reports">
          <ProgressReportsSettingsTab />
        </TabsContent>

        {/* <TabsContent value="notifications">
          <NotificationsSettingsTab />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsTab />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsSettingsTab />
        </TabsContent> */}
      </Tabs>

      {/* <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Dernière mise à jour le
            {' '}
            {
              user?.school?.updatedAt
                ? new Date(user?.school?.updatedAt).toLocaleDateString('fr-FR')
                : '--/--/----'
            }
          </span>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={handleSchoolUpdate} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={handleSchoolUpdate} disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </AlertDescription>
      </Alert> */}
    </div>
  )
}

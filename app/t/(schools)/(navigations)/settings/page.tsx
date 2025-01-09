'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/hooks'
import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle,
  Database,
  FileText,
  Globe,
  GraduationCap,
  Key,
  LineChart,
  Mail,
  School,
  Shield,
  Smartphone,
  User,
  Users,
} from 'lucide-react'
import React from 'react'

export default function SettingsPage() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = React.useState(false)
  const [storageUsed, _setStorageUsed] = React.useState(65)

  const handleSchoolUpdate = async (event: { preventDefault: () => void }) => {
    event.preventDefault()
    setIsLoading(true)
    // Add your update logic here
    setIsLoading(false)
  }

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
          <TabsTrigger value="academic" className="space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Académique</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="space-x-2">
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
          </TabsTrigger>
        </TabsList>

        <TabsContent value="school">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'établissement</CardTitle>
                <CardDescription>
                  Gérez les informations principales de votre établissement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Logo de l'école</Label>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.school?.imageUrl} />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" className="space-x-2">
                          <Camera className="h-4 w-4" />
                          <span>Changer l'image</span>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG ou GIF. Maximum 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolName">Nom de l'établissement</Label>
                    <Input
                      id="schoolName"
                      defaultValue={user?.school?.name}
                      placeholder="Nom de l'établissement"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolCode">Code de l'établissement</Label>
                    <Input
                      id="schoolCode"
                      defaultValue={user?.school?.code}
                      placeholder="Code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cycle">Cycle</Label>
                    <Select defaultValue={user?.school?.cycleId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primaire</SelectItem>
                        <SelectItem value="secondary">Secondaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                  <CardDescription>
                    Aperçu des données de votre établissement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Classes</span>
                      </div>
                      <p className="text-2xl font-bold">{user?.school?.classCount}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Élèves</span>
                      </div>
                      <p className="text-2xl font-bold">{user?.school?.studentCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Configurer le calendrier scolaire</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Modèles de bulletins</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start space-x-2">
                      <LineChart className="h-4 w-4" />
                      <span>Rapports analytiques</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        defaultValue={user?.firstName}
                        placeholder="Prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        defaultValue={user?.lastName}
                        placeholder="Nom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select defaultValue={user?.role}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="director">Directeur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="teacher">Professeur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
                <CardDescription>
                  Gérez vos informations de contact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email">Email</Label>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="phone">Téléphone</Label>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue={user?.phoneNumber}
                      placeholder="+123456789"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuration académique</CardTitle>
                <CardDescription>
                  Gérez les paramètres académiques de votre établissement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Système de notation</Label>
                      <p className="text-sm text-muted-foreground">
                        Définir l'échelle de notation
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Périodes scolaires</Label>
                      <p className="text-sm text-muted-foreground">
                        Gérer les trimestres/semestres
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Emploi du temps</Label>
                      <p className="text-sm text-muted-foreground">
                        Configuration des horaires
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres d'évaluation</CardTitle>
                <CardDescription>
                  Configurez les règles d'évaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Barème par défaut</Label>
                      <Select defaultValue="20">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un barème" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">Sur 20</SelectItem>
                          <SelectItem value="10">Sur 10</SelectItem>
                          <SelectItem value="100">Sur 100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>
                  Configurez comment vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifications par email</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications par email
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifications SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications par SMS
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notifications push</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des notifications push
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Types de notifications</CardTitle>
                <CardDescription>
                  Choisissez les événements pour lesquels vous souhaitez être notifié
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Checkbox id="absences" />
                    <div className="space-y-1">
                      <Label htmlFor="absences">Absences</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications des absences d'élèves
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-4">
                    <Checkbox id="grades" defaultChecked />
                    <div className="space-y-1">
                      <Label htmlFor="grades">Notes</Label>
                      <p className="text-sm text-muted-foreground">
                        Publication des notes
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-4">
                    <Checkbox id="events" defaultChecked />
                    <div className="space-y-1">
                      <Label htmlFor="events">Événements</Label>
                      <p className="text-sm text-muted-foreground">
                        Événements scolaires et réunions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Authentification à deux facteurs</Label>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Ajouter une couche de sécurité supplémentaire
                      </p>
                      <Switch />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Sessions actives</Label>
                      <Badge variant="secondary">3 appareils</Badge>
                    </div>
                    <Button variant="outline" className="w-full justify-start space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Gérer les sessions</span>
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Mot de passe</Label>
                    <Button variant="outline" className="w-full justify-start space-x-2">
                      <Key className="h-4 w-4" />
                      <span>Changer le mot de passe</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Journal d'activité</CardTitle>
                  <CardDescription>
                    Historique des dernières activités
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
                        text: 'Connexion réussie',
                        time: 'Il y a 2 minutes',
                        device: 'Chrome sur Windows',
                      },
                      {
                        icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
                        text: 'Tentative de connexion',
                        time: 'Il y a 1 heure',
                        device: 'Firefox sur MacOS',
                      },
                    ].map(activity => (
                      <div key={activity.time} className="flex items-center space-x-4">
                        {activity.icon}
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.text}</p>
                          <div className="flex text-xs text-muted-foreground">
                            <p>{activity.time}</p>
                            <span className="mx-1">•</span>
                            <p>{activity.device}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Préférences de confidentialité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Partage de données</Label>
                        <p className="text-sm text-muted-foreground">
                          Autoriser le partage anonyme des statistiques
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Services connectés</CardTitle>
                <CardDescription>
                  Gérez vos intégrations et services externes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Google Workspace',
                      description: 'Synchronisation avec Google Classroom',
                      connected: true,
                    },
                    {
                      name: 'Microsoft 365',
                      description: 'Synchronisation avec Teams Education',
                      connected: false,
                    },
                    {
                      name: 'Zoom Education',
                      description: 'Classes virtuelles',
                      connected: true,
                    },
                  ].map(service => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{service.name}</Label>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                      <Switch checked={service.connected} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API et développeurs</CardTitle>
                <CardDescription>
                  Gérez l'accès API et les clés de développement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Clé API</Label>
                    <div className="flex space-x-2">
                      <Input type="password" value="sk_live_..." readOnly />
                      <Button variant="outline">
                        Copier
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://api.votresite.com/webhook" />
                  </div>
                  <Button className="w-full" variant="outline">
                    Générer nouvelle clé API
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Alert>
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
      </Alert>
    </div>
  )
}

'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStudents } from '@/hooks'
import { formatDate, getAge } from '@/lib/utils'
import {
  AlertCircle,
  BookOpen,
  Bus,
  Calendar,
  CalendarDays,
  Clock,
  FileText,
  GraduationCap,
  Heart,
  Home,
  Mail,
  MapPin,
  PhoneCall,
  School,
  UserCircle,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function StudentPage() {
  const pathname = usePathname()
  const idNumber = pathname.split('/').pop()

  const { isLoading, fetchStudentByIdNumber, selectedStudent: student } = useStudents()

  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    async function getStudent(idNumber: string) {
      await fetchStudentByIdNumber(idNumber)

      // other fetches here later
    }

    if (idNumber) {
      getStudent(idNumber).catch((error) => {
        console.error('Failed to fetch student:', error)
      })
    }
  }, [idNumber])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Élève non trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:p-6">
      {/* Header Section */}
      <Card className="border-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <div className="relative">
                {
                  student.avatarUrl
                  && (
                    <Image
                      src={student.avatarUrl}
                      alt="avatar"
                      className="rounded-3xl object-cover"
                      width={170}
                      height={170}
                      objectFit="cover"
                    />
                  )
                }
                {
                  !student.avatarUrl
                  && (
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-muted flex items-center justify-center">
                      <UserCircle className="h-16 w-16 md:h-20 md:w-20 text-muted-foreground" />
                    </div>
                  )
                }
                <Badge className="absolute -bottom-2 right-0" variant="secondary">
                  {student.gender === 'M' ? 'Masculin' : 'Féminin'}
                </Badge>
              </div>
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-bold">
                  {student.firstName}
                  {' '}
                  {student.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <School className="h-4 w-4" />
                  <p className="font-medium">
                    Classe
                    <span className="text-primary ml-1">{student.classroom?.name}</span>
                  </p>
                  <span>•</span>
                  <span>
                    Matricule:
                    <span className="text-primary ml-1">{student.idNumber}</span>
                  </span>
                </div>
              </div>
            </div>
            {/* <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Performance</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Clock className="h-4 w-4 mr-2" />
                <span>Présence</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Notes</span>
              </Button>
              <Button variant="default" size="sm" className="flex-1 sm:flex-none">
                <Users className="h-4 w-4 mr-2" />
                <span>Parents</span>
              </Button>
            </div> */}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Assiduité</p>
                    <p className="text-2xl font-bold">95%</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
                <Progress value={95} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Moyenne Générale</p>
                    <p className="text-2xl font-bold">15,5/20</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={87} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Paiement</p>
                    <p className="text-2xl font-bold">À jour</p>
                  </div>
                  <Wallet className="h-8 w-8 text-purple-500" />
                </div>
                <Progress value={100} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Comportement</p>
                    <p className="text-2xl font-bold">Bien</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <Progress value={90} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex h-auto p-1 w-full md:w-auto">
          <TabsList className="flex h-auto p-1 w-full md:w-auto overflow-x-auto md:overflow-visible">
            <TabsTrigger value="profile" className="flex-1 md:flex-none">Profil</TabsTrigger>
            <TabsTrigger value="academic" className="flex-1 md:flex-none">Scolarité</TabsTrigger>
            <TabsTrigger value="attendance" className="flex-1 md:flex-none">Présence</TabsTrigger>
            <TabsTrigger value="performance" className="flex-1 md:flex-none">Performance</TabsTrigger>
            <TabsTrigger value="health" className="flex-1 md:flex-none">Santé</TabsTrigger>
            <TabsTrigger value="payments" className="flex-1 md:flex-none">Paiements</TabsTrigger>
            <TabsTrigger value="services" className="flex-1 md:flex-none">Services</TabsTrigger>
            <TabsTrigger value="parents" className="flex-1 md:flex-none">Parents</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>Détails et informations de base de l'élève</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Date de naissance:</span>
                  <span>
                    {
                      student.dateOfBirth
                        ? (
                            <>
                              {formatDate(student.dateOfBirth)}
                              {' '}
                              <span className="text-muted-foreground">
                                (
                                {getAge(student.dateOfBirth)}
                                {' ans'}
                                )
                              </span>
                            </>
                          )
                        : <span>Non renseigné</span>
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Nationalité:</span>
                  <span>Ivoirienne</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Adresse:</span>
                  <span>{student.address}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Niveau actuel:</span>
                  <span>{student.classroom?.name.split(' ')[0]}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Statut:</span>
                  <Badge>Actif</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Date d'inscription:</span>
                  <span>TODO ...</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Souscrits</CardTitle>
                <CardDescription>État des services optionnels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bus className="h-5 w-5 text-muted-foreground" />
                    <span>Transport Scolaire</span>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Utensils className="h-5 w-5 text-muted-foreground" />
                    <span>Cantine</span>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations Médicales</CardTitle>
                <CardDescription>Conditions médicales et allergies</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    L'élève est asthmatique - Nécessite un inhalateur
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parents">
          <Card>
            <CardHeader>
              <CardTitle>Informations des Parents</CardTitle>
              <CardDescription>Coordonnées et historique des communications</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Père</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Nom:</span>
                    <span>Kouassi Mederic</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneCall className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Téléphone:</span>
                    <span>0787900103</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>mederic.kouassi@example.com</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Mère</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Nom:</span>
                    <span>Komenan Sandrine</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneCall className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Téléphone:</span>
                    <span>0787950101</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>sandrine.komenan@example.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suivi Scolaire</CardTitle>
              <CardDescription>Résultats et progression académique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Trimestre 1</div>
                    <div className="text-2xl font-bold mt-2">16,5/20</div>
                    <Progress value={82.5} className="mt-2" />
                    <div className="text-sm text-muted-foreground mt-2">Rang: 3/42</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Trimestre 2</div>
                    <div className="text-2xl font-bold mt-2">15,8/20</div>
                    <Progress value={79} className="mt-2" />
                    <div className="text-sm text-muted-foreground mt-2">Rang: 5/42</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Trimestre 3</div>
                    <div className="text-2xl font-bold mt-2">En cours</div>
                    <Progress value={0} className="mt-2" />
                    <div className="text-sm text-muted-foreground mt-2">-</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Matières Principales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Mathématiques</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">17/20</Badge>
                        <Progress value={85} className="w-20" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Français</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">15/20</Badge>
                        <Progress value={75} className="w-20" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sciences</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">16/20</Badge>
                        <Progress value={80} className="w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Observations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">Élève sérieux et appliqué. Participe activement en classe et montre un réel intérêt pour les mathématiques.</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          - M. Konan, Professeur Principal
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suivi de Présence</CardTitle>
              <CardDescription>Assiduité et ponctualité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total jours d'absence:</span>
                    <Badge variant="outline">3 jours</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Retards:</span>
                    <Badge variant="outline">2 fois</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Taux de présence:</span>
                    <Badge variant="outline">95%</Badge>
                  </div>
                </div>

                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Dernières absences:</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>15/01/2025</span>
                        <span className="text-muted-foreground">Maladie - Justifiée</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>22/12/2024</span>
                        <span className="text-muted-foreground">Rendez-vous médical</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>État des Paiements</CardTitle>
              <CardDescription>Historique et suivi des paiements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Frais de Scolarité</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-2xl font-bold">À jour</span>
                        <Badge className="bg-green-500">Payé</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Transport</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-2xl font-bold">150.000 FCFA</span>
                        <Badge>En attente</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Cantine</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-2xl font-bold">À jour</span>
                        <Badge className="bg-green-500">Payé</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Historique des Paiements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Frais de Scolarité - T2</div>
                          <div className="text-sm text-muted-foreground">05/01/2025</div>
                        </div>
                        <Badge className="bg-green-500">500.000 FCFA</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Cantine - T2</div>
                          <div className="text-sm text-muted-foreground">05/01/2025</div>
                        </div>
                        <Badge className="bg-green-500">75.000 FCFA</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add remaining tab contents similarly... */}
      </Tabs>
    </div>
  )
}

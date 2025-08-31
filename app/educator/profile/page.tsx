import { ArrowLeft, Camera, Edit3, Mail, MapPin, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

async function getEducatorProfile() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/sign-in')
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select(`
      id,
      first_name,
      last_name,
      email,
      avatar_url,
      phone,
      user_roles!inner(
        role_id,
        school_id,
        schools(
          id,
          name,
          address,
          image_url
        )
      )
    `)
    .eq('id', user.id)
    .eq('user_roles.role_id', ERole.EDUCATOR)
    .single()

  if (profileError || !userProfile) {
    redirect('/unauthorized')
  }

  return {
    user: {
      id: userProfile.id,
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      fullName: `${userProfile.first_name} ${userProfile.last_name}`,
      email: userProfile.email,
      avatarUrl: userProfile.avatar_url,
      phoneNumber: userProfile.phone,
      school: userProfile.user_roles[0]?.schools,
    },
  }
}

export default async function EducatorProfilePage() {
  const { user } = await getEducatorProfile()

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/educator">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Overview Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative mx-auto w-32 h-32">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={user.avatarUrl || '/user_placeholder.png'} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                      {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <h2 className="text-xl font-semibold">{user.fullName}</h2>
                  <p className="text-muted-foreground">Éducateur</p>
                </div>

                <Separator />

                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>

                  {user.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.phoneNumber}</span>
                    </div>
                  )}

                  {user.school && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.school.name}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <Button className="w-full" asChild>
                  <Link href="/educator/profile/edit">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Modifier le profil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations Personnelles
              </CardTitle>
              <CardDescription>
                Vos informations de base et coordonnées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom Complet</label>
                  <p className="text-foreground">{user.fullName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{user.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="text-foreground">{user.phoneNumber || 'Non renseigné'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">École</label>
                  <p className="text-foreground">{user.school?.name || 'Non assigné'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Security Card */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité du Compte
              </CardTitle>
              <CardDescription>
                Gérez la sécurité de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Mot de passe</h4>
                  <p className="text-sm text-muted-foreground">
                    Modifiez votre mot de passe pour sécuriser votre compte
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/educator/profile/change-password">
                    Modifier
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Authentification à deux facteurs</h4>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez une couche de sécurité supplémentaire
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/educator/profile/2fa">
                    Configurer
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Sessions actives</h4>
                  <p className="text-sm text-muted-foreground">
                    Gérez vos sessions de connexion
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/educator/profile/sessions">
                    Voir les sessions
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* School Information Card */}
          {user.school && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informations de l'École
                </CardTitle>
                <CardDescription>
                  Détails sur votre établissement scolaire
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {user.school.image_url && (
                    <img
                      src={user.school.image_url}
                      alt={user.school.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{user.school.name}</h3>
                    {user.school.address && (
                      <p className="text-sm text-muted-foreground">{user.school.address}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions Card */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>
                Accédez rapidement aux fonctionnalités principales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-auto p-4 flex-col gap-2" asChild>
                  <Link href="/educator/students">
                    <User className="h-6 w-6" />
                    <span>Gérer les élèves</span>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex-col gap-2" asChild>
                  <Link href="/educator/conduct">
                    <Shield className="h-6 w-6" />
                    <span>Rapports de conduite</span>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex-col gap-2" asChild>
                  <Link href="/educator/grades">
                    <span className="text-lg font-bold">📊</span>
                    <span>Notes et évaluations</span>
                  </Link>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex-col gap-2" asChild>
                  <Link href="/educator/schedule">
                    <span className="text-lg font-bold">📅</span>
                    <span>Emploi du temps</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  )
}

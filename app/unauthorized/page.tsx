import type { JSX } from 'react'
import { MailIcon, ShieldXIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SignOutButton } from './_components/SignOutButton'
import { UnauthorizedContent } from './_components/UnauthorizedContent'

/**
 * Professional unauthorized access page
 * Provides clear information about access restrictions and next steps
 */
const UnauthorizedPage: React.FC = (): JSX.Element => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background/50 to-background">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-background/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex items-center justify-center mb-4">
            <Image
              priority
              src="/logo.png"
              alt="Logo Yeko"
              className="size-24 opacity-90"
              width={96}
              height={96}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/20">
                <ShieldXIcon className="size-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Accès non autorisé
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                Vous n'avez pas les permissions nécessaires pour accéder à cette section de l'application.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <UnauthorizedContent />

          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <SignOutButton />

              <Button variant="outline" asChild className="w-full h-11">
                <Link href="mailto:support@yeko-pro.com">
                  <MailIcon className="size-4 mr-2" />
                  Contacter le support
                </Link>
              </Button>
            </div>

            <div className="text-center space-y-2">
              <div className="h-px bg-border"></div>
              <p className="text-xs text-muted-foreground">
                Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur système.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UnauthorizedPage

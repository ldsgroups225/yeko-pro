import type { JSX } from 'react'
import Image from 'next/image'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ForgotPasswordForm } from '../_components/ForgotPasswordForm'

/**
 * ForgotPasswordPage component that renders the forgot password page.
 * @returns {JSX.Element} The rendered ForgotPasswordPage component
 */
const ForgotPasswordPage: React.FC = (): JSX.Element => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background/50 to-background">
      <Card className="w-full max-w-md shadow-xl border-0 bg-background/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-center mb-6">
            <Image
              priority
              src="/logo.png"
              alt="Logo Yeko"
              className="size-32"
              width={128}
              height={128}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Réinitialiser le mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage

import type { JSX } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import React from 'react'
import { LoginForm } from '../_components/LoginForm'
import { NewSchoolInfo } from '../_components/NewSchoolInfo'

/**
 * LoginPage component that renders the login page.
 * @returns {JSX.Element} The rendered LoginPage component
 */
const LoginPage: React.FC = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Image priority src="/logo.png" alt="Logo Yeko" className="size-48" width={192} height={192} />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-primary">Connexion à Yeko Pro</CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour accéder au tableau de bord de votre école
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col">
          <NewSchoolInfo />
        </CardFooter>
      </Card>
    </div>
  )
}

export default LoginPage

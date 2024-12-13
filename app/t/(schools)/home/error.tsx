'use client'

import { useEffect } from 'react'
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const isUnauthorizedError = error.message.includes('Unauthorized');
  const isNoSchoolFoundError = error.message.includes('No school found');

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Oops! Une erreur est survenue.</CardTitle>
        </CardHeader>
        <CardContent>
          {isUnauthorizedError && (
            <>
              <CardDescription>
                Vous n'êtes pas autorisé à accéder à cette page. Veuillez vous connecter avec les informations d'identification appropriées.
              </CardDescription>
            </>
          )}

          {isNoSchoolFoundError && (
            <>
              <CardDescription>
               Vous ne figurez pas dans l'école une école ou n'avez pas accès à cette page. Veuillez vous connecter avec les informations d'identification appropriées.
              </CardDescription>
            </>
          )}

          {!isUnauthorizedError && !isNoSchoolFoundError && (
            <>
              <CardDescription>
                Une erreur inattendue s'est produite. Veuillez réessayer ultérieurement.
              </CardDescription>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isUnauthorizedError ? (
            <Button asChild>
              <Link href="/login">
                Se connecter
              </Link>
            </Button>
          ) : (
            <div className="flex gap-2 items-center justify-between w-full">
              <Button onClick={reset} variant="ghost">
                Réessayer
              </Button>

              <Button onClick={reset} variant="secondary">
                Se déconnecter
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

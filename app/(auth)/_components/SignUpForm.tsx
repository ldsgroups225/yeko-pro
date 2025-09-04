'use client'

import type { ISignUp } from '@/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { MinusCircledIcon } from '@radix-ui/react-icons'
import { ArrowLeftIcon, CheckCircle2Icon, EyeIcon, EyeOffIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import {
  GoogleSignInButton,
  SocialAuthDivider,
} from '@/components/GoogleSignInButton'
import { SubmitButton } from '@/components/SubmitButton'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useUser } from '@/hooks'
import { useOAuthErrorDisplay } from '@/hooks/useOAuthErrorDisplay'
import { signUpSchema } from '@/validations'

export function SignUpForm() {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { signUp } = useUser()
  const { errorComponent } = useOAuthErrorDisplay()

  const form = useForm<ISignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: ISignUp) {
    if (isSuccess)
      return

    setError(null)
    startTransition(async () => {
      try {
        const result = await signUp(values.fullName, values.email, values.password)
        if (result.success) {
          setIsSuccess(true)
        }
        else {
          setError(result.error || 'Une erreur est survenue lors de l\'inscription.')
        }
      }
      catch (error) {
        setError('Une erreur est survenue lors de l\'inscription.')
        console.error('Sign up error:', error)
      }
    })
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
            <CheckCircle2Icon className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Inscription réussie !
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Nous avons envoyé un email de confirmation à votre adresse. Veuillez cliquer sur le lien dans l'email pour activer votre compte.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeftIcon className="size-4" />
              Retour à la connexion
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Vous n'avez pas reçu l'email ? Vérifiez vos spams ou
            {' '}
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false)
                form.reset()
              }}
              className="font-medium text-primary hover:text-primary/80 underline underline-offset-2"
            >
              réessayez
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Créer un compte
          </h2>
          <p className="text-sm text-muted-foreground">
            Remplissez les informations ci-dessous pour créer votre compte Yeko Pro.
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="fullName">Nom complet</FormLabel>
                <FormControl>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Votre nom complet"
                    {...field}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Adresse email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    {...field}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">Mot de passe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Créer un mot de passe sécurisé"
                      {...field}
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword
                        ? (
                            <EyeOffIcon className="size-4 text-muted-foreground" />
                          )
                        : (
                            <EyeIcon className="size-4 text-muted-foreground" />
                          )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Affichage des erreurs OAuth */}
        {errorComponent}

        {error && (
          <Alert variant="destructive">
            <MinusCircledIcon className="size-4" />
            <AlertTitle>
              {error}
            </AlertTitle>
          </Alert>
        )}

        <div className="space-y-4">
          <SubmitButton
            label="Créer mon compte"
            disabled={isPending}
            className="w-full h-11"
          />

          {/* Séparateur et bouton Google OAuth */}
          <SocialAuthDivider />

          <GoogleSignInButton
            mode="signup"
            className="w-full"
            size="lg"
            onAuthAttempt={(success) => {
              if (success) {
              // La redirection sera gérée par le hook OAuth
              }
            }}
          />

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              En créant un compte, vous acceptez nos
              {' '}
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                conditions d'utilisation
              </Link>
              {' '}
              et notre
              {' '}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                politique de confidentialité
              </Link>
              .
            </p>

            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <span>Vous avez déjà un compte ?</span>
              <Link
                href="/sign-in"
                className="font-medium text-primary hover:text-primary/80 underline underline-offset-2"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

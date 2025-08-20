'use client'

import type { IForgotPassword } from '@/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { MinusCircledIcon } from '@radix-ui/react-icons'
import { ArrowLeftIcon, CheckCircle2Icon } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { SubmitButton } from '@/components/SubmitButton'
import { Alert, AlertTitle } from '@/components/ui/alert'
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
import { forgotPasswordSchema } from '@/validations'

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { resetPassword } = useUser()

  const form = useForm<IForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: IForgotPassword) {
    if (isSuccess)
      return

    setError(null)
    startTransition(async () => {
      try {
        const result = await resetPassword(values.email)
        if (result.success) {
          setIsSuccess(true)
        }
        else {
          setError(result.error || 'Une erreur est survenue lors de l\'envoi de l\'email.')
        }
      }
      catch (error) {
        setError('Une erreur est survenue lors de l\'envoi de l\'email.')
        console.error('Reset password error:', error)
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
              Email envoyé !
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Nous avons envoyé les instructions de réinitialisation du mot de passe à votre adresse email.
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
            Mot de passe oublié ?
          </h2>
          <p className="text-sm text-muted-foreground">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

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
            label="Envoyer les instructions"
            disabled={isPending}
            className="w-full h-11"
          />

          <div className="text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon className="size-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}

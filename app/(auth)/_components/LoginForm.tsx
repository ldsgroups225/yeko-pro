'use client'

import type { ILogin } from '@/validations'
import { fetchUserProfile, login } from '@/app/(auth)/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema } from '@/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { MinusCircledIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  async function onSubmit(values: ILogin) {
    try {
      startTransition(async () => {
        const response = await login(values)
        if (response) {
          await fetchUserProfile()
          router.replace('/home')
        }
      })
    }
    catch (error) {
      setError((error as Error).message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email">Email</Label>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  {...field}
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
              <Label htmlFor="password">Mot de passe</Label>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Se souvenir de moi
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <MinusCircledIcon className="size-4" />
            <AlertTitle>
              {error}
            </AlertTitle>
          </Alert>
        )}

        <SubmitButton label="Se connecter" disabled={isPending} />
        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm hover:underline text-muted-foreground">
            Mot de passe oublié ?
          </Link>
        </div>
      </form>
    </Form>
  )
}

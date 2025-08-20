'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const onSignOut = () => {
    startTransition(async () => {
      try {
        await supabase.auth.signOut()
        router.replace('/sign-in')
      }
      catch (error) {
        console.error('Sign out failed:', error)
      }
    })
  }

  return (
    <Button className="w-full h-11" onClick={onSignOut} disabled={isPending}>
      <LogOut className="size-4 mr-2 rotate-180" />
      Se déconnecter
    </Button>
  )
}

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { startTransition, useActionState, useOptimistic } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ERole } from '@/types'

interface PublishNotesButtonProps {
  noteId: string
  initialPublished?: boolean
}

async function publishNote(prevState: { published: boolean, error: string | null }, noteId: string) {
  try {
    const supabase = createClient()
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Error fetching user:', userError)
      throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
    }

    const { error: userSchoolError } = await supabase
      .from('users')
      .select('user_roles(role_id)')
      .eq('id', user.user.id)
      .eq('user_roles.role_id', ERole.DIRECTOR)
      .single()
    if (userSchoolError) {
      console.error('Error fetching user school:', userSchoolError)
      throw new Error('Seul un directeur peut accéder à cette page')
    }

    const { error } = await supabase
      .from('notes')
      .update({ is_published: true })
      .eq('id', noteId)
      .throwOnError()

    if (error) {
      console.error('Error publishing notes:', error)
      throw new Error('Échec de la publication des notes')
    }
    return { published: true, error: null }
  }
  catch (error: any) {
    let errorMessage = 'Échec de la publication'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    else if (typeof error === 'string') {
      errorMessage = error
    }
    return { published: prevState.published, error: errorMessage }
  }
}

export function PublishNotesButton({ noteId, initialPublished = false }: PublishNotesButtonProps) {
  const [state, submitAction, isPending] = useActionState(
    publishNote,
    { published: initialPublished, error: null },
    noteId,
  )

  const [optimisticPublished, setOptimisticPublished] = useOptimistic(
    state.published,
    (_, newPublished: boolean) => newPublished,
  )

  const handleClick = () => {
    startTransition(() => {
      setOptimisticPublished(true)
      submitAction(noteId)
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <AnimatePresence>
        {!optimisticPublished && (
          <motion.div
            key="publish-button"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 10,
              bounce: 0.5,
            }}
            layout
          >
            <Button
              size="sm"
              variant="outline"
              className="bg-primary/10 text-primary hover:bg-primary/20"
              onClick={handleClick}
              disabled={isPending || optimisticPublished}
            >
              {isPending ? 'Publication en cours' : 'Publier'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-red-500"
          >
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

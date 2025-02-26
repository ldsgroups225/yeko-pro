'use client'

import { Button } from '@/components/ui/button'
import { Link1Icon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { InviteTeacherModal } from './InviteTeacherModal'

export function InviteTeacherButton() {
  const [showInviteModal, setShowInviteModal] = useState(false)
  return (
    <>
      <Button variant="outline" aria-label="Invite Teacher" onClick={() => setShowInviteModal(true)}>
        <Link1Icon className="mr-2 h-4 w-4" />
        Inviter un enseignant
      </Button>

      <InviteTeacherModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </>
  )
}

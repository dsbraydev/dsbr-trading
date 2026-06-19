'use client'

import { Button } from '@/components/ui/button'

interface Props {
  challengeId: string
  cancelAction: (id: string) => Promise<{ error?: string } | void>
}

export function CancelChallengeButton({ challengeId, cancelAction }: Props) {
  async function handleCancel() {
    if (
      !confirm(
        'Cancel this challenge? All trades linked to it will be permanently deleted.',
      )
    )
      return
    await cancelAction(challengeId)
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleCancel}>
      Cancel challenge
    </Button>
  )
}

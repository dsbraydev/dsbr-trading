'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Props {
  id: string
  deleteAction: (id: string) => Promise<{ success?: boolean; error?: string }>
}

export function DeleteTradeButton({ id, deleteAction }: Props) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this trade? This cannot be undone.')) return
    await deleteAction(id)
    router.push('/trades')
    router.refresh()
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Trash2 className="size-3.5" />
      Delete
    </Button>
  )
}

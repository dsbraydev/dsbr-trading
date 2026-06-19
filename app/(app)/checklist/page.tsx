import { getChecklistItems, createChecklistItem, deleteChecklistItem } from '@/lib/supabase/actions/checklist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'

export default async function ChecklistPage() {
  const items = await getChecklistItems()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-semibold mb-1">Checklist</h1>
      <p className="text-sm text-muted-foreground mb-6">
        These items appear when logging a trade. Check off which ones you followed.
      </p>

      <form action={createChecklistItem} className="flex gap-2 mb-6">
        <Input name="name" placeholder="e.g. Trend confirmed" required className="flex-1" />
        <Button type="submit">Add item</Button>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet. Add your first checklist item above.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => {
            const deleteWithId = deleteChecklistItem.bind(null, item.id)
            return (
              <li
                key={item.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-card"
              >
                <span className="text-sm">{item.name}</span>
                <form action={deleteWithId}>
                  <Button variant="ghost" size="icon-sm" type="submit" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                </form>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

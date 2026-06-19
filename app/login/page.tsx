import { signIn } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form action={signIn} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Password" required />
        <Button type="submit">Sign in</Button>
      </form>
    </div>
  )
}

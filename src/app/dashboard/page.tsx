// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome back, {user.email}!</p>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </form>
    </div>
  )
}

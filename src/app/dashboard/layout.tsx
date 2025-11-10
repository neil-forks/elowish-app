// src/app/layout.tsx
import type { Metadata } from 'next'
import '../globals.css'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Supabase + Next.js Example',
  description: 'Next.js 15 Supabase SSR Auth Example',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="p-4 bg-white border-b">
          {user ? (
            <p>Signed in as <strong>{user.email}</strong></p>
          ) : (
            <p>Not signed in</p>
          )}
        </header>
        <main className="p-8">{children}</main>
      </body>
    </html>
  )
}

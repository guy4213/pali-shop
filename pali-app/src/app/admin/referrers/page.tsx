import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'

export default async function AdminReferrersPage() {
  if (!(await isAdmin())) {
    redirect('/')
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin – Referrers</h1>
    </main>
  )
}

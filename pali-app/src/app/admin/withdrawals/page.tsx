import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'

export default async function AdminWithdrawalsPage() {
  if (!(await isAdmin())) {
    redirect('/')
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin – Withdrawals</h1>
    </main>
  )
}

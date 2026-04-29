'use client'

import { useState } from 'react'
import { Wallet, ArrowDownToLine, TrendingUp, ShoppingBag, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import type { WalletTransaction, WithdrawalRequest } from '@/types'

interface Props {
  balance: number
  transactions: WalletTransaction[]
  withdrawalRequests: WithdrawalRequest[]
  referrerId: string
  canWithdraw: boolean
  withdrawalThreshold: number
}

const typeLabels: Record<string, { label: string; color: string; icon: typeof TrendingUp }> = {
  earn:     { label: 'הכנסה', color: 'text-green-600 bg-green-50',   icon: TrendingUp },
  redeem:   { label: 'מימוש', color: 'text-orange-600 bg-orange-50', icon: ShoppingBag },
  withdraw: { label: 'משיכה', color: 'text-red-600 bg-red-50',       icon: ArrowDownToLine },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'אושר', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'נדחה', color: 'bg-red-100 text-red-700' },
}

export default function WalletClient({ balance, transactions, withdrawalRequests, canWithdraw, withdrawalThreshold }: Props) {
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [bankBranch, setBankBranch] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const { toast } = useToast()

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault()
    setWithdrawLoading(true)

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points_amount: Number(amount),
          bank_code: bankCode,
          bank_branch: bankBranch,
          bank_account: bankAccount,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({ title: 'בקשת המשיכה נשלחה!', description: 'תקבל עדכון תוך 3-5 ימי עסקים.' })
      setWithdrawOpen(false)
      window.location.reload()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה בבקשת המשיכה'
      toast({ title: 'שגיאה', description: message, variant: 'destructive' })
    } finally {
      setWithdrawLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900">הארנק שלי</h1>

      {/* Balance Card */}
      <Card className="shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0">
        <CardContent className="p-8 text-center">
          <div className="inline-flex p-3 rounded-full bg-yellow-500/20 mb-4">
            <Wallet size={32} className="text-yellow-400" />
          </div>
          <p className="text-gray-300 text-sm mb-1">יתרה נוכחית</p>
          <p className="text-5xl font-black text-yellow-400 mb-1">
            {balance.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">נקודות (1 נקודה = 1 ₪)</p>

          {canWithdraw ? (
            <Button
              onClick={() => setWithdrawOpen(true)}
              className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-3 gap-2"
            >
              <ArrowDownToLine size={18} />
              משוך לחשבון הבנק
            </Button>
          ) : (
            <div className="mt-6 text-sm text-gray-400">
              <p>עוד <span className="text-yellow-300 font-bold">{(withdrawalThreshold - balance).toLocaleString()}</span> נקודות ותוכל למשוך מזומן</p>
              <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((balance / withdrawalThreshold) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Requests */}
      {withdrawalRequests.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">בקשות משיכה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withdrawalRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{req.points_amount.toLocaleString()} ₪</p>
                    <p className="text-gray-400 text-xs">{new Date(req.created_at).toLocaleDateString('he-IL')}</p>
                  </div>
                  <Badge className={statusLabels[req.status].color}>
                    {statusLabels[req.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">היסטוריית עסקאות</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 py-8">עדיין אין עסקאות</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map(tx => {
                const meta = typeLabels[tx.type]
                const Icon = meta.icon
                const sign = tx.type === 'earn' ? '+' : '-'

                return (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${meta.color.split(' ')[1]}`}>
                        <Icon size={16} className={meta.color.split(' ')[0]} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{tx.description || meta.label}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('he-IL')}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${tx.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                      {sign}{tx.points.toLocaleString()} נק׳
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent dir="rtl" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>משיכת כסף לחשבון בנק</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800">
              יתרה זמינה: <strong>{balance.toLocaleString()} נקודות</strong>
            </div>

            <div>
              <Label className="block mb-1 text-right">סכום למשיכה (נקודות) *</Label>
              <Input
                type="number"
                required
                min={withdrawalThreshold}
                max={balance}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`מינימום ${withdrawalThreshold}`}
                className="text-right"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block mb-1 text-right">מספר בנק *</Label>
                <Input
                  required
                  value={bankCode}
                  onChange={e => setBankCode(e.target.value)}
                  placeholder="10"
                  maxLength={3}
                  dir="ltr"
                  className="font-mono"
                />
              </div>
              <div>
                <Label className="block mb-1 text-right">מספר סניף *</Label>
                <Input
                  required
                  value={bankBranch}
                  onChange={e => setBankBranch(e.target.value)}
                  placeholder="632"
                  maxLength={5}
                  dir="ltr"
                  className="font-mono"
                />
              </div>
            </div>
            <div>
              <Label className="block mb-1 text-right">מספר חשבון *</Label>
              <Input
                required
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                placeholder="123456789"
                dir="ltr"
                className="font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={withdrawLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-5 gap-2"
            >
              {withdrawLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownToLine size={16} />}
              {withdrawLoading ? 'שולח בקשה...' : 'שלח בקשת משיכה'}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              הבקשה תאושר תוך 3-5 ימי עסקים. הכסף יועבר לחשבון הבנק שלך.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

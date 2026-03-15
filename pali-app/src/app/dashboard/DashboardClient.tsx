'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, CheckCheck, MousePointerClick, ShoppingBag, Coins, Wallet, TrendingUp, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface Stats {
  total_clicks: number
  total_purchases: number
  total_earned: number
  balance: number
  can_withdraw: boolean
}

interface Props {
  stats: Stats
  referralCode: string
  referralUrl: string
  recentClicks: { created_at: string }[]
  recentCommissions: { points_earned: number; created_at: string }[]
}

function buildChartData(
  clicks: { created_at: string }[],
  commissions: { points_earned: number; created_at: string }[]
) {
  const days: Record<string, { date: string; clicks: number; purchases: number }> = {}

  const addDay = (dateStr: string) => {
    const d = new Date(dateStr).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })
    if (!days[d]) days[d] = { date: d, clicks: 0, purchases: 0 }
    return d
  }

  clicks.slice(0, 30).forEach(c => { days[addDay(c.created_at)].clicks++ })
  commissions.slice(0, 30).forEach(c => { days[addDay(c.created_at)].purchases++ })

  return Object.values(days).slice(0, 14)
}

export default function DashboardClient({ stats, referralUrl, recentClicks, recentCommissions }: Props) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const chartData = buildChartData(recentClicks, recentCommissions)

  async function copyLink() {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    toast({ title: 'הקישור הועתק!' })
    setTimeout(() => setCopied(false), 3000)
  }

  const statCards = [
    { label: 'קליקים על הקישור', value: stats.total_clicks.toLocaleString(), icon: MousePointerClick, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'רכישות דרך הקישור', value: stats.total_purchases.toLocaleString(), icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'סה"כ נקודות שנצברו', value: `${stats.total_earned.toLocaleString()} ₪`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'יתרה נוכחית', value: `${stats.balance.toLocaleString()} ₪`, icon: Wallet, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">הדשבורד שלי</h1>
        <Link href="/guide">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink size={14} />
            מדריך לממליץ
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Card key={card.label} className="shadow-sm">
            <CardContent className="p-5">
              <div className={`inline-flex p-2.5 rounded-lg ${card.bg} mb-3`}>
                <card.icon size={20} className={card.color} />
              </div>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral Link */}
      <Card className="shadow-sm border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Coins size={18} className="text-yellow-600" />
            הקישורית האישית שלי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-yellow-200">
            <p className="flex-1 text-sm font-mono text-gray-700 truncate" dir="ltr">
              {referralUrl}
            </p>
            <button
              onClick={copyLink}
              className="flex-shrink-0 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
              {copied ? 'הועתק!' : 'העתק'}
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent('הי! תסתכל על זה ' + referralUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-green-600 hover:bg-green-500 text-white text-sm py-2">שתף בוואטסאפ</Button>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm py-2">שתף בפייסבוק</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal CTA */}
      {stats.can_withdraw && (
        <Card className="shadow-sm border-green-200 bg-green-50">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-green-800">הגעת לסף המשיכה! 🎉</p>
              <p className="text-sm text-green-700">יש לך {stats.balance.toLocaleString()} נקודות – ניתן למשוך לחשבון הבנק</p>
            </div>
            <Link href="/wallet">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-bold flex-shrink-0">
                משוך עכשיו
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">פעילות לאחרונה</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="קליקים"
                />
                <Line
                  type="monotone"
                  dataKey="purchases"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="רכישות"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent commissions */}
      {recentCommissions.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">רכישות אחרונות דרכך</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCommissions.slice(0, 8).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(c.created_at).toLocaleDateString('he-IL')}
                  </span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    +{c.points_earned} נקודות
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

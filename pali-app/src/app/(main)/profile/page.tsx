'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Save, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    bank_code: '',
    bank_branch: '',
    bank_account: '',
  })

  function fetchProfile() {
    return fetch('/api/profile/update')
      .then(r => {
        if (r.status === 404) {
          router.replace('/referrer-required')
          return null
        }
        return r.json()
      })
      .then(data => {
        if (data && !data.error) {
          setForm({
            full_name: data.full_name || '',
            phone: data.phone || '',
            address: data.address || '',
            bank_code: data.bank_code || '',
            bank_branch: data.bank_branch || '',
            bank_account: data.bank_account || '',
          })
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchProfile().finally(() => setInitialLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const { error } = await res.json()
        toast({ title: 'שגיאה בשמירה', description: error, variant: 'destructive' })
      } else {
        await fetchProfile()
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      toast({ title: 'שגיאת רשת', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-yellow-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowRight size={16} className="rtl-flip" />
          חזרה לדשבורד
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-6">הגדרות חשבון</h1>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Personal Info */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User size={18} className="text-yellow-600" />
                פרטים אישיים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="block mb-1 text-right">שם מלא</Label>
                <Input
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="ישראל ישראלי"
                  className="text-right"
                />
              </div>
              <div>
                <Label className="block mb-1 text-right">טלפון</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="050-0000000"
                  className="text-right"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">כתובת למשלוח</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="רחוב, מספר בית, עיר, מיקוד"
                className="text-right"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">פרטי בנק למשיכות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block mb-1 text-right">מספר בנק</Label>
                  <Input
                    value={form.bank_code}
                    onChange={e => setForm(f => ({ ...f, bank_code: e.target.value }))}
                    placeholder="10"
                    maxLength={3}
                    dir="ltr"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label className="block mb-1 text-right">מספר סניף</Label>
                  <Input
                    value={form.bank_branch}
                    onChange={e => setForm(f => ({ ...f, bank_branch: e.target.value }))}
                    placeholder="632"
                    maxLength={5}
                    dir="ltr"
                    className="font-mono"
                  />
                </div>
              </div>
              <div>
                <Label className="block mb-1 text-right">מספר חשבון</Label>
                <Input
                  value={form.bank_account}
                  onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))}
                  placeholder="123456789"
                  dir="ltr"
                  className="font-mono"
                />
              </div>
              <p className="text-xs text-gray-400 text-right">
                הפרטים ישמשו להעברת כסף לחשבון הבנק שלך בעת אישור משיכה
              </p>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading || saved}
            className={`w-full font-bold py-5 gap-2 transition-colors ${
              saved
                ? 'bg-green-500 hover:bg-green-500 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <CheckCircle size={16} />
            ) : (
              <Save size={16} />
            )}
            {loading ? 'שומר...' : saved ? 'הפרטים נשמרו!' : 'שמור שינויים'}
          </Button>
        </form>
      </div>
    </div>
  )
}

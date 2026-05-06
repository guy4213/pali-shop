'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import type { Product } from '@/types'

interface Props {
  initialProducts: Product[]
}

const EMPTY_FORM = {
  name: '', slug: '', description: '', price: '', commission_amount: '', image_url: '', is_visible: false,
}

type FormErrors = Partial<Record<keyof typeof EMPTY_FORM, string>>

function validateForm(form: typeof EMPTY_FORM): FormErrors {
  const errors: FormErrors = {}
  if (form.name.trim().length < 2) errors.name = 'שם חייב להכיל לפחות 2 תווים'
  if (!/^[a-z0-9-]{2,}$/.test(form.slug)) errors.slug = 'אותיות קטנות באנגלית, מספרים ומקפים בלבד (לדוגמה: red-dress-xl)'
  const price = parseFloat(form.price)
  if (!form.price || isNaN(price) || price <= 0) errors.price = 'מחיר חייב להיות מספר חיובי'
  const commission = parseFloat(form.commission_amount)
  if (form.commission_amount === '' || isNaN(commission) || commission < 0) errors.commission_amount = 'עמלה חייבת להיות 0 או יותר'
  return errors
}

export default function AdminProductsTable({ initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const { toast } = useToast()

  function setField<K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function openNew() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setDialogOpen(true)
  }

  function openEdit(p: Product) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: String(p.price),
      commission_amount: String(p.commission_amount),
      image_url: p.image_url || '',
      is_visible: p.is_visible,
    })
    setErrors({})
    setDialogOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validateForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setLoading(true)

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          commission_amount: parseFloat(form.commission_amount),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (editingId) {
        setProducts(prev => prev.map(p => p.id === editingId ? data.product : p))
      } else {
        setProducts(prev => [...prev, data.product])
      }

      toast({ title: editingId ? 'המוצר עודכן' : 'המוצר נוסף!' })
      setDialogOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה'
      toast({ title: 'שגיאה', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function toggleVisible(product: Product) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: !product.is_visible }),
    })
    if (res.ok) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_visible: !p.is_visible } : p))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('למחוק את המוצר?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id))
      toast({ title: 'המוצר נמחק' })
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">ניהול מוצרים</CardTitle>
        <Button onClick={openNew} size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 gap-2">
          <Plus size={16} />
          מוצר חדש
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-gray-600">מוצר</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">מחיר</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">עמלה</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">סטטוס</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-gray-400 text-xs">{product.slug}</p>
                  </td>
                  <td className="py-3 px-4 font-medium">₪{product.price.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="text-green-600 font-medium">₪{product.commission_amount}</span>
                  </td>
                  <td className="py-3 px-4">
                    {product.is_visible ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">גלוי</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">נסתר</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleVisible(product)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                        {product.is_visible ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => openEdit(product)} className="p-1.5 rounded hover:bg-blue-50 text-blue-500">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent dir="rtl" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'עריכת מוצר' : 'מוצר חדש'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block mb-1 text-right">שם מוצר *</Label>
                <Input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  className={`text-right ${errors.name ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label className="block mb-1 text-right">Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={e => setField('slug', e.target.value)}
                  dir="ltr"
                  placeholder="product-slug"
                  className={errors.slug ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {errors.slug
                  ? <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
                  : <p className="text-xs text-gray-400 mt-1" dir="ltr">לדוגמה: <span className="font-mono">red-dress-xl</span></p>
                }
              </div>
            </div>

            <div>
              <Label className="block mb-1 text-right">תיאור</Label>
              <Textarea value={form.description} onChange={e => setField('description', e.target.value)} className="text-right" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block mb-1 text-right">מחיר (₪) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => setField('price', e.target.value)}
                  className={errors.price ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
              <div>
                <Label className="block mb-1 text-right">עמלה (₪) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.commission_amount}
                  onChange={e => setField('commission_amount', e.target.value)}
                  className={errors.commission_amount ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {errors.commission_amount && <p className="text-xs text-red-500 mt-1">{errors.commission_amount}</p>}
              </div>
            </div>

            <div>
              <Label className="block mb-1 text-right">URL תמונה</Label>
              <Input value={form.image_url} onChange={e => setField('image_url', e.target.value)} dir="ltr" placeholder="/images/product.jpg" />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, is_visible: !f.is_visible }))}
                className={`w-10 h-6 rounded-full transition-colors ${form.is_visible ? 'bg-yellow-500' : 'bg-gray-200'}`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 ${form.is_visible ? 'translate-x-4' : ''}`} />
              </button>
              <Label className="cursor-pointer" onClick={() => setForm(f => ({ ...f, is_visible: !f.is_visible }))}>
                {form.is_visible ? 'גלוי לציבור' : 'נסתר (גישה דרך קישור בלבד)'}
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {editingId ? 'עדכן' : 'הוסף מוצר'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="gap-2">
                <X size={16} />
                ביטול
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

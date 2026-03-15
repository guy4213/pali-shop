import Link from 'next/link'
import { SearchX, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  let products: Product[] = []

  if (query) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    products = data ?? []
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">
          {query ? `תוצאות חיפוש עבור "${query}"` : 'חיפוש מוצרים'}
        </h1>
        {query && (
          <p className="text-sm text-gray-500 mb-6">
            {products.length > 0
              ? `נמצאו ${products.length} תוצאות`
              : 'לא נמצאו תוצאות'}
          </p>
        )}

        {!query && (
          <p className="text-gray-500 mt-8 text-center">הזן מילת חיפוש בשורת החיפוש למעלה</p>
        )}

        {query && products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <SearchX size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">לא נמצאו מוצרים</p>
            <p className="text-sm mt-1">נסה מילת חיפוש אחרת</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <Link
                key={product.id}
                href={`/share/${product.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <ShoppingBag size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-bold text-gray-900 text-right">{product.name}</h2>
                  {product.description && (
                    <p className="text-sm text-gray-500 mt-1 text-right line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <p className="text-lg font-black text-yellow-600 mt-2 text-right">
                    ₪{product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

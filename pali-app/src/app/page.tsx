import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductPage from '@/components/product/ProductPage'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      <Header userEmail={user?.email} />
      <main className="flex-1">
        {product ? (
          <ProductPage product={product} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">החנות בבנייה</h2>
            <p className="text-gray-500">מוצרים חדשים יגיעו בקרוב. הישאר מעודכן!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

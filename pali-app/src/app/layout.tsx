import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp'
import { CartProvider } from '@/components/providers/CartProvider'

export const metadata: Metadata = {
  title: 'PALI – חנות עם רווח שגדל',
  description: 'המלץ, שתף, והרווח. מערכת שותפים מדורגת עם תגמול אמיתי.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-white text-gray-900 min-h-screen">
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster />
        <FloatingWhatsApp />
      </body>
    </html>
  )
}

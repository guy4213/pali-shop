import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import ChatWidget from '@/components/chat/ChatWidget'
import { CartProvider } from '@/components/providers/CartProvider'
import { UserProvider } from '@/components/providers/UserProvider'

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
         <UserProvider>
        <CartProvider>
          {children}
        </CartProvider>
        </UserProvider>
        <Toaster />
        <ChatWidget />
      </body>
    </html>
  )
}

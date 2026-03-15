'use client'

import { MessageCircle } from 'lucide-react'

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/972500000000"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-transform hover:scale-110"
      aria-label="צ'אט בווטסאפ"
    >
      <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-50 animate-ping" />
      <MessageCircle size={28} fill="white" />
    </a>
  )
}

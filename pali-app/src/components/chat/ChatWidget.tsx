'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

const INITIAL_MESSAGES: Message[] = [
  { role: 'assistant', content: 'שלום! איך אפשר לעזור? 😊' }
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const allMessages = [...messages, userMessage]
    setMessages(allMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      if (data.escalate) setEscalated(true)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'מצטערים, אירעה שגיאה. נסה שוב.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {open && (
        <div className="fixed bottom-20 left-4 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-l from-yellow-500 to-amber-500 px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-yellow-100 transition-colors"
              aria-label="סגור צ׳אט"
            >
              <X size={20} />
            </button>
            <span className="font-bold text-white">PALI — שירות לקוחות</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'ml-8 bg-yellow-500 text-white rounded-2xl rounded-tr-sm self-end'
                      : 'mr-8 bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm self-start'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="mr-8 bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 text-sm self-start">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Escalation banner or input */}
          {escalated ? (
            <div className="bg-amber-50 border-t border-amber-200 px-4 py-3 text-center">
              <span className="text-amber-800 text-sm font-medium">נציג שירות יחזור אליך בהקדם 👋</span>
            </div>
          ) : (
            <div className="border-t border-gray-100 p-3 flex gap-2">
              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors"
                aria-label="שלח"
              >
                <Send size={16} />
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="שאל/י אותנו..."
                dir="rtl"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center shadow-lg transition-colors"
        aria-label={open ? 'סגור צ׳אט' : 'פתח צ׳אט'}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}

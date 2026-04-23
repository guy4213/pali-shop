'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Message = { role: 'user' | 'assistant'; content: string }
type Phase = 'chat' | 'escalation_form' | 'escalation_sent'

const INITIAL_MESSAGES: Message[] = [
  { role: 'assistant', content: 'שלום! איך אפשר לעזור? 😊' },
]

const PHONE_RE = /^(\+972|972|0)5\d{8}$/

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('chat')
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  // Escalation form
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formSummary, setFormSummary] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Post-submit
  const [ticketId, setTicketId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Prefill form with referrer profile data if logged in
  // useUser() only exposes { userEmail, isAdmin, balance }, so we fetch directly
  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('referrers')
          .select('full_name, phone')
          .eq('user_id', user.id)
          .single()
        if (data?.full_name) setFormName(data.full_name)
        if (data?.phone) setFormPhone(data.phone)
      } catch {
        // Not logged in or no referrer profile — leave blank
      }
    }
    fetchProfile()
  }, [])

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
        body: JSON.stringify({ messages: allMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      if (data.escalate) {
        setFormSummary(text.slice(0, 200))
        setPhase('escalation_form')
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'מצטערים, אירעה שגיאה. נסה שוב.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleEscalateClick() {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? ''
    setFormSummary(lastUserMsg.slice(0, 200))
    setPhase('escalation_form')
  }

  async function submitEscalation() {
    setFormError(null)
    const name = formName.trim()
    const phone = formPhone.replace(/[\s-]/g, '')
    const summary = formSummary.trim()

    if (name.length < 2 || name.length > 100) {
      setFormError('נא למלא שם מלא')
      return
    }
    if (!PHONE_RE.test(phone)) {
      setFormError('מספר טלפון לא תקין (לדוגמה 0501234567)')
      return
    }
    if (summary.length < 5 || summary.length > 500) {
      setFormError('נא לתאר את הבעיה בקצרה')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/chat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_name: name,
          buyer_phone: phone,
          buyer_email: undefined,
          issue_summary: summary,
          chat_history: messages,
        }),
      })
      const data = await res.json()
      if (res.status >= 500) {
        setFormError('שגיאה, נסה שוב בעוד רגע')
      } else if (!res.ok) {
        setFormError(data.error || 'שגיאה, נסה שוב')
      } else {
        setTicketId(data.ticket_id)
        setPhase('escalation_sent')
      }
    } catch {
      setFormError('שגיאה, נסה שוב בעוד רגע')
    } finally {
      setSubmitting(false)
    }
  }

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER

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

          {/* ── Chat phase ─────────────────────────────────────────────────── */}
          {phase === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      dir="rtl"
                      className={`px-4 py-2 text-sm max-w-[75%] ${
                        msg.role === 'user'
                          ? 'bg-yellow-500 text-white rounded-2xl rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 text-sm">
                      <span className="animate-pulse">...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-100 p-3">
                <div className="flex gap-2">
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
                    lang="he"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={handleEscalateClick}
                    className="text-xs text-gray-400 hover:text-gray-600 underline mt-1"
                    aria-label="פנייה לנציג אנושי"
                  >
                    דבר/י עם נציג אנושי
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Escalation form phase ───────────────────────────────────────── */}
          {phase === 'escalation_form' && (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" dir="rtl" lang="he">
              <h2 className="text-base font-bold text-gray-800">פרטי יצירת קשר</h2>

              <div className="flex flex-col gap-1">
                <label htmlFor="esc-name" className="text-sm text-gray-700">שם מלא</label>
                <input
                  id="esc-name"
                  type="text"
                  dir="rtl"
                  lang="he"
                  autoComplete="name"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="esc-phone" className="text-sm text-gray-700">טלפון</label>
                <input
                  id="esc-phone"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="050-0000000"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="esc-summary" className="text-sm text-gray-700">במה אפשר לעזור?</label>
                <textarea
                  id="esc-summary"
                  rows={3}
                  dir="rtl"
                  lang="he"
                  maxLength={500}
                  value={formSummary}
                  onChange={e => setFormSummary(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                />
              </div>

              {formError && (
                <p className="text-red-500 text-xs">{formError}</p>
              )}

              <div className="flex gap-2 justify-start mt-1">
                <button
                  type="button"
                  onClick={submitEscalation}
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-1"
                  aria-label="שלח פנייה"
                >
                  {submitting && (
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  )}
                  שלח
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('chat')}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                  aria-label="חזור לצ׳אט"
                >
                  חזור
                </button>
              </div>
            </div>
          )}

          {/* ── Escalation sent phase ───────────────────────────────────────── */}
          {phase === 'escalation_sent' && ticketId && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 text-center" dir="rtl" lang="he">
              <div className="text-green-500 text-4xl" aria-hidden="true">✓</div>
              <p className="text-gray-800 font-semibold text-base">פרטיך התקבלו!</p>
              <p className="text-gray-500 text-sm">
                מספר פנייה:{' '}
                <span className="font-mono font-bold">{ticketId.slice(0, 8).toUpperCase()}</span>
              </p>
              {waNumber ? (
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                    `שלום, שמי ${formName.trim()}.\nיש לי פנייה בנושא: ${formSummary.trim()}\nמספר פנייה: ${ticketId.slice(0, 8).toUpperCase()}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  aria-label="המשך שיחה ב-WhatsApp"
                >
                  המשך ב-WhatsApp ←
                </a>
              ) : (
                <p className="text-gray-500 text-sm">נציג יחזור אליך בהקדם 👋</p>
              )}
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

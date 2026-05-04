'use client'

import { useEffect, useRef } from 'react'

export default function ReferralTracker({ code }: { code: string }) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    fetch('/api/referral/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userAgent: navigator.userAgent }),
    }).catch(() => {/* silent */})
  }, [code])

  return null
}

'use client'

import { useEffect } from 'react'

export default function ReferralTracker({ code }: { code: string }) {
  useEffect(() => {
    fetch('/api/referral/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userAgent: navigator.userAgent }),
    }).catch(() => {/* silent */})
  }, [code])

  return null
}

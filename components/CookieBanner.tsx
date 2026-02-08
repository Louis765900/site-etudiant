'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Small delay so the banner animates in after page load
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    document.cookie = 'cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax'
    setVisible(false)
  }

  const dismiss = () => {
    localStorage.setItem('cookie_consent', 'dismissed')
    document.cookie = 'cookie_consent=dismissed; path=/; max-age=31536000; SameSite=Lax'
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1 text-sm text-gray-600">
          <p>
            StudyFlow utilise uniquement des <strong>cookies techniques</strong> nécessaires au fonctionnement du site (authentification).
            Aucun cookie publicitaire n&apos;est utilisé.{' '}
            <Link href="/legal/privacy#cookies" className="text-indigo-600 hover:underline font-medium">
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={accept}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Accepter
          </button>
          <button
            onClick={dismiss}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { User, LogOut, Settings, LayoutDashboard, CheckSquare, MessageSquare } from 'lucide-react'

const clearAuthCookie = () => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export function AuthButton() {
  const router = useRouter()
  const { user, profile, loading } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut(auth)
      clearAuthCookie()
      setIsOpen(false)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (!user) {
    return (
      <Link 
        href="/auth/login" 
        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
      >
        Se connecter
      </Link>
    )
  }

  const initials = profile?.first_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
  const displayName = profile?.first_name || user.email?.split('@')[0] || 'Utilisateur'

  return (
    <div ref={dropdownRef} className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-3 focus:outline-none group"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
          {initials}
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden animate-fade-in-scale">
          {/* User Header */}
          <div className="px-4 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                {profile?.filiere && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    {profile.filiere}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link 
              href="/app/dashboard" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Tableau de bord</span>
            </Link>
            <Link 
              href="/app/dashboard/tasks" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <CheckSquare className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Mes devoirs</span>
            </Link>
            <Link 
              href="/app/dashboard/ai-chat" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Assistant IA</span>
            </Link>
            <Link 
              href="/app/onboarding/personality-test" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Mon profil</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-2">
            <button 
              onClick={handleLogout} 
              disabled={loggingOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{loggingOut ? 'Déconnexion...' : 'Se déconnecter'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

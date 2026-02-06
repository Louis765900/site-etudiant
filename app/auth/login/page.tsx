'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth, googleProvider } from '@/lib/firebase'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth'
import { Sparkles, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

const setAuthCookie = (token: string) => {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

const getErrorMessage = (errorCode: string): string => {
  const errors: Record<string, string> = {
    'auth/invalid-email': 'Adresse email invalide',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/invalid-credential': 'Email ou mot de passe incorrect',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
    'auth/popup-closed-by-user': 'Connexion Google annulée',
    'auth/cancelled-popup-request': 'Une autre fenêtre de connexion est déjà ouverte',
    'auth/popup-blocked': 'La fenêtre popup a été bloquée. Autorisez les popups pour ce site',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre internet',
  }
  return errors[errorCode] || 'Une erreur est survenue. Veuillez réessayer'
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const hasRedirected = useRef(false)

  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'signup_success') {
      setSuccessMessage('Compte créé avec succès ! Connecte-toi pour continuer.')
    }
  }, [searchParams])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !hasRedirected.current) {
        hasRedirected.current = true
        const token = await user.getIdToken()
        setAuthCookie(token)
        router.replace('/app/dashboard')
      } else {
        setCheckingAuth(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const token = await result.user.getIdToken()
      setAuthCookie(token)
      router.replace('/app/dashboard')
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string }
      setError(getErrorMessage(firebaseErr?.code || ''))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken()
      setAuthCookie(token)
      router.replace('/app/dashboard')
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string }
      if (firebaseErr?.code !== 'auth/cancelled-popup-request' && firebaseErr?.code !== 'auth/popup-closed-by-user') {
        setError(getErrorMessage(firebaseErr?.code || ''))
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin delay-150 opacity-50" />
          </div>
          <p className="text-gray-500 font-medium">Vérification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              StudyFlow
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-center">
            <h1 className="text-2xl font-bold text-white">Connexion</h1>
            <p className="text-indigo-100 mt-1">Content de te revoir !</p>
          </div>

          <div className="p-8">
            {/* Success message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <p className="text-emerald-700 font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <p className="text-rose-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white"
                  placeholder="ton@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white pr-12"
                    placeholder="Ton mot de passe"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">ou</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-bold py-4 rounded-xl transition-all"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {googleLoading ? 'Connexion...' : 'Continuer avec Google'}
            </button>

            {/* Signup link */}
            <p className="mt-8 text-center text-gray-600">
              Pas encore de compte ?{' '}
              <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}

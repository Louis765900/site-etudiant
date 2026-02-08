'use client'

import { useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Sparkles, ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react'

const getErrorMessage = (errorCode: string): string => {
  const errors: Record<string, string> = {
    'auth/invalid-email': 'Adresse email invalide',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez dans quelques minutes',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre internet',
  }
  return errors[errorCode] || 'Une erreur est survenue. Veuillez réessayer'
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string }
      setError(getErrorMessage(firebaseErr?.code || ''))
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-2xl font-bold text-white">Mot de passe oublié</h1>
            <p className="text-indigo-100 mt-1">Pas de panique, on gère !</p>
          </div>

          <div className="p-8">
            {sent ? (
              /* Success state */
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Email envoyé !</h2>
                <p className="text-gray-600">
                  Un lien de réinitialisation a été envoyé à{' '}
                  <span className="font-semibold text-indigo-600">{email}</span>.
                  Vérifie ta boîte de réception (et tes spams).
                </p>
                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => { setSent(false); setEmail('') }}
                    className="w-full py-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all"
                  >
                    Utiliser une autre adresse
                  </button>
                  <Link
                    href="/auth/login"
                    className="block w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-center"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              </div>
            ) : (
              /* Form state */
              <>
                <p className="text-gray-600 mb-6">
                  Entre ton adresse email et on t&apos;enverra un lien pour réinitialiser ton mot de passe.
                </p>

                {/* Error */}
                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <p className="text-rose-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
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
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                  </button>
                </form>

                <Link
                  href="/auth/login"
                  className="mt-6 flex items-center justify-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

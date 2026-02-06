'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { FILIERES, CATEGORIES, getFilieresByCategory } from '@/lib/filieres'
import { ChevronLeft, ChevronRight, Sparkles, Eye, EyeOff, Search } from 'lucide-react'

const getErrorMessage = (errorCode: string): string => {
  const errors: Record<string, string> = {
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
    'auth/invalid-email': 'Adresse email invalide',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
    'auth/operation-not-allowed': 'L\'inscription est désactivée',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre internet',
  }
  return errors[errorCode] || 'Une erreur est survenue. Veuillez réessayer'
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    birthDate: '',
    filiere: '',
    parentEmail: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(formData.birthDate)
  const isMinor = age > 0 && age < 15

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      setError('Veuillez entrer votre prénom')
      return false
    }
    if (!formData.birthDate) {
      setError('Veuillez entrer votre date de naissance')
      return false
    }
    if (!formData.filiere) {
      setError('Veuillez sélectionner votre filière')
      return false
    }
    if (isMinor && !formData.parentEmail) {
      setError('L\'email du parent est requis pour les moins de 15 ans')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.email.trim()) {
      setError('Veuillez entrer votre email')
      return false
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return false
    }
    if (!agreeTerms) {
      setError('Vous devez accepter les conditions générales')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2)
      setError('')
    }
  }

  const handlePrevStep = () => {
    setStep(1)
    setError('')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const uid = userCredential.user.uid

      await setDoc(doc(db, 'profiles', uid), {
        id: uid,
        first_name: formData.firstName.trim(),
        birth_date: formData.birthDate,
        filiere: formData.filiere,
        parent_email: isMinor ? formData.parentEmail : null,
        parental_consent_validated: false,
        learning_style: null,
        preferences: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      await auth.signOut()
      router.push('/auth/login?message=signup_success')
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string }
      setError(getErrorMessage(firebaseErr?.code || ''))
    } finally {
      setLoading(false)
    }
  }

  const filteredFilieres = searchQuery
    ? FILIERES.filter(f => 
        f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory
    ? getFilieresByCategory(selectedCategory)
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">
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
          {/* Progress Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                step >= 1 ? 'bg-white text-indigo-600' : 'bg-white/30 text-white'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 rounded-full transition-all ${
                step >= 2 ? 'bg-white' : 'bg-white/30'
              }`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                step >= 2 ? 'bg-white text-indigo-600' : 'bg-white/30 text-white'
              }`}>
                2
              </div>
            </div>
            <p className="text-center text-indigo-100 mt-3 text-sm">
              {step === 1 ? 'Informations personnelles' : 'Création du compte'}
            </p>
          </div>

          <div className="p-8">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm">
                    !
                  </div>
                  <p className="text-rose-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-6 animate-fade-in">
                {/* Prénom */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white"
                    placeholder="Ton prénom"
                    autoComplete="given-name"
                  />
                </div>

                {/* Date de naissance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white"
                  />
                  {age > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tu as {age} ans
                    </p>
                  )}
                </div>

                {/* Filière */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Filière / Niveau d'études
                  </label>
                  
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une filière..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setSelectedCategory('')
                      }}
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                    />
                  </div>

                  {/* Category tabs */}
                  {!searchQuery && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            selectedCategory === cat.id
                              ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                          }`}
                        >
                          {cat.icon} {cat.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Filières list */}
                  <select
                    name="filiere"
                    value={formData.filiere}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white"
                    size={searchQuery || selectedCategory ? 6 : 1}
                  >
                    <option value="">{searchQuery || selectedCategory ? 'Sélectionne une filière' : 'Choisis une catégorie ou recherche'}</option>
                    {(searchQuery || selectedCategory) && filteredFilieres.map((filiere) => (
                      <option key={filiere.value} value={filiere.value}>
                        {filiere.label} {filiere.description ? `- ${filiere.description}` : ''}
                      </option>
                    ))}
                  </select>
                  {(searchQuery || selectedCategory) && filteredFilieres.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Aucune filière trouvée. Essaie une autre recherche.
                    </p>
                  )}
                </div>

                {/* Parent email for minors */}
                {isMinor && (
                  <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl animate-fade-in">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-lg">
                        ⚠️
                      </div>
                      <div className="flex-1">
                        <p className="text-amber-800 font-semibold mb-2">
                          Consentement parental requis
                        </p>
                        <p className="text-sm text-amber-700 mb-3">
                          Tu es mineur. Un consentement parental est nécessaire.
                        </p>
                        <input
                          type="email"
                          name="parentEmail"
                          value={formData.parentEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all bg-white"
                          placeholder="Email du parent ou tuteur"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Continuer
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-6 animate-fade-in">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white"
                    placeholder="ton@email.com"
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
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white pr-12"
                      placeholder="Minimum 6 caractères"
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white pr-12"
                      placeholder="Confirme ton mot de passe"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    J'accepte les{' '}
                    <span className="text-indigo-600 font-medium">conditions générales</span>
                    {' '}et la{' '}
                    <span className="text-indigo-600 font-medium">politique de confidentialité</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 px-4 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Création...
                      </span>
                    ) : (
                      'Créer mon compte'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Login link */}
            <p className="mt-8 text-center text-gray-600">
              Tu as déjà un compte ?{' '}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

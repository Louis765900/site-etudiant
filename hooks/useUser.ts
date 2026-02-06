import { useEffect, useState, useCallback } from 'react'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

const setAuthCookie = (token: string) => {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

const clearAuthCookie = () => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export function useUser() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshToken = useCallback(async () => {
    if (user) {
      try {
        const token = await user.getIdToken(true)
        setAuthCookie(token)
      } catch (err) {
        console.error('Error refreshing token:', err)
      }
    }
  }, [user])

  useEffect(() => {
    let isMounted = true
    let unsubscribeProfile: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      if (!isMounted) return

      try {
        if (u) {
          setUser(u)

          // Token cookie (Firebase gere le refresh automatiquement)
          const token = await u.getIdToken()
          setAuthCookie(token)

          // Ecouter le profil en temps reel
          const profileRef = doc(db, 'profiles', u.uid)
          unsubscribeProfile = onSnapshot(profileRef, (snap) => {
            if (isMounted) {
              setProfile(snap.exists() ? (snap.data() as Profile) : null)
              setLoading(false)
            }
          }, (err) => {
            if (isMounted) {
              console.error('Profile snapshot error:', err)
              setError(err instanceof Error ? err : new Error('Profile error'))
              setLoading(false)
            }
          })
        } else {
          setUser(null)
          setProfile(null)
          clearAuthCookie()
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      unsubscribeAuth()
      if (unsubscribeProfile) unsubscribeProfile()
    }
  }, [])

  return { user, profile, loading, error, refreshToken }
}

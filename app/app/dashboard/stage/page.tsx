'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@/hooks/useUser'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import {
  Plus,
  Clock,
  Calendar,
  FileText,
  Edit2,
  Trash2,
  X,
  Briefcase,
  TrendingUp,
  Target,
} from 'lucide-react'

interface StageActivity {
  id: string
  user_id: string
  hours_worked: number
  description: string | null
  activity_date: string
  created_at: string
}

export default function StagePage() {
  const { user, loading } = useUser()
  const [activities, setActivities] = useState<StageActivity[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<StageActivity | null>(null)
  const [formData, setFormData] = useState({
    hours_worked: '',
    description: '',
    activity_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'stage_activities'),
      where('user_id', '==', user.uid),
      orderBy('activity_date', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as StageActivity))
      setActivities(data)
      setDataLoaded(true)
    }, () => {
      setDataLoaded(true)
    })

    return () => unsub()
  }, [user])

  const handleOpenModal = useCallback((activity?: StageActivity) => {
    if (activity) {
      setEditingActivity(activity)
      setFormData({
        hours_worked: activity.hours_worked.toString(),
        description: activity.description || '',
        activity_date: activity.activity_date || new Date().toISOString().split('T')[0],
      })
    } else {
      setEditingActivity(null)
      setFormData({
        hours_worked: '',
        description: '',
        activity_date: new Date().toISOString().split('T')[0],
      })
    }
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingActivity(null)
    setFormData({
      hours_worked: '',
      description: '',
      activity_date: new Date().toISOString().split('T')[0],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.hours_worked || !formData.activity_date) return

    const hours = parseFloat(formData.hours_worked)
    if (isNaN(hours) || hours <= 0 || hours > 24) return

    try {
      if (editingActivity) {
        await updateDoc(doc(db, 'stage_activities', editingActivity.id), {
          hours_worked: hours,
          description: formData.description || null,
          activity_date: formData.activity_date,
        })
      } else {
        await addDoc(collection(db, 'stage_activities'), {
          user_id: user.uid,
          hours_worked: hours,
          description: formData.description || null,
          activity_date: formData.activity_date,
          created_at: Timestamp.now(),
        })
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving activity:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette activite ?')) return
    try {
      await deleteDoc(doc(db, 'stage_activities', id))
    } catch (error) {
      console.error('Error deleting activity:', error)
    }
  }

  const totalHours = activities.reduce((sum, a) => sum + a.hours_worked, 0)
  const thisWeekHours = activities
    .filter((a) => {
      const date = new Date(a.activity_date)
      const now = new Date()
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    })
    .reduce((sum, a) => sum + a.hours_worked, 0)
  const avgHoursPerDay = activities.length > 0
    ? totalHours / new Set(activities.map(a => a.activity_date)).size
    : 0

  if (loading || (!dataLoaded && user)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Chargement des heures de stage...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Heures de stage</h1>
          <p className="text-gray-600 mt-1">
            Suivi de tes heures et activites de stage
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Ajouter des heures
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <p className="text-3xl font-bold text-emerald-700">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Cette semaine</span>
          </div>
          <p className="text-3xl font-bold text-blue-700">{thisWeekHours.toFixed(1)}h</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Moyenne / jour</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">{avgHoursPerDay.toFixed(1)}h</p>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Journal de stage</h2>
              <p className="text-sm text-gray-500">{activities.length} entree{activities.length !== 1 ? 's' : ''} enregistree{activities.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune heure enregistree</h3>
            <p className="text-gray-500 mb-4">Commence a enregistrer tes heures de stage.</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter ma premiere entree
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 sm:p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-emerald-600">{activity.hours_worked}h</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(activity.activity_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {activity.description && (
                    <div className="flex items-start gap-2 mt-1">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(activity)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-fade-in-scale">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingActivity ? 'Modifier l\'entree' : 'Nouvelle entree'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre d&apos;heures
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={formData.hours_worked}
                  onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  placeholder="Ex: 7.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.activity_date}
                  onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                  rows={3}
                  placeholder="Qu'as-tu fait aujourd'hui ?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all"
                >
                  {editingActivity ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

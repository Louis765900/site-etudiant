'use client'

import { useEffect, useState } from 'react'
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
  Calendar,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  X,
  Search,
  BookOpen,
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  subject: string | null
  deadline: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

type FilterType = 'all' | 'todo' | 'completed' | 'urgent'

const PRIORITIES = [
  { value: 'low', label: 'Basse', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { value: 'medium', label: 'Moyenne', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { value: 'high', label: 'Haute', color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
]

const SUBJECTS = [
  'Mathematiques',
  'Francais',
  'Anglais',
  'Histoire-Geographie',
  'Physique-Chimie',
  'SVT',
  'Philosophie',
  'SES',
  'NSI / Informatique',
  'Espagnol',
  'Allemand',
  'Arts',
  'EPS',
  'Autre',
]

export default function TasksPage() {
  const { user, loading } = useUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  })
  const [tasksLoading, setTasksLoading] = useState(true)

  // Real-time listener with onSnapshot
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'tasks'),
      where('user_id', '==', user.uid),
      orderBy('deadline', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task))
      setTasks(data)
      setTasksLoading(false)
    }, () => {
      setTasksLoading(false)
    })

    return () => unsub()
  }, [user])

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task)
      setFormData({
        title: task.title,
        description: task.description || '',
        subject: task.subject || '',
        deadline: task.deadline,
        priority: task.priority,
      })
    } else {
      setEditingTask(null)
      setFormData({
        title: '',
        description: '',
        subject: '',
        deadline: '',
        priority: 'medium',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      subject: '',
      deadline: '',
      priority: 'medium',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title || !formData.deadline) return

    try {
      if (editingTask) {
        await updateDoc(doc(db, 'tasks', editingTask.id), {
          title: formData.title,
          description: formData.description || null,
          subject: formData.subject || null,
          deadline: formData.deadline,
          priority: formData.priority,
        })
      } else {
        await addDoc(collection(db, 'tasks'), {
          user_id: user.uid,
          title: formData.title,
          description: formData.description || null,
          subject: formData.subject || null,
          deadline: formData.deadline,
          priority: formData.priority,
          completed: false,
          created_at: Timestamp.now(),
        })
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { completed: !completed })
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Es-tu sur de vouloir supprimer ce devoir ?')) return

    try {
      await deleteDoc(doc(db, 'tasks', taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleDuplicateTask = async (task: Task) => {
    if (!user) return
    try {
      await addDoc(collection(db, 'tasks'), {
        user_id: user.uid,
        title: task.title + ' (copie)',
        description: task.description,
        subject: task.subject,
        deadline: task.deadline,
        priority: task.priority,
        completed: false,
        created_at: Timestamp.now(),
      })
    } catch (error) {
      console.error('Error duplicating task:', error)
    }
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    if (filter === 'todo') {
      filtered = filtered.filter((t) => !t.completed)
    } else if (filter === 'completed') {
      filtered = filtered.filter((t) => t.completed)
    } else if (filter === 'urgent') {
      filtered = filtered.filter((t) => !t.completed && t.priority === 'high')
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
      )
    }

    return filtered
  }

  const groupTasksByDate = (tasksToGroup: Task[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    const groups: { [key: string]: Task[] } = {
      'En retard': [],
      'Aujourd\'hui': [],
      'Demain': [],
      'Cette semaine': [],
      'Plus tard': [],
    }

    tasksToGroup.forEach((task) => {
      const taskDate = new Date(task.deadline)
      taskDate.setHours(0, 0, 0, 0)

      if (taskDate < today && !task.completed) {
        groups['En retard'].push(task)
      } else if (taskDate.getTime() === today.getTime()) {
        groups['Aujourd\'hui'].push(task)
      } else if (taskDate.getTime() === tomorrow.getTime()) {
        groups['Demain'].push(task)
      } else if (taskDate <= endOfWeek) {
        groups['Cette semaine'].push(task)
      } else {
        groups['Plus tard'].push(task)
      }
    })

    return groups
  }

  const filteredTasks = getFilteredTasks()
  const groupedTasks = groupTasksByDate(filteredTasks)
  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Chargement des devoirs...</p>
        </div>
      </div>
    )
  }

  const getPriorityStyle = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1]
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes devoirs</h1>
          <p className="text-gray-600 mt-1">
            {completedCount} sur {totalCount} termines - {progress}% de progression
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Nouveau devoir
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-700">Progression globale</span>
          <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un devoir..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'todo', 'completed', 'urgent'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {f === 'all' && 'Tous'}
              {f === 'todo' && 'A faire'}
              {f === 'completed' && 'Termines'}
              {f === 'urgent' && 'Urgents'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          groupTasks.length > 0 && (
            <div key={groupName}>
              <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${
                groupName === 'En retard' ? 'text-rose-600' : 'text-gray-500'
              }`}>
                {groupName} ({groupTasks.length})
              </h2>
              <div className="space-y-3">
                {groupTasks.map((task) => {
                  const priorityStyle = getPriorityStyle(task.priority)
                  return (
                    <div
                      key={task.id}
                      className={`group bg-white rounded-2xl p-4 shadow-sm border-2 transition-all hover:shadow-md ${
                        task.completed ? 'border-gray-100 opacity-75' : 'border-gray-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleComplete(task.id, task.completed)}
                          className="mt-1 flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300 hover:text-indigo-500 transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-lg ${
                            task.completed ? 'line-through text-gray-400' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${priorityStyle.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                              {priorityStyle.label}
                            </span>
                            {task.subject && (
                              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <BookOpen className="w-3 h-3" />
                                {task.subject}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {new Date(task.deadline).toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDuplicateTask(task)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Dupliquer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(task)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'Aucun devoir trouve' : 'Pas de devoirs !'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery
                ? 'Essaye une autre recherche ou modifie tes filtres.'
                : 'Profite de ton temps libre ou ajoute de nouveaux devoirs a ta liste.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => handleOpenModal()}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Ajouter un devoir
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in-scale">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTask ? 'Modifier le devoir' : 'Nouveau devoir'}
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
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  placeholder="Ex: Reviser le chapitre 3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Matiere (optionnelle)
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                >
                  <option value="">Selectionner une matiere</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                  rows={3}
                  placeholder="Ajoute des details..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date d&apos;echeance
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priorite
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p.value as 'low' | 'medium' | 'high' })}
                      className={`px-4 py-3 rounded-xl font-medium transition-all border-2 ${
                        formData.priority === p.value
                          ? p.color
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all"
                >
                  {editingTask ? 'Enregistrer' : 'Creer'}
                </button>
              </div>

              {editingTask && (
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteTask(editingTask.id)
                    handleCloseModal()
                  }}
                  className="w-full px-4 py-3 text-rose-600 border-2 border-rose-200 rounded-xl hover:bg-rose-50 font-semibold transition-colors text-sm"
                >
                  Supprimer ce devoir
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

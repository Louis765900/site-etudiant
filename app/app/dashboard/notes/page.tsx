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
  FileText,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  BookOpen,
  StickyNote,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface Note {
  id: string
  user_id: string
  title: string
  content: string
  subject: string | null
  color: string
  created_at: string
  updated_at: string
}

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
  'Autre',
]

const COLORS = [
  { value: 'indigo', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  { value: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  { value: 'rose', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  { value: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  { value: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { value: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
]

function getColorStyle(colorValue: string) {
  return COLORS.find(c => c.value === colorValue) || COLORS[0]
}

export default function NotesPage() {
  const { user, loading } = useUser()
  const [notes, setNotes] = useState<Note[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [expandedNote, setExpandedNote] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject: '',
    color: 'indigo',
  })

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'notes'),
      where('user_id', '==', user.uid),
      orderBy('updated_at', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Note))
      setNotes(data)
      setDataLoaded(true)
    }, () => {
      setDataLoaded(true)
    })

    return () => unsub()
  }, [user])

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note)
      setFormData({
        title: note.title,
        content: note.content,
        subject: note.subject || '',
        color: note.color || 'indigo',
      })
    } else {
      setEditingNote(null)
      setFormData({
        title: '',
        content: '',
        subject: '',
        color: 'indigo',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingNote(null)
    setFormData({ title: '', content: '', subject: '', color: 'indigo' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title.trim() || !formData.content.trim()) return

    try {
      const now = Timestamp.now()
      if (editingNote) {
        await updateDoc(doc(db, 'notes', editingNote.id), {
          title: formData.title.trim(),
          content: formData.content.trim(),
          subject: formData.subject || null,
          color: formData.color,
          updated_at: now,
        })
      } else {
        await addDoc(collection(db, 'notes'), {
          user_id: user.uid,
          title: formData.title.trim(),
          content: formData.content.trim(),
          subject: formData.subject || null,
          color: formData.color,
          created_at: now,
          updated_at: now,
        })
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Supprimer cette note ?')) return
    try {
      await deleteDoc(doc(db, 'notes', noteId))
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = !subjectFilter || note.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  // Get unique subjects from notes
  const usedSubjects = [...new Set(notes.map(n => n.subject).filter(Boolean))] as string[]

  if (loading || (!dataLoaded && user)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Chargement des notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes notes</h1>
          <p className="text-gray-600 mt-1">
            {notes.length} note{notes.length !== 1 ? 's' : ''} de cours
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Nouvelle note
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
          />
        </div>
        {usedSubjects.length > 0 && (
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
          >
            <option value="">Toutes les matieres</option>
            {usedSubjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <StickyNote className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchQuery || subjectFilter ? 'Aucune note trouvee' : 'Pas encore de notes'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            {searchQuery || subjectFilter
              ? 'Essaye de modifier tes filtres.'
              : 'Commence a prendre des notes pour organiser tes cours.'}
          </p>
          {!searchQuery && !subjectFilter && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Creer ma premiere note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const colorStyle = getColorStyle(note.color)
            const isExpanded = expandedNote === note.id
            return (
              <div
                key={note.id}
                className={`${colorStyle.bg} rounded-2xl border ${colorStyle.border} overflow-hidden group transition-all hover:shadow-md`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg ${colorStyle.text}`}>{note.title}</h3>
                      {note.subject && (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-white/60 text-gray-600 mt-1">
                          <BookOpen className="w-3 h-3" />
                          {note.subject}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenModal(note)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm text-gray-700 whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-4'}`}>
                    {note.content}
                  </p>
                  {note.content.length > 200 && (
                    <button
                      onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                      className="mt-2 text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>Reduire <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Voir plus <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <FileText className="w-3 h-3" />
                    {note.updated_at ? new Date(typeof note.updated_at === 'object' && 'seconds' in note.updated_at ? (note.updated_at as { seconds: number }).seconds * 1000 : note.updated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }) : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-scale">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingNote ? 'Modifier la note' : 'Nouvelle note'}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  placeholder="Ex: Chapitre 5 - Les fonctions"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Matiere</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Couleur</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`w-8 h-8 rounded-full ${c.dot} transition-all ${
                        formData.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contenu</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                  rows={8}
                  placeholder="Ecris tes notes ici..."
                  required
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingNote ? 'Enregistrer' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

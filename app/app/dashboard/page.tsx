'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore'
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Sparkles,
  ArrowRight,
  BookOpen,
  Target,
  Zap
} from 'lucide-react'

interface Task {
  id: string
  title: string
  deadline: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
}

export default function DashboardPage() {
  const { user, profile, loading } = useUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stageHours, setStageHours] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (!user) return

    const unsubscribers: (() => void)[] = []

    const tasksQ = query(
      collection(db, 'tasks'),
      where('user_id', '==', user.uid),
      orderBy('deadline', 'asc'),
      limit(20)
    )

    unsubscribers.push(
      onSnapshot(tasksQ, (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task))
        setTasks(data)
        setDataLoaded(true)
      }, (err) => {
        console.error('Tasks snapshot error:', err)
        setDataLoaded(true)
      })
    )

    const stageQ = query(
      collection(db, 'stage_activities'),
      where('user_id', '==', user.uid)
    )

    unsubscribers.push(
      onSnapshot(stageQ, (snap) => {
        const total = snap.docs.reduce(
          (sum, d) => sum + (d.data().hours_worked || 0),
          0
        )
        setStageHours(total)
      })
    )

    return () => unsubscribers.forEach((unsub) => unsub())
  }, [user])

  const pendingTasks = tasks.filter((t) => !t.completed)
  const recentTasks = tasks.slice(0, 5)
  const nextDeadline = pendingTasks[0]?.deadline || null
  const completedTasks = tasks.filter((t) => t.completed).length
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  if (loading || (!dataLoaded && user)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin delay-150 opacity-50" />
          </div>
          <p className="text-gray-500 font-medium">Chargement de ton espace...</p>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500'
      case 'medium': return 'bg-amber-500'
      default: return 'bg-emerald-500'
    }
  }

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-50 border-rose-200'
      case 'medium': return 'bg-amber-50 border-amber-200'
      default: return 'bg-emerald-50 border-emerald-200'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute'
      case 'medium': return 'Moyenne'
      default: return 'Basse'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {profile?.first_name || 'Étudiant'}
              </span>
              {' '}!
            </h1>
            <p className="text-gray-600 mt-1">
              {profile?.filiere 
                ? `${profile.filiere} • Prêt à avancer sur tes objectifs ?` 
                : 'Complète ton profil pour une expérience personnalisée'}
            </p>
          </div>
          <Link
            href="/app/dashboard/ai-chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Discuter avec l&apos;IA
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Devoirs en attente',
            value: pendingTasks.length,
            icon: Clock,
            color: 'from-rose-500 to-pink-500',
            bgColor: 'from-rose-50 to-pink-50',
          },
          {
            label: 'Taux de réussite',
            value: `${completionRate}%`,
            icon: TrendingUp,
            color: 'from-emerald-500 to-green-500',
            bgColor: 'from-emerald-50 to-green-50',
          },
          {
            label: 'Total devoirs',
            value: tasks.length,
            icon: CheckCircle2,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'from-blue-50 to-cyan-50',
          },
          {
            label: 'Prochaine deadline',
            value: nextDeadline 
              ? new Date(nextDeadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              : 'Aucune',
            icon: Calendar,
            color: 'from-violet-500 to-purple-500',
            bgColor: 'from-violet-50 to-purple-50',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} text-transparent bg-clip-text`} style={{ color: stat.color.includes('rose') ? '#f43f5e' : stat.color.includes('emerald') ? '#10b981' : stat.color.includes('blue') ? '#3b82f6' : '#8b5cf6' }} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Devoirs récents</h2>
                  <p className="text-sm text-gray-500">Tes prochaines échéances</p>
                </div>
              </div>
              <Link
                href="/app/dashboard/tasks"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentTasks.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <Target className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-gray-500 font-medium">Aucun devoir en attente</p>
                  <p className="text-sm text-gray-400 mt-1">Parfait ! Profite pour avancer sur d&apos;autres projets.</p>
                  <Link
                    href="/app/dashboard/tasks"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Ajouter un devoir
                  </Link>
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2.5 flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-gray-900 ${task.completed ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(task.deadline).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getPriorityBg(task.priority)} ${
                      task.priority === 'high' ? 'text-rose-700' :
                      task.priority === 'medium' ? 'text-amber-700' :
                      'text-emerald-700'
                    }`}>
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Ta progression</h3>
                  <p className="text-sm text-indigo-100">Continue comme ça !</p>
                </div>
              </div>
              <span className="text-3xl font-bold">{completionRate}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-sm text-indigo-100 mt-3">
              {completedTasks} devoirs terminés sur {tasks.length}
            </p>
          </div>
        </div>

        {/* Right Column - Quick Actions & Profile */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Actions rapides
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Nouveau devoir', href: '/app/dashboard/tasks', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
                { name: 'Prendre des notes', href: '/app/dashboard/notes', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { name: 'Parler a l\'IA', href: '/app/dashboard/ai-chat', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                { name: 'Heures de stage', href: '/app/dashboard/stage', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
              ].map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className={`block px-4 py-3 rounded-xl font-medium transition-colors ${action.color}`}
                >
                  {action.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Learning Style Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900">Style d&apos;apprentissage</h3>
            </div>
            {profile?.learning_style ? (
              <div>
                <p className="text-lg font-semibold text-amber-700 mb-2">
                  {profile.learning_style}
                </p>
                <p className="text-sm text-gray-600">
                  Notre IA adapte ses réponses selon ton profil pour un apprentissage optimisé.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Découvre comment tu apprends le mieux avec notre test de personnalité.
                </p>
                <Link
                  href="/app/onboarding/personality-test"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors text-sm"
                >
                  Faire le test
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Stage Hours Card */}
          <Link href="/app/dashboard/stage" className="block bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-100 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900">Heures de stage</h3>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-3xl font-bold text-emerald-700 mb-1">
              {stageHours.toFixed(1)}h
            </p>
            <p className="text-sm text-gray-600">
              Clique pour gerer tes heures
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

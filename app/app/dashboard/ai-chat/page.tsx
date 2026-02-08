'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useUser } from '@/hooks/useUser'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot, limit, addDoc, Timestamp } from 'firebase/firestore'
import { Send, Sparkles, Bot, User, Lightbulb, MessageSquare, Brain, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ConversationEntry {
  id: string
  message: string
  response: string
  created_at: string
}

const STYLE_META: Record<string, { emoji: string; label: string; color: string }> = {
  'Visuel Structuré': { emoji: '📊', label: 'Visuel Structuré', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'Auditif Conversationnel': { emoji: '🎙️', label: 'Auditif Conversationnel', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  'Pragmatique Rapide': { emoji: '⚡', label: 'Pragmatique Rapide', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'Analytique Approfondi': { emoji: '📚', label: 'Analytique Approfondi', color: 'bg-purple-100 text-purple-700 border-purple-200' },
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  'Visuel Structuré': [
    'Fais-moi un schéma récapitulatif sur ce chapitre',
    'Organise ces informations dans un tableau comparatif',
    'Crée une fiche de révision visuelle',
    'Résume ce cours avec des points clés numérotés',
  ],
  'Auditif Conversationnel': [
    'Explique-moi ce concept comme si on discutait',
    'Raconte-moi l\'histoire derrière cette théorie',
    'Aide-moi à comprendre en me posant des questions',
    'Reformule cette leçon de manière simple',
  ],
  'Pragmatique Rapide': [
    'Donne-moi la réponse courte et un exemple',
    'Crée-moi un exercice pratique sur ce sujet',
    'Résume en 3 points essentiels',
    'Donne-moi une méthode rapide pour résoudre ça',
  ],
  'Analytique Approfondi': [
    'Explique-moi le pourquoi derrière ce concept',
    'Quels sont les liens entre ces deux notions ?',
    'Analyse en profondeur ce sujet',
    'Quelles sont les limites de cette théorie ?',
  ],
  default: [
    'Explique-moi un concept en maths',
    'Résume ce texte pour moi',
    'Aide-moi à préparer mon exposé',
    'Crée un plan de révision',
    'Donne-moi des exercices d\'entraînement',
  ],
}

function getSuggestedQuestions(style: string | null | undefined): string[] {
  return SUGGESTED_QUESTIONS[style || ''] || SUGGESTED_QUESTIONS.default
}

export default function AIChatPage() {
  const { user, profile, loading } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const styleMeta = profile?.learning_style ? STYLE_META[profile.learning_style] : null
  const hasCompletedTest = profile?.preferences?.completed_test === true

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'conversations'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc'),
      limit(20)
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ConversationEntry))
      setConversationHistory(data)
    })
    return () => unsub()
  }, [user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || !user || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Send recent history and profile info to the API
      const recentHistory = conversationHistory
        .slice(0, 5)
        .reverse()
        .map((c) => ({ message: c.message, response: c.response }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          learningStyle: profile?.learning_style,
          filiere: profile?.filiere,
          firstName: profile?.first_name,
          history: recentHistory,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.details || errData.error || 'Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save conversation to Firestore (client-side)
      try {
        await addDoc(collection(db, 'conversations'), {
          user_id: user.uid,
          message: currentInput,
          response: data.response,
          model_used: 'gemini-2.5-flash',
          created_at: Timestamp.now(),
        })
      } catch (saveErr) {
        console.error('Error saving conversation:', saveErr)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Désolé, une erreur est survenue : ${error instanceof Error ? error.message : 'Erreur inconnue'}. Vérifie que GEMINI_API_KEY est bien configuré dans .env.local.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, user, isLoading, profile, conversationHistory])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin delay-150 opacity-50" />
          </div>
          <p className="text-gray-500 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  const suggestedQuestions = getSuggestedQuestions(profile?.learning_style)

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Conversation History */}
      <div className="hidden lg:flex w-80 flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setMessages([])}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Nouvelle conversation
          </button>
        </div>

        {/* Learning Style Badge in sidebar */}
        {styleMeta && (
          <div className="px-4 pt-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${styleMeta.color}`}>
              <span>{styleMeta.emoji}</span>
              <span>{styleMeta.label}</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Historique récent
          </h3>
          {conversationHistory.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Aucune conversation précédente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversationHistory.map((conv) => (
                <button
                  key={conv.id}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <p className="font-medium text-gray-700 truncate text-sm">
                    {conv.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {conv.created_at ? new Date(conv.created_at).toLocaleDateString('fr-FR') : ''}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Assistant IA</h1>
              <p className="text-sm text-gray-500">Propulsé par Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Learning style badge in header */}
            {styleMeta && (
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${styleMeta.color}`}>
                <span>{styleMeta.emoji}</span>
                <span>{styleMeta.label}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              En ligne
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {profile?.first_name
                  ? `Salut ${profile.first_name} ! Comment puis-je t'aider ?`
                  : 'Comment puis-je t\'aider aujourd\'hui ?'}
              </h2>
              <p className="text-gray-600 mb-4 max-w-md">
                {styleMeta
                  ? `Tes réponses sont adaptées à ton profil ${styleMeta.emoji} ${styleMeta.label}. Je m'adapte à ta façon d'apprendre !`
                  : 'Je suis ton assistant pédagogique personnel. Je peux t\'expliquer des concepts, créer des quiz, résumer tes cours ou t\'aider à réviser.'}
              </p>

              {/* CTA to take the test if not done */}
              {!hasCompletedTest && (
                <Link
                  href="/app/onboarding/personality-test"
                  className="mb-6 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 text-amber-800 rounded-2xl hover:border-amber-300 hover:shadow-md transition-all group"
                >
                  <Brain className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-sm">Passe le test de personnalité pour des réponses personnalisées</span>
                  <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => {
                      setInput(question)
                      textareaRef.current?.focus()
                    }}
                    className="p-4 text-left bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-2xl transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 group-hover:text-indigo-700 font-medium">
                        {question}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                    }`}>
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-indigo-600 prose-code:text-indigo-700 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-li:text-gray-700 prose-th:text-gray-900 prose-td:text-gray-700">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      )}
                      <span className={`text-xs mt-2 block ${
                        message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-4 max-w-[80%]">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="p-4 bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pose-moi une question..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none bg-gray-50 focus:bg-white min-h-[52px] max-h-32"
                  rows={1}
                  disabled={isLoading}
                  style={{ height: 'auto', overflow: 'hidden' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = target.scrollHeight + 'px'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2 text-center">
              L&apos;IA peut parfois faire des erreurs. Vérifie les informations importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

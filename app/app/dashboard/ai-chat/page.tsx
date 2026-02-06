'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useUser } from '@/hooks/useUser'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot, limit, addDoc, Timestamp } from 'firebase/firestore'
import { Send, Sparkles, Bot, User, Lightbulb, MessageSquare } from 'lucide-react'

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

const SUGGESTED_QUESTIONS = [
  'Explique-moi un concept en maths',
  'Résume ce texte pour moi',
  'Aide-moi à préparer mon exposé',
  'Crée un plan de révision',
  'Donne-moi des exercices d\'entraînement',
]

export default function AIChatPage() {
  const { user, profile, loading } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            En ligne
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
                Comment puis-je t'aider aujourd'hui ?
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Je suis ton assistant pédagogique personnel. Je peux t'expliquer des concepts,
                créer des quiz, résumer tes cours ou t'aider à réviser.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {SUGGESTED_QUESTIONS.map((question) => (
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
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
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
              L'IA peut parfois faire des erreurs. Vérifie les informations importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

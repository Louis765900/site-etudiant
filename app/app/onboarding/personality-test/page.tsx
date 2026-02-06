'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

interface Question {
  id: number
  text: string
  options: string[]
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Quand tu apprends une nouvelle notion, tu préfères :',
    options: [
      'Voir un schéma ou diagramme',
      'Lire un texte détaillé',
      'Écouter une explication orale',
      'Pratiquer directement avec des exercices',
    ],
  },
  {
    id: 2,
    text: 'Pour retenir les informations, tu trouves plus efficace de :',
    options: [
      'Créer des mindmaps ou des schémas visuels',
      'Prendre des notes écrites détaillées',
      'Discuter et expliquer à haute voix',
      'Faire directement des exercices pratiques',
    ],
  },
  {
    id: 3,
    text: 'Quel type de cours te plaît le plus ?',
    options: [
      'Avec vidéos, diaporamas et visuels',
      'Sous forme de texte et de lecture',
      'Format discussion et débat',
      'Travaux pratiques et projets',
    ],
  },
  {
    id: 4,
    text: 'Quand tu dois comprendre quelque chose, tu :',
    options: [
      'Aimes les couleurs, les surlignages, les symboles',
      'Préfères lire et relire le texte',
      'Aimes écouter et poser des questions',
      'Veux essayer tout de suite',
    ],
  },
  {
    id: 5,
    text: 'Pour organiser ton travail, tu aimes :',
    options: [
      'Des listes très détaillées et plannings précis',
      'Une direction générale, le reste tu improvises',
      'Un mix des deux',
      "Pas de plan, tu fais au feeling",
    ],
  },
  {
    id: 6,
    text: 'Tu préfères étudier :',
    options: [
      'Seul avec tes outils (livres, vidéos)',
      'En petits groupes de discussion',
      'Avec un professeur qui explique',
      'En faisant des projets en équipe',
    ],
  },
  {
    id: 7,
    text: 'Quel type d\'explications te satisfait le plus ?',
    options: [
      'Avec beaucoup d\'exemples concrets',
      'Avec des chiffres et statistiques',
      'Avec un débat d\'idées',
      'Avec des cas réels à résoudre',
    ],
  },
  {
    id: 8,
    text: 'Ton rythme d\'apprentissage idéal est :',
    options: [
      'Rapide avec beaucoup de stimuli visuels',
      'Lent et progressif avec de la lecture',
      'Avec des pauses pour discuter',
      'Avec des petits projets réguliers',
    ],
  },
  {
    id: 9,
    text: 'Tu trouves plus facile de mémoriser par :',
    options: [
      'Des images mentales et symboles',
      'La répétition et l\'écriture',
      'La conversation et la répétition verbale',
      'L\'expérience pratique',
    ],
  },
  {
    id: 10,
    text: 'Face à un problème complexe, tu :',
    options: [
      'Crées un diagramme ou un dessin',
      'Écris une analyse détaillée',
      'En parles avec d\'autres',
      'Essaies directement des solutions',
    ],
  },
  {
    id: 11,
    text: 'Les cours qu\'il te plaît de suivre sont :',
    options: [
      'Basés sur des projets visuels',
      'Basés sur de la théorie écrite',
      'Basés sur des débats et discussions',
      'Basés sur des cas concrets',
    ],
  },
  {
    id: 12,
    text: 'Tu retiens mieux les informations quand :',
    options: [
      'Tu as un support visuel (tableau, schéma)',
      'Tu as un texte écrit à revoir',
      'Quelqu\'un t\'explique à l\'oral',
      'Tu dois les appliquer immédiatement',
    ],
  },
  {
    id: 13,
    text: 'Pour un sujet que tu dois maîtriser, tu :',
    options: [
      'Regardes des tutoriels vidéo d\'abord',
      'Lis des articles et des manuels',
      'En discutes avec des experts',
      'Fais des exercices pratiques',
    ],
  },
  {
    id: 14,
    text: 'Ton environnement d\'étude idéal est :',
    options: [
      'Bien illuminé avec des visuels',
      'Calme avec des ressources écrites',
      'Avec du monde pour discuter',
      'Spacieux pour des activités',
    ],
  },
  {
    id: 15,
    text: 'Quel format de test tu préfères ?',
    options: [
      'Schémas et QCM avec images',
      'Rédactions et essais écrits',
      'Présentations orales',
      'Projets et travaux pratiques',
    ],
  },
]

type LearningStyle = 'Visuel Structuré' | 'Auditif Conversationnel' | 'Pragmatique Rapide' | 'Analytique Approfondi'

const STYLE_DESCRIPTIONS: Record<LearningStyle, string> = {
  'Visuel Structuré': `Tu es un apprenant visuel qui aime avoir une structure claire. Tu retiens mieux les informations avec des schémas, des diagrammes et des visuels bien organisés. Tu apprécies les plannings précis et les listes détaillées. Pour toi, l'organisation visuelle est clé.`,
  'Auditif Conversationnel': `Tu es un apprenant auditif qui apprend en écoutant et en discutant. Tu aimes débattre, poser des questions et expliquer à voix haute. Tu retiens mieux en parlant et en échangeant avec les autres. Les discussions en groupe sont très efficaces pour toi.`,
  'Pragmatique Rapide': `Tu es un apprenant pragmatique qui préfère l'action directe. Tu aimes apprendre en faisant, avec des cas concrets et des exercices pratiques. Tu cherches l'efficacité et tu n'aimes pas les longs textes théoriques. Tu veux des résultats rapides.`,
  'Analytique Approfondi': `Tu es un apprenant analytique qui aime la profondeur. Tu préfères lire des textes détaillés et comprendre le "pourquoi" derrière les choses. Tu aimes la réflexion progressive et tu n'aimes pas précipiter tes apprentissages. Tu veux maîtriser complètement les sujets.`,
}

const ADAPTATIONS: Record<LearningStyle, string[]> = {
  'Visuel Structuré': [
    '📊 Des visuels et schémas pour chaque concept',
    '📋 Des plans structurés et organisés',
    '🎨 Du code couleur pour les différents thèmes',
    '📈 Des graphiques et des diagrammes explicatifs',
  ],
  'Auditif Conversationnel': [
    '🎙️ Des transcriptions audio de tes cours',
    '💬 La possibilité de discuter tes doutes',
    '🗣️ Des explications orales approfondies',
    '👥 Des suggestions pour étudier en groupe',
  ],
  'Pragmatique Rapide': [
    '⚡ Des exercices pratiques immédiatement',
    '🎯 Des objectifs clairs et concis',
    '💪 Des cas concrets et réels à résoudre',
    '🏆 Des résultats mesurables et rapides',
  ],
  'Analytique Approfondi': [
    '📚 Des analyses détaillées et complètes',
    '🔬 Des explications scientifiques approfondies',
    '📖 Des ressources pour aller plus loin',
    '🧠 Des réflexions et des débats d\'idées',
  ],
}

export default function PersonalityTestPage() {
  const router = useRouter()
  const { user } = useUser()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const calculateLearningStyle = (): LearningStyle => {
    const scores = {
      'Visuel Structuré': 0,
      'Auditif Conversationnel': 0,
      'Pragmatique Rapide': 0,
      'Analytique Approfondi': 0,
    }

    answers.forEach((answer) => {
      if (answer === 0) scores['Visuel Structuré']++
      else if (answer === 1) scores['Analytique Approfondi']++
      else if (answer === 2) scores['Auditif Conversationnel']++
      else if (answer === 3) scores['Pragmatique Rapide']++
    })

    let maxScore = 0
    let style: LearningStyle = 'Visuel Structuré'

    for (const [s, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score
        style = s as LearningStyle
      }
    }

    return style
  }

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex]
    setAnswers(newAnswers)

    if (newAnswers.length === QUESTIONS.length) {
      setShowResult(true)
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  const handleSaveProfile = async () => {
    setLoadingSave(true)
    try {
      const style = calculateLearningStyle()
      await updateDoc(doc(db, 'profiles', user.uid), {
        learning_style: style,
        preferences: {
          completed_test: true,
          test_date: new Date().toISOString(),
        },
      })

      router.push('/app/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setLoadingSave(false)
    }
  }

  if (showResult) {
    const style = calculateLearningStyle()
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🎯 Ton profil</h1>
              <div className="text-5xl my-4">
                {style === 'Visuel Structuré' && '📊'}
                {style === 'Auditif Conversationnel' && '🎙️'}
                {style === 'Pragmatique Rapide' && '⚡'}
                {style === 'Analytique Approfondi' && '📚'}
              </div>
              <h2 className="text-3xl font-bold text-blue-600">{style}</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Qui es-tu ?</h3>
              <p className="text-gray-700 leading-relaxed">{STYLE_DESCRIPTIONS[style]}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Comment l&apos;IA va s&apos;adapter a toi</h3>
              <ul className="space-y-3">
                {ADAPTATIONS[style].map((adaptation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{adaptation.split(' ')[0]}</span>
                    <span className="text-gray-700">{adaptation.split(' ').slice(1).join(' ')}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={loadingSave}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-colors"
            >
              {loadingSave ? 'Enregistrement...' : 'Enregistrer et continuer'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const question = QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {currentQuestion === 0 && answers.length === 0 ? (
          // Introduction Screen
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Decouvre ton profil d&apos;apprentissage
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Reponds a 15 questions pour que l&apos;IA s&apos;adapte a toi et te propose les meilleures explications selon ta facon d&apos;apprendre.
            </p>
            <button
              onClick={() => handleAnswer(0)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
            >
              Commencer le test
            </button>
          </div>
        ) : (
          // Question Screen
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1}/15</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.text}</h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full p-4 text-left border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors font-medium text-gray-900"
                >
                  {String.fromCharCode(65 + index)}) {option}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                ← Précédent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

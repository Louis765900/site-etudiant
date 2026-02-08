import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function getStyleInstructions(learningStyle: string | null): string {
  const instructions: Record<string, string> = {
    'Visuel Structuré': `
STYLE : Visuel Structuré — cet étudiant comprend mieux quand l'information est organisée visuellement.

Format de réponse :
- Structure TOUJOURS avec des titres markdown (## et ###) et des listes numérotées ou à puces
- Utilise des tableaux markdown pour comparer des concepts
- Ajoute des emojis (📌 🔑 💡 ⚠️ ✅) en début de points importants pour créer des repères visuels
- Sépare clairement les parties : Définition → Explication → Exemple → Résumé
- Termine par un encadré "🔑 À retenir" avec les 2-3 points clés
- Utilise le **gras** pour les termes importants et le *italique* pour les nuances
- Quand tu expliques un processus, numérote les étapes (Étape 1, Étape 2…)
`,
    'Auditif Conversationnel': `
STYLE : Auditif Conversationnel — cet étudiant apprend mieux par le dialogue et l'échange.

Format de réponse :
- Écris comme si tu parlais à un ami : ton naturel, phrases fluides, pas trop de listes
- Pose régulièrement des questions rhétoriques ("Tu vois l'idée ?", "Ça te parle ?")
- Utilise des analogies du quotidien et des exemples concrets tirés de situations réelles
- Commence par accrocher ("Imagine que…", "Tu sais quand…", "C'est comme si…")
- Explique les concepts comme une histoire avec un fil conducteur
- Encourage activement ("Tu es sur la bonne piste !", "C'est une super question !")
- Propose de reformuler si quelque chose n'est pas clair
- Termine par une question ouverte pour relancer la réflexion
`,
    'Pragmatique Rapide': `
STYLE : Pragmatique Rapide — cet étudiant veut des réponses directes et applicables immédiatement.

Format de réponse :
- Va DROIT AU BUT : la réponse clé dans les 2 premières lignes
- Pas d'introduction longue ni de contexte historique sauf si demandé
- Utilise des listes courtes et concises (pas plus de 5-6 points)
- Donne un exemple concret immédiatement après chaque explication
- Propose un mini-exercice pratique à la fin ("Essaie ça : …")
- Format idéal : Réponse → Exemple → Exercice
- Évite les digressions, reste focus sur la question posée
- Si la réponse est simple, ne la complexifie pas inutilement
`,
    'Analytique Approfondi': `
STYLE : Analytique Approfondi — cet étudiant aime comprendre le "pourquoi" en profondeur.

Format de réponse :
- Fournis des explications complètes avec le raisonnement derrière chaque concept
- Inclus le contexte (historique, scientifique, ou étymologique) quand c'est pertinent
- Fais des liens entre les concepts ("Ceci est lié à… parce que…")
- N'hésite pas à nuancer ("Cependant…", "Il faut noter que…", "En revanche…")
- Propose des ressources ou pistes pour approfondir ("Pour aller plus loin…")
- Structure en profondeur : Contexte → Concept → Mécanisme → Implications → Limites
- Encourage la réflexion critique ("Que se passerait-il si… ?")
- Accepte les réponses longues si le sujet le mérite
`,
  }

  return instructions[learningStyle || ''] || `
STYLE : Par défaut — aucun test de personnalité n'a été effectué.
- Utilise un format équilibré avec des listes et des explications claires
- Sois encourageant et pédagogique
- Structure avec des titres et des exemples concrets
`
}

export async function POST(request: NextRequest) {
  try {
    const { message, learningStyle, filiere, firstName, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })
    }

    // Check auth cookie exists (actual auth is handled by middleware)
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build conversation history from client-provided data
    const historique = (history || [])
      .map((c: { message: string; response: string }) => `User: ${c.message}\nAssistant: ${c.response}`)
      .join('\n\n')

    const style = learningStyle || ''
    const userFiliere = filiere || 'Lycée Général'
    const name = firstName || 'l\'étudiant'

    // Build system prompt
    const systemPrompt = `Tu es StudyFlow AI, un assistant pédagogique bienveillant et expert. Tu accompagnes ${name}, un étudiant en ${userFiliere}.

${style ? `Profil d'apprentissage détecté : **${style}**` : 'Aucun profil d\'apprentissage détecté (le test n\'a pas encore été passé).'}

${getStyleInstructions(style)}

${historique ? `Contexte des échanges précédents :\n${historique}` : ''}

Règles fondamentales :
- Tutoie ${name} naturellement
- Réponds TOUJOURS en français
- Utilise le format Markdown dans tes réponses (titres, listes, gras, tableaux…)
- Sois enthousiaste, encourageant et bienveillant
- Adapte la complexité au niveau de l'étudiant (${userFiliere})
- Quand c'est pertinent, propose un exercice pratique ou un quiz rapide
- Si ${name} pose une question vague, demande des précisions plutôt que de deviner`

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`

    const result = await model.generateContentStream(fullPrompt)

    // Collect the full response
    let fullResponse = ''
    for await (const chunk of result.stream) {
      if (chunk.candidates?.[0]?.content?.parts) {
        for (const part of chunk.candidates[0].content.parts) {
          if ('text' in part) {
            fullResponse += part.text
          }
        }
      }
    }

    return NextResponse.json({ response: fullResponse })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

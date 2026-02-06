import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function getStyleInstructions(learningStyle: string | null): string {
  const instructions: Record<string, string> = {
    'Visuel Structuré': `
      - Utilise beaucoup de schémas et de structures visuelles dans ton texte (avec des symboles)
      - Organise tes réponses avec des listes claires et numérotées
      - Utilise des emojis pour illustrer les concepts
      - Crée des divisions claires avec des titres
    `,
    'Auditif Conversationnel': `
      - Écris de manière conversationnelle, comme si tu parlais à l'étudiant
      - Pose des questions pour engager le dialogue
      - Utilise des exemples issus de discussions réelles
      - Encourage à haute voix
    `,
    'Pragmatique Rapide': `
      - Va droit au but, sans détails superflus
      - Donne des exercices pratiques et des cas concrets
      - Propose des solutions immédiatement applicables
      - Sois bref et direct
    `,
    'Analytique Approfondi': `
      - Fournis des explications détaillées et complètes
      - Donne le contexte historique ou scientifique
      - Propose des ressources pour aller plus loin
      - Encourage la réflexion approfondie
    `,
  }

  return instructions[learningStyle || 'Visuel Structuré'] || instructions['Visuel Structuré']
}

export async function POST(request: NextRequest) {
  try {
    const { message, learningStyle, filiere, history } = await request.json()

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

    const style = learningStyle || 'Visuel Structuré'
    const userFiliere = filiere || 'Lycée Général'

    // Build system prompt
    const systemPrompt = `Tu es un assistant pédagogique bienveillant pour un étudiant en ${userFiliere}.

Profil d'apprentissage : ${style}

Adapte tes réponses selon ce profil :
${getStyleInstructions(style)}

Contexte des précédentes conversations :
${historique || 'Aucune conversation précédente'}

Règles importantes :
- Sois enthousiaste et encourageant
- Adapte ton niveau de complexité au besoin de l'étudiant
- Propose des exercices ou des cas pratiques quand c'est pertinent
- Sois bref si l'étudiant préfère la rapidité, détaillé s'il aime approfondir`

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

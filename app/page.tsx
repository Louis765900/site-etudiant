import Link from 'next/link'
import { Sparkles, BookOpen, Target, Zap, Users, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                StudyFlow
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Propulsé par l'IA
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
                Ton assistant{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  intelligent
                </span>{' '}
                pour réussir
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Une plateforme personnalisée qui s'adapte à ton style d'apprentissage. 
                Gère tes devoirs, prépare tes examens et progresse à ton rythme.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Créer mon compte gratuit
                  <Zap className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl font-semibold text-lg transition-all border-2 border-gray-200 hover:border-gray-300"
                >
                  Découvrir les fonctionnalités
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">+10 000</span> étudiants nous font confiance
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-3xl opacity-20 animate-pulse-glow" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                {/* Dashboard Preview */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Bonjour, Thomas !</p>
                      <h3 className="text-lg font-bold text-gray-900">Tableau de bord</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
                      <p className="text-2xl font-bold text-indigo-700">12</p>
                      <p className="text-xs text-gray-600">Devoirs cette semaine</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                      <p className="text-2xl font-bold text-green-700">85%</p>
                      <p className="text-xs text-gray-600">Progression moyenne</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Prochains devoirs</p>
                    {['Mathématiques - DM', 'Histoire - Exposé'].map((task, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        <span className="text-sm text-gray-700 flex-1">{task}</span>
                        <span className="text-xs text-gray-500">{i === 0 ? 'Demain' : 'Vendredi'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl shadow-xl flex items-center justify-center text-white animate-float">
                <Target className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl flex items-center justify-center text-white animate-float delay-200">
                <BookOpen className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce qu'il te faut pour{' '}
              <span className="text-indigo-600">réussir</span>
            </h2>
            <p className="text-lg text-gray-600">
              Une suite complète d'outils intelligents conçus pour t'accompagner dans ton parcours scolaire
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Assistant IA personnel',
                description: 'Un tuteur intelligent qui s\'adapte à ton style d\'apprentissage et te guide pas à pas.',
                color: 'from-indigo-500 to-purple-500',
                bgColor: 'from-indigo-50 to-purple-50',
              },
              {
                icon: BookOpen,
                title: 'Gestion des devoirs',
                description: 'Organise tes tâches, fixe des priorités et ne manque plus jamais une deadline.',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'from-blue-50 to-cyan-50',
              },
              {
                icon: Target,
                title: 'Profil d\'apprentissage',
                description: 'Découvre comment tu apprends le mieux grâce à notre test de personnalité.',
                color: 'from-pink-500 to-rose-500',
                bgColor: 'from-pink-50 to-rose-50',
              },
              {
                icon: Users,
                title: 'Progression personnalisée',
                description: 'Suis tes progrès en temps réel et identifie tes points forts à améliorer.',
                color: 'from-green-500 to-emerald-500',
                bgColor: 'from-green-50 to-emerald-50',
              },
              {
                icon: Shield,
                title: '100% Gratuit',
                description: 'Toutes les fonctionnalités essentielles sont gratuites, sans limitation.',
                color: 'from-amber-500 to-orange-500',
                bgColor: 'from-amber-50 to-orange-50',
              },
              {
                icon: Zap,
                title: 'Multi-filières',
                description: 'Support pour tous les niveaux : collège, lycée, supérieur et formations pro.',
                color: 'from-violet-500 to-purple-500',
                bgColor: 'from-violet-50 to-purple-50',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} style={{ color: 'inherit' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '+10K', label: 'Étudiants actifs' },
              { value: '+500K', label: 'Devoirs gérés' },
              { value: '+1M', label: 'Messages IA échangés' },
              { value: '95%', label: 'Satisfaction' },
            ].map((stat, i) => (
              <div key={i} className="text-white">
                <p className="text-4xl sm:text-5xl font-extrabold mb-2">{stat.value}</p>
                <p className="text-indigo-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-600">
              Commence en 3 étapes simples et gratuitement
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Crée ton compte',
                description: 'Inscris-toi gratuitement en quelques secondes avec ton email.',
              },
              {
                step: '02',
                title: 'Fais le test de personnalité',
                description: 'Découvre ton profil d\'apprentissage pour une expérience personnalisée.',
              },
              {
                step: '03',
                title: 'Commence à apprendre',
                description: 'Utilise l\'assistant IA et gère tes devoirs comme un pro.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
                  <span className="text-6xl font-extrabold text-indigo-100">{item.step}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-indigo-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-6">
                Prêt à révolutionner ta façon d'apprendre ?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Rejoins des milliers d'étudiants qui utilisent StudyFlow pour réussir leurs études. 
                C'est gratuit et ça prend 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg transition-all hover:bg-gray-100 hover:shadow-xl"
                >
                  Créer mon compte gratuit
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-indigo-500/30 backdrop-blur-sm text-white border-2 border-white/30 rounded-2xl font-bold text-lg transition-all hover:bg-indigo-500/50"
                >
                  J'ai déjà un compte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">StudyFlow</span>
              </div>
              <p className="text-gray-400 max-w-sm">
                La plateforme éducative nouvelle génération qui combine intelligence artificielle 
                et pédagogie personnalisée.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Assistant IA</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Gestion des devoirs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Conditions d&apos;utilisation</Link></li>
                <li><Link href="/legal/privacy#mentions" className="hover:text-white transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>© 2026 StudyFlow. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

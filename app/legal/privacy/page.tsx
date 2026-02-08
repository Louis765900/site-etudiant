import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Mentions légales & Confidentialité - StudyFlow',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      {/* Header */}
      <header className="glass border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              StudyFlow
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Title */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8">
            <h1 className="text-3xl font-bold text-white">Mentions légales & Politique de confidentialité</h1>
            <p className="text-indigo-100 mt-2">Dernière mise à jour : 7 février 2026</p>
          </div>

          <div className="px-8 py-10 space-y-10 text-gray-700 leading-relaxed">
            {/* Table of contents */}
            <nav className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="font-semibold text-indigo-900 mb-3">Sommaire</p>
              <ol className="space-y-1.5 text-sm text-indigo-700 list-decimal list-inside">
                <li><a href="#mentions" className="hover:underline">Mentions légales</a></li>
                <li><a href="#donnees" className="hover:underline">Données collectées</a></li>
                <li><a href="#finalite" className="hover:underline">Finalité des traitements</a></li>
                <li><a href="#cookies" className="hover:underline">Cookies</a></li>
                <li><a href="#hebergement" className="hover:underline">Hébergement & sous-traitants</a></li>
                <li><a href="#droits" className="hover:underline">Vos droits (RGPD)</a></li>
                <li><a href="#mineurs" className="hover:underline">Protection des mineurs</a></li>
                <li><a href="#securite" className="hover:underline">Sécurité</a></li>
                <li><a href="#contact" className="hover:underline">Contact</a></li>
              </ol>
            </nav>

            {/* 1. Mentions légales */}
            <section id="mentions">
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Mentions légales</h2>
              <div className="space-y-2">
                <p><strong>Nom du service :</strong> StudyFlow</p>
                <p><strong>Type :</strong> Projet étudiant / Application web éducative</p>
                <p><strong>Responsable de la publication :</strong> Louis (projet personnel étudiant)</p>
                <p><strong>Hébergeur :</strong> Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                <p><strong>Base de données :</strong> Google Firebase (Firestore) — Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande</p>
              </div>
            </section>

            {/* 2. Données collectées */}
            <section id="donnees">
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Données collectées</h2>
              <p className="mb-3">StudyFlow collecte uniquement les données nécessaires au fonctionnement du service :</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Donnée</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Obligatoire</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Pourquoi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-4 py-3">Adresse email</td><td className="px-4 py-3">Oui</td><td className="px-4 py-3">Authentification, récupération de mot de passe</td></tr>
                    <tr><td className="px-4 py-3">Prénom</td><td className="px-4 py-3">Oui</td><td className="px-4 py-3">Personnalisation de l&apos;interface</td></tr>
                    <tr><td className="px-4 py-3">Date de naissance</td><td className="px-4 py-3">Oui</td><td className="px-4 py-3">Vérification de l&apos;âge (protection des mineurs)</td></tr>
                    <tr><td className="px-4 py-3">Filière scolaire</td><td className="px-4 py-3">Oui</td><td className="px-4 py-3">Adaptation du contenu pédagogique</td></tr>
                    <tr><td className="px-4 py-3">Style d&apos;apprentissage</td><td className="px-4 py-3">Non</td><td className="px-4 py-3">Personnalisation des réponses de l&apos;IA</td></tr>
                    <tr><td className="px-4 py-3">Devoirs (titres, dates)</td><td className="px-4 py-3">Non</td><td className="px-4 py-3">Gestion du planning</td></tr>
                    <tr><td className="px-4 py-3">Conversations IA</td><td className="px-4 py-3">Non</td><td className="px-4 py-3">Historique de l&apos;assistant</td></tr>
                    <tr><td className="px-4 py-3">Email parental</td><td className="px-4 py-3">Si &lt; 15 ans</td><td className="px-4 py-3">Consentement parental (RGPD)</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Aucune donnée sensible (santé, opinion politique, religion) n&apos;est collectée.
              </p>
            </section>

            {/* 3. Finalité */}
            <section id="finalite">
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Finalité des traitements</h2>
              <p className="mb-3">Vos données sont utilisées exclusivement pour :</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Vous authentifier et sécuriser votre compte</li>
                <li>Personnaliser les réponses de l&apos;assistant IA selon votre profil</li>
                <li>Gérer vos devoirs et suivre votre progression</li>
                <li>Améliorer le service (statistiques anonymisées)</li>
              </ul>
              <p className="mt-3 font-semibold text-gray-900">
                Vos données ne sont jamais vendues, partagées à des fins publicitaires, ni transmises à des tiers commerciaux.
              </p>
            </section>

            {/* 4. Cookies */}
            <section id="cookies">
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookies</h2>
              <p className="mb-3">StudyFlow utilise uniquement des cookies techniques strictement nécessaires :</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Cookie</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Rôle</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-4 py-3 font-mono text-xs">token</td><td className="px-4 py-3">Session d&apos;authentification (JWT Firebase)</td><td className="px-4 py-3">7 jours</td></tr>
                    <tr><td className="px-4 py-3 font-mono text-xs">cookie_consent</td><td className="px-4 py-3">Mémorisation de votre choix sur la bannière cookies</td><td className="px-4 py-3">1 an</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Aucun cookie publicitaire, analytique ou de pistage n&apos;est utilisé.
              </p>
            </section>

            {/* 5. Hébergement */}
            <section id="hebergement">
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Hébergement & sous-traitants</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Service</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Fournisseur</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Localisation</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="px-4 py-3">Hébergement web</td><td className="px-4 py-3">Vercel</td><td className="px-4 py-3">USA (conforme RGPD via DPA)</td><td className="px-4 py-3">Servir l&apos;application</td></tr>
                    <tr><td className="px-4 py-3">Authentification</td><td className="px-4 py-3">Firebase Auth (Google)</td><td className="px-4 py-3">UE (eur3)</td><td className="px-4 py-3">Gestion des comptes</td></tr>
                    <tr><td className="px-4 py-3">Base de données</td><td className="px-4 py-3">Cloud Firestore (Google)</td><td className="px-4 py-3">UE (eur3)</td><td className="px-4 py-3">Stockage des données</td></tr>
                    <tr><td className="px-4 py-3">Intelligence artificielle</td><td className="px-4 py-3">Google Gemini API</td><td className="px-4 py-3">USA</td><td className="px-4 py-3">Réponses de l&apos;assistant</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 6. Droits RGPD */}
            <section id="droits">
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Vos droits (RGPD)</h2>
              <p className="mb-3">
                Conformément au Règlement Général sur la Protection des Données (UE 2016/679), vous disposez des droits suivants :
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600 shrink-0">Accès :</span>
                  Consulter toutes les données que nous détenons sur vous
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600 shrink-0">Rectification :</span>
                  Modifier vos informations depuis votre profil
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600 shrink-0">Suppression :</span>
                  Supprimer votre compte et toutes vos données depuis Paramètres &gt; Zone de danger
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600 shrink-0">Portabilité :</span>
                  Demander une copie de vos données dans un format lisible
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600 shrink-0">Opposition :</span>
                  Vous opposer au traitement de vos données
                </li>
              </ul>
              <p className="mt-4">
                Pour exercer vos droits, utilisez la fonction de suppression de compte dans les{' '}
                <Link href="/app/dashboard/settings" className="text-indigo-600 hover:underline font-medium">paramètres</Link>
                , ou contactez-nous par email (voir section Contact).
              </p>
            </section>

            {/* 7. Mineurs */}
            <section id="mineurs">
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Protection des mineurs</h2>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Les utilisateurs de moins de 15 ans doivent fournir l&apos;adresse email d&apos;un parent ou tuteur légal lors de l&apos;inscription.</li>
                <li>Le consentement parental est requis conformément à l&apos;article 8 du RGPD (âge fixé à 15 ans en France).</li>
                <li>Aucune donnée d&apos;un mineur n&apos;est utilisée à des fins commerciales.</li>
              </ul>
            </section>

            {/* 8. Sécurité */}
            <section id="securite">
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Sécurité</h2>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Mots de passe hashés par Firebase Authentication (bcrypt/scrypt)</li>
                <li>Communications chiffrées (HTTPS/TLS)</li>
                <li>Règles Firestore : chaque utilisateur ne peut accéder qu&apos;à ses propres données</li>
                <li>Tokens d&apos;authentification JWT avec expiration automatique</li>
              </ul>
            </section>

            {/* 9. Contact */}
            <section id="contact">
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
              <p>
                Pour toute question relative à vos données personnelles ou pour exercer vos droits, vous pouvez nous contacter :
              </p>
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p><strong>Email :</strong> contact@studyflow.fr</p>
                <p className="mt-1 text-sm text-gray-500">Nous nous engageons à répondre dans un délai de 30 jours.</p>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                En cas de litige, vous pouvez adresser une réclamation à la CNIL (Commission Nationale de l&apos;Informatique et des Libertés) : <a href="https://www.cnil.fr" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

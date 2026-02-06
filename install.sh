#!/bin/bash
# Installation et configuration complète du projet Site Étudiant

echo "════════════════════════════════════════════════════════════"
echo "   🎓 Site Étudiant - Installation Complète"
echo "════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📋 Étape 1: Installation des dépendances${NC}"
npm install

echo ""
echo -e "${BLUE}📋 Étape 2: Configuration des variables d'environnement${NC}"

if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo -e "${GREEN}✅ Fichier .env.local créé${NC}"
  echo -e "${YELLOW}⚠️  Veuillez remplir les variables dans .env.local:${NC}"
  echo "   - NEXT_PUBLIC_SUPABASE_URL"
  echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
  echo "   - SUPABASE_SERVICE_ROLE_KEY"
  echo "   - GEMINI_API_KEY"
  echo ""
  read -p "Appuyez sur Entrée quand vous avez configuré .env.local..."
else
  echo -e "${GREEN}✅ Fichier .env.local déjà présent${NC}"
fi

echo ""
echo -e "${BLUE}📋 Étape 3: Validation des variables d'environnement${NC}"
npm run build -- --webpack

echo ""
echo -e "${BLUE}📋 Étape 4: Lancement du serveur de développement${NC}"
npm run dev

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Installation complète!${NC}"
echo ""
echo -e "🌐 Ouvrez votre navigateur: ${BLUE}http://localhost:3000${NC}"
echo ""
echo "Prochaines étapes:"
echo "  1. Créer un compte sur la page d'inscription"
echo "  2. Faire le test de personnalité (Mon profil)"
echo "  3. Créer votre premier devoir"
echo "  4. Discuter avec l'assistant IA"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"

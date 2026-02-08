import type { Metadata } from "next";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyFlow - Plateforme d'apprentissage",
  description: "Plateforme d'aide aux etudiants - tableau de bord, devoirs, assistant IA et outils pedagogiques",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://mizan-al-sawt.vercel.app";
const title = "Mīzān al-Ṣawt — ميزان الصوت | Miroir Vocal & Justesse pour le Coran";
const description =
  "Application d’entraînement vocal personnel et de maîtrise du souffle pour la récitation du Coran. Analyse de hauteur en temps réel à 60 FPS, priorité absolue au Tajwīd, protection vocale et fonctionnement 100% local.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Mīzān al-Ṣawt",
  },
  description,
  keywords: [
    "Mizan al-Sawt",
    "ميزان الصوت",
    "entraînement vocal Coran",
    "récitation coranique",
    "tajwid",
    "justesse vocale",
    "maîtrise du souffle",
    "pitch detection",
    "voix Coran",
    "PWA",
  ],
  authors: [{ name: "Nova Skill Tech" }],
  creator: "Nova Skill Tech",
  applicationName: "Mīzān al-Ṣawt",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    title,
    description,
    siteName: "Mīzān al-Ṣawt",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mīzān al-Ṣawt — ميزان الصوت | Miroir Vocal & Justesse pour la Récitation du Coran",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
    creator: "@novaskilltech",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B132B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full bg-[#070D1E] text-slate-100 scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}

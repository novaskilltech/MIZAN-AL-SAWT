'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import {
  ArrowRight,
  Shield,
  Activity,
  Mic,
  Zap,
  Lock,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  Sliders,
  Volume2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#0B132B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Logo size="md" />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#vision" className="hover:text-white transition-colors">Vision</a>
            <a href="#methode" className="hover:text-white transition-colors">Méthode</a>
            <a href="#exercices" className="hover:text-white transition-colors">Exercices</a>
            <a href="#tajwid" className="hover:text-amber-400 transition-colors">Garde-fou Tajwīd</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-medium text-sm transition-all shadow-lg shadow-sky-600/30 active:scale-98 flex items-center gap-2 cursor-pointer"
            >
              <span>Lancer le Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-slate-800/60">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-sky-600/15 via-amber-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-300">
                Application Web PWA • 100% Locale & Confidentielle
              </span>
              <span className="text-xs text-amber-400 font-arabic">ميزان الصوت</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Réduis l’écart entre ce que ton oreille imagine et ce que ta voix produit.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              <strong>Mīzān al-Ṣawt</strong> est le miroir vocal conçu pour développer la stabilité,
              la justesse et la souplesse du souffle dans la récitation du Coran — sans forcer et en préservant scrupuleusement les règles du Tajwīd.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-3 w-full sm:w-auto">
              <Link
                href="/app"
                className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-base transition-all shadow-xl shadow-sky-600/25 active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Démarrer l’entraînement gratuit</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#methode"
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Découvrir la méthode</span>
              </a>
            </div>

            {/* Guarantee chips */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sans création de compte
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Aucun enregistrement envoyé au cloud
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Analyse audio en temps réel
              </span>
            </div>
          </div>

          {/* Hero Visual Mockup Preview */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-sky-500/20 via-slate-800/40 to-slate-900 border border-slate-700/80 shadow-2xl">
            <div className="relative rounded-[22px] overflow-hidden bg-[#0B132B] p-6 sm:p-8 border border-slate-800/80">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 ml-2 font-mono">
                    mizan-al-sawt.app • Analyse de hauteur en direct (60 FPS)
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ✓ Juste (145 Hz)
                </div>
              </div>

              {/* Graphic Mockup Area */}
              <div className="relative h-48 sm:h-64 rounded-2xl bg-[#070D1E] border border-slate-800 flex items-center justify-center overflow-hidden">
                {/* Visual soundwave and target ribbon mockup */}
                <svg className="w-full h-full" viewBox="0 0 600 200" fill="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

                  {/* Target Tolerance Corridor */}
                  <path
                    d="M 20,130 C 150,130 250,55 380,55 C 480,55 520,110 580,110 L 580,140 C 520,140 480,85 380,85 C 250,85 150,160 20,160 Z"
                    fill="rgba(224, 169, 109, 0.08)"
                  />
                  {/* Target Reference Line */}
                  <path
                    d="M 20,145 C 150,145 250,70 380,70 C 480,70 520,125 580,125"
                    stroke="#E0A96D"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Voice Curve Ribbon */}
                  <path
                    d="M 20,147 C 145,142 248,73 375,68 C 430,68 470,100 510,122"
                    stroke="#48CAE4"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="drop-shadow(0 0 8px rgba(72,202,228,0.8))"
                  />

                  {/* Playhead */}
                  <line x1="510" y1="10" x2="510" y2="190" stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" />
                  <circle cx="510" cy="122" r="7" fill="#48CAE4" filter="drop-shadow(0 0 6px #48CAE4)" />
                  <circle cx="510" cy="125" r="5" fill="#E0A96D" />
                </svg>

                <div className="absolute bottom-4 left-6 text-[11px] text-slate-500 font-mono">
                  Échelle adaptée à ta tessiture : 145 Hz médiane
                </div>
                <div className="absolute top-4 left-6 text-[11px] text-amber-400/90 font-medium">
                  Route vocale : Montée puis Descente (صعود ثم نزول)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Principle Section (Section 1 & 2 du CDC) */}
      <section id="vision" className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider block mb-2">
            La Vision Mīzān al-Ṣawt
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Un miroir bienveillant pour poser ta voix.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            L’objectif n’est pas d’apprendre à chanter ni de transformer la récitation en exercice musical, mais de développer la précision et la liberté vocale au service de la parole divine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">L’Oreille Intérieure</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Tu imagines des variations et de la beauté dans ta récitation, mais la voix hésite ou dévie. Le miroir vocal t’aide à synchroniser intention et phonation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Pas de Solfège Occidental</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Aucune notation Do-Ré-Mi déroutante. Les concepts sont intuitifs et naturels : <em>plus grave, plus aigu, monter, descendre, stabiliser, juste</em>.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Protection Vocale</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Séances calibrées de 10 à 15 minutes. Bouton d’arrêt permanent « Je sens une gêne » pour ne jamais forcer ni blesser tes cordes vocales.
            </p>
          </div>
        </div>
      </section>

      {/* Method Cycle Section (Section 3 du CDC) */}
      <section id="methode" className="py-20 bg-[#0B132B]/40 border-y border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block mb-2">
              Cycle Pédagogique
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Comment progresser séance après séance
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              Un cheminement éprouvé pour construire une mémoire mélodique et motrice solide.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { step: '01', title: 'Écouter', desc: 'Percevoir la hauteur avec calme' },
              { step: '02', title: 'Comprendre', desc: 'Visualiser la direction de la courbe' },
              { step: '03', title: 'Reproduire', desc: 'Mobiliser le souffle sans forcer' },
              { step: '04', title: 'Visualiser', desc: 'Voir sa trajectoire en direct à l’écran' },
              { step: '05', title: 'Corriger', desc: 'Ajuster les micro-déviations en cents' },
              { step: '06', title: 'Appliquer', desc: 'Intégrer le geste dans la récitation' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between"
              >
                <span className="text-xs font-mono font-bold text-sky-400 mb-2">{item.step}</span>
                <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Religious Safeguard Section (Section 32 & 33 du CDC) */}
      <section id="tajwid" className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-[#0B132B] border border-amber-800/40 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-4 inline-block">
              Règle d’Or • Garde-Fou Religieux
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
              Le Tajwīd prime toujours sur la mélodie.
            </h2>
            <blockquote className="border-l-2 border-amber-400 pl-4 py-1 italic text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
              « L’embellissement de la voix accompagne la récitation. Il ne doit en aucun cas transformer les règles de récitation. »
            </blockquote>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Mīzān al-Ṣawt ne cherche pas à former des chanteurs ni à enseigner des maqāmāt artificiels. Le travail est axé sur la souplesse naturelle pour respecter le makhraj des lettres, la durée des moudoud et la pureté de la psalmodie.
            </p>
          </div>
        </div>
      </section>

      {/* Features & Local-First (Section 5, 51, 52) */}
      <section className="py-20 bg-[#070D1E] border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider block mb-2">
              Ingénierie & Confidentialité
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Une technologie respectueuse de ta vie privée.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
              <Lock className="w-7 h-7 text-emerald-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-1">100% Hors-Ligne</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le flux audio ne quitte jamais ton navigateur. Aucune voix n’est transmise à aucun serveur distant.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
              <Activity className="w-7 h-7 text-sky-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-1">Algorithme YIN</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Détection de fréquence fondamentale instantanée sans latence, avec interpolation parabolique de précision.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
              <Volume2 className="w-7 h-7 text-amber-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-1">Guide Sonore Doux</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Oscillateur sinusoïdal sans harmoniques agressives pour éduquer l’oreille intérieure avant de vocaliser.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
              <Shield className="w-7 h-7 text-indigo-400 mb-4" />
              <h3 className="text-base font-bold text-white mb-1">Sauvegarde JSON</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Export et import de toutes tes données en un clic. Tu conserves le contrôle absolu de ta progression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-[#0D1B3E] via-[#0B132B] to-[#070D1E] border border-slate-700/80 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Prêt à poser ta voix avec sérénité ?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Aucune inscription requise. Commence ton premier exercice de tenue de hauteur en quelques secondes.
            </p>
            <div className="pt-2">
              <Link
                href="/app"
                className="inline-flex items-center gap-2.5 py-4 px-8 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-base transition-all shadow-xl shadow-sky-600/30 active:scale-98 cursor-pointer"
              >
                <span>Ouvrir Mīzān al-Ṣawt</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 bg-[#070D1E] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/novaskilltech/MIZAN-AL-SAWT" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              GitHub
            </a>
            <Link href="/app" className="hover:text-slate-300 transition-colors">
              Studio Vocal
            </Link>
          </div>
          <div>
            <span>© 2026 Mīzān al-Ṣawt • Conçu pour la récitation du Coran</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

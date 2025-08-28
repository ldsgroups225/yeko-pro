'use client'

import type { JSX } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  BookOpenIcon,
  GraduationCapIcon,
  HomeIcon,
  MailIcon,
  MapIcon,
  RefreshCcwIcon,
  SearchIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ModeToggle } from '@/components/ModeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Next.js 15 not-found.tsx convention
 * Premium 404 page for Yeko Pro educational platform
 * Features sophisticated animations and educational theming
 */
export default function NotFound(): JSX.Element {
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const slideUp = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-background to-orange-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/20">
      {/* Header with logo and theme toggle */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-border"
      >
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/logo.png"
                alt="Logo Yeko"
                className="h-12 w-12 group-hover:animate-ring"
                width={48}
                height={48}
                priority
              />
            </motion.div>
            <span className="text-xl font-semibold text-foreground">Yeko Pro</span>
          </Link>
          <ModeToggle />
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="w-full max-w-4xl mx-auto"
        >
          <div className="text-center space-y-8">
            {/* Animated 404 illustration */}
            <motion.div
              variants={slideUp}
              className="relative"
            >
              <motion.div
                animate={floatingAnimation}
                className="inline-block"
              >
                <div className="relative">
                  {/* Large 404 text with gradient */}
                  <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-orange-500 via-primary to-orange-600 bg-clip-text text-transparent leading-none">
                    404
                  </h1>

                  {/* Educational elements floating around */}
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      y: [0, -5, 5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute -top-4 -left-8 text-orange-400 dark:text-orange-300"
                  >
                    <GraduationCapIcon size={32} />
                  </motion.div>

                  <motion.div
                    animate={{
                      rotate: [0, -15, 15, 0],
                      x: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                    className="absolute -top-2 -right-12 text-primary"
                  >
                    <BookOpenIcon size={28} />
                  </motion.div>

                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-orange-500"
                  >
                    <MapIcon size={24} />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Error message */}
            <motion.div variants={slideUp} className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Page non trouvée
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Oups ! Il semblerait que cette page ait quitté l'école plus tôt que prévu.
                Ne vous inquiétez pas, nous avons quelques suggestions pour vous remettre sur la bonne voie.
              </p>
            </motion.div>

            {/* Action cards */}
            <motion.div variants={slideUp} className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <motion.div variants={scaleIn} whileHover={{ y: -2 }}>
                <Card className="h-full transition-all hover:shadow-lg border-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto">
                      <SearchIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Rechercher</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Utilisez notre moteur de recherche pour trouver ce que vous cherchez
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/?search=true">
                          <SearchIcon className="h-4 w-4 mr-2" />
                          Rechercher
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={scaleIn} whileHover={{ y: -2 }}>
                <Card className="h-full transition-all hover:shadow-lg border-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="rounded-full bg-orange-500/10 w-12 h-12 flex items-center justify-center mx-auto">
                      <BookOpenIcon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Documentation</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Consultez notre guide d'utilisation et FAQ
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/#faq">
                          <BookOpenIcon className="h-4 w-4 mr-2" />
                          Aide
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Main action buttons */}
            <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/">
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Retour à l'accueil
                </Link>
              </Button>

              <Button variant="outline" size="lg" onClick={() => window.history.back()} className="w-full sm:w-auto">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Page précédente
              </Button>

              <Button variant="ghost" size="lg" onClick={() => window.location.reload()} className="w-full sm:w-auto">
                <RefreshCcwIcon className="h-5 w-5 mr-2" />
                Actualiser
              </Button>
            </motion.div>

            {/* Help section */}
            <motion.div variants={slideUp}>
              <Card className="max-w-lg mx-auto border-0 bg-gradient-to-r from-orange-50 to-primary/5 dark:from-orange-950/20 dark:to-primary/10">
                <CardHeader className="text-center pb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Besoin d'assistance ?
                  </h3>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Notre équipe est là pour vous aider à naviguer dans Yeko Pro
                  </p>
                  <Button variant="secondary" asChild>
                    <Link href="mailto:support@yeko-pro.com">
                      <MailIcon className="h-4 w-4 mr-2" />
                      Contacter le support
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Error code */}
            <motion.div
              variants={slideUp}
              className="text-center space-y-2 opacity-60"
            >
              <div className="h-px bg-border max-w-xs mx-auto" />
              <p className="text-xs text-muted-foreground">
                Code d'erreur: 404 - Page non trouvée
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="py-6 text-center"
      >
        <p className="text-sm text-muted-foreground">
          © 2024 Yeko Pro. La transparence éducative.
        </p>
      </motion.footer>
    </div>
  )
}

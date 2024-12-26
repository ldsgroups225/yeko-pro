'use client'

import { ModeToggle } from '@/components/ModeToggle'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowRightIcon,
  BackpackIcon,
  BarChartIcon,
  ChatBubbleIcon,
  ClockIcon,
  Cross2Icon,
  HamburgerMenuIcon,
  InstagramLogoIcon,
  LinkedInLogoIcon,
  PersonIcon,
  ReaderIcon,
  TwitterLogoIcon,
} from '@radix-ui/react-icons'
import consola from 'consola'
import { motion } from 'framer-motion'
import { nanoid } from 'nanoid'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

const FeatureCard: React.FC<{
  title: string
  description: string
  icon: React.ElementType
}> = ({ title, description, icon: Icon }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Card className="h-full transition-all hover:shadow-lg">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <Icon className="h-12 w-12 text-primary mb-4" />
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
)

const TestimonialCard: React.FC<{ quote: string, author: string }> = ({
  quote,
  author,
}) => (
  <Card>
    <CardContent className="p-6">
      <p className="italic mb-4 text-muted-foreground">{quote}</p>
      <p className="font-semibold">{author}</p>
    </CardContent>
  </Card>
)

export default function PageMarketing() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isHamburgerMenuIconOpen, setIsHamburgerMenuIconOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    consola.log('Formulaire soumis:', { email, message })
    // Ajoutez ici la logique de soumission du formulaire
  }

  const features = [
    {
      title: 'Gestion des effectifs',
      icon: PersonIcon,
      description:
        'Gérez efficacement les dossiers des élèves, l&apos;assiduité et les performances.',
    },
    {
      title: 'Organisation des classes',
      icon: ReaderIcon,
      description:
        'Organisez facilement les classes, les emplois du temps et les programmes.',
    },
    {
      title: 'Suivi des enseignants',
      icon: BackpackIcon,
      description:
        'Surveillez les performances des enseignants et simplifiez les tâches administratives.',
    },
    {
      title: 'Suivi des performances',
      icon: BarChartIcon,
      description:
        'Suivez et analysez les métriques de performance des élèves et de l&apos;établissement.',
    },
    {
      title: 'Gestion de la ponctualité',
      icon: ClockIcon,
      description:
        'Suivez l&apos;assiduité et la ponctualité des élèves et du personnel.',
    },
    {
      title: 'Communication',
      icon: ChatBubbleIcon,
      description:
        'Facilitez la communication entre l&apos;école, les enseignants et les parents.',
    },
  ]

  const testimonials = [
    {
      role: 'director',
      quote:
        'Yeko Pro a révolutionné notre façon de gérer l&apos;école. Le tableau de bord complet et l&apos;interface intuitive ont considérablement amélioré notre efficacité.',
      author: '- Sarah Johnson, Directrice d&apos;école',
    },
    {
      role: 'enseignant',
      quote:
        'En tant qu&apos;enseignant, Yeko Pro a grandement facilité le suivi des progrès des élèves et la communication avec les parents. C&apos;est un outil indispensable dans mon travail quotidien.',
      author: '- Marc Dupont, Professeur de lycée',
    },
    {
      role: 'parent',
      quote:
        'Le portail parent de Yeko Pro me tient informé en temps réel des progrès de mon enfant. Cela a grandement amélioré mon implication dans son éducation.',
      author: '- Émilie Chen, Parent',
    },
  ]

  return (
    <div className="min-h-screen overflow-y-auto">
      <header className="bg-orange-100 dark:bg-orange-950/30 sticky top-0 z-10 border-b border-border">
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Logo Yeko"
              className="h-16 w-16"
              width={64}
              height={64}
            />
          </div>
          <nav className="hidden md:flex space-x-4">
            <Button variant="ghost">Fonctionnalités</Button>
            <Button variant="ghost">Témoignages</Button>
            <Button variant="ghost">FAQ</Button>
            <Button variant="ghost">Contact</Button>
          </nav>
          <div className="hidden md:flex items-center space-x-2">
            {/* <Button variant="ghost" asChild>
              <Link href="/auth">
                Connexion
              </Link>
            </Button> */}
            <Button asChild>
              <Link href="/sign-in">
                Commencer
              </Link>
            </Button>
            <ModeToggle />
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle />
            <Button variant="ghost" onClick={() => setIsHamburgerMenuIconOpen(!isHamburgerMenuIconOpen)}>
              {isHamburgerMenuIconOpen ? <Cross2Icon /> : <HamburgerMenuIcon />}
            </Button>
          </div>
        </div>
        {isHamburgerMenuIconOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-background p-4"
          >
            <nav className="flex flex-col space-y-2">
              <Button variant="ghost">Fonctionnalités</Button>
              <Button variant="ghost">Témoignages</Button>
              <Button variant="ghost">FAQ</Button>
              <Button variant="ghost">Contact</Button>
              <Button variant="ghost">Connexion</Button>
              <Button>Commencer</Button>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="container mx-auto mt-10 px-4">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            La Transparence Éducative
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Donnez du pouvoir à votre établissement éducatif avec Yeko Pro - la
            solution complète de gestion scolaire.
          </p>
          <Button size="lg">
            Essai gratuit
            {' '}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </motion.section>

        <section className="mb-20">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Fonctionnalités Clés
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <FeatureCard key={nanoid()} {...feature} />
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-semibold mb-8 text-center text-foreground">
            Ce que disent nos utilisateurs
          </h2>
          <Tabs defaultValue="director" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="director">Fondateur d&apos;école</TabsTrigger>
              <TabsTrigger value="enseignant">Enseignants</TabsTrigger>
              <TabsTrigger value="parent">Parents</TabsTrigger>
            </TabsList>
            {testimonials.map(testimonial => (
              <TabsContent key={nanoid()} value={testimonial.role}>
                <TestimonialCard
                  quote={testimonial.quote}
                  author={testimonial.author}
                />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-semibold mb-8 text-center text-foreground">
            Foire Aux Questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="w-full max-w-3xl mx-auto"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Quelle est la sécurité de Yeko Pro ?
              </AccordionTrigger>
              <AccordionContent>
                Yeko Pro utilise des mesures de sécurité et de cryptage de
                pointe pour garantir que vos données sont toujours protégées.
                Nous utilisons le cryptage SSL, effectuons des audits de
                sécurité réguliers et nous conformons à toutes les
                réglementations pertinentes en matière de protection des
                données.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Puis-je essayer Yeko Pro avant d'acheter ?
              </AccordionTrigger>
              <AccordionContent>
                Nous offrons un essai gratuit de 30 jours qui vous donne un
                accès complet à toutes les fonctionnalités de Yeko Pro. Cela
                vous permet d'expérimenter les capacités de la plateforme et de
                vous assurer qu'elle répond aux besoins de votre établissement
                avant de vous engager.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Yeko Pro convient-il à tous les types d'établissements
                d'enseignement ?
              </AccordionTrigger>
              <AccordionContent>
                Oui, Yeko Pro est conçu pour être flexible et évolutif. Il peut
                être personnalisé pour répondre aux besoins de divers
                établissements d'enseignement, des petites écoles privées aux
                grandes universités. Notre équipe peut vous aider à adapter le
                système à vos besoins spécifiques.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-semibold mb-8 text-center text-foreground">
            Contactez-nous
          </h2>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block mb-2 text-sm font-medium text-foreground"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    placeholder="Comment pouvons-nous vous aider ?"
                    rows={4}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                >
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">À propos de Yeko</h3>
              <p className="text-sm">
                Yeko Pro se consacre à l'amélioration de la gestion éducative
                grâce à des solutions technologiques innovantes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Tarification
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Politique de confidentialité
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Connectez-vous avec nous
              </h3>
              <div className="flex space-x-4">
                <a href="#" className="text-secondary-foreground hover:text-primary">
                  <LinkedInLogoIcon className="h-6 w-6" />
                </a>

                <a href="#" className="text-secondary-foreground hover:text-primary">
                  <TwitterLogoIcon className="h-6 w-6" />
                </a>

                <a href="#" className="text-secondary-foreground hover:text-primary">
                  <InstagramLogoIcon className="h-6 w-6" />
                </a>

              </div>

            </div>

          </div>

          <div className="mt-8 text-center text-sm">

            <p>&copy; 2024 Yeko Pro. Tous droits réservés.</p>

          </div>

        </div>

      </footer>

    </div>

  )
}

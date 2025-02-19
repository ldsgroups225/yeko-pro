import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { ReactQueryClientProvider } from '@/providers/ReactQueryClientProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Yeko',
  description: 'Yeko est une plateforme éducative le suivie de la vie scolaire des élèves par leur parent',
  icons: {
    icon: '/logo2.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ReactQueryClientProvider>
      <html lang="fr" suppressHydrationWarning>
        <body className={poppins.className}>

          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ReactQueryClientProvider>
  )
}

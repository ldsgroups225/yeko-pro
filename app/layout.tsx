import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Toaster } from '@/components/ui/sonner'
import { ReactQueryClientProvider } from '@/providers/ReactQueryClientProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import './globals.css'

const poppins = localFont({
  src: [
    {
      path: '../public/fonts/poppins-font/PoppinsRegular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/poppins-font/PoppinsItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/poppins-font/PoppinsMedium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/poppins-font/PoppinsMediumItalic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../public/fonts/poppins-font/PoppinsSemibold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/poppins-font/PoppinsSemiboldItalic.otf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../public/fonts/poppins-font/PoppinsBold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/poppins-font/PoppinsBoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
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

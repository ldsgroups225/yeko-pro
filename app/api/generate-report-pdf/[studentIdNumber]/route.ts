// app/api/generate-report-pdf/[studentIdNumber]/route.ts

import type { NextRequest } from 'next/server'
import type { CookieData } from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentIdNumber: string, semesterId: string }> },
) {
  const { studentIdNumber, semesterId } = await params

  if (!studentIdNumber) {
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin
    const reportPagePath = `/report-card-template/${studentIdNumber}`
    const reportUrl = new URL(reportPagePath, baseUrl)

    if (semesterId) {
      reportUrl.searchParams.set('semesterId', semesterId)
    }

    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--font-render-hinting=none', // Peut aider avec le rendu des polices sur certaines plateformes Linux
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })

    const page = await browser.newPage()

    const requestCookies = req.cookies.getAll()

    if (requestCookies.length > 0) {
      const puppeteerCookies: CookieData[] = requestCookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value,
        domain: new URL(reportUrl.toString()).hostname,
        path: '/',
        httpOnly: false,
        secure: new URL(reportUrl.toString()).protocol === 'https:',
        sameSite: 'Lax',
      }))
      await page.setCookie(...puppeteerCookies)
    }
    else {
      console.warn('No cookies found in the incoming request to set for Puppeteer. The template page might require authentication.')
    }

    await page.goto(reportUrl.toString(), { waitUntil: 'networkidle0', timeout: 60000 })

    const finalUrl = page.url()
    if (finalUrl.includes('/sign-in') || finalUrl.includes('/login')) {
      console.error(`Puppeteer was redirected to login page: ${finalUrl}. Authentication for Puppeteer's request to the template page likely failed.`)
      const pageContentForDebugging = await page.content()
      console.error('Content of the page Puppeteer landed on:', pageContentForDebugging.substring(0, 500))
      await browser.close()
      return NextResponse.json({ error: 'PDF generation failed: Puppeteer redirected to login. Ensure template page is accessible or auth cookies are correctly forwarded.' }, { status: 500 })
    }

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    })

    await browser.close()

    const studentName = studentIdNumber
    const termName = 'Trimestre'

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="bulletin_${studentName}_${termName}.pdf"`,
      },
    })
  }
  catch (error) {
    console.error('Error generating PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during PDF generation'
    return NextResponse.json({ error: 'Failed to generate PDF', details: errorMessage, stack: (error as Error).stack }, { status: 500 })
  }
}

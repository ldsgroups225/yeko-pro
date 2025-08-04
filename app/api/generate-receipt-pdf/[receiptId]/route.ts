// app/api/generate-receipt-pdf/[receiptId]/route.ts

import type { NextRequest } from 'next/server'
import type { CookieData } from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ receiptId: string }> },
) {
  const { receiptId } = await params

  if (!receiptId) {
    return NextResponse.json({ error: 'Receipt ID is required' }, { status: 400 })
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin
    const receiptPagePath = `/receipt-template/${receiptId}`
    const receiptUrl = new URL(receiptPagePath, baseUrl)

    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--font-render-hinting=none',
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })

    const page = await browser.newPage()

    // Forward authentication cookies
    const requestCookies = req.cookies.getAll()

    if (requestCookies.length > 0) {
      const puppeteerCookies: CookieData[] = requestCookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value,
        domain: new URL(receiptUrl.toString()).hostname,
        path: '/',
        httpOnly: false,
        secure: new URL(receiptUrl.toString()).protocol === 'https:',
        sameSite: 'Lax',
      }))
      await page.setCookie(...puppeteerCookies)
    }

    await page.goto(receiptUrl.toString(), { waitUntil: 'networkidle0', timeout: 60000 })

    // Check if redirected to login
    const finalUrl = page.url()
    if (finalUrl.includes('/sign-in') || finalUrl.includes('/login')) {
      console.error(`Puppeteer was redirected to login page: ${finalUrl}`)
      await browser.close()
      return NextResponse.json({
        error: 'PDF generation failed: Authentication required',
      }, { status: 500 })
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

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="recu_paiement_${receiptId}.pdf"`,
      },
    })
  }
  catch (error) {
    console.error('Error generating receipt PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during PDF generation'
    return NextResponse.json({
      error: 'Failed to generate receipt PDF',
      details: errorMessage,
    }, { status: 500 })
  }
}

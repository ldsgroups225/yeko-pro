// app/api/generate-conduct-report-pdf/route.ts

import type { NextRequest } from 'next/server'
import type { CookieData } from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // Extract query parameters for filtering
  const classId = searchParams.get('classId')
  const gradeFilter = searchParams.get('gradeFilter')
  const schoolYearId = searchParams.get('schoolYearId')
  const semesterId = searchParams.get('semesterId')

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin
    const reportPagePath = '/conduct-report-template'
    const reportUrl = new URL(reportPagePath, baseUrl)

    // Add query parameters to the template URL
    if (classId)
      reportUrl.searchParams.set('classId', classId)
    if (gradeFilter)
      reportUrl.searchParams.set('gradeFilter', gradeFilter)
    if (schoolYearId)
      reportUrl.searchParams.set('schoolYearId', schoolYearId)
    if (semesterId)
      reportUrl.searchParams.set('semesterId', semesterId)

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
        domain: new URL(reportUrl.toString()).hostname,
        path: '/',
        httpOnly: false,
        secure: new URL(reportUrl.toString()).protocol === 'https:',
        sameSite: 'Lax',
      }))
      await page.setCookie(...puppeteerCookies)
    }

    await page.goto(reportUrl.toString(), { waitUntil: 'networkidle0', timeout: 60000 })

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

    // Generate filename based on filters
    const getFileName = () => {
      const date = new Date().toISOString().split('T')[0]
      let filename = `rapport_conduite_${date}`

      if (classId) {
        filename += `_classe_${classId}`
      }
      if (gradeFilter) {
        filename += `_${gradeFilter.toLowerCase()}`
      }

      return `${filename}.pdf`
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${getFileName()}"`,
      },
    })
  }
  catch (error) {
    console.error('Error generating conduct report PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during PDF generation'
    return NextResponse.json({
      error: 'Failed to generate conduct report PDF',
      details: errorMessage,
    }, { status: 500 })
  }
}

// app/api/generate-report-pdf/[studentIdNumber]/route.ts

import type { NextRequest } from 'next/server'
import chromium from '@sparticuz/chromium'
import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentIdNumber: string }> },
) {
  const { studentIdNumber } = await params
  // const termId = req.nextUrl.searchParams.get('termId'); // Optional: if you pass termId

  console.warn(`[PDF Generation START] Student ID: ${studentIdNumber}, Time: ${new Date().toISOString()}`) // Changed to console.warn for Vercel

  if (!studentIdNumber) {
    console.error('[PDF Generation ERROR] Student ID is required')
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
  }

  let startTime: number = Date.now() // Declare startTime here

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin
    const reportUrl = `${baseUrl}/report-card-template/${studentIdNumber}`
    // if (termId) {
    //   reportUrl += `?termId=${termId}`;
    // }

    console.warn(`[PDF Generation INFO] Attempting to generate PDF from URL: ${reportUrl}`) // Changed to console.warn
    startTime = Date.now() // Assign value here, inside try, before operations
    console.warn(`[PDF Generation INFO] Current time before Puppeteer launch: ${new Date(startTime).toISOString()}`) // Changed to console.warn

    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        // Recommended args for serverless environments:
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Important for Vercel/AWS Lambda
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        // '--single-process', // Disables sandboxing, use with caution if other args don't work
        '--disable-gpu',
        '--font-render-hinting=none', // May help with font rendering issues/speed
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless, // Should be true for serverless
    })

    const launchTime = Date.now()
    console.warn(`[PDF Generation INFO] Puppeteer launched in ${launchTime - startTime}ms. Current time: ${new Date(launchTime).toISOString()}`) // Changed to console.warn
    const page = await browser.newPage()
    const pageCreationTime = Date.now()
    console.warn(`[PDF Generation INFO] New page created in ${pageCreationTime - launchTime}ms. Current time: ${new Date(pageCreationTime).toISOString()}`) // Changed to console.warn

    await page.goto(reportUrl, { waitUntil: 'networkidle0', timeout: 45000 })
    const gotoTime = Date.now()
    console.warn(`[PDF Generation INFO] Page navigation to ${reportUrl} complete in ${gotoTime - pageCreationTime}ms. Current time: ${new Date(gotoTime).toISOString()}`) // Changed to console.warn

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
    const pdfCreationTime = Date.now()
    console.warn(`[PDF Generation INFO] PDF buffer created in ${pdfCreationTime - gotoTime}ms. Current time: ${new Date(pdfCreationTime).toISOString()}`) // Changed to console.warn

    await browser.close()
    const browserCloseTime = Date.now()
    console.warn(`[PDF Generation INFO] Browser closed in ${browserCloseTime - pdfCreationTime}ms. Current time: ${new Date(browserCloseTime).toISOString()}`) // Changed to console.warn

    const studentName = studentIdNumber
    const termName = 'Trimestre'

    console.warn(`[PDF Generation SUCCESS] PDF generated for ${studentIdNumber}. Total time: ${Date.now() - startTime}ms. Time: ${new Date().toISOString()}`) // Changed to console.warn
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="bulletin_${studentName}_${termName}.pdf"`,
      },
    })
  }
  catch (error) {
    const endTime = Date.now()
    // startTime is now accessible here
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during PDF generation'
    const errorStack = error instanceof Error ? error.stack : 'No stack available'
    console.error(`[PDF Generation ERROR] Student ID: ${studentIdNumber}, Error: ${errorMessage}, Stack: ${errorStack}, Total time before error: ${endTime - startTime}ms, Time: ${new Date(endTime).toISOString()}`)
    return NextResponse.json({ error: 'Failed to generate PDF', details: errorMessage, stack: errorStack }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

export async function GET() {
  const healthcheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  }

  return NextResponse.json(healthcheck, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

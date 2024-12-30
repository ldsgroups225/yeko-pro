import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

async function fetchHealthStatus() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`, {
    cache: 'no-store', // Ensure the response is not cached
  })
  if (!res.ok) {
    throw new Error('Failed to fetch health status')
  }
  return res.json()
}

export default async function HealthPage() {
  const health = await fetchHealthStatus()

  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(2)} MB`
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  return (
    <div className="container mx-auto p-4 flex items-center justify-center h-screen w-full">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">System Health Status</h2>
            <Badge variant={health?.status === 'healthy' ? 'success' : 'destructive'}>
              {health?.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{new Date(health?.timestamp || '').toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="font-medium">{formatUptime(health?.uptime || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-medium">{health?.version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Memory Usage</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Heap Total</p>
                  <p className="font-medium">{formatBytes(health?.memoryUsage.heapTotal || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Heap Used</p>
                  <p className="font-medium">{formatBytes(health?.memoryUsage.heapUsed || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RSS</p>
                  <p className="font-medium">{formatBytes(health?.memoryUsage.rss || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">External</p>
                  <p className="font-medium">{formatBytes(health?.memoryUsage.external || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

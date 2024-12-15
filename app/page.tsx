import { DashboardButtons } from '@/app/DashboardButtons'
import { Suspense } from 'react'

export default function Home() {
  return (
    <>
      <header className="px-4 py-2">
        <div className="flex justify-between items-center">
          <span>Yeko Pro</span>
          <Suspense>
            <DashboardButtons />
          </Suspense>
        </div>
      </header>
      <main className="container max-w-2xl flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-extrabold my-8 text-center leading-relaxed">
          Yeko Pro
        </h1>
      </main>
    </>
  )
}

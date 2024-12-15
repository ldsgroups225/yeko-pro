import type { ReactNode } from 'react'
import { Component } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: ReactNode | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: unknown) {
    const errorText = `${(error as string).toString()}`
    if (
      errorText.includes('@clerk/clerk-react')
      && errorText.includes('publishableKey')
    ) {
      const [clerkDashboardUrl] = errorText.match(/https:\S+/) ?? []
      return {
        error: (
          <>
            <p>
              Add
              {' '}
              <code>
                NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
                {'<your publishable key>'}
              </code>
              {' '}
              to the
              {' '}
              <code>.env.local</code>
              {' '}
              file.
            </p>
            {clerkDashboardUrl
              ? (
                  <p>
                    You can find it at
                    {' '}
                    <a href={clerkDashboardUrl} target="_blank">{clerkDashboardUrl}</a>
                  </p>
                )
              : null}
            <p style={{ paddingLeft: '2rem', color: 'gray' }}>
              Raw error:
              {' '}
              {errorText}
            </p>
          </>
        ),
      }
    }

    // propagate error to Next.js provided error boundary
    throw error
  }

  componentDidCatch() {}

  render() {
    if (this.state.error !== null) {
      return (
        <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.3)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            Caught an error while rendering:
          </h1>
          {this.state.error}
        </div>
      )
    }

    return this.props.children
  }
}

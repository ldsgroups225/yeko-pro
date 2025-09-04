'use client' // Error boundaries must be Client Components

import { useEffect, useState } from 'react'

/**
 * Global Error boundary for Yeko Pro
 * Handles critical application errors that occur in the root layout
 * Must include its own <html> and <body> tags as it replaces the root layout
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Log error to monitoring service
    console.error('Global error occurred:', error)

    // Optional: Send error to external monitoring service
    // trackError(error, 'global-error')
  }, [error])

  useEffect(() => {
    // Auto-refresh after 30 seconds if user doesn't interact
    const refreshTimeout = setTimeout(() => {
      if (typeof window !== 'undefined') {
        setShowModal(true)
      }
    }, 30000)

    // Add click handler to clear timeout
    const handleClick = () => clearTimeout(refreshTimeout)
    document.addEventListener('click', handleClick)

    // Add keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + R to refresh
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault()
        window.location.reload()
      }

      // Cmd/Ctrl + H to go home
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault()
        window.location.href = '/'
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      clearTimeout(refreshTimeout)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <html lang="fr" className="h-full">
      <head>
        <title>Erreur Système - Yeko Pro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo2.png" />
        <style jsx global>
          {`
          /* Critical CSS for error page */
          * {
            box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            :root {
              --primary: 21 90.2% 48.2%;
              --primary-foreground: 0 0% 100%;
              --background: 21 100% 95%;
              --foreground: 21 5% 3%;
              --muted: -17 30% 85%;
              --muted-foreground: 21 5% 35%;
              --card: 21 50% 90%;
              --card-foreground: 21 5% 10%;
              --border: 21 30% 50%;
              --destructive: 0 84.2% 60.2%;
              --destructive-foreground: 0 0% 98%;
              --radius: 0.3rem;
            }
            
            @media (prefers-color-scheme: dark) {
              :root {
                --background: 21 50% 5%;
                --foreground: 21 5% 90%;
                --card: 21 50% 3%;
                --card-foreground: 21 5% 90%;
                --muted: -17 30% 15%;
                --muted-foreground: 21 5% 60%;
                --border: 21 30% 18%;
              }
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(21 100% 97%) 50%, hsl(21 50% 92%) 100%);
              color: hsl(var(--foreground));
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 1rem;
              line-height: 1.5;
            }
            
            .error-container {
              max-width: 600px;
              width: 100%;
              text-align: center;
              background: hsl(var(--card) / 0.8);
              backdrop-filter: blur(10px);
              border: 1px solid hsl(var(--border) / 0.3);
              border-radius: calc(var(--radius) * 3);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              animation: slideUp 0.6s ease-out;
            }
            
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .error-header {
              background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(21 85% 55%) 100%);
              color: hsl(var(--primary-foreground));
              padding: 2rem;
              position: relative;
              overflow: hidden;
            }
            
            .error-header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: pulse 4s ease-in-out infinite;
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.05); }
            }
            
            .error-icon {
              width: 64px;
              height: 64px;
              margin: 0 auto 1rem;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2rem;
              position: relative;
              z-index: 1;
              animation: shake 0.5s ease-in-out;
            }
            
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-4px); }
              75% { transform: translateX(4px); }
            }
            
            .error-title {
              font-size: 1.75rem;
              font-weight: 700;
              margin-bottom: 0.5rem;
              position: relative;
              z-index: 1;
            }
            
            .error-subtitle {
              font-size: 1rem;
              opacity: 0.9;
              position: relative;
              z-index: 1;
            }
            
            .error-content {
              padding: 2rem;
              space-y: 1.5rem;
            }
            
            .error-message {
              background: hsl(var(--muted) / 0.5);
              border-radius: var(--radius);
              padding: 1rem;
              margin: 1.5rem 0;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 0.875rem;
              text-align: left;
              border-left: 4px solid hsl(var(--destructive));
              color: hsl(var(--muted-foreground));
            }
            
            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-top: 2rem;
              flex-wrap: wrap;
            }
            
            .btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              border-radius: var(--radius);
              font-size: 0.875rem;
              font-weight: 500;
              transition: all 0.2s ease;
              text-decoration: none;
              border: none;
              cursor: pointer;
              padding: 0.75rem 1.5rem;
              min-width: 120px;
            }
            
            .btn-primary {
              background: hsl(var(--primary));
              color: hsl(var(--primary-foreground));
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .btn-primary:hover {
              background: hsl(var(--primary) / 0.9);
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }
            
            .btn-secondary {
              background: transparent;
              color: hsl(var(--foreground));
              border: 1px solid hsl(var(--border));
            }
            
            .btn-secondary:hover {
              background: hsl(var(--muted));
              transform: translateY(-1px);
            }
            
            .error-details {
              margin-top: 2rem;
              padding-top: 2rem;
              border-top: 1px solid hsl(var(--border) / 0.3);
            }
            
            .details-toggle {
              background: none;
              border: none;
              color: hsl(var(--muted-foreground));
              font-size: 0.875rem;
              cursor: pointer;
              text-decoration: underline;
              margin-bottom: 1rem;
            }
            
            .details-content {
              display: none;
              text-align: left;
              font-size: 0.75rem;
              color: hsl(var(--muted-foreground));
              background: hsl(var(--muted) / 0.3);
              border-radius: var(--radius);
              padding: 1rem;
            }
            
            .details-content.show {
              display: block;
            }
            
            .logo-container {
              position: absolute;
              top: 2rem;
              left: 2rem;
              display: flex;
              align-items: center;
              gap: 0.75rem;
              color: hsl(var(--foreground));
              text-decoration: none;
              font-weight: 600;
              z-index: 10;
            }
            
            .logo {
              width: 40px;
              height: 40px;
              background: hsl(var(--primary));
              border-radius: var(--radius);
              display: flex;
              align-items: center;
              justify-content: center;
              color: hsl(var(--primary-foreground));
              font-weight: bold;
            }
            
            @media (max-width: 640px) {
              .error-title { font-size: 1.5rem; }
              .error-actions { flex-direction: column; align-items: center; }
              .btn { width: 100%; max-width: 200px; }
              .logo-container { position: static; justify-content: center; margin-bottom: 2rem; }
            }
            
            .footer {
              position: absolute;
              bottom: 1rem;
              left: 50%;
              transform: translateX(-50%);
              font-size: 0.75rem;
              color: hsl(var(--muted-foreground));
              opacity: 0.7;
            }
          `}
        </style>
      </head>
      <body>
        {/* Logo */}
        <a href="/" className="logo-container">
          <div className="logo">Y</div>
          <span>Yeko Pro</span>
        </a>

        <div className="error-container">
          {/* Header */}
          <div className="error-header">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">Erreur Système</h1>
            <p className="error-subtitle">
              Une erreur critique s'est produite dans l'application
            </p>
          </div>

          {/* Content */}
          <div className="error-content">
            <p style={{ fontSize: '1rem', marginBottom: '1rem', color: 'hsl(var(--muted-foreground))' }}>
              Nous sommes désolés, mais quelque chose s'est mal passé.
              Notre équipe technique a été automatiquement notifiée de ce problème.
            </p>

            {/* Error message */}
            <div className="error-message">
              <strong>Détails de l'erreur:</strong>
              <br />
              <code>{error.message || 'Une erreur inattendue s\'est produite'}</code>
              {error.digest && (
                <>
                  <br />
                  <br />
                  <strong>ID d'erreur:</strong>
                  {' '}
                  <code>{error.digest}</code>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="error-actions">
              <button
                className="btn btn-primary"
                onClick={reset}
                type="button"
              >
                🔄 Réessayer
              </button>
              {/* <a
                href="/"
                className="btn btn-secondary"
              >
                🏠 Accueil
              </a> */}
              <a
                href="mailto:support@yeko-pro.com?subject=Erreur Système - ID: {error.digest || 'N/A'}"
                className="btn btn-secondary"
              >
                📧 Support
              </a>
            </div>

            {/* Error details (expandable) */}
            <div className="error-details">
              <button
                type="button"
                className="details-toggle"
                onClick={(e) => {
                  const target = e.target as HTMLButtonElement
                  const content = target.nextElementSibling as HTMLElement
                  if (content) {
                    content.classList.toggle('show')
                    target.textContent = content.classList.contains('show')
                      ? 'Masquer les détails techniques'
                      : 'Afficher les détails techniques'
                  }
                }}
              >
                Afficher les détails techniques
              </button>
              <div className="details-content">
                <strong>Stack Trace:</strong>
                <br />
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.7rem',
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
                >
                  {error.stack || 'Stack trace non disponible'}
                </pre>
                <br />
                <strong>Informations système:</strong>
                <br />
                • Navigateur:
                {' '}
                {typeof navigator !== 'undefined' ? navigator.userAgent : 'Non disponible'}
                <br />
                • Horodatage:
                {' '}
                {new Date().toLocaleString('fr-FR')}
                <br />
                • URL:
                {' '}
                {typeof window !== 'undefined' ? window.location.href : 'Non disponible'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          &copy; 2024 Yeko Pro - La transparence &eacute;ducative
        </div>

        <script />
        <script type="text/javascript" src="/js/error-handler.js" />
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Rafraîchissement automatique</h3>
              <p className="mb-4">Voulez-vous rafraîchir automatiquement la page ?</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Oui
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Non
                </button>
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  )
}

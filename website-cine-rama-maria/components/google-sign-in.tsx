'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with'
  redirectTo?: string
}

export function GoogleSignInButton({ text = 'continue_with', redirectTo = '/' }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { loginWithGoogle } = useAuthStore()
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

  useEffect(() => {
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') return

    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential: string }) => {
            const success = await loginWithGoogle(response.credential)
            if (success) {
              router.push(redirectTo)
            }
          },
        })
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: text,
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup script if component unmounts
      const existing = document.head.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existing) existing.remove()
    }
  }, [clientId, text, loginWithGoogle, router, redirectTo])

  // If no client ID configured, show a styled fallback button
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
    return (
      <button
        type="button"
        className="w-full py-3 rounded-lg border border-border bg-secondary/50 text-foreground font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-3"
        onClick={() => alert('Google Sign-In requiere configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID en .env.local')}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuar con Google
      </button>
    )
  }

  return <div ref={buttonRef} className="w-full flex justify-center" />
}

import type { GoogleProfile } from '@/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createUserFromGoogleProfile,
  getGoogleProfile,
  hasGoogleAccountLinked,
  signInWithGoogle,
  signUpWithGoogle,
} from '../oauthService'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithOAuth: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    getUser: vi.fn(),
    linkIdentity: vi.fn(),
    unlinkIdentity: vi.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn(),
    select: vi.fn(),
  })),
}

// Mock createClient
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// Mock environment variables
vi.mock('@/lib/utils/EnvServer', () => ({
  getEnvOrThrowServerSide: vi.fn(() => ({
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  })),
}))

describe('oAuth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signInWithGoogle', () => {
    it('should initiate Google OAuth sign-in successfully', async () => {
      const mockAuthUrl = 'https://accounts.google.com/oauth/authorize?...'
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: mockAuthUrl },
        error: null,
      })

      const result = await signInWithGoogle()

      expect(result).toEqual({
        success: true,
        url: mockAuthUrl,
      })

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          scopes: 'email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
    })

    it('should handle OAuth initialization errors', async () => {
      const errorMessage = 'OAuth provider not configured'
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      })

      const result = await signInWithGoogle()

      expect(result).toEqual({
        success: false,
        error: errorMessage,
      })
    })

    it('should use custom options when provided', async () => {
      const customOptions = {
        redirectTo: 'http://localhost:3000/custom-callback',
        scopes: ['email', 'profile', 'openid'],
      }

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://auth.url' },
        error: null,
      })

      await signInWithGoogle(customOptions)

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: customOptions.redirectTo,
          scopes: customOptions.scopes.join(' '),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
    })
  })

  describe('signUpWithGoogle', () => {
    it('should use the same flow as sign-in', async () => {
      const mockAuthUrl = 'https://accounts.google.com/oauth/authorize?...'
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: mockAuthUrl },
        error: null,
      })

      const result = await signUpWithGoogle()

      expect(result).toEqual({
        success: true,
        url: mockAuthUrl,
      })

      // Should call the same OAuth method as sign-in
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalled()
    })
  })

  describe('createUserFromGoogleProfile', () => {
    const mockGoogleProfile: GoogleProfile = {
      sub: 'google-user-id-123',
      email: 'user@example.com',
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
      picture: 'https://example.com/avatar.jpg',
      email_verified: true,
      locale: 'fr',
    }

    it('should create user profile successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })
      mockSupabaseClient.from = mockFrom

      const result = await createUserFromGoogleProfile('user-id-123', mockGoogleProfile)

      expect(result.success).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('users')
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'user-id-123',
        email: mockGoogleProfile.email,
        first_name: mockGoogleProfile.given_name,
        last_name: mockGoogleProfile.family_name,
        avatar_url: mockGoogleProfile.picture,
        email_verified: mockGoogleProfile.email_verified,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    })

    it('should handle database insertion errors', async () => {
      const mockError = { message: 'Database error' }
      const mockInsert = vi.fn().mockResolvedValue({ error: mockError })
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })
      mockSupabaseClient.from = mockFrom

      const result = await createUserFromGoogleProfile('user-id-123', mockGoogleProfile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })

    it('should handle profiles with only full name', async () => {
      const profileWithFullNameOnly: GoogleProfile = {
        ...mockGoogleProfile,
        given_name: '',
        family_name: '',
        name: 'Jane Smith',
      }

      const mockInsert = vi.fn().mockResolvedValue({ error: null })
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })
      mockSupabaseClient.from = mockFrom

      await createUserFromGoogleProfile('user-id-123', profileWithFullNameOnly)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Jane',
          last_name: 'Smith',
        }),
      )
    })
  })

  describe('hasGoogleAccountLinked', () => {
    it('should return true when Google account is linked', async () => {
      const mockUser = {
        id: 'user-id-123',
        identities: [
          { provider: 'google', id: 'google-identity-id' },
          { provider: 'email', id: 'email-identity-id' },
        ],
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await hasGoogleAccountLinked('user-id-123')

      expect(result).toBe(true)
    })

    it('should return false when no Google account is linked', async () => {
      const mockUser = {
        id: 'user-id-123',
        identities: [
          { provider: 'email', id: 'email-identity-id' },
        ],
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await hasGoogleAccountLinked('user-id-123')

      expect(result).toBe(false)
    })

    it('should return false when user has no identities', async () => {
      const mockUser = {
        id: 'user-id-123',
        identities: [],
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await hasGoogleAccountLinked('user-id-123')

      expect(result).toBe(false)
    })

    it('should return false when user is not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await hasGoogleAccountLinked('user-id-123')

      expect(result).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      })

      const result = await hasGoogleAccountLinked('user-id-123')

      expect(result).toBe(false)
    })
  })

  describe('getGoogleProfile', () => {
    const mockGoogleProfile: GoogleProfile = {
      sub: 'google-user-id-123',
      email: 'user@example.com',
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
      picture: 'https://example.com/avatar.jpg',
      email_verified: true,
      locale: 'fr',
    }

    it('should return Google profile when user has Google identity', async () => {
      const mockUser = {
        id: 'user-id-123',
        identities: [
          {
            provider: 'google',
            id: 'google-identity-id',
            identity_data: mockGoogleProfile,
          },
        ],
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await getGoogleProfile()

      expect(result).toEqual(mockGoogleProfile)
    })

    it('should return null when user has no Google identity', async () => {
      const mockUser = {
        id: 'user-id-123',
        identities: [
          { provider: 'email', id: 'email-identity-id' },
        ],
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await getGoogleProfile()

      expect(result).toBeNull()
    })

    it('should return null when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getGoogleProfile()

      expect(result).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Network error'))

      const result = await getGoogleProfile()

      expect(result).toBeNull()
    })
  })
})

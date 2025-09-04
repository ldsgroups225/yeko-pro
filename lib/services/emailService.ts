import type { ERole } from '@/types'
import { Resend } from 'resend'
import { roleToFrenchName } from '@/types'

export interface EmailTemplate {
  subject: string
  html: string
}

export interface InvitationEmailData {
  email: string
  otp: string
  schoolName: string
  schoolCode: string
  userExists: boolean
  role: ERole
  gradeName?: string
}

/**
 * Email service for sending notifications
 */
export class EmailService {
  private resend: Resend
  private siteUrl: string

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY)
    this.siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yeko-pro.com'
  }

  /**
   * Generate invitation email template
   */
  private generateInvitationEmail(data: InvitationEmailData): EmailTemplate {
    const { otp, schoolName, schoolCode, userExists, role, gradeName } = data
    const roleText = roleToFrenchName[role]

    const subject = `Invitation à rejoindre ${schoolName} sur Yeko Pro`

    const htmlContent = userExists
      ? this.generateExistingUserTemplate(otp, schoolName, schoolCode, roleText, gradeName)
      : this.generateNewUserTemplate(otp, schoolName, schoolCode, roleText, gradeName)

    return { subject, html: htmlContent }
  }

  private generateExistingUserTemplate(otp: string, schoolName: string, schoolCode: string, roleText: string, gradeName?: string): string {
    const gradeText = gradeName ? ` de niveau ${gradeName}` : ''

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Yeko Pro</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">Système de Gestion Scolaire</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Invitation à rejoindre une école</h2>
        
        <p style="color: #374151; line-height: 1.6;">
          Bonjour,<br><br>
          Vous avez été invité(e) à rejoindre <strong>${schoolName}</strong> (${schoolCode}) sur Yeko Pro avec le rôle de <strong>${roleText}</strong>${gradeText}.
        </p>
        
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <p style="color: #1e40af; font-weight: bold; margin: 0 0 10px 0; font-size: 18px;">Votre code OTP:</p>
          <p style="color: #1e40af; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</p>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          <strong>Instructions:</strong><br>
          1. Connectez-vous à votre compte Yeko Pro<br>
          2. Communiquez ce code OTP au directeur de l'école<br>
          3. Il pourra alors vous ajouter à son école
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.siteUrl}/sign-in" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Se connecter à Yeko Pro</a>
        </div>
      </div>
      
      <div style="text-align: center; color: #6b7280; font-size: 14px;">
        <p>Ce code expire dans 3 minutes.</p>
        <p>Si vous n'avez pas demandé cette invitation, vous pouvez ignorer ce message.</p>
      </div>
    </div>
    `
  }

  private generateNewUserTemplate(otp: string, schoolName: string, schoolCode: string, roleText: string, gradeName?: string): string {
    const gradeText = gradeName ? ` de niveau ${gradeName}` : ''

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Yeko Pro</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">Système de Gestion Scolaire</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Invitation à rejoindre une école</h2>
        
        <p style="color: #374151; line-height: 1.6;">
          Bonjour,<br><br>
          Vous avez été invité(e) à rejoindre <strong>${schoolName}</strong> (${schoolCode}) sur Yeko Pro avec le rôle de <strong>${roleText}</strong>${gradeText}.
        </p>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="color: #92400e; font-weight: bold; margin: 0 0 10px 0;">⚠️ Compte non trouvé</p>
          <p style="color: #92400e; margin: 0;">
            Vous n'avez pas encore de compte Yeko Pro. Veuillez d'abord créer un compte.
          </p>
        </div>
        
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <p style="color: #1e40af; font-weight: bold; margin: 0 0 10px 0; font-size: 18px;">Votre code OTP:</p>
          <p style="color: #1e40af; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</p>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          <strong>Instructions:</strong><br>
          1. Créez d'abord un compte sur Yeko Pro<br>
          2. Une fois connecté, communiquez ce code OTP au directeur de l'école<br>
          3. Il pourra alors vous ajouter à son école
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.siteUrl}/sign-up" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Créer un compte</a>
          <a href="${this.siteUrl}/sign-in" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Se connecter</a>
        </div>
      </div>
      
      <div style="text-align: center; color: #6b7280; font-size: 14px;">
        <p>Ce code expire dans 3 minutes.</p>
        <p>Si vous n'avez pas demandé cette invitation, vous pouvez ignorer ce message.</p>
      </div>
    </div>
    `
  }

  /**
   * Send invitation email
   */
  async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
    const template = this.generateInvitationEmail(data)

    try {
      await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@yeko-pro.com',
        to: data.email,
        subject: template.subject,
        html: template.html,
      })
    }
    catch (error) {
      console.error('Failed to send invitation email:', error)
      throw new Error('Failed to send invitation email')
    }
  }
}

/**
 * Factory function to create email service
 */
export function createEmailService(): EmailService {
  return new EmailService()
}

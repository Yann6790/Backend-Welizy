import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { TeacherCredentialsPayload } from './types/mail.types';

@Injectable()
export class MailService {
  private readonly resend?: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      'onboarding@resend.dev';

    if (apiKey && apiKey.trim() !== '') {
      try {
        this.resend = new Resend(apiKey);
      } catch (err) {
        console.warn(
          '[MailService] Impossible d\'initialiser Resend:',
          err?.message,
        );
      }
    } else {
      console.warn(
        '[MailService] RESEND_API_KEY non fournie. Les emails d\'invitation ne seront pas envoyés via Resend.',
      );
    }

    this.fromEmail = fromEmail;
  }

  async sendTeacherCredentials(
    payload: TeacherCredentialsPayload,
  ): Promise<void> {
    if (!this.resend) {
      console.log(
        `[MailService Mock] Email pour ${payload.email} — Mot de passe temporaire : ${payload.temporaryPassword}`,
      );
      return;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: payload.email,
        subject: 'Bienvenue sur la plateforme SAE — Vos identifiants',
        html: this.buildTeacherWelcomeTemplate(payload),
      });

      if (error) {
        console.warn(
          `[MailService] Erreur retournée par Resend pour ${payload.email}:`,
          error,
        );
      }
    } catch (err) {
      console.warn(
        `[MailService] Échec lors de l'envoi d'email à ${payload.email}:`,
        err?.message,
      );
    }
  }

  private buildTeacherWelcomeTemplate(
    payload: TeacherCredentialsPayload,
  ): string {
    const fullName = `${payload.firstname} ${payload.lastname || ''}`.trim();
    return `
      <h1>Bienvenue, ${fullName} !</h1>
      <p>Votre compte professeur a été créé sur la plateforme SAE.</p>
      <p><strong>Email :</strong> ${payload.email}</p>
      <p><strong>Mot de passe temporaire :</strong> ${payload.temporaryPassword}</p>
      <p>Veuillez vous connecter et changer votre mot de passe dès que possible.</p>
    `;
  }
}

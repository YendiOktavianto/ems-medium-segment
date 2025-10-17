// modules/auth/mailer/mailer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

type ResetCodePayload = {
  email: string;
  code: string;
  username?: string | null;
  expiresAt: Date;
  ip?: string | null;
  ua?: string | null;
  purpose?: 'reset_password' | 'verify_email';
};

type PasswordChangedPayload = {
  email: string;
  username?: string | null;
  changedAt?: Date;
  ip?: string | null;
  ua?: string | null;
};

@Injectable()
export class AppMailerService {
  private readonly logger = new Logger(AppMailerService.name);
  private readonly appName: string;
  private readonly appUrl: string;

  constructor(
    private readonly mailer: MailerService,
    private readonly cfg: ConfigService,
  ) {
    this.appName = this.cfg.get<string>('APP_NAME', 'EMS');
    this.appUrl = this.cfg.get<string>('APP_URL', 'http://localhost:3000');
  }

  async sendResetCode(payload: ResetCodePayload): Promise<void> {
    const { email, code, username, expiresAt, ip, ua, purpose = 'reset_password' } = payload;

    try {
      await this.mailer.sendMail({
        to: email,
        subject: `[${this.appName}] Your password reset code`,
        template: 'reset-code', // templates/reset-code.hbs
        context: {
          appName: this.appName,
          appUrl: this.appUrl,
          email,
          username: username ?? 'there',
          code,
          purpose,
          expiresAtISO: expiresAt.toISOString(),
          expiresAtHuman: expiresAt.toUTCString(),
          ip: ip ?? 'Unknown IP',
          ua: ua ?? 'Unknown Device',
        },
      });
    } catch (err) {
      this.logger.error(`Failed to send reset code to ${email}`, err as Error);
      // Jangan throw detail ke luar; biarkan service pemanggil memutuskan
      throw new Error('MAIL_SEND_FAILED');
    }
  }

  async sendPasswordChangedNotice(payload: PasswordChangedPayload): Promise<void> {
    const { email, username, changedAt = new Date(), ip, ua } = payload;

    try {
      await this.mailer.sendMail({
        to: email,
        subject: `[${this.appName}] Your password was changed`,
        template: 'password-changed', // templates/password-changed.hbs
        context: {
          appName: this.appName,
          appUrl: this.appUrl,
          email,
          username: username ?? 'there',
          changedAtISO: changedAt.toISOString(),
          changedAtHuman: changedAt.toUTCString(),
          ip: ip ?? 'Unknown IP',
          ua: ua ?? 'Unknown Device',
        },
      });
    } catch (err) {
      this.logger.error(`Failed to send password changed notice to ${email}`, err as Error);
      throw new Error('MAIL_SEND_FAILED');
    }
  }
}

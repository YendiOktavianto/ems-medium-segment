import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan, FindOptionsWhere } from 'typeorm';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { ResetOtp } from '../../../database/entities/reset-otp.entity';
import { UsersService } from '../../users/users.service';
import { AppMailerService } from '../mailer/mailer.service';

function toInt(val: string | undefined, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

const CODE_TTL_MIN = toInt(process.env.RESET_TTL_MIN, 10);
const MAX_ATTEMPTS = toInt(process.env.RESET_MAX_ATTEMPTS, 5);
const RESEND_COOLDOWN_S = toInt(process.env.RESET_RESEND_COOLDOWN, 60);
const MAX_RESEND_PER_H = toInt(process.env.RESET_MAX_RESEND_PER_HOUR, 3);

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(ResetOtp) private readonly repo: Repository<ResetOtp>,
    private readonly users: UsersService,
    private readonly mailer: AppMailerService,
  ) {}

  private hash(raw: string) {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
  private gen4(): string {
    return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  }

  /** Request kode 4 digit via email */
  async requestCode(email: string, ip?: string, userAgent?: string): Promise<{ ok: true }> {
    const user = await this.users.findByEmail(email);
    // Demi keamanan, selalu balas ok meski user tak ada
    if (!user) return { ok: true };

    // Limit resend per jam
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCnt = await this.repo.count({
      where: { user: { userId: user.userId }, created_at: MoreThan(oneHourAgo) },
    });
    if (recentCnt >= MAX_RESEND_PER_H) {
      throw new BadRequestException('Too many requests. Please try again later.');
    }

    // Cooldown antar request
    const last = await this.repo.findOne({
      where: { user: { userId: user.userId } },
      order: { created_at: 'DESC' },
    });
    if (last && Date.now() - last.created_at.getTime() < RESEND_COOLDOWN_S * 1000) {
      throw new BadRequestException('Please wait before requesting a new code.');
    }

    // Generate + simpan hash
    const code = this.gen4();
    const code_hash = this.hash(code);
    const expires_at = new Date(Date.now() + CODE_TTL_MIN * 60 * 1000);

    await this.repo.save(
      this.repo.create({
        user,
        purpose: 'password_reset',
        code_hash,
        expires_at,
        attempts: 0,
        resend_count: (last?.resend_count ?? 0) + 1,
        ip,
        user_agent: userAgent,
      }),
    );

    // Kirim email (abaikan error kirim)
    await this.mailer
      .sendResetCode({
        email,
        code,
        username: user.username ?? null,
        expiresAt: expires_at,
        ip: ip ?? null,
        ua: userAgent ?? null,
        purpose: 'reset_password',
      })
      .catch(() => null);

    return { ok: true };
  }

  /** Verifikasi kode (opsional jika UI ingin step terpisah) */
  async verifyCode(email: string, code: string): Promise<{ ok: boolean }> {
    const user = await this.users.findByEmail(email);
    if (!user) return { ok: false };

    const row = await this.repo.findOne({
      where: {
        user: { userId: user.userId },
        purpose: 'password_reset',
        code_hash: this.hash(code),
        used_at: IsNull(),
      },
      order: { created_at: 'DESC' },
    });
    if (!row) return { ok: false };
    if (!row.expires_at || row.expires_at.getTime() < Date.now()) return { ok: false };

    return { ok: true };
  }

  /** Reset password jika kode valid */
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ ok: true }> {
    const user = await this.users.findByEmail(email);
    if (!user) return { ok: true }; // hindari user enumeration

    const row = await this.repo.findOne({
      where: {
        user: { userId: user.userId },
        purpose: 'password_reset',
        code_hash: this.hash(code),
        used_at: IsNull(),
      },
      order: { created_at: 'DESC' },
    });
    if (!row) throw new BadRequestException('Invalid code');
    if (!row.expires_at || row.expires_at.getTime() < Date.now()) {
      throw new BadRequestException('Code expired');
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      throw new BadRequestException('Too many attempts. Request a new code.');
    }

    // Update password user
    const password_hash = await argon2.hash(newPassword);
    await this.users.updatePasswordHash(user.userId, password_hash);

    // Tandai digunakan
    row.used_at = new Date();
    await this.repo.save(row);

    // (Opsional) revoke all sessions supaya logout semua device
    // await this.tokens.revokeAllByUser(user.userId);

    return { ok: true };
  }

  /** Jika user entry kode salah, catat attempts (dipanggil dari controller saat gagal) */
  async bumpAttempt(email: string, code?: string) {
    const user = await this.users.findByEmail(email);
    if (!user) return;
    const where: FindOptionsWhere<ResetOtp> = {
      user: { userId: user.userId }, // filter relasi
      purpose: 'password_reset',
      used_at: IsNull(),
      ...(code ? { code_hash: this.hash(code) } : {}),
    };

    const last = await this.repo.findOne({
      where,
      order: { created_at: 'DESC' },
    });

    if (!last) return;
    last.attempts += 1;
    await this.repo.save(last);
  }
}

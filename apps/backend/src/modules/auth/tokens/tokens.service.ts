import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { RefreshSession } from '../../../database/entities/refresh-sessions.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(RefreshSession) private readonly repo: Repository<RefreshSession>,
  ) {}
  private hash(raw: string) {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  async createSession(opts: {
    jti: string;
    userId: string;
    raw: string;
    exp: Date;
    ua?: string | null;
    ip?: string | null;
  }) {
    return this.repo.save(
      this.repo.create({
        jti: opts.jti,
        userId: opts.userId,
        token_hash: this.hash(opts.raw),
        expires_at: opts.exp,
        user_agent: opts.ua ?? null,
        ip: opts.ip ?? null,
        revoked_at: null,
        replaced_by_jti: null,
      }),
    );
  }

  async rotate(oldJti: string, newJti: string, newRaw: string, newExp: Date) {
    const old = await this.repo.findOne({ where: { jti: oldJti } });
    if (!old) return null;
    old.revoked_at = new Date();
    old.replaced_by_jti = newJti;
    await this.repo.save(old);
    return this.repo.save(
      this.repo.create({
        jti: newJti,
        userId: old.userId,
        token_hash: this.hash(newRaw),
        expires_at: newExp,
        user_agent: old.user_agent,
        ip: old.ip,
      }),
    );
  }

  async revokeByJti(jti: string) {
    await this.repo.update({ jti }, { revoked_at: new Date() });
  }
  async revokeAllByUser(userId: string) {
    await this.repo
      .createQueryBuilder()
      .update(RefreshSession)
      .set({ revoked_at: () => 'CURRENT_TIMESTAMP' })
      .where('"userId" = :userId AND revoked_at IS NULL', { userId })
      .execute();
  }
  async isReuseSuspected(jti: string, raw: string) {
    const s = await this.repo.findOne({ where: { jti } });
    if (!s) return true;
    const same = this.hash(raw) === s.token_hash;
    return !!s.revoked_at || !same;
  }

  async findActiveByRaw(raw: string) {
    const token_hash = this.hash(raw);
    return this.repo.findOne({ where: { token_hash, revoked_at: IsNull() } });
  }

  async revokeByRaw(raw: string) {
    const s = await this.findActiveByRaw(raw);
    if (!s) return;
    await this.revokeByJti(s.jti);
  }
}

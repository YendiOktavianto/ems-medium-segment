import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './auth.types';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import ms, { StringValue } from 'ms';
import { TokensService } from './tokens/tokens.service';

type TokenPair = { access_token: string; refresh_token: string };
type UserOut = { userId: string; email: string; username?: string; role?: string };

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private cfg: ConfigService,
    private readonly tokens: TokensService,
  ) {}

  private signAccess(sub: string, email: string) {
    return this.jwt.signAsync(
      { sub, email },
      {
        secret: this.cfg.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.cfg.get<string>('JWT_ACCESS_EXPIRES', '15m'),
      },
    );
  }

  private refreshTtl(remember?: boolean): string {
    const pick = (key: string, fallback: string): string => {
      const v: unknown = this.cfg.get(key);
      return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
    };

    const base = pick('JWT_REFRESH_EXPIRES', '7d');
    if (remember) {
      return pick('JWT_REFRESH_EXPIRES_REMEMBER', '30d');
    }
    return base;
  }

  private signRefresh(sub: string, email: string, opts: { ttl: string; jti: string }) {
    return this.jwt.signAsync(
      { sub, email, typ: 'refresh', jti: opts.jti },
      {
        secret: this.cfg.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: opts.ttl,
      },
    );
  }

  async register(dto: RegisterDto) {
    const user = await this.users.createUser({
      email: dto.email,
      username: dto.username,
      phone_number: dto.phone_number,
      password: dto.password,
    });

    const ttl = this.refreshTtl(false);
    const jti = randomUUID();

    const [access_token, refresh_token] = await Promise.all([
      this.signAccess(user.userId, user.email),
      this.signRefresh(user.userId, user.email, { ttl, jti }),
    ]);
    return {
      user: { userId: user.userId, email: user.email, username: user.username },
      access_token,
      refresh_token,
    };
  }

  async login(dto: LoginDto): Promise<{ user: UserOut } & TokenPair> {
    const identifier = dto.identifier?.trim() ?? '';
    const password = dto.password ?? '';
    const remember = !!dto.rememberMe;

    const user = await this.users.findByEmailOrUsername(identifier);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        errors: {
          identifier: 'Incorrect Email or Username',
        },
      });
    }

    const ok = await argon2.verify(user.password_hash, password);
    if (!ok) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        errors: { password: 'Incorrect Password' },
      });
    }

    // const ttl = this.refreshTtl(remember);
    const jti = randomUUID();

    const ttl = this.refreshTtl(remember) as StringValue;
    const ttlMsRaw = ms(ttl);

    if (typeof ttlMsRaw !== 'number') {
      throw new Error(`Invalid refresh TTL: ${ttl}`);
    }

    const [access_token, refresh_token] = await Promise.all([
      this.signAccess(user.userId, user.email),
      this.signRefresh(user.userId, user.email, { ttl, jti }),
    ]);

    await this.tokens.createSession({
      jti,
      userId: user.userId,
      raw: refresh_token,
      exp: new Date(Date.now() + ms(ttl)),
      ua: null,
      ip: null,
    });

    return {
      user: {
        userId: user.userId,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      access_token,
      refresh_token,
    };
  }

  async me(user: JwtPayload) {
    const u = await this.users.findById(user.sub);
    if (!u) {
      throw new UnauthorizedException('User not found');
    }
    return {
      userId: u.userId,
      email: u.email,
      username: u.username,
      phone_number: u.phone_number,
      role: u.role,
    };
  }

  async refresh(token: string): Promise<TokenPair> {
    const payload = await this.jwt.verifyAsync<{
      sub: string;
      email: string;
      typ?: string;
      jti: string;
    }>(token, { secret: this.cfg.get<string>('JWT_REFRESH_SECRET') });

    if (payload?.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const suspected = await this.tokens.isReuseSuspected(payload.jti, token);
    if (suspected) {
      await this.tokens.revokeAllByUser(payload.sub);
      throw new UnauthorizedException('refresh token reuse detected');
    }

    const access_token = await this.signAccess(payload.sub, payload.email);

    const ttl = (this.cfg.get<string>('JWT_REFRESH_EXPIRES') ?? '7d') as StringValue;
    const newJti = randomUUID();
    const refresh_token = await this.signRefresh(payload.sub, payload.email, { ttl, jti: newJti });

    const ttlVal = ms(ttl);
    if (typeof ttlVal !== 'number') {
      throw new Error(`Invalid refresh TTL: ${ttl}`);
    }
    if (typeof ttlVal !== 'number') throw new Error(`Invalid refresh TTL: ${ttl}`);

    await this.tokens.rotate(payload.jti, newJti, refresh_token, new Date(Date.now() + ttlVal));

    return { access_token, refresh_token };
  }

  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;

    await this.tokens.revokeByRaw(rawRefreshToken);
  }
}

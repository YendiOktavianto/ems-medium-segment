import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './auth.types';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

type TokenPair = { access_token: string; refresh_token: string };
type UserOut = { userId: string; email: string; username?: string; role?: string };

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private cfg: ConfigService,
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

  private signRefresh(sub: string, email: string) {
    return this.jwt.signAsync(
      { sub, email, typ: 'refresh' },
      {
        secret: this.cfg.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.cfg.get<string>('JWT_REFRESH_EXPIRES', '7d'),
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
    const [access_token, refresh_token] = await Promise.all([
      this.signAccess(user.userId, user.email),
      this.signRefresh(user.userId, user.email),
    ]);
    return {
      user: { userId: user.userId, email: user.email, username: user.username },
      access_token,
      refresh_token,
    };
  }

  async login(dto: LoginDto): Promise<{ user: UserOut } & TokenPair> {
    const { identifier, password } = dto;

    const user = await this.users.findByEmailOrUsername(identifier);
    if (!user) {
      throw new UnauthorizedException('Email is incorrect');
    }

    const ok = await argon2.verify(user.password_hash, password);
    if (!ok) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const [access_token, refresh_token] = await Promise.all([
      this.signAccess(user.userId, user.email),
      this.signRefresh(user.userId, user.email),
    ]);

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
    const payload = await this.jwt.verifyAsync<{ sub: string; email: string; typ?: string }>(
      token,
      { secret: this.cfg.get<string>('JWT_REFRESH_SECRET') },
    );

    if (payload?.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const [access_token, refresh_token] = await Promise.all([
      this.signAccess(payload.sub, payload.email),
      this.signRefresh(payload.sub, payload.email),
    ]);

    return { access_token, refresh_token };
  }
}

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  private signAccess(sub: string, email: string) {
    return this.jwt.signAsync(
      { sub, email },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' },
    );
  }
  private signRefresh(sub: string, email: string) {
    return this.jwt.signAsync(
      { sub, email, typ: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
      },
    );
  }

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirm_password) {
      throw new BadRequestException('Password Confirmation does not match');
    }
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

  async login(dto: LoginDto) {
    const user = await this.users.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Email or password is incorrect');

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

  async refresh(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; typ?: string }>(
        token,
        { secret: process.env.JWT_REFRESH_SECRET },
      );
      const [access_token, refresh_token] = await Promise.all([
        this.signAccess(payload.sub, payload.email),
        this.signRefresh(payload.sub, payload.email),
      ]);
      return { access_token, refresh_token };
    } catch {
      throw new UnauthorizedException('Refresh token invalid');
    }
  }
}

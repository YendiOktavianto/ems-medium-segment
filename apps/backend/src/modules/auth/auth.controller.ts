import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import * as authTypes from './auth.types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { Throttle } from '@nestjs/throttler';
import { ForgotRequestDto } from './dto/forgot-request.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetService } from './password-reset/password-reset.service';

type RefreshBody = { refresh_token?: string };
type ReqWithCookies<B = unknown> = Request<any, any, B> & {
  cookies?: Record<string, string>;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cfg: ConfigService,
    private readonly passwordReset: PasswordResetService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    console.log('RAW BODY =', req.body);
    console.log('DTO =', dto);
    return this.auth.register(dto);
  }

  @Post('login')
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto);

    if (dto.rememberMe) {
      const ttl = this.cfg.get<string>('JWT_REFRESH_EXPIRES', '7d') as StringValue;
      res.cookie('refreshToken', result.refresh_token, {
        httpOnly: true,
        secure: this.cfg.get('NODE_ENV') === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: ms(ttl),
      });

      const { refresh_token, ...rest } = result;
      return rest;
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: authTypes.JwtPayload) {
    return this.auth.me(user);
  }

  @Post('refresh')
  async refresh(
    @Body('refresh_token') refreshTokenFromBody: string | undefined,
    @Req() req: ReqWithCookies<RefreshBody>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookiesUnknown: unknown = req.cookies;
    let cookieRefresh: string | undefined;

    if (
      typeof cookiesUnknown === 'object' &&
      cookiesUnknown !== null &&
      'refreshToken' in (cookiesUnknown as Record<string, unknown>) &&
      typeof (cookiesUnknown as Record<string, unknown>).refreshToken === 'string'
    ) {
      cookieRefresh = (cookiesUnknown as Record<string, string>).refreshToken;
    } else {
      cookieRefresh = undefined;
    }

    const refreshToken = refreshTokenFromBody ?? cookieRefresh;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const data: { access_token: string; refresh_token: string } =
      await this.auth.refresh(refreshToken);

    // (Opsional) rotasi refresh token dan tulis ulang cookie bila ada cookie
    if (cookieRefresh) {
      const ttl = this.cfg.get<string>('JWT_REFRESH_EXPIRES', '7d') as StringValue;
      res.cookie('refreshToken', data.refresh_token, {
        httpOnly: true,
        secure: this.cfg.get('NODE_ENV') === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: ms(ttl),
      });

      const { refresh_token, ...rest } = data;
      return rest;
    }

    return data;
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 10 * 60_000 } }) // 3x / 10 menit / IP
  @HttpCode(200)
  async forgot(@Body() dto: ForgotRequestDto, @Req() req: Request) {
    const ua = req.headers['user-agent'] ?? '';
    await this.passwordReset.requestCode(dto.email, req.ip, ua);
    return { ok: true as const };
  }

  @Post('verify-reset-code') // opsional jika UI butuh langkah ini
  @Throttle({ default: { limit: 10, ttl: 10 * 60_000 } })
  @HttpCode(200)
  async verify(@Body() dto: VerifyResetCodeDto) {
    const { ok }: { ok: boolean } = await this.passwordReset.verifyCode(dto.email, dto.code);

    if (!ok) {
      await this.passwordReset.bumpAttempt(dto.email, dto.code);
    }
    return { ok };
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 10 * 60_000 } })
  @HttpCode(200)
  async reset(@Body() dto: ResetPasswordDto) {
    try {
      await this.passwordReset.resetPassword(dto.email, dto.code, dto.newPassword);
      return { ok: true as const };
    } catch (e) {
      await this.passwordReset.bumpAttempt(dto.email, dto.code);
      throw e;
    }
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Ambil refresh dari cookie (samakan NAMA dengan yang kamu pakai saat set-cookie)
    const raw = (req.cookies?.refreshToken as string) ?? '';

    await this.auth.logout(raw);

    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    // 204 No Content
  }
}

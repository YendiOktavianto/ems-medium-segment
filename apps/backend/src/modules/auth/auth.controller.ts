import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  BadRequestException,
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

type RefreshBody = { refresh_token?: string };
type ReqWithCookies<B = unknown> = Request<any, any, B> & {
  cookies?: Record<string, string>;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cfg: ConfigService,
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
}

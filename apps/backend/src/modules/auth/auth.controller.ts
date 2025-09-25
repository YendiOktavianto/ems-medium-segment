import { Body, Controller, Get, Headers, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import * as authTypes from './auth.types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: express.Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('RAW BODY =', (req as any).body); // <— harusnya terlihat field JSON
    console.log('DTO =', dto);
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: authTypes.JwtPayload) {
    return this.auth.me(user);
  }

  @Post('refresh')
  refresh(@Body('refresh_token') refreshToken: string) {
    return this.auth.refresh(refreshToken);
  }
}

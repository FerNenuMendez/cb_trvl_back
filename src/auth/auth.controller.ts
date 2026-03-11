/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const authData = await this.authService.login(body.email, body.password);

    // Seteamos la Cookie HTTP-only
    res.cookie('access_token', authData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true solo en producción (HTTPS)
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });

    return {
      message: 'Login exitoso',
      user: authData.user,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Sesión cerrada correctamente' };
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.usersService.create(body);
  }
}

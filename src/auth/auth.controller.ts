/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as express from 'express';
import { UsersService } from '../users/users.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Redirigir a Google para autenticación' })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() _req: any) {
    // El Guard redirige automáticamente a Google
  }

  @ApiOperation({ summary: 'Callback de Google' })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: any,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.googleLogin(req.user, res);
  }

  @ApiOperation({ summary: 'Login tradicional con email y contraseña' })
  @ApiResponse({ status: 200, description: 'Login exitoso y cookie seteada.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const authData = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    res.cookie('access_token', authData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return {
      message: 'Login exitoso',
      user: authData.user,
    };
  }

  @ApiOperation({ summary: 'Cerrar sesión' })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('access_token');
    return { message: 'Sesión cerrada correctamente' };
  }

  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado con éxito.' })
  @ApiResponse({ status: 409, description: 'El email ya está en uso.' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }
}

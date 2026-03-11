import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard) // Protegemos esta ruta con el guard de JWT
  @Get('me')
  getProfile(@Req() req: Request) {
    // Si el Guard dejó pasar al usuario, la info está en req.user
    return {
      message: 'Token válido, bienvenido al perfil',
      user: req.user,
    };
  }
}

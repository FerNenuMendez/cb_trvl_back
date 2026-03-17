import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

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
  @Get('admin-dashboard')
  @Roles(Role.EXCEL)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAdminData() {
    return { message: 'Bienvenido al panel de control, jefe' };
  }
}

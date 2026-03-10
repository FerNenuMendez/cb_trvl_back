import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: any) {
    // Por ahora algo simple para testear la base de datos
    // En el próximo paso agregamos el hash de password
    return this.usersService.create(body);
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    // Agregamos el chequeo de user.password
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const payload = { sub: user._id, email: user.email, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }

    throw new UnauthorizedException('Credenciales incorrectas, Nenu');
  }
}

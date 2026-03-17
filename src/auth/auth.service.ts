/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

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

  async googleLogin(user: any, res: Response) {
    if (!user) {
      throw new BadRequestException('No se recibió el usuario de Google');
    }

    // 1. Buscamos si el usuario ya existe por email
    let userInDb = await this.usersService.findByEmail(user.email);

    // 2. Si no existe, lo registramos automáticamente
    if (!userInDb) {
      const randomPassword = Math.random().toString(36).slice(-10);
      userInDb = await this.usersService.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        password: randomPassword,
        // Usamos 'as any' para evitar el error de asignación del Role si es un Enum
        role: 'travelexcel' as any,
      });
    }

    // 3. Generamos nuestro JWT
    const payload = {
      sub: userInDb._id,
      email: userInDb.email,
      role: userInDb.role,
    };
    const accessToken = this.jwtService.sign(payload);

    // 4. Seteamos la cookie (Ahora res.cookie no dará error)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });

    return {
      message: 'Login con Google exitoso',
      user: {
        _id: userInDb._id,
        email: userInDb.email,
        name: userInDb.name,
        role: userInDb.role,
      },
    };
  }
}

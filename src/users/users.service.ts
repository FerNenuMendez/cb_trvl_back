/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from '../auth/dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailerService: MailerService,
  ) {}

  // Método para buscar por email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Método para crear un usuario
  async create(userData: RegisterDto): Promise<User> {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException(
        'El correo electrónico ya se encuentra registrado',
      );
    }

    if (userData.password) {
      const salt = await bcrypt.genSalt(10); // Nivel de seguridad estándar
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    // 1. Generar token de verificación
    const token = crypto.randomBytes(32).toString('hex');
    const newUser = new this.userModel({
      ...userData,
      verificationToken: token,
      isVerified: false,
    });

    await newUser.save();

    // 2. Enviar el correo
    try {
      const url = `http://localhost:3000/auth/verify/${token}`;
      await this.mailerService.sendMail({
        to: newUser.email,
        subject: 'Confirma tu cuenta de viajes',
        html: `
          <h3>¡Hola ${newUser.name}!</h3>
          <p>Gracias por registrarte. Por favor, hacé clic en el siguiente enlace para activar tu cuenta:</p>
          <a href="${url}">Confirmar mi cuenta</a>
        `,
      });

      return newUser;
    } catch (error) {
      // 3. Si el mail falla, borramos el usuario que acabamos de crear
      await this.userModel.findByIdAndDelete(newUser.id); // o newUser._id dependiendo de tu versión de Mongoose

      // Lanzamos un error 500 para que el frontend sepa que algo falló
      throw new InternalServerErrorException(
        'Error al enviar el correo de confirmación. Por favor, intentá registrarte nuevamente.',
      );
    }
  }

  // Nuevo método para verificar el token
  async verifyUserEmail(token: string): Promise<boolean> {
    const user = await this.userModel
      .findOne({ verificationToken: token })
      .exec();

    if (!user) {
      throw new NotFoundException('Token inválido o cuenta ya verificada');
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Limpiamos el token
    await user.save();

    return true;
  }

  // Método para buscar por ID
  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  // ---> RECUPERAR CONTRASEÑA
  // Generar token y enviar email
  async generatePasswordResetToken(email: string): Promise<void> {
    const user = await this.findByEmail(email);

    // Por seguridad, si el usuario no existe, no tiramos error para no revelar correos registrados.
    if (!user) return;

    // Generamos un token aleatorio seguro
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Calculamos la expiración (ej: 1 hora a partir de ahora)
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 1);

    // Guardamos en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expireDate;
    await user.save();

    // Enviamos el correo con el link al FRONTEND
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Recuperación de contraseña - Travel App',
        html: `
          <h3>Hola, ${user.name}</h3>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Hacé clic en el siguiente enlace para crear una nueva (es válido por 1 hora):</p>
          <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Restablecer mi contraseña</a>
          <p>Si no pediste esto, podés ignorar este correo de forma segura.</p>
        `,
      });
    } catch (error) {
      console.error('Error enviando email de recuperación:', error);

      // Limpiamos los tokens si falla el mail (usamos null o undefined según prefiera tu TS)
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      throw new InternalServerErrorException(
        'Error al enviar el correo de recuperación.',
      );
    }
  }

  // Validar token y cambiar contraseña
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Buscamos al usuario que tenga ese token y que la fecha de expiración sea mayor a AHORA
    const user = await this.userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();

    if (!user) {
      throw new BadRequestException(
        'El token de recuperación es inválido o ha expirado.',
      );
    }

    // Hasheamos la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Limpiamos los campos temporales
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    return true;
  }
}

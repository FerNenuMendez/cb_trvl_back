import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  // Método para buscar por ID
  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 1. Importá esto
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI!),

    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { User } from './entities/user.entity';
import { ResetOtp } from './entities/reset-otp.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, ResetOtp],
      autoLoadEntities: true, // otomatis load semua *.entity.ts
      synchronize: false, // jangan auto-sync, pakai migration
    }),
  ],
})
export class DatabaseModule {}

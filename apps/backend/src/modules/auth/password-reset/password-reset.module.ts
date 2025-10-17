import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResetOtp } from '../../../database/entities/reset-otp.entity';
import { PasswordResetService } from './password-reset.service';
import { UsersModule } from '../../users/users.module';
import { AppMailerModule } from '../mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([ResetOtp]), UsersModule, AppMailerModule],
  providers: [PasswordResetService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}

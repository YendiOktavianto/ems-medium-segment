import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity'; // ⬅️ perbaiki path
import { ResetOtp } from '../../database/entities/reset-otp.entity'; // ⬅️ perbaiki path
import { UsersService } from './users.service';
import { MonitoringInfo } from 'src/database/entities/monitoring-info.entity';
import { Location } from 'src/database/entities/location.entity';
import { GeneralInfo } from 'src/database/entities/general-info.entity';
import { Cost } from 'src/database/entities/cost.entity';
import { CostHistory } from 'src/database/entities/cost-history.entity';
import { Address } from 'src/database/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ResetOtp,
      MonitoringInfo,
      Location,
      GeneralInfo,
      Cost,
      CostHistory,
      Address,
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

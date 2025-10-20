import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceRequest } from '../../database/entities/device-request.entity';
import { DeviceRequestService } from './device-request.service';
import { DeviceRequestController } from './device-request.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceRequest])],
  controllers: [DeviceRequestController],
  providers: [DeviceRequestService],
})
export class DeviceRequestModule {}

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { DeviceRequestService } from './device-request.service';
import { CreateDeviceRequestDto } from './dto/create-device-request.dto';
import { UpdateDeviceRequestDto } from './dto/update-device-request.dto';

@Controller('device-request')
export class DeviceRequestController {
  constructor(private readonly service: DeviceRequestService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateDeviceRequestDto) {
    return this.service.create(dto);
  }

  @Patch()
  update(@Body() dto: UpdateDeviceRequestDto) {
    return this.service.update(dto);
  }

  @Delete()
  deleteBody(@Body() dto: { id: number }) {
    return this.service.remove(dto.id);
  }

  @Delete(':id')
  deleteParam(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceRequest } from '../../database/entities/device-request.entity';
import { CreateDeviceRequestDto } from './dto/create-device-request.dto';
import { UpdateDeviceRequestDto } from './dto/update-device-request.dto';

@Injectable()
export class DeviceRequestService {
  constructor(
    @InjectRepository(DeviceRequest)
    private readonly repo: Repository<DeviceRequest>,
  ) {}

  findAll() {
    return this.repo.find({ order: { time: 'DESC' } });
  }

  async create(dto: CreateDeviceRequestDto) {
    const entity = this.repo.create({
      ...dto,
      status: 'pending',
      time: String(Date.now()),
    });
    return this.repo.save(entity);
  }

  async update(dto: UpdateDeviceRequestDto) {
    const found = await this.repo.findOne({ where: { id: dto.id } });
    if (!found) throw new NotFoundException('Request not found');
    found.status = dto.status;
    return this.repo.save(found);
  }

  async remove(id: number) {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Request not found');
    return { success: true };
  }
}

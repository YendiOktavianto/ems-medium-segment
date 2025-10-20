import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationMarkerDto } from './dto/location-maker.dto';

// Import entity sesuai strukturmu
import { Location } from '../../../database/entities/location.entity';
import { GeneralInfo } from '../../../database/entities/general-info.entity';
import { Address } from '../../../database/entities/address.entity';

@Injectable()
export class LocationService {
  constructor(@InjectRepository(Location) private readonly locRepo: Repository<Location>) {}

  async findMarkersByUser(userId: string): Promise<LocationMarkerDto[]> {
    // JOIN: general_info (gi) -> location (loc) -> address (addr)
    const rows = await this.locRepo
      .createQueryBuilder('loc')
      .innerJoin(GeneralInfo, 'gi', 'gi.device_id = loc.device_id')
      .leftJoin(Address, 'addr', 'addr.address_id = loc.address_id')
      .where('gi.user_id = :userId', { userId })
      .select([
        'gi.device_id AS "deviceId"',
        'gi.device_name AS "deviceName"',
        'gi.isActive   AS "isActive"',
        'loc.segment   AS "segment"',
        'addr.address_name        AS "addressName"',
        'addr.detail_address_name AS "detailAddressName"',
        // kolom DB memang 'lattitude' → alias jadi 'latitude' utk API
        'addr.lattitude AS "latitude"',
        'addr.longitude AS "longitude"',
      ])
      .getRawMany<{
        deviceId: string;
        deviceName: string | null;
        isActive: boolean;
        segment: string | null;
        addressName: string | null;
        detailAddressName: string | null;
        latitude: number | null; // dari addr.lattitude
        longitude: number | null;
      }>();

    if (!rows.length) return [];

    return rows.map((r) => ({
      deviceId: r.deviceId,
      deviceName: r.deviceName ?? null,
      segment: r.segment ?? null,
      status: r.isActive ? 'Active' : 'Inactive',
      addressName: r.addressName ?? null,
      detailAddressName: r.detailAddressName ?? null,
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
    }));
  }
}

import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type DeviceRequestStatus = 'pending' | 'approved' | 'rejected';

// ubah ke plural jika tabel di DB bernama device_requests
@Entity({ name: 'device_requests' })
export class DeviceRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'varchar', length: 120 })
  username!: string;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  segmen!: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  detail_address!: string | null;

  @Column({ type: 'double precision' })
  lat!: number;

  @Column({ type: 'double precision' })
  lng!: number;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: DeviceRequestStatus;

  @Index()
  @Column({ type: 'bigint' })
  time!: string;
}

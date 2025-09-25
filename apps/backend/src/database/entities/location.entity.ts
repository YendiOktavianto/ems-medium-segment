import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, Unique } from 'typeorm';
import { Address } from './address.entity';
import { GeneralInfo } from './general-info.entity';

@Entity('location')
@Unique(['address'])
export class Location {
  @PrimaryGeneratedColumn('uuid')
  location_id: string;

  @Column()
  segment: string;

  @OneToOne(() => Address, (a) => a.location, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToOne(() => GeneralInfo, (g) => g.location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: GeneralInfo;
}

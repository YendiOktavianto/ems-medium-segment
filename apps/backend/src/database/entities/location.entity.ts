import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, Unique } from 'typeorm';
import { Address } from './address.entity';
import { GeneralInfo } from './general-info.entity';

@Entity('location')
@Unique(['address'])
export class Location {
  @PrimaryGeneratedColumn('uuid', { name: 'location_id' })
  location_id!: string;

  @Column({ name: 'segment', type: 'varchar', nullable: true })
  segment!: string;

  @OneToOne(() => Address, (a) => a.location, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'address_id', referencedColumnName: 'address_id' })
  address!: Address;

  @OneToOne(() => GeneralInfo, (g) => g.location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id', referencedColumnName: 'device_id' })
  device!: GeneralInfo;
}

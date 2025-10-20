import { Entity, PrimaryGeneratedColumn, Column, OneToOne, Unique } from 'typeorm';
import { Location } from './location.entity';

@Unique(['detail_address_name'])
@Entity('address')
export class Address {
  @PrimaryGeneratedColumn('uuid', { name: 'address_id' })
  address_id!: string;

  @Column({ name: 'address_name', type: 'varchar', nullable: true })
  address_name!: string | null;

  @Column({ name: 'detail_address_name', type: 'varchar', nullable: true })
  detail_address_name!: string | null;

  @Column({ name: 'longitude', type: 'double precision', nullable: true })
  longitude!: string | null;

  @Column({ name: 'lattitude', type: 'double precision', nullable: true })
  lattitude!: string | null;

  @OneToOne(() => Location, (loc) => loc.address)
  location: Location;
}

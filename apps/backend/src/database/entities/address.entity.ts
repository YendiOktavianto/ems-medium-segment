import { Entity, PrimaryGeneratedColumn, Column, OneToOne, Unique } from 'typeorm';
import { Location } from './location.entity';

@Unique(['detail_address_name'])
@Entity('address')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  address_id: string;

  @Column()
  address_name: string;

  @Column()
  detail_address_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: string;

  @OneToOne(() => Location, (loc) => loc.address)
  location: Location;
}

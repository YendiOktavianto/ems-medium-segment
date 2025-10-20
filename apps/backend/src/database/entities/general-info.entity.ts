import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Location } from './location.entity';
import { MonitoringInfo } from './monitoring-info.entity';
import { User } from './user.entity';

@Entity('general_info')
export class GeneralInfo {
  @PrimaryGeneratedColumn('uuid', { name: 'device_id' })
  device_id: string;

  @Column({ name: 'serial_number', type: 'varchar', nullable: true })
  serial_number!: string | null;

  @Column({ name: 'device_name', type: 'varchar', nullable: true })
  device_name!: string | null;

  @Column({ name: 'isActive', type: 'boolean', default: false })
  isActive!: boolean;

  @OneToOne(() => MonitoringInfo, (m) => m.device)
  monitoring: MonitoringInfo;

  @ManyToOne(() => User, (u) => u.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user!: User;

  @OneToOne(() => Location, (loc) => loc.device)
  location!: Location;
}

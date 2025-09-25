import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Location } from './location.entity';
import { MonitoringInfo } from './monitoring-info.entity';
import { User } from './user.entity';

@Entity('general_info')
export class GeneralInfo {
  @PrimaryGeneratedColumn('uuid')
  device_id: string;

  @Column({ length: 80 })
  serial_number: string;

  @Column({ length: 120 })
  device_name: string;

  @Column({ type: 'boolean' })
  isActive: boolean;

  @OneToOne(() => MonitoringInfo, (m) => m.device)
  monitoring: MonitoringInfo;

  @ManyToOne(() => User, (u) => u.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Location, (loc) => loc.device)
  location: Location;
}

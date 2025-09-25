import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { GeneralInfo } from './general-info.entity';
import { Cost } from './cost.entity';

export enum PhaseType {
  ONE_PHASE = '1 PHASE',
  THREE_PHASE = '3 PHASE',
}

@Entity('monitoring_info')
export class MonitoringInfo {
  @PrimaryGeneratedColumn('uuid')
  monitoring_info_id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time without time zone' })
  time: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  voltage: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  current: string;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  frequency: string;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  power: string;

  @Column({ type: 'numeric', precision: 4, scale: 2 })
  power_factor: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_usage: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_usage_today: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_usage_mtd: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_cost: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_cost_today: string;

  @Column({ type: 'numeric', precision: 16, scale: 4 })
  total_energy_cost_mtd: string;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  wattage: string;

  @Column({
    type: 'enum',
    enum: PhaseType,
    enumName: 'phase_type_enum',
  })
  phase: PhaseType;

  @OneToOne(() => GeneralInfo, (g) => g.monitoring, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  @Index()
  device: GeneralInfo;

  @ManyToOne(() => Cost, (c) => c.monitoringInfos, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'cost_id' })
  cost?: Cost;
}

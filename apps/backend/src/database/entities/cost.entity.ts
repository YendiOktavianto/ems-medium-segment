import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { CostHistory } from './cost-history.entity';
import { MonitoringInfo } from './monitoring-info.entity';

export enum GolTarif {
  R1_TR = 'R-1/TR',
  R2_TR = 'R-2/TR',
  R3_TR = 'R-3/TR',
  B1_TR = 'B-1/TR',
  B2_TR = 'B-2/TR',
  I1_TR = 'I-1/TR',
  I2_TR = 'I-2/TR',
  I3_TR = 'I-3/TR',
}

@Entity('cost')
export class Cost {
  @PrimaryGeneratedColumn('uuid')
  cost_id: string;

  // Contoh nilai: "R-1/TR", "R-2/TR", dst.
  @Column({
    type: 'enum',
    enum: GolTarif,
    enumName: 'gol_tarif_enum',
  })
  tariff_group: GolTarif;

  // Contoh nilai: "900 VA-RTM", "1.300 VA", "s.d. 5.500 VA"
  @Column({ type: 'varchar', length: 50 })
  power_limit: string;

  // Biaya pemakaian (Rp/kWh). Simpan numeric sebagai string (presisi aman).
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  usage_cost: string;

  // Relasi: Cost (1) -> (Many) MonitoringInfo
  @OneToMany(() => MonitoringInfo, (m) => m.cost)
  monitoringInfos: MonitoringInfo[];

  // Relasi: Cost (1) <-> (1) CostHistory (inverse side; FK ada di CostHistory)
  @OneToOne(() => CostHistory, (h) => h.cost, {
    cascade: false,
    eager: false,
  })
  history: CostHistory;
}

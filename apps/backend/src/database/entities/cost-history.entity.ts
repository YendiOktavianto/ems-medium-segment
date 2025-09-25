import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Cost } from './cost.entity';

@Entity('cost_history')
export class CostHistory {
  @PrimaryGeneratedColumn('uuid')
  history_id: string;

  // Owning side: FK disimpan di tabel cost_history (kolom cost_id)
  @OneToOne(() => Cost, (c) => c.history, {
    onDelete: 'CASCADE',
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'cost_id' })
  cost: Cost;

  // Snapshot biaya yang berlaku pada periode ini (Rp/kWh)
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  cost_value: string;

  // Periode berlaku
  @Column({ type: 'date' })
  valid_from: string;

  @Column({ type: 'date', nullable: true })
  valid_to?: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

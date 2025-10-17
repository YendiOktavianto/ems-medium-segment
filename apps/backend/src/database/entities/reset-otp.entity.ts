import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  RelationId,
} from 'typeorm';
import { User } from './user.entity';

@Entity('reset_otp')
@Index('idx_reset_otp_exp', ['expires_at'])
export class ResetOtp {
  @PrimaryGeneratedColumn('uuid')
  otp_id!: string;

  @Column({ type: 'varchar', length: 32, default: 'password_reset' })
  purpose!: string;

  @Column({ type: 'varchar', length: 64 })
  @Index('idx_reset_otp_code_hash')
  code_hash!: string;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  used_at!: Date | null;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ type: 'int', default: 0 })
  resend_count!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ip?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent?: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @ManyToOne(() => User, (u) => u.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

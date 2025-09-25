import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('reset_otp')
export class ResetOtp {
  @PrimaryGeneratedColumn('uuid')
  otp_id: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ length: 10 })
  otp_code: string;

  @Column({ default: false })
  used: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, (u) => u.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_sessions')
export class RefreshSession {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index({ unique: true }) @Column({ type: 'uuid' }) jti: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) user: User;
  @Index() @Column() userId: string;

  @Column() token_hash: string;
  @Index() @Column({ type: 'timestamptz' }) expires_at: Date;

  @Column({ type: 'timestamptz', nullable: true }) revoked_at: Date | null;
  @Column({ type: 'uuid', nullable: true }) replaced_by_jti: string | null;

  @Column({ type: 'text', nullable: true }) user_agent: string | null;
  @Column({ type: 'text', nullable: true }) ip: string | null;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}

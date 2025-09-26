import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { ResetOtp } from './reset-otp.entity';
import { GeneralInfo } from './general-info.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('users')
@Unique(['email', 'username']) // ERD: email unique, not null
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ length: 60 })
  username: string;

  @Column()
  password_hash: string;

  @Column()
  phone_number: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  profil_img?: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => ResetOtp, (otp) => otp.user)
  otps: ResetOtp[];

  @OneToMany(() => GeneralInfo, (g: GeneralInfo) => g.user, { cascade: true })
  devices: GeneralInfo[];
}

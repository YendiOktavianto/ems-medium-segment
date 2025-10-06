import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import * as argon2 from 'argon2';

type CreateUserParams = {
  email: string;
  username: string;
  phone_number: string;
  password: string;
  role?: UserRole;
};

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(userId: string): Promise<User | null> {
    return this.repo.findOne({ where: { userId } });
  }

  async createUser(params: CreateUserParams) {
    const exists = await this.repo.findOne({
      where: [
        { email: params.email },
        { username: params.username },
        { phone_number: params.phone_number },
      ],
    });
    if (exists) throw new ConflictException('Email/Username/Phone already in use');

    const password_hash = await argon2.hash(params.password);
    const user = this.repo.create({
      email: params.email,
      username: params.username,
      phone_number: params.phone_number,
      password_hash,
      role: params.role ?? UserRole.USER,
    });
    return this.repo.save(user);
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const emailLike = identifier.toLowerCase();
    return this.repo.findOne({
      where: [{ email: ILike(emailLike) }, { username: ILike(identifier) }],
    });
  }

  async validateUserByIdentifier(identifier: string, password: string) {
    const user = await this.findByEmailOrUsername(identifier);
    if (!user) return null;
    const ok = await argon2.verify(user.password_hash, password);
    return ok ? user : null;
  }
}

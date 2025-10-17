import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshSession } from '../../../database/entities/refresh-sessions.entity';
import { TokensService } from './tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshSession])],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}

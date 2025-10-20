import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDeviceRequestDto {
  @IsString() username!: string;
  @IsString() address!: string;

  @IsOptional() @IsString() segmen?: string;
  @IsOptional() @IsString() detail_address?: string;

  @IsNumber() lat!: number;
  @IsNumber() lng!: number;
}

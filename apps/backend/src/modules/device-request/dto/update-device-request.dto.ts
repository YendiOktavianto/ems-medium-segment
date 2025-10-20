import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateDeviceRequestDto {
  @IsInt() @Min(1) id!: number;

  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  status!: 'pending' | 'approved' | 'rejected';

  @IsOptional() @IsString()
  device_id?: string;
}

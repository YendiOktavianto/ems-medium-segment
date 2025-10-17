import { IsEmail, MinLength, IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

const toTrimmedPrimitiveString = (v: unknown): string => {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
};

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => toTrimmedPrimitiveString(value))
  identifier!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return ['true', '1', 'on', 'yes'].includes(value.toLowerCase());
    return false;
  })
  rememberMe?: boolean;
}

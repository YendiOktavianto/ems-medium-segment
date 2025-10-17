import { IsDefined, IsEmail, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsDefined()
  @IsEmail()
  email!: string;

  @IsDefined()
  @Matches(/^\d{4}$/)
  code!: string;

  @IsDefined()
  @MinLength(8)
  newPassword!: string;
}

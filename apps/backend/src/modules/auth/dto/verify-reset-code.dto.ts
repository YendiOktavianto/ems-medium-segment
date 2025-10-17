import { IsDefined, IsEmail, Matches } from 'class-validator';

export class VerifyResetCodeDto {
  @IsDefined()
  @IsEmail()
  email!: string;

  @IsDefined()
  @Matches(/^\d{4}$/)
  code!: string;
}

import { IsDefined, IsEmail } from 'class-validator';

export class ForgotRequestDto {
  @IsDefined()
  @IsEmail()
  email!: string;
}

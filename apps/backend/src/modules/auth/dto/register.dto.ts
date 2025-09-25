import { IsNotEmpty } from 'class-validator';
import { IsStrongEmail } from '../../../common/validators/email-strong.validator';
import { IsPhoneID } from '../../../common/validators/phone-id.validator';
import { IsStrongPassword } from '../../../common/validators/password-strong.validator';
import { IsStrongUsername } from '../../../common/validators/username.validator';
import { IsDefined } from 'class-validator';

export class RegisterDto {
  @IsDefined()
  @IsStrongEmail()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsStrongUsername()
  username: string;

  @IsDefined()
  @IsPhoneID()
  phone_number: string;

  @IsDefined()
  @IsStrongPassword()
  password: string;

  @IsDefined()
  @IsStrongPassword()
  confirm_password: string;
}

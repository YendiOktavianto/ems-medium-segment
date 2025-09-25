// src/common/validators/phone-id.validator.ts
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsPhoneID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsPhoneID',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(v: any) {
          if (typeof v !== 'string') return false;
          return /^\+628\d{8,11}$/.test(v); // +628 diikuti 10-13 digit (total 13-16 char)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Indonesian phone number starting with +628 and followed by 6-9 digits (total length 10-13 characters)`;
        },
      },
    });
  };
}

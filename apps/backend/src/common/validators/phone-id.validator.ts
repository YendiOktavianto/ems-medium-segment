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
          return /^\+628\d{8,11}$/.test(v);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Indonesian phone number starting with +628 and followed by 10-13 digits (total length 13-16 characters)`;
        },
      },
    });
  };
}

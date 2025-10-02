// src/common/validators/username.validator.ts
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsStrongUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsStrongUsername',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          if (value.length < 8 || value.length > 30) return false;
          if (/\s/.test(value)) return false;
          if (!/^[A-Z]/.test(value)) return false;
          return /^[A-Z][A-Za-z0-9_.\-@!#$%^&*]{7,29}$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be 8-30 characters long, start with an uppercase letter, contain no spaces, and can include letters, numbers, and special characters . _ - @ ! # $ % ^ & *`;
        },
      },
    });
  };
}

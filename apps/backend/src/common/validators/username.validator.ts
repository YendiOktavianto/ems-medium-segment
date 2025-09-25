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
          // 1) panjang 8-30
          if (value.length < 8 || value.length > 30) return false;
          // 2) tidak boleh ada spasi
          if (/\s/.test(value)) return false;
          // 3) huruf pertama kapital
          if (!/^[A-Z]/.test(value)) return false;
          // 4) karakter yang diizinkan
          return /^[A-Z][A-Za-z0-9_.\-@!#$%^&*]{7,29}$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be 8-30 characters long, start with an uppercase letter, contain no spaces, and can include letters, numbers, and special characters . _ - @ ! # $ % ^ & *`;
        },
      },
    });
  };
}

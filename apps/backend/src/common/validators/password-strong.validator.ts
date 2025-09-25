// src/common/validators/password-strong.validator.ts
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

const COMMON_PATTERNS = ['password', 'qwerty', '12345', '123456', 'abc123', 'tanggal'];

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsStrongPassword',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(v: any, args: ValidationArguments) {
          if (typeof v !== 'string') return false;
          if (v.length < 8 || v.length > 20) return false;
          // minimal 1 upper, 1 lower, 1 digit, 1 simbol
          if (!/[A-Z]/.test(v)) return false;
          if (!/[a-z]/.test(v)) return false;
          if (!/[0-9]/.test(v)) return false;
          if (!/[^A-Za-z0-9]/.test(v)) return false;
          // tolak pola umum & urutan sederhana
          if (/(0123|1234|2345|3456|4567|5678|6789)/.test(v)) return false;
          const lc = v.toLowerCase();
          if (COMMON_PATTERNS.some((p) => lc.includes(p))) return false;
          // (opsional) hindari tanggal: pola ddmmyyyy / yyyy mm dd sederhana
          if (/\b(?:\d{2}[-/]?\d{2}[-/]?\d{4}|\d{4}[-/]?\d{2}[-/]?\d{2})\b/.test(v)) return false;
          return true;
        },
        defaultMessage() {
          return 'Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character. It should not contain common patterns or simple sequences.';
        },
      },
    });
  };
}

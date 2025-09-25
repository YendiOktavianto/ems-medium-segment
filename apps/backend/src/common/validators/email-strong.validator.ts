import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsStrongEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsStrongEmail',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(val: unknown) {
          if (typeof val !== 'string') return false;
          if (val.length > 100) return false;

          const parts = val.split('@');
          if (parts.length !== 2) return false;
          const [local, domain] = parts;

          // local-part: huruf/angka . _ + ~ -
          if (!/^[A-Za-z0-9._+~-]+$/.test(local)) return false;

          // domain: label 1–63, tidak mulai/akhir dash, TLD huruf ≥2, multi-label boleh
          const domainRegex =
            /^(?!-)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)(?:\.(?!-)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?))*\.[A-Za-z]{2,}$/;

          return domainRegex.test(domain);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is not a valid strong email address`;
        },
      },
    });
  };
}

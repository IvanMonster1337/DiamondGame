import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsOdd(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOdd',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'number' && value % 2 !== 0; // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}

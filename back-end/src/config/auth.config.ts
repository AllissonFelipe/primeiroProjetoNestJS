/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';
//   expiresIn
export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: StringValue;
  };
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwt: {
      secret: process.env.JWT_SECRET as string,
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '1m') as StringValue,
    },
  }),
);

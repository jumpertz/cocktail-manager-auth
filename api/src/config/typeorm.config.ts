import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../domains/users/users.entity';

const IS_LOCAL: boolean = process.env.STAGE === 'local';

export const TypeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  synchronize: IS_LOCAL,
  ssl: !IS_LOCAL,
  extra: IS_LOCAL
    ? {}
    : {
        ssl: {
          rejectUnauthorized: false,
        },
      },
};

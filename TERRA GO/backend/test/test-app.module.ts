import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { UserEntity } from '../src/users/user.entity';
import { getMetadataArgsStorage } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SQL: any = require('sql.js');

console.log('TestAppModule metadata', getMetadataArgsStorage().columns.filter((c: any) => c.target === UserEntity));

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      driver: SQL,
      entities: [UserEntity],
      synchronize: true,
      dropSchema: true,
      logging: false,
    }),
    AuthModule,
  ],
})
export class TestAppModule {}

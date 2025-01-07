import { Module } from '@nestjs/common';
import { ConfigService } from '../config';
import { HashService, PrismaService } from './services';

@Module({
  providers: [HashService, ConfigService, PrismaService],
  exports: [HashService, ConfigService, PrismaService],
})
export class SharedModule {}

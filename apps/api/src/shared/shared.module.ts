import { Module } from '@nestjs/common';
import { ConfigService } from '../config';
import { HashService, StorageService, PrismaService } from './services';

@Module({
  providers: [HashService, StorageService, ConfigService, PrismaService],
  exports: [HashService, StorageService, ConfigService, PrismaService],
})
export class SharedModule {}

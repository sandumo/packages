import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  controllers: [StorageController],
  providers: [],
  imports: [SharedModule],
})
export class StorageModule {}

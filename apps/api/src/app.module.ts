import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { AuthModule } from './app/auth/auth.module';
import { HealthcheckController } from './app/healthcheck/healthcheck.controller';
import { ProductModule } from './app/product/product.module';
import { StorageModule } from './app/storage/storage.module';
import { FileModule } from './app/file/file.module';

@Module({
  imports: [ConfigModule, AuthModule, ProductModule, StorageModule, FileModule],
  controllers: [HealthcheckController],
  providers: [],
})
export class AppModule {}

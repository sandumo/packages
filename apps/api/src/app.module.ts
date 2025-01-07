import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { AuthModule } from './app/auth/auth.module';
import { HealthcheckController } from './app/healthcheck/healthcheck.controller';
import { ProductModule } from './app/product/product.module';
import { StorageModule as StorageModuleInternal } from './app/storage/storage.module';
import { FileModule } from './app/file/file.module';
import { StorageModule } from '@sandumo/nestjs-storage-module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    ProductModule,
    StorageModuleInternal,
    FileModule,
    StorageModule.forRootAsync({
      useFactory: () => ({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        endpoint: process.env.S3_ENDPOINT,
        bucket: process.env.S3_BUCKET,
        rootPath: 'apiest/',
      }),
    }),
  ],
  controllers: [HealthcheckController],
  providers: [],
})
export class AppModule {}

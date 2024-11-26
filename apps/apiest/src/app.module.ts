import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { StorageModule } from '@sandumo/nestjs-storage-module';

@Module({
  imports: [
    StorageModule.forRootAsync({
      useFactory: () => ({
        s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
        s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        s3Endpoint: process.env.S3_ENDPOINT,
        s3Bucket: process.env.S3_BUCKET,
        rootPath: 'apiest/',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

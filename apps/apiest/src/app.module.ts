import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { StorageModule } from '@sandumo/nestjs-storage-module';
import { CacheModule } from '@sandumo/nestjs-cache-module';

@Module({
  imports: [
    StorageModule.forRootAsync({
      useFactory: () => ({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        endpoint: process.env.S3_ENDPOINT,
        bucket: process.env.S3_BUCKET,
        rootPath: 'apiest/',
      }),
    }),
    CacheModule.forRootAsync({
      // imports: [ConfigModule],
      // inject: [ConfigService],
      useFactory: () => ({
        redisUrl: process.env.REDIS_URL,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

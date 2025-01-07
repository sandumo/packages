# @sandumo/nestjs-storage-module

This package provides a NestJS module for interacting with S3 compatible storage.

## Installation

```bash
npm install @sandumo/nestjs-storage-module
```

## Usage

```typescript
import { StorageModule } from '@sandumo/nestjs-storage-module';

@Module({
  imports: [
    StorageModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        endpoint: configService.getS3Endpoint(),
        accessKeyId: configService.getS3AccessKeyId(),
        secretAccessKey: configService.getS3SecretAccessKey(),
        bucket: configService.getS3Bucket(),
      }),
    }),
  ]
})
```

# @sandumo/nestjs-storage-module

This package provides a NestJS module for interacting with storage.

## Installation

```bash
npm install @sandumo/nestjs-storage-module
```

## Usage

```typescript
import { StorageModule } from '@sandumo/nestjs-storage-module';

@Module({
  imports: [StorageModule.forRootAsync({
    s3AccessKeyId: 'your-api-key',
    s3SecretAccessKey: 'your-api-key',
    s3Endpoint: 'your-api-key',
    s3Bucket: 'your-api-key',
  })]
})
```

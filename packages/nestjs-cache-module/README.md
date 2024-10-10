# @sandumo/nestjs-cache-module

This package provides a NestJS module for interacting with cache.

## Installation

```bash
npm install @sandumo/nestjs-cache-module
```

## Usage

```typescript
import { CacheModule } from '@sandumo/nestjs-cache-module';

@Module({
  imports: [
    CacheModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redisUrl: configService.get('REDIS_URL'),
      }),
    }),
  ],
})
```

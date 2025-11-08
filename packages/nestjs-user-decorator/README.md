# @sandumo/nestjs-client-ip-decorator

This package provides a NestJS decorator for getting the client IP address.

## Installation

```bash
npm install @sandumo/nestjs-client-ip-decorator
```

## Usage

```typescript
import { ClientIp } from '@sandumo/nestjs-client-ip-decorator';

@Module({
  imports: [
    ClientIpModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redisUrl: configService.get('REDIS_URL'),
      }),
    }),
  ],
})
```

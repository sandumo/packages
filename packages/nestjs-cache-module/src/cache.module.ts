// cache.module.ts
import { Module, Global, DynamicModule, Provider, Type } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CACHE_MODULE_OPTIONS, CacheServiceOptions } from './cache.options';

export interface CacheModuleAsyncOptions {
  imports?: any[];
  useExisting?: Type<CacheOptionsFactory>;
  useClass?: Type<CacheOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<CacheServiceOptions> | CacheServiceOptions;
  inject?: any[];
}

export interface CacheOptionsFactory {
  createCacheOptions(): Promise<CacheServiceOptions> | CacheServiceOptions;
}

@Global()
@Module({})
export class CacheModule {
  static forRoot(options?: CacheServiceOptions): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        {
          provide: CACHE_MODULE_OPTIONS,
          useValue: options || {},
        },
        CacheService,
      ],
      exports: [CacheService],
    };
  }

  static forRootAsync(options: CacheModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: CacheModule,
      imports: options.imports || [],
      providers: [...asyncProviders, CacheService],
      exports: [CacheService],
    };
  }

  private static createAsyncProviders(options: CacheModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: CACHE_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    const useClass = options.useClass || options.useExisting;
    if (!useClass) {
      throw new Error(
        'Invalid configuration. Must provide useFactory, useClass, or useExisting.',
      );
    }

    return [
      {
        provide: CACHE_MODULE_OPTIONS,
        useFactory: async (optionsFactory: CacheOptionsFactory) =>
          await optionsFactory.createCacheOptions(),
        inject: [useClass],
      },
      ...(options.useClass
        ? [
          {
            provide: useClass,
            useClass: useClass,
          },
        ]
        : []),
    ];
  }
}

import { DynamicModule, Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { STORAGE_MODULE_OPTIONS, StorageModuleOptions } from './storage.options';

@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
  })
export class StorageModule {
  static forRootAsync(options: {
    imports?: any[];
    inject?: any[];
    useFactory: (...args: any[]) => Promise<StorageModuleOptions> | StorageModuleOptions;
  }): DynamicModule {
    const providers = [
      {
        provide: STORAGE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    ];

    return {
      module: StorageModule,
      imports: options.imports || [],
      providers: providers,
      exports: [StorageService],
    };
  }
}

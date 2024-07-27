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
    useFactory: (...args: any[]) => Promise<StorageModuleOptions> | StorageModuleOptions;
    inject?: any[];
    imports?: any[];
  }): DynamicModule {
    const providers = [
      {
        provide: STORAGE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
        imports: options.imports || [],
      },
    ];

    return {
      providers: providers,
      exports: providers,
      module: StorageModule,
    };
  }
}

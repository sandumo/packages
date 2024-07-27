import { DynamicModule, Module } from '@nestjs/common';
import { HashService } from './hash.service';

@Module({
  providers: [HashService],
  exports: [HashService],
})
export class HashModule {
  static forRoot(): DynamicModule {
    const providers = [
      {
        provide: HashService,
        useValue: new HashService(),
      },
    ];

    return {
      providers: providers,
      exports: providers,
      module: HashModule,
    };
  }
}

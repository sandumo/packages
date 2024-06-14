import { DynamicModule, Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ClientOptions } from 'openai';

@Module({
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {
  static forRoot(
    options: ClientOptions,
  ): DynamicModule {
    const providers = [
      {
        provide: OpenAIService,
        useValue: new OpenAIService(options),
      },
    ];

    return {
      providers: providers,
      exports: providers,
      module: OpenAIModule,
    };
  }
}

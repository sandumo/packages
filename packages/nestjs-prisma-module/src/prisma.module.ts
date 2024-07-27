import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  static forRoot(): DynamicModule {
    const providers = [
      {
        provide: PrismaService,
        useValue: new PrismaService(),
      },
    ];

    return {
      providers: providers,
      exports: providers,
      module: PrismaModule,
    };
  }
}

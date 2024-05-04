import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [SharedModule],
})
export class ProductModule {}

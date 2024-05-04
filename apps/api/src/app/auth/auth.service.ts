import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts() {
    const products = await this.prisma.product.findMany();

    return products;
  }
}

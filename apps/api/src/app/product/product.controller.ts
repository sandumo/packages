import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  Brand,
  CreateProductDto,
  GetProductsDto,
  PriceRange,
  Suitability,
  Thickness,
  UpdateProductDto,
  Range,
  Waterproof,
  UpdateProductPicturesDto,
} from './product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { Product } from '~types/prisma.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(
    @Query() getProductDto?: GetProductsDto,
  ): Promise<Product[]> {
    return await this.productService.getProducts(getProductDto);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ): Promise<Product> {
    return await this.productService.createProduct({
      ...createProductDto,
      images,
    });
  }

  @Get('categories')
  async getCategories() {
    return await this.productService.getCategories();
  }

  @Get('colors')
  async getColors() {
    return await this.productService.getColors();
  }

  @Get('brands')
  async getBrands(): Promise<Brand[]> {
    return await this.productService.getBrands();
  }

  @Get('price-ranges')
  async getPriceRanges(): Promise<PriceRange[]> {
    return await this.productService.getPriceRanges();
  }

  @Get('thicknesses')
  async getThicknesses(): Promise<Thickness[]> {
    return await this.productService.getThicknesses();
  }

  @Get('suitabilities')
  async getSuitabilities(): Promise<Suitability[]> {
    return await this.productService.getSuitabilities();
  }

  @Get('ranges')
  async getRanges(): Promise<Range[]> {
    return await this.productService.getRanges();
  }

  @Get('waterproofs')
  async getWaterproofs(): Promise<Waterproof[]> {
    return await this.productService.getWaterproofs();
  }

  @Get(':id')
  async getProduct(@Param('id') id: number): Promise<Product> {
    return await this.productService.getProduct(id);
  }

  @Post(':id')
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(id, updateProductDto);
  }

  @Post(':id/pictures')
  @UseInterceptors(FilesInterceptor('pictures'))
  @ApiConsumes('multipart/form-data')
  async updateProductPictures(
    @Param('id') id: number,
    @Body() updateProductPicturesDto: UpdateProductPicturesDto, // for typing only
    @UploadedFiles() pictures: Array<Express.Multer.File>,
  ) {
    return await this.productService.updateProductPictures(id, { pictures });
  }

  @Post(':id/duplicate')
  async duplicateProduct(@Param('id') id: number): Promise<Product> {
    return await this.productService.duplicateProduct(id);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: number) {
    return await this.productService.deleteProduct(id);
  }
}

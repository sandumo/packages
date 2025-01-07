import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services';
import { StorageService } from '@sandumo/nestjs-storage-module';
import {
  Brand,
  CreateProductDto,
  GetProductsDto,
  PriceRange,
  Suitability,
  Thickness,
  Range,
  Color,
  Waterproof,
  FiltersType,
  UpdateProductDto,
  UpdateProductPicturesDto,
} from './product.dto';
import { Product } from '@prisma/client';
import { omit } from '@sandumo/utils';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getProducts(getProductDto: GetProductsDto) {
    const filters = JSON.parse(getProductDto.filters || '{}') as FiltersType;

    // console.log('[x] filters', filters);

    const products = await this.prisma.product.findMany({
      where: {
        // color: getProductDto.color,

        AND: [
          !getProductDto.showInactives && { active: true },

          // Colors
          filters.colors &&
            filters.colors.length && {
              color: { in: filters.colors.map((o) => o.label) },
            },

          // Brands
          filters.brands &&
            filters.brands.length && {
              brand: { in: filters.brands.map((o) => o.label) },
            },

          // Price
          filters.priceRanges &&
            filters.priceRanges.length && {
              OR: [
                ...filters.priceRanges.map((range) => ({
                  pricePerSquareMeter: {
                    gte: range.min,
                    lte: range.max,
                  },
                })),
              ],
            },

          // Thickness
          filters.thicknesses &&
            filters.thicknesses.length && {
              thicknesses: { in: filters.thicknesses.map((o) => o.value) },
            },

          // Suitability
          filters.suitabilities &&
            filters.suitabilities.length && {
              suitability: {
                hasEvery: filters.suitabilities.map((o) => o.label),
              },
            },

          // Waterproof
          filters.waterproofs &&
            filters.waterproofs.length === 1 && {
              waterproof: filters.waterproofs[0].label === 'Yes',
            },

          // Ranges
          filters.ranges &&
            filters.ranges.length && {
              range: { in: filters.ranges.map((o) => o.label) },
            },
        ].filter(Boolean),
      },
      orderBy: {
        id: 'asc',
      },
    });

    return products;
  }

  async getProduct(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id: Number(id) },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(data: CreateProductDto) {
    return await this.prisma.product.create({
      data: {
        ...omit(data, 'images', 'pictures'),
        // pictures: {
        //   create: data.images.map((image) => ({
        //     name: image.originalname,
        //     type: image.mimetype,
        //     size: image.size,
        //     path: '',
        //   })),
        // },
      },
    });
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto) {
    const { ...data } = updateProductDto;

    // console.log('[x] data', data);

    // console.log('[x] picture', await this.storageService.uploadFiles(pictures));

    return await this.prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...data,
        // pictures: {
        //   create: await this.storageService.uploadFiles(pictures),
        // },
      },
    });
  }

  async updateProductPictures(id: number, data: UpdateProductPicturesDto) {
    const { pictures } = data;

    // console.log('[x] updateProductPictures', id, pictures, picturesMeta);

    // const files = await this.storageService.uploadFiles(pictures);

    // console.log('[x] epta files', files);

    // await this.prisma.product.update({
    //   where: { id: Number(id) },
    //   data: {
    //     // ...data,
    //     pictures: {
    //       set: [],
    //     },
    //   },
    // });

    const pics = await this.storageService.uploadFiles(pictures);

    // console.log('[x] pics', pictures, pics);

    // console.log('[x] upsert', upsert);

    // const p: Prod

    return await this.prisma.product.update({
      where: { id: Number(id) },
      data: {
        // ...data,
        pictures: pics,
        // {
        // set: [],
        // upsert,
        // await this.storageService
        //   .uploadFiles(pictures)
        //   .then((pictures) =>
        //     pictures.map((picture, index) => ({
        //       create: { ...picture, index },
        //       update: { ...picture, index },
        //       where: { id: picture.id || 0 },
        //     })),
        //   ),
        // },
      },
    });

    // return await this.prisma.product.update({
    //   where: { id: Number(id) },
    //   data: {
    //     pictures: {
    //       create: pictures.map((image, i) => ({
    //         name: image.originalname,
    //         type: image.mimetype,
    //         size: image.size,
    //         path: '',
    //         meta: picturesMeta[i],
    //       })),
    //     },
    //   },
    // });
  }

  async duplicateProduct(id: number): Promise<Product> {
    const product = await this.getProduct(id);

    return await this.createProduct({
      ...omit(product, 'id', 'title', 'images'),
      title: product.title + ` (Copy of #${id})`,
    });
  }

  async deleteProduct(id: number) {
    return await this.prisma.product.delete({
      where: { id: Number(id) },
    });
  }

  async getCategories() {
    return (
      await this.prisma.product.findMany({
        distinct: ['category'],
        select: {
          category: true,
        },
      })
    ).map((product) => product.category);
  }

  async getColors(): Promise<Color[]> {
    let i = 1;

    return ['White', 'Grey', 'Light', 'Medium', 'Dark', 'Brown'].map(
      (color) => ({
        id: i++,
        label: color,
      }),
    );

    // return (
    //   await this.prisma.product.findMany({
    //     distinct: ['color'],
    //     select: {
    //       color: true,
    //     },
    //   })
    // ).map((product) => product.color);
  }

  async getBrands(): Promise<Brand[]> {
    let i = 1;

    return ['Quickstep', 'Kronotex', 'Premoda', 'Balterio'].map((brand) => ({
      id: i++,
      label: brand,
    }));
  }

  async getPriceRanges(): Promise<PriceRange[]> {
    let i = 1;

    return [
      '10.00£ - 14.99£',
      '15.00£ - 19.99£',
      '20.00£ - 24.99£',
      '25.00£ - 29.99£',
      '30.00£ - 34.99£',
      '35.00£ - 39.99£',
    ].map((range) => ({
      id: i++,
      label: range,
      min: Number(range.split('£')[0]),
      max: Number(range.split('-')[1].slice(1, 5)),
    }));
  }

  async getThicknesses(): Promise<Thickness[]> {
    let i = 1;

    return ['8mm', '9mm', '10mm', '12mm'].map((thickness) => ({
      id: i++,
      label: thickness,
      value: Number(thickness.split('mm')[0]),
    }));
  }

  async getSuitabilities(): Promise<Suitability[]> {
    let i = 1;

    return [
      'Living room',
      'Bedroom',
      'Bathroom',
      'Hallway',
      'Kitchen',
      'Basement',
      'Stairs',
      'Conservatory',
      'Underfloor heating',
    ].map((suitability) => ({
      id: i++,
      label: suitability,
    }));
  }

  async getRanges(): Promise<Range[]> {
    let i = 1;

    return [
      'Quickstep Capture (Signature)',
      'Quickstep Eligna',
      'Quickstep Impressive',
      'Quickstep Impressive Ultra',
      'Quickstep Largo',
      'Kronotex Exquisite',
      'Kronotex Amazone',
      'Kronotex Robusto Villa',
      'Kronotex Herringbone',
      'Premoda Sabbia',
      'Premoda Ruscello',
      'Premoda Cattedrale',
      'Balterio Traditions',
    ].map((range) => ({
      id: i++,
      label: range,
    }));
  }

  async getWaterproofs(): Promise<Waterproof[]> {
    let i = 1;

    return ['Yes', 'No'].map((waterproof) => ({
      id: i++,
      label: waterproof,
    }));
  }
}

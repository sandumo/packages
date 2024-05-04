import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Product } from '~types/prisma.dto';

export class UpdateProductDto extends PartialType(
  OmitType(Product, ['id', 'images', 'pictures']),
) {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? Number(value) : null))
  thickness?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? Number(value) : null))
  pricePerSquareMeter?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? Number(value) : null))
  oldPricePerSquareMeter?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? Number(value) : null))
  pricePerPack?: number;
}

export class UpdateProductPicturesDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  pictures?: Express.Multer.File[];
}

export class CreateProductDto extends PartialType(
  OmitType(Product, ['id', 'images']),
) {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsString()
  color: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? Number(value) : null))
  thickness?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? Number(value) : null))
  pricePerSquareMeter?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? Number(value) : null))
  oldPricePerSquareMeter?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value !== '' ? Number(value) : null))
  pricePerPack?: number;

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  @IsOptional()
  images?: Express.Multer.File[];
}

export class Brand {
  id: number;
  label: string;
}

export class PriceRange {
  id: number;
  label: string;
  min: number;
  max: number;
}

export class Thickness {
  id: number;
  label: string;
  value: number;
}

export class Suitability {
  id: number;
  label: string;
}

export class Range {
  id: number;
  label: string;
}

export class Color {
  id: number;
  label: string;
}

export class Waterproof {
  id: number;
  label: string;
}

export class FiltersType {
  colors?: Color[];
  brands?: Brand[];
  priceRanges?: PriceRange[];
  thicknesses?: Thickness[];
  suitabilities?: Suitability[];
  waterproofs?: Waterproof[];
  ranges?: Range[];
}

export class GetProductsDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  filters?: string;

  @IsBooleanString()
  @IsOptional()
  showInactives?: boolean;
}

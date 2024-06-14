import { FileReference } from './prisma-json-types.dto';

export class User {
  id: number;
  email: string;
  password: string;
}

export class Product {
  id: number;
  title: string;
  category: string;
  description: string;
  color: string;
  pricePerSquareMeter: number | null;
  pricePerPack: number | null;
  oldPricePerSquareMeter: number | null;
  highlights?: string[];
  suitability?: string[];
  specifications: Record<string, any> | null;
  images?: string[];
  active: boolean;
  referenceURL: string | null;
  brand: string | null;
  thickness: number | null;
  waterproof: boolean | null;
  range: string | null;
  pictures?: FileReference[];
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

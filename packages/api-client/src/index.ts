// Utilities
class Config {
  _queryClient: any;

  get queryClient(): any {
    return this._queryClient;
  }

  set queryClient(queryClient: any) {
    this._queryClient = queryClient;
  }
}

export const config = new Config();

class Cache {
  private storage: any = {};

  private formatKey(key: any[]): string {
    return key.map(k => JSON.stringify(k)).join('.');
  }

  set(key: any[], value: any) {
    this.storage[this.formatKey(key)] = value;
  }

  async get<T>(key: any, callback?: () => Promise<T>): Promise<T | null> {
    let result = this.storage[this.formatKey(key)];

    if (!result && callback) {
      result = await callback();

      if (result) {
        this.set(key, result);
      }
    }

    return result || null;
  }

  remove(key: any[]) {
    delete this.storage[this.formatKey(key)];
    config.queryClient.invalidateQueries(key);
  }

  invalidate(key: any[]) {
    delete this.storage[this.formatKey(key)];
    config.queryClient.invalidateQueries(key);
  }
}

export const cache = new Cache();

type RequestOptions = {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  queryParams?: Record<string, string>;
  body?: Record<string, any>;
}

function request({
  method,
  path,
  queryParams,
  body,
}: RequestOptions) {

  // axios[method](path, {

}

export function getQueryKey(path: string) {
  return path.split('/').filter(part => !!part);
}

export function toFormData(data: Record<string, any>) {
  const formData = new FormData();

  for (const key in data) {
    if (Array.isArray(data[key])) {
      for (const item of data[key]) {
        formData.append(key, item);
      }
    } else if (data[key] && typeof data[key] === 'object') {
      Object.keys(data[key]).forEach(subKey => {
        if (subKey) {
          formData.append(`${key}[${subKey}]`, data[key][subKey]);
        }
      });
    } else {
      let value = data[key];

      if (value === null || value === undefined) {
        value = '';
      }

      formData.append(key, value);
    }
  }

  return formData;
}

// Imports
import axios from 'axios';

// Types
export type FileReference = {
  name: string;
  path: string;
  size: number;
  type: string;
}

export type Product = {
  id: number;
  title: string;
  category: string;
  description: string;
  color: string;
  pricePerSquareMeter: number;
  pricePerPack: number;
  oldPricePerSquareMeter: number;
  highlights: string[];
  suitability: string[];
  specifications: Record<string, any>;
  images: string[];
  active: boolean;
  referenceURL: string;
  brand: string;
  thickness: number;
  waterproof: boolean;
  range: string;
  pictures: FileReference[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export type CreateProductDto = {
  images?: File[];
  title: string;
  category: string;
  description: string;
  color: string;
  thickness?: number;
  pricePerSquareMeter?: number;
  oldPricePerSquareMeter?: number;
  pricePerPack?: number;
  highlights?: string[];
  suitability?: string[];
  specifications?: Record<string, any>;
  active?: boolean;
  referenceURL?: string;
  brand?: string;
  waterproof?: boolean;
  range?: string;
  pictures?: FileReference[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export type Color = {
  id: number;
  label: string;
}

export type Brand = {
  id: number;
  label: string;
}

export type PriceRange = {
  id: number;
  label: string;
  min: number;
  max: number;
}

export type Thickness = {
  id: number;
  label: string;
  value: number;
}

export type Suitability = {
  id: number;
  label: string;
}

export type Range = {
  id: number;
  label: string;
}

export type Waterproof = {
  id: number;
  label: string;
}

export type UpdateProductDto = {
  thickness?: number;
  pricePerSquareMeter?: number;
  oldPricePerSquareMeter?: number;
  pricePerPack?: number;
  title?: string;
  category?: string;
  description?: string;
  color?: string;
  highlights?: string[];
  suitability?: string[];
  specifications?: Record<string, any>;
  active?: boolean;
  referenceURL?: string;
  brand?: string;
  waterproof?: boolean;
  range?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export type UpdateProductPicturesDto = {
  pictures?: File[];
}

// Controllers
class HealthcheckController {
  /**
   * @see file://./../../../apps/api/src/app/healthcheck/healthcheck.controller.ts#HealthcheckController#get
   */
  async get(): Promise<any> {
    const response = await axios.get('/healthcheck').then(res => res.data);

    return response;
  }

  getQuery() {
    return {
      queryKey: [...getQueryKey('/healthcheck')],
      queryFn: (): Promise<any> => this.get(),
    };
  }
}

class AuthController {
  /**
   * @see file://./../../../apps/api/src/app/auth/auth.controller.ts#AuthController#getHello
   */
  async getHello(): Promise<any> {
    const response = await axios.get('/auth').then(res => res.data);

    return response;
  }

  getHelloQuery() {
    return {
      queryKey: [...getQueryKey('/auth')],
      queryFn: (): Promise<any> => this.getHello(),
    };
  }
}

class ProductController {
  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#getProducts
   */
  async getProducts(query: { page?: number; limit?: number; filters?: string; showInactives?: boolean }): Promise<Product[]> {
    const response = await axios.get('/products', { params: query }).then(res => res.data);

    return response;
  }

  getProductsQuery(query: { page?: number; limit?: number; filters?: string; showInactives?: boolean }) {
    return {
      queryKey: [...getQueryKey('/products'), query],
      queryFn: (): Promise<Product[]> => this.getProducts(query),
    };
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#createProduct
   */
  async createProduct(body: CreateProductDto): Promise<Product> {
    const response = await axios.post('/products', toFormData(body), { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

    if (Math.floor(response.status / 100) === 2) {
      cache.invalidate(getQueryKey('/products').slice(0, 1));
    }

    return response;
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#getCategories
   */
  async getCategories(): Promise<string[]> {
    const response = await axios.get('/products/categories').then(res => res.data);

    return response;
  }

  getCategoriesQuery() {
    return {
      queryKey: [...getQueryKey('/products/categories')],
      queryFn: (): Promise<string[]> => this.getCategories(),
    };
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#getColors
   */
  async getColors(): Promise<Color[]> {
    const response = await axios.get('/products/colors').then(res => res.data);

    return response;
  }

  getColorsQuery() {
    return {
      queryKey: [...getQueryKey('/products/colors')],
      queryFn: (): Promise<Color[]> => this.getColors(),
    };
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#getBrands
   */
  async getBrands(): Promise<Brand[]> {
    const response = await axios.get('/products/brands').then(res => res.data);

    return response;
  }

  getBrandsQuery() {
    return {
      queryKey: [...getQueryKey('/products/brands')],
      queryFn: (): Promise<Brand[]> => this.getBrands(),
    };
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#getPriceRanges
   */
  async getPriceRanges(): Promise<PriceRange[]> {
    const response = await axios.get('/products/price-ranges').then(res => res.data);

    return response;
  }

  getPriceRangesQuery() {
    return {
      queryKey: [...getQueryKey('/products/price-ranges')],
      queryFn: (): Promise<PriceRange[]> => this.getPriceRanges(),
    };
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#getThicknesses
   */
  async getThicknesses(): Promise<Thickness[]> {
    const response = await axios.get('/products/thicknesses').then(res => res.data);

    return response;
  }

  getThicknessesQuery() {
    return {
      queryKey: [...getQueryKey('/products/thicknesses')],
      queryFn: (): Promise<Thickness[]> => this.getThicknesses(),
    };
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#getSuitabilities
   */
  async getSuitabilities(): Promise<Suitability[]> {
    const response = await axios.get('/products/suitabilities').then(res => res.data);

    return response;
  }

  getSuitabilitiesQuery() {
    return {
      queryKey: [...getQueryKey('/products/suitabilities')],
      queryFn: (): Promise<Suitability[]> => this.getSuitabilities(),
    };
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#getRanges
   */
  async getRanges(): Promise<Range[]> {
    const response = await axios.get('/products/ranges').then(res => res.data);

    return response;
  }

  getRangesQuery() {
    return {
      queryKey: [...getQueryKey('/products/ranges')],
      queryFn: (): Promise<Range[]> => this.getRanges(),
    };
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#getWaterproofs
   */
  async getWaterproofs(): Promise<Waterproof[]> {
    const response = await axios.get('/products/waterproofs').then(res => res.data);

    return response;
  }

  getWaterproofsQuery() {
    return {
      queryKey: [...getQueryKey('/products/waterproofs')],
      queryFn: (): Promise<Waterproof[]> => this.getWaterproofs(),
    };
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#getProduct
   */
  async getProduct(id: number): Promise<Product> {
    const response = await axios.get(`/products/${id}`).then(res => res.data);

    return response;
  }

  getProductQuery(id: number) {
    return {
      queryKey: [...getQueryKey(`/products/${id}`)],
      queryFn: (): Promise<Product> => this.getProduct(id),
    };
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#updateProduct
   */
  async updateProduct(id: number, body: UpdateProductDto): Promise<any> {
    const response = await axios.post(`/products/${id}`, body).then(res => res.data);

    if (Math.floor(response.status / 100) === 2) {
      cache.invalidate(getQueryKey(`/products/${id}`).slice(0, 1));
    }

    return response;
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#deleteProduct
   */
  async deleteProduct(id: number): Promise<any> {
    const response = await axios.delete(`/products/${id}`).then(res => res.data);

    if (Math.floor(response.status / 100) === 2) {
      cache.invalidate(getQueryKey(`/products/${id}`).slice(0, 1));
    }

    return response;
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#updateProductPictures
   */
  async updateProductPictures(id: number, body: UpdateProductPicturesDto): Promise<any> {
    const response = await axios.post(`/products/${id}/pictures`, toFormData(body), { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

    if (Math.floor(response.status / 100) === 2) {
      cache.invalidate(getQueryKey(`/products/${id}/pictures`).slice(0, 1));
    }

    return response;
  }

  /**
   * @see file://./../../../apps/api/src/app/product/product.controller.ts#ProductController#duplicateProduct
   */
  async duplicateProduct(id: number): Promise<Product> {
    const response = await axios.post(`/products/${id}/duplicate`).then(res => res.data);

    if (Math.floor(response.status / 100) === 2) {
      cache.invalidate(getQueryKey(`/products/${id}/duplicate`).slice(0, 1));
    }

    return response;
  }
}

class StorageController {
  /**
   * @see file://./../../../apps/api/src/app/storage/storage.controller.ts#StorageController#getFile
   */
  async getFile(): Promise<any> {
    const response = await axios.get('/storage/**').then(res => res.data);

    return response;
  }

  getFileQuery() {
    return {
      queryKey: [...getQueryKey('/storage/**')],
      queryFn: (): Promise<any> => this.getFile(),
    };
  }
}

// Export
const api = {
  healthcheck: new HealthcheckController(),
  auth: new AuthController(),
  product: new ProductController(),
  storage: new StorageController(),
  axios,
  cache,
  config,
};

export default api;

export interface StorageModuleOptions {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;

  /**
   * @default 'default'
   */
  bucket?: string;

  /**
   * @default 'us-east-1'
   */
  region?: string;

  /**
   * @default true
   */
  forcePathStyle?: boolean;

  /**
   * @default '/'
   */
  rootPath?: string;

  /**
   * All unnamed files will be stored in a subfolder named 'unnamed' and will be given a random name.
   * @default '/unnamed'
   */
  unnamedRootPath?: string;
}

export const STORAGE_MODULE_OPTIONS = Symbol('STORAGE_MODULE_OPTIONS');

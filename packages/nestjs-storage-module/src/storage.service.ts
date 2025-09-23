import { ReadStream } from 'fs';
import { S3Client, GetObjectCommand, PutObjectCommand, ListBucketsCommand, CreateBucketCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { Stream } from 'stream';
import { STORAGE_MODULE_OPTIONS, StorageModuleOptions } from './storage.options';
import { Readable } from 'stream';
import { randomBytes } from 'crypto';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private BUCKET: string;
  private ROOT_PATH: string;
  private UNNAMED_ROOT_PATH: string;
  private _isUp: boolean;

  constructor(@Inject(STORAGE_MODULE_OPTIONS) private options: StorageModuleOptions) {
    try {
      this.s3Client = new S3Client({
        credentials: {
          accessKeyId: this.options.accessKeyId,
          secretAccessKey: this.options.secretAccessKey,
        },
        endpoint: this.options.endpoint,
        region: this.options.region || 'us-east-1',
        forcePathStyle: true,
      });
      this.BUCKET = this.options.bucket || 'default';
      this.ROOT_PATH = this.options.rootPath ? this.options.rootPath + (this.options.rootPath.endsWith('/') ? '' : '/') : '';
      this.createBucket();
      this._isUp = true;
      this.UNNAMED_ROOT_PATH = this.options.unnamedRootPath ? this.ROOT_PATH + this.options.unnamedRootPath + (this.options.unnamedRootPath.endsWith('/') ? '' : '/') : this.ROOT_PATH + 'unnamed/';
    } catch (error) {
      console.error(error);
    }
  }

  private isUp() {
    return this._isUp;
  }

  async getObject(key: string): Promise<Readable> {
    if (!this.isUp()) {
      return null;
    }

    const command = new GetObjectCommand({ Bucket: this.BUCKET, Key: key });
    const response = await this.s3Client.send(command);
    return response.Body as Readable;
  }

  async putObject(blobName: string, blob: Buffer): Promise<any> {
    if (!this.isUp()) {
      return null;
    }

    const command = new PutObjectCommand({
      Bucket: this.BUCKET,
      Key: blobName,
      Body: blob,
    });

    return this.s3Client.send(command);
  }

  async getStream(key: string): Promise<Stream> {
    const response = await this.getObject(key);
    return response;
  }

  async putStream(key: string, stream: ReadStream): Promise<any> {
    if (!this.isUp()) {
      return null;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const fileBuffer = Buffer.concat(chunks);
    return this.putObject(key, fileBuffer);
  }

  private async createBucket() {
    if (!this.isUp()) {
      return null;
    }

    const command = new ListBucketsCommand({});
    const response = await this.s3Client.send(command);
    const bucketExists = response.Buckets?.some((b) => b.Name === this.BUCKET);

    if (!bucketExists) {
      console.log(`Creating bucket ${this.BUCKET}`);
      const createBucketCommand = new CreateBucketCommand({ Bucket: this.BUCKET });
      return this.s3Client.send(createBucketCommand);
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    await this.s3Client.send(
      new CopyObjectCommand({
        Bucket: this.BUCKET,
        CopySource: `${this.BUCKET}/${this.path(oldPath)}`,
        Key: this.path(newPath),
      })
    );

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.BUCKET,
        Key: this.path(oldPath),
      })
    );
  }

  getRandomKey(): string {
    return randomBytes(32).toString('hex');
  }

  uploadFiles(files: Express.Multer.File[], getFilepath?: (file: Express.Multer.File) => string): Promise<any[]> {
    return Promise.all(
      files.map(async (file) => {
        if (file.mimetype === 'application/file-reference') {
          return JSON.parse(file.buffer.toString());
        }

        const filepath = `${this.ROOT_PATH}${getFilepath ? getFilepath(file) : `${this.UNNAMED_ROOT_PATH}${this.getRandomKey()}.${file.originalname.split('.').pop()}`}`;
        await this.putObject(filepath, file.buffer);
        return {
          name: file.originalname,
          path: filepath,
          type: file.mimetype,
          size: file.size,
        };
      }),
    );
  }

  async uploadFile(file: Express.Multer.File, filepath?: string): Promise<any> {
    if (file.mimetype === 'application/file-reference') {
      return JSON.parse(file.buffer.toString());
    }

    filepath = filepath
      ? (filepath.startsWith(this.ROOT_PATH) ? filepath : `${this.ROOT_PATH}${filepath}`)
      : `${this.UNNAMED_ROOT_PATH}${this.getRandomKey()}.${file.originalname.split('.').pop()}`;

    await this.putObject(filepath, file.buffer);

    return {
      name: file.originalname,
      path: filepath,
      type: file.mimetype,
      size: file.size,
    };
  }

  path(filepath: string) {
    if (filepath.startsWith(this.ROOT_PATH)) {
      return filepath;
    }

    return `${this.ROOT_PATH}${filepath}`;
  }
}

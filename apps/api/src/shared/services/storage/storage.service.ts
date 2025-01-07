import { ReadStream } from 'fs';
import * as AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';
import { Stream } from 'stream';
import { Prisma } from '@prisma/client';
import { FileReference } from '@sandumo/file-reference';

@Injectable()
export class StorageService {
  private S3: AWS.S3;
  private BUCKET: string;

  constructor(private configService: ConfigService) {
    // console.log('[x] epta here');
    // try {
    //   this.S3 = new AWS.S3({
    //     accessKeyId: this.configService.getS3AccessKeyId(),
    //     secretAccessKey: this.configService.getS3SecretAccessKey(),
    //     endpoint: this.configService.getS3Endpoint(),
    //     s3ForcePathStyle: true,
    //     signatureVersion: 'v4',
    //     sslEnabled: false,
    //     correctClockSkew: true,
    //   });
    //   this.BUCKET = this.configService.getS3Bucket();
    //   this.createBucket();
    // } catch (error) {
    //   console.error(error);
    // }
  }

  private isUp() {
    return !!this.S3;
  }

  async getObject(
    key: string,
  ): Promise<PromiseResult<AWS.S3.GetObjectOutput, AWS.AWSError>> {
    if (!this.isUp()) {
      return null;
    }

    const params = { Bucket: this.BUCKET, Key: key };

    return await this.S3.getObject(params).promise();
  }

  async putObject(blobName: string, blob: Buffer): Promise<any> {
    if (!this.isUp()) {
      return null;
    }

    const uploadedBlob = await this.S3.upload({
      Bucket: this.BUCKET,
      Key: blobName,
      Body: blob,
    }).promise();

    return uploadedBlob;
  }

  async getStream(key: string): Promise<Stream> {
    if (!this.isUp()) {
      return null;
    }

    const stream = await this.S3.getObject({
      Bucket: this.BUCKET,
      Key: key,
    }).createReadStream();

    return stream;
  }

  // to get stream you can use file.createReadStream()
  async putStream(
    key: string,
    stream: ReadStream,
  ): Promise<AWS.S3.PutObjectOutput> {
    if (!this.isUp()) {
      return null;
    }

    const file = await new Promise<AWS.S3.PutObjectOutput>(
      (resolve, reject) => {
        const handleError = (error) => {
          reject(error);
        };
        const chunks: Buffer[] = [];

        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        stream.once('end', async () => {
          const fileBuffer = Buffer.concat(chunks);

          try {
            const uploaded = await this.putObject(key, fileBuffer);

            resolve(uploaded);
          } catch (error) {
            handleError(new InternalServerErrorException(error));
          }
        });

        stream.on('error', (error) =>
          handleError(new InternalServerErrorException(error)),
        );
      },
    );

    return file;
  }

  private async createBucket() {
    if (!this.isUp()) {
      return null;
    }

    const res = await this.S3.listBuckets().promise();

    if (res) {
      const bucket = res.Buckets.find((b) => b.Name === this.BUCKET);

      if (!bucket) {
        console.log(`Creating bucket ${this.BUCKET}`);
        return this.S3.createBucket({ Bucket: this.BUCKET }).promise();
      }
    }
  }

  uploadFiles(files: Express.Multer.File[]): Promise<Prisma.FileReference[]> {
    return Promise.all(
      files.map(async (file) => {
        if (file.mimetype === 'application/file-reference') {
          // console.log('[x] epta here', JSON.parse(file.buffer.toString()));

          // return null;
          const json = JSON.parse(file.buffer.toString());

          // console.log('[x] id ept', json.id, json);

          return json;
        }

        // return null;

        const filepath =
          'test/' +
          require('crypto').randomBytes(32).toString('hex') +
          '.' +
          file.originalname.split('.').pop();

        // console.log('[x] eblan', filepath);

        await this.putObject(filepath, file.buffer);

        return {
          name: file.originalname,
          path: filepath,
          type: file.mimetype,
          size: file.size,
        } as unknown as FileReference;
      }),
    );
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Resource, Query, schema } from './schema';
import { castData, traverse } from 'engine/utils';
import { FIELD_TYPE, QueryFilter, User } from '../engine/types';
import { StorageService } from '@sandumo/nestjs-storage-module';
import { App } from 'engine';
import { Tree } from 'engine/tree';
import { CacheService } from '@sandumo/nestjs-cache-module';
import * as prisma from '@prisma/client';
import { Apiest } from 'engine/apiest';
import * as _ from 'lodash';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  private app: Apiest;

  onModuleInit() {
    this.app = new Apiest(
      schema,
      new prisma.PrismaClient(),
      this.cacheService,
      this.storageService,
    );
  }

  async getMany(user: User, resource: Resource, query: Query) {
    const app = new App(schema, resource, user, query, 'list', null);

    app.setLanguage('en');

    const prismaSelect = app.getSelect();

    if (!prismaSelect) {
      throw new ForbiddenException();
    }

    const prismaFilter = app.getFilter();

    const [result, total] = await Promise.all([
      this.prismaService[resource.name].findMany({
        ...prismaSelect,
        where: prismaFilter,
        take: query.pageSize || 10,
        skip: ((query.page || 1) - 1) * (query.pageSize || 10),
      }),
      this.prismaService[resource.name].count({
        where: prismaFilter,
      }),
    ]);

    const processed = app.postProcess(result);

    return {
      data: processed,
      pagination: {
        page: query.page || 1,
        pageSize: query.pageSize || 10,
        totalPages: Math.ceil(total / (query.pageSize || 10)),
        totalItems: total,
      },
    };
  }

  async getOne(
    user: User,
    resource: Resource,
    identificationFilter: QueryFilter,
    query: Query,
  ) {
    // const language = (await this.prismaService.language.findFirst({
    //   where: {
    //     locale: 'en',
    //   },
    //   include: {
    //     fallback: {
    //       include: {
    //         fallback: true,
    //       },
    //     },
    //   },
    // })) as unknown as Language;

    const app = new App(schema, resource, user, query, 'read', null);

    app.setLanguage('en');

    // Get the attributes allowed by the permissions
    // const attributes = getPrismaMask(resource, user.permissions);

    const prismaSelect = app.getSelect();

    console.log('[x] prismaSelect=', prismaSelect);

    // If no attribute is allowed then the user doesn't have permission to this resource
    if (!prismaSelect) {
      throw new ForbiddenException();
    }

    const prismaFilter = app.getFilter();

    console.log('[x] prismaFilter=', prismaFilter);

    // Get the filter produced by the conditions from the permissions
    // const [, permissionFilter] = combinePermissions(
    //   user.permissions,
    //   resource,
    //   'read',
    // );

    // Combine the identification filter and the permission filter
    const filter = {
      AND: [identificationFilter, prismaFilter].filter(Boolean),
    };

    // Run the query
    const result = await this.prismaService[resource.name].findFirst({
      ...prismaSelect,
      where: filter,
    });

    return app.postProcess(result);
  }

  /**
   * Steps:
   *   1. splitData
   *   2. clean: apply permissions, remove non-existent fields
   *   3. cast
   *   4. validate
   *   5. merge data back
   *   6. get filter
   *   7. generate file names
   *   8. upload files / update database
   */
  async create(user: User, resource: Resource, rawData: any) {
    // const app = new App(schema, resource, user, {}, 'create', rawData);

    const app = await this.app.getApp(
      resource,
      user,
      {},
      'create',
      rawData,
      'en',
    );

    const splittedData = app.splitData(rawData);

    console.log('[x] splittedData=', splittedData);

    // 2. clean data: apply permissions, remove non-existent fields

    const cleanedData = Tree.map(splittedData, (key, value) =>
      app.cleanData(value),
    );

    if (Object.keys(cleanedData).length === 0) {
      throw new BadRequestException();
    }

    console.log('[x] cleanedData=', cleanedData);

    // 3. cast data: cast data to the correct type

    const castedData = Tree.map(cleanedData, (key, value) =>
      app.castData(value),
    );

    console.log('[x] castedData=', castedData);

    // 4. validate data

    const validationResult = Tree.map(castedData, (key, value) =>
      app.validateData(value),
    );

    if (
      Object.values(validationResult).some((result: any) => !result.success)
    ) {
      throw new BadRequestException(Object.values(validationResult));
    }

    // 5. merge data back
    const mergedData = app.mergeData(castedData);

    console.log('[x] mergedData= ', mergedData);

    // 6. get create data

    const createData = await app.getCreateData(mergedData);

    console.log('[x] createData= ', JSON.stringify(createData, null, 2));

    // const select = app.getSelect();

    // console.log('[x] select= ', JSON.stringify(select, null, 2));

    // 7. upload files to a temporary folder / create the record in the database
    const [fileUploads, createdRecord] = await Promise.all([
      this.app.asyncTraverse(
        mergedData,
        resource,
        async (key, value, field) => {
          if (field.type === FIELD_TYPE.FILE) {
            if (field.iterable) {
              return await Promise.all(
                value.map(
                  async (file) => await this.storageService.uploadFile(file),
                ),
              );
            }

            return await this.storageService.uploadFile(value);
          }

          return value;
        },
        true,
      ),
      this.prismaService[resource.name].create({
        ...app.getSelect(),
        data: createData,
      }),
    ]);

    console.log('[x] fileUploads= ', JSON.stringify(fileUploads, null, 2));
    console.log('[x] createdRecord=', createdRecord);

    // assign the primary key (recursively) to the fileUploads object to be used further
    await this.app.asyncTraverse(
      createdRecord,
      resource,
      (key, value, field, resource, schema, path) => {
        if (field.primaryKey) {
          _.set(fileUploads, [...path.slice(1), resource.primaryKey], value); // assignment
        }
      },
      true,
    );

    // filter fields for update: leave primary keys and set path for files (recursively)
    const dataToUpdate = await this.app.asyncTraverse(
      fileUploads,
      resource,
      (key, value, field, resource, schema, path) => {
        if (field.type === FIELD_TYPE.FILE) {
          if (field.iterable) {
            return value.map((file: any) => {
              if (file.mimetype === 'application/file-reference') {
                return file;
              }

              return {
                ...file,
                path: this.storageService.path(
                  `files/${resource.name}/${_.get(createdRecord, [...path.slice(1), resource.primaryKey])}/${field.name}/${file.path.split('/').pop()}`,
                ),
              };
            });
          }

          return {
            ...value,
            path: this.storageService.path(
              `files/${resource.name}/${_.get(createdRecord, [...path.slice(1), resource.primaryKey])}/${field.name}.${value.path.split('.').pop()}`,
            ),
          };
        }

        if (field.primaryKey) {
          return value;
        }
      },
      true,
    );

    console.log('[x] dataToUpdate= ', JSON.stringify(dataToUpdate, null, 2));

    // transform date to prisma data format
    const dataToUpdate1 = await app.getUpdateData(dataToUpdate);

    console.log('[x] dataToUpdate1= ', JSON.stringify(dataToUpdate1, null, 2));

    // rename files from temporary folder to the final folder / update file references in the database (recursively)
    const [, updatedRecord] = await Promise.all([
      // rename files from temporary folder to the final folder (recursively)
      this.app.asyncTraverse(
        fileUploads,
        resource,
        async (key, value, field, resource, schema, path) => {
          if (field.type === FIELD_TYPE.FILE) {
            if (field.iterable) {
              return await Promise.all(
                value.map(async (file) => {
                  // const newPath = `files/${resource.name}/${_.get(record, [...path.slice(1), resource.primaryKey])}/${field.name}/${file.path.split('/').pop()}`;

                  // console.log('[x] arr newPath= ', newPath);
                  await this.storageService.renameFile(
                    file.path,
                    this.storageService.path(
                      `files/${resource.name}/${_.get(createdRecord, [...path.slice(1), resource.primaryKey])}/${field.name}/${file.path.split('/').pop()}`,
                    ),
                  );
                }),
              );
            }

            await this.storageService.renameFile(
              value.path,
              this.storageService.path(
                `files/${resource.name}/${_.get(createdRecord, [...path.slice(1), resource.primaryKey])}/${field.name}.${value.path.split('.').pop()}`,
              ),
            );
          }

          return value;
        },
        true,
      ),

      // update the record in the database
      this.prismaService[resource.name].update({
        ...app.getSelect(),
        where: {
          [resource.primaryKey]: createdRecord[resource.primaryKey],
        },
        data: dataToUpdate1,
      }),
    ]);

    // const prismaClient = new prisma.PrismaClient();
    // app.setPrisma(prismaClient);

    // app.setCache(this.cacheService);

    // app.setPrisma(this.prismaService);

    // const langs = await app.getLanguages();

    // console.log('[x] langs =', langs);

    // TODO: find a better way to post-process the created record
    const appRead = await this.app.getApp(
      resource,
      user,
      {},
      'read',
      updatedRecord,
      'en',
    );

    return appRead.postProcess(updatedRecord);

    const data = rawData;

    // Raw data
    console.log('[x] data=', data);

    // Transformation
    const transformedData = castData(resource, data);

    console.log('[x] transformedData=', transformedData);

    // Validation
    // const validationResult = validateData(resource, transformedData);

    // if (!validationResult.success) {
    //   throw new BadRequestException(validationResult);
    // }

    // console.log('[x] validationResult=', validationResult);

    const [dataWithUploadedFiles, result] = await Promise.all([
      // Upload files to a temporary folder
      this.preUploadFiles(resource, transformedData),

      // Create the record to obtain the id
      this.prismaService[resource.name].create({
        data: traverse(transformedData, resource, (key, value, field) =>
          field.type === FIELD_TYPE.FILE ? undefined : value,
        ),
      }),
    ]);

    // const dataWithUploadedFiles = await this.preUploadFiles(
    //   model,
    //   transformedData,
    // );

    console.log(
      '[x] ',
      performance.now(),
      'dataWithUploadedFiles=',
      dataWithUploadedFiles,
      'result=',
      result,
    );

    const movedData = await this.moveFiles(resource, {
      ...dataWithUploadedFiles,
      id: result.id,
    });

    // const res = await this.prismaService[model.name.toLowerCase()].create({
    // data: result,
    // });

    const row = await this.prismaService[resource.name].update({
      where: {
        id: result.id,
      },
      data: this.getEpta(resource, {
        ...dataWithUploadedFiles,
        id: result.id,
      }),
    });

    console.log('[x] movedData=', movedData);
    // console.log(
    //   '[x] result=',
    //   this.getEpta(model, {
    //     ...dataWithUploadedFiles,
    //     id: result.id,
    //   }),
    // );

    // console.log('[x] dataWithUploadedFiles=', dataWithUploadedFiles);

    // Creation
    // const result = await this.prismaService[model.name.toLowerCase()].create({
    //   data: transformedData,
    // });

    // console.log('[x] result=', result);

    // return result;
    return row;
  }

  /**
   * Steps:
   *   1. splitData
   *   2. clean: apply permissions, remove non-existent fields
   *   3. cast
   *   4. validate
   *   5. get filter
   *   6. merge data back
   *   7. generate file names
   *   8. merge data back
   *   9. upload files / update database
   *
   * TODO: handle ownable resources
   */
  async update(
    user: User,
    resource: Resource,
    identificationFilter: QueryFilter,
    rawData: any,
    id: string | number,
  ) {
    // const app = new App(schema, resource, user, {}, 'update', rawData);
    const app = await this.app.getApp(
      resource,
      user,
      {},
      'update',
      rawData,
      'en',
    );

    // app.setLanguage('en');

    console.log('[x] data=', rawData);

    // 1. split input data into languages

    const splittedData = app.splitData(rawData);

    console.log('[x] splittedData=', splittedData);

    // 2. clean data: apply permissions, remove non-existent fields

    const cleanedData = Tree.map(splittedData, (key, value) =>
      app.cleanData(value),
    );

    if (Object.keys(cleanedData).length === 0) {
      throw new BadRequestException();
    }

    console.log('[x] cleanedData=', cleanedData);

    // 3. cast data: cast data to the correct type

    const castedData = Tree.map(cleanedData, (key, value) =>
      app.castData(value),
    );

    console.log('[x] castedData=', castedData);

    // 4. validate data

    const validationResult = Tree.map(castedData, (key, value) =>
      app.validateData(value),
    );

    if (
      Object.values(validationResult).some((result: any) => !result.success)
    ) {
      throw new BadRequestException(Object.values(validationResult));
    }

    // 5. get filter

    const prismaFilter = app.getFilter();

    console.log('[x] prismaFilter=', prismaFilter);

    const filter = {
      AND: [identificationFilter, prismaFilter].filter(Boolean),
    };

    console.log('[x] filter=', filter);

    if (resource.hasMultipleIdentifiableFields) {
      console.log('[x] NOT IMPLEMENTED YET');
    } else {
      // 6. merge data back
      const mergedData = app.mergeData(castedData);

      mergedData[resource.primaryKey] = id;

      console.log('[x] mergedData= ', JSON.stringify(mergedData, null, 2));

      // 7. generate file names
      // TODO: Support translatable file fields

      const res = traverse(
        castedData[Object.keys(castedData)[0]],
        resource,
        (key, value, field) => {
          if (field.type === FIELD_TYPE.FILE) {
            let files = value;

            if (!field.iterable) {
              files = [value];
            }

            files = files.map((file: any) => {
              if (file.mimetype === 'application/file-reference') {
                return file;
              }

              const path = this.storageService.path(
                'files/' +
                  resource.name +
                  '/' +
                  id +
                  '/' +
                  key +
                  (field.iterable
                    ? '/' + this.storageService.getRandomKey()
                    : '') +
                  '.' +
                  value.originalname.split('.').pop(),
              );

              mergedData[key].path = path;

              return {
                ...file,
                path,
              };
            });

            return field.iterable ? files : files[0];
          }
        },
      );

      // console.log('[x] res= ', res);

      const data = await app.getUpdateData(mergedData);

      console.log('[x] data= ', JSON.stringify(data, null, 2));

      // 7. upload files / update database

      const [, updatedRecord] = await Promise.all([
        await app.asyncTraverse(res, resource, async (key, value) => {
          return await this.storageService.uploadFile(value, value.path);
        }),
        await this.prismaService[resource.name].update({
          where: {
            [resource.primaryKey]: id,
          },
          data,
        }),
      ]);

      // TODO: post-process the updated record
      return updatedRecord;
    }

    // TO BE DONE

    // await this.prismaService.post.update({
    //   where: {
    //     id: 2,
    //   },
    //   data: {
    //     status: 'published',
    //     translations: {
    //       upsert: [
    //         {
    //           where: {
    //             postId_languageId: {
    //               postId: 2,
    //               languageId: 2,
    //             },
    //           },
    //           update: {
    //             title: 'New Post Title RO: test',
    //             content: 'New Post Content RO: test',
    //           },
    //           create: {
    //             title: 'New Post Title RO: test',
    //             content: 'New Post Content RO: test',
    //             languageId: 2,
    //           },
    //         },
    //       ],
    //     },
    //   },
    // });

    // await this.prismaService.comment.update({
    //   where: {
    //     id: 1,
    //   },
    //   data: {
    //     post: {
    //       update: {
    //         status: 'published',
    //         translations: {
    //           upsert: [
    //             {
    //               where: {
    //                 postId_languageId: {
    //                   postId: 1,
    //                   languageId: 1,
    //                 },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       connect: {
    //         id: 1,
    //       },
    //       connectOrCreate: {
    //         where: {
    //           id: 2,
    //         },
    //         create: {
    //           status: 'published',
    //           owner: {
    //             connect: {
    //               id: 1,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // await this.prismaService.comment.update({
    //   where: {
    //     id: 1,
    //   },
    //   data: {
    //     translations: {
    //       create: [
    //         {
    //           languageId: 1,
    //           content: 'New Post Title RO: test',
    //         },
    //       ],
    //     },
    //     post: {
    //       create: {
    //         status: 'published',
    //         translations: {
    //           create: [
    //             {
    //               languageId: 1,
    //               title: 'New Post Title RO: test',
    //             },
    //           ],
    //         },
    //         owner: {
    //           connect: {
    //             id: 1,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // await this.prismaService.post.update({
    //   where: {
    //     id: 2,
    //   },
    //   data: {
    //     status: 'published',
    //     translations: {
    //       upsert: {
    //         where: {
    //           postId_languageId: {
    //             postId: 2,
    //             languageId: 2,
    //           },
    //         },
    //         update: {
    //           title: 'New Post Title RO: test',
    //           content: 'New Post Content RO: test',
    //         },
    //         create: {
    //           title: 'New Post Title RO: test',
    //           content: 'New Post Content RO: test',
    //           languageId: 2,
    //         },
    //       },
    //     },
    //   },
    // });

    return {};
  }

  private async preUploadFiles(model: Resource, data: any) {
    return resolveNestedPromises(
      traverse(data, model, (key, value, field, model) => {
        if (field.type !== FIELD_TYPE.FILE) return value;

        const upload = async (file: Express.Multer.File) => {
          const extension = file.originalname.split('.').pop();
          const filepath = `tmp/${model.name}/${key}/${this.storageService.getRandomKey()}.${extension}`;

          return await this.storageService.uploadFile(file, filepath);
        };

        if (field.iterable) {
          return value.map(upload);
        }

        return upload(value);
      }),
    );
  }

  private async moveFiles(model: Resource, data: any) {
    return resolveNestedPromises(
      traverse(data, model, (key, value, field, model) => {
        if (field.type !== FIELD_TYPE.FILE) return value;

        const move = async (file: any) => {
          const filepath = `files/${model.name}/${data.id}/${key}/${file.path.split('/').pop()}`;
          await this.storageService.renameFile(
            file.path.split('/').slice(1).join('/'),
            filepath,
          );

          return { ...file, path: filepath };
        };

        if (field.iterable) {
          return value.map(move);
        }

        return move(value);
      }),
    );
  }

  private getEpta(model: Resource, data: any) {
    return traverse(data, model, (key, value, field, model) => {
      if (field.type !== FIELD_TYPE.FILE) return;

      return value.map((file: any) => ({
        ...file,
        path: `files/${model.name}/${data.id}/${key}/${file.path.split('/').pop()}`,
      }));
    });
  }
}

async function resolveNestedPromises(obj: any) {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(resolveNestedPromises)); // Resolve arrays in parallel
  } else if (obj instanceof Promise) {
    return obj; // Await promises directly
  } else if (obj && typeof obj === 'object') {
    const entries = await Promise.all(
      Object.entries(obj).map(async ([key, value]) => [
        key,
        await resolveNestedPromises(value),
      ]),
    );
    return Object.fromEntries(entries);
  } else {
    return obj; // Return primitive values directly
  }
}

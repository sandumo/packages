import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Resource, Query, schema } from './schema';
import {
  castData,
  castFilter,
  cleanData,
  transformToPrismaFilter,
  traverse,
  validateData,
} from 'engine/utils';
import { FIELD_TYPE, Language, QueryFilter, User } from '../engine/types';
import { StorageService } from '@sandumo/nestjs-storage-module';
import { combinePermissions } from 'engine/rules';
import { App } from 'engine';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getMany(user: User, resource: Resource, query: Query) {
    const language = (await this.prismaService.language.findFirst({
      where: {
        locale: 'ru',
      },
      include: {
        fallback: {
          include: {
            fallback: true,
          },
        },
      },
    })) as unknown as Language;

    const app = new App(schema, resource, user, language, query, 'list', null);

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

    // {
    //     id: true,
    //     status: true,
    //     translations: {
    //         title: true,
    //         content: true,
    //     }
    // }

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
    const language = (await this.prismaService.language.findFirst({
      where: {
        locale: 'en',
      },
      include: {
        fallback: {
          include: {
            fallback: true,
          },
        },
      },
    })) as unknown as Language;

    const app = new App(schema, resource, user, language, query, 'read', null);

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
    const result = await this.prismaService[
      resource.naming.camelCase
    ].findFirst({
      ...prismaSelect,
      where: filter,
    });

    return app.postProcess(result);
  }

  async handleCreate(model: Resource, data: any) {
    // Raw data
    console.log('[x] data=', data);

    // Transformation
    const transformedData = castData(model, data);

    console.log('[x] transformedData=', transformedData);

    // Validation
    const validationResult = validateData(model, transformedData);

    if (!validationResult.success) {
      throw new BadRequestException(validationResult);
    }

    console.log('[x] validationResult=', validationResult);

    const [dataWithUploadedFiles, result] = await Promise.all([
      // Upload files to a temporary folder
      this.preUploadFiles(model, transformedData),

      // Create the record to obtain the id
      this.prismaService[model.name.toLowerCase()].create({
        data: traverse(transformedData, model, (key, value, field) =>
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

    const movedData = await this.moveFiles(model, {
      ...dataWithUploadedFiles,
      id: result.id,
    });

    // const res = await this.prismaService[model.name.toLowerCase()].create({
    // data: result,
    // });

    const row = await this.prismaService[model.name.toLowerCase()].update({
      where: {
        id: result.id,
      },
      data: this.getEpta(model, {
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

  async update(
    user: User,
    resource: Resource,
    identificationFilter: QueryFilter,
    data: any,
  ) {
    const language = (await this.prismaService.language.findFirst({
      where: {
        locale: 'ru',
      },
      include: {
        fallback: {
          include: {
            fallback: true,
          },
        },
      },
    })) as unknown as Language;

    const app = new App(schema, resource, user, language, {}, 'update', data);

    app.do();

    await this.prismaService.post.update({
      where: {
        id: 2,
      },
      data: {
        status: 'published',
        translations: {
          upsert: {
            where: {
              postId_languageId: {
                postId: 2,
                languageId: 2,
              },
            },
            update: {
              title: 'New Post Title RO: test',
              content: 'New Post Content RO: test',
            },
            create: {
              title: 'New Post Title RO: test',
              content: 'New Post Content RO: test',
              languageId: 2,
            },
          },
        },
      },
    });

    // Raw data
    console.log('[x] data=', data);

    const include = app.getIncludeFromData(data);

    console.log('[x] include=', include);

    const cleanedData = cleanData(resource, data, user.permissions);

    console.log('[x] cleanedData=', cleanedData);

    if (Object.keys(cleanedData).length === 0) {
      throw new BadRequestException();
    }

    // return {};

    // Transformation
    const transformedData = castData(resource, data);

    console.log('[x] transformedData=', transformedData);

    // Validation
    const validationResult = validateData(resource, transformedData, true);

    console.log('[x] validationResult=', validationResult);

    return {};

    if (!validationResult.success) {
      throw new BadRequestException(validationResult);
    }

    const [, permissionFilter] = combinePermissions(
      user.permissions,
      resource,
      'write',
    );

    const filter: QueryFilter = {
      and: [identificationFilter, permissionFilter].filter(
        Boolean,
      ) as QueryFilter[],
    };

    // console.log('[x] validationResult=', validationResult);
    console.log('[x] filter=', filter);

    // return {};

    const [dataWithUploadedFiles, result] = await Promise.all([
      // Upload files to a temporary folder
      this.preUploadFiles(resource, transformedData),

      // Create the record to obtain the id
      this.prismaService[resource.naming.camelCase].updateMany({
        where: transformToPrismaFilter(castFilter(filter, resource)),
        data: traverse(transformedData, resource, (key, value, field) =>
          field.type === FIELD_TYPE.FILE ? undefined : value,
        ),
      }),
    ]);

    // const dataWithUploadedFiles = await this.preUploadFiles(
    //   model,
    //   transformedData,
    // );

    // console.log(
    //   '[x] ',
    //   performance.now(),
    //   'dataWithUploadedFiles=',
    //   dataWithUploadedFiles,
    //   'result=',
    //   result,
    // );

    const movedData = await this.moveFiles(resource, {
      ...dataWithUploadedFiles,
      id: result.id,
    });

    // const res = await this.prismaService[model.name.toLowerCase()].create({
    // data: result,
    // });

    const row = await this.prismaService[resource.naming.camelCase].updateMany({
      where: transformToPrismaFilter(castFilter(filter, resource)),
      data: this.getEpta(resource, {
        ...dataWithUploadedFiles,
        id: result.id,
      }),
    });

    console.log('[x] movedData=', movedData);
    // console.log('[x] resource=', resource);

    return row;
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

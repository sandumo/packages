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
import { combinePermissions, getPrismaMask } from 'engine/rules';
import { Shit } from 'engine/shit';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getManyTest(user: User, resource: Resource, query: Query) {
    const language = await this.prismaService.language.findFirst({
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
    });

    // console.log('[x] languages=', language);

    const shit = new Shit(
      schema,
      user.permissions,
      language as unknown as Language,
    );

    const r = shit.doTheShit(resource, query.include);

    console.log('[x] r=', r);

    // doTheShit(resource, query.include, user.permissions);

    const result = await this.prismaService.post.findMany({
      ...r,
      // select: {
      //   comments: true,
      // },
      // select: {
      //   id: true,
      //   comments: {
      //     select: {
      //       id: true,
      //       translations: true,
      //     },
      //   },
      //   translations: {
      //     select: {
      //       title: true,
      //       // content: true,
      //     },
      //     where: {
      //       OR: [
      //         { languageId: language.id },
      //         ...(language.fallback
      //           ? [
      //               { languageId: language.fallback.id },
      //               ...(language.fallback.fallback
      //                 ? [{ languageId: language.fallback.fallback.id }]
      //                 : []),
      //             ]
      //           : []),
      //       ],
      //     },
      //   },
      // },
      // where: prismaFilter,
      // take: query.pageSize || 10,
      // skip: ((query.page || 1) - 1) * (query.pageSize || 10),
    });

    console.log('[x] result=', result[0]);
    const processed = shit.postprocess(resource, result[0]);

    return processed;
  }

  async getMany(user: User, resource: Resource, query: Query) {
    const [attributes, permissionFilter] = combinePermissions(
      user.permissions,
      resource,
      'read',
    );

    const filter: QueryFilter = {
      and: [query.filter, permissionFilter].filter(Boolean) as QueryFilter[],
    };

    const castedFilter = castFilter(filter, resource);

    const prismaFilter = transformToPrismaFilter(castedFilter);

    if (attributes.length === 0) {
      throw new ForbiddenException();
    }

    const [result, total] = await Promise.all([
      await this.prismaService[resource.naming.camelCase].findMany({
        ...(attributes[0] !== '*' && {
          select: attributes.reduce(
            (acc, field) => {
              acc[field] = true;
              return acc;
            },
            {} as Record<string, boolean>,
          ),
        }),
        where: prismaFilter,
        take: query.pageSize || 10,
        skip: ((query.page || 1) - 1) * (query.pageSize || 10),
      }),
      await this.prismaService[resource.name.toLowerCase()].count({
        where: prismaFilter,
      }),
    ]);

    return {
      data: result,
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
  ) {
    // Get the attributes allowed by the permissions
    const attributes = getPrismaMask(resource, user.permissions);

    // If no attribute is allowed then the user doesn't have permission to this resource
    if (attributes.length === 0) {
      throw new ForbiddenException();
    }

    // Get the filter produced by the conditions from the permissions
    const [, permissionFilter] = combinePermissions(
      user.permissions,
      resource,
      'read',
    );

    // Combine the identification filter and the permission filter
    const filter: QueryFilter = {
      and: [identificationFilter, permissionFilter].filter(
        Boolean,
      ) as QueryFilter[],
    };

    // Run the query
    return await this.prismaService[resource.naming.camelCase].findFirst({
      ...(attributes[0] !== '*' && {
        select: attributes.reduce(
          (acc, field) => {
            acc[field] = true;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
      }),
      where: transformToPrismaFilter(castFilter(filter, resource)),
    });
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
    // Raw data
    console.log('[x] data=', data);

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

    // return {};

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

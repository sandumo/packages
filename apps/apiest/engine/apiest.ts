import { PrismaClient } from '@prisma/client';
import { CacheService } from '@sandumo/nestjs-cache-module';
import { StorageService } from '@sandumo/nestjs-storage-module';
import { App } from 'engine';
import { Query, Resource, Schema } from 'src/schema';
import { BaseAction } from './permissions';
import { Field, User } from './types';
import { asyncMapParallel } from './utils';

export class Apiest {
  private schema: Schema;
  private prisma: PrismaClient;
  private cache: CacheService;
  private storage: StorageService;

  constructor(
    schema: Schema,
    prisma: PrismaClient,
    cache: CacheService,
    storage: StorageService,
  ) {
    this.schema = schema;
    this.prisma = prisma;
    this.cache = cache;
    this.storage = storage;
  }

  async getApp(
    resource: Resource,
    user: User,
    query: Query,
    action: BaseAction,
    data: any,
    languageLocale: string,
  ) {
    const app = new App(this.schema, resource, user, query, action, data);

    app.setPrisma(this.prisma);
    app.setCache(this.cache);
    // app.setStorage(this.storage);

    await app.setLanguage(languageLocale);

    return app;
  }

  async asyncTraverse(
    data: any,
    resource: Resource,
    callback: (
      key: string,
      value: any,
      field: Field,
      resource: Resource,
      schema: Schema,
      path: string[],
      locale: string,
    ) => Promise<any> | any,
    recursive: boolean = false,
    path: string[] = [resource.name],
    locale: string = undefined,
  ): Promise<any> {
    return Object.fromEntries(
      (
        await asyncMapParallel(Object.entries(data), async ([key, value]) => {
          if (key === 'translations') {
            const result = Object.fromEntries(
              (
                await asyncMapParallel(
                  Object.entries(value),
                  async ([locale, data]) => [
                    locale,
                    await this.asyncTraverse(
                      data,
                      resource,
                      callback,
                      recursive,
                      path,
                      locale,
                    ),
                  ],
                )
              ).filter(([, value]) => value !== undefined),
            );

            return [key, result];
          } else if (resource.fields[key]) {
            if (recursive && resource.fields[key].ref) {
              return [
                key,
                await this.asyncTraverse(
                  value,
                  this.schema.resources[resource.fields[key].ref.resource],
                  callback,
                  recursive,
                  [...path, key],
                  locale,
                ),
              ];
            }

            return [
              key,
              await callback(
                key,
                value,
                resource.fields[key],
                resource,
                this.schema,
                path,
                locale,
              ),
            ];
          }

          return [key, undefined];
        })
      ).filter(([, value]) => value !== undefined),
    );
  }
}

import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { schema, router } from './schema';
import { getIdentificationFilter } from 'engine/utils';
import { User } from 'engine/types';
import { filterPermissions, parsePermission } from 'engine/rules';
import { PermissionParser } from 'engine/permissions';

const user: User = {
  id: 1,
  email: 'test@test.com',
  phone: '1234567890',
  password: 'password',
  permissions: [
    // 'read.post.*.status(sent_to_moderation)',

    // 'read.post.status.[$identifiable(hash),$identifiable(id)]',
    // 'read.product.*.active(true)',
    // 'write.post.[status].$identifiable(id)',
    // 'write.post.status.status(sent_to_moderation)',
    // '*.post.![status,moderated].status(sent_to_moderation)',
    // 'owner.read.post',
    // '*.read.post.*.$identifiable(hash)',
    'read.language.!direction.locale(en)',

    // TODO: explore this
    // IDEA: read.post.[author.displayName] -> this will give access to user.displayName but only when included in the post.
    // read.post.[author.*]
    // read.post.[author.role.*]

    'read.post.!content',
    'read.comment',
    'read.user.[displayName]',
  ].map(parsePermission),
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('**')
  async list(@Param() path: string[], @Query() query: any) {
    const parts = path[0].split('/').filter(Boolean);

    const resourceKey = parts[0];

    if (!router[resourceKey]) {
      throw new NotFoundException();
    }

    // const permission = parsePermission2('read.post.[author.displayName]');

    // console.log(
    //   '[x] permission=',
    //   (parser.parse()?.resource[0] as any).children,
    // );

    // console.log('[x] query=', query);
    // return {};

    const resource = schema.resources[router[resourceKey]];

    const permissions = [
      // 'read.post.[title,content,author.[displayName]]',
      // 'read.post.[title,content,author.[id]]',
      // 'read.post.[comments]',
      // 'read.role',
      // 'read.comment',

      'read.post.[author.[id,displayName,role],comments]',
      // 'read.post.[author.[displayName]]',
      // 'read.post.[author.[role]]',
      // 'read.post.[author.[id,email]]',
      // 'read.post.[comments]',
      // 'create.post',
      // 'read.role.[name]',
    ];

    const include = ['author.role', 'comments'];

    const parser = new PermissionParser(schema, permissions);

    console.log('[x] permission=', parser.tree('read', resource, include));

    return {};

    // reject if more than 2 parts
    if (parts.length > 2) {
      throw new BadRequestException();
    }

    // handle findOne
    if (parts.length > 1) {
      const identificationFilter = getIdentificationFilter(
        resource,
        parts[1],
        filterPermissions(user.permissions, 'read', resource),
      );

      if (!identificationFilter) {
        throw new BadRequestException();
      }

      const result = await this.appService.getOne(
        user,
        resource,
        identificationFilter,
      );

      if (!result) {
        throw new NotFoundException();
      }

      return result;
    }

    return await this.appService.getManyTest(user, resource, query);
  }

  @Post('**')
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Param() path: string[],
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const parts = path[0].split('/').filter(Boolean);

    const resourceKey = parts[0];

    if (!router[resourceKey]) {
      throw new NotFoundException();
    }

    const resource = schema.resources[router[resourceKey]];

    // reject if more than 2 parts
    if (parts.length > 1) {
      throw new BadRequestException();
    }

    const fss: Record<string, Express.Multer.File[]> = {};

    files?.forEach((file) => {
      if (!fss[file.fieldname]) {
        fss[file.fieldname] = [];
      }

      fss[file.fieldname].push(file);
    });

    return await this.appService.handleCreate(resource, {
      ...req.body,
      ...fss,
    });
  }

  @Patch('**')
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param() path: string[],
    @Req() req: Request,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const parts = path[0].split('/').filter(Boolean);

    const resourceKey = parts[0];

    // reject if not identificator specified
    if (parts.length < 2) {
      throw new BadRequestException();
    }

    // reject if more than 2 parts
    if (parts.length > 2) {
      throw new BadRequestException();
    }

    // reject if resource not found
    if (!router[resourceKey]) {
      throw new NotFoundException();
    }

    const resource = schema.resources[router[resourceKey]];

    // handle findOne
    const identificationFilter = getIdentificationFilter(
      resource,
      parts[1],
      filterPermissions(user.permissions, 'write', resource),
    );

    // console.log('[x] identificationFilter=', identificationFilter);

    // return {};

    if (!identificationFilter) {
      throw new BadRequestException();
    }

    // return {};

    const fss: Record<string, Express.Multer.File[]> = {};

    files?.forEach((file) => {
      if (!fss[file.fieldname]) {
        fss[file.fieldname] = [];
      }

      fss[file.fieldname].push(file);
    });

    // return await this.appService.handleCreate(resource, {
    //   ...req.body,
    //   ...fss,
    // });

    const result = await this.appService.update(
      user,
      resource,
      identificationFilter,
      {
        ...req.body,
        ...fss,
      },
    );

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}

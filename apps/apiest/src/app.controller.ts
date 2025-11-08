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
// import { getIdentificationFilter } from 'engine/utils';
import { User } from 'engine/types';
import { parsePermission } from 'engine/rules';
import * as _ from 'lodash';
import { Tree } from 'engine/tree';
// import { PermissionParser } from 'engine/permissions';

const permissions = [
  // 'read.post.*.status(sent_to_moderation)',

  // 'read.post.status.[$identifiable(hash),$identifiable(id)]',
  // 'read.product.*.active(true)',
  // 'write.post.[status].$identifiable(id)',
  // 'write.post.status.status(sent_to_moderation)',
  // '*.post.![status,moderated].status(sent_to_moderation)',
  // 'owner.read.post',
  // '*.read.post.*.$identifiable(hash)',
  // 'read.language.!direction.locale(en)',

  // TODO: explore this
  // IDEA: read.post.[author.displayName] -> this will give access to user.displayName but only when included in the post.
  // read.post.[author.*]
  // read.post.[author.role.*]

  // 'read.post.!content',

  // 'read.comment',
  // 'read.user.[displayName]',

  // owner
  // 'read.post.[*,author.[*,role],comments]',
  // 'write.post.*',

  // moderator
  // 'read.post.[id,title,content,author.[id,displayName],comments.[id,content]]:status(published)',
  'list.post.[id,title,content,status,author.[id,email]]:status(published)',
  'list.post.[id,title,content,status]:status(published)',
  'list.post.[id,status]:status(draft)',
  // 'read.product',
  // 'list.product',
  'read.post.[*,author.[id,displayName]]',
  'read.post.[author.[id,displayName],comments.[id,content]]',
  'read.comment',

  'update.post.[id,title,author.[id,displayName]]',
  // 'update.post.[]',

  'create.comment.[*,post.[title,status,moderated,pictures]]',
  'update.comment.[*,post.[title,status,moderated]]',

  // anyone
  // 'list.post.[id,title,content,author.[id,displayName],comments.[id,content]]:status(published)',

  // 'read.post.[title,content,author.[displayName,role.[name]],comments.content,owner.[id,email]]',
];

const user: User = {
  id: 1,
  email: 'test@test.com',
  phone: '1234567890',
  password: 'password',
  _permissions: permissions,
  permissions: permissions.map(parsePermission),
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

    const resource = schema.resources[router[resourceKey]];

    // reject if more than 2 parts
    if (parts.length > 2) {
      throw new BadRequestException();
    }

    // handle findOne
    if (parts.length > 1) {
      // const identificationFilter = getIdentificationFilter(
      //   resource,
      //   parts[1],
      //   filterPermissions(user.permissions, 'read', resource),
      // );

      // if (!identificationFilter) {
      //   throw new BadRequestException();
      // }

      const result = await this.appService.getOne(
        user,
        resource,
        { id: parseInt(parts[1]) } as any,
        query,
      );

      if (!result) {
        throw new NotFoundException();
      }

      return result;
    }

    return await this.appService.getMany(user, resource, query);
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

    const processedFiles = processFiles(files);

    return await this.appService.create(
      user,
      resource,
      Tree.merge(req.body as any, processedFiles),
    );
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
    // const identificationFilter = getIdentificationFilter(
    //   resource,
    //   parts[1],
    //   filterPermissions(user.permissions, 'write', resource),
    // );

    // console.log('[x] identificationFilter=', identificationFilter);

    // return {};

    // if (!identificationFilter) {
    //   throw new BadRequestException();
    // }

    // return {};

    const fss: Record<string, Express.Multer.File[]> = {};

    files?.forEach((file) => {
      if (!fss[file.fieldname]) {
        fss[file.fieldname] = [];
      }

      fss[file.fieldname].push(file);
    });

    const processedFiles = processFiles(files);

    // console.log('[x] processedFiles=', processedFiles.test.picture);

    // return await this.appService.handleCreate(resource, {
    //   ...req.body,
    //   ...fss,
    // });

    // console.log('[x] fss=', fss);

    const result = await this.appService.update(
      user,
      resource,
      { id: parseInt(parts[1]) } as any,
      Tree.merge(req.body as any, processedFiles),
      parseInt(parts[1]),
    );

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}

function processFiles(files: Array<Express.Multer.File>) {
  const obj: Record<string, any> = {};

  files?.forEach((file) => {
    _.set(
      obj,
      file.fieldname
        .replace(/(\[|\]\[|\])/g, ' ')
        .trim()
        .split(' '),
      file,
    );
  });

  return obj;
}

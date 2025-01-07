import { Controller, Get, Param, Res } from '@nestjs/common';
import { StorageService } from '@sandumo/nestjs-storage-module';
import { Response } from 'express';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('**')
  async getFile(@Param() path: string[], @Res() res: Response) {
    console.log('[x] path', path);

    (await this.storageService.getStream(path[0]))
      .on('error', () => res.status(404).send())
      .pipe(res);
  }
}

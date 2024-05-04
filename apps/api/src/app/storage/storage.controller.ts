import { Controller, Get, Param, Res } from '@nestjs/common';
import { StorageService } from 'src/shared/services';
import { Response } from 'express';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('**')
  async getFile(@Param() path: string[], @Res() res: Response) {
    (await this.storageService.getStream(path[0]))
      .on('error', () => res.status(404).send())
      .pipe(res);
  }
}

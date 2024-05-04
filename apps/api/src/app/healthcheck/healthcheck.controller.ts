import { Controller, Get } from '@nestjs/common';

@Controller('healthcheck')
export class HealthcheckController {
  @Get()
  get() {
    return { message: 'ok' };
  }
}

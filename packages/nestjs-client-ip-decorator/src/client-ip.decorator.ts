import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();

    const xForwardedFor = request.headers['x-forwarded-for'];
    if (typeof xForwardedFor === 'string') {
      // Return the first IP from the comma-separated list
      return xForwardedFor.split(',')[0].trim();
    }

    const xRealIp = request.headers['x-real-ip'];
    if (typeof xRealIp === 'string') {
      return xRealIp;
    }

    return request.ip;
  },
);

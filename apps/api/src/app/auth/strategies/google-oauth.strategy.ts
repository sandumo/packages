import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from 'src/config';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(
  Strategy,
  'google-oauth',
) {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async validate(req): Promise<any> {
    let payload = null;

    try {
      const response = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${req.body.accessToken}` },
        },
      );

      payload = await response.json();

      return payload;
    } catch (e) {
      console.error('error: ', e);
      throw new UnauthorizedException('Invalid Google IdToken');
    }
  }
}

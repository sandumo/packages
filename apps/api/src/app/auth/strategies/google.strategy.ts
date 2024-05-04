import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from 'src/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async validate(req): Promise<any> {
    let payload = null;

    try {
      // Took from here: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
      const oAuth2Client = new OAuth2Client();

      const ticket = await oAuth2Client.verifyIdToken({
        idToken: req.body.token,
        audience: this.configService.getGoogleClientId(),
      });

      payload = ticket.getPayload(); // Returns the user details from the token

      return payload;
    } catch (e) {
      console.error('error: ', e);
      throw new UnauthorizedException('Invalid Google IdToken');
    }
  }
}

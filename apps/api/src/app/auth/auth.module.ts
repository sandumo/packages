import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from 'src/config';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthService } from './auth.service';
import { SharedModule } from 'src/shared/shared.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { GoogleOAuthStrategy } from './strategies/google-oauth.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    LocalStrategy,
    JwtStrategy,
    GoogleOAuthStrategy,
    AuthService,
  ],
  imports: [
    ConfigModule,
    SharedModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getJWTSecret(),
        signOptions: {
          expiresIn: configService.getJWTExp(),
        },
      }),
    }),
  ],
})
export class AuthModule {}

import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    // @InjectRepository(User)
    // private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: (res) =>
        res.cookies['accessToken'] ||
        res.headers['authorization']?.split(' ')[1] ||
        res.headers['x-access-token']?.split(' ')[1],
      ignoreExpiration: false,
      secretOrKey: configService.getJWTSecret(),
    });
  }

  async validate(payload) {
    // const user = await this.userRepository
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.roles', 'roles')
    //   .leftJoinAndSelect(
    //     'user.organizationMemberships',
    //     'organizationMemberships',
    //   )
    //   .where('user.id = :id', { id: payload.id })
    //   .getOne();
    // if (user) {
    //   return user;
    // }
    // return null;
  }
}

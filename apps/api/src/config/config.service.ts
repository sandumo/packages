import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    this.envConfig = process.env;
  }

  get(key: string): string {
    return this.envConfig[key];
  }

  getPort(): number {
    return +this.get('PORT') || 3000;
  }

  getDBHost(): string {
    return this.get('DB_HOST');
  }

  getDBPort(): number {
    return +this.get('DB_PORT') || 3306;
  }

  getDBUser(): string {
    return this.get('DB_USER');
  }

  getDBPass(): string {
    return this.get('DB_PASS');
  }

  getDBName(): string {
    return this.get('DB_NAME');
  }

  getEnvironment(): string {
    return this.get('NODE_ENV');
  }

  getJWTSecret(): string {
    return this.get('JWT_SECRET');
  }

  getJWTExp(): string {
    return this.get('JWT_EXP');
  }

  getGoogleClientId(): string {
    return this.get('GOOGLE_CLIENT_ID');
  }

  getTypeOrmConfig(): TypeOrmModuleOptions {
    // const ENTITIES_DIR =
    //   this.getEnvironment() === 'production' ? 'dist' : 'src';
    return {
      keepConnectionAlive: true,
      type: 'mysql',
      host: this.getDBHost(),
      port: this.getDBPort(),
      username: this.getDBUser(),
      password: this.getDBPass(),
      database: this.getDBName(),
      // entities: [ENTITIES_DIR + '/**/**.entity{.ts,.js}'],
      entities: ['dist/**/**.entity{.ts,.js}'],
      subscribers: ['dist/**/**.subscriber{.ts,.js}'],
      // entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      logging: false, // !['production', 'test', 'testing'].includes(this.getEnvironment()),
      namingStrategy: new SnakeNamingStrategy(),
      timezone: 'Z',
      retryAttempts: 5,
    };
  }

  getS3AccessKeyId(): string {
    return this.get('S3_ACCESS_KEY_ID');
  }

  getS3SecretAccessKey(): string {
    return this.get('S3_SECRET_ACCESS_KEY');
  }

  getS3Endpoint(): string {
    return this.get('S3_ENDPOINT');
  }

  getS3Bucket(): string {
    return this.get('S3_BUCKET');
  }
  getOpenAIApiKey(): string {
    return this.get('OPENAI_API_KEY');
  }
}

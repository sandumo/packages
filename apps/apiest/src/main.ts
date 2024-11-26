import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { run } from '../apiest/spec';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // run();

  await app.listen(3001);
}
bootstrap();

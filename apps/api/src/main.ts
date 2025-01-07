import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import { OpenAPIClientGenerator } from '@sandumo/openapi-client-generator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  // validates all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,

      // remove unknown properties from the request object
      whitelist: true,

      exceptionFactory: (e) => {
        console.error(e);
        throw new BadRequestException('Bad request (validation error)!');
      },
    }),
  );

  app.enableCors({
    origin: '*',
  });
  app.use(cookieParser());

  if (configService.getEnvironment() !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('JobSpace API Docs')
      .setDescription('JobSpace API Docs description')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // new OpenAPIClientGenerator()
    //   .fromSchema(document)
    //   .toPath(
    //     path.join(__dirname + '../../../../packages/api-client/src/index.ts'),
    //   )
    //   .generate();

    SwaggerModule.setup('api', app, document);
  }

  await app.listen(configService.getPort());
}
bootstrap();

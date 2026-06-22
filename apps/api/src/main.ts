/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as yaml from 'yamljs';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  try {
    const document = yaml.load(
      join(process.cwd(), 'apps', 'api', 'openapi.yaml'),
    );
    SwaggerModule.setup('docs', app, document);
  } catch (error) {
    Logger.warn(
      'Failed to load openapi.yaml. Documentation will not be served.',
      'Bootstrap',
    );
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📖 OpenAPI Documentation is running on: http://localhost:${port}/docs`,
  );
}

bootstrap();

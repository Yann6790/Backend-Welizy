import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const publicPath = join(__dirname, '..', 'public');
  if (existsSync(publicPath)) {
    app.use(express.static(publicPath));
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (!req.path.startsWith('/api') && req.method === 'GET') {
        return res.sendFile(join(publicPath, 'index.html'));
      }
      next();
    });
  }

  await app.listen(process.env.PORT || 8080, '0.0.0.0');
}

bootstrap();

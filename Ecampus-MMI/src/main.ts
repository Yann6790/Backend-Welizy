import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ecampus-mmi.onrender.com',
    'https://ecampus-mmi-sill.onrender.com',
    'https://welizy.fr.yann.allain.mmi-velizy.fr',
    'https://ecampus-mmi.vercel.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (ex: curl, Postman)
      if (!origin) return callback(null, true);
      // Autoriser les origines explicitement listées
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Autoriser toutes les URLs de preview Vercel du projet Welizy
      if (origin.endsWith('-welizy.vercel.app') || origin === 'https://welizy.vercel.app')
        return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
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

  await app.listen(process.env.PORT || 8080, '0.0.0.0');
}

bootstrap();

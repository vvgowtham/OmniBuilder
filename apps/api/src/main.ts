import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`\n  OmniBuilder API running at http://localhost:${port}`);
  console.log(`  Swagger docs at http://localhost:${port}/api/v1\n`);
}

bootstrap().catch((err) => {
  console.error('Failed to start API:', err.message);
  console.log('\nMake sure PostgreSQL is running: docker-compose up -d');
  process.exit(1);
});

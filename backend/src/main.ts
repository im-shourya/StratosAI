import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
  console.log('🚀 [StratosAI] Starting bootstrap...');
  console.log('🔧 [StratosAI] PORT:', process.env.PORT);
  console.log('🔧 [StratosAI] DATABASE_URL set:', !!process.env.DATABASE_URL);
  console.log('🔧 [StratosAI] MONGODB_URI set:', !!process.env.MONGODB_URI);

  try {
    console.log('📦 [StratosAI] Creating NestJS app...');
    const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
      logger: ['error', 'warn', 'log'],
    });
    console.log('✅ [StratosAI] NestJS app created successfully');

    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());

    const port = process.env.PORT ?? 3001;
    await app.listen(port, '0.0.0.0');
    console.log(`✅ [StratosAI] Server listening on port ${port}`);
  } catch (error) {
    console.error('❌ [StratosAI] Fatal startup error:', error);
    process.exit(1);
  }
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow CORS from Next.js (localhost:3000)
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

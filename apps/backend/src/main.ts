import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();

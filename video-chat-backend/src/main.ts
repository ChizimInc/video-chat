import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Permitem CORS pentru frontend
  await app.listen(5000);
  console.log("WebSocket server running on http://localhost:5000");
}
bootstrap();

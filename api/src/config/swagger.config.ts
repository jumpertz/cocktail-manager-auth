import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export default (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('CocktailManager Doc')
    .setDescription('API documentation for CocktailManager')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
};

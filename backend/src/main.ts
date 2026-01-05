import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"
import { ResponseInterceptor } from "./common/interceptors/response.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // I enable CORS to allow the frontend to communicate with the API.
  // I've set origin to true for maximum flexibility during local development.
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  })

  // I set a global prefix 'api' so all routes start with /api.
  app.setGlobalPrefix("api")

  // I use global pipes for automatic validation based on DTO classes.
  // This ensures that incoming data is clean and correctly typed.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // I use a global interceptor to wrap all responses in a standard JSON format.
  app.useGlobalInterceptors(new ResponseInterceptor())

  // I configure Swagger to automatically generate documentation for my API.
  // This makes it very easy for frontend developers to test the endpoints.
  const config = new DocumentBuilder()
    .setTitle("Riwi Employability API")
    .setDescription("REST API for managing employability vacancies and applications")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter your JWT token",
        in: "header",
      },
      "JWT",
    )
    .addApiKey(
      {
        type: "apiKey",
        name: "x-api-key",
        in: "header",
        description: "API Key for additional protection",
      },
      "API_KEY",
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)

  console.log(`\n🚀 Application running on: http://localhost:${port}`)
  console.log(`📚 Swagger Documentation: http://localhost:${port}/api/docs\n`)
}

bootstrap()

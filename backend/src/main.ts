import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"
import { ResponseInterceptor } from "./common/interceptors/response.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })

  // Prefijo global para las rutas
  app.setGlobalPrefix("api")

  // Validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Interceptor global para estandarizar respuestas
  app.useGlobalInterceptors(new ResponseInterceptor())

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle("Riwi Empleabilidad API")
    .setDescription("API REST para gestión de vacantes de empleabilidad y postulaciones")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Ingrese su token JWT",
        in: "header",
      },
      "JWT",
    )
    .addApiKey(
      {
        type: "apiKey",
        name: "x-api-key",
        in: "header",
        description: "API Key para protección adicional",
      },
      "API_KEY",
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)

  console.log(`\n🚀 Aplicación corriendo en: http://localhost:${port}`)
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs\n`)
}

bootstrap()

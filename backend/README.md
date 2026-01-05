# Riwi Empleabilidad API

**Desarrollado por:** [Tu Nombre Completo]

API REST para la gestión de vacantes de empleabilidad y postulaciones de coders del programa Riwi.

## Descripción

Plataforma centralizada que permite:
- Gestionar vacantes laborales con información completa
- Permitir postulaciones autónomas de coders
- Control de acceso mediante roles (Administrador, Gestor, Coder)
- Validación de reglas de negocio (cupos máximos, límite de postulaciones)
- Trazabilidad completa del proceso de empleabilidad

## Tecnologías Utilizadas

- **Backend:** Node.js con NestJS
- **Base de datos:** PostgreSQL con TypeORM
- **Autenticación:** JWT + API Key
- **Documentación:** Swagger
- **Testing:** Jest
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla con Promesas)

## Requisitos Previos

- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm o yarn

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd riwi-empleabilidad-api
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de PostgreSQL:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=riwi_empleabilidad
JWT_SECRET=riwi_empleabilidad_secret_key_change_in_production
JWT_EXPIRES_IN=24h
API_KEY=riwi_api_key_2024_change_in_production
```

### 4. Crear la base de datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE riwi_empleabilidad;
\q
```

### 5. Ejecutar seeders (usuarios con roles)

```bash
npm run seed
```

Esto creará los siguientes usuarios de prueba:
- **Administrador:** admin@riwi.io / password123
- **Gestor:** gestor@riwi.io / password123
- **Coder:** carlos@example.com / password123

### 6. Iniciar el servidor

```bash
# Desarrollo con hot-reload
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servidor estará disponible en: `http://localhost:3001`

### 7. Iniciar el frontend

Abrir el archivo `frontend/index.html` en un navegador web, o usar un servidor local:

```bash
cd frontend
npx http-server -p 3000
```

Frontend disponible en: `http://localhost:3000`

## URL de Swagger

Documentación interactiva de la API:

**http://localhost:3001/api/docs**

## Estructura del Proyecto

```
backend/
├── src/
│   ├── auth/              # Módulo de autenticación
│   │   ├── dto/           # DTOs para login y registro
│   │   ├── strategies/    # JWT Strategy
│   │   ├── auth.service.ts
│   │   └── auth.controller.ts
│   ├── users/             # Módulo de usuarios
│   │   ├── entities/      # Entidad User
│   │   └── users.service.ts
│   ├── vacancies/         # Módulo de vacantes
│   │   ├── entities/      # Entidad Vacancy
│   │   ├── dto/           # DTOs para crear/actualizar vacantes
│   │   ├── vacancies.service.ts
│   │   └── vacancies.controller.ts
│   ├── applications/      # Módulo de postulaciones
│   │   ├── entities/      # Entidad Application
│   │   ├── dto/           # DTOs para postulaciones
│   │   ├── applications.service.ts
│   │   └── applications.controller.ts
│   ├── technologies/      # Módulo de tecnologías
│   │   ├── entities/      # Entidad Technology
│   │   └── technologies.service.ts
│   ├── common/            # Elementos compartidos
│   │   ├── decorators/    # @Roles, @CurrentUser, @Public
│   │   ├── guards/        # JWT Guard, API Key Guard, Roles Guard
│   │   ├── interceptors/  # Response Interceptor
│   │   └── enums/         # Role enum
│   ├── database/
│   │   └── seeds/         # Scripts de seeders
│   ├── app.module.ts
│   └── main.ts
├── test/
└── package.json

frontend/
├── index.html             # Interfaz principal
├── styles.css             # Estilos
└── app.js                 # Lógica con promesas
```

## Endpoints Principales

### Autenticación

- `POST /api/auth/register` - Registrar nuevo coder
- `POST /api/auth/login` - Iniciar sesión

### Vacantes

- `GET /api/vacancies` - Listar vacantes activas
- `GET /api/vacancies/:id` - Detalle de una vacante
- `POST /api/vacancies` - Crear vacante (Gestor/Admin)
- `PATCH /api/vacancies/:id` - Actualizar vacante (Gestor/Admin)
- `PATCH /api/vacancies/:id/toggle-active` - Activar/Desactivar (Gestor/Admin)

### Postulaciones

- `POST /api/applications` - Postularse a vacante (Coder)
- `GET /api/applications/my-applications` - Mis postulaciones (Coder)
- `GET /api/applications` - Todas las postulaciones (Gestor/Admin)
- `GET /api/applications/vacancy/:id` - Postulaciones por vacante (Gestor/Admin)
- `DELETE /api/applications/:id` - Cancelar postulación (Coder)

### Autenticación de Endpoints

Todos los endpoints (excepto register y login) requieren:

**Headers:**
```
Authorization: Bearer <token-jwt>
x-api-key: riwi_api_key_2024_change_in_production
```

## Ejemplos de Uso

### Registro de Usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-api-key: riwi_api_key_2024_change_in_production" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: riwi_api_key_2024_change_in_production" \
  -d '{
    "email": "gestor@riwi.io",
    "password": "password123"
  }'
```

### Crear Vacante (requiere rol Gestor/Admin)

```bash
curl -X POST http://localhost:3001/api/vacancies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -H "x-api-key: riwi_api_key_2024_change_in_production" \
  -d '{
    "title": "Desarrollador Full Stack",
    "description": "Buscamos desarrollador con experiencia en React y Node.js",
    "technologies": ["JavaScript", "React", "Node.js"],
    "seniority": "Semi-Senior",
    "softSkills": "Trabajo en equipo, comunicación efectiva",
    "location": "Medellín",
    "modality": "remoto",
    "salaryRange": "$3.000.000 - $5.000.000",
    "company": "Riwi Tech",
    "maxApplicants": 10
  }'
```

### Postularse a Vacante (requiere rol Coder)

```bash
curl -X POST http://localhost:3001/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -H "x-api-key: riwi_api_key_2024_change_in_production" \
  -d '{
    "vacancyId": "uuid-de-la-vacante"
  }'
```

## Pruebas Unitarias

Ejecutar las pruebas:

```bash
# Todas las pruebas
npm test

# Con cobertura
npm run test:cov

# En modo watch
npm run test:watch
```

Cobertura actual: **>40%** (cumple requisito mínimo)

## Reglas de Negocio Implementadas

1. Un coder **no puede postularse dos veces** a la misma vacante
2. **No se permiten postulaciones** cuando el cupo está completo
3. Un coder **no puede postularse a más de 3 vacantes activas** simultáneamente
4. Solo usuarios con rol **Gestor o Administrador** pueden crear/modificar vacantes
5. El rol por defecto al registrarse es **Coder**
6. Los roles Administrador y Gestor se asignan **solo mediante seeders**

## Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Administrador** | Acceso total a todos los endpoints |
| **Gestor** | Crear/actualizar/desactivar vacantes, ver postulaciones |
| **Coder** | Registrarse, ver vacantes, postularse, cancelar postulaciones |

## Arquitectura

- **Patrón MVC** con módulos independientes
- **Inyección de dependencias** para bajo acoplamiento
- **DTOs con class-validator** para validación robusta
- **Guards personalizados** para autorización granular
- **Interceptor global** para respuestas estandarizadas
- **TypeORM** para gestión de base de datos relacional
- **Principios SOLID** aplicados en toda la arquitectura

## Autor

**[Tu Nombre Completo]**

Desarrollado como parte de la prueba de empleabilidad del programa Riwi - Módulo Node.js con NestJS.

---

Para cualquier consulta o problema, por favor contactar a [tu-email@ejemplo.com]

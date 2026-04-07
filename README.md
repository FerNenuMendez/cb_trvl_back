# Login Robusto Backend

Una API RESTful robusta y escalable construida con **NestJS** y **MongoDB**. Este proyecto está diseñado como una **plantilla genérica (boilerplate)** altamente reutilizable para cualquier proyecto que requiera un sistema de usuarios seguro.

## 🚀 Características Principales

- **Autenticación JWT Segura:** Login tradicional con almacenamiento de tokens en cookies `HttpOnly` para prevenir ataques XSS.
- **Google OAuth 2.0:** Integración con Passport para inicio de sesión rápido mediante cuentas de Google (creación automática de usuario si no existe).
- **Verificación de Email:** Flujo de registro con envío de correo de confirmación mediante `Nodemailer`. Bloqueo de inicio de sesión para cuentas no verificadas y rollback de base de datos en caso de fallos de red.
- **Control de Roles (RBAC):** Sistema de guardias (`RolesGuard`) para proteger rutas según el nivel de acceso del usuario (USER, ADMIN, etc.).
- **Validación de Datos:** Uso de `class-validator` y `class-transformer` (DTOs) para asegurar la integridad de la información entrante.
- **Testing:** Pruebas unitarias integradas con `Jest` para los servicios principales (usuarios, autenticación y envío de correos).
- **Documentación:** Preparado con decoradores para autogenerar documentación con Swagger.

## 🛠️ Stack Tecnológico

- **Framework:** NestJS / TypeScript
- **Base de Datos:** MongoDB con Mongoose
- **Autenticación:** Passport (Local, JWT, Google OAuth20), bcrypt
- **Mailing:** @nestjs-modules/mailer, Nodemailer
- **Testing:** Jest

## ⚙️ Configuración e Instalación

### 1. Clonar el repositorio
```Bash
git clone [https://github.com/FerNenuMendez/cb_trvl_back.git](https://github.com/FerNenuMendez/cb_trvl_back.git)
cd cb_trvl_back
```

### 2. Instalar dependencias
```Bash
npm install
```
### 3. Variables de Entorno
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
MONGO_URI=mongodb://localhost:27017/tu_base_de_datos

# Seguridad JWT
JWT_SECRET=tu_secreto_super_seguro_y_largo

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Mailer (SMTP - Ej: Gmail con App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion_de_16_letras

### 4. Levantar el Servidor
# Desarrollo
```Bash
npm run start:dev
```
# Produccion
```Bash
npm run build
npm run start:prod
```

### 🧪 Testing
Para ejecutar las pruebas unitarias y verificar la integridad de los servicios de usuarios y autenticación:
```Bash
npm run test
```

### 📍 Endpoints Principales (Auth)
Método	Ruta	 Descripción

POST	/auth/register	Crea un nuevo usuario y envía un mail de verificación con token único.
GET	/auth/verify/:token	Valida el token del email y activa la cuenta del usuario (isVerified: true).
POST	/auth/login	Valida credenciales, comprueba estado de verificación y retorna cookie JWT.
GET	/auth/google	Redirige al flujo de autenticación de Google.
GET	/auth/google/callback	Callback de Google, registra o loguea al usuario y retorna cookie JWT.
POST	/auth/logout	Limpia la cookie del token de acceso cerrando la sesión.

### 👨‍💻 Autor
Desarrollado por Fernando Mendez para ⚡Codeblitz⚡ como base sólida para sistemas de autenticación en arquitecturas backend modernas.

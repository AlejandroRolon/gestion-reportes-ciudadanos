# Sistema de Gestión de Reportes Ciudadanos

Aplicación web para que ciudadanos registren incidencias y administradores las gestionen.

**Stack:** Spring Boot 4 · Java 17 · Next.js 16 · TypeScript · MySQL 8+

## Funcionalidades

- **Ciudadano:** se registra, inicia sesión, crea reportes, ve solo los suyos y los comenta.
- **Administrador:** ve todos los reportes, los filtra por estado, categoría y prioridad, los busca por título o descripción, cambia estado y prioridad, comenta y exporta cada reporte en PDF.

## Requisitos

- JDK 17 (no basta con instalar solo el JRE).
- Node.js 20.9 o superior y npm.
- MySQL Server 8 o superior, iniciado y escuchando en el puerto configurado.
- Un usuario MySQL con permiso para crear la base de datos, o la base creada previamente.

Maven no necesita instalación: el backend incluye Maven Wrapper.

> **Nota sobre la terminal:** los comandos de este README se muestran para **Git Bash / macOS / Linux** y para **PowerShell**. Si usas otra terminal (por ejemplo CMD), los comandos pueden cambiar: la sintaxis para copiar archivos, la ruta del wrapper de Maven (`mvnw` o `mvnw.cmd`) y otros detalles dependen de la consola.

## Backend

Desde la raíz del proyecto, entra a la carpeta `demo` y crea el archivo de configuración:

**Git Bash / macOS / Linux**

```bash
cd demo
cp .env.example .env
```

**PowerShell**

```powershell
Set-Location .\demo
Copy-Item .env.example .env
```

Edita `demo/.env` y ajusta `DB_USERNAME` y `DB_PASSWORD` a las credenciales de tu MySQL. La configuración de ejemplo usa el puerto `3306`; cambia el puerto en `DB_URL` si tu servidor usa otro.

Inicia Spring Boot:

**Git Bash / macOS / Linux**

```bash
./mvnw spring-boot:run
```

**PowerShell**

```powershell
.\mvnw.cmd spring-boot:run
```

La URL incluye `createDatabaseIfNotExist=true` y Hibernate crea o actualiza las tablas al iniciar. La base de datos se llama `gestion_reportes_ciudadanos`. La API queda disponible en `http://localhost:8080`.

## Frontend

Abre **otra terminal**, desde la raíz del proyecto:

**Git Bash / macOS / Linux / PowerShell**

```bash
cd frontend
npm ci
npm run dev
```

Si PowerShell bloquea los scripts de npm, usa `npm.cmd ci` y `npm.cmd run dev`.

La aplicación estará en `http://localhost:3000` y se conecta por defecto a la API de `http://localhost:8080`; no hace falta crear un `.env.local` para la configuración local. Si la API está en otra dirección, configura `NEXT_PUBLIC_API_URL` en `frontend/.env.local` y reinicia Next.js.

## Cuenta inicial

El backend crea esta cuenta si todavía no existe:

- Email: `admin@reporte.com`
- Contraseña: `Admin123*`

El registro desde la aplicación crea únicamente usuarios con rol ciudadano.

## Decisiones y limitaciones

- La autenticación usa HTTP Basic para mantener sencilla esta prueba técnica. Para producción se recomienda migrar a sesiones seguras o tokens de corta duración, usar HTTPS y no conservar contraseñas en el almacenamiento del navegador.
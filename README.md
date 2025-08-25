# Flux Commerce

Flux Commerce es una plataforma SaaS que permite a emprendedores y negocios crear su propia tienda en línea fácilmente. Provee herramientas para la gestión de productos, inventario, órdenes y pagos. El propietario de la plataforma administra suscripciones y el funcionamiento general del servicio.

## Estructura del proyecto
- `backend/` - API REST construida con .NET y SQL Server
- `frontend/` - Aplicación web construida con React

## Requisitos
- .NET 8 SDK
- Node.js 18+
- SQL Server

## Primeros pasos
1. Clona el repositorio
2. Configura la base de datos en `backend/appsettings.json`
3. Ejecuta el backend:
   ```powershell
   cd backend
   dotnet run
   ```
4. Ejecuta el frontend:
   ```powershell
   cd frontend
   npm install
   npm start
   ```

## Licencia
MIT

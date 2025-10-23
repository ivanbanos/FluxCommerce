# Flux Commerce

Flux Commerce es una plataforma SaaS que permite a emprendedores y negocios crear su propia tienda en línea fácilmente. Provee herramientas para la gestión de productos, inventario, órdenes y pagos. El propietario de la plataforma administra suscripciones y el funcionamiento general del servicio.

## Estructura del proyecto
- `backend/` - API REST construida con .NET y MongoDB
- `frontend/` - Aplicación web construida con React

## Requisitos
- .NET 8 SDK
- Node.js 18+
- MongoDB
- Ollama con modelo llama3.2:3b

## Instalación de Ollama

```bash
# Windows: Descargar desde https://ollama.com/download/windows
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# Instalar modelo
ollama pull llama3.2:3b
ollama serve
```

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

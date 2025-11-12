# Chat (Asistente de Compras) — Documentación técnica

Este documento describe el flujo completo del sub-sistema de Chat/Asistente desde el frontend hasta el backend, los contratos HTTP, los formatos de mensajes esperados, y recomendaciones para extenderlo o depurarlo.

Resumen corto
- Frontend: `frontend/src/pages/ChatPage.js` — interfaz del chat. Envía peticiones a la API y renderiza respuestas.
- Backend: `backend/Controllers/ChatController.cs` — expone el endpoint POST `/api/chat/message` y despacha un comando MediatR (`ProcessChatRequestCommand`).
- Lógica de negocio / IA: `backend/Services/ChatService.cs` (implementación) — procesa la petición, puede llamar a un modelo de lenguaje / motor de búsqueda / base de datos y devolver una respuesta estructurada.

Propósito
- Permitir que usuarios hagan preguntas sobre productos, pidan búsquedas, agreguen ítems al carrito mediante instrucciones en lenguaje natural y obtengan respuestas guiadas (texto o acciones estructuradas).

Archivos relevantes
- frontend/src/pages/ChatPage.js — componente React del chat.
- frontend/src/pages/ChatPage.css — estilos del chat.
- backend/Controllers/ChatController.cs — controlador que recibe peticiones y las manda a MediatR.
- backend/Services/ChatService.cs — (implementación) procesamiento de la petición (puede contener lógica de LLM, búsqueda y formateo de respuesta).
- backend/Application/Commands/ProcessChatRequestCommand.cs — comando (si existe) que contiene los campos Message, UserId, StoreId.
- backend/Application/Handlers/ProcessChatRequestCommandHandler.cs — handler que invoca ChatService y devuelve la respuesta.

Flujo de datos (end-to-end)
1. Usuario escribe un mensaje en la UI (ChatPage).
2. El componente React envía una petición POST a `/api/chat/message` con el body JSON:

```json
{
  "message": "buscame camisetas negras talla M",
  "userId": "user123",
  "storeId": "<store-id-opcional>"
}
```

3. `ChatController.SendMessage` (backend) crea un `ProcessChatRequestCommand` con Message/UserId/StoreId y lo envía a MediatR.
4. El handler recibe el comando y delega a `ChatService` (o directamente ejecuta la lógica):
   - puede normalizar el texto, detectar intención, ejecutar búsquedas en el catálogo (`MongoDbService`), llamar a un proveedor LLM o a otro microservicio, etc.
   - construye una respuesta. Puede ser texto plano o una respuesta estructurada (JSON) con campos que el frontend espera.
5. El handler devuelve la respuesta (string). `ChatController` envuelve la respuesta en `{ Response = ... }` y la devuelve con 200 OK.
6. En el frontend, `ChatPage.js` toma `data.response` y intenta `JSON.parse(data.response)`:
   - Si el parsea correctamente, se trata la respuesta como un objeto de acción (por ejemplo: { Action: 'search_results', Products: [...], Query: '...' }).
   - Si falla el parseo (no es JSON), se trata como mensaje de texto plano.

Contractos y formatos

Request (cliente -> servidor)
- Endpoint: POST /api/chat/message
- Content-Type: application/json
- Body: { message: string, userId?: string, storeId?: string }

Response (servidor -> cliente)
- Success: 200 OK
- Body: { response: string }
  - `response` puede ser:
    - Texto plano: "Hola, puedo ayudarte..."
    - JSON (stringificado) con estructura conocida por el frontend. Ejemplo:

```json
{
  "Action": "search_results",
  "Message": "He encontrado 3 camisetas",
  "Query": "camisetas negras",
  "Products": [ { "Id": "p1", "Name": "Camiseta X", "Price": 9.99, "Description": "..." } ]
}
```

Frontend: manejo de la respuesta
- `ChatPage.js` añade el mensaje de usuario a la lista y llama al endpoint.
- Si el servidor retorna `data.response` parseable (JSON), el frontend interpreta acciones concretas según `Action`:
  - `search_results` — muestra el listado formateado al usuario.
  - `add_to_cart` — el objeto podría contener `ProductId` y `Quantity`; el frontend puede llamar a `addToCart()`.
  - `view_cart` — el frontend formatea el carrito usando `formatCartContents(cart)` y lo muestra.
  - `message` (o default) — mostrar el texto en la conversación.

Respuesta estructurada recomendada (contrato)
- Para facilitar la interoperabilidad, las respuestas estructuradas deben seguir esta forma (JS object):

```js
{
  Action: 'search_results' | 'add_to_cart' | 'view_cart' | 'message',
  Message: 'Texto legible para el usuario',
  Query?: 'cadena de búsqueda',
  Products?: [ { Id, Name, Price, Description, Category, ImageUrl } ],
  ProductId?: 'id',
  Quantity?: number
}
```

Notas importantes sobre el formato
- El backend envía `response` como string. Si se usa un objeto, stringify antes de devolverlo para que el frontend pueda parsearlo.
- El frontend ya intenta `JSON.parse(data.response)` y si falla, cae en modo texto.

Autenticación y autorización
- `ChatController` no tiene el atributo `[Authorize]` (según `ChatController.cs`), por lo que actualmente es accesible públicamente. Si quieres que esté restringido a usuarios autenticados: añade `[Authorize]` al controlador o al método y asegúrate de enviar el token en el header Authorization desde el frontend.

Uso de StoreId
- El `storeId` es enviado por la UI (ChatPage toma `storeId` desde la ruta: `useParams()` y lo envía en la petición). Esto permite que la búsqueda/recomendación se filtre por la tienda seleccionada.

Ejemplo de petición desde PowerShell (dev)

```powershell
$body = @{ message = 'buscar zapatos negros'; userId = 'user123'; storeId = 'STORE123' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5265/api/chat/message -Method Post -Body $body -ContentType 'application/json'
```

Cómo probar localmente (pasos rápidos)
1. Asegúrate de tener la base de datos Mongo corriendo y datos sembrados (el script `backend/scripts/generate_stores.py` puede haber creado tiendas y productos).
2. Inicia el backend:

```powershell
dotnet run --project backend/FluxCommerce.Api.csproj
```

3. Inicia el frontend (dev):

```powershell
npm start --prefix frontend
```

4. Abre el chat en la ruta adecuada. Si el componente está montado en `/chat/:storeId`, visita `http://localhost:3000/chat/STORE123`.

5. Envía mensajes y observa la consola del backend y la salida del frontend para depurar.

Buenas prácticas y recomendaciones

- Respuestas estructuradas: siempre que sea posible devuelve JSON estructurado para que la UI pueda ofrecer acciones (p. ej. botones "Agregar al carrito").
- Seguridad: si quieres que solo usuarios autenticados usen el chat, protege el endpoint con `[Authorize]` y exige el header Authorization.
- Rate limiting / abuse: si el chat llama a un LLM pagado, aplica límites por IP/usuario.
- Sanitización: valida y sanea los inputs antes de usarlos en búsquedas o en prompts.
- Logging/telemetría: registra conversaciones anónimas o eventos de intención (opcional) para mejorar el motor de búsqueda/IA.
- Testing: añade pruebas unitarias para `ProcessChatRequestCommandHandler` con varios casos (búsqueda, add_to_cart, mensaje libre).

Extensiones sugeridas

- Persistencia de conversaciones: crear una colección `Conversations` en Mongo para guardar preguntas/respuestas (userId, storeId, timestamp, payload).
- Menús rápidos: el backend puede devolver sugerencias con botones (p. ej. `QuickActions: [ { label, action, payload } ]`) y el frontend renderizar botones que disparen nuevas acciones.
- NLU more advanced: añadir un pipeline de intent detection (intents, entities) para aumentar precisión en `add_to_cart` y `search_results`.

Errores comunes y soluciones

- `JSON.parse` falla en frontend: asegúrate que `data.response` es un JSON stringificado o la UI quedará en modo texto.
- No se encuentra producto por ID devuelto por la IA: confirmar que los Ids devueltos por la IA coinciden con `Product.Id` en la base de datos.
- Falta `storeId`: si `storeId` está vacío, el backend no podrá filtrar por tienda — decide un comportamiento por defecto (buscar globalmente o devolver un error que pida seleccionar tienda).

Referencias rápidas (rutas / archivos)
- Frontend: `frontend/src/pages/ChatPage.js`, `frontend/src/pages/ChatPage.css`
- Backend API: `backend/Controllers/ChatController.cs` -> POST `/api/chat/message`
- Backend service/handler: `backend/Services/ChatService.cs`, `backend/Application/Handlers/ProcessChatRequestCommandHandler.cs` (implementación concreta)

Preguntas abiertas / supuestos
- Supuesto: el handler/servicio devuelve una cadena en `response` (puede ser texto o JSON string). Si tu implementación actual devuelve un objeto, hay que adaptarla (stringify) o cambiar el frontend.
- Supuesto: `ChatService` realiza llamadas a LLM o a búsquedas — la documentación explica cómo integrarlo, pero la integración concreta depende del servicio externo elegido.

Si quieres, puedo:
- Crear tests unitarios de ejemplo para el handler del chat.
- Implementar persistencia básica de conversaciones en MongoDB (modelo + servicio + handler).
- Añadir soporte de botones/acciones rápidas en el frontend para respuestas estructuradas.

---
Documento generado automáticamente en `docs/CHAT.md` — puedes editarlo para añadir detalles concretos del `ChatService` o del handler si quieres que incluya llamados exactos a la API de LLM o ejemplos reales de prompts.

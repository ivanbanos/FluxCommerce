# GitHub Copilot Repository Instructions

This repository uses **MongoDB** for data storage, **.NET 8 (ASP.NET Core)** for the backend, **React 18** for the frontend, and **Ollama with Llama 3.2** for AI chat functionality.

## 🛠️ Technology Stack

### Backend (.NET 8)

- **Framework**: ASP.NET Core 8.0
- **Architecture**: Clean Architecture with CQRS (MediatR)
- **Database**: MongoDB with custom service wrapper
- **AI Integration**: Semantic Kernel + Ollama (Llama 3.2 model)
- **Authentication**: JWT Bearer tokens

### Frontend (React 18)

- **Framework**: React 18 with functional components
- **Routing**: react-router-dom
- **State Management**: React Context (CartContext)
- **Styling**: CSS modules/regular CSS
- **API Communication**: Fetch API with proxy setup

### AI & External Services

- **AI Model**: Ollama running Llama 3.2 (local/free alternative to OpenAI)
- **AI Framework**: Microsoft Semantic Kernel
- **Language**: Spanish responses for customer assistance
- **Features**: Product search, cart management, anti-hallucination

## Instalación de Ollama

```bash
# Windows: Descargar desde https://ollama.com/download/windows
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# Instalar modelo
ollama pull llama3.2:3b
ollama serve
```

## Backend Architecture

- Follows the **CQRS pattern** using **MediatR**: all business logic is implemented in Commands (for writes) and Queries (for reads), which are called from Controllers.
- Data access is handled via a custom service (`MongoDbService`) that wraps MongoDB operations.
- All API endpoints are defined in Controllers and should delegate to the appropriate Command or Query via MediatR.
- Product CRUD operations use soft delete (set `IsDeleted` to true) instead of hard delete.
- DTOs are defined in the `Models` folder and used for API responses.
- Use async/await for all database and network operations.
- Ensure all new code is covered by appropriate error handling and validation.

## 🤖 AI Chat Architecture (Clean Architecture Implementation)

The chat system follows **Clean Architecture** principles with proper separation of concerns:

### Architecture Flow:

```
ChatController → ProcessChatRequestCommand → ProcessChatRequestCommandHandler → IChatService → ChatService
```

### Key Components:

1. **IChatService Interface** (`Services/IChatService.cs`)

   - Defines public methods for chat processing
   - Enables easy switching between AI services (Ollama ↔ OpenAI ↔ others)
   - Methods: `ProcessChatMessageAsync()`, `SearchProductsAsync()`

2. **ChatService** (`Services/ChatService.cs`)

   - Implements `IChatService`
   - Contains AI processing logic with **Ollama + Llama 3.2** integration
   - Handles JSON response parsing and database integration
   - **Spanish AI responses** with strict anti-hallucination prompts

3. **ProcessChatRequestCommand** (`Application/Commands/ProcessChatRequestCommand.cs`)

   - MediatR command following CQRS pattern
   - Properties: `Message`, `UserId`, `StoreId`

4. **ProcessChatRequestCommandHandler** (`Application/Handlers/ProcessChatRequestCommandHandler.cs`)

   - Calls `IChatService` maintaining separation of concerns
   - Handles command execution via MediatR pattern

5. **ChatController** (`Controllers/ChatController.cs`)
   - HTTP endpoint: `POST /api/chat/message`
   - Uses MediatR to send commands (no direct service calls)
   - Request/Response: `ChatRequest` → `ProcessChatRequestCommand` → JSON response

### AI Features:

- **Product Search**: Real-time MongoDB integration via `SearchProductsQuery`
- **Structured Responses**: JSON format with actions (`search`, `add_to_cart`, `view_cart`, `message`)
- **Anti-Hallucination**: Strict system prompts prevent AI from inventing non-existent products
- **Spanish Language**: All AI responses in Spanish for FluxCommerce customers
- **Cart Integration**: Frontend `CartContext` handles product additions

### Database Integration:

- `SearchProductsQueryHandler.cs`: Handles product searches from AI
- `MongoDbService.SearchProductsAsync()`: Case-insensitive product search
- Real-time product data (no fake/invented products)

### Frontend Integration:

- `ChatPage.js`: React component with structured AI response handling
- `handleAIResponse()`: Processes backend JSON responses
- `formatProductSearchResults()`: Displays products from AI search
- Integration with `CartContext` for shopping cart functionality

**⚠️ Important Notes:**

- `ProcessChatMessageCommand` and its handler are **OBSOLETE** - use the new clean architecture
- All AI logic moved from handlers to `ChatService` for better testability
- Use `IChatService` interface for dependency injection and testing

## Frontend Architecture

- Built with **React** and communicates with the backend via RESTful endpoints, using fetch or similar APIs.
- Uses **react-router-dom** for client-side routing. All main pages and navigation are defined in `App.js` using `<Routes>` and `<Route>` components.
- To add a new route, import the page component and add a `<Route path="/your-path" element={<YourComponent />} />` inside the `<Routes>` block in `App.js`.
- Example:
  ```jsx
  <Route path="/store" element={<StoreList />} />
  ```
- All new features and bug fixes should follow the established CQRS and MediatR patterns in the backend.
- When adding new endpoints, always update both the backend controller and the frontend API calls to keep them in sync.

## Project Structure

```
FluxCommerce/
├── backend/
│   ├── Application/
│   │   ├── Commands/
│   │   │   ├── ActivateMerchantCommand.cs
│   │   │   ├── AddAddressCommand.cs
│   │   │   ├── CreateOrderCommand.cs
│   │   │   ├── CreateProductCommand.cs
│   │   │   ├── DeleteProductCommand.cs
│   │   │   ├── LoginAdminCommand.cs
│   │   │   ├── LoginCustomerCommand.cs
│   │   │   ├── LoginMerchantCommand.cs
│   │   │   ├── ProcessChatRequestCommand.cs  # 🆕 Clean Architecture Chat Command
│   │   │   ├── ProcessChatMessageCommand.cs  # ⚠️ OBSOLETE - Use ProcessChatRequestCommand
│   │   │   ├── RegisterCustomerCommand.cs
│   │   │   ├── RegisterMerchantCommand.cs
│   │   │   ├── SetMerchantActiveCommand.cs
│   │   │   ├── SetOrderPaidCommand.cs
│   │   │   ├── SetOrderReceivedCommand.cs
│   │   │   ├── SetOrderShippedCommand.cs
│   │   │   ├── SetOrderTrackingNumberCommand.cs
│   │   │   ├── SetupMerchantStoreCommand.cs
│   │   │   ├── UpdateProductCommand.cs
│   │   │   └── ValidateMerchantCommand.cs
│   │   ├── Handlers/
│   │   │   ├── CreateOrderCommandHandler.cs
│   │   │   ├── CreateProductCommandHandler.cs
│   │   │   ├── DeleteProductCommandHandler.cs
│   │   │   ├── GetCustomerByEmailQueryHandler.cs
│   │   │   ├── GetMerchantsQueryHandler.cs
│   │   │   ├── GetOrdersByMerchantQueryHandler.cs
│   │   │   ├── LoginAdminCommandHandler.cs
│   │   │   ├── LoginMerchantCommandHandler.cs
│   │   │   ├── ProcessChatRequestCommandHandler.cs  # 🆕 Clean Architecture Handler
│   │   │   ├── ProcessChatMessageCommandHandler.cs  # ⚠️ OBSOLETE - Logic moved to ChatService
│   │   │   ├── RegisterMerchantCommandHandler.cs
│   │   │   ├── SearchProductsQueryHandler.cs
│   │   │   ├── SetOrderPaidCommandHandler.cs
│   │   │   ├── SetOrderShippedCommandHandler.cs
│   │   │   ├── UpdateProductCommandHandler.cs
│   │   │   └── ValidateMerchantCommandHandler.cs
│   │   └── Queries/
│   │       ├── GetCustomerByEmailQuery.cs
│   │       ├── GetMerchantsQuery.cs
│   │       ├── GetOrdersByMerchantQuery.cs
│   │       └── SearchProductsQuery.cs  # 🤖 AI Chat Database Integration
│   ├── Common/
│   │   ├── ApiException.cs
│   │   └── ApiExceptionFilter.cs
│   ├── Controllers/
│   │   ├── ChatController.cs       # 🤖 AI Assistant Chat API
│   │   ├── CustomerController.cs
│   │   ├── MerchantController.cs
│   │   ├── OrderController.cs
│   │   └── ProductController.cs
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   ├── MongoDbContext.cs
│   │   └── MongoDbService.cs       # 🔍 Product Search Integration
│   ├── Models/
│   │   ├── AddAddressDto.cs
│   │   ├── Customer.cs
│   │   ├── LoginCustomerDto.cs
│   │   ├── Merchant.cs
│   │   ├── Order.cs
│   │   ├── Product.cs
│   │   └── RegisterCustomerDto.cs
│   ├── Services/
│   │   ├── IChatService.cs         # 🆕 Chat Service Interface (Clean Architecture)
│   │   ├── ChatService.cs          # 🤖 AI Processing Service with Ollama Integration
│   │   └── EmailService.cs
│   ├── ProductImages/              # 📁 Static Product Images Storage
│   ├── Properties/
│   │   └── launchSettings.json
│   ├── bin/ & obj/                 # 🔧 Build Artifacts
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── FluxCommerce.Api.csproj
│   ├── FluxCommerce.Api.http
│   └── Program.cs                  # 🔧 DI Container & Service Registration
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── CartIcon.js
│   │   │   ├── ProductForm.js
│   │   │   ├── ProtectedAdminRoute.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── CartContext.js      # 🛒 Shopping Cart State Management
│   │   ├── pages/
│   │   │   └── ChatPage.js         # 🤖 AI Assistant Chat Interface
│   │   ├── App.css
│   │   ├── App.js                  # 🚀 Main App with React Router
│   │   ├── App.test.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── logo.svg
│   │   ├── reportWebVitals.js
│   │   ├── service-worker.js
│   │   ├── serviceWorkerRegistration.js
│   │   ├── setupProxy.js           # ⚙️ Backend API Proxy Configuration
│   │   └── setupTests.js
│   └── package.json
├── COPILOT_INSTRUCTIONS.md
├── FluxCommerce.sln
├── LICENSE
└── README.md
```

## Demo Data: Seeding Stores and Products

To quickly populate your MongoDB database with 10 demo stores and realistic products, use the provided script:

1. Make sure Python and `pymongo` are installed:
   ```
   pip install pymongo
   ```
2. Run the script from the project root:
   ```
   python backend/scripts/generate_stores.py
   ```
3. This will create demo merchants and products in MongoDB, and save their credentials to `store_credentials.txt`.

---

## 🚀 Current Development Status

### ✅ Completed Features

- **E-commerce Core**: Product CRUD, Order management, Merchant/Customer systems
- **AI Chat Assistant**: Complete implementation with clean architecture
- **Database Integration**: MongoDB with product search functionality
- **Frontend**: React app with cart functionality and chat interface
- **Authentication**: JWT-based auth for merchants and customers

### 🏗️ Architecture Highlights

- **Clean Architecture**: Proper separation between Controllers, Commands, and Services
- **CQRS Pattern**: Commands for writes, Queries for reads via MediatR
- **AI Service Abstraction**: `IChatService` interface allows easy AI provider switching
- **Spanish AI Responses**: Localized customer support with anti-hallucination measures

### 📋 Technical Debt & Notes

- Several compiler warnings exist (non-nullable properties, unused directives)
- `ProcessChatMessageCommand` marked as obsolete - new code should use `ProcessChatRequestCommand`
- MediatR version mismatch warning (v13.0.0 vs expected v11.x)
- Semantic Kernel Ollama connector using alpha version

### 🔄 Git Workflow

- **Current Branch**: `feature/chat`
- **Default Branch**: `main`
- Chat functionality ready for merge after testing

---

## Development Conventions

- All new features should follow the CQRS pattern and use MediatR for backend logic.
- Use DTOs for all API responses and keep them in the `Models` folder.
- Product deletion is always a soft delete (set `IsDeleted` to true).
- Always validate and handle errors in both backend and frontend code.
- Use async/await for all asynchronous operations.

---

For questions or further conventions, contact the repository owner.

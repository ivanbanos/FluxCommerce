# GitHub Copilot Repository Instructions

This repository uses **MongoDB** for data storage, **.NET (ASP.NET Core)** for the backend, and **React** for the frontend.

## Instalación de Ollama

```bash
# Windows: Descargar desde https://ollama.com/download/windows
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# Instalar modelo en la terminal llama estos comandos
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
│   │   ├── Handlers/
│   │   └── Queries/
│   ├── Common/
│   ├── Controllers/
│   ├── Data/
│   ├── Models/
│   ├── ProductImages/
│   ├── Properties/
│   ├── Services/
│   ├── appsettings.json
│   └── Program.cs
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.js
│   │   ├── setupProxy.js
│   │   └── ...
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

## Development Conventions

- All new features should follow the CQRS pattern and use MediatR for backend logic.
- Use DTOs for all API responses and keep them in the `Models` folder.
- Product deletion is always a soft delete (set `IsDeleted` to true).
- Always validate and handle errors in both backend and frontend code.
- Use async/await for all asynchronous operations.

---

For questions or further conventions, contact the repository owner.

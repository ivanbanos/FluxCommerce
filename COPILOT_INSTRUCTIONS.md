# GitHub Copilot Repository Instructions

This repository uses **MongoDB** for data storage, **.NET (ASP.NET Core)** for the backend, and **React** for the frontend.

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
- All new features and bug fixes should follow the established CQRS and MediatR patterns in the backend.
- When adding new endpoints, always update both the backend controller and the frontend API calls to keep them in sync.

## Development Conventions
- All new features should follow the CQRS pattern and use MediatR for backend logic.
- Use DTOs for all API responses and keep them in the `Models` folder.
- Product deletion is always a soft delete (set `IsDeleted` to true).
- Always validate and handle errors in both backend and frontend code.
- Use async/await for all asynchronous operations.

---

For questions or further conventions, contact the repository owner.

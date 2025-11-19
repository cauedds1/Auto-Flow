# VeloStock - Universal Multi-Tenant SaaS

## Overview
VeloStock is a universal multi-tenant SaaS platform for comprehensive vehicle dealership and store management. It originated from "Capoeiras Automóveis" and has evolved into a white-label solution for any automotive business. The system manages vehicles from intake to sale using a Kanban-style workflow, tracks detailed costs, and incorporates AI for price suggestions and ad generation. Key features include intelligent alerts, complete store operations, and inventory management. The application is localized in Brazilian Portuguese (pt-BR) and features a modern, professional design. Its business vision is to provide a scalable, secure, and feature-rich platform to streamline operations for automotive dealerships, enhancing efficiency and profitability through advanced tools and multi-tenancy.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend utilizes React with TypeScript, Vite, Tailwind CSS, Radix UI primitives, and shadcn/ui (New York variant). It features a dynamic theming system with company-specific colors and logos, a base palette of purple and green, and typography using Inter or IBM Plex Sans. Design principles blend Material Design with Linear/Notion aesthetics, focusing on consistent spacing. Key UI patterns include Kanban boards with drag-and-drop, tab-based detail views, modal dialogs, toast notifications, interactive analytics, and a NotificationCenter.

### Technical Implementations
**Frontend:**
- **Technology Stack**: React, TypeScript, Vite, Wouter, TanStack React Query, Tailwind CSS.
- **State Management**: React Query for server state, React hooks for local state, React Hook Form with Zod for form validation.
- **Key Features**: Vehicle management (sorting, checklists, dynamic adaptation for Carro/Moto), physical location tracking (7 predefined + custom), document management (PDF upload/download), intelligent alerts, AI features (price suggestions, ad generation in 3 styles), enhanced dashboard with 6 key metrics (Total em Estoque correctly excludes Vendidos/Arquivados), user management (role-based permissions, invite users), first-time setup onboarding, theme customization, sale workflow with automatic SaleDialog when marking vehicle as "Vendido" (captures seller and optional repasse target), reorganized vehicle filters (horizontal layout), and complete Bills system (Contas a Pagar/Receber) with RBAC.

**Backend:**
- **Technology Stack**: Node.js with Express.js, TypeScript, PostgreSQL (via Neon serverless driver), Drizzle ORM.
- **API Design**: RESTful API (JSON), Multer for file uploads, WebSocket for real-time updates.
- **Authentication**: Email/password authentication using bcrypt, passport-local strategy, and PostgreSQL session store (30-day TTL). Google OAuth has been removed.
- **Multi-Tenant Security**: Complete data isolation enforced via `empresaId` validation on all routes and queries, preventing cross-company data access.
- **Role-Based Access Control (RBAC)**: Four roles (Proprietário, Gerente, Vendedor, Motorista) with granular permissions managed by middleware.
- **Key Entities**: Vehicle status pipeline (Entrada to Arquivado), cost categories (Mecânica, Estética, Documentação, Outros).
- **File Storage**: Images are stored as Base64 in the database. Documents are stored on disk at `/uploads/vehicles/<vehicleId>/`.

### System Design Choices
- **Multi-tenancy**: Full data isolation per company (`empresaId`) across all tables and API routes.
- **Role-Based Access Control (RBAC)**: Implemented with four distinct user roles, each with specific feature access.
- **Data Flow**: Client (TanStack Query) -> Express API -> Drizzle ORM -> PostgreSQL, with React Query handling caching.
- **Deployment**: Designed for autoscale, utilizing an external Neon PostgreSQL database with connection pooling for production. Build process uses Vite and esbuild.

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL with connection pooling.
- **Drizzle ORM**: Type-safe ORM for PostgreSQL.
- **connect-pg-simple**: PostgreSQL session store.

### AI Integration
- **OpenAI API**: Utilizes GPT-4o-mini for AI-powered price suggestions and ad generation.
- **FIPE API**: Free proxy integration (Parallelum API) for real-time vehicle pricing data.

### Third-Party Services
- **Google Fonts**: For typography.
- **Socket.IO**: For real-time communication.

### Key Libraries
- **React Hook Form**: Form management and validation.
- **date-fns**: Date manipulation utility.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Lucide React**: Icon library.
# Overview

This is a Point of Sale (PDV) system called "DOCES MARA" - a complete web application for managing restaurant operations including table management, orders, products, and sales. The system provides a modern interface for waitstaff to handle customer orders, manage tables, process payments, and generate sales reports.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Database Layer**: Drizzle ORM with PostgreSQL dialect
- **Storage**: In-memory storage implementation with interface for future database integration
- **API Design**: RESTful endpoints under `/api/pos` prefix for all POS operations

## Data Model
The system manages five core entities:
- **Categorias**: Product categories for organization
- **Produtos**: Products with pricing, units, and optional inventory control
- **Mesas**: Tables with status tracking (livre/ocupada/reservada)
- **Comandas**: Orders that can be linked to tables or standalone
- **Vendas**: Completed sales with payment method tracking

## Key Features
- **Table Management**: Visual table map with color-coded status indicators
- **Order Management**: Add/remove items, quantity adjustments, real-time totals
- **Product Catalog**: Searchable grid with category filtering
- **Payment Processing**: Multiple payment methods (cash, credit/debit cards, PIX)
- **Sales Reporting**: Date-range based sales analytics
- **Inventory Control**: Optional stock tracking for products

## API Structure
All endpoints follow REST conventions under `/api/pos`:
- **Products**: CRUD operations for product management
- **Categories**: Category creation and listing
- **Tables**: Status updates and listing
- **Orders**: Order lifecycle management and item operations
- **Sales**: Payment processing and completion
- **Reports**: Sales analytics and reporting

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection adapter
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **drizzle-kit**: Database migration and schema management tool

## UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant handling for components
- **lucide-react**: Icon library for consistent iconography

## State Management and Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation and schema definition

## Development Tools
- **typescript**: Static type checking
- **vite**: Development server and build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds

## Session and Authentication (Prepared)
- **connect-pg-simple**: PostgreSQL session store (configured but not actively used)
- **express-session**: Session middleware (infrastructure in place)

The application is structured as a monorepo with shared schema definitions between client and server, enabling type safety across the full stack.
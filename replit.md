# RealtyChain - Blockchain-Based Real Estate Co-Ownership Platform

## Overview

RealtyChain is a blockchain-powered fractional real estate investment platform built on the Internet Computer Protocol (ICP). The application enables users to invest in tokenized real estate properties, participate in governance decisions, and receive automated dividend distributions through smart contracts.

The platform features a modern React frontend with TypeScript, an Express.js backend, and uses Drizzle ORM with PostgreSQL for data persistence. The application implements a full-stack architecture with RESTful APIs, real-time data visualization, and a responsive UI built with shadcn/ui components.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds
- **Data Visualization**: Recharts for portfolio and asset allocation charts

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful architecture with structured endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL storage
- **Development**: Hot reload with tsx for TypeScript execution

### Database Design
The application uses a relational database schema with the following core entities:
- **Users**: User accounts with KYC status and wallet addresses
- **Properties**: Tokenized real estate assets with investment details
- **Investments**: User ownership records with token quantities
- **Transactions**: Investment history and dividend payments
- **Proposals**: Governance proposals for property decisions
- **Votes**: User voting records on governance proposals

## Key Components

### Property Tokenization System
- Each property is represented as fractional tokens
- Properties contain metadata including location, type, expected ROI, and investment minimums
- Token availability tracking for investment limits
- Automated value calculations and updates

### Investment Management
- Portfolio tracking with real-time value updates
- Investment history and transaction logging
- Performance analytics with ROI calculations
- Asset allocation visualization across property types

### Governance Framework
- Token-based voting system for property decisions
- Proposal creation and management
- Voting power based on token ownership
- Automated vote counting and proposal status updates

### User Interface Features
- Responsive design with dark/light theme support
- Interactive property marketplace with filtering
- Real-time dashboard with portfolio metrics
- Data visualization for performance tracking
- Toast notifications for user feedback

## Data Flow

### Investment Process
1. User browses available properties in the marketplace
2. Property selection triggers investment flow with validation
3. Backend processes investment, updates token availability
4. Transaction record created with investment details
5. Portfolio automatically updates with new holdings

### Governance Process
1. Proposals are created for property-related decisions
2. Users with token holdings can vote on active proposals
3. Voting power is calculated based on token ownership
4. Votes are recorded and proposal status updated
5. Results displayed in real-time governance dashboard

### Data Persistence
- All data operations use Drizzle ORM with type safety
- Database migrations managed through Drizzle Kit
- Connection pooling with standard PostgreSQL driver
- Schema validation using Zod for API endpoints

## External Dependencies

### Core Dependencies
- **pg**: PostgreSQL database connectivity (Supabase compatible)
- **drizzle-orm**: Type-safe database operations and migrations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI primitive components
- **recharts**: Data visualization and charting library

### Development Dependencies
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js
- **tailwindcss**: Utility-first CSS framework
- **@types/**: TypeScript definitions for various packages

### Blockchain Integration
- Designed for Internet Computer Protocol (ICP) integration
- Wallet connectivity preparation for ICP wallets
- Smart contract architecture ready for canister deployment
- Mock implementations provide development environment

## Deployment Strategy

### Development Environment
- Vite development server for frontend hot reload
- tsx for backend TypeScript execution with watch mode
- Environment variables for database configuration
- Replit integration with runtime error overlay

### Production Build
- Frontend built using Vite with optimized bundling
- Backend compiled using esbuild for Node.js deployment
- Static assets served from dist/public directory
- Database migrations applied using Drizzle Kit

### Database Strategy
- PostgreSQL as primary database (configurable for Supabase or Replit database)
- Drizzle migrations for schema version control with drizzle-kit
- DatabaseStorage implementation replacing in-memory storage
- Complete relational schema with foreign key relationships
- Automated seeding with sample real estate data
- Environment-based configuration for different deployment stages

### Scalability Considerations
- Modular architecture supports horizontal scaling
- Database indexing for optimal query performance
- Caching layer through React Query for reduced API calls
- CDN integration potential for static asset delivery

## Changelog

- June 30, 2025. Initial setup
- June 30, 2025. Integrated PostgreSQL database with Drizzle ORM, replacing in-memory storage with persistent data layer. Added complete relational schema with foreign key relationships and automated seeding.
- June 30, 2025. Updated wallet integration from ICP to Ethereum using address 0x95868a76A768Ea791B28a4866106f3743dbEA2e8. Enhanced Dashboard UI with improved error handling and null safety to prevent crashes. Reverted hero section to original design.
- June 30, 2025. Production-ready dashboard UI overhaul: Fixed card layouts with proper gradients and spacing, enhanced chart responsiveness with fixed heights, improved error handling with ErrorBoundary component, optimized loading states and null safety throughout. App is now ready for production deployment.
- July 4, 2025. Fixed database connection issue by migrating from Neon to Supabase. Successfully connected to user's Supabase database, pushed schema, and seeded with sample real estate data. App is now fully functional with persistent data storage.
- July 4, 2025. Implemented full ICP blockchain backend with Rust smart canisters. Created property tokenization, investment management, governance voting, and user authentication canisters. Added ICP client integration layer and deployment scripts. App now features dual architecture: traditional Node.js backend (active) and blockchain-ready ICP canisters for decentralized deployment.
- July 4, 2025. Fixed marketplace image display issues for Indian property listings by updating image URLs with proper crop parameters. Fixed dashboard pie chart tooltip overlapping problem by implementing proper z-index management and positioning constraints. Enhanced PropertyCard component with fallback image handling and improved tooltip styling for better user experience.
- July 4, 2025. Completed full Supabase integration: Removed Neon database completely, installed @supabase/supabase-js client, created Supabase backend configuration, added database connection via Supabase PostgreSQL, and prepared real-time features architecture. Application now runs entirely on Supabase infrastructure with persistent data storage and API connectivity.

## User Preferences

Preferred communication style: Simple, everyday language.
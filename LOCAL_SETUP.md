# RealtyChain Local Development Setup Guide

## Prerequisites

Before starting, make sure you have these installed on your local machine:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

4. **VS Code**
   - Download from: https://code.visualstudio.com/

## Step 1: Clone or Download the Project

### Option A: If you have the project on Replit
1. Download the project as a ZIP file from Replit
2. Extract it to your desired local directory
3. Open the folder in VS Code

### Option B: If you have a Git repository
```bash
git clone <your-repository-url>
cd <project-folder>
code .
```

## Step 2: Install Dependencies

Open VS Code terminal (`Ctrl+`` or `View > Terminal`) and run:

```bash
npm install
```

This will install all required packages including:
- React, TypeScript, Vite (frontend)
- Express.js, Drizzle ORM (backend)
- Supabase client and all UI components

## Step 3: Set Up Environment Variables

1. Create a `.env` file in the root directory:
```bash
touch .env
```

2. Add your Supabase configuration to the `.env` file:
```env
# Supabase Configuration
DATABASE_URL=your_supabase_database_url_here
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database Configuration (auto-generated from Supabase)
PGHOST=your_supabase_host
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=your_supabase_password
```

### How to get Supabase credentials:
1. Go to https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Go to Settings > API
4. Copy the Project URL and anon public key
5. Go to Settings > Database
6. Copy the connection string and replace `[YOUR-PASSWORD]` with your actual password

## Step 4: Set Up the Database

1. Push the database schema to your Supabase database:
```bash
npm run db:push
```

2. Seed the database with sample data:
```bash
npm run db:seed
```

## Step 5: Start the Development Server

Run the application in development mode:
```bash
npm run dev
```

This command will:
- Start the Express.js backend server on port 5000
- Start the Vite frontend development server
- Enable hot reloading for both frontend and backend
- Open your browser automatically

## Step 6: Access the Application

Once the servers are running, you can access:

- **Frontend**: http://localhost:5000 (main application)
- **Backend API**: http://localhost:5000/api (REST endpoints)

The application will show:
- Dashboard with portfolio overview
- Property marketplace with investment options
- Governance voting system
- User portfolio management

## Step 7: VS Code Extensions (Recommended)

Install these VS Code extensions for better development experience:

1. **TypeScript and JavaScript Language Features** (built-in)
2. **ES7+ React/Redux/React-Native snippets**
3. **Prettier - Code formatter**
4. **ESLint**
5. **Tailwind CSS IntelliSense**
6. **Auto Rename Tag**

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express.js application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database connection
│   └── storage.ts         # Data access layer
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:seed` - Seed database with sample data
- `npm run start` - Start production server

## Common Issues and Solutions

### Issue 1: Port Already in Use
If port 5000 is busy, the application will automatically use the next available port.

### Issue 2: Database Connection Failed
- Verify your Supabase credentials in `.env`
- Check that your Supabase project is active
- Ensure the DATABASE_URL format is correct

### Issue 3: Module Not Found Errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### Issue 4: TypeScript Errors
- Make sure you're using Node.js version 18 or higher
- Run `npm run dev` instead of trying to run files directly

## Development Workflow

1. **Frontend Development**: 
   - Edit files in `client/src/`
   - Changes auto-reload in browser
   - Use browser DevTools for debugging

2. **Backend Development**:
   - Edit files in `server/`
   - Server automatically restarts on changes
   - Check terminal for API logs

3. **Database Changes**:
   - Modify `shared/schema.ts`
   - Run `npm run db:push` to apply changes

## Features You Can Test

1. **Property Investment**: Browse and invest in properties
2. **Portfolio Dashboard**: View your investments and returns
3. **Governance Voting**: Vote on property proposals
4. **Real-time Updates**: See live data changes
5. **Responsive Design**: Test on different screen sizes

Your local development environment is now ready! The application runs with full functionality including database persistence, real-time features, and all the UI components.
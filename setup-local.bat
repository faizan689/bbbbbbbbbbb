@echo off
:: RealtyChain Local Setup Script for Windows
echo 🏠 Setting up RealtyChain locally...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

:: Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

:: Check if .env file exists
if not exist ".env" (
    echo ⚠️  Creating .env file template...
    (
        echo # Supabase Configuration - REPLACE WITH YOUR ACTUAL VALUES
        echo DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
        echo SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
        echo SUPABASE_ANON_KEY=your_supabase_anon_key_here
        echo SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
        echo.
        echo # Database Configuration (auto-generated from Supabase^)
        echo PGHOST=[YOUR-PROJECT-REF].supabase.co
        echo PGPORT=5432
        echo PGDATABASE=postgres
        echo PGUSER=postgres
        echo PGPASSWORD=[YOUR-PASSWORD]
    ) > .env
    echo 📝 .env file created. Please edit it with your Supabase credentials.
    echo.
    echo To get your Supabase credentials:
    echo 1. Go to https://supabase.com/dashboard
    echo 2. Select your project
    echo 3. Go to Settings ^> API for URL and keys
    echo 4. Go to Settings ^> Database for connection string
    echo.
) else (
    echo ✅ .env file already exists
)

:: Try to push database schema
echo 🗄️  Setting up database...
npm run db:push

if %errorlevel% equ 0 (
    echo ✅ Database schema pushed successfully
    
    :: Try to seed database
    echo 🌱 Seeding database with sample data...
    npm run db:seed
    
    if %errorlevel% equ 0 (
        echo ✅ Database seeded successfully
    ) else (
        echo ⚠️  Database seeding failed. You can try again later with: npm run db:seed
    )
) else (
    echo ⚠️  Database setup failed. Please check your .env configuration.
)

echo.
echo 🎉 Setup complete!
echo.
echo To start the development server:
echo   npm run dev
echo.
echo The application will be available at:
echo   http://localhost:5000
echo.
echo Happy coding! 🚀
pause
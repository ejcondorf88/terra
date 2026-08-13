@echo off
echo 🚀 Levantando TERRA LINK...

echo 📦 Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    exit /b 1
)

echo 🗄️ Levantando base de datos...
cd ..
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Error levantando base de datos
    exit /b 1
)

echo ⏳ Esperando que la base de datos esté lista...
timeout /t 10 /nobreak > nul

echo ⚙️ Configurando entorno...
cd backend
if not exist .env (
    copy .env.example .env
)

echo 🏗️ Compilando backend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error compilando backend
    exit /b 1
)

echo 🎯 Iniciando backend...
start cmd /k "cd backend && npm run start:dev"

echo ✅ TERRA LINK levantado exitosamente!
echo 🌐 API disponible en: http://localhost:3000
echo 🗄️ Base de datos en: localhost:5432

pause

#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 Generando Web App para Vercel...');

// Crear directorio temporal sin SQLite
const tempDir = 'temp-web-build';
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
}
fs.mkdirSync(tempDir);

// Función para copiar archivos/directorios de forma compatible
function copyFileOrDir(source, dest) {
  if (fs.lstatSync(source).isDirectory()) {
    // Crear directorio destino
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    // Copiar contenido del directorio
    const files = fs.readdirSync(source);
    files.forEach(file => {
      const sourcePath = path.join(source, file);
      const destPath = path.join(dest, file);
      copyFileOrDir(sourcePath, destPath);
    });
  } else {
    // Copiar archivo
    fs.copyFileSync(source, dest);
  }
}

// Copiar archivos necesarios
const filesToCopy = [
  'src',
  'assets',
  'package.json',
  'babel.config.js',
  'metro.config.js',
  'tsconfig.json',
  'app.config.web.js',
  'index.js',
  'app.config.js',
  'App.tsx'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    const destPath = path.join(tempDir, file);
    copyFileOrDir(file, destPath);
  }
});

// Crear package.json sin SQLite
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
delete packageJson.dependencies['expo-sqlite'];
delete packageJson.dependencies['@expo/webpack-config'];
delete packageJson.dependencies['@expo/metro-runtime'];

// Renombrar app.config.web.js a app.config.js
const webConfigPath = path.join(tempDir, 'app.config.web.js');
const configPath = path.join(tempDir, 'app.config.js');
if (fs.existsSync(webConfigPath)) {
  fs.renameSync(webConfigPath, configPath);
}

fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));

// Cambiar al directorio temporal
process.chdir(tempDir);

try {
  // Instalar dependencias
  console.log('📦 Instalando dependencias...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Generar build web
  console.log('🔨 Generando build web...');
  execSync('npx expo export --platform web', { stdio: 'inherit' });
  
  // Mover build al directorio principal
  if (fs.existsSync('web-build')) {
    const webBuildPath = path.join(process.cwd(), 'web-build');
    const parentWebBuildPath = path.join('..', 'web-build');
    
    // Copiar web-build al directorio padre
    copyFileOrDir(webBuildPath, parentWebBuildPath);
    console.log('✅ Web app generada exitosamente en web-build/');
  }
} catch (error) {
  console.error('❌ Error generando web app:', error.message);
} finally {
  // Limpiar directorio temporal
  process.chdir('..');
  fs.rmSync(tempDir, { recursive: true });
}

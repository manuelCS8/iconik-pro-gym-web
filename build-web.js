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
    if (fs.lstatSync(file).isDirectory()) {
      execSync(`xcopy "${file}" "${tempDir}\\${file}" /E /I /Y`, { shell: true });
    } else {
      fs.copyFileSync(file, path.join(tempDir, file));
    }
  }
});

  // Crear package.json sin SQLite
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  delete packageJson.dependencies['expo-sqlite'];
  delete packageJson.dependencies['@expo/webpack-config'];
  delete packageJson.dependencies['@expo/metro-runtime'];
  
  // Renombrar app.config.web.js a app.config.js
  if (fs.existsSync('app.config.web.js')) {
    fs.renameSync('app.config.web.js', 'app.config.js');
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
    execSync(`xcopy "web-build" "..\\web-build" /E /I /Y`, { shell: true });
    console.log('✅ Web app generada exitosamente en web-build/');
  }
} catch (error) {
  console.error('❌ Error generando web app:', error.message);
} finally {
  // Limpiar directorio temporal
  process.chdir('..');
  fs.rmSync(tempDir, { recursive: true });
}

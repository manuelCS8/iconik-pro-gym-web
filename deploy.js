#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iconik Pro Gym - Script de Despliegue');
console.log('=====================================\n');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`📋 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completado`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error en ${description}: ${error.message}`, 'red');
    return false;
  }
}

// Verificar que estamos en el directorio correcto
if (!fs.existsSync('package.json')) {
  log('❌ No se encontró package.json. Asegúrate de estar en el directorio del proyecto.', 'red');
  process.exit(1);
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';

  log('🎯 Iniciando proceso de despliegue...', 'yellow');

  switch (target) {
    case 'web':
      await deployWeb();
      break;
    case 'android':
      await deployAndroid();
      break;
    case 'ios':
      await deployIOS();
      break;
    case 'all':
      await deployAll();
      break;
    default:
      log('❌ Opción no válida. Usa: web, android, ios, o all', 'red');
      process.exit(1);
  }
}

async function deployWeb() {
  log('\n🖥️  Desplegando Web App...', 'yellow');
  
  // Verificar dependencias
  if (!fs.existsSync('node_modules/@expo/webpack-config')) {
    log('📦 Instalando dependencias web...', 'blue');
    execCommand('npm install @expo/webpack-config@19.0.1 --legacy-peer-deps', 'Instalación de webpack-config');
  }

  // Generar build web
  execCommand('npx expo export:web', 'Generación de build web');

  // Verificar que se generó el build
  if (!fs.existsSync('web-build')) {
    log('❌ No se generó el directorio web-build', 'red');
    return;
  }

  log('✅ Web app generada en directorio web-build/', 'green');
  log('📝 Para desplegar en Firebase Hosting:', 'yellow');
  log('   1. npm install -g firebase-tools', 'blue');
  log('   2. firebase login', 'blue');
  log('   3. firebase init hosting', 'blue');
  log('   4. firebase deploy --only hosting', 'blue');
}

async function deployAndroid() {
  log('\n📱 Desplegando Android APK...', 'yellow');
  
  // Verificar EAS CLI
  try {
    execSync('eas --version', { stdio: 'pipe' });
  } catch (error) {
    log('📦 Instalando EAS CLI...', 'blue');
    execCommand('npm install -g eas-cli', 'Instalación de EAS CLI');
  }

  // Verificar configuración EAS
  if (!fs.existsSync('eas.json')) {
    log('⚙️  Configurando EAS...', 'blue');
    execCommand('eas build:configure', 'Configuración de EAS');
  }

  // Generar APK
  execCommand('eas build --platform android --profile preview', 'Generación de APK Android');

  log('✅ APK Android generado', 'green');
  log('📝 El APK estará disponible en EAS Dashboard', 'yellow');
}

async function deployIOS() {
  log('\n🍎 Desplegando iOS IPA...', 'yellow');
  
  // Verificar EAS CLI
  try {
    execSync('eas --version', { stdio: 'pipe' });
  } catch (error) {
    log('📦 Instalando EAS CLI...', 'blue');
    execCommand('npm install -g eas-cli', 'Instalación de EAS CLI');
  }

  // Verificar configuración EAS
  if (!fs.existsSync('eas.json')) {
    log('⚙️  Configurando EAS...', 'blue');
    execCommand('eas build:configure', 'Configuración de EAS');
  }

  // Generar IPA
  execCommand('eas build --platform ios --profile preview', 'Generación de IPA iOS');

  log('✅ IPA iOS generado', 'green');
  log('📝 El IPA estará disponible en EAS Dashboard', 'yellow');
  log('📝 Requiere Apple Developer Account para TestFlight', 'yellow');
}

async function deployAll() {
  log('\n🚀 Desplegando todo...', 'yellow');
  
  await deployWeb();
  await deployAndroid();
  await deployIOS();
  
  log('\n🎉 ¡Despliegue completado!', 'green');
  log('📋 Resumen:', 'yellow');
  log('   - Web app: web-build/', 'blue');
  log('   - Android APK: EAS Dashboard', 'blue');
  log('   - iOS IPA: EAS Dashboard', 'blue');
}

// Manejar errores
process.on('unhandledRejection', (error) => {
  log(`❌ Error no manejado: ${error}`, 'red');
  process.exit(1);
});

// Ejecutar script
main().catch((error) => {
  log(`❌ Error en el script: ${error}`, 'red');
  process.exit(1);
});

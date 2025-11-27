#!/usr/bin/env node

/**
 * Script para verificar la configuración de Supabase
 * Verifica que las variables de entorno estén configuradas correctamente
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🔍 Verificando configuración de Supabase...\n');

// Verificar variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let hasErrors = false;

// Verificar que existe .env
try {
  readFileSync(join(projectRoot, '.env'));
  console.log('✅ Archivo .env encontrado');
} catch (error) {
  console.log('❌ Archivo .env NO encontrado');
  console.log('   Crea un archivo .env basado en .env.example');
  hasErrors = true;
}

// Verificar variables
console.log('\n📋 Variables de entorno:');

if (!supabaseUrl) {
  console.log('❌ VITE_SUPABASE_URL no está configurada');
  hasErrors = true;
} else {
  console.log(`✅ VITE_SUPABASE_URL: ${supabaseUrl}`);
  if (!supabaseUrl.startsWith('http')) {
    console.log('   ⚠️  La URL debe comenzar con http:// o https://');
  }
}

if (!supabaseAnonKey) {
  console.log('❌ VITE_SUPABASE_ANON_KEY no está configurada');
  hasErrors = true;
} else {
  console.log(`✅ VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`);
}

if (!supabaseServiceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY no está configurada');
  hasErrors = true;
} else {
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey.substring(0, 20)}...`);
}

if (hasErrors) {
  console.log('\n❌ Hay errores en la configuración. Por favor, corrígelos antes de continuar.');
  console.log('   Consulta GUIA_SUPABASE_NUBE.md para más información.');
  process.exit(1);
}

// Intentar conectar a Supabase
console.log('\n🔌 Intentando conectar a Supabase...');

try {
  // Usar service_role key para verificar tablas (bypass RLS)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  // También crear cliente con anon key para verificar acceso desde frontend
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  
  // Verificar conexión básica con service_role (bypass RLS)
  const { data, error } = await supabaseAdmin.from('profiles').select('count').limit(1);
  
  if (error) {
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('❌ Las tablas no existen en Supabase');
      console.log('   Ejecuta la migración SQL: database/migrations/001_supabase_schema.sql');
    } else {
      console.log(`❌ Error al conectar: ${error.message}`);
    }
    process.exit(1);
  }
  
  console.log('✅ Conexión exitosa a Supabase');
  
  // Verificar tablas principales usando service_role (bypass RLS)
  console.log('\n📊 Verificando tablas (usando service_role key)...');
  const tables = ['profiles', 'subjects', 'groups', 'group_students', 'portfolios', 
                  'evaluation_templates', 'evaluation_criteria', 
                  'portfolio_evaluations', 'evaluation_scores'];
  
  for (const table of tables) {
    try {
      // Usar service_role para verificar existencia (bypass RLS)
      const { error: tableError } = await supabaseAdmin.from(table).select('*').limit(1);
      if (tableError) {
        if (tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
          console.log(`❌ Tabla '${table}' NO existe`);
        } else {
          console.log(`⚠️  Tabla '${table}' existe pero hay error: ${tableError.message}`);
        }
      } else {
        console.log(`✅ Tabla '${table}' existe`);
      }
    } catch (err) {
      console.log(`❌ Error al verificar tabla '${table}': ${err.message}`);
    }
  }
  
  // Verificar acceso desde anon key (simula acceso desde frontend)
  console.log('\n🔐 Verificando acceso con anon key (simula frontend)...');
  const criticalTables = ['profiles', 'subjects', 'groups', 'portfolios'];
  for (const table of criticalTables) {
    try {
      const { error: anonError } = await supabaseAnon.from(table).select('*').limit(1);
      if (anonError) {
        if (anonError.message.includes('permission denied') || anonError.message.includes('new row violates row-level security')) {
          console.log(`⚠️  Tabla '${table}': Existe pero RLS bloquea acceso (normal si no hay sesión)`);
        } else if (anonError.message.includes('relation') && anonError.message.includes('does not exist')) {
          console.log(`❌ Tabla '${table}': NO existe`);
        } else {
          console.log(`⚠️  Tabla '${table}': ${anonError.message}`);
        }
      } else {
        console.log(`✅ Tabla '${table}': Accesible con anon key`);
      }
    } catch (err) {
      console.log(`⚠️  Error verificando acceso anon a '${table}': ${err.message}`);
    }
  }
  
  // Verificar Storage
  console.log('\n📦 Verificando Storage...');
  const { data: buckets, error: storageError } = await supabaseAdmin.storage.listBuckets();
  
  if (storageError) {
    console.log(`❌ Error al verificar Storage: ${storageError.message}`);
  } else {
    const portfolioBucket = buckets?.find(b => b.name === 'portfolio-files');
    if (portfolioBucket) {
      console.log('✅ Bucket "portfolio-files" existe');
    } else {
      console.log('❌ Bucket "portfolio-files" NO existe');
      console.log('   Créalo desde Supabase Studio → Storage');
    }
  }
  
  console.log('\n✅ Verificación completada exitosamente!');
  console.log('   Tu configuración está lista para usar.');
  
} catch (error) {
  console.log(`\n❌ Error inesperado: ${error.message}`);
  console.log('   Verifica que Supabase esté funcionando y que las URLs sean correctas.');
  process.exit(1);
}


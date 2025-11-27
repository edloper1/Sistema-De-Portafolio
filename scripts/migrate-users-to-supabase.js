#!/usr/bin/env node

/**
 * Script para migrar usuarios existentes a Supabase Auth
 * 
 * Este script:
 * 1. Lee usuarios de la base de datos PostgreSQL antigua
 * 2. Los migra a Supabase Auth usando la API Admin
 * 3. Crea los perfiles correspondientes en public.profiles
 * 
 * Uso: node scripts/migrate-users-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno');
  console.error('   Para migración local, usa la service_role_key de Supabase');
  process.exit(1);
}

// Cliente de Supabase con permisos de administrador
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Configuración de PostgreSQL antigua (opcional, solo si migras desde otra BD)
const oldDbConfig = {
  host: process.env.OLD_DB_HOST || 'localhost',
  port: process.env.OLD_DB_PORT || 54322,
  database: process.env.OLD_DB_NAME || 'postgres',
  user: process.env.OLD_DB_USER || 'postgres',
  password: process.env.OLD_DB_PASSWORD || 'postgres',
};

const oldDbPool = new Pool(oldDbConfig);

// Usuarios de prueba a migrar (si no hay base de datos antigua)
const defaultUsers = [
  {
    email: 'juan.garcia@escuela.edu',
    password: 'password1',
    name: 'Prof. Juan García',
    role: 'teacher',
    teacher_id: 'T001',
  },
  {
    email: 'maria.lopez@estudiante.edu',
    password: 'password1',
    name: 'María López',
    role: 'student',
    student_id: 'A001',
  },
  {
    email: 'ana.martinez@escuela.edu',
    password: 'password1',
    name: 'Prof. Ana Martínez',
    role: 'teacher',
    teacher_id: 'T002',
  },
  {
    email: 'carlos.rodriguez@estudiante.edu',
    password: 'password1',
    name: 'Carlos Rodríguez',
    role: 'student',
    student_id: 'A002',
  },
];

/**
 * Obtener usuarios de la base de datos antigua
 */
async function getUsersFromOldDatabase() {
  try {
    const result = await oldDbPool.query(`
      SELECT 
        u.id,
        u.email,
        u.encrypted_password as password,
        p.name,
        p.role,
        p.student_id,
        p.teacher_id
      FROM auth.users u
      JOIN public.profiles p ON p.id = u.id
      ORDER BY u.created_at
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      email: row.email,
      password: row.password || 'password1',
      name: row.name,
      role: row.role,
      student_id: row.student_id,
      teacher_id: row.teacher_id,
    }));
  } catch (error) {
    console.log('⚠️  No se pudo conectar a la base de datos antigua, usando usuarios por defecto');
    console.log('   Error:', error.message);
    return null;
  }
}

/**
 * Migrar un usuario a Supabase Auth
 */
async function migrateUser(user) {
  try {
    // Verificar si el usuario ya existe usando listUsers
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    let existingUser = null;
    if (!listError && usersList?.users) {
      existingUser = usersList.users.find(u => u.email?.toLowerCase() === user.email.toLowerCase());
    }
    
    if (existingUser) {
      console.log(`  ⏭️  Usuario ${user.email} ya existe, actualizando perfil...`);
      
      // Verificar si el perfil existe
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', existingUser.id)
        .single();
      
      if (existingProfile) {
        // Actualizar perfil existente
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            name: user.name,
            email: user.email,
            role: user.role,
            student_id: user.student_id || null,
            teacher_id: user.teacher_id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingUser.id);

        if (profileError) {
          console.error(`  ❌ Error al actualizar perfil: ${profileError.message}`);
          return false;
        }
      } else {
        // Crear perfil si no existe
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: existingUser.id,
            name: user.name,
            email: user.email,
            role: user.role,
            student_id: user.student_id || null,
            teacher_id: user.teacher_id || null,
          });

        if (profileError) {
          console.error(`  ❌ Error al crear perfil: ${profileError.message}`);
          return false;
        }
      }

      console.log(`  ✅ Perfil actualizado/creado para ${user.email}`);
      return true;
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Confirmar email automáticamente
    });

    if (authError) {
      // Si el error es que el usuario ya existe, intentar actualizar
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        console.log(`  ⏭️  Usuario ${user.email} ya existe en Auth, creando/actualizando perfil...`);
        // Obtener el usuario existente
        const { data: usersList2 } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser2 = usersList2?.users?.find(u => u.email?.toLowerCase() === user.email.toLowerCase());
        
        if (existingUser2) {
          // Crear o actualizar perfil
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: existingUser2.id,
              name: user.name,
              email: user.email,
              role: user.role,
              student_id: user.student_id || null,
              teacher_id: user.teacher_id || null,
            }, {
              onConflict: 'id',
            });

          if (profileError) {
            console.error(`  ❌ Error al crear/actualizar perfil: ${profileError.message}`);
            return false;
          }

          console.log(`  ✅ Perfil creado/actualizado para ${user.email}`);
          return true;
        }
      }
      
      console.error(`  ❌ Error al crear usuario en Auth: ${authError.message}`);
      return false;
    }

    const userId = authData.user.id;
    console.log(`  ✅ Usuario creado en Auth: ${user.email} (${userId})`);

    // Crear perfil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        student_id: user.student_id || null,
        teacher_id: user.teacher_id || null,
      });

    if (profileError) {
      console.error(`  ❌ Error al crear perfil: ${profileError.message}`);
      // Intentar eliminar el usuario de auth si falló el perfil
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (deleteError) {
        console.error(`  ⚠️  No se pudo eliminar usuario de Auth: ${deleteError.message}`);
      }
      return false;
    }

    console.log(`  ✅ Perfil creado para ${user.email}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error inesperado: ${error.message}`);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando migración de usuarios a Supabase Auth...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

  // Obtener usuarios
  let users = await getUsersFromOldDatabase();
  
  if (!users || users.length === 0) {
    console.log('📝 No se encontraron usuarios en la BD antigua, usando usuarios por defecto...\n');
    users = defaultUsers;
  } else {
    console.log(`📋 Se encontraron ${users.length} usuarios en la base de datos antigua\n`);
  }

  console.log(`📊 Migrando ${users.length} usuarios...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    console.log(`🔄 Migrando: ${user.email} (${user.role})`);
    const success = await migrateUser(user);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    console.log(''); // Línea en blanco
  }

  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 Resumen de migración:');
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Fallidos: ${errorCount}`);
  console.log(`   📝 Total: ${users.length}`);
  console.log('='.repeat(50) + '\n');

  // Cerrar conexión a la BD antigua
  if (oldDbPool) {
    await oldDbPool.end();
  }

  if (errorCount === 0) {
    console.log('✅ Migración completada exitosamente!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Migración completada con algunos errores. Revisa los logs arriba.\n');
    process.exit(1);
  }
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});


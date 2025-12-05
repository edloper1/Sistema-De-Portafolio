import { apiClient } from '../api/client';
import type { Subject, Group } from '../../types';

/**
 * Servicio para gestión de materias y grupos
 * Ahora usa la API REST
 */
export class SubjectService {
  /**
   * Obtener todas las materias de un maestro
   */
  static async getSubjectsByTeacher(teacherId: string): Promise<Subject[]> {
    try {
      const result = await apiClient.getSubjectsByTeacher(teacherId);

      if (!result.success || !result.data?.subjects) {
        return [];
      }

      return result.data.subjects;
    } catch (error) {
      console.error('Error al obtener materias:', error);
      return [];
    }
  }

  /**
   * Obtener todas las materias de un estudiante (basándose en los grupos a los que pertenece)
   */
  static async getSubjectsByStudent(studentId: string): Promise<Subject[]> {
    try {
      const result = await apiClient.getSubjectsByStudent(studentId);

      if (!result.success || !result.data?.subjects) {
        return [];
      }

      return result.data.subjects;
    } catch (error) {
      console.error('Error al obtener materias del estudiante:', error);
      return [];
    }
  }

  /**
   * Crear nueva materia
   */
  static async createSubject(
    subject: Omit<Subject, 'id' | 'createdAt' | 'groups'>
  ): Promise<{ success: boolean; subject?: Subject; message: string }> {
    try {
      const result = await apiClient.createSubject({
        name: subject.name,
        code: subject.code,
        semester: subject.semester,
        career: subject.career,
        teacherId: subject.teacherId,
        schoolYear: subject.schoolYear,
      });

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Error al crear materia',
        };
      }

      if (!result.data?.subject) {
        return {
          success: false,
          message: 'No se recibió la materia creada',
        };
      }

      return {
        success: true,
        subject: result.data.subject,
        message: 'Materia creada correctamente',
      };
    } catch (error) {
      console.error('Error al crear materia:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear materia',
      };
    }
  }

  /**
   * Actualizar materia
   */
  static async updateSubject(
    id: string,
    updates: Partial<Omit<Subject, 'id' | 'createdAt' | 'groups' | 'teacherId'>>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await apiClient.updateSubject(id, updates);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Error al actualizar materia',
        };
      }

      return { success: true, message: 'Materia actualizada correctamente' };
    } catch (error) {
      console.error('Error al actualizar materia:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar materia',
      };
    }
  }

  /**
   * Eliminar materia
   */
  static async deleteSubject(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await apiClient.deleteSubject(id);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Error al eliminar materia',
        };
      }

      return { success: true, message: 'Materia eliminada correctamente' };
    } catch (error) {
      console.error('Error al eliminar materia:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al eliminar materia',
      };
    }
  }

  /**
   * Agregar grupo a una materia
   */
  static async addGroup(
    subjectId: string,
    group: Omit<Group, 'id' | 'students'>
  ): Promise<{ success: boolean; group?: Group; message: string }> {
    try {
      const result = await apiClient.addGroup(subjectId, {
        name: group.name,
        schedule: group.schedule,
      });

      if (!result.success || !result.data?.group) {
        return {
          success: false,
          message: result.message || 'Error al crear grupo',
        };
      }

      return {
        success: true,
        group: {
          id: result.data.group.id,
          name: result.data.group.name,
          schedule: result.data.group.schedule,
          students: [],
        },
        message: 'Grupo creado correctamente',
      };
    } catch (error) {
      console.error('Error al crear grupo:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear grupo',
      };
    }
  }

  /**
   * Eliminar grupo
   */
  static async deleteGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await apiClient.deleteGroup(groupId);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Error al eliminar grupo',
        };
      }

      return { success: true, message: 'Grupo eliminado correctamente' };
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al eliminar grupo',
      };
    }
  }
}

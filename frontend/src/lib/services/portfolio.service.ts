import { apiClient } from '../api/client';
import type { Portfolio, PortfolioEvaluation } from '../../types';

/**
 * Servicio para gestión de portafolios
 * Ahora usa la API REST
 */
export class PortfolioService {
  /**
   * Obtener todos los portafolios (para maestros)
   */
  static async getAllPortfolios(): Promise<Portfolio[]> {
    try {
      const result = await apiClient.getAllPortfolios();

      if (!result.success || !result.data?.portfolios) {
        return [];
      }

      return this.mapPortfolios(result.data.portfolios);
    } catch (error) {
      console.error('Error al obtener portafolios:', error);
      return [];
    }
  }

  /**
   * Obtener portafolios de un estudiante
   */
  static async getStudentPortfolios(studentId: string): Promise<Portfolio[]> {
    try {
      const result = await apiClient.getStudentPortfolios(studentId);

      if (!result.success || !result.data?.portfolios) {
        return [];
      }

      return this.mapPortfolios(result.data.portfolios);
    } catch (error) {
      console.error('Error al obtener portafolios del estudiante:', error);
      return [];
    }
  }

  /**
   * Obtener portafolios de las materias de un maestro
   */
  static async getTeacherPortfolios(_teacherId: string): Promise<Portfolio[]> {
    return this.getAllPortfolios();
  }

  /**
   * Obtener un portafolio por ID
   */
  static async getPortfolioById(id: string): Promise<Portfolio | null> {
    try {
      const portfolios = await this.getAllPortfolios();
      return portfolios.find((p) => p.id === id) || null;
    } catch (error) {
      console.error('Error al obtener portafolio:', error);
      return null;
    }
  }

  /**
   * Crear nuevo portafolio
   */
  static async createPortfolio(
    portfolio: Omit<Portfolio, 'id' | 'submittedAt' | 'status' | 'file' | 'fileUrl'>,
    file: File
  ): Promise<{ success: boolean; portfolio?: Portfolio; message: string }> {
    try {
      const result = await apiClient.createPortfolio(
        {
          studentId: portfolio.studentId,
          studentName: portfolio.studentName,
          subjectId: portfolio.subjectId,
          subject: portfolio.subject,
          groupId: portfolio.groupId,
          semester: portfolio.semester,
          career: portfolio.career,
          classSchedule: portfolio.classSchedule,
        },
        file
      );

      if (!result.success || !result.data?.portfolio) {
        return {
          success: false,
          message: result.message || 'Error al crear portafolio',
        };
      }

      const newPortfolio: Portfolio = {
        id: result.data.portfolio.id,
        studentId: result.data.portfolio.studentId,
        studentName: result.data.portfolio.studentName,
        subjectId: result.data.portfolio.subjectId,
        subject: result.data.portfolio.subject,
        groupId: result.data.portfolio.groupId,
        semester: result.data.portfolio.semester,
        career: result.data.portfolio.career,
        classSchedule: result.data.portfolio.classSchedule,
        fileName: result.data.portfolio.fileName,
        fileSize: result.data.portfolio.fileSize,
        fileUrl: result.data.portfolio.fileUrl,
        file: null,
        submittedAt: result.data.portfolio.submittedAt,
        status: result.data.portfolio.status,
        teacherComment: result.data.portfolio.teacherComment,
      };

      return {
        success: true,
        portfolio: newPortfolio,
        message: 'Portafolio creado correctamente',
      };
    } catch (error) {
      console.error('Error al crear portafolio:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear portafolio',
      };
    }
  }

  /**
   * Actualizar estado de un portafolio
   */
  static async updatePortfolioStatus(
    id: string,
    status: Portfolio['status'],
    comment?: string,
    evaluation?: PortfolioEvaluation
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await apiClient.updatePortfolioStatus(id, status, comment, evaluation);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Error al actualizar portafolio',
        };
      }

      return { success: true, message: 'Portafolio actualizado correctamente' };
    } catch (error) {
      console.error('Error al actualizar portafolio:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar portafolio',
      };
    }
  }

  /**
   * Actualizar portafolio
   */
  static async updatePortfolio(
    id: string,
    updates: Partial<Portfolio>
  ): Promise<{ success: boolean; message: string }> {
    // Por ahora, solo actualizar estado
    if (updates.status) {
      return this.updatePortfolioStatus(id, updates.status, updates.teacherComment, updates.evaluation);
    }

    return { success: false, message: 'Actualización no soportada' };
  }

  /**
   * Eliminar portafolio
   */
  static async deletePortfolio(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await apiClient.deletePortfolio(id);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Error al eliminar portafolio',
        };
      }

      return { success: true, message: 'Portafolio eliminado correctamente' };
    } catch (error) {
      console.error('Error al eliminar portafolio:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al eliminar portafolio',
      };
    }
  }

  /**
   * Obtener URL del archivo de un portafolio
   * Siempre usa la ruta del API que genera URLs firmadas (necesario para buckets privados)
   */
  static async getPortfolioFileUrl(portfolioId: string): Promise<string | null> {
    try {
      // Siempre usar la ruta del API que genera URLs firmadas
      // Esto es necesario porque el bucket es privado
      return apiClient.getFileUrl(portfolioId);
    } catch (error) {
      console.error('Error al obtener URL del archivo:', error);
      return null;
    }
  }

  /**
   * Mapear portafolios de la API a objetos Portfolio
   */
  private static mapPortfolios(portfolios: any[]): Portfolio[] {
    return portfolios.map((p) => ({
      id: p.id,
      studentId: p.studentId,
      studentName: p.studentName,
      subjectId: p.subjectId,
      subject: p.subject,
      groupId: p.groupId,
      semester: p.semester,
      career: p.career,
      classSchedule: p.classSchedule,
      fileName: p.fileName,
      fileSize: p.fileSize,
      fileUrl: p.fileUrl,
      file: null,
      submittedAt: p.submittedAt,
      status: p.status,
      teacherComment: p.teacherComment,
      evaluation: p.evaluation || undefined,
    }));
  }
}

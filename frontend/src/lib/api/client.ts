/**
 * Cliente API para comunicarse con el backend
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no es JSON:', text.substring(0, 200));
        return {
          success: false,
          message: 'El servidor respondió con un formato inesperado. ¿Está el servidor corriendo?',
          error: 'INVALID_RESPONSE',
        };
      }

      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError);
        return {
          success: false,
          message: 'Error al procesar la respuesta del servidor',
          error: 'JSON_PARSE_ERROR',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Error en la petición',
          error: data.error,
        };
      }

      // El backend retorna { success: true, user: {...} } directamente
      // Necesitamos normalizar la respuesta para que siempre tenga la estructura { success, data, ... }
      const normalized: any = { success: true };
      
      if (data.user) {
        normalized.data = { user: data.user };
        if (data.message) normalized.message = data.message;
      } else if (data.portfolios) {
        normalized.data = { portfolios: data.portfolios };
      } else if (data.subjects) {
        normalized.data = { subjects: data.subjects };
      } else if (data.students) {
        normalized.data = { students: data.students };
      } else if (data.group) {
        normalized.data = { group: data.group };
      } else if (data.subject) {
        normalized.data = { subject: data.subject };
      } else if (data.portfolio) {
        normalized.data = { portfolio: data.portfolio };
      } else {
        // Si no hay estructura conocida, pasar todo como data
        normalized.data = data;
      }

      return normalized;
    } catch (error) {
      console.error('Error en petición API:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión',
        error: 'NETWORK_ERROR',
      };
    }
  }

  // ============================================
  // AUTENTICACIÓN
  // ============================================

  async login(email: string, password: string, role: 'teacher' | 'student') {
    return this.request<{ user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  }

  async register(name: string, email: string, password: string, role: 'teacher' | 'student') {
    return this.request<{ user: any; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  async getUser(userId: string) {
    return this.request<{ user: any }>(`/api/auth/user/${userId}`);
  }

  async getAllStudents() {
    return this.request<{ students: any[] }>('/api/auth/students');
  }

  // ============================================
  // MATERIAS
  // ============================================

  async getSubjectsByTeacher(teacherId: string) {
    return this.request<{ subjects: any[] }>(`/api/subjects/teacher/${teacherId}`);
  }

  async getSubjectsByStudent(studentId: string) {
    return this.request<{ subjects: any[] }>(`/api/subjects/student/${studentId}`);
  }

  async createSubject(subject: any) {
    return this.request<{ subject: any }>('/api/subjects', {
      method: 'POST',
      body: JSON.stringify(subject),
    });
  }

  async updateSubject(id: string, updates: any) {
    return this.request('/api/subjects/' + id, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSubject(id: string) {
    return this.request('/api/subjects/' + id, {
      method: 'DELETE',
    });
  }

  async addGroup(subjectId: string, group: { name: string; schedule: string }) {
    return this.request<{ group: any }>(`/api/subjects/${subjectId}/groups`, {
      method: 'POST',
      body: JSON.stringify(group),
    });
  }

  async deleteGroup(groupId: string) {
    return this.request(`/api/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  async addStudentToGroup(groupId: string, studentId: string) {
    return this.request(`/api/groups/${groupId}/students`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  }

  async removeStudentFromGroup(groupId: string, studentId: string) {
    return this.request(`/api/groups/${groupId}/students/${studentId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // PORTAFOLIOS
  // ============================================

  async getAllPortfolios() {
    return this.request<{ portfolios: any[] }>('/api/portfolios');
  }

  async getStudentPortfolios(studentId: string) {
    return this.request<{ portfolios: any[] }>(`/api/portfolios/student/${studentId}`);
  }

  async createPortfolio(portfolioData: any, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(portfolioData).forEach((key) => {
      formData.append(key, portfolioData[key]);
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/portfolios`, {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no es JSON:', text.substring(0, 200));
        return {
          success: false,
          message: 'El servidor respondió con un formato inesperado',
        };
      }

      const data = await response.json();
      
      // Normalizar la respuesta: el backend retorna { success: true, portfolio: {...} }
      if (data.success && data.portfolio) {
        return { 
          success: true, 
          data: { portfolio: data.portfolio },
          message: data.message 
        };
      }
      
      return { success: response.ok, ...data };
    } catch (error) {
      console.error('Error al crear portafolio:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear portafolio',
      };
    }
  }

  async updatePortfolioStatus(id: string, status: string, comment?: string, evaluation?: any) {
    return this.request(`/api/portfolios/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment, evaluation }),
    });
  }

  async deletePortfolio(id: string) {
    return this.request(`/api/portfolios/${id}`, {
      method: 'DELETE',
    });
  }

  getFileUrl(portfolioId: string): string {
    return `${this.baseUrl}/api/files/${portfolioId}`;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);


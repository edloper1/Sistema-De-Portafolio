export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string; // Para alumnos
  teacherId?: string; // Para maestros
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: string;
  career: string;
  teacherId: string;
  schoolYear: string;
  groups: Group[];
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  schedule: string;
  students: string[]; // Array de IDs de estudiantes
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  score?: number;
}

export interface PortfolioEvaluation {
  criteria: EvaluationCriterion[];
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  criteria: Omit<EvaluationCriterion, 'score'>[];
  teacherId: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface Portfolio {
  id: string;
  studentId: string;
  studentName: string;
  semester: string;
  career: string;
  subject: string;
  subjectId: string;
  groupId: string;
  classSchedule: string;
  file: File | null;
  fileName: string;
  fileSize: number;
  fileUrl?: string; // URL del archivo para visualización
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  teacherComment?: string;
  evaluation?: PortfolioEvaluation;
}

export type SortOption = 'alphabetical' | 'date' | 'semester';

export interface FilterOptions {
  subject: string;
  semester: string;
  career: string;
  classSchedule: string;
  searchTerm: string;
}

export interface GroupStats {
  groupName: string;
  total: number;
  submitted: number;
  pending: number;
  percentage: number;
}

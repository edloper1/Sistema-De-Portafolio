import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Portfolio, FilterOptions, SortOption, PortfolioEvaluation } from '../types';
import { PortfolioService } from '../lib/services/portfolio.service';
import { useAuth } from './AuthContext';

interface PortfolioContextType {
  portfolios: Portfolio[];
  addPortfolio: (portfolio: Omit<Portfolio, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  updatePortfolioStatus: (id: string, status: Portfolio['status'], comment?: string, evaluation?: PortfolioEvaluation) => Promise<void>;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  getPortfolioFileUrl: (portfolioId: string) => Promise<string | null>;
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  getFilteredAndSortedPortfolios: () => Portfolio[];
  getStudentPortfolios: (studentId: string) => Portfolio[];
  getTeacherPortfolios: (teacherId: string) => Portfolio[];
  loading: boolean;
  refreshPortfolios: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolios = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolios must be used within a PortfolioProvider');
  }
  return context;
};

interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    subject: '',
    semester: '',
    career: '',
    classSchedule: '',
    searchTerm: '',
  });

  const [sortOption, setSortOption] = useState<SortOption>('date');

  // Cargar portafolios cuando el usuario cambia
  useEffect(() => {
    if (user) {
      loadPortfolios();
    } else {
      setPortfolios([]);
    }
  }, [user]);

  const loadPortfolios = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let loadedPortfolios: Portfolio[] = [];

      if (user.role === 'student' && user.id) {
        loadedPortfolios = await PortfolioService.getStudentPortfolios(user.id);
      } else if (user.role === 'teacher' && user.id) {
        loadedPortfolios = await PortfolioService.getTeacherPortfolios(user.id);
      } else {
        loadedPortfolios = await PortfolioService.getAllPortfolios();
      }

      setPortfolios(loadedPortfolios);
    } catch (error) {
      console.error('Error al cargar portafolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPortfolios = async () => {
    await loadPortfolios();
  };

  const addPortfolio = async (portfolio: Omit<Portfolio, 'id' | 'submittedAt' | 'status'>) => {
    if (!portfolio.file) {
      throw new Error('No se proporcionó archivo');
    }

    try {
      setLoading(true);
      const result = await PortfolioService.createPortfolio(portfolio, portfolio.file);

      if (result.success && result.portfolio) {
        setPortfolios((prev) => [result.portfolio!, ...prev]);
      } else {
        throw new Error(result.message || 'Error al crear portafolio');
      }
    } catch (error) {
      console.error('Error al agregar portafolio:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolioStatus = async (
    id: string,
    status: Portfolio['status'],
    comment?: string,
    evaluation?: PortfolioEvaluation
  ) => {
    try {
      setLoading(true);
      await PortfolioService.updatePortfolioStatus(id, status, comment, evaluation);
      
      setPortfolios((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status, teacherComment: comment, evaluation } : p))
      );
    } catch (error) {
      console.error('Error al actualizar estado del portafolio:', error);
      setPortfolios((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status, teacherComment: comment, evaluation } : p))
      );
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolio = async (id: string, updates: Partial<Portfolio>) => {
    try {
      setLoading(true);
      await PortfolioService.updatePortfolio(id, updates);
      
      setPortfolios((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    } catch (error) {
      console.error('Error al actualizar portafolio:', error);
      setPortfolios((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    } finally {
      setLoading(false);
    }
  };

  const deletePortfolio = async (id: string) => {
    try {
      setLoading(true);
      await PortfolioService.deletePortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar portafolio:', error);
      // Fallback
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const getPortfolioFileUrl = async (portfolioId: string): Promise<string | null> => {
    try {
      const url = await PortfolioService.getPortfolioFileUrl(portfolioId);
      return url;
    } catch (error) {
      console.error('Error al obtener URL del archivo:', error);
      return null;
    }
  };

  const getStudentPortfolios = (studentId: string) => {
    return portfolios.filter((p) => p.studentId === studentId);
  };

  const getTeacherPortfolios = (_teacherId: string) => {
    return portfolios;
  };

  const getFilteredAndSortedPortfolios = () => {
    let filtered = [...portfolios];

    // Aplicar filtros
    if (filterOptions.subject) {
      filtered = filtered.filter((p) =>
        p.subject.toLowerCase().includes(filterOptions.subject.toLowerCase())
      );
    }

    if (filterOptions.semester) {
      filtered = filtered.filter((p) => p.semester === filterOptions.semester);
    }

    if (filterOptions.career) {
      filtered = filtered.filter((p) =>
        p.career.toLowerCase().includes(filterOptions.career.toLowerCase())
      );
    }

    if (filterOptions.classSchedule) {
      filtered = filtered.filter((p) =>
        p.classSchedule.toLowerCase().includes(filterOptions.classSchedule.toLowerCase())
      );
    }

    if (filterOptions.searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.studentName.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
          p.subject.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
          p.career.toLowerCase().includes(filterOptions.searchTerm.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    switch (sortOption) {
      case 'alphabetical':
        filtered.sort((a, b) => a.studentName.localeCompare(b.studentName));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        break;
      case 'semester':
        filtered.sort((a, b) => a.semester.localeCompare(b.semester));
        break;
    }

    return filtered;
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolios,
        addPortfolio,
        updatePortfolioStatus,
        updatePortfolio,
        deletePortfolio,
        getPortfolioFileUrl,
        filterOptions,
        setFilterOptions,
        sortOption,
        setSortOption,
        getFilteredAndSortedPortfolios,
        getStudentPortfolios,
        getTeacherPortfolios,
        loading,
        refreshPortfolios,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

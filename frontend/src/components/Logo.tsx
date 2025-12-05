import { useState } from 'react';
import { FileText } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showText?: boolean;
  className?: string;
  variant?: 'default' | 'navbar';
}

// Configuraciones de tamaños para el logo
const SIZE_CONFIG = {
  image: {
    small: 'h-8',
    medium: 'h-11 md:h-13',
    large: 'h-20',
    xlarge: 'h-36 md:h-48 w-auto max-w-full',
  },
  icon: {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-10 w-10',
    xlarge: 'h-20 w-20 md:h-24 md:w-24',
  },
  container: {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20',
    xlarge: 'w-36 h-36 md:w-48 md:h-48',
  },
  navbar: {
    small: 'w-8 h-8 p-1.5',
    medium: 'h-14 md:h-18 p-1.5 md:p-2',
    large: 'w-12 h-12 p-2.5',
    xlarge: 'h-14 md:h-18 p-1.5 md:p-2',
  },
} as const;

export const Logo = ({ 
  size = 'medium', 
  showText = false,
  className = '',
  variant = 'default'
}: LogoProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => setImageError(true);

  // Renderizar logo para Navbar
  if (variant === 'navbar') {
    return (
      <div className={`flex items-center ${className}`}>
        {!imageError ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-0.5 md:p-1 shadow-lg hover:bg-white transition-all group-hover:scale-105 flex items-center justify-center h-14 md:h-18">
            <img 
              src="/logo/logo.png" 
              alt="Logo del Sistema"
              className="h-full w-auto object-contain"
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className={`${SIZE_CONFIG.navbar[size]} bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg group-hover:bg-white group-hover:scale-105 transition-all`}>
            <FileText className={`${SIZE_CONFIG.icon[size]} text-blue-600`} />
          </div>
        )}
      </div>
    );
  }

  // Renderizar logo para Login y otros lugares
  const isXLarge = size === 'xlarge';
  const textSizeClass = isXLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl';
  const marginBottom = isXLarge ? 'mb-1' : '';

  return (
    <div className={`flex flex-col items-center ${isXLarge ? 'space-y-0' : 'space-x-3'} ${className}`}>
      {!imageError ? (
        <img 
          src="/logo/logo.png" 
          alt="Logo del Sistema"
          className={`${SIZE_CONFIG.image[size]} w-auto object-contain ${marginBottom}`}
          onError={handleImageError}
        />
      ) : (
        <div className={`${SIZE_CONFIG.container[size]} rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg ${marginBottom}`}>
          <FileText className={`${SIZE_CONFIG.icon[size]} text-white`} />
        </div>
      )}
      {showText && (
        <span className={`${textSizeClass} font-bold`}>Sistema de Portafolios</span>
      )}
    </div>
  );
};

